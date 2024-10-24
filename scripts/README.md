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

- Docker and Docker Compose
- AWS CLI (configured with appropriate credentials)
- Near CLI (for blockchain interaction)

Note: Other dependencies (Rust, Node.js, wasm-pack) are automatically installed during the Docker build process.

## Directory Structure

```
├── .github/              # GitHub configurations
├── FlexNetGX/
│   ├── Dockerfile              # Docker configuration
│   ├── docker-compose.yml      # Docker Compose configuration
│   ├── .dockerignore          # Docker ignore rules
│   ├── .env                   # .env.example variables after run encrypt_env.sh
│   ├── scripts/               # Deployment and utility scripts
│   ├── flexnet-gx-web/        # Web frontend (Yew/WebAssembly)
│   ├── flexnet-gx-mobile/     # Mobile application
│   ├── flexnet-gx-lambda/     # AWS Lambda functions
│   └── flexnet-gx-blockchain/ # Near Protocol blockchain code
└── scripts/              # Setup scripts (auto-run during Docker build)
```

## DOCKER | Building and Running

1. Build the Docker container:
```bash
docker-compose build
```

2. Start the services:
```bash
# This will automatically run setup scripts (1_setup.sh and 2_setup.sh)
docker-compose up --build -d
```

3. Enter the container:
```bash
docker-compose exec unsterlink bash
```
## Development

For development, you can mount your source code directory:

```yaml
# Add to docker-compose.yml under volumes:
- ./src:/app/src
```

## Cleanup

To clean up Docker resources:

```bash
# Stop and remove containers
docker-compose down

# Remove built images
docker rmi unsterlink

# Remove volumes (careful - this deletes data)
docker-compose down -v
```

## Environment Configuration

Configure a `.env` file in the root directory:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configurations
nano .env

# Encrypt sensitive variables
./scripts/encrypt_env.sh
```

The encryption process will:
- Read variables from `.env`
- Encrypt sensitive values
- Create new `.env` with encrypted values
- Preserve non-sensitive variables

Required environment variables:
```
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

## Testing

Run the test suite:

```bash
# Full test suite
./scripts/test.sh

# With options
./scripts/test.sh --e2e      # Include end-to-end tests
./scripts/test.sh --coverage # Generate coverage reports
```

### Deployment

1. Deploy all components:

```bash
./scripts/deploy.sh
```

Deploy lambda functions only:

```bash
./scripts/deploy-lambda.sh
```
### Monitoring and Support

1. AWS CloudWatch Logs
   - Lambda function logs
   - API Gateway access logs

2. Near Protocol
   - Contract status: `near state <contract-name>`
   - Explorer: https://explorer.testnet.near.org/

3. Support Resources
   - Project documentation
   - CloudWatch logs
   - Near Protocol Explorer
   - Team lead contact

## License

This project is licensed under the MIT License - see the LICENSE file for details.