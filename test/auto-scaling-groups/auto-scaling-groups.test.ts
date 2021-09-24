import { App, Aspects, Stack } from "@aws-cdk/core";
import { AutoScalingGroupsBuilder } from "./auto-scaling-groups-builder";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";

describe("API Gateway", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks", () => {
    test("Given an Auto Scaling group associated with a classic load balancer and health checks are not configured, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-fail", {});
      new AutoScalingGroupsBuilder(stack)
        .withClassicLoadBalancer(true)
        .withHealthCheck(false)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks"
      );
    });

    test("Given an Auto Scaling group associated with a classic load balancer and health checks are configured, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withClassicLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an Auto Scaling group associated with a classic load balancer and health checks are not configured and AutoScaling.1 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-ignore-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withClassicLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          autoScalingGroup: { loadBalancerHealthCheck: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an Auto Scaling group associated with an application load balancer and health checks are not configured, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-fail", {});
      new AutoScalingGroupsBuilder(stack)
        .withApplicationLoadBalancer(true)
        .withHealthCheck(false)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks"
      );
    });

    test("Given an Auto Scaling group associated with an application load balancer and health checks are configured, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withApplicationLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an Auto Scaling group associated with an application load balancer and health checks are not configured and AutoScaling.1 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-ignore-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withApplicationLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          autoScalingGroup: { loadBalancerHealthCheck: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an Auto Scaling group associated with a network load balancer and health checks are not configured, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-fail", {});
      new AutoScalingGroupsBuilder(stack)
        .withNetworkLoadBalancer(true)
        .withHealthCheck(false)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[AutoScaling.1] Auto Scaling groups associated with a load balancer should use load balancer health checks"
      );
    });

    test("Given an Auto Scaling group associated with a network load balancer and health checks are configured, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withNetworkLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an Auto Scaling group associated with a network load balancer and health checks are not configured and AutoScaling.1 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-auto-scaling-1-stack-ignore-pass", {});
      new AutoScalingGroupsBuilder(stack)
        .withNetworkLoadBalancer(true)
        .withHealthCheck(true)
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          autoScalingGroup: { loadBalancerHealthCheck: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-auto-scaling-1-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
