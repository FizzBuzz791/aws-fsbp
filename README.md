# AWS Foundational Security Best Practices

This is a Typescript implementation of [AWS Foundational Security Best Practices](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html) for use with AWS CDK.

## Usage

```ts
Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());
```

## Supported best practices

Each of the following checks has an associated config option that can be passed to the constructor. All options are enabled by default and must be explicitly opted-out.

- API Gateway
  - [[APIGateway.1]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-1) API Gateway REST and WebSocket API logging should be enabled.
  - [[APIGateway.2]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-2) API Gateway REST API stages should be configured to use SSL certificates for backend authentication
  - [[APIGateway.3]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-3) API Gateway REST API stages should have AWS X-Ray tracing enabled
- DynamoDB
  - [[DynamoDB.1]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-dynamodb-1) DynamoDB tables should automatically scale capacity with demand.
  - [[DynamoDB.2]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-dynamodb-2) DynamoDB tables should have point-in-time recovery enabled.
- IAM
  - [[IAM.1]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-iam-1) IAM policies should not allow full "\*" administrative privileges.
  - [[IAM.21]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-iam-21) IAM customer managed policies that you create should not allow wildcard actions for services.
- Lambda
  - [[Lambda.2]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-lambda-2) Lambda functions should use supported runtimes.
- RDS
  - [[RDS.2]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-2) RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration.
  - [[RDS.3]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-3) RDS DB instances should have encryption at rest enabled.
  - [[RDS.5]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-5) RDS DB instances should be configured with multiple Availability Zones.
  - [[RDS.6]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-6) Enhanced monitoring should be configured for RDS DB instances and clusters.
  - [[RDS.8]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-8) RDS DB instances should have deletion protection enabled.
  - [[RDS.9]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-9) Database logging should be enabled.
  - [[RDS.10]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-10) IAM authentication should be configured for RDS instances.
  - [[RDS.12]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-12) IAM authentication should be configured for RDS clusters.
  - [[RDS.13]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-13) RDS automatic minor version upgrades should be enabled.
  - [[RDS.16]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-16) RDS DB clusters should be configured to copy tags to snapshots.
  - [[RDS.17]](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-17) RDS DB instances should be configured to copy tags to snapshots.
