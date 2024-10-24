
# Table of Contents

- [FlexNet GX Application](#flexnet-gx-application)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Setup Options](#setup-options)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Manual Setup](#manual-setup)
- [Directory Structure](#directory-structure)
- [Development Workflow](#development-workflow)
  - [1. Working with Near Protocol](#1-working-with-near-protocol)
  - [2. Working with AWS Lambda](#2-working-with-aws-lambda)
  - [3. Frontend Development](#3-frontend-development)
  - [4. Mobile Development](#4-mobile-development)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
  - [1. Deploy All Components](#1-deploy-all-components)
  - [2. Deploy Lambda Only](#2-deploy-lambda-only)
  - [3. Verify Deployments](#3-verify-deployments)
- [Debugging and Logging](#debugging-and-logging)
  - [Lambda Function Logs](#lambda-function-logs)
  - [Near Contract Debugging](#near-contract-debugging)
- [Testing](#testing)
- [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
  - [AWS Resources](#aws-resources)
  - [Near Protocol](#near-protocol)
  - [Support Resources](#support-resources)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Logs and Debugging](#logs-and-debugging)
  - [Deployment Verification](#deployment-verification)
  - [Environment Issues](#environment-issues)
  - [Common Error Solutions](#common-error-solutions)
- [License](#license)

# FlexNet GX Application

A modern, serverless application with a Yew-based web frontend (WebAssembly), mobile app structure, AWS serverless backend, and Near Protocol blockchain integration, all implemented in Rust.



# FlexNet GX Application

A modern, serverless application with a Yew-based web frontend (WebAssembly), mobile app structure, AWS serverless backend, and Near Protocol blockchain integration, all implemented in Rust.


## Quick Start

```bash
git clone git@github.com:cryptoversus-io/hackathon_templates.git redacted
cd redacted
git branch qe_redacted
git checkout qe_redacted
```


## Prerequisites

Before setting up the project, you only need:
- AWS credentials configured
- Near Protocol account

Note: All required tools and dependencies (Rust, Node.js, Near CLI, wasm-pack, etc.) will be installed automatically by the setup scripts.

## Setup Options [⬆️ back to top](#flexnet-gx-application)

### Docker Setup (Recommended)

The setup scripts (1_setup.sh and 2_setup.sh) run automatically during the Docker build:
```bash
docker-compose build
docker-compose up -d
```

### Manual Setup

```bash
cd scripts
chmod +x 1_setup.sh 2_setup.sh
./1_setup.sh
./2_setup.sh
```

## Directory Structure

```
├── .github/              # GitHub configurations
├── FlexNetGX/
│   ├── scripts/               # Deployment and utility scripts
│   ├── flexnet-gx-web/        # Web frontend (Yew/WebAssembly)
│   ├── flexnet-gx-mobile/     # Mobile app
│   ├── flexnet-gx-lambda/     # Lambda functions
│   └── flexnet-gx-blockchain/ # Near Protocol blockchain code
└── scripts/              # Setup scripts
    ├── 1_setup.sh            # Initial setup script
    └── 2_setup.sh            # Secondary setup script
```

## Development Workflow [⬆️ back to top](#flexnet-gx-application)

### 1. Working with Near Protocol

```bash
# Login to Near testnet
near login

# Check contract status
near state $ENCRYPTED_NEAR_CONTRACT_NAME

# View contract methods
near view $ENCRYPTED_NEAR_CONTRACT_NAME get_methods

# Deploy contract changes
./scripts/deploy.sh
```

### 2. Working with AWS Lambda

```bash
# Deploy Lambda changes
./scripts/deploy-lambda.sh

# View logs
aws logs tail /aws/lambda/$ENCRYPTED_LAMBDA_FUNCTION_NAME --follow

# Test function
aws lambda invoke \
    --function-name $ENCRYPTED_LAMBDA_FUNCTION_NAME \
    --payload '{"test": "event"}' \
    response.json
```

### 3. Frontend Development

```bash
cd flexnet-gx-web
wasm-pack build --target web
```

### 4. Mobile Development

```bash
cd flexnet-gx-mobile
cargo build
cargo run
```

## Environment Configuration [⬆️ back to top](#flexnet-gx-application)

The encryption process converts `.env.example` to `.env` with encrypted values:
1. Copy the example file: `cp .env.example .env`
2. Edit with your values: `nano .env`
3. Run encryption: `./scripts/encrypt_env.sh`

Variables before encryption (.env.example):
```bash

## Structure

- `flexnet-gx-web/`: Yew-based web frontend (WebAssembly)
- `flexnet-gx-mobile/`: Mobile application structure
- `flexnet-gx-lambda/`: Rust-based AWS Lambda functions
- `flexnet-gx-blockchain/`: Near Protocol blockchain integration

## Prerequisites

- Rust and Cargo (latest stable version)
- AWS CLI (configured with appropriate credentials)
- Near CLI (for blockchain interaction)
- Node.js and npm
- wasm-pack
- SQLite

## Initial Setup

1. Install Required Tools:
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install Near CLI
   npm install -g near-cli
   
   # Install wasm-pack
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

2. Configure Environment Variables:
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your configurations
   nano .env
   ```

3. Encrypt Environment Variables:
   ```bash
   cd scripts
   chmod +x encrypt_env.sh
   ./encrypt_env.sh
   
   # Move and rename the encrypted file
   mv .env.encrypted ../FlexNetGX/.env
   ```

## Environment Configuration

Required variables in .env:
```plaintext

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
```


After running encrypt_env.sh (.env):
```bash
# Encrypted AWS Configuration
ENCRYPTED_LAMBDA_FUNCTION_NAME=<encrypted-value>
ENCRYPTED_API_GATEWAY_ID=<encrypted-value>
ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID=<encrypted-value>
ENCRYPTED_LAMBDA_FUNCTION_ARN=<encrypted-value>
ENCRYPTED_LAMBDA_ROLE_NAME=<encrypted-value>
ENCRYPTED_LAMBDA_ROLE_ARN=<encrypted-value>

# Non-encrypted values remain the same
AWS_REGION=us-east-1
LAMBDA_RUNTIME=provided.al2
LAMBDA_HANDLER=bootstrap

# Near Protocol Configuration (encrypted)
ENCRYPTED_NEAR_ACCOUNT_ID=<encrypted-value>
ENCRYPTED_NEAR_CONTRACT_NAME=<encrypted-value>
NEAR_NETWORK=testnet
```

## Deployment Process [⬆️ back to top](#flexnet-gx-application)

### 1. Deploy All Components

```bash
# Deploy everything (web, mobile, Lambda, Near contract)
./scripts/deploy.sh
```

### 2. Deploy Lambda Only

```bash
# Deploy Lambda changes
./scripts/deploy-lambda.sh
```

### 3. Verify Deployments

```bash
# Check Lambda
aws lambda get-function --function-name $ENCRYPTED_LAMBDA_FUNCTION_NAME

# Check Near contract
near state $ENCRYPTED_NEAR_CONTRACT_NAME

# Check CloudFront
aws cloudfront get-distribution --id $ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID
```

## Debugging and Logging [⬆️ back to top](#flexnet-gx-application)

### Lambda Function Logs

1. CloudWatch Logs:
```bash
# View recent logs
aws logs get-log-events \
    --log-group-name /aws/lambda/$ENCRYPTED_LAMBDA_FUNCTION_NAME \
    --log-stream-name `date +%Y/%m/%d/[$VERSION]%h`

# Watch logs in real-time
aws logs tail /aws/lambda/$ENCRYPTED_LAMBDA_FUNCTION_NAME --follow
```

2. Error Handling:
```bash
# Check Lambda execution role
aws lambda get-function-configuration \
    --function-name $ENCRYPTED_LAMBDA_FUNCTION_NAME

# Test Lambda function
aws lambda invoke \
    --function-name $ENCRYPTED_LAMBDA_FUNCTION_NAME \
    --payload '{"test": "event"}' \
    response.json
```

### Near Contract Debugging [⬆️ back to top](#flexnet-gx-application)

1. View Contract State:
```bash
# View all state
near view-state $ENCRYPTED_NEAR_CONTRACT_NAME

# View specific methods
near call $ENCRYPTED_NEAR_CONTRACT_NAME get_status {} --accountId $ENCRYPTED_NEAR_ACCOUNT_ID

# Check contract logs
near view $ENCRYPTED_NEAR_CONTRACT_NAME get_logs
```

2. Transaction Inspection:
```bash
# View recent transactions
near tx-status <TX_HASH> --accountId $ENCRYPTED_NEAR_ACCOUNT_ID

# View contract metrics
near state $ENCRYPTED_NEAR_CONTRACT_NAME
```

## Testing

Run the test suite:
```bash
# All tests
./scripts/test.sh

# With specific options
./scripts/test.sh --e2e      # Include end-to-end tests
./scripts/test.sh --coverage # Generate coverage reports
```

## Monitoring and Troubleshooting [⬆️ back to top](#flexnet-gx-application)

### AWS Resources

1. Lambda Functions:
   - Check CloudWatch Logs for errors
   - Monitor function metrics in CloudWatch
   - Review IAM roles and permissions

2. API Gateway:
   - Monitor request/response logs
   - Check API Gateway CloudWatch metrics
   - Verify endpoint configurations

### Near Protocol

1. Contract Monitoring:
   - Use Near Explorer for transaction history
   - Monitor contract storage usage
   - Check gas consumption metrics

2. Common Issues:
   - Check account balance for contract deployment
   - Verify contract method permissions
   - Monitor network status

### Support Resources

1. AWS Documentation:
   - Lambda troubleshooting guide
   - CloudWatch logs insights
   - IAM troubleshooting

2. Near Protocol Resources:
   - Near Explorer: https://explorer.testnet.near.org/
   - Near CLI documentation
   - Contract debugging guide

## Scripts Usage

All scripts are located in the `scripts/` directory:

### 1. Development Environment Setup
```bash
chmod +x scripts/2_setup.sh
./scripts/2_setup.sh_setup
```

### 2. Environment Variable Encryption
```bash
./scripts/encrypt_env.sh
```

### 3. Deployment
```bash
# Full deployment
./scripts/deploy.sh

# Lambda-only deployment
./scripts/deploy-lambda.sh
```

### 4. Testing
```bash
# Run all tests
./scripts/test.sh

# Run with specific options
./scripts/test.sh --e2e         # Include end-to-end tests
./scripts/test.sh --coverage    # Generate coverage reports
```

## Near Protocol Integration

1. Login to Near testnet:
   ```bash
   near login
   ```

2. Check contract status:
   ```bash
   near state $NEAR_CONTRACT_NAME
   ```

3. View contract methods:
   ```bash
   near view $NEAR_CONTRACT_NAME get_methods
   ```

## Development Workflow

1. Start Local Development:
   ```bash
   # Frontend
   cd flexnet-gx-web
   wasm-pack build --target web
   
   # Near Contract
   cd flexnet-gx-blockchain
   cargo build --target wasm32-unknown-unknown --release
   ```

2. Deploy Changes:
   ```bash
   cd scripts
   ./deploy.sh
   ```

3. Run Tests:
   ```bash
   ./test.sh
   ```


## Security Features

- AWS KMS encryption for environment variables
- Secure Near Protocol wallet integration
- IAM role-based access control
- API Gateway security

## Troubleshooting

### Common Issues

1. AWS Credential Issues:
   ```bash
   aws configure
   # Set your AWS credentials
   ```

2. Near CLI Login Problems:
   ```bash
   near login
   # Follow browser prompts
   ```

3. Build Failures:
   ```bash
   rustup update
   rustup target add wasm32-unknown-unknown
   ```


### Logs and Debugging [⬆️ back to top](#flexnet-gx-application)

1. AWS Lambda Logs:
   ```bash
   # View recent logs
   aws logs get-log-events \
       --log-group-name /aws/lambda/$ENCRYPTED_LAMBDA_FUNCTION_NAME \
       --log-stream-name `date +%Y/%m/%d/[$VERSION]%h`
   
   # Live log tail
   aws logs tail /aws/lambda/$ENCRYPTED_LAMBDA_FUNCTION_NAME --follow
   ```

2. Near Protocol Logs:
   ```bash
   # View contract logs
   near view $ENCRYPTED_NEAR_CONTRACT_NAME get_logs
   
   # Check state
   near state $ENCRYPTED_NEAR_CONTRACT_NAME
   ```

3. Frontend Console:
   - Browser Developer Tools
   - WebAssembly debugging tools
   - Network request monitoring

### Deployment Verification [⬆️ back to top](#flexnet-gx-application)

### Logs and Debugging

- AWS Lambda logs: CloudWatch Logs
- Frontend console: Browser Developer Tools
- Near Protocol logs: `near view` command

## Deployment Verification


Check deployment status:
```bash
# Near Contract

near state $ENCRYPTED_NEAR_CONTRACT_NAME

# Lambda Function
aws lambda get-function --function-name $ENCRYPTED_LAMBDA_FUNCTION_NAME

# CloudFront
aws cloudfront get-distribution --id $ENCRYPTED_CLOUDFRONT_DISTRIBUTION_ID
```

### Environment Issues

1. Check Environment Setup:
```bash
# Verify encryption
cat .env | grep "ENCRYPTED_"

# Re-run encryption if needed
./scripts/encrypt_env.sh
```

2. AWS KMS Issues:
```bash
# Check KMS access
aws kms list-keys

# Test decryption
aws kms decrypt --ciphertext-blob fileb://encrypted-value --output text --query Plaintext | base64 --decode
```

3. Near Account Issues:
```bash
# Check account status
near state $ENCRYPTED_NEAR_ACCOUNT_ID

# View account balance
near state $ENCRYPTED_NEAR_ACCOUNT_ID | grep "amount"
```

### Common Error Solutions

1. "Function not found" in AWS Lambda:
   - Verify function name in .env
   - Check AWS region configuration
   - Ensure proper IAM roles

2. "Account not found" in Near Protocol:
   - Verify account credentials
   - Check testnet/mainnet configuration
   - Ensure sufficient balance

3. Build/Compilation Errors:
   - Update Rust toolchain
   - Clear target directories
   - Rebuild with `--verbose` flag

## License

This project is licensed under the MIT License - see the LICENSE file for details.
[Previous content remains exactly the same until each section end, where we add:]
[⬆️ back to top](#flexnet-gx-application)

near state $NEAR_CONTRACT_NAME

# Lambda Function
aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME

# CloudFront
aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID
```

## Contributing

1. Create your feature branch
   ```bash
   git checkout -b feature/<amazing-feature>
   ```

2. Commit your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```

3. Push to the branch
   ```bash
   git push origin feature/<amazing-feature>
   ```

4. Submit a Pull Request

## Support

For support and questions:
1. Check the documentation
2. Review CloudWatch logs
3. Near Protocol Explorer
4. Contact team lead

## License

This project is licensed under the MIT License - see the LICENSE file for details.

