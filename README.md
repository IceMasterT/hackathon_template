# FlexNet GX Application

A modern, serverless application with a Yew-based web frontend (WebAssembly), mobile app structure, AWS serverless backend, and Near Protocol blockchain integration, all implemented in Rust.

## Quick Start

```bash
git clone git@github.com:cryptoversus-io/hackathon_templates.git redacted
cd redacted
git branch qe_redacted
git checkout qe_redacted

# Make setup scripts executable
chmod +x scripts/1_setup.sh scripts/2_setup.sh

# Run setup scripts in order
./scripts/1_setup.sh
./scripts/2_setup.sh
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

## Scripts Usage

All scripts are located in the `scripts/` directory:

### 1. Development Environment Setup
```bash
chmod +x scripts/1_setup.sh
./scripts/1_setup.sh

chmod +x scripts/2_setup.sh
./scripts/2_setup.sh
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


--------------------------------

# Complete UNsterlink Cleanup Instructions
### To use this script:

-Save it as cleanup.sh in the scripts directory
-Make it executable:
```
chmod +x scripts/cleanup.sh
```
Run it:
```
./scripts/cleanup.sh
```
## Binary Locations and Build Artifacts
1. Main Project Binaries:
   - `FlexNetGX/target/`: Main Rust compilation directory
   - `FlexNetGX/target/release/`: Release builds
   - `FlexNetGX/target/debug/`: Debug builds
   - `FlexNetGX/target/wasm32-unknown-unknown/`: WebAssembly builds
   - `FlexNetGX/target/x86_64-unknown-linux-musl/`: Lambda builds

2. Component-specific Binaries:
   - `FlexNetGX/flexnet-gx-web/target/`: Web frontend builds
   - `FlexNetGX/flexnet-gx-web/pkg/`: WebAssembly package output
   - `FlexNetGX/flexnet-gx-mobile/target/`: Mobile app builds
   - `FlexNetGX/flexnet-gx-lambda/target/`: Lambda function builds
   - `FlexNetGX/flexnet-gx-blockchain/target/`: Near Protocol contract builds

## System-Level Cleanup

### 1. Package Dependencies
```bash
# Remove all build dependencies
sudo apt-get remove --purge -y \
    build-essential \
    pkg-config \
    libssl-dev \
    curl \
    wget \
    git \
    libsqlite3-dev \
    nodejs \
    npm \
    musl-tools \
    cmake \
    pkg-config \
    libssl-dev \
    zlib1g-dev

# For yum-based systems:
sudo yum remove -y \
    gcc \
    gcc-c++ \
    make \
    openssl-devel \
    curl \
    wget \
    git \
    sqlite-devel \
    nodejs \
    npm \
    musl-tools \
    cmake \
    zlib-devel

# Remove orphaned packages
sudo apt-get autoremove -y
sudo apt-get clean
# Or for yum:
sudo yum autoremove -y
sudo yum clean all
```

### 2. Development Tools
```bash
# Remove Rust and all its components
rustup self uninstall -y

# Remove rustup hidden directory
rm -rf ~/.rustup/

# Remove cargo hidden directory
rm -rf ~/.cargo/

# Remove Node.js and global packages
sudo npm uninstall -g near-cli wasm-pack yarn typescript webpack webpack-cli
sudo apt-get remove --purge nodejs npm
# Or for yum:
sudo yum remove nodejs npm

# Remove npm cache and config
rm -rf ~/.npm
rm -rf ~/.node-gyp
rm ~/.npmrc

# Remove AWS CLI and configuration
sudo rm -rf /usr/local/aws-cli
sudo rm /usr/local/bin/aws
sudo rm /usr/local/bin/aws_completer
rm -rf ~/.aws/

# Remove SQLite
sudo apt-get remove --purge sqlite3 libsqlite3-dev
# Or for yum:
sudo yum remove sqlite sqlite-devel
```

### 3. Project-Specific Cleanup
```bash
# Remove all build artifacts
cd FlexNetGX
find . -name "target" -type d -exec rm -rf {} +
find . -name "pkg" -type d -exec rm -rf {} +
find . -name "dist" -type d -exec rm -rf {} +
find . -name "node_modules" -type d -exec rm -rf {} +

# Remove temporary files
find . -name "*.rs.bk" -type f -delete
find . -name "*.wasm" -type f -delete
find . -name "*.d.ts" -type f -delete
find . -name "*.js.map" -type f -delete
find . -name ".DS_Store" -type f -delete

# Remove configuration files
rm -rf .vscode/
rm -rf .idea/
rm -rf .git/
rm -f .gitignore
rm -f .env*
rm -f Cargo.lock
rm -f yarn.lock
rm -f package-lock.json
```

