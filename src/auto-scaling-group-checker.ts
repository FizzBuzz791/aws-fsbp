import { CfnAutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import { Annotations } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export interface AutoScalingGroupConfig {
  loadBalancerHealthCheck?: boolean;
}

export class AutoScalingGroupComplianceChecker extends BaseComplianceChecker<CfnAutoScalingGroup> {
  constructor(config: AutoScalingGroupConfig) {
    super({ autoScalingGroup: config });
  }

  checkCompliance(node: CfnAutoScalingGroup): void {
    if (this.config.autoScalingGroup?.loadBalancerHealthCheck ?? true) {
      this.checkLoadBalancerHealthCheck(node);
    }
  }

  /**
   * [AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-autoscaling-1
   */
  private checkLoadBalancerHealthCheck(node: CfnAutoScalingGroup) {
    if (node.loadBalancerNames?.length ?? 0 > 0) {
      if (!node.healthCheckType || !node.healthCheckGracePeriod) {
        Annotations.of(node).addError(
          "[AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks"
        );
      }
    }
  }
}
