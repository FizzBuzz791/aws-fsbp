import { AttributeType, Table } from "@aws-cdk/aws-dynamodb";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";
import { DynamoDbBuilder } from "./DynamoDbBuilder";

describe("DynamoDB", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand", () => {
    test("Given a Dynamo DB table without any auto-scaling, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-dynamo-1-stack-fail", {});
      new DynamoDbBuilder(stack)
        .withAutoScaleReadCapacity(0, 0)
        .withAutoScaleWriteCapacity(0, 0)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-dynamo-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand"
      );
    });

    test("Given a Dynamo DB table without read auto-scaling, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-dynamo-1-stack-read-fail", {});
      new DynamoDbBuilder(stack)
        .withAutoScaleWriteCapacity(10, 20)
        .withAutoScaleReadCapacity(0, 0)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-dynamo-1-stack-read-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand"
      );
    });

    test("Given a Dynamo DB table without write auto-scaling, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-dynamo-1-stack-write-fail", {});
      new DynamoDbBuilder(stack)
        .withAutoScaleReadCapacity(10, 20)
        .withAutoScaleWriteCapacity(0, 0)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-dynamo-1-stack-write-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[DynamoDB.1] DynamoDB tables should automatically scale capacity with demand"
      );
    });

    test("Given a Dynamo DB table with read and write auto-scaling, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-dynamo-1-stack-pass", {});
      new DynamoDbBuilder(stack)
        .withAutoScaleReadCapacity(10, 20)
        .withAutoScaleWriteCapacity(10, 20)
        .build();
      const table = new Table(stack, "test-dynamo-1-table", {
        tableName: "test-dynamo-1-table",
        partitionKey: { name: "PK", type: AttributeType.STRING },
      });
      table.autoScaleReadCapacity({ minCapacity: 10, maxCapacity: 20 });
      table.autoScaleWriteCapacity({ minCapacity: 10, maxCapacity: 20 });
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-dynamo-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given a Dynamo DB table without any auto-scaling and DynamoDB.1 is ignored, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-dynamo-1-stack-ignore-fail", {});
      new DynamoDbBuilder(stack)
        .withAutoScaleReadCapacity(0, 0)
        .withAutoScaleWriteCapacity(0, 0)
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          dynamodb: { autoScaling: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-dynamo-1-stack-ignore-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
