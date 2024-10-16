#!/bin/bash

# Define variables (and yes you should change variables below or fix this script)
POLICY_NAME="qe-unster-net-cicd-lambda-auth-services-policy"
USER_NAME="qe-unster-net-cicd"
POLICY_FILE="policies/qe-unster-net-cicd-lamda-auth-services.json"
AWS_PROFILE="default"

# Step 1: Create the IAM policy
POLICY_ARN=$(aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://$POLICY_FILE \
    --query 'Policy.Arn' \
    --output text --profile $AWS_PROFILE)

# Step 2: Attach the policy to the IAM user
aws iam attach-user-policy \
    --user-name $USER_NAME \
    --policy-arn $POLICY_ARN \
     --profile $AWS_PROFILE

echo "Policy $POLICY_NAME attached to user $USER_NAME successfully using $AWS_PROFILE profile."

aws iam create-role --role-name lambda-execution-role \
  --assume-role-policy-document file:///policies/lambda-trust-policy-AssumeRole.json

aws iam put-role-policy --role-name lambda-execution-role \
  --policy-name lambda-cloudwatch-policy \
  --policy-document file:///policies/qe-unster-net-cicd-logs.json

aws iam attach-role-policy --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam put-role-policy --role-name lambda-execution-role \
  --policy-name lambda-InvokeFunction-policy \
  --policy-document file://aws/policies/lambda-InvokeFunction.json