### 4. Near Protocol Environment
```bash
# Remove Near credentials and configs
rm -rf ~/.near-credentials/
rm -rf neardev/
rm -f ~/.near-config.json

# Clean Near CLI cache
rm -rf ~/.near-cli/
```

### 5. System Configuration Cleanup
```bash
# Remove environment variables from shell configs
sed -i '/export PATH="$HOME\/.cargo\/bin:$PATH"/d' ~/.bashrc
sed -i '/export PATH="$HOME\/.cargo\/bin:$PATH"/d' ~/.zshrc
sed -i '/NEAR_ENV/d' ~/.bashrc
sed -i '/NEAR_ENV/d' ~/.zshrc

# Remove any added PPAs or repositories
sudo rm -f /etc/apt/sources.list.d/nodesource.list
# Or for yum:
sudo rm -f /etc/yum.repos.d/nodesource-*.repo

# Clear system caches
sudo rm -rf /var/cache/apt/archives/*
# Or for yum:
sudo rm -rf /var/cache/yum/*
```

### 6. Docker Cleanup (if used)
```bash
# Remove Docker images
docker rmi $(docker images | grep 'flexnet-gx' | awk '{print $3}')

# Remove Docker containers
docker rm $(docker ps -a | grep 'flexnet-gx' | awk '{print $1}')

# Remove Docker volumes
docker volume rm $(docker volume ls | grep 'flexnet-gx' | awk '{print $2}')
```

### 7. Cloud Resource Cleanup

#### AWS Resources
```bash
# List and delete Lambda functions
aws lambda list-functions | grep flexnet-gx
aws lambda delete-function --function-name flexnet-gx-lambda

# Empty and delete S3 bucket
aws s3 rm s3://your-bucket-name --recursive
aws s3 rb s3://your-bucket-name

# Delete CloudFront distribution
aws cloudfront delete-distribution --id your-distribution-id

# Delete API Gateway
aws apigateway delete-rest-api --rest-api-id your-api-id
```

#### Near Protocol Resources
```bash
# Delete testnet contract
near delete contract.testnet contract.testnet

# Remove local Near development files
rm -rf ~/.near
```

### 8. Complete Project Removal
```bash
# Navigate up and remove entire project
cd ../
rm -rf FlexNetGX/

# Remove any backup files
rm -rf FlexNetGX.backup/
rm -f FlexNetGX*.tar.gz
```

### 9. Verify Cleanup
```bash
# Check for any remaining processes
ps aux | grep -i "flexnet-gx"

# Check for remaining files in home directory
find ~/ -name "*flexnet-gx*" -type f
find ~/ -name "*unsterlink*" -type f

# Check for remaining Docker artifacts
docker ps -a | grep flexnet-gx
docker images | grep flexnet-gx
docker volume ls | grep flexnet-gx

# Check for remaining system services
systemctl list-units | grep -i "flexnet-gx"
```

## Additional Cleanup Notes

1. **Hidden Files**:
   - Check for hidden directories in home: `ls -la ~/.*flexnet*`
   - Check for hidden configurations: `find ~/ -type f -name ".*flexnet*"`

2. **System Logs**:
   - Clear related system logs: `sudo journalctl --vacuum-time=1s`
   - Check `/var/log/` for any remaining log files

3. **Database**:
   - Ensure all SQLite database files are removed: `find / -name "unsterlink.db" 2>/dev/null`
   - Check for any backup database files: `find / -name "unsterlink.db.*" 2>/dev/null`

4. **Temporary Files**:
   - Clean temp directories: `find /tmp -name "*flexnet*" -exec rm -rf {} +`
   - Clean user cache: `rm -rf ~/.cache/*flexnet*`

Remember to:
1. Back up any important data before running these commands
2. Run commands with appropriate permissions
3. Verify cloud resource deletion to avoid ongoing charges
4. Log out and back in (or restart) after cleanup to ensure all changes take effect