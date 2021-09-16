import { Vpc } from "@aws-cdk/aws-ec2";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  IInstanceEngine,
  IParameterGroup,
  MysqlEngineVersion,
  ParameterGroup,
} from "@aws-cdk/aws-rds";
import { Duration, Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class RdsInstanceBuilder implements IBuilder<DatabaseInstance> {
  private readonly _stack: Stack;

  private _publiclyAccessible: boolean = false;
  private _storageEncrypted: boolean = true;
  private _multiAz: boolean = true;
  private _monitoringInterval: number = 60;
  private _deletionProtection: boolean = true;
  private _engine: IInstanceEngine = DatabaseInstanceEngine.mysql({
    version: MysqlEngineVersion.VER_5_7,
  });
  private _logExports: string[] = ["audit", "error", "general", "slowquery"];
  private _parameterGroup: IParameterGroup;
  private _iamAuthentication: boolean = true;

  constructor(stack: Stack) {
    this._stack = stack;

    this._parameterGroup = new ParameterGroup(this._stack, "parameterGroup", {
      engine: this._engine,
    });
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

  withDeletionProtection(deletionProtection: boolean) {
    this._deletionProtection = deletionProtection;
    return this;
  }

  withEngine(engine: IInstanceEngine) {
    this._engine = engine;
    this._parameterGroup = new ParameterGroup(
      this._stack,
      `parameterGroup-${this._engine.engineType}`,
      {
        engine: this._engine,
      }
    );
    return this;
  }

  withLogExports(logExports: string[]) {
    this._logExports = logExports;

    // TODO: Testing this is set correctly.
    switch (this._engine.engineType) {
      case "mysql":
        this._parameterGroup.addParameter("general_log", "1");
        this._parameterGroup.addParameter("slow_query_log", "1");
        this._parameterGroup.addParameter("log_output", "FILE");
        break;
    }

    return this;
  }

  withIAMAuthentication(iamAuthentication: boolean) {
    this._iamAuthentication = iamAuthentication;
    return this;
  }

  build(): DatabaseInstance {
    return new DatabaseInstance(this._stack, "RdsInstance", {
      engine: this._engine,
      vpc: new Vpc(this._stack, "vpc", {}),
      publiclyAccessible: this._publiclyAccessible,
      storageEncrypted: this._storageEncrypted,
      multiAz: this._multiAz,
      monitoringInterval: Duration.seconds(this._monitoringInterval),
      deletionProtection: this._deletionProtection,
      cloudwatchLogsExports: this._logExports,
      parameterGroup: this._parameterGroup,
      iamAuthentication: this._iamAuthentication,
      autoMinorVersionUpgrade: true, // RDS.13 - TODO: Add test coverage
      copyTagsToSnapshot: true, // RDS.16 - TODO: Add test coverage
    });
  }
}
