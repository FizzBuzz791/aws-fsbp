import { Effect, Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../src/aws-foundational-security-best-practices";

describe("IAM", () => {
  const app = new App();

  describe('[IAM.1] IAM policies should not allow full "*" administrative privileges.', () => {
    test("Given a Full Admin policy is defined, when synth is run, the synth should fail.", () => {
      const stack = new Stack(app, "test-iam-1-stack-fail", {});
      // Arrange
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

    test("Given a Full Admin policy is not defined, when synth is run, the synth should pass.", () => {
      const stack = new Stack(app, "test-iam-1-stack-pass", {});
      // Arrange
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
});
