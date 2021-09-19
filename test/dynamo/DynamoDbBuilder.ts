import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class DynamoDbBuilder implements IBuilder<Table> {
  private readonly _stack: Stack;

  private _autoScaleWriteCapacityMin: number = 10;
  private _autoScaleWriteCapacityMax: number = 20;
  private _autoScaleReadCapacityMin: number = 10;
  private _autoScaleReadCapacityMax: number = 20;
  private _pointInTimeRecovery: boolean = true;

  constructor(stack: Stack) {
    this._stack = stack;
  }

  withAutoScaleWriteCapacity(min: number, max: number): DynamoDbBuilder {
    this._autoScaleWriteCapacityMin = min;
    this._autoScaleWriteCapacityMax = max;
    return this;
  }

  withAutoScaleReadCapacity(min: number, max: number): DynamoDbBuilder {
    this._autoScaleReadCapacityMin = min;
    this._autoScaleReadCapacityMax = max;
    return this;
  }

  withPointInTimeRecovery(pointInTimeRecovery: boolean): DynamoDbBuilder {
    this._pointInTimeRecovery = pointInTimeRecovery;
    return this;
  }

  build(): Table {
    const table = new Table(this._stack, "test-dynamo-table", {
      partitionKey: { name: "", type: AttributeType.STRING },
      pointInTimeRecovery: this._pointInTimeRecovery,
    });

    if (
      this._autoScaleWriteCapacityMin > 0 &&
      this._autoScaleWriteCapacityMax > 0
    ) {
      table.autoScaleWriteCapacity({
        minCapacity: this._autoScaleWriteCapacityMin,
        maxCapacity: this._autoScaleWriteCapacityMax,
      });
    }

    if (
      this._autoScaleReadCapacityMin > 0 &&
      this._autoScaleReadCapacityMax > 0
    ) {
      table.autoScaleReadCapacity({
        minCapacity: this._autoScaleReadCapacityMin,
        maxCapacity: this._autoScaleReadCapacityMax,
      });
    }

    return table;
  }
}
