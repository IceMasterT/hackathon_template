#!/bin/bash

echo "# Set variables"
DISTRIBUTION_ID="E37GCUHREM1Y55"
API_GATEWAY_DOMAIN="1k3f5il7yi.execute-api.us-east-2.amazonaws.com"

echo "# Get the current distribution configuration $DISTRIBUTION_ID"
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > distribution-config.json

ETAG=$(jq -r '.ETag' distribution-config.json)
echo "# Extract the ETag $ETAG"

echo "# Modify the configuration"
jq --arg domain "$API_GATEWAY_DOMAIN" '
  .DistributionConfig.Origins.Items += [{
    "Id": "APIGateway",
    "DomainName": $domain,
    "OriginPath": "/prod",
    "CustomOriginConfig": {
      "HTTPPort": 80,
      "HTTPSPort": 443,
      "OriginProtocolPolicy": "https-only",
      "OriginSslProtocols": {
        "Quantity": 1,
        "Items": ["TLSv1.2"]
      },
      "OriginReadTimeout": 30,
      "OriginKeepaliveTimeout": 5
    },
    "ConnectionAttempts": 3,
    "ConnectionTimeout": 10,
    "OriginShield": {
      "Enabled": false
    },
    "CustomHeaders": {
      "Quantity": 0
    }
  }] |
  .DistributionConfig.Origins.Quantity = (.DistributionConfig.Origins.Items | length) |
  .DistributionConfig.CacheBehaviors.Items += [{
    "PathPattern": "api/*",
    "TargetOriginId": "APIGateway",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 0,
    "MaxTTL": 0,
    "Compress": true,
    "SmoothStreaming": false,
    "FieldLevelEncryptionId": "",
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      },
      "Headers": {
        "Quantity": 1,
        "Items": ["Authorization"]
      },
      "QueryStringCacheKeys": {
        "Quantity": 0
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "TrustedKeyGroups": {
      "Enabled": false,
      "Quantity": 0
    },
    "LambdaFunctionAssociations": {
      "Quantity": 0
    },
    "FunctionAssociations": {
      "Quantity": 0
    }
  }] |
  .DistributionConfig.CacheBehaviors.Quantity = (.DistributionConfig.CacheBehaviors.Items | length) |
  .DistributionConfig
' distribution-config.json > updated-config.json

echo "# Update the distribution"
aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config file://updated-config.json --if-match $ETAG

echo "# Clean up temporary files"
rm distribution-config.json updated-config.json
