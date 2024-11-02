# FlexNet GX Application

FlexNet GX is a modern, serverless application that integrates multiblockchain solutions. It features a Yew-based web gx-web (WebAssembly), a mobile app structure, AWS serverless gx-lambda, and blockchain-based key management, all implemented in Rust.


## Components Overview

- **Web gx-web** (`gx-web/`): Yew-based WebAssembly application
- **Mobile App** (`gx-mobile/`): Rust-based mobile app structure for Android and iOS
- **Lambda Function** (`gx-lambda/`): AWS Lambda functions for serverless gx-lambda
- **Blockchain** (`gx-blockchain/`): Implements core blockchain functionality Integrates LayerLabs' AVS toolkit for autonomous verification

## Prerequisites

1. Rust and Cargo (latest stable version)
2. AWS CLI configured with appropriate permissions
3. Node.js and npm (for web development)
4. Wasm-pack
5. Docker (for local development)

## Quick Start

1. Clone the repository:
   ```
   git clone git@github.com:cryptoversus-io/hackathon_template.git mvp
   cd mvp
   git checkout mvp
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your specific values in `.env`
   - Run the encryption script:
     ```
     ./encrypt_env.sh
     ```
   This generates `.env.encrypted`. Keep both `.env` and `.env.encrypted` in the root directory.

3. Make deployment scripts executable:
   ```
   chmod +x <shell.sh>
   ```

4. Run the main deployment script:
   ```
   ./deploy.sh
   ```
## AWS Configuration

Ensure your AWS CLI is configured with the correct:
- Region
- S3 bucket name
- Lambda function name
- API Gateway ID
- CloudFront distribution ID

These values should be set in your encrypted `.env` file.

## Troubleshooting

1. Ensure all prerequisites are correctly installed and configured.
2. Check that the `.env` file is properly encrypted and placed in the root directory.
3. Verify AWS resource names and IDs in the encrypted `.env` file and deployment scripts.
4. For Lambda issues, ensure the IAM role has necessary permissions.
5. For AVS-related issues, refer to LayerLabs' documentation and verify proper integration.

## Contributing

For any questions or contributions, please contact @kitbaroness.

---

FlexNet GX leverages cutting-edge technologies to create a robust, secure, and efficient decentralized application ecosystem. By combining WebAssembly, serverless architecture, and advanced blockchain verification, it aims to push the boundaries of what's possible in decentralized systems.
