import {
  CfnClientCertificate,
  MethodLoggingLevel,
} from "@aws-cdk/aws-apigateway";
import { App, Aspects, Stack } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";
import { ApiGatewayBuilder } from "./api-gateway-builder";

describe("API Gateway", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[APIGateway.1] API Gateway REST and WebSocket API logging should be enabled", () => {
    test("Given an API Gateway REST and logging is not configured, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-1-stack-fail", {});
      new ApiGatewayBuilder(stack)
        .withLoggingLevel(MethodLoggingLevel.OFF)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-1-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[APIGateway.1] API Gateway REST and WebSocket API logging should be enabled"
      );
    });

    test("Given an API Gateway REST and logging is configured, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-1-stack-pass", {});
      new ApiGatewayBuilder(stack)
        .withLoggingLevel(MethodLoggingLevel.INFO)
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-1-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an API Gateway REST and logging is not configured and API Gateway.1 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-1-stack-ignore-pass", {});
      new ApiGatewayBuilder(stack)
        .withLoggingLevel(MethodLoggingLevel.OFF)
        .build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          apigateway: { logging: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-1-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[APIGateway.2] API Gateway REST API stages should be configured to use SSL certificates for backend authentication", () => {
    test("Given API Gateway REST API stages without an SSL certificate, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-2-stack-fail", {});
      new ApiGatewayBuilder(stack).withClientCertificate(undefined).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-2-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[APIGateway.2] API Gateway REST API stages should be configured to use SSL certificates for backend authentication"
      );
    });

    test("Given API Gateway REST API stages with an SSL certificates, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-2-stack-pass", {});
      new ApiGatewayBuilder(stack)
        .withClientCertificate(new CfnClientCertificate(stack, "cert"))
        .build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-2-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given API Gateway REST API stages without an SSL certificate and API Gateway.2 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-2-stack-ignore-pass", {});
      new ApiGatewayBuilder(stack).withClientCertificate(undefined).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          apigateway: { ssl: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-2-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[APIGateway.3] API Gateway REST API stages should have AWS X-Ray tracing enabled", () => {
    test("Given API Gateway REST API stages with X-Ray tracing disabled, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-3-stack-fail", {});
      new ApiGatewayBuilder(stack).withTracingEnabled(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-3-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[APIGateway.3] API Gateway REST API stages should have AWS X-Ray tracing enabled"
      );
    });

    test("Given API Gateway REST API stages with X-Ray tracing enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-3-stack-pass", {});
      new ApiGatewayBuilder(stack).withTracingEnabled(true).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-3-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given API Gateway REST API stages with X-Ray tracing disabled and API Gateway.3 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-3-stack-ignore-pass", {});
      new ApiGatewayBuilder(stack).withTracingEnabled(false).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          apigateway: { xray: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-3-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  describe("[APIGateway.5] API Gateway REST API cache data should be encrypted at rest", () => {
    test("Given API Gateway REST API stages with cache encryption disabled, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-5-stack-fail", {});
      new ApiGatewayBuilder(stack).withCacheDataEncrypted(false).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-5-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[APIGateway.5] API Gateway REST API cache data should be encrypted at rest"
      );
    });

    test("Given API Gateway REST API stages with cache encryption enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-5-stack-pass", {});
      new ApiGatewayBuilder(stack).withCacheDataEncrypted(true).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-5-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given API Gateway REST API stages with cache encryption disabled and API Gateway.5 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-api-gateway-5-stack-ignore-pass", {});
      new ApiGatewayBuilder(stack).withCacheDataEncrypted(false).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          apigateway: { cacheDataEncrypted: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-api-gateway-5-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });
});
