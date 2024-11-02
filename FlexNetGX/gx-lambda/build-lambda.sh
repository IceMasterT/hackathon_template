#!/bin/bash

# used in AWS auto-deployment interacts with AWS REST API gateway setup linux2

cargo build --release --target x86_64-unknown-linux-musl
zip -j rust.zip ./target/x86_64-unknown-linux-musl/release/bootstrap
