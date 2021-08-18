import { Annotations, IAspect, IConstruct } from "@aws-cdk/core";
import { CfnPolicy, Effect } from "@aws-cdk/aws-iam";
import { CfnFunction, Runtime } from "@aws-cdk/aws-lambda";
import { CfnDBInstance } from "@aws-cdk/aws-rds";

export interface FSBPConfig {
  iam?: {
    fullAdmin?: boolean;
    wildcardServiceActions?: boolean;
  };
  lambda?: {
    supportedRuntimes?: boolean;
  };
  rds?: {
    publicAccess?: boolean;
    storageEncrypted?: boolean;
    multiAz?: boolean;
  };
}

/**
 * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html
 */
export class AWSFoundationalSecurityBestPracticesChecker implements IAspect {
  private Config: FSBPConfig;

  /**
   * Initialise a new Checker. All values in the configuration default to true if not provided.
   * @param config
   */
  constructor(
    config: FSBPConfig = {
      iam: { fullAdmin: true, wildcardServiceActions: true },
      lambda: { supportedRuntimes: true },
      rds: { publicAccess: true, storageEncrypted: true, multiAz: true },
    }
  ) {
    this.Config = config;
  }

  public visit(node: IConstruct): void {
    if (node instanceof CfnPolicy) {
      this.checkIAMPolicyCompliance(node);
    } else if (node instanceof CfnFunction) {
      this.checkLamdaCompliance(node);
    } else if (node instanceof CfnDBInstance) {
      this.checkDBCompliance(node);
    }
  }

  private checkDBCompliance(node: CfnDBInstance) {
    this.checkSnapshotPublicAccess(node);

    if (this.Config.rds?.publicAccess ?? true) {
      this.checkRDSPublicAccess(node);
    }

    if (this.Config.rds?.storageEncrypted ?? true) {
      this.checkRDSEncryption(node);
    }

    if (this.Config.rds?.multiAz ?? true) {
      this.checkMultipleAZs(node);
    }
  }

  /**
   * [RDS.1] RDS snapshots should be private
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-1
   */
  private checkSnapshotPublicAccess(node: CfnDBInstance) {
    // TODO: This is complicated...
  }

  /**
   * [RDS.2] RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-2
   */
  private checkRDSPublicAccess(node: CfnDBInstance) {
    if (node.publiclyAccessible) {
      // Undefined is the same as false in this context, so we don't need to check or raise an error.
      Annotations.of(node).addError(
        "[RDS.2] RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration"
      );
    }
  }

  /**
   * [RDS.3] RDS DB instances should have encryption at rest enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-3
   */
  private checkRDSEncryption(node: CfnDBInstance) {
    if (!node.storageEncrypted) {
      Annotations.of(node).addError(
        "[RDS.3] RDS DB instances should have encryption at rest enabled"
      );
    }
  }

  /**
   * [RDS.5] RDS DB instances should be configured with multiple Availability Zones
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-5
   */
  private checkMultipleAZs(node: CfnDBInstance) {
    if (!node.multiAz) {
      Annotations.of(node).addError(
        "[RDS.5] RDS DB instances should be configured with multiple Availability Zones"
      );
    }
  }

  private checkLamdaCompliance(node: CfnFunction) {
    this.checkLambdaPublicAccess(node);

    if (this.Config.lambda?.supportedRuntimes ?? true) {
      this.checkLambdaSupportedRuntime(node);
    }
  }

  /**
   * [Lambda.1] Lambda function policies should prohibit public access
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-lambda-1
   */
  private checkLambdaPublicAccess(node: CfnFunction) {
    // TODO: This is complicated...
  }

  private supportedLambdaRuntimes = [
    Runtime.NODEJS_14_X,
    Runtime.NODEJS_12_X,
    Runtime.NODEJS_10_X,
    Runtime.PYTHON_3_8,
    Runtime.PYTHON_3_7,
    Runtime.PYTHON_3_6,
    Runtime.RUBY_2_7,
    Runtime.RUBY_2_5,
    Runtime.JAVA_11,
    Runtime.JAVA_8,
    Runtime.JAVA_8_CORRETTO,
    Runtime.GO_1_X,
    Runtime.DOTNET_CORE_3_1,
    Runtime.DOTNET_CORE_2_1,
  ];
  /**
   * [Lambda.2] Lambda functions should use supported runtimes
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-lambda-2
   */
  private checkLambdaSupportedRuntime(node: CfnFunction) {
    if (!this.supportedLambdaRuntimes.some((r) => r.name === node.runtime)) {
      Annotations.of(node).addError(
        "[Lambda.2] Lambda functions should use supported runtimes"
      );
    }
  }

  private checkIAMPolicyCompliance(node: CfnPolicy) {
    if (this.Config.iam?.fullAdmin ?? true) {
      this.checkIAMPolicyFullAdmin(node);
    }

    if (this.Config.iam?.wildcardServiceActions ?? true) {
      this.checkIAMPolicyServiceWildcards(node);
    }
  }

  /**
   * [IAM.1] IAM policies should not allow full "*" administrative privileges.
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-iam-1
   */
  private checkIAMPolicyFullAdmin(node: CfnPolicy) {
    if (node.policyDocument.hasOwnProperty("statements")) {
      const statements = node.policyDocument.statements;

      if (
        statements.some(
          (s: Record<string, unknown>) =>
            s.effect === Effect.ALLOW &&
            (s.action as string[]).some((a: string) => a === "*") &&
            (s.resource as string[]).some((r: string) => r === "*")
        )
      ) {
        Annotations.of(node).addError(
          '[IAM.1] IAM policies should not allow full "*" administrative privileges.'
        );
      }
    }
  }

  /**
   * [IAM.21] IAM customer managed policies that you create should not allow wildcard actions for services
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-iam-21
   */
  private checkIAMPolicyServiceWildcards(node: CfnPolicy) {
    if (node.policyDocument.hasOwnProperty("statements")) {
      const statements = node.policyDocument.statements;

      if (
        statements.some(
          (s: Record<string, unknown>) =>
            s.effect === Effect.ALLOW &&
            (s.action as string[]).some((a: string) => a.endsWith(":*"))
        )
      ) {
        Annotations.of(node).addError(
          "[IAM.21] IAM customer managed policies that you create should not allow wildcard actions for services."
        );
      }
    }
  }
}
