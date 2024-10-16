# AWS Static Files Setup Guide

This guide outlines the steps to set up a static website using Amazon S3, CloudFront, and Route 53 in CI/CD pipeline.

## 1. Create S3 Bucket

Create an S3 bucket to host your static files:

```bash
aws s3api create-bucket --bucket qe-unster-net-static --region us-east-2 --create-bucket-configuration LocationConstraint=us-east-2
```

Configure the bucket for static files hosting:

```bash
aws s3 website s3://qe-unster-net-static --index-document index.html --error-document error.html
```

## 2. Set Up CloudFront Origin Access Identity (OAI)

Create a CloudFront Origin Access Identity:

```bash
aws cloudfront create-cloud-front-origin-access-identity --cloud-front-origin-access-identity-config "CallerReference=qe-unster-net-static,Comment=OAI for qe.unster.net"
```

## 3. Configure S3 Bucket Policy

Apply a bucket policy to allow CloudFront access:

```bash
aws s3api put-bucket-policy --bucket qe-unster-net-static --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::qe-unster-net-static/static/*"
        }
    ]
}'
```

## 4. Request SSL Certificate

Request an SSL certificate for your domain:

```bash
aws acm request-certificate \
  --domain-name qe.unster.net \
  --validation-method DNS \
  --region us-east-1
```

## 5. Validate SSL Certificate

Describe the certificate to get validation details:

```bash
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:716985456551:certificate/6e865581-9274-4337-be33-38b1cece537a" \
  --region us-east-1
```

Add the CNAME record to Route 53 for certificate validation:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10447571LEGQU3F2719Y \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "_e67e58360cd8daf99fa6d16d3a5c37d2.qe.unster.net.",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "_72c9e5af480ae2bb2ae93d29f5c7a25b.djqtsrsxkq.acm-validations.aws."}]
        }
      }
    ]
  }'
```

## 6. Create CloudFront Distribution

Create a CloudFront distribution:

```bash
aws cloudfront create-distribution --distribution-config '{
    "CallerReference": "qe-unster-net-distribution",
    "Aliases": {
      "Quantity": 1,
      "Items": ["qe.unster.net"]
    },
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-qe-unster-net-static",
          "DomainName": "qe-unster-net-static.s3.us-east-2.amazonaws.com",
          "OriginPath": "/static",
          "S3OriginConfig": {
            "OriginAccessIdentity": "origin-access-identity/cloudfront/E25LY4JFJ4G5GS"
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-qe-unster-net-static",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"],
        "CachedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"]
        }
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      },
      "MinTTL": 0,
      "DefaultTTL": 300,
      "MaxTTL": 1200
    },
    "Comment": "CloudFront distribution for qe.unster.net",
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:716985456551:certificate/6e865581-9274-4337-be33-38b1cece537a",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "Enabled": true
  }'
```

## 7. Configure DNS

Get the CloudFront distribution domain name:

```bash
aws cloudfront get-distribution --id 'E37GCUHREM1Y55' --query 'Distribution.DomainName' --output text
```

Add an A record in Route 53 to point your domain to the CloudFront distribution:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10447571LEGQU3F2719Y \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "qe.unster.net",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "dd0emhj3e63rr.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }
    ]
  }'
```

## 8. Verify Setup

Check the S3 bucket policy:

```bash
aws s3api get-bucket-policy --bucket qe-unster-net-static
```

List the contents of your S3 bucket:

```bash
aws s3 ls s3://qe-unster-net-static/ --recursive
```

## 9. Create Origin Access Control (OAC)

Create an Origin Access Control for improved security:

```bash
aws cloudfront create-origin-access-control --origin-access-control-config '{
    "Name": "OAC for qe.unster.net",
    "Description": "Origin Access Control for qe.unster.net",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
}'
```

## 10. Test the Website

You can now test your website by visiting https://qe.unster.net/

If you see a "200 OK" response, your setup is successful!

## 11. Create IAM User for CI/CD

To set up CI/CD for automatically uploading changed files to your S3 bucket, you'll need to create an IAM user with the appropriate permissions. Here's how to do it:

### 11.1 Create IAM User

First, create a new IAM user:

```bash
aws iam create-user --user-name qe-unster-net-cicd
```

### 11.2 Create IAM Policy

Create a policy that allows uploading to your specific S3 bucket:

```bash
aws iam create-policy --policy-name qe-unster-net-s3-upload --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::qe-unster-net-static",
                "arn:aws:s3:::qe-unster-net-static/*"
            ]
        }
    ]
}'
```

Note the ARN of the created policy in the output.

### 11.3 Attach Policy to User

Attach the policy to your new IAM user:

```bash
aws iam attach-user-policy --user-name qe-unster-net-cicd --policy-arn <POLICY_ARN>
```

Replace `<POLICY_ARN>` with the ARN of the policy you created in the previous step.

### 11.4 Create Access Key

Create an access key for the IAM user:

```bash
aws iam create-access-key --user-name qe-unster-net-cicd
```

This command will return an `AccessKeyId` and `SecretAccessKey`. Make sure to save these securely, as you won't be able to retrieve the `SecretAccessKey` again.

### 11.5 Use in CI/CD

In your CI/CD pipeline (e.g., GitHub Actions, GitLab CI, etc.), you can now use these credentials to authenticate AWS CLI commands or AWS SDK operations. Set them as secret environment variables in your CI/CD system:

- `AWS_ACCESS_KEY_ID`: The `AccessKeyId` from step 11.4
- `AWS_SECRET_ACCESS_KEY`: The `SecretAccessKey` from step 11.4

### 11.6 Example CI/CD Command

Here's an example command your CI/CD pipeline could use to sync files to your S3 bucket:

```bash
aws s3 sync static/ s3://qe-unster-net-static/static --delete
```

By following these steps, you've now set up an IAM user with the necessary permissions to upload files to your S3 bucket as part of your CI/CD process.

### 11.7 Add CloudFront Invalidation Permissions

To allow your CI/CD user to create CloudFront invalidations, you need to create and attach an additional policy:

```bash
aws iam create-policy --policy-name qe-unster-net-cloudfront-invalidation --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFrontInvalidation",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations"
            ],
            "Resource": "arn:aws:cloudfront::*:distribution/E37GCUHREM1Y55"
        }
    ]
}'
```

Then, attach this new policy to your IAM user:

```bash
aws iam attach-user-policy --user-name qe-unster-net-cicd --policy-arn arn:aws:iam::716985456551:policy/qe-unster-net-cloudfront-invalidation
```

Replace `arn:aws:iam::716985456551:policy/qe-unster-net-cloudfront-invalidation` with the ARN of the policy you just created.

Make sure to replace `E37GCUHREM1Y55` in the policy document with your actual CloudFront distribution ID yours it's different.



Note: Script `cloudfront_distribution_A_record.sh` did give me this f***ng error but the same thing worked on in the aws web interface! I have no idea why...

┌──(frajder㉿think)-[~/dev/Frajder/webProjectData/aws]
└─$ aws route53 change-resource-record-sets \
  --hosted-zone-id Z03858771NTPT1FIQIT9R \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "unster.cloud",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z03858771NTPT1FIQIT9R",
            "DNSName": "dzwmkhfhwq0sh.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }
    ]
  }'

An error occurred (InvalidChangeBatch) when calling the ChangeResourceRecordSets operation: [Tried to create an alias that targets dzwmkhfhwq0sh.cloudfront.net., type A in zone Z03858771NTPT1FIQIT9R, but the alias target name does not lie within the target zone]

