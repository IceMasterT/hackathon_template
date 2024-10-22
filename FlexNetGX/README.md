# FlexNet GX Application

This is a modern, serverless application with a Yew-based web frontend (WebAssembly), 
a mobile app structure, AWS serverless backend, and Near Protocol blockchain integration,
all implemented in Rust.

## Structure

- `flexnet-gx-web/`: Yew-based web frontend (WebAssembly)
- `flexnet-gx-mobile/`: Mobile application structure
- `flexnet-gx-lambda/`: Rust-based AWS Lambda functions for serverless backend
- `flexnet-gx-blockchain/`: Near Protocol blockchain for key management and secure data storage

See individual directories for build and run instructions.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Rust and Cargo (latest stable version)
- AWS CLI (configured with appropriate credentials)
- Near CLI (for blockchain interaction)

The `deploy.sh` script will handle the installation of additional tools like wasm-pack and cargo-ndk.

## Setup and Deployment

1. Clone the repository:
   ```
   git clone git@github.com:cryptoversus-io/hackathon_templates.git redacted
   cd redacted
   git branch qe_redacted
   git checkout qe_redacted 
   ```

2. Make the deployment scripts executable:
   ```
   chmod +x scripts/deploy.sh scripts/deploy-lambda.sh
   ```

3. Run the main deployment script:
   ```
   ./scripts/deploy.sh
   ```

