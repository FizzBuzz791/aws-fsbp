import { Effect, Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";

describe("IAM", () => {
  let app: App;

  beforeEach(() => {
    return (app = new App());
  });

  describe('[IAM.1] IAM policies should not allow full "*" administrative privileges.', () => {
    test("Given a Full Admin policy is defined, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-1-stack-fail", {});
      new Policy(stack, "full-admin-policy", {
        policyName: "full-admin-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        '[IAM.1] IAM policies should not allow full "*" administrative privileges.'
      );
    });

    test("Given a Full Admin policy is defined and IAM.1 is ignored, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-1-ignore-stack-pass", {});
      new Policy(stack, "full-admin-policy", {
        policyName: "full-admin-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          iam: { fullAdmin: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-1-ignore-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given a Full Admin policy is not defined, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-1-stack-pass", {});
      new Policy(stack, "full-ec2-policy", {
        policyName: "full-ec2-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["ec2:Describe*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[IAM.21] IAM customer managed policies that you create should not allow wildcard actions for services.", () => {
    test("Given a Wildcard policy is defined, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-21-stack-fail", {});
      new Policy(stack, "wildcard-policy", {
        policyName: "wildcard-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["ec2:*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-21-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[IAM.21] IAM customer managed policies that you create should not allow wildcard actions for services."
      );
    });

    test("Given a Wildcard policy is defined and IAM.21 is ignored, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-21-ignore-stack-pass", {});
      new Policy(stack, "wildcard-policy", {
        policyName: "wildcard-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["ec2:*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          iam: { wildcardServiceActions: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-21-ignore-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given a Wildcard policy is not defined, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-iam-21-stack-pass", {});
      new Policy(stack, "full-ec2-policy", {
        policyName: "full-ec2-policy",
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["ec2:Describe*"],
            resources: ["*"],
          }),
        ],
      });

      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-iam-21-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
