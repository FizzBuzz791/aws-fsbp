import { Annotations, IAspect, IConstruct } from "@aws-cdk/core";
import { CfnPolicy, Effect } from "@aws-cdk/aws-iam";
import { CfnFunction, Runtime } from "@aws-cdk/aws-lambda";
import { CfnDBCluster, CfnDBInstance } from "@aws-cdk/aws-rds";

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
    enhancedMonitoring?: boolean;
    deletionProtection?: boolean;
    logExports?: boolean;
    iamAuth?: boolean;
    autoMinorVersionUpgrades?: boolean;
    copyTagsToSnapshot?: boolean;
  };
}

type RDS = CfnDBInstance | CfnDBCluster;

const getDescriptor = (node: RDS): string => {
  return node instanceof CfnDBInstance ? "instances" : "cluster";
};

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
      rds: {
        publicAccess: true,
        storageEncrypted: true,
        multiAz: true,
        enhancedMonitoring: true,
        deletionProtection: true,
        logExports: true,
        iamAuth: true,
        autoMinorVersionUpgrades: true,
        copyTagsToSnapshot: true,
      },
    }
  ) {
    this.Config = config;
  }

  public visit(node: IConstruct): void {
    if (node instanceof CfnPolicy) {
      this.checkIAMPolicyCompliance(node);
    } else if (node instanceof CfnFunction) {
      this.checkLamdaCompliance(node);
    } else if (node instanceof CfnDBInstance || node instanceof CfnDBCluster) {
      this.checkRDSCompliance(node);
    }
  }

  private checkRDSCompliance(node: RDS) {
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

    if (this.Config.rds?.enhancedMonitoring ?? true) {
      this.checkEnhancedMonitoring(node);
    }

    if (this.Config.rds?.deletionProtection ?? true) {
      this.checkDeletionProtection(node);
    }

    if (this.Config.rds?.logExports ?? true) {
      this.checkLogExports(node);
    }

    if (this.Config.rds?.iamAuth ?? true) {
      this.checkIAMAuthentication(node);
    }

    if (this.Config.rds?.autoMinorVersionUpgrades ?? true) {
      this.checkMinorVersionUpgrades(node);
    }

    if (this.Config.rds?.copyTagsToSnapshot ?? true) {
      this.checkCopyTagsToSnapshot(node);
    }
  }

  /**
   * [RDS.1] RDS snapshots should be private
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-1
   */
  private checkSnapshotPublicAccess(node: RDS) {
    // TODO: This is complicated...
  }

  /**
   * [RDS.2] RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-2
   */
  private checkRDSPublicAccess(node: RDS) {
    // This check is only applicable to DB Instances.
    if (node instanceof CfnDBInstance && node.publiclyAccessible) {
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
  private checkRDSEncryption(node: RDS) {
    // This check is only applicable to instances, not clusters.
    if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.storageEncrypted
    ) {
      Annotations.of(node).addError(
        `[RDS.3] RDS DB ${getDescriptor(
          node
        )} should have encryption at rest enabled`
      );
    }
  }

  /**
   * [RDS.5] RDS DB instances should be configured with multiple Availability Zones
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-5
   */
  private checkMultipleAZs(node: RDS) {
    // This check is only applicable to instances, not clusters.
    if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.multiAz
    ) {
      Annotations.of(node).addError(
        `[RDS.5] RDS DB ${getDescriptor(
          node
        )} should be configured with multiple Availability Zones`
      );
    }
  }

  /**
   * [RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-6
   */
  private checkEnhancedMonitoring(node: RDS) {
    if (
      node instanceof CfnDBInstance &&
      (!node.monitoringInterval || node.monitoringInterval < 1)
    ) {
      // Each instance in a cluster requires enhanced monitoring.
      Annotations.of(node).addError(
        "[RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters"
      );
    }
  }

  /**
   * [RDS.8] RDS DB instances should have deletion protection enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-8
   */
  private checkDeletionProtection(node: RDS) {
    if (node instanceof CfnDBCluster && !node.deletionProtection) {
      Annotations.of(node).addError(
        `[RDS.8] RDS DB ${getDescriptor(
          node
        )} should have deletion protection enabled`
      );
    } else if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.deletionProtection
    ) {
      Annotations.of(node).addError(
        `[RDS.8] RDS DB ${getDescriptor(
          node
        )} should have deletion protection enabled`
      );
    }
  }

  /**
   * [RDS.9] Database logging should be enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-9
   */
  private checkLogExports(node: RDS) {
    if (
      node instanceof CfnDBCluster ||
      (node instanceof CfnDBInstance && node.dbClusterIdentifier === undefined)
    ) {
      if (
        node.enableCloudwatchLogsExports === undefined ||
        node.enableCloudwatchLogsExports.length === 0
      ) {
        Annotations.of(node).addError(
          "[RDS.9] Database logging should be enabled"
        );
      } else {
        // Check that the log types are valid.
        let expectedLogTypes: string[] = [];
        switch (node.engine) {
          case "mysql":
          case "aurora":
          case "aurora-mysql":
          case "mariadb":
            expectedLogTypes = ["audit", "error", "general", "slowquery"];
            break;
          case "oracle-ee":
          case "oracle-se2":
            expectedLogTypes = ["alert", "audit", "trace", "listener"];
            break;
          case "postgres":
          case "aurora-postgres":
            expectedLogTypes = ["postgresql", "upgrade"];
            break;
          case "sqlserver-ee":
          case "sqlserver-ex":
          case "sqlserver-se":
          case "sqlserver-web":
            expectedLogTypes = ["error", "agent"];
            break;
          default:
            expectedLogTypes = ["invalid"];
            break;
        }

        if (
          !node.enableCloudwatchLogsExports.every((log) =>
            expectedLogTypes.includes(log)
          )
        ) {
          Annotations.of(node).addError(
            "[RDS.9] Database logging should be enabled"
          );
        }
      }
    }
  }

  /**
   * [RDS.10] IAM authentication should be configured for RDS instances & [RDS.12] IAM authentication should be configured for RDS clusters
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-10 & https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-12
   */
  private checkIAMAuthentication(node: RDS) {
    if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.enableIamDatabaseAuthentication
    ) {
      Annotations.of(node).addError(
        "[RDS.10] IAM authentication should be configured for RDS instances"
      );
    } else if (
      node instanceof CfnDBCluster &&
      !node.enableIamDatabaseAuthentication
    ) {
      Annotations.of(node).addError(
        "[RDS.12] IAM authentication should be configured for RDS clusters"
      );
    }
  }

  /**
   * [RDS.13] RDS automatic minor version upgrades should be enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-13
   */
  private checkMinorVersionUpgrades(node: RDS) {
    if (node instanceof CfnDBInstance && !node.autoMinorVersionUpgrade) {
      Annotations.of(node).addError(
        "[RDS.13] RDS automatic minor version upgrades should be enabled"
      );
    }
  }

  /**
   * [RDS.16] RDS DB clusters should be configured to copy tags to snapshots & [RDS.17] RDS DB instances should be configured to copy tags to snapshots
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-16 & https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-17
   */
  private checkCopyTagsToSnapshot(node: RDS) {
    if (!node.copyTagsToSnapshot) {
      if (node instanceof CfnDBCluster) {
        Annotations.of(node).addWarning(
          "[RDS.16] RDS DB clusters should be configured to copy tags to snapshots"
        );
      } else if (
        node instanceof CfnDBInstance &&
        node.dbClusterIdentifier === undefined
      ) {
        Annotations.of(node).addWarning(
          "[RDS.17] RDS DB instances should be configured to copy tags to snapshots"
        );
      }
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
