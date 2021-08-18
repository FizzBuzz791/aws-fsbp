import { Vpc } from "@aws-cdk/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  MysqlEngineVersion,
} from "@aws-cdk/aws-rds";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../src/aws-foundational-security-best-practices";

describe("RDS", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[RDS.2] RDS DB instances should prohibit public access", () => {
    test("Given an RDS that is not publicly accessible, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-2-stack-pass", {});
      new DatabaseInstance(stack, "rds-without-public-access", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: false,
        storageEncrypted: true,
      });
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
      new DatabaseInstance(stack, "rds-with-public-access", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: true,
        storageEncrypted: true,
      });
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
      new DatabaseInstance(stack, "rds-with-public-access", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: true,
        storageEncrypted: true,
      });
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
      new DatabaseInstance(stack, "rds-with-encryption-at-rest", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: false,
        storageEncrypted: true,
      });
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
      new DatabaseInstance(stack, "rds-without-encryption-at-rest", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: false,
        storageEncrypted: false,
      });
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
      new DatabaseInstance(stack, "rds-without-encryption-at-rest", {
        engine: DatabaseInstanceEngine.mysql({
          version: MysqlEngineVersion.VER_5_7,
        }),
        vpc: new Vpc(stack, "vpc", {}),
        publiclyAccessible: false,
        storageEncrypted: false,
      });
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
});
