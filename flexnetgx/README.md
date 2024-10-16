# FlexNet GX Application

FlexNet GX is a modern, serverless application that integrates the AVS (Autonomous Verifier Service) toolkit from LayerLabs. It features a Yew-based web frontend (WebAssembly), a mobile app structure, AWS serverless backend, and blockchain-based key management, all implemented in Rust.

## Project Structure

```
LAYER/
└── flexnetgx/
    └── FlexNetGX/
        ├── flexnet-gx-lambda/
        ├── flexnet-gx-mobile/
        ├── flexnet-gx-web/
        ├── flexnet-gx-blockchain/
        ├── flexnetgx-avs/
        ├── .env
        ├── .env.encrypted
        ├── .env.example
        ├── deploy.sh
        ├── deploy-lambda.sh
        ├── encrypt_env.sh
        ├── README.md
        └── Unster.md
```

## Components Overview

- **Web Frontend** (`flexnet-gx-web/`): Yew-based WebAssembly application
- **Mobile App** (`flexnet-gx-mobile/`): Rust-based mobile app structure for Android and iOS
- **Lambda Function** (`flexnet-gx-lambda/`): AWS Lambda functions for serverless backend
- **Blockchain** (`flexnet-gx-blockchain/`): Implements core blockchain functionality Integrates LayerLabs' AVS toolkit for autonomous verification

## Prerequisites

1. Rust and Cargo (latest stable version)
2. AWS CLI configured with appropriate permissions
3. Node.js and npm (for web development)
4. Wasm-pack
5. Docker (for local development)
6. Rust components for AVS:
   - `wasm32-wasip1` target
   - `cargo-component` and `wkg` CLIs

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
   This generates `.env.encrypted`. Keep both `.env` and `.env.encrypted` in the root directory.

3. Install Rust components for AVS:
   ```
   rustup target add wasm32-wasip1
   cargo install cargo-component wkg
   wkg config --default-registry wa.dev
   ```

4. Make deployment scripts executable:
   ```
   chmod +x deploy.sh deploy-lambda.sh
   ```

5. Run the main deployment script:
   ```
   ./deploy.sh
   ```

## Detailed Setup and Deployment

The `deploy.sh` script automates the following:

1. Installs necessary tools and dependencies
2. Builds all components:
   - AVS component
   - Web frontend
   - Mobile app
   - Lambda function
3. Deploys the web frontend to AWS S3
4. Deploys the Lambda function
5. Updates the API Gateway

To deploy only the Lambda function:
```
./deploy-lambda.sh
```

## AWS Configuration

Ensure your AWS CLI is configured with the correct:
- Region
- S3 bucket name
- Lambda function name
- API Gateway ID
- CloudFront distribution ID

These values should be set in your encrypted `.env` file.

## LayerLabs' AVS Toolkit Integration

The AVS (Autonomous Verifier Service) toolkit, developed by LayerLabs, is integrated into our application to provide advanced blockchain verification capabilities. Key features include:

1. Decentralized verification of blockchain data and transactions
2. Enhanced security through cryptographic proofs
3. Scalable verification for high-throughput blockchain operations
4. Interoperability with various blockchain networks
5. Customizable verification logic

The AVS component is located in the `flexnetgx-avs/` directory and is built as part of the deployment process.

## Troubleshooting

1. Ensure all prerequisites are correctly installed and configured.
2. Check that the `.env` file is properly encrypted and placed in the root directory.
3. Verify AWS resource names and IDs in the encrypted `.env` file and deployment scripts.
4. For Lambda issues, ensure the IAM role has necessary permissions.
5. For AVS-related issues, refer to LayerLabs' documentation and verify proper integration.

## Contributing

Please read `Unster.md` for details on our code of conduct and the process for submitting pull requests.

For any questions or contributions, please contact @kitbaroness.

---

FlexNet GX leverages cutting-edge technologies including LayerLabs' AVS toolkit to create a robust, secure, and efficient decentralized application ecosystem. By combining WebAssembly, serverless architecture, and advanced blockchain verification, it aims to push the boundaries of what's possible in decentralized systems.