#!/bin/bash

set -e

# Set the path to AWS CLI
AWS_CLI="aws"

# KMS key ID
KMS_KEY_ID="4355f5e5-194c-451b-8303-e81dddd8a341"

# Function to encrypt a value
encrypt_value() {
    local value="$1"
    local key="$2"
    echo "Encrypting $key..." >&2
    encrypted_value=$($AWS_CLI kms encrypt --key-id $KMS_KEY_ID --plaintext fileb://<(echo -n "$value") --output text --query CiphertextBlob)
    if [ $? -eq 0 ]; then
        echo "Successfully encrypted $key" >&2
        echo "$encrypted_value"
    else
        echo "Failed to encrypt $key" >&2
        return 1
    fi
}

# Read the current .env
ENV_FILE=".env"
ENCRYPTED_ENV_FILE=".env.encrypted"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Clear the existing encrypted file if it exists
> "$ENCRYPTED_ENV_FILE"

# Process each line in the .env
while IFS= read -r line
do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" == \#* ]]; then
        echo "$line" >> "$ENCRYPTED_ENV_FILE"
        continue
    fi

    # Split the line into key and value
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2-)

    # Check if the key should be encrypted
    case $key in
        LAMBDA_FUNCTION_NAME|API_GATEWAY_ID|CLOUDFRONT_DISTRIBUTION_ID|LAMBDA_FUNCTION_ARN|LAMBDA_ROLE_NAME|LAMBDA_ROLE_ARN)
            encrypted_value=$(encrypt_value "$value" "$key")
            if [ $? -eq 0 ]; then
                echo "ENCRYPTED_$key=$encrypted_value" >> "$ENCRYPTED_ENV_FILE"
                echo "Original $key preserved: $key=$value" >> "$ENCRYPTED_ENV_FILE"
            else
                echo "Error encrypting $key, keeping original value"
                echo "$line" >> "$ENCRYPTED_ENV_FILE"
            fi
            ;;
        *)
            echo "$line" >> "$ENCRYPTED_ENV_FILE"
            ;;
    esac
done < "$ENV_FILE"

# Add KMS_KEY_ID to the .env.encrypted
echo "KMS_KEY_ID=$KMS_KEY_ID" >> "$ENCRYPTED_ENV_FILE"

echo "Encryption complete. Created $ENCRYPTED_ENV_FILE with encrypted values."
echo "Here are the encrypted values:"
grep "^ENCRYPTED_" "$ENCRYPTED_ENV_FILE"

echo "Congratulations!! You are a BarnAss!!"