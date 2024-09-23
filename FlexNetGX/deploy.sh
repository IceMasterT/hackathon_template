#!/bin/bash

set -e

# AWS deployment configuration
AWS_REGION="us-east-1"
S3_BUCKET="flexnetgx-kit"
LAMBDA_FUNCTION_NAME="flexnet-gx-lambda"
API_GATEWAY_ID="0re8k6t744"
CLOUDFRONT_DISTRIBUTION_ID="EJ0WHQ9X3XAGH"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools and install if missing
for cmd in cargo zip; do
    if ! command_exists $cmd; then
        echo "Error: $cmd is not installed. Please install it and try again."
        exit 1
    fi
done

# Install wasm-pack if not present
if ! command_exists wasm-pack; then
    echo "Installing wasm-pack..."
    cargo install -f wasm-pack
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Verify wasm-pack installation
if ! command_exists wasm-pack; then
    echo "Error: wasm-pack installation failed. Please install it manually and try again."
    exit 1
fi

# Install cargo-ndk if not present
if ! command_exists cargo-ndk; then
    echo "Installing cargo-ndk..."
    cargo install -f cargo-ndk
fi

# Check AWS CLI configuration
if ! command_exists aws; then
    echo "AWS CLI not found. Please install it and configure it properly."
    exit 1
fi

# Ensure the Rust target is installed
if ! rustup target list | grep -q "x86_64-unknown-linux-musl (installed)"; then
    echo "Installing x86_64-unknown-linux-musl target..."
    rustup target add x86_64-unknown-linux-musl
fi

# Build and deploy Blockchain Core
echo "Building Blockchain Core..."
cd flexnet-gx-blockchain
cargo build --release
cd ..

# Build and deploy Web Frontend
echo "Building Web Frontend..."
cd flexnet-gx-web
wasm-pack build --target web --out-name flexnet_gx_web
echo "Deploying Web Frontend to S3..."
aws s3 sync ./pkg s3://$S3_BUCKET/web --delete
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
cd ..

# Build Mobile App
echo "Building Mobile App..."
cd flexnet-gx-mobile
# Check if src/lib.rs exists, if not, create it
if [ ! -f src/lib.rs ]; then
    echo "Creating src/lib.rs for mobile app..."
    mkdir -p src
    touch src/lib.rs
fi
./build-android.sh
./build-ios.sh
echo "Mobile app built. Please upload to respective app stores manually."
cd ..

# Build and deploy Lambda function
echo "Building and deploying Lambda function..."
./deploy-lambda.sh

# Update API Gateway
echo "Updating API Gateway..."
if ! aws apigateway get-rest-api --rest-api-id $API_GATEWAY_ID &>/dev/null; then
    echo "Error: API Gateway with ID $API_GATEWAY_ID not found. Please check your configuration."
    exit 1
fi
aws apigateway create-deployment --rest-api-id $API_GATEWAY_ID --stage-name prod

echo "Deployment complete!"
echo "Web Frontend: https://$S3_BUCKET.s3-website.$AWS_REGION.amazonaws.com"
echo "API Gateway: https://$API_GATEWAY_ID.execute-api.$AWS_REGION.amazonaws.com/prod"
echo "CloudFront Distribution: https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net"
echo "Remember to upload the mobile app to the respective app stores manually."