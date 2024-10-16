use lambda_http::{run, service_fn, Body, Error, Request, Response};
use aws_sdk_s3::Client;
use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::primitives::ByteStream;
use http::StatusCode;
use tracing::{error, info};

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-2");
    let config = aws_config::from_env().region(region_provider).load().await;
    let s3_client = Client::new(&config);

    info!("Received request: {:?}", event);

    if event.method() != http::Method::PUT {
        error!("Method not allowed: {:?}", event.method());
        return Ok(Response::builder()
            .status(StatusCode::METHOD_NOT_ALLOWED)
            .body(Body::from("Method not allowed"))
            .unwrap());
    }

    if let Some(file_name) = event.uri().path().strip_prefix("/") {
        let key = format!("test/{}", file_name);
        let body = event.body();

        info!("Attempting to upload file: {} to S3", key);

        let byte_stream = match body {
            Body::Text(text) => ByteStream::from(text.as_bytes().to_vec()),
            Body::Binary(bytes) => ByteStream::from(bytes.to_vec()),
            _ => {
                error!("Unsupported body type");
                return Ok(Response::builder()
                    .status(StatusCode::BAD_REQUEST)
                    .body(Body::from("Unsupported body type"))
                    .unwrap());
            }
        };

        match s3_client.put_object()
            .bucket("qe-unster-net-static")
            .key(&key)
            .body(byte_stream)
            .send()
            .await
        {
            Ok(_) => {
                info!("File uploaded successfully: {}", key);
                Ok(Response::builder()
                    .status(StatusCode::OK)
                    .body(Body::from("File uploaded successfully"))
                    .unwrap())
            },
            Err(e) => {
                error!("Error uploading file to S3: {:?}", e);
                Ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::from(format!("Error uploading file: {:?}", e)))
                    .unwrap())
            },
        }
    } else {
        error!("Invalid file path: {:?}", event.uri().path());
        Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Body::from("Invalid file path"))
            .unwrap())
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}


