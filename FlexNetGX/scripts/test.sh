    # FlexNet GX Testing Suite
    #!/bin/bash

# FlexNet GX Testing Suite
# Comprehensive testing script for all components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test environment configuration
export NODE_ENV=test
export NEAR_ENV=testnet

# Load environment variables
if [ ! -f "../.env" ]; then
    echo -e "${RED}Error: .env file not found in parent directory${NC}"
    exit 1
fi
source ../.env

# Function to run Near Protocol contract tests
test_near_contract() {
    echo -e "\n${BLUE}Testing Near Protocol Smart Contract...${NC}"
    cd ../flexnet-gx-blockchain

    echo "Running unit tests..."
    cargo test -- --nocapture

    echo "Running integration tests..."
    cargo test --features integration-tests -- --nocapture

    # Deploy to testnet for end-to-end testing
    if [ "$RUN_E2E" = true ]; then
        echo "Deploying to testnet for E2E testing..."
        near dev-deploy --wasmFile target/wasm32-unknown-unknown/release/flexnet_gx_blockchain.wasm
    fi

    cd ../scripts
}

# Function to test Lambda functions
test_lambda() {
    echo -e "\n${BLUE}Testing AWS Lambda Functions...${NC}"
    cd ../flexnet-gx-lambda

    echo "Running unit tests..."
    cargo test -- --nocapture

    if [ "$RUN_E2E" = true ]; then
        echo "Running integration tests with AWS..."
        # Test against real AWS services
        cargo test --features integration-tests -- --nocapture
    fi

    cd ../scripts
}

# Function to test frontend
test_frontend() {
    echo -e "\n${BLUE}Testing Frontend Components...${NC}"
    cd ../flexnet-gx-web

    echo "Running unit tests..."
    wasm-pack test --node

    if [ "$RUN_E2E" = true ]; then
        echo "Running E2E tests..."
        wasm-pack test --headless --firefox
    fi

    cd ../scripts
}

# Function to run database tests
test_database() {
    echo -e "\n${BLUE}Testing Database Operations...${NC}"
    
    # Test database migrations
    echo "Testing database migrations..."
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -f ../tests/db/migrations_test.sql

    # Test database queries
    echo "Testing database queries..."
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -f ../tests/db/queries_test.sql
}

# Function to test API endpoints
test_api() {
    echo -e "\n${BLUE}Testing API Endpoints...${NC}"
    
    if [ "$RUN_E2E" = true ]; then
        # Test actual API endpoints
        echo "Testing live API endpoints..."
        curl -s "$API_ENDPOINT/health" || echo "API health check failed"
    else
        # Run mock API tests
        echo "Running mock API tests..."
        cd ../tests/api
        node run_api_tests.js
        cd ../../scripts
    fi
}

# Function to run security tests
run_security_tests() {
    echo -e "\n${BLUE}Running Security Tests...${NC}"

    # Check for known vulnerabilities
    echo "Checking dependencies for vulnerabilities..."
    cargo audit

    # Run OWASP ZAP if installed
    if command -v zap-cli &> /dev/null; then
        echo "Running OWASP ZAP scan..."
        zap-cli quick-scan --self-contained --spider -r "$API_ENDPOINT"
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "\n${BLUE}Running Performance Tests...${NC}"

    # Test Near Protocol contract performance
    echo "Testing contract performance..."
    cd ../flexnet-gx-blockchain
    cargo bench
    cd ../scripts

    # Test API performance with Apache Bench
    if command -v ab &> /dev/null; then
        echo "Running API performance tests..."
        ab -n 1000 -c 10 "$API_ENDPOINT/health"
    fi
}

# Function to generate test reports
generate_test_report() {
    echo -e "\n${BLUE}Generating Test Reports...${NC}"
    
    REPORT_DIR="../test-reports"
    mkdir -p "$REPORT_DIR"

    # Collect all test results
    echo "Test Report - $(date)" > "$REPORT_DIR/test_report.txt"
    echo "===================" >> "$REPORT_DIR/test_report.txt"
    
    # Add test results to report
    find ../ -name "*.test-results" -exec cat {} \; >> "$REPORT_DIR/test_report.txt"

    # Generate coverage report
    if [ "$GENERATE_COVERAGE" = true ]; then
        echo "Generating coverage report..."
        cargo tarpaulin --out Html --output-dir "$REPORT_DIR/coverage"
    fi
}

# Function to run cleanup after tests
cleanup_test_environment() {
    echo -e "\n${BLUE}Cleaning up test environment...${NC}"
    
    # Clean up test database
    PGPASSWORD=flexnetgx psql -U flexnetgx -d flexnetgx -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

    # Remove test contracts from testnet
    if [ "$RUN_E2E" = true ]; then
        near delete test.near
    fi

    # Clean up test artifacts
    rm -rf ../target/debug/deps/test*
}

# Main test execution function
run_tests() {
    echo -e "${BLUE}Starting FlexNet GX Test Suite...${NC}"
    
    # Parse command line arguments
    RUN_E2E=false
    GENERATE_COVERAGE=false
    
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --e2e) RUN_E2E=true ;;
            --coverage) GENERATE_COVERAGE=true ;;
            *) echo "Unknown parameter: $1"; exit 1 ;;
        esac
        shift
    done

    # Run all tests
    test_near_contract
    test_lambda
    test_frontend
    test_database
    test_api
    run_security_tests
    run_performance_tests

    # Generate reports
    generate_test_report

    # Cleanup
    cleanup_test_environment

    echo -e "${GREEN}All tests completed successfully!${NC}"
}

# Show test suite usage
show_usage() {
    echo -e "Usage: $0 [options]"
    echo -e "Options:"
    echo -e "  --e2e        Run end-to-end tests"
    echo -e "  --coverage   Generate coverage reports"
    echo -e "Example: $0 --e2e --coverage"
}

# Main execution
if [ "$1" == "--help" ]; then
    show_usage
else
    run_tests "$@"
fi
