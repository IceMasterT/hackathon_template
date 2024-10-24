# Dockerfile for FlexNet GX with Setup Scripts
FROM rust:1.70-slim-bullseye as builder

# Set environment variables
ENV NODE_VERSION=18.x
ENV RUST_VERSION=1.70.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
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
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs \
    && npm install -g near-cli wasm-pack yarn

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# Setup Rust
RUN rustup default ${RUST_VERSION} \
    && rustup update \
    && rustup target add wasm32-unknown-unknown \
    && rustup target add x86_64-unknown-linux-musl

# Set working directory
WORKDIR /usr/src/app

# Copy setup scripts
COPY 1_setup.sh /usr/src/app/scripts/
COPY 2_setup.sh /usr/src/app/scripts/

# Make scripts executable
RUN chmod +x /usr/src/app/scripts/*.sh

# Create the project structure
RUN mkdir -p FlexNetGX \
    && cd FlexNetGX \
    && mkdir -p scripts \
    && cp /usr/src/app/scripts/*.sh scripts/ \
    && chmod +x scripts/*.sh

# Create necessary directories for Near and AWS
RUN mkdir -p ~/.near-credentials ~/.aws

# Create final image
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    nodejs \
    npm \
    curl \
    git \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /usr/local/cargo /usr/local/cargo
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /usr/src/app /app
COPY --from=builder /root/.near-credentials /root/.near-credentials
COPY --from=builder /root/.aws /root/.aws

# Set working directory
WORKDIR /app/FlexNetGX

# Set environment variables
ENV PATH="/usr/local/cargo/bin:${PATH}"
ENV RUST_VERSION=${RUST_VERSION}
ENV NODE_VERSION=${NODE_VERSION}

# Create volume for persistent data
VOLUME ["/app/data", "/root/.near-credentials", "/root/.aws"]

# Expose necessary ports
EXPOSE 3000 8080

# Entry point script
RUN echo '#!/bin/bash\n\
cd /app/FlexNetGX\n\
if [ ! -f ".env" ]; then\n\
    echo "Warning: .env file not found. Please mount your .env file."\n\
fi\n\
./scripts/1_setup.sh\n\
./scripts/2_setup.sh\n\
exec "$@"' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/bin/bash"]