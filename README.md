# FlexNet GX Application

A modern, serverless application with a Yew-based web frontend (WebAssembly), mobile app structure, AWS serverless backend, and Near Protocol blockchain integration, all implemented in Rust.

## Quick Start

```bash
git clone git@github.com:cryptoversus-io/hackathon_templates.git redacted
cd redacted
git branch qe_redacted
git checkout qe_redacted
```

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
- PostgreSQL

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

## Scripts Usage

All scripts are located in the `scripts/` directory:

### 1. Development Environment Setup
```bash
chmod +x scripts/setup-dev-env.sh
./scripts/setup-dev-env.sh
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

### Logs and Debugging

- AWS Lambda logs: CloudWatch Logs
- Frontend console: Browser Developer Tools
- Near Protocol logs: `near view` command

## Deployment Verification

Check deployment status:
```bash
# Near Contract
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