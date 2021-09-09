import { Vpc } from "@aws-cdk/aws-ec2";
import {
  AuroraMysqlEngineVersion,
  DatabaseCluster,
  DatabaseClusterEngine,
} from "@aws-cdk/aws-rds";
import { Duration, Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class RdsClusterBuilder implements IBuilder<DatabaseCluster> {
  private readonly _stack: Stack;

  private _monitoringInterval: number = 60;

  constructor(stack: Stack) {
    this._stack = stack;
  }

  withMonitoringInterval(interval: number): IBuilder<DatabaseCluster> {
    this._monitoringInterval = interval;
    return this;
  }

  build(): DatabaseCluster {
    return new DatabaseCluster(this._stack, "RdsCluster", {
      engine: DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      instanceProps: {
        vpc: new Vpc(this._stack, "vpc", {}),
      },
      storageEncrypted: true, // RDS.3
      monitoringInterval: Duration.seconds(this._monitoringInterval), // RDS.6
      deletionProtection: true, // RDS.8
    });
  }
}
