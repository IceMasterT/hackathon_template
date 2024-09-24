#!/bin/bash

set -e

# Use a specific Rust toolchain
rustup default stable
rustup update stable
rustup target add x86_64-unknown-linux-musl

# Function to decrypt secret using KMS
decrypt_secret() {
    local encrypted_value="$1"
    if [ -z "$encrypted_value" ]; then
        echo ""
    else
        aws kms decrypt --ciphertext-blob fileb://<(echo "$encrypted_value" | base64 -d) --output text --query Plaintext | base64 --decode
    fi
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found in the current directory."
    echo "Please ensure that the .env file is present in the same directory as this script."
    exit 1
fi

# Load environment variables
source .env

# Decrypt encrypted values
LAMBDA_FUNCTION_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_NAME")
API_GATEWAY_ID=$(decrypt_secret "$ENCRYPTED_API_GATEWAY_ID")
CLOUDFRONT_DISTRIBUTION_ID=$(decrypt_secret "$ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID")
LAMBDA_FUNCTION_ARN=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_ARN")
LAMBDA_ROLE_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_ROLE_NAME")
LAMBDA_ROLE_ARN=$(decrypt_secret "$ENCRYPTED_LAMBDA_ROLE_ARN")

# AWS deployment configuration
AWS_REGION="${AWS_REGION:-us-east-1}"  # Default to us-east-1 if not set
S3_BUCKET="${S3_BUCKET}"
LAMBDA_RUNTIME="${LAMBDA_RUNTIME}"
LAMBDA_HANDLER="${LAMBDA_HANDLER}"

# Check if required variables are set
if [ -z "$LAMBDA_FUNCTION_ARN" ]; then
    echo "Error: LAMBDA_FUNCTION_ARN is not set. Please ensure it's properly set in the .env file."
    exit 1
fi

# Build and package Lambda function
echo "Building and packaging Lambda function..."
cd flexnet-gx-lambda
cargo build --release --target x86_64-unknown-linux-musl
zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap


# Prepare update-function-configuration command
UPDATE_CONFIG_CMD="aws lambda update-function-configuration --function-name $LAMBDA_FUNCTION_NAME"
if [ ! -z "$LAMBDA_RUNTIME" ]; then
    UPDATE_CONFIG_CMD+=" --runtime $LAMBDA_RUNTIME"
fi
if [ ! -z "$LAMBDA_HANDLER" ]; then
    UPDATE_CONFIG_CMD+=" --handler $LAMBDA_HANDLER"
fi
if [ ! -z "$LAMBDA_ROLE_ARN" ]; then
    UPDATE_CONFIG_CMD+=" --role $LAMBDA_ROLE_ARN"
fi

echo "Updating Lambda function configuration..."
eval $UPDATE_CONFIG_CMD

echo "Deploying Lambda function code..."
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://rust.zip

# Verify the update
echo "Verifying Lambda function update..."
aws lambda get-function --function-name $LAMBDA_FUNCTION_ARN

echo "Lambda function updated successfully."
echo "You have successfully created a zip file application. Find it in flexnet-gx-lambda"
cd ..