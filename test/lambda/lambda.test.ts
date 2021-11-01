import { AssetCode, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Bucket } from "@aws-cdk/aws-s3";
import { App, Aspects, Stack } from "@aws-cdk/core";
import {
  AWSFoundationalSecurityBestPracticesChecker,
  FSBPConfig,
} from "../../src/aws-foundational-security-best-practices";
import { LambdaBuilder } from "./lambda-builder";

describe("Lambda", () => {
  let app: App;
  let config: FSBPConfig = { s3: { serverSideEncryption: false } };

  beforeEach(() => {
    app = new App();
  });

  describe("[Lambda.2] Lambda functions should use supported runtimes", () => {
    test("Given an unsupported Lambda runtime is used, When synth is run, Then synth should fail.", () => {
      // Arrange
      const stack = new Stack(app, "test-lambda-2-stack-fail", {});
      new LambdaBuilder(stack).withRuntime(Runtime.NODEJS).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker(config)
      );
      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-lambda-2-stack-fail").messages;
      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[Lambda.2] Lambda functions should use supported runtimes"
      );
    });

    test("Given an unsupported Lambda runtime is used and Lambda.2 is ignored, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-lambda-2-ignore-stack-pass", {});
      new LambdaBuilder(stack).withRuntime(Runtime.NODEJS).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          ...config,
          lambda: { supportedRuntimes: false },
        })
      );
      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-lambda-2-ignore-stack-pass").messages;
      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given a supported Lambda runtime is used, When synth is run, Then synth should pass.", () => {
      // Arrange
      const stack = new Stack(app, "test-lambda-2-stack-pass", {});
      new LambdaBuilder(stack).withRuntime(Runtime.NODEJS_14_X).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker(config)
      );
      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-lambda-2-stack-pass").messages;
      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
