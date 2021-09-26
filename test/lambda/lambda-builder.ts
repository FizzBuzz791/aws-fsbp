import { AssetCode, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Bucket } from "@aws-cdk/aws-s3";
import { Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class LambdaBuilder implements IBuilder<Function> {
  private readonly _stack: Stack;

  private _runtime: Runtime = Runtime.NODEJS_14_X;

  constructor(stack: Stack) {
    this._stack = stack;
  }

  withRuntime(runtime: Runtime): LambdaBuilder {
    this._runtime = runtime;
    return this;
  }

  build(): Function {
    return new Function(this._stack, "lambda-with-unsupported-runtime", {
      handler: "handler",
      code: AssetCode.fromBucket(new Bucket(this._stack, "Bucket"), "Code"),
      runtime: this._runtime,
    });
  }
}
