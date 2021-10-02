import { CfnDBCluster, CfnDBInstance } from "@aws-cdk/aws-rds";
import { Annotations } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export interface RDSConfig {
  publicAccess?: boolean;
  storageEncrypted?: boolean;
  multiAz?: boolean;
  enhancedMonitoring?: boolean;
  deletionProtection?: boolean;
  logExports?: boolean;
  iamAuth?: boolean;
  autoMinorVersionUpgrades?: boolean;
  copyTagsToSnapshot?: boolean;
}

export class RDSComplianceChecker extends BaseComplianceChecker<
  CfnDBInstance | CfnDBCluster
> {
  constructor(config: RDSConfig) {
    super({ rds: config });
  }

  checkCompliance(node: CfnDBInstance | CfnDBCluster): void {
    if (this.config.rds?.publicAccess ?? true) {
      this.checkRDSPublicAccess(node);
    }

    if (this.config.rds?.storageEncrypted ?? true) {
      this.checkRDSEncryption(node);
    }

    if (this.config.rds?.multiAz ?? true) {
      this.checkMultipleAZs(node);
    }

    if (this.config.rds?.enhancedMonitoring ?? true) {
      this.checkEnhancedMonitoring(node);
    }

    if (this.config.rds?.deletionProtection ?? true) {
      this.checkDeletionProtection(node);
    }

    if (this.config.rds?.logExports ?? true) {
      this.checkLogExports(node);
    }

    if (this.config.rds?.iamAuth ?? true) {
      this.checkIAMAuthentication(node);
    }

    if (this.config.rds?.autoMinorVersionUpgrades ?? true) {
      this.checkMinorVersionUpgrades(node);
    }

    if (this.config.rds?.copyTagsToSnapshot ?? true) {
      this.checkCopyTagsToSnapshot(node);
    }
  }

  /**
   * [RDS.2] RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-2
   */
  private checkRDSPublicAccess(node: CfnDBInstance | CfnDBCluster) {
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
  private checkRDSEncryption(node: CfnDBInstance | CfnDBCluster) {
    // This check is only applicable to instances, not clusters.
    if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.storageEncrypted
    ) {
      Annotations.of(node).addError(
        `[RDS.3] RDS DB ${this.#getDescriptor(
          node
        )} should have encryption at rest enabled`
      );
    }
  }

  /**
   * [RDS.5] RDS DB instances should be configured with multiple Availability Zones
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-5
   */
  private checkMultipleAZs(node: CfnDBInstance | CfnDBCluster) {
    // This check is only applicable to instances, not clusters.
    if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.multiAz
    ) {
      Annotations.of(node).addError(
        `[RDS.5] RDS DB ${this.#getDescriptor(
          node
        )} should be configured with multiple Availability Zones`
      );
    }
  }

  /**
   * [RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-6
   */
  private checkEnhancedMonitoring(node: CfnDBInstance | CfnDBCluster) {
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
  private checkDeletionProtection(node: CfnDBInstance | CfnDBCluster) {
    if (node instanceof CfnDBCluster && !node.deletionProtection) {
      Annotations.of(node).addError(
        `[RDS.8] RDS DB ${this.#getDescriptor(
          node
        )} should have deletion protection enabled`
      );
    } else if (
      node instanceof CfnDBInstance &&
      node.dbClusterIdentifier === undefined &&
      !node.deletionProtection
    ) {
      Annotations.of(node).addError(
        `[RDS.8] RDS DB ${this.#getDescriptor(
          node
        )} should have deletion protection enabled`
      );
    }
  }

  /**
   * [RDS.9] Database logging should be enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-rds-9
   */
  private checkLogExports(node: CfnDBInstance | CfnDBCluster) {
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
  private checkIAMAuthentication(node: CfnDBInstance | CfnDBCluster) {
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
  private checkMinorVersionUpgrades(node: CfnDBInstance | CfnDBCluster) {
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
  private checkCopyTagsToSnapshot(node: CfnDBInstance | CfnDBCluster) {
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

  #getDescriptor(node: CfnDBInstance | CfnDBCluster): string {
    return node instanceof CfnDBInstance ? "instances" : "cluster";
  }
}
