#!/bin/bash

# name: CloudFront Distribution A Record Script
# description: Automates the creation of an A record in Route 53 for a specified CloudFront distribution.

# Default values
AWS_PROFILE="default"
OUTPUT_FORMAT="text"
TEMPLATE_FILE="cloudfront_distribution_A_record_template.json"  # Path to the JSON template

# Function to display usage information
usage() {
    echo "Usage: $0 -d DOMAIN_NAME [options]"
    echo "Options:"
    echo "  -d, --domain DOMAIN_NAME      Required: The domain name to lookup (e.g., qe.unster.net)"
    echo "  -p, --profile PROFILE         AWS profile to use (default: default)"
    echo "  -o, --output FORMAT           Output format: table|json|text (default: text)"
    echo "  -h, --help                    Display this help message"
}

# Function for error handling and exit
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--domain)
            ZONE_DOMAIN_NAME="$2"
            shift 2
            ;;
        -p|--profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            usage
            error_exit "Invalid option: $1"
            ;;
    esac
done

# Check if required parameters are set
if [ -z "$ZONE_DOMAIN_NAME" ]; then
    usage
    error_exit "DOMAIN_NAME is a required parameter."
fi

# Retrieve ZONE_ID
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$ZONE_DOMAIN_NAME" --query "HostedZones[?Name=='$ZONE_DOMAIN_NAME.'].Id" --output text --profile "$AWS_PROFILE" | sed 's|/hostedzone/||')

# Check if ZONE_ID was retrieved successfully
if [ -z "$ZONE_ID" ]; then
    error_exit "Unable to find Hosted Zone ID for domain: $ZONE_DOMAIN_NAME"
fi
echo "ZONE_ID: $ZONE_ID"

# Retrieve CloudFront Distribution details
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '$ZONE_DOMAIN_NAME')]].Id" --output text --profile "$AWS_PROFILE")
CLOUDFRONT_DOMAIN=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '$ZONE_DOMAIN_NAME')]].DomainName" --output text --profile "$AWS_PROFILE")

# Check if DISTRIBUTION_ID and CLOUDFRONT_DOMAIN were retrieved successfully
if [ -z "$DISTRIBUTION_ID" ] || [ -z "$CLOUDFRONT_DOMAIN" ]; then
    error_exit "Unable to find CloudFront distribution details for domain: $ZONE_DOMAIN_NAME"
fi

# Correctly format CLOUDFRONT_DOMAIN with a trailing dot
if [[ "$CLOUDFRONT_DOMAIN" != *"." ]]; then
    CLOUDFRONT_DOMAIN="${CLOUDFRONT_DOMAIN}."
fi

# Output results based on the chosen format
if [ "$OUTPUT_FORMAT" == "table" ]; then
    printf "%-20s %-50s\n" "Parameter" "Value"
    printf "%-20s %-50s\n" "ZONE_ID" "$ZONE_ID"
    printf "%-20s %-50s\n" "DISTRIBUTION_ID" "$DISTRIBUTION_ID"
    printf "%-20s %-50s\n" "CLOUDFRONT_DOMAIN" "$CLOUDFRONT_DOMAIN"
elif [ "$OUTPUT_FORMAT" == "json" ]; then
    jq -n --arg zone_id "$ZONE_ID" --arg dist_id "$DISTRIBUTION_ID" --arg cloudfront "$CLOUDFRONT_DOMAIN" \
        '{ZONE_ID: $zone_id, DISTRIBUTION_ID: $dist_id, CLOUDFRONT_DOMAIN: $cloudfront}'
else
    # Default to text format
    echo "ZONE_ID: $ZONE_ID"
    echo "DISTRIBUTION_ID: $DISTRIBUTION_ID"
    echo "CLOUDFRONT_DOMAIN: $CLOUDFRONT_DOMAIN"
fi

# Check if the A record exists
EXISTING_RECORD=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --query "ResourceRecordSets[?Name == '${ZONE_DOMAIN_NAME}.']" \
  --output json --profile "$AWS_PROFILE")

# Extract current DNSName and HostedZoneId if the record exists
CURRENT_DNS_NAME=$(echo "$EXISTING_RECORD" | jq -r '.[0].AliasTarget.DNSName // empty')
CURRENT_HOSTED_ZONE_ID=$(echo "$EXISTING_RECORD" | jq -r '.[0].AliasTarget.HostedZoneId // empty')

# Check if the record is missing or doesn't match the expected values
if [[ -z "$EXISTING_RECORD" || "$CURRENT_DNS_NAME" != "$CLOUDFRONT_DOMAIN" || "$CURRENT_HOSTED_ZONE_ID" != "$ZONE_ID" ]]; then
  echo "Record does not exist or does not match expected values. Creating/updating A record..."

  # Replace placeholders in the JSON template with actual values
  sed -e "s|\${ZONE_DOMAIN_NAME}|$ZONE_DOMAIN_NAME|g" \
      -e "s|\${ZONE_ID}|$ZONE_ID|g" \
      -e "s|\${CLOUDFRONT_DOMAIN}|$CLOUDFRONT_DOMAIN|g" \
      "$TEMPLATE_FILE" > /tmp/change-batch.json

  # Execute the AWS CLI command to create or update the A record
  aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch file:///tmp/change-batch.json \
    --profile "$AWS_PROFILE"

  echo "A record for $ZONE_DOMAIN_NAME has been successfully created or updated."
else
  echo "A record for $ZONE_DOMAIN_NAME already exists and matches the expected values. No changes made."
fi
