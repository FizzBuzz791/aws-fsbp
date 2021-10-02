import { CfnPolicy, Effect } from "@aws-cdk/aws-iam";
import { Annotations } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export interface IAMConfig {
  fullAdmin?: boolean;
  wildcardServiceActions?: boolean;
}

export class IAMPolicyComplianceChecker extends BaseComplianceChecker<CfnPolicy> {
  constructor(config: IAMConfig) {
    super({ iam: config });
  }

  checkCompliance(node: CfnPolicy): void {
    if (this.config.iam?.fullAdmin ?? true) {
      this.checkIAMPolicyFullAdmin(node);
    }

    if (this.config.iam?.wildcardServiceActions ?? true) {
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
