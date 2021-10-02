import { CfnTable, Table } from "@aws-cdk/aws-dynamodb";
import { Annotations, isResolvableObject } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export class DynamoDBConfig {
  autoScaling?: boolean;
  pointInTimeRecovery?: boolean;
}

export class DynamoDBComplianceChecker extends BaseComplianceChecker<CfnTable> {
  constructor(config: DynamoDBConfig) {
    super({ dynamodb: config });
  }

  checkCompliance(node: CfnTable): void {
    if (this.config.dynamodb?.autoScaling ?? true) {
      this.checkAutoScaling(node);
    }

    if (this.config.dynamodb?.pointInTimeRecovery ?? true) {
      this.checkPointInTimeRecovery(node);
    }
  }

  /**
   * [DynamoDB.1] DynamoDB tables should automatically scale capacity with demand
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-dynamodb-1
   */
  private checkAutoScaling(node: CfnTable) {
    // Look for ScalableTableAttribute or ScalableTarget
    if (node.node.scope instanceof Table) {
      const table = node.node.scope;
      if (table.hasOwnProperty("tableScaling")) {
        const tableScaling = table["tableScaling"];
        if (
          !tableScaling.hasOwnProperty("scalableReadAttribute") ||
          !tableScaling.hasOwnProperty("scalableWriteAttribute")
        ) {
          // If it's missing a scalable attribute, it's not a scalable table.
          Annotations.of(node).addError(
            "[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand"
          );
        }
      } else {
        // If it's missing tableScaling, it's not a scalable table.
        Annotations.of(node).addError(
          "[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand"
        );
      }
    }
  }

  /**
   * [DynamoDB.2] DynamoDB tables should have point-in-time recovery enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-dynamodb-2
   */
  private checkPointInTimeRecovery(node: CfnTable) {
    if (!node.pointInTimeRecoverySpecification) {
      // Nothing explicit about PITR being on or off, raise an error.
      Annotations.of(node).addError(
        "[DynamoDB.2] DynamoDB tables should have point-in-time recovery enabled"
      );
    } else {
      if (
        !isResolvableObject(node.pointInTimeRecoverySpecification) &&
        !node.pointInTimeRecoverySpecification.pointInTimeRecoveryEnabled
      ) {
        // PITR is explicitly off, raise an error.
        Annotations.of(node).addError(
          "[DynamoDB.2] DynamoDB tables should have point-in-time recovery enabled"
        );
      }
    }
  }
}
