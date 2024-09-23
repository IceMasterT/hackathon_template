#!/bin/bash

set -e

source .env

# Lambda func configurations (edit for your own)
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-flexnet-gx-lambda}"
LAMBDA_FUNCTION_ARN="${LAMBDA_FUNCTION_ARN:-arn:aws:lambda:us-east-1:339712792986:function:flexnet-gx-lambda}"
LAMBDA_RUNTIME="${LAMBDA_RUNTIME:-provided.al2}"
LAMBDA_HANDLER="${LAMBDA_HANDLER:-bootstrap}"
LAMBDA_ROLE_NAME="${LAMBDA_ROLE_NAME:-flexnet-gx-lambda-role-jk2rfgx9}"
LAMBDA_ROLE_ARN="${LAMBDA_ROLE_ARN:-arn:aws:iam::339712792986:role/$LAMBDA_ROLE_NAME}"

# Build and deploy Lambda function
echo "Building and packaging Lambda function..."
cd flexnet-gx-lambda
cargo build --release --target x86_64-unknown-linux-musl
zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap

echo "Updating Lambda function configuration..."
aws lambda update-function-configuration \
    --function-name $LAMBDA_FUNCTION_ARN \
    --runtime $LAMBDA_RUNTIME \
    --handler $LAMBDA_HANDLER \
    --role $LAMBDA_ROLE_ARN

echo "Deploying Lambda function code..."
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_ARN \
    --zip-file fileb://rust.zip

# Verify the update
echo "Verifying Lambda function update..."
aws lambda get-function --function-name $LAMBDA_FUNCTION_ARN

echo "Lambda function updated successfully."
cd ..