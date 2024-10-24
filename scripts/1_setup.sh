#!/bin/bash

# Enhanced UNsterlink Setup Script with Error Checking and Dependency Management
# Includes Near Protocol Integration

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check and install Rust
check_rust() {
    if ! command_exists rustc; then
        echo "Rust is not installed. Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source $HOME/.cargo/env
    else
        echo "Rust is already installed."
    fi

    # Check Rust version
    local rust_version=$(rustc --version | cut -d ' ' -f 2)
    if [[ "$rust_version" < "1.60.0" ]]; then
        echo "Updating Rust to the latest version..."
        rustup update stable
    fi

    # Add required targets
    rustup target add wasm32-unknown-unknown
    rustup target add x86_64-unknown-linux-musl
}

# Function to check and install wasm-pack
check_wasm_pack() {
    if ! command_exists wasm-pack; then
        echo "wasm-pack is not installed. Installing wasm-pack..."
        curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
    else
        echo "wasm-pack is already installed."
    fi
}

# Function to check and install Near CLI
check_near_cli() {
    if ! command_exists near; then
        echo "Near CLI is not installed. Installing Near CLI..."
        npm install -g near-cli
    else
        echo "Near CLI is already installed."
    fi
}

# Function to check and create directory
check_and_create_dir() {
    if [ ! -d "$1" ]; then
        echo "Creating directory: $1"
        mkdir -p "$1"
    else
        echo "Directory already exists: $1"
    fi
}

# Main setup function
setup_flexnet_gx() {
    # Check and install dependencies
    check_rust
    check_wasm_pack
    check_near_cli

    # Create the main UNsterlink directory
    check_and_create_dir "FlexNetGX"
    cd FlexNetGX

    # Create README.md
    cat << EOF > README.md
# UNsterlink Application

This is a modern, serverless application with a Yew-based web frontend (WebAssembly), 
a mobile app structure, AWS serverless backend, and Near Protocol blockchain integration,
all implemented in Rust.

## Structure

- \`flexnet-gx-web/\`: Yew-based web frontend (WebAssembly)
- \`flexnet-gx-mobile/\`: Mobile application structure
- \`flexnet-gx-lambda/\`: Rust-based AWS Lambda functions for serverless backend
- \`flexnet-gx-blockchain/\`: Near Protocol blockchain for key management and secure data storage

See individual directories for build and run instructions.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Rust and Cargo (latest stable version)
- AWS CLI (configured with appropriate credentials)
- Near CLI (for blockchain interaction)

The \`deploy.sh\` script will handle the installation of additional tools like wasm-pack and cargo-ndk.

## Setup and Deployment

1. Clone the repository:
   \`\`\`
   git clone git@github.com:cryptoversus-io/hackathon_templates.git redacted
   cd redacted
   git branch qe_redacted
   git checkout qe_redacted 
   \`\`\`

2. Make the deployment scripts executable:
   \`\`\`
   chmod +x scripts/deploy.sh scripts/deploy-lambda.sh
   \`\`\`

3. Run the main deployment script:
   \`\`\`
   ./scripts/deploy.sh
   \`\`\`

EOF

    # Web Frontend Setup
    check_and_create_dir "flexnet-gx-web"
    cd flexnet-gx-web

    if [ ! -f "Cargo.toml" ]; then
        cargo init --lib
    fi

    # Add necessary dependencies to Cargo.toml
    cat << EOF > Cargo.toml
[package]
name = "flexnet-gx-web"
version = "0.1.0"
edition = "2021"

[dependencies]
yew = "0.19"
wasm-bindgen = "0.2"
wasm-bindgen-futures = "0.4"
web-sys = "0.3"
js-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
reqwest = { version = "0.11", features = ["json"] }
near-sdk = "5.5.0"
near-api = "0.2.0"
aes-gcm = "0.10"
sha2 = "0.10"
hex = "0.4"

[lib]
crate-type = ["cdylib", "rlib"]
EOF

    # Create src/lib.rs with Near Protocol integration
    cat << EOF > src/lib.rs
use yew::prelude::*;
use wasm_bindgen::prelude::*;
use near_sdk::serde_json;

// Near Protocol integration will go here in subsequent messages...
EOF

    cd ..

    # Mobile App Setup
    check_and_create_dir "flexnet-gx-mobile"
    cd flexnet-gx-mobile

    if [ ! -f "Cargo.toml" ]; then
        cargo init --bin
    fi

    # Update Cargo.toml with Near Protocol support
    cat << EOF > Cargo.toml
[package]
name = "flexnet-gx-mobile"
version = "0.1.0"
edition = "2021"

[dependencies]
dioxus = "0.3"
dioxus-mobile = "0.3"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
near-sdk = "5.5.0"
aes-gcm = "0.10"
sha2 = "0.10"
hex = "0.4"

[target.'cfg(target_os = "android")'.dependencies]
ndk-glue = "0.7"

[target.'cfg(target_os = "ios")'.dependencies]
objc = "0.2"
cocoa = "0.24"
core-graphics = "0.22"

[lib]
crate-type = ["cdylib", "rlib"]

[[bin]]
name = "flexnet-gx-mobile"
path = "src/main.rs"
EOF

    # Create mobile app source files
    cat << EOF > src/main.rs
use dioxus::prelude::*;
use near_sdk::serde_json;

// Near Protocol integration will go here...
EOF

    cd ..

    # Lambda Setup
    check_and_create_dir "flexnet-gx-lambda"
    cd flexnet-gx-lambda

    if [ ! -f "Cargo.toml" ]; then
        cargo init --bin
    fi

    # Update Cargo.toml with Near Protocol support
    cat << EOF > Cargo.toml
[package]
name = "flexnet-gx-lambda"
version = "0.1.0"
edition = "2021"

[dependencies]
lambda_runtime = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
near-sdk = "5.5.0"
aes-gcm = "0.10"
sha2 = "0.10"
hex = "0.4"

[[bin]]
name = "bootstrap"
path = "src/main.rs"
EOF

    cd ..

    # Near Protocol Blockchain Setup
    check_and_create_dir "flexnet-gx-blockchain"
    cd flexnet-gx-blockchain

    if [ ! -f "Cargo.toml" ]; then
        cargo init --lib
    fi

    # Create Cargo.toml for Near Protocol
    cat << EOF > Cargo.toml
[package]
name = "flexnet-gx-blockchain"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
near-sdk = "5.5.0"
near-contract-standards = "4.0.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
borsh = "0.9"

[profile.release]
codegen-units = 1
opt-level = "z"
lto = true
debug = false
panic = "abort"
overflow-checks = true
EOF

    # Create Near Protocol smart contract
    mkdir -p src
    cat << EOF > src/lib.rs
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct FlexNetGX {
    users: UnorderedMap<AccountId, User>,
    teams: UnorderedMap<String, Team>,
    workspaces: UnorderedMap<String, Workspace>,
    surveys: UnorderedMap<String, Survey>,
}

#[near_bindgen]
impl FlexNetGX {
    #[init]
    pub fn new() -> Self {
        Self {
            users: UnorderedMap::new(b"u"),
            teams: UnorderedMap::new(b"t"),
            workspaces: UnorderedMap::new(b"w"),
            surveys: UnorderedMap::new(b"s"),
        }
    }

    // User management
    pub fn register_user(&mut self, account_id: AccountId) {
        assert!(!self.users.contains_key(&account_id), "User already exists");
        // Implementation details...
    }

    // Team management
    pub fn create_team(&mut self, name: String) {
        // Implementation details...
    }

    // Workspace management
    pub fn create_workspace(&mut self, name: String) {
        // Implementation details...
    }

    // Survey management
    pub fn create_survey(&mut self, name: String) {
        // Implementation details...
    }
}
EOF

    cd ..

    # Create scripts directory if it doesn't exist
    check_and_create_dir "scripts"

    # Create test script
    cat << 'EOF' > scripts/test.sh
    # UNsterlink Testing Suite
    #!/bin/bash

# UNsterlink Testing Suite
# Comprehensive testing script for all components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test environment configuration
export NODE_ENV=test
export NEAR_ENV=testnet

# Load environment variables
if [ ! -f "../.env" ]; then
    echo -e "${RED}Error: .env file not found in parent directory${NC}"
    exit 1
fi
source ../.env

# Function to run Near Protocol contract tests
test_near_contract() {
    echo -e "\n${BLUE}Testing Near Protocol Smart Contract...${NC}"
    cd ../flexnet-gx-blockchain

    echo "Running unit tests..."
    cargo test -- --nocapture

    echo "Running integration tests..."
    cargo test --features integration-tests -- --nocapture

    # Deploy to testnet for end-to-end testing
    if [ "$RUN_E2E" = true ]; then
        echo "Deploying to testnet for E2E testing..."
        near dev-deploy --wasmFile target/wasm32-unknown-unknown/release/flexnet_gx_blockchain.wasm
    fi

    cd ../scripts
}

# Function to test Lambda functions
test_lambda() {
    echo -e "\n${BLUE}Testing AWS Lambda Functions...${NC}"
    cd ../flexnet-gx-lambda

    echo "Running unit tests..."
    cargo test -- --nocapture

    if [ "$RUN_E2E" = true ]; then
        echo "Running integration tests with AWS..."
        # Test against real AWS services
        cargo test --features integration-tests -- --nocapture
    fi

    cd ../scripts
}

# Function to test frontend
test_frontend() {
    echo -e "\n${BLUE}Testing Frontend Components...${NC}"
    cd ../flexnet-gx-web

    echo "Running unit tests..."
    wasm-pack test --node

    if [ "$RUN_E2E" = true ]; then
        echo "Running E2E tests..."
        wasm-pack test --headless --firefox
    fi

    cd ../scripts
}

# Function to run database tests
test_database() {
    echo -e "\n${BLUE}Testing Database Operations...${NC}"
    
    # Test database migrations
    echo "Testing database migrations..."
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -f ../tests/db/migrations_test.sql

    # Test database queries
    echo "Testing database queries..."
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -f ../tests/db/queries_test.sql
}

# Function to test API endpoints
test_api() {
    echo -e "\n${BLUE}Testing API Endpoints...${NC}"
    
    if [ "$RUN_E2E" = true ]; then
        # Test actual API endpoints
        echo "Testing live API endpoints..."
        curl -s "$API_ENDPOINT/health" || echo "API health check failed"
    else
        # Run mock API tests
        echo "Running mock API tests..."
        cd ../tests/api
        node run_api_tests.js
        cd ../../scripts
    fi
}

# Function to run security tests
run_security_tests() {
    echo -e "\n${BLUE}Running Security Tests...${NC}"

    # Check for known vulnerabilities
    echo "Checking dependencies for vulnerabilities..."
    cargo audit

    # Run OWASP ZAP if installed
    if command -v zap-cli &> /dev/null; then
        echo "Running OWASP ZAP scan..."
        zap-cli quick-scan --self-contained --spider -r "$API_ENDPOINT"
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "\n${BLUE}Running Performance Tests...${NC}"

    # Test Near Protocol contract performance
    echo "Testing contract performance..."
    cd ../flexnet-gx-blockchain
    cargo bench
    cd ../scripts

    # Test API performance with Apache Bench
    if command -v ab &> /dev/null; then
        echo "Running API performance tests..."
        ab -n 1000 -c 10 "$API_ENDPOINT/health"
    fi
}

# Function to generate test reports
generate_test_report() {
    echo -e "\n${BLUE}Generating Test Reports...${NC}"
    
    REPORT_DIR="../test-reports"
    mkdir -p "$REPORT_DIR"

    # Collect all test results
    echo "Test Report - $(date)" > "$REPORT_DIR/test_report.txt"
    echo "===================" >> "$REPORT_DIR/test_report.txt"
    
    # Add test results to report
    find ../ -name "*.test-results" -exec cat {} \; >> "$REPORT_DIR/test_report.txt"

    # Generate coverage report
    if [ "$GENERATE_COVERAGE" = true ]; then
        echo "Generating coverage report..."
        cargo tarpaulin --out Html --output-dir "$REPORT_DIR/coverage"
    fi
}

# Function to run cleanup after tests
cleanup_test_environment() {
    echo -e "\n${BLUE}Cleaning up test environment...${NC}"
    
    # Clean up test database
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

    # Remove test contracts from testnet
    if [ "$RUN_E2E" = true ]; then
        near delete test.near
    fi

    # Clean up test artifacts
    rm -rf ../target/debug/deps/test*
}

# Main test execution function
run_tests() {
    echo -e "${BLUE}Starting UNsterlink Test Suite...${NC}"
    
    # Parse command line arguments
    RUN_E2E=false
    GENERATE_COVERAGE=false
    
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --e2e) RUN_E2E=true ;;
            --coverage) GENERATE_COVERAGE=true ;;
            *) echo "Unknown parameter: $1"; exit 1 ;;
        esac
        shift
    done

    # Run all tests
    test_near_contract
    test_lambda
    test_frontend
    test_database
    test_api
    run_security_tests
    run_performance_tests

    # Generate reports
    generate_test_report

    # Cleanup
    cleanup_test_environment

    echo -e "${GREEN}All tests completed successfully!${NC}"
}

# Show test suite usage
show_usage() {
    echo -e "Usage: $0 [options]"
    echo -e "Options:"
    echo -e "  --e2e        Run end-to-end tests"
    echo -e "  --coverage   Generate coverage reports"
    echo -e "Example: $0 --e2e --coverage"
}

# Main execution
if [ "$1" == "--help" ]; then
    show_usage
else
    run_tests "$@"
fi
EOF

cat << 'EOF' > scripts/deploy-lambda.sh
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

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "Error: .env file not found in the current directory."
    echo "Please ensure that the .env file is present in the same directory as this script."
    exit 1
fi

# Load environment variables
source ../.env

echo "Debug: Environment variables after sourcing .env"
echo "AWS_REGION: $AWS_REGION"
echo "S3_BUCKET: $S3_BUCKET"
echo "LAMBDA_FUNCTION_NAME: $LAMBDA_FUNCTION_NAME"
echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "KMS_KEY_ID: $KMS_KEY_ID"

# Check required environment variables
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

# Decrypt environment variables
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

# New function to check Near Protocol configuration
check_near_config() {
    if [ -z "$NEAR_ACCOUNT_ID" ] || [ -z "$NEAR_CONTRACT_NAME" ]; then
        echo "Warning: Near Protocol configuration not found. Lambda function may have limited functionality."
        return 1
    fi
    return 0
}

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

# Function to update Lambda configuration with retries
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
            --role "$LAMBDA_ROLE_ARN" \
            --environment "Variables={NEAR_ACCOUNT_ID=$NEAR_ACCOUNT_ID,NEAR_CONTRACT_NAME=$NEAR_CONTRACT_NAME,NEAR_NETWORK=$NEAR_NETWORK}"; then
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

# Build and package Lambda function
echo "Building and packaging Lambda function..."
cd ../flexnet-gx-lambda
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

# Check Near Protocol configuration and update function
check_near_config
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
echo "Your Specific s3 Key has been generated and put in the s3 bucket. If you want to use it specify it in the .env file"
cd ../scripts
EOF

chmod +x scripts/deploy-lambda.sh

# Create deploy.sh
cat << 'EOF' > scripts/deploy.sh
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
EOF

# Create deploy-lambda.sh
cat << 'EOF' > .env.example
# Create .env.example
cat << 'EOF' > .env.example

AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
LAMBDA_FUNCTION_NAME=your-lambda-function-name
API_GATEWAY_ID=your-api-gateway-id
CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
LAMBDA_FUNCTION_ARN=your-lambda-function-arn
LAMBDA_RUNTIME=provided.al2
LAMBDA_HANDLER=bootstrap
LAMBDA_ROLE_NAME=your-lambda-role-name
LAMBDA_ROLE_ARN=your-lambda-role-arn

NEAR_ACCOUNT_ID=your-account-name.testnet
NEAR_NETWORK=testnet
NEAR_CONTRACT_NAME=flexnetgx.testnet

- - - - - - - - - - - - 
// use this to create a .env file with your information in the same path as this file
// Run encrypt_env.sh 
// Place Generated .env.encrypted file inside the FlexNetGX root and rename to .env

EOF

# Create deploy-lambda.sh
cat << 'EOF' > scripts/encrypt_env.sh
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
        LAMBDA_FUNCTION_NAME|API_GATEWAY_ID|CLOUDFRONT_DISTRIBUTION_ID|LAMBDA_FUNCTION_ARN|LAMBDA_ROLE_NAME|LAMBDA_ROLE_ARN|NEAR_ACCOUNT_ID|NEAR_NETWORK|NEAR_CONTRACT_NAME)
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

echo "Created example .env file:"
cat << EOF > .env.example
# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
LAMBDA_FUNCTION_NAME=your-lambda-function-name
API_GATEWAY_ID=your-api-gateway-id
CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
LAMBDA_FUNCTION_ARN=your-lambda-function-arn
LAMBDA_RUNTIME=provided.al2
LAMBDA_HANDLER=bootstrap
LAMBDA_ROLE_NAME=your-lambda-role-name
LAMBDA_ROLE_ARN=your-lambda-role-arn

# Near Protocol Configuration
NEAR_ACCOUNT_ID=your-account.testnet
NEAR_NETWORK=testnet
NEAR_CONTRACT_NAME=flexnetgx.testnet

# Instructions:
# 1. Copy this file and rename to .env
# 2. Replace the placeholder values with your actual configuration
# 3. Run encrypt_env.sh to generate encrypted values
# 4. Place the generated .env.encrypted file inside the FlexNetGX root and rename to .env
EOF

echo "Encryption complete. Created $ENCRYPTED_ENV_FILE with encrypted values."

echo -e "\nNext steps:"
echo "1. Copy the generated .env.encrypted file to the FlexNetGX root directory"
echo "2. Rename .env.encrypted to .env in the FlexNetGX root directory"
echo "3. Your application will now use the encrypted values for both AWS and Near Protocol"
echo -e "\nCongratulations!! You have successfully encrypted your environment variables!"

chmod +x scripts/encrypt_env.sh

chmod +x scripts/deploy.sh
    
    # Make scripts executable
    chmod +x scripts/test.sh
    chmod +x scripts/deploy.sh
    chmod +x scripts/deploy-lambda.sh

    echo "UNsterlink setup completed successfully!"
    echo "Next steps:"
    echo "1. Configure your Near Protocol account using 'near login'"
    echo "2. Update '.env.example' with your configuration"
    echo "3. Run './scripts/encrypt_env.sh' to encrypt your environment variables"
    echo "4. Run './scripts/deploy.sh' to deploy the application"
}

# Run the setup
setup_flexnet_gx