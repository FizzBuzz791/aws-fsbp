# AWS Foundational Security Best Practices

This is a Typescript implementation of [AWS Foundational Security Best Practices](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html) for use with AWS CDK.

## Usage

```ts
Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());
```

## Supported best practices

Each of the following checks has an associated config option that can be passed to the constructor. All options are enabled by default and must be explicitly opted-out.

- IAM
  - [IAM.1] IAM policies should not allow full "\*" administrative privileges.
  - [IAM.21] IAM customer managed policies that you create should not allow wildcard actions for services.
- Lambda
  - [Lambda.2] Lambda functions should use supported runtimes.
