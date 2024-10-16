# FlexNetGX Application

This is a modern, serverless application with a Yew-based web frontend (WebAssembly), 
a mobile app structure, AWS Lambda serverless backend, and blockchain integration, 
all implemented in Rust.

## Project Structure

```
LAYER/
└── flexnetgx/
    └── FlexNetGX/
        ├── flexnet-gx-lambda/
        ├── flexnet-gx-mobile/
        ├── flexnet-gx-web/
        ├── .env
        ├── .env.encrypted
        ├── .env.example
        ├── deploy.sh
        ├── deploy-lambda.sh
        ├── encrypt_env.sh
        ├── README.md
        └── Unster.md
```

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker (for local development and testing)

## Quick Start

1. Clone the repository:
   ```
   git clone git@github.com:cryptoversus-io/layer.git
   cd layer/flexnetgx/FlexNetGX
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your specific values in `.env`
   - Run the encryption script:
     ```
     ./encrypt_env.sh
     ```
   This will generate `.env.encrypted`. Both `.env` and `.env.encrypted` should remain in the root directory.

3. Make the deployment scripts executable:
   ```
   chmod +x deploy.sh deploy-lambda.sh
   ```

4. Run the main deployment script:
   ```
   ./deploy.sh
   ```

This script will automatically:
- Install necessary tools and dependencies
- Build all components (web frontend, mobile app, Lambda function)
- Deploy the web frontend to AWS S3
- Deploy the Lambda function
- Update the API Gateway

## Component-Specific Deployment

To deploy only the Lambda function:
```
./deploy-lambda.sh
```

## Configuration

The `.env` file contains all necessary configuration. Use `encrypt_env.sh` to encrypt sensitive values before deployment.

## Troubleshooting

If you encounter issues during deployment:
1. Ensure AWS CLI is properly configured with the necessary permissions.
2. Check the console output for specific error messages.
3. Verify that all AWS resource names and IDs in `.env` are correct.
4. For Lambda-specific issues, check that the IAM role has the necessary permissions.

## Contributing

Please read `Unster.md` for details on our code of conduct and the process for submitting pull requests.

For any questions or contributions, please contact @kitbaroness.