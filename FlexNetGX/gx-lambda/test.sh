#!/bin/bash

set -e

# Load environment variables
source ../../.env

# Function to decrypt secret using KMS
decrypt_secret() {
    aws kms decrypt --key-id $KMS_KEY_ID --ciphertext-blob fileb://<(echo "$1" | base64 -d) --output text --query Plaintext | base64 --decode
}

# Decrypt secrets
LAMBDA_FUNCTION_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_NAME")

# Build the Lambda function
cargo build --release --target x86_64-unknown-linux-musl

# Create a test event
echo '{"data": "test data"}' > test_event.json

# Invoke the Lambda function
aws lambda invoke --function-name $LAMBDA_FUNCTION_NAME --payload file://test_event.json output.json

# Display the result
cat output.json

# Clean up
rm test_event.json output.json