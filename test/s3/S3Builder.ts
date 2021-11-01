import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3";
import { Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class S3Builder implements IBuilder<Bucket> {
  private readonly _stack: Stack;

  private _encryption: BucketEncryption = BucketEncryption.KMS_MANAGED;

  constructor(stack: Stack) {
    this._stack = stack;
  }

  withEncryption(encryption: BucketEncryption): S3Builder {
    this._encryption = encryption;
    return this;
  }

  build(): Bucket {
    return new Bucket(this._stack, "Bucket", {
      encryption: this._encryption,
    });
  }
}
