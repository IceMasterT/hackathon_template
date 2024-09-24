#!/bin/bash

# Use a specific Rust toolchain
rustup default stable
rustup update stable
rustup target add x86_64-unknown-linux-musl

set -e

decrypt_secret() {
    local value="$1"
    local key="$2"
    if [[ $value == AQI* ]]; then
        echo "Attempting to decrypt $key" >&2
        decrypted=$(aws kms decrypt --key-id "$KMS_KEY_ID" --ciphertext-blob fileb://<(echo "$value" | base64 -d) --output text --query Plaintext | base64 --decode)
        if [ $? -eq 0 ]; then
            echo "Successfully decrypted $key" >&2
            echo "$decrypted"
        else
            echo "Failed to decrypt $key. AWS KMS Error: $decrypted" >&2
            return 1
        fi
    else
        echo "Using unencrypted value for $key" >&2
        echo "$value"
    fi
}

if [ -n "$ENCRYPTED_LAMBDA_FUNCTION_NAME" ]; then
    LAMBDA_FUNCTION_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_NAME" "LAMBDA_FUNCTION_NAME")
    echo "Debug: LAMBDA_FUNCTION_NAME after decryption: $LAMBDA_FUNCTION_NAME"
else
    echo "Debug: Using unencrypted LAMBDA_FUNCTION_NAME: $LAMBDA_FUNCTION_NAME"
fi

# New function to wait for function update status
wait_for_function_update_status() {
    echo "Checking Lambda function update status..."
    while true; do
        status=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.LastUpdateStatus' --output text)
        if [ "$status" = "Successful" ]; then
            echo "Lambda function is ready for updates."
            break
        elif [ "$status" = "Failed" ]; then
            echo "Previous update failed. Please check the Lambda function status."
            exit 1
        else
            echo "Lambda function is still updating. Waiting..."
            sleep 10
        fi
    done
}

# New function to update function configuration with retries
update_function_configuration() {
    local max_attempts=5
    local attempt=1
    local delay=10

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt to update Lambda function configuration..."
        if aws lambda update-function-configuration \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --runtime "$LAMBDA_RUNTIME" \
            --handler "$LAMBDA_HANDLER" \
            --role "$LAMBDA_ROLE_ARN"; then
            echo "Lambda function configuration updated successfully."
            return 0
        else
            echo "Update failed. Retrying in $delay seconds..."
            sleep $delay
            attempt=$((attempt + 1))
            delay=$((delay * 2))
        fi
    done

    echo "Failed to update Lambda function configuration after $max_attempts attempts."
    return 1
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found in the current directory."
    echo "Please ensure that the .env file is present in the same directory as this script."
    exit 1
fi

# Load environment variables
source .env

echo "Debug: Environment variables after sourcing .env"
echo "AWS_REGION: $AWS_REGION"
echo "S3_BUCKET: $S3_BUCKET"
echo "LAMBDA_FUNCTION_NAME: $LAMBDA_FUNCTION_NAME"
echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "KMS_KEY_ID: $KMS_KEY_ID"

missing_vars=()
[ -z "$S3_BUCKET" ] && missing_vars+=("S3_BUCKET")
[ -z "$LAMBDA_FUNCTION_NAME" ] && [ -z "$ENCRYPTED_LAMBDA_FUNCTION_NAME" ] && missing_vars+=("LAMBDA_FUNCTION_NAME or ENCRYPTED_LAMBDA_FUNCTION_NAME")
[ -z "$AWS_ACCOUNT_ID" ] && missing_vars+=("AWS_ACCOUNT_ID")
[ -z "$KMS_KEY_ID" ] && missing_vars+=("KMS_KEY_ID")

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "Error: The following required environment variables are not set:"
    for var in "${missing_vars[@]}"; do
        echo "- $var"
    done
    echo "Please ensure these variables are properly set in your .env file."
    exit 1
fi

LAMBDA_ROLE_ARN=$(decrypt_secret "${ENCRYPTED_LAMBDA_ROLE_NAME}" "LAMBDA_ROLE_ARN")
LAMBDA_FUNCTION_NAME=$(decrypt_secret "${ENCRYPTED_LAMBDA_FUNCTION_NAME:-$LAMBDA_FUNCTION_NAME}" "LAMBDA_FUNCTION_NAME")
LAMBDA_FUNCTION_ARN="arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:${LAMBDA_FUNCTION_NAME}"
API_GATEWAY_ID=$(decrypt_secret "${ENCRYPTED_API_GATEWAY_ID:-$API_GATEWAY_ID}" "API_GATEWAY_ID")
CLOUDFRONT_DISTRIBUTION_ID=$(decrypt_secret "${ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID:-$CLOUDFRONT_DISTRIBUTION_ID}" "CLOUDFRONT_DISTRIBUTION_ID")
LAMBDA_FUNCTION_ARN=$(decrypt_secret "${ENCRYPTED_LAMBDA_FUNCTION_ARN:-$LAMBDA_FUNCTION_ARN}" "LAMBDA_FUNCTION_ARN")

echo "Debug: Decrypted values:"
echo "LAMBDA_FUNCTION_NAME: $LAMBDA_FUNCTION_NAME"
echo "LAMBDA_ROLE_ARN: $LAMBDA_ROLE_ARN"
echo "API_GATEWAY_ID: $API_GATEWAY_ID"
echo "CLOUDFRONT_DISTRIBUTION_ID: $CLOUDFRONT_DISTRIBUTION_ID"
echo "LAMBDA_FUNCTION_ARN: $LAMBDA_FUNCTION_ARN"

# AWS deployment configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="${S3_BUCKET}"
LAMBDA_RUNTIME="${LAMBDA_RUNTIME:-provided.al2}"
LAMBDA_HANDLER="${LAMBDA_HANDLER:-bootstrap}"

LAMBDA_ROLE_ARN=$(decrypt_secret "${ENCRYPTED_LAMBDA_ROLE_NAME}" "LAMBDA_ROLE_ARN")
echo "Debug: Decrypted LAMBDA_ROLE_ARN: $LAMBDA_ROLE_ARN"

if [ -z "$LAMBDA_ROLE_ARN" ]; then
    echo "Error: LAMBDA_ROLE_ARN is empty after decryption. Please check your ENCRYPTED_LAMBDA_ROLE_NAME value."
    exit 1
fi

if [ -z "$S3_BUCKET" ] || [ -z "$LAMBDA_FUNCTION_NAME" ] || [ -z "$LAMBDA_ROLE_ARN" ] || [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Error: One or more required environment variables are not set."
    echo "Please ensure S3_BUCKET, LAMBDA_FUNCTION_NAME, LAMBDA_ROLE_ARN, and AWS_ACCOUNT_ID are properly set."
    exit 1
fi

# Build and package Lambda function
echo "Building and packaging Lambda function..."
cd flexnet-gx-lambda
cargo build --release --target x86_64-unknown-linux-musl
zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap

# Generate S3 key
S3_KEY="lambda-packages/flexnet-gx-lambda-$(date +%Y%m%d%H%M%S).zip"
echo "Uploading Lambda package to S3..."
aws s3 cp rust.zip "s3://$S3_BUCKET/$S3_KEY"

# Wait for any ongoing updates to complete
wait_for_function_update_status

echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --s3-bucket "$S3_BUCKET" \
    --s3-key "$S3_KEY"

echo "Waiting for code update to complete..."
sleep 30

# Update function configuration with retries
update_function_configuration

# Verify the update
echo "Verifying Lambda function update..."
aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME"

echo "Debug information:"
echo "LAMBDA_FUNCTION_NAME: $LAMBDA_FUNCTION_NAME"
echo "LAMBDA_FUNCTION_ARN: $LAMBDA_FUNCTION_ARN"
echo "LAMBDA_RUNTIME: $LAMBDA_RUNTIME"
echo "LAMBDA_HANDLER: $LAMBDA_HANDLER"
echo "LAMBDA_ROLE_ARN: $LAMBDA_ROLE_ARN"
echo "Debug: LAMBDA_FUNCTION being used: $LAMBDA_FUNCTION_NAME"
echo "Debug: KMS_KEY_ID: $KMS_KEY_ID"
echo "Debug: ENCRYPTED_LAMBDA_ROLE_NAME from .env: $ENCRYPTED_LAMBDA_ROLE_NAME"
echo "Debug: Decrypted LAMBDA_ROLE_ARN: $LAMBDA_ROLE_ARN"


echo "Lambda function updated successfully."
echo "Your Specific s3 Key has been generated in put in the s3 bucket. If you want to use it specify it in the .env file"
cd ..