#!/bin/bash

# UNsterlink Complete Cleanup Script
# Based on official FlexNet GX Application cleanup instructions

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect package manager
detect_package_manager() {
    if command_exists apt-get; then
        echo "apt"
    elif command_exists yum; then
        echo "yum"
    else
        echo "unknown"
    fi
}

# Function to ask for confirmation
confirm() {
    read -p "$(echo -e $YELLOW"$1"$NC) [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to cleanup package dependencies
cleanup_packages() {
    local pkg_manager=$(detect_package_manager)
    log "Cleaning up package dependencies..."

    case "$pkg_manager" in
        "apt")
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

            sudo apt-get autoremove -y
            sudo apt-get clean
            ;;
        "yum")
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

            sudo yum autoremove -y
            sudo yum clean all
            ;;
    esac
}

# Function to cleanup development tools
cleanup_dev_tools() {
    log "Cleaning up development tools..."

    # Rust cleanup
    if command_exists rustup; then
        rustup self uninstall -y
    fi
    rm -rf ~/.rustup/
    rm -rf ~/.cargo/

    # Node.js cleanup
    if command_exists npm; then
        sudo npm uninstall -g near-cli wasm-pack yarn typescript webpack webpack-cli
    fi
    sudo apt-get remove --purge nodejs npm 2>/dev/null || sudo yum remove nodejs npm
    rm -rf ~/.npm
    rm -rf ~/.node-gyp
    rm -f ~/.npmrc

    # AWS CLI cleanup
    sudo rm -rf /usr/local/aws-cli
    sudo rm -f /usr/local/bin/aws
    sudo rm -f /usr/local/bin/aws_completer
    rm -rf ~/.aws/

    # SQLite cleanup
    sudo apt-get remove --purge sqlite3 libsqlite3-dev 2>/dev/null || sudo yum remove sqlite sqlite-devel
}

# Function to cleanup project binaries
cleanup_project_binaries() {
    log "Cleaning up project binaries..."

    # Main project binaries
    local binary_paths=(
        "target/"
        "target/release/"
        "target/debug/"
        "target/wasm32-unknown-unknown/"
        "target/x86_64-unknown-linux-musl/"
        "flexnet-gx-web/target/"
        "flexnet-gx-web/pkg/"
        "flexnet-gx-mobile/target/"
        "flexnet-gx-lambda/target/"
        "flexnet-gx-blockchain/target/"
    )

    for path in "${binary_paths[@]}"; do
        rm -rf "FlexNetGX/$path" 2>/dev/null || true
    done
}

# Function to cleanup project files
cleanup_project_files() {
    log "Cleaning up project files..."

    cd FlexNetGX 2>/dev/null || return 0

    # Remove build artifacts
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
    rm -rf .vscode/ .idea/ .git/
    rm -f .gitignore .env* Cargo.lock yarn.lock package-lock.json

    cd ..
}

# Function to cleanup Near Protocol environment
cleanup_near() {
    log "Cleaning up Near Protocol environment..."

    rm -rf ~/.near-credentials/
    rm -rf neardev/
    rm -f ~/.near-config.json
    rm -rf ~/.near-cli/
    rm -rf ~/.near
}

