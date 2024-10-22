#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Load environment variables
if [ ! -f "../.env" ]; then
    echo -e "${RED}Error: .env file not found in parent directory${NC}"
    exit 1
fi
source ../.env

# Function to decrypt AWS secrets
decrypt_secret() {
    local encrypted_value="$1"
    if [ -z "$encrypted_value" ]; then
        echo ""
    else
        aws kms decrypt --ciphertext-blob fileb://<(echo "$encrypted_value" | base64 -d) \
            --output text --query Plaintext | base64 --decode
    fi
}

# Decrypt AWS encrypted values
LAMBDA_FUNCTION_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_NAME")
API_GATEWAY_ID=$(decrypt_secret "$ENCRYPTED_API_GATEWAY_ID")
CLOUDFRONT_DISTRIBUTION_ID=$(decrypt_secret "$ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID")
LAMBDA_FUNCTION_ARN=$(decrypt_secret "$ENCRYPTED_LAMBDA_FUNCTION_ARN")
LAMBDA_ROLE_NAME=$(decrypt_secret "$ENCRYPTED_LAMBDA_ROLE_NAME")
LAMBDA_ROLE_ARN=$(decrypt_secret "$ENCRYPTED_LAMBDA_ROLE_ARN")

# Near Protocol deployment settings
NEAR_ENV="testnet"
NEAR_NODE_URL="https://rpc.testnet.near.org"

# Function to deploy Near Protocol contract
deploy_near_contract() {
    echo -e "${BLUE}Deploying Near Protocol contract...${NC}"
    cd ../flexnet-gx-blockchain

    # Build the contract
    cargo build --target wasm32-unknown-unknown --release
    
    # Check if we're already logged in to Near
    if ! near state "$NEAR_ACCOUNT_ID" &>/dev/null; then
        echo -e "${RED}Please login to Near first using 'near login'${NC}"
        exit 1
    }

    # Deploy the contract
    near deploy --accountId "$NEAR_ACCOUNT_ID" \
                --wasmFile target/wasm32-unknown-unknown/release/flexnet_gx_blockchain.wasm \
                --initFunction 'new' \
                --initArgs '{}'

    echo -e "${GREEN}Near contract deployed successfully${NC}"
    cd ../scripts
}

# Function to deploy AWS Lambda
deploy_lambda() {
    echo -e "${BLUE}Deploying AWS Lambda function...${NC}"
    cd ../flexnet-gx-lambda
    
    # Build Lambda function
    cargo build --release --target x86_64-unknown-linux-musl
    zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap

    # Update Lambda function
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb://rust.zip

    # Update Lambda configuration
    aws lambda update-function-configuration \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime provided.al2 \
        --handler bootstrap \
        --role "$LAMBDA_ROLE_ARN"

    echo -e "${GREEN}Lambda function deployed successfully${NC}"
    cd ../scripts
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}Deploying frontend...${NC}"
    cd ../flexnet-gx-web

    # Build web assembly
    wasm-pack build --target web

    # Deploy to S3
    if [ ! -z "$S3_BUCKET" ]; then
        echo -e "${BLUE}Syncing with S3...${NC}"
        aws s3 sync ./pkg s3://$S3_BUCKET/web --delete
        
        # Invalidate CloudFront cache if distribution ID exists
        if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
            echo -e "${BLUE}Invalidating CloudFront cache...${NC}"
            aws cloudfront create-invalidation \
                --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
                --paths "/*"
        fi
    fi

    echo -e "${GREEN}Frontend deployed successfully${NC}"
    cd ../scripts
}

# Function to verify deployments
verify_deployments() {
    echo -e "${BLUE}Verifying deployments...${NC}"

    # Verify Near Contract
    echo "Near Contract Status:"
    near state "$NEAR_CONTRACT_NAME"

    # Verify Lambda Function
    echo "Lambda Function Status:"
    aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME"

    # Verify API Gateway
    echo "API Gateway Status:"
    aws apigateway get-stage --rest-api-id "$API_GATEWAY_ID" --stage-name "prod"

    # Verify CloudFront
    if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        echo "CloudFront Distribution Status:"
        aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID"
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"

    # Build and deploy Near Protocol contract
    deploy_near_contract

    # Build and deploy Lambda function
    deploy_lambda

    # Build and deploy frontend
    deploy_frontend

    # Verify all deployments
    verify_deployments

    echo -e "${GREEN}All deployments completed successfully!${NC}"
    
    # Print deployment information
    echo -e "\n${BLUE}Deployment Summary:${NC}"
    echo -e "Near Contract: $NEAR_CONTRACT_NAME"
    echo -e "Near Network: $NEAR_ENV"
    echo -e "Lambda Function: $LAMBDA_FUNCTION_NAME"
    echo -e "API Gateway ID: $API_GATEWAY_ID"
    echo -e "S3 Bucket: $S3_BUCKET"
    echo -e "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
}

# Run main deployment process
main
