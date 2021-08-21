import { Vpc } from "@aws-cdk/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  MysqlEngineVersion,
} from "@aws-cdk/aws-rds";
import { Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class RdsInstanceBuilder implements IBuilder<DatabaseInstance> {
  private readonly _stack: Stack;
  private _publiclyAccessible: boolean = false;
  private _storageEncrypted: boolean = true;
  private _multiAz: boolean = true;

  constructor(stack: Stack) {
    this._stack = stack;
  }

  withPublicAccess(publiclyAccessible: boolean): IBuilder<DatabaseInstance> {
    this._publiclyAccessible = publiclyAccessible;
    return this;
  }

  withStorageEncrypted(storageEncrypted: boolean): IBuilder<DatabaseInstance> {
    this._storageEncrypted = storageEncrypted;
    return this;
  }

  withMultiAz(multiAz: boolean): IBuilder<DatabaseInstance> {
    this._multiAz = multiAz;
    return this;
  }

  build(): DatabaseInstance {
    return new DatabaseInstance(this._stack, "RdsInstance", {
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_5_7,
      }),
      vpc: new Vpc(this._stack, "vpc", {}),
      publiclyAccessible: this._publiclyAccessible,
      storageEncrypted: this._storageEncrypted,
      multiAz: this._multiAz,
    });
  }
}