# Function to cleanup system configuration
cleanup_system_config() {
    log "Cleaning up system configuration..."

    # Remove environment variables
    sed -i '/export PATH="$HOME\/.cargo\/bin:$PATH"/d' ~/.bashrc
    sed -i '/export PATH="$HOME\/.cargo\/bin:$PATH"/d' ~/.zshrc
    sed -i '/NEAR_ENV/d' ~/.bashrc
    sed -i '/NEAR_ENV/d' ~/.zshrc

    # Remove PPAs and repositories
    sudo rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
    sudo rm -f /etc/yum.repos.d/nodesource-*.repo 2>/dev/null || true

    # Clear system caches
    sudo rm -rf /var/cache/apt/archives/* 2>/dev/null || true
    sudo rm -rf /var/cache/yum/* 2>/dev/null || true
}

# Function to cleanup Docker resources
cleanup_docker() {
    if command_exists docker; then
        log "Cleaning up Docker resources..."

        docker ps -a | grep 'flexnet-gx' | awk '{print $1}' | xargs -r docker rm -f
        docker images | grep 'flexnet-gx' | awk '{print $3}' | xargs -r docker rmi -f
        docker volume ls | grep 'flexnet-gx' | awk '{print $2}' | xargs -r docker volume rm
    fi
}

# Function to cleanup cloud resources
cleanup_cloud_resources() {
    if command_exists aws && confirm "Do you want to cleanup AWS resources?"; then
        log "Cleaning up AWS resources..."

        aws lambda list-functions | grep flexnet-gx
        aws lambda delete-function --function-name flexnet-gx-lambda || true

        if [ ! -z "$S3_BUCKET" ]; then
            aws s3 rm "s3://$S3_BUCKET" --recursive || true
            aws s3 rb "s3://$S3_BUCKET" || true
        fi

        if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
            aws cloudfront delete-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" || true
        fi

        if [ ! -z "$API_GATEWAY_ID" ]; then
            aws apigateway delete-rest-api --rest-api-id "$API_GATEWAY_ID" || true
        fi
    fi

    if command_exists near && confirm "Do you want to cleanup Near Protocol resources?"; then
        log "Cleaning up Near Protocol resources..."
        near delete contract.testnet contract.testnet || true
    fi
}

# Function to cleanup hidden and temporary files
cleanup_hidden_files() {
    log "Cleaning up hidden and temporary files..."

    # Hidden files
    find ~/ -name ".*flexnet*" -type f -delete
    find ~/ -name ".*unsterlink*" -type f -delete

    # System logs
    sudo journalctl --vacuum-time=1s || true
    
    # Temporary files
    find /tmp -name "*flexnet*" -exec rm -rf {} +
    rm -rf ~/.cache/*flexnet*
}

# Function to verify cleanup
verify_cleanup() {
    log "Verifying cleanup..."

    # Check processes
    ps aux | grep -i "flexnet-gx" | grep -v grep || true

    # Check files
    local files=$(find ~/ -name "*flexnet-gx*" -o -name "*unsterlink*" 2>/dev/null)
    if [ ! -z "$files" ]; then
        log "Found remaining files:"
        echo "$files"
    fi

    # Check Docker
    if command_exists docker; then
        docker ps -a | grep flexnet-gx || true
        docker images | grep flexnet-gx || true
        docker volume ls | grep flexnet-gx || true
    fi

    # Check services
    systemctl list-units | grep -i "flexnet-gx" || true
}

# Main cleanup function
main() {
    echo -e "${RED}WARNING: This script will remove all UNsterlink/FlexNet GX components${NC}"
    echo -e "${RED}Please ensure you have backed up any important data before proceeding${NC}"

    if ! confirm "Do you want to proceed with the cleanup?"; then
        echo "Cleanup cancelled"
        exit 0
    fi

    # Create cleanup log
    local log_file="unsterlink_cleanup_$(date +%Y%m%d_%H%M%S).log"
    exec 3>&1 4>&2
    trap 'exec 2>&4 1>&3' 0 1 2 3
    exec 1>"$log_file" 2>&1

    log "Starting UNsterlink cleanup..."

    cleanup_packages
    cleanup_dev_tools
    cleanup_project_binaries
    cleanup_project_files
    cleanup_near
    cleanup_system_config
    cleanup_docker
    cleanup_cloud_resources
    cleanup_hidden_files

    # Final project removal
    cd ..
    rm -rf FlexNetGX/ FlexNetGX.backup/
    rm -f FlexNetGX*.tar.gz

    verify_cleanup

    log "Cleanup completed. Log saved to: $log_file"
    echo -e "${YELLOW}Please log out and back in (or restart) to ensure all changes take effect${NC}"
}

# Run main function
main "$@"