import { CfnStage, MethodLoggingLevel } from "@aws-cdk/aws-apigateway";
import { Annotations, isResolvableObject } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export interface ApiGatewayConfig {
  logging?: boolean;
  ssl?: boolean;
  xray?: boolean;
  cacheDataEncrypted?: boolean;
}

export class ApiGatewayComplianceChecker extends BaseComplianceChecker<CfnStage> {
  constructor(config: ApiGatewayConfig) {
    super({ apigateway: config });
  }

  checkCompliance(node: CfnStage): void {
    if (this.config.apigateway?.logging ?? true) {
      this.checkAPILogging(node);
    }

    if (this.config.apigateway?.ssl ?? true) {
      this.checkSSL(node);
    }

    if (this.config.apigateway?.xray ?? true) {
      this.checkXRay(node);
    }

    if (this.config.apigateway?.cacheDataEncrypted ?? true) {
      this.checkCacheEncrypted(node);
    }
  }

  /**
   * [APIGateway.1] API Gateway REST and WebSocket API logging should be enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-1
   */
  private checkAPILogging(node: CfnStage) {
    if (!node.methodSettings) {
      // No explicit method settings defined, raise an error.
      Annotations.of(node).addError(
        "[APIGateway.1] API Gateway REST and WebSocket API logging should be enabled"
      );
    } else {
      if (
        !isResolvableObject(node.methodSettings) &&
        node.methodSettings.some(
          (m) =>
            !isResolvableObject(m) &&
            (m.loggingLevel === undefined ||
              m.loggingLevel === MethodLoggingLevel.OFF)
        )
      ) {
        // Explicit method settings defined, but not all of them have logging or logging is explicitly off.
        Annotations.of(node).addError(
          "[APIGateway.1] API Gateway REST and WebSocket API logging should be enabled"
        );
      }
    }
  }

  /**
   * [APIGateway.2] API Gateway REST API stages should be configured to use SSL certificates for backend authentication
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-2
   */
  private checkSSL(node: CfnStage) {
    if (!node.clientCertificateId) {
      Annotations.of(node).addError(
        "[APIGateway.2] API Gateway REST API stages should be configured to use SSL certificates for backend authentication"
      );
    }
  }

  /**
   * [APIGateway.3] API Gateway REST API stages should have AWS X-Ray tracing enabled
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-3
   */
  private checkXRay(node: CfnStage) {
    if (!isResolvableObject(node.tracingEnabled) && !node.tracingEnabled) {
      Annotations.of(node).addError(
        "[APIGateway.3] API Gateway REST API stages should have AWS X-Ray tracing enabled"
      );
    }
  }

  /**
   * [APIGateway.5] API Gateway REST API cache data should be encrypted at rest
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-apigateway-5
   */
  private checkCacheEncrypted(node: CfnStage) {
    if (!node.methodSettings) {
      Annotations.of(node).addError(
        "[APIGateway.5] API Gateway REST API cache data should be encrypted at rest"
      );
    } else {
      if (
        !isResolvableObject(node.methodSettings) &&
        node.methodSettings.some(
          (m) =>
            !isResolvableObject(m) && m.cachingEnabled && !m.cacheDataEncrypted
        )
      ) {
        Annotations.of(node).addError(
          "[APIGateway.5] API Gateway REST API cache data should be encrypted at rest"
        );
      }
    }
  }
}
