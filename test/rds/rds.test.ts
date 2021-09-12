import {
  DatabaseInstanceEngine,
  MariaDbEngineVersion,
  MysqlEngineVersion,
  OracleEngineVersion,
  PostgresEngineVersion,
  SqlServerEngineVersion,
} from "@aws-cdk/aws-rds";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";
import { RdsClusterBuilder } from "./RdsClusterBuilder";
import { RdsInstanceBuilder } from "./RdsInstanceBuilder";

describe("RDS", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[RDS.2] RDS DB instances should prohibit public access", () => {
    test("Given an RDS Instance that is not publicly accessible, When synth is run, Then synth should pass", () => {
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

    test("Given an RDS Instance that is publicly accessible, When synth is run, Then synth should fail", () => {
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

    test("Given an RDS Instance that is publicly accessible and RDS.2 is ignored, When synth is run, Then synth should pass", () => {
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
    test("Given an RDS Instance that has encryption at rest enabled, When synth is run, Then synth should pass", () => {
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

    test("Given an RDS Instance that has encryption at rest disabled, When synth is run, Then synth should fail", () => {
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

    test("Given an RDS Instance that has encryption at rest disabled and RDS.3 is ignored, When synth is run, Then synth should pass", () => {
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
    test("Given an RDS Instance that is configured with multiple AZs, When synth is run, Then synth should pass", () => {
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

    test("Given an RDS Instance that is configured without multiple AZs, When synth is run, Then synth should fail", () => {
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

    test("Given an RDS Instance that is configured without multiple AZs and RDS.5 is ignored, When synth is run, Then synth should pass", () => {
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

  describe("[RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters", () => {
    test("Given an RDS Instance that is configured with enhanced monitoring, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-pass", {});
      new RdsInstanceBuilder(stack).withMonitoringInterval(60).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance that is configured without enhanced monitoring, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-fail", {});
      new RdsInstanceBuilder(stack).withMonitoringInterval(0).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters"
      );
    });

    test("Given an RDS Instance that is configured without enhanced monitoring and RDS.6 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack).withMonitoringInterval(0).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { enhancedMonitoring: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Cluster that is configured with enhanced monitoring, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-pass", {
        env: { account: "1", region: "ap-southeast-2" },
      });
      new RdsClusterBuilder(stack).withMonitoringInterval(60).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Cluster that is configured without enhanced monitoring, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-fail", {});
      new RdsClusterBuilder(stack).withMonitoringInterval(0).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(2); // A Cluster spins up two Instances.
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.6] Enhanced monitoring should be configured for RDS DB instances and clusters"
      );
    });

    test("Given an RDS Cluster that is configured without enhanced monitoring and RDS.6 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-6-stack-ignore-pass", {});
      new RdsClusterBuilder(stack).withMonitoringInterval(0).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { enhancedMonitoring: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-6-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[RDS.8] RDS DB instances should have deletion protection enabled", () => {
    test("Given an RDS Instance that is configured with deletion protection, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-8-stack-pass", {});
      new RdsInstanceBuilder(stack).withDeletionProtection(true).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-8-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance that is configured without deletion protection, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-8-stack-fail", {});
      new RdsInstanceBuilder(stack).withDeletionProtection(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-8-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.8] RDS DB instances should have deletion protection enabled"
      );
    });

    test("Given an RDS Instance that is configured without deletion protection and RDS.8 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-8-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack).withDeletionProtection(false).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { deletionProtection: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-8-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[RDS.9] Database logging should be enabled", () => {
    test("Given an RDS Instance with a MySQL Engine and Log Exports enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_5_7 })
        )
        .withLogExports(["audit", "error", "general", "slowquery"])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a MySQL Engine and no Log Exports, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-fail", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_5_7 })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.9] Database logging should be enabled"
      );
    });

    test("Given an RDS Instance with a MySQL Engine and no Log Exports and RDS.9 is ignored, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_5_7 })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { logExports: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a MariaDB Engine and Log Exports enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mariaDb({
            version: MariaDbEngineVersion.VER_10_2,
          })
        )
        .withLogExports(["audit", "error", "general", "slowquery"])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a MariaDB Engine and no Log Exports, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-fail", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mariaDb({
            version: MariaDbEngineVersion.VER_10_2,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.9] Database logging should be enabled"
      );
    });

    test("Given an RDS Instance with a MariaDB Engine and no Log Exports and RDS.9 is ignored, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.mariaDb({
            version: MariaDbEngineVersion.VER_10_2,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { logExports: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a Oracle Engine and Log Exports enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.oracleEe({
            version: OracleEngineVersion.VER_12_1,
          })
        )
        .withLogExports(["alert", "audit", "trace", "listener"])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a Oracle Engine and no Log Exports, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-fail", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.oracleEe({
            version: OracleEngineVersion.VER_12_1,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.9] Database logging should be enabled"
      );
    });

    test("Given an RDS Instance with a Oracle Engine and no Log Exports and RDS.9 is ignored, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.oracleEe({
            version: OracleEngineVersion.VER_12_1,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { logExports: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a PostgreSQL Engine and Log Exports enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_10,
          })
        )
        .withLogExports(["postgresql", "upgrade"])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a PostgreSQL Engine and no Log Exports, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-fail", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_10,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.9] Database logging should be enabled"
      );
    });

    test("Given an RDS Instance with a PostgreSQL Engine and no Log Exports and RDS.9 is ignored, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_10,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { logExports: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a SQL Server Engine and Log Exports enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.sqlServerEe({
            version: SqlServerEngineVersion.VER_11,
          })
        )
        .withLogExports(["error", "agent"])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthApp = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-pass");
      console.log(JSON.stringify(synthApp.template));
      const synthMessages = synthApp.messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an RDS Instance with a SQL Server Engine and no Log Exports, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-fail", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.sqlServerEe({
            version: SqlServerEngineVersion.VER_11,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[RDS.9] Database logging should be enabled"
      );
    });

    test("Given an RDS Instance with a SQL Server Engine and no Log Exports and RDS.9 is ignored, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-rds-9-stack-ignore-pass", {});
      new RdsInstanceBuilder(stack)
        .withEngine(
          DatabaseInstanceEngine.sqlServerEe({
            version: SqlServerEngineVersion.VER_11,
          })
        )
        .withLogExports([])
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          rds: { logExports: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-rds-9-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
