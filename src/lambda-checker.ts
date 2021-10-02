import { CfnFunction, Runtime } from "@aws-cdk/aws-lambda";
import { Annotations } from "@aws-cdk/core";
import { BaseComplianceChecker } from "./compliance-checker";

export class LambdaConfig {
  supportedRuntimes?: boolean;
}

export class LambdaComplianceChecker extends BaseComplianceChecker<CfnFunction> {
  constructor(config: LambdaConfig) {
    super({ lambda: config });
  }

  checkCompliance(node: CfnFunction): void {
    if (this.config.lambda?.supportedRuntimes ?? true) {
      this.checkLambdaSupportedRuntime(node);
    }
  }

  #supportedLambdaRuntimes = [
    Runtime.NODEJS_14_X,
    Runtime.NODEJS_12_X,
    Runtime.NODEJS_10_X,
    Runtime.PYTHON_3_8,
    Runtime.PYTHON_3_7,
    Runtime.PYTHON_3_6,
    Runtime.RUBY_2_7,
    Runtime.RUBY_2_5,
    Runtime.JAVA_11,
    Runtime.JAVA_8,
    Runtime.JAVA_8_CORRETTO,
    Runtime.GO_1_X,
    Runtime.DOTNET_CORE_3_1,
    Runtime.DOTNET_CORE_2_1,
  ];

  /**
   * [Lambda.2] Lambda functions should use supported runtimes
   * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-lambda-2
   */
  private checkLambdaSupportedRuntime(node: CfnFunction) {
    if (!this.#supportedLambdaRuntimes.some((r) => r.name === node.runtime)) {
      Annotations.of(node).addError(
        "[Lambda.2] Lambda functions should use supported runtimes"
      );
    }
  }
}
