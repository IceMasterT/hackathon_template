# QE Protype on AWS

This project implements a serverless web application using AWS services, including S3 for static file hosting, CloudFront for content delivery, API Gateway for API management, and Lambda for serverless compute. The project uses a CI/CD pipeline for automated deployments.


## Setup

Detailed AWS setup instructions are available in `aws/README.md`. This includes:
- S3 bucket creation and configuration
- CloudFront distribution setup
- SSL certificate request and validation
- DNS configuration
- IAM user and policy setup for CI/CD

**CloudFront Configuration**

To update the CloudFront distribution with API Gateway integration:
1. Update API Gateway domain in `aws/update-cloudfront.sh`
2. Run the script:
```
./aws/update-cloudfront.sh
```

### Static Files
- Automatically deployed to S3 when changes are pushed to the `Prototype` branch
- Workflow: `.github/workflows/s3-sync.yml`
- CloudFront distribution is invalidated after deployment

### Lambda Functions
- Automatically built and deployed when changes are pushed to `lambda_functions/`
- Workflow: `.github/workflows/deploy-lambda.yml`
- New functions are created, existing ones are updated
- API Gateway is automatically configured for new functions

## Development

### Lambda Function
1. Edit the newly created function in `lambda_functions/<function-name>/`
2. Push changes to the `Prototype` branch to trigger deployment

### Static Files
1. Edit files in the `static/` directory
2. Push changes to the `Prototype` branch to trigger deployment

## Testing

- Static files [static/index.html](static/index.html) --> [https://qe.unster.net/index.html](https://qe.unster.net/index.html)

```
└─$ curl "https://qe.unster.net/index.html"
200 OK :-)
```

- Lambda function [lambda_functions/hello-world/src/main.rs](lambda_functions/hello-world/src/main.rs) 

```
└─$ curl "https://qe.unster.net/api/hello-world?name=Rust"                   
{"message":"Hello, Rust! "}
```
