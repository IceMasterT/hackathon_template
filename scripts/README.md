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

- Rust and Cargo (latest stable version)
- AWS CLI (configured with appropriate credentials)
- Near CLI (for blockchain interaction)
- Node.js and npm
- Docker and Docker Compose
- wasm-pack

## Directory Structure

```
FlexNetGX/
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Docker ignore rules
├── .env                   # Environment variables
├── scripts/               # Scripts directory
├── flexnet-gx-web/        # Web frontend
├── flexnet-gx-mobile/     # Mobile app
├── flexnet-gx-lambda/     # Lambda functions
└── flexnet-gx-blockchain/ # Blockchain code
```

## DOCKER | Building and Running

1. Build the Docker container:
```bash
docker-compose build
```

2. Start the services:
```bash
docker-compose up -d
```

3. Enter the container:
```bash
docker-compose exec unsterlink bash
```

4. Inside the container, run setup:
```bash
cd /app/scripts
./setup.sh
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

Create a `.env` file in the root directory:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configurations
nano .env
```

Required environment variables:
```
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
```

## Testing

Run the test suite:

```bash
# All tests
./scripts/test.sh

# With specific options
./scripts/test.sh --e2e         # Include end-to-end tests
./scripts/test.sh --coverage    # Generate coverage reports
```

## Support

For support and questions:
1. Check the documentation
2. Review CloudWatch logs
3. Near Protocol Explorer
4. Contact team lead

## License

This project is licensed under the MIT License - see the LICENSE file for details.