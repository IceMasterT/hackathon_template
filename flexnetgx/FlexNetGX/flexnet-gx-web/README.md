# FlexNetGX Web Frontend

This directory contains the web frontend for the FlexNetGX application, built using Yew and WebAssembly.

## Directory Structure

```
flexnet-gx-web/
├── pkg/                 # Output directory for WebAssembly build
├── src/                 # Source code
├── .gitignore
├── build.sh             # Build script
├── Cargo.lock
├── Cargo.toml           # Rust dependencies and project config
├── index.html           # HTML entry point
├── README.md            # This file
└── .env                 # Environment variables for web frontend
```

## Prerequisites

- Rust and Cargo (latest stable version)
- wasm-pack: `cargo install wasm-pack`
- Node.js and npm (for serving the application locally)

## Setup

1. Ensure you're in the `flexnet-gx-web` directory:
   ```
   cd path/to/FlexNetGX/flexnet-gx-web
   ```

2. Install dependencies:
   ```
   cargo build
   ```

3. Copy the `.env.example` file (from the root directory) to `.env` and fill in any necessary environment variables for the web frontend.

## Building

To build the WebAssembly package:

```
./build.sh
```

This script uses `wasm-pack` to compile the Rust code to WebAssembly and generate JavaScript bindings.

## Development

1. Start a local development server (you may need to install a simple HTTP server like `http-server`):
   ```
   npx http-server .
   ```

2. Open your browser and navigate to `http://localhost:8080` (or the port specified by your HTTP server).

3. Make changes to the Rust code in the `src/` directory. Rebuild using `./build.sh` to see your changes.

## Testing

Run unit tests with:

```
cargo test
```

For integration tests involving WebAssembly, you may need to use `wasm-pack test --chrome` or similar, depending on your setup.

## Deployment

The main `deploy.sh` script in the root directory handles deployment of the web frontend. It typically involves copying the contents of the `pkg/` directory to an S3 bucket or similar hosting service.

## Environment Variables

Any environment-specific configuration should be placed in the `.env` file. Be sure not to commit this file to version control.

## Troubleshooting

- If you encounter issues with WebAssembly compilation, ensure your Rust toolchain is up to date: `rustup update`
- For Yew-specific problems, consult the [Yew documentation](https://yew.rs/docs/getting-started/introduction)
- If the build script fails, check that `wasm-pack` is correctly installed and in your PATH

## Contributing

Please read the main contributing guidelines in the root README.md file. For web-specific contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request with a clear description of your changes

For any questions or issues specific to the web frontend, please contact the maintainers or open an issue in the project repository.