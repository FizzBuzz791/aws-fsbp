import { CfnBucket, CfnBucketPolicy } from "@aws-cdk/aws-s3";
import { isResolvableObject, Annotations } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export interface S3Config {
  serverSideEncryption?: boolean;
  ssl?: boolean;
}

export class S3ComplianceChecker extends BaseComplianceChecker<
  CfnBucket | CfnBucketPolicy
> {
  constructor(config: S3Config) {
    super({ s3: config });
  }

  checkCompliance(node: CfnBucket | CfnBucketPolicy): void {
    if (this.config.s3?.serverSideEncryption) {
      this.checkServerSideEncryption(node);
    } else if (this.config.s3?.ssl) {
      this.checkSSL(node);
    }
  }

  /**
   * [S3.4] S3 buckets should have server-side encryption enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-s3-4
   */
  private checkServerSideEncryption(node: CfnBucket | CfnBucketPolicy) {
    if (node instanceof CfnBucket) {
      if (
        !node.hasOwnProperty("bucketEncryption") ||
        node.bucketEncryption === undefined ||
        isResolvableObject(node.bucketEncryption)
      ) {
        Annotations.of(node).addError(
          "[S3.4] S3 buckets should have server-side encryption enabled"
        );
      } else if (
        node.bucketEncryption.serverSideEncryptionConfiguration === undefined ||
        isResolvableObject(
          node.bucketEncryption.serverSideEncryptionConfiguration
        ) ||
        node.bucketEncryption.serverSideEncryptionConfiguration.length === 0 ||
        isResolvableObject(
          node.bucketEncryption.serverSideEncryptionConfiguration[0]
        )
      ) {
        Annotations.of(node).addError(
          "[S3.4] S3 buckets should have server-side encryption enabled.2"
        );
      } else {
        const ssec = node.bucketEncryption.serverSideEncryptionConfiguration[0];
        if (
          isResolvableObject(ssec.bucketKeyEnabled) ||
          ssec.bucketKeyEnabled === false
        ) {
          Annotations.of(node).addError(
            "[S3.4] S3 buckets should have server-side encryption enabled.3"
          );
        } else if (
          ssec.serverSideEncryptionByDefault === undefined ||
          isResolvableObject(ssec.serverSideEncryptionByDefault) ||
          !["AES-256", "aws:kms"].includes(
            ssec.serverSideEncryptionByDefault.sseAlgorithm
          )
        ) {
          Annotations.of(node).addError(
            "[S3.4] S3 buckets should have server-side encryption enabled.4"
          );
        }
      }
    }
  }

  /**
   * [S3.5] S3 buckets should require requests to use Secure Socket Layer
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-s3-5
   */
  private checkSSL(node: CfnBucket | CfnBucketPolicy) {
    if (node instanceof CfnBucketPolicy) {
      if (node.policyDocument?.Statement?.length === 0) {
        Annotations.of(node).addError(
          "[S3.5] S3 buckets should require requests to use Secure Socket Layer"
        );
      }
    }
  }
}
