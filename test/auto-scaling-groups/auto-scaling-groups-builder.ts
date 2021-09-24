import { IBuilder } from "../IBuilder";
import { AutoScalingGroup, HealthCheck } from "@aws-cdk/aws-autoscaling";
import { Duration, Stack } from "@aws-cdk/core";
import { InstanceType, MachineImage, Vpc } from "@aws-cdk/aws-ec2";
import { LoadBalancer } from "@aws-cdk/aws-elasticloadbalancing";
import {
  ApplicationLoadBalancer,
  NetworkLoadBalancer,
} from "@aws-cdk/aws-elasticloadbalancingv2";

export class AutoScalingGroupsBuilder implements IBuilder<AutoScalingGroup> {
  private readonly _stack: Stack;
  private readonly _vpc: Vpc;

  private _withHealthCheck = false;
  private _withClassicLoadBalancer = false;
  private _withApplicationLoadBalancer = false;
  private _withNetworkLoadBalancer = false;

  constructor(stack: Stack) {
    this._stack = stack;

    this._vpc = new Vpc(this._stack, "VPC");
  }

  withHealthCheck(withHealthCheck: boolean): AutoScalingGroupsBuilder {
    this._withHealthCheck = withHealthCheck;
    return this;
  }

  withClassicLoadBalancer(
    withClassicLoadBalancer: boolean
  ): AutoScalingGroupsBuilder {
    this._withClassicLoadBalancer = withClassicLoadBalancer;
    return this;
  }

  withApplicationLoadBalancer(
    withApplicationLoadBalancer: boolean
  ): AutoScalingGroupsBuilder {
    this._withApplicationLoadBalancer = withApplicationLoadBalancer;
    return this;
  }

  withNetworkLoadBalancer(
    withNetworkLoadBalancer: boolean
  ): AutoScalingGroupsBuilder {
    this._withNetworkLoadBalancer = withNetworkLoadBalancer;
    return this;
  }

  build(): AutoScalingGroup {
    let asg = new AutoScalingGroup(this._stack, "AutoScalingGroup", {
      vpc: this._vpc,
      instanceType: new InstanceType("t2.micro"),
      machineImage: MachineImage.latestAmazonLinux(),
      healthCheck: this._withHealthCheck
        ? HealthCheck.elb({
            grace: Duration.seconds(300),
          })
        : undefined,
    });

    if (this._withClassicLoadBalancer) {
      asg.attachToClassicLB(
        new LoadBalancer(this._stack, "ClassicLoadBalancer", { vpc: this._vpc })
      );
    }

    if (this._withApplicationLoadBalancer) {
      const alb = new ApplicationLoadBalancer(
        this._stack,
        "ApplicationLoadBalancer",
        { vpc: this._vpc }
      );
      const listener = alb.addListener("Listener", { port: 80 });
      listener.addTargets("Target", {
        port: 80,
        targets: [asg],
      });
    }

    if (this._withNetworkLoadBalancer) {
      const nlb = new NetworkLoadBalancer(this._stack, "NetworkLoadBalancer", {
        vpc: this._vpc,
      });
      const listener = nlb.addListener("Listener", { port: 80 });
      listener.addTargets("Target", {
        port: 80,
        targets: [asg],
      });
    }

    return asg;
  }
}
