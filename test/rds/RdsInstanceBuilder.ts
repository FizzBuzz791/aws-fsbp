import { Vpc } from "@aws-cdk/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  MysqlEngineVersion,
} from "@aws-cdk/aws-rds";
import { Duration, Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class RdsInstanceBuilder implements IBuilder<DatabaseInstance> {
  private readonly _stack: Stack;

  private _publiclyAccessible: boolean = false;
  private _storageEncrypted: boolean = true;
  private _multiAz: boolean = true;
  private _monitoringInterval: number = 60;

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

  withMonitoringInterval(
    monitoringInterval: number
  ): IBuilder<DatabaseInstance> {
    this._monitoringInterval = monitoringInterval;
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
      monitoringInterval: Duration.seconds(this._monitoringInterval),
    });
  }
}
