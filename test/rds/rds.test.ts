import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";
import { RdsInstanceBuilder } from "./RdsInstanceBuilder";

describe("RDS", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[RDS.2] RDS DB instances should prohibit public access", () => {
    test("Given an RDS that is not publicly accessible, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-2-stack-pass", {});
      new RdsInstanceBuilder(stack).withPublicAccess(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-2-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS that is publicly accessible, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-2-stack-fail", {});
      new RdsInstanceBuilder(stack).withPublicAccess(true).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-2-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.2] RDS DB instances should prohibit public access, determined by the PubliclyAccessible configuration"
      );
    });

    test("Given an RDS that is publicly accessible and RDS.2 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-2-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack).withPublicAccess(true).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { publicAccess: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-2-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[RDS.3] RDS DB instances should have encryption at rest enabled", () => {
    test("Given an RDS that has encryption at rest enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-3-stack-pass", {});
      new RdsInstanceBuilder(stack).withStorageEncrypted(true).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-3-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS that has encryption at rest disabled, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-3-stack-fail", {});
      new RdsInstanceBuilder(stack).withStorageEncrypted(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-3-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.3] RDS DB instances should have encryption at rest enabled"
      );
    });

    test("Given an RDS that has encryption at rest disabled and RDS.3 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-3-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack).withStorageEncrypted(false).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { storageEncrypted: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-3-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[RDS.5] RDS DB instances should be configured with multiple Availability Zones", () => {
    test("Given an RDS that is configured with multiple AZs, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-5-stack-pass", {});
      new RdsInstanceBuilder(stack).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-5-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS that is configured without multiple AZs, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-5-stack-fail", {});
      new RdsInstanceBuilder(stack).withMultiAz(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-5-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.5] RDS DB instances should be configured with multiple Availability Zones"
      );
    });

    test("Given an RDS that is configured without multiple AZs and RDS.5 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-5-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack).withMultiAz(false).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { multiAz: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-5-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
