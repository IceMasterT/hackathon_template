#!/bin/bash

# FlexNet GX Development Environment Setup Script
# This script sets up all necessary development tools and configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Development environment configuration
NODE_VERSION="18.x"
POSTGRESQL_VERSION="14"
RUST_VERSION="1.70.0"

# Function to check if running as root
check_root() {
    if [ "$(id -u)" -eq 0 ]; then
        echo -e "${RED}Please do not run this script as root${NC}"
        exit 1
    fi
}

# Function to check system package manager
check_package_manager() {
    if command -v apt-get >/dev/null; then
        PKG_MANAGER="apt-get"
        PKG_UPDATE="sudo apt-get update"
        PKG_INSTALL="sudo apt-get install -y"
    elif command -v yum >/dev/null; then
        PKG_MANAGER="yum"
        PKG_UPDATE="sudo yum update"
        PKG_INSTALL="sudo yum install -y"
    else
        echo -e "${RED}Unsupported package manager. Please use a Debian/RHEL based system${NC}"
        exit 1
    fi
}

# Function to install system dependencies
install_system_dependencies() {
    echo -e "${BLUE}Installing system dependencies...${NC}"
    $PKG_UPDATE
    $PKG_INSTALL \
        build-essential \
        pkg-config \
        libssl-dev \
        curl \
        wget \
        git \
        postgresql-$POSTGRESQL_VERSION \
        postgresql-contrib-$POSTGRESQL_VERSION \
        libpq-dev \
        nodejs \
        npm
}

# Function to install and configure Node.js
setup_nodejs() {
    echo -e "${BLUE}Setting up Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | sudo -E bash -
    $PKG_INSTALL nodejs
    
    # Install global npm packages
    sudo npm install -g near-cli
    sudo npm install -g wasm-pack
    sudo npm install -g yarn
}

# Function to install and configure Rust
setup_rust() {
    echo -e "${BLUE}Setting up Rust...${NC}"
    if ! command -v rustup >/dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source $HOME/.cargo/env
    fi
    
    rustup default $RUST_VERSION
    rustup update
    rustup target add wasm32-unknown-unknown
    rustup target add x86_64-unknown-linux-musl
}

# Function to setup PostgreSQL database
setup_database() {
    echo -e "${BLUE}Setting up PostgreSQL database...${NC}"
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE flexnetgx;"
    sudo -u postgres psql -c "CREATE USER flexnetgx WITH ENCRYPTED PASSWORD 'flexnetgx';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flexnetgx TO flexnetgx;"
    
    # Import database schema
    if [ -f "../FYI.sql" ]; then
        sudo -u postgres psql flexnetgx < ../FYI.sql
        echo -e "${GREEN}Database schema imported successfully${NC}"
    else
        echo -e "${RED}Warning: Database schema file (FYI.sql) not found${NC}"
    fi
}

# Function to setup Near Protocol development environment
setup_near_dev() {
    echo -e "${BLUE}Setting up Near Protocol development environment...${NC}"
    
    # Install Near CLI
    if ! command -v near >/dev/null; then
        npm install -g near-cli
    fi
    
    # Create Near Protocol test account
    echo -e "${BLUE}Setting up Near Protocol testnet account...${NC}"
    echo -e "${GREEN}Please follow these steps to create your testnet account:${NC}"
    echo "1. Visit https://wallet.testnet.near.org"
    echo "2. Create a new account"
    echo "3. Save your account credentials securely"
    
    # Initialize Near development environment
    near login
    
    # Create Near Protocol project configuration
    cat << EOF > ./neardev/config.js
export const config = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
};
EOF
}

# Function to setup AWS CLI
setup_aws() {
    echo -e "${BLUE}Setting up AWS CLI...${NC}"
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    echo -e "${GREEN}Please configure AWS CLI with your credentials:${NC}"
    aws configure
}

# Function to setup development environment variables
setup_env() {
    echo -e "${BLUE}Setting up environment variables...${NC}"
    
    # Create .env file from example if it doesn't exist
    if [ ! -f "../.env" ]; then
        cp ../.env.example ../.env
        echo -e "${GREEN}Created .env file from example${NC}"
        echo -e "${BLUE}Please update .env with your configuration values${NC}"
    fi
}

# Function to setup Git hooks
setup_git_hooks() {
    echo -e "${BLUE}Setting up Git hooks...${NC}"
    
    # Create pre-commit hook
    cat << 'EOF' > ../.git/hooks/pre-commit
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Run Rust tests
cargo test

# Check formatting
cargo fmt -- --check

# Run clippy
cargo clippy -- -D warnings

# Check Near Protocol contract
cd flexnet-gx-blockchain
cargo test
cd ..
EOF
    
    chmod +x ../.git/hooks/pre-commit
}

# Function to setup VS Code configuration
setup_vscode() {
    echo -e "${BLUE}Setting up VS Code configuration...${NC}"
    
    mkdir -p ../.vscode
    
    # Create VS Code settings
    cat << EOF > ../.vscode/settings.json
{
    "rust-analyzer.checkOnSave.command": "clippy",
    "rust-analyzer.cargo.allFeatures": true,
    "editor.formatOnSave": true,
    "[rust]": {
        "editor.defaultFormatter": "rust-lang.rust-analyzer"
    }
}
EOF
    
    # Create VS Code launch configuration
    cat << EOF > ../.vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Debug",
            "program": "\${workspaceFolder}/target/debug/flexnet-gx",
            "args": [],
            "cwd": "\${workspaceFolder}"
        }
    ]
}
EOF
}

# Main setup function
main() {
    echo -e "${BLUE}Starting FlexNet GX development environment setup...${NC}"
    
    check_root
    check_package_manager
    
    install_system_dependencies
    setup_nodejs
    setup_rust
    setup_database
    setup_near_dev
    setup_aws
    setup_env
    setup_git_hooks
    setup_vscode
    
    echo -e "${GREEN}Development environment setup completed successfully!${NC}"
    echo -e "\nNext steps:"
    echo "1. Update the .env file with your configuration"
    echo "2. Run 'yarn install' to install project dependencies"
    echo "3. Run 'cargo build' to build the project"
    echo "4. Start developing!"
}

# Run main setup
main

# Add environment to PATH
export PATH="$HOME/.cargo/bin:$PATH"
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc

echo -e "${GREEN}Setup complete! Please restart your terminal for all changes to take effect.${NC}"