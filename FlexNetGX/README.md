# FlexNet GX Application

This is a modern, serverless application with a Yew-based web frontend (WebAssembly), 
a mobile app structure, AWS serverless backend, and blockchain-based key management,
all implemented in Rust.

## Structure

- `flexnet-gx-web/`: Yew-based web frontend (WebAssembly)
- `flexnet-gx-mobile/`: Mobile application structure
- `flexnet-gx-lambda/`: Rust-based AWS Lambda functions for serverless backend
- `flexnet-gx-blockchain/`: Solana-based blockchain for key management and secure data storage

See individual directories for build and run instructions.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Rust and Cargo (latest stable version)
- AWS CLI (configured with appropriate credentials)

The `deploy.sh` script will handle the installation of additional tools like wasm-pack and cargo-ndk.

## Setup and Deployment

1. Clone the repository:
   ```
   git clone https://github.com/your-username/FlexNetGX.git
   cd FlexNetGX
   ```

2. Make the deployment scripts executable:
   ```
   chmod +x deploy.sh deploy-lambda.sh
   ```

3. Run the main deployment script:
   ```
   ./deploy.sh
   ```

This script will:
- Check for and install necessary tools (wasm-pack, cargo-ndk)
- Install required Rust targets
- Build the blockchain core
- Build and deploy the web frontend to AWS S3
- Build the mobile app (Android and iOS)
- Build and deploy the Lambda function
- Update the API Gateway

## AWS Configuration

Before running the deployment script, ensure your AWS CLI is configured with the correct:
- Region
- S3 bucket name
- Lambda function name
- API Gateway ID
- CloudFront distribution ID

These values should be updated in the `deploy.sh` and `deploy-lambda.sh` scripts if they differ from the defaults.

## Component Overview

### Blockchain Core
Located in `flexnet-gx-blockchain/`, this component implements the core blockchain functionality.

### Web Frontend
The `flexnet-gx-web/` directory contains a Yew-based web frontend compiled to WebAssembly.

### Mobile App
Found in `flexnet-gx-mobile/`, this structure is set up for both Android and iOS app development.

### Lambda Function
The `flexnet-gx-lambda/` directory contains the Rust-based AWS Lambda functions for the serverless backend.

## Lambda Function Deployment

The `deploy-lambda.sh` script automates the process of building, packaging, and deploying the Rust-based Lambda function.

### Script Location
The `deploy-lambda.sh` script is located in the root directory of the project, alongside the main `deploy.sh` script.

### Functionality
1. **Configuration**: Sets up variables for the Lambda function name, ARN, runtime, handler, and IAM role.

2. **Build Process**:
   - Navigates to the `flexnet-gx-lambda` directory.
   - Builds the Rust project for the Lambda environment using the `x86_64-unknown-linux-musl` target.
   - Packages the compiled binary into a zip file.

3. **Deployment**:
   - Updates the Lambda function's configuration (runtime, handler, and IAM role) using AWS CLI.
   - Uploads the new code (zip file) to the Lambda function.

4. **Verification**:
   - Retrieves and displays the updated function information for verification.

### Customization
Before running the script, ensure that the following variables in `deploy-lambda.sh` are updated to match your AWS setup:
- `LAMBDA_FUNCTION_NAME`
- `LAMBDA_FUNCTION_ARN`
- `LAMBDA_ROLE_NAME`
- `LAMBDA_ROLE_ARN`

## Troubleshooting

If you encounter issues during deployment:

1. Ensure AWS CLI is properly configured with the necessary permissions.
2. Check the console output for specific error messages.
3. Verify that all AWS resource names and IDs in `deploy.sh` and `deploy-lambda.sh` are correct for your account.
4. For Lambda-specific issues:
   - Check that your AWS CLI is correctly configured.
   - Ensure the IAM role has necessary permissions for Lambda execution.
   - Verify that the function name and ARN are correct in your AWS account.
5. For component-specific issues, check the respective directories for any README or log files.

## Manual Deployment Steps

While the `deploy.sh` script automates most of the process, you can manually deploy components if needed:

### Web Frontend
Navigate to `flexnet-gx-web/` and run:
```
wasm-pack build --target web --out-name flexnet_gx_web
aws s3 sync ./pkg s3://your-bucket-name/web --delete
```

### Lambda Function
Navigate to `flexnet-gx-lambda/` and run:
```
cargo build --release --target x86_64-unknown-linux-musl
zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap
aws lambda update-function-code --function-name your-function-name --zip-file fileb://rust.zip
```

To find Lambda Roles
```
aws iam list-roles | grep "RoleName.*lambda"
```
# NEXT >> Go to the README.md in folder 'flexnet-gx-web'

## Contributing
Feel free to reach out to @kitbaroness

