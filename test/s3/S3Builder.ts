import { AnyPrincipal, Effect, PolicyStatement } from "@aws-cdk/aws-iam";
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
    const bucket = new Bucket(this._stack, "Bucket", {
      encryption: this._encryption,
    });
    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:*"],
        effect: Effect.DENY,
        conditions: {
          Bool: { "aws:SecureTransport": false },
        },
        principals: [new AnyPrincipal()],
      })
    );
    return bucket;
  }
}
