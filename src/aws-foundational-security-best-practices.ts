import { IAspect, IConstruct } from "@aws-cdk/core";
import { CfnStage } from "@aws-cdk/aws-apigateway";
import { CfnPolicy } from "@aws-cdk/aws-iam";
import { CfnFunction } from "@aws-cdk/aws-lambda";
import { CfnDBCluster, CfnDBInstance } from "@aws-cdk/aws-rds";
import { CfnTable } from "@aws-cdk/aws-dynamodb";
import { CfnAutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import {
  ApiGatewayComplianceChecker,
  ApiGatewayConfig,
} from "./api-gateway-checker";
import {
  AutoScalingGroupComplianceChecker,
  AutoScalingGroupConfig,
} from "./auto-scaling-group-checker";
import { DynamoDBComplianceChecker, DynamoDBConfig } from "./dynamo-db-checker";
import { IAMConfig, IAMPolicyComplianceChecker } from "./iam-policy-checker";
import { LambdaComplianceChecker, LambdaConfig } from "./lambda-checker";
import { RDSComplianceChecker, RDSConfig } from "./rds-compliance-checker";

export interface FSBPConfig {
  apigateway?: ApiGatewayConfig;
  autoScalingGroup?: AutoScalingGroupConfig;
  dynamodb?: DynamoDBConfig;
  iam?: IAMConfig;
  lambda?: LambdaConfig;
  rds?: RDSConfig;
}

/**
 * Ref: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html
 */
export class AWSFoundationalSecurityBestPracticesChecker implements IAspect {
  #ApiGatewayComplianceChecker: ApiGatewayComplianceChecker;
  #AutoScalingGroupComplianceChecker: AutoScalingGroupComplianceChecker;
  #DynamoDBComplianceChecker: DynamoDBComplianceChecker;
  #IAMPolicyComplianceChecker: IAMPolicyComplianceChecker;
  #LambdaComplianceChecker: LambdaComplianceChecker;
  #RDSComplianceChecker: RDSComplianceChecker;

  /**
   * Initialise a new Checker. All values in the configuration default to true if not provided.
   * @param config
   */
  constructor(
    config: FSBPConfig = {
      apigateway: {
        logging: true,
        ssl: true,
        xray: true,
        cacheDataEncrypted: true,
      },
      autoScalingGroup: {
        loadBalancerHealthCheck: true,
      },
      iam: { fullAdmin: true, wildcardServiceActions: true },
      lambda: { supportedRuntimes: true },
      rds: {
        publicAccess: true,
        storageEncrypted: true,
        multiAz: true,
        enhancedMonitoring: true,
        deletionProtection: true,
        logExports: true,
        iamAuth: true,
        autoMinorVersionUpgrades: true,
        copyTagsToSnapshot: true,
      },
      dynamodb: { autoScaling: true, pointInTimeRecovery: true },
    }
  ) {
    this.#ApiGatewayComplianceChecker = new ApiGatewayComplianceChecker(
      config.apigateway!
    );
    this.#AutoScalingGroupComplianceChecker =
      new AutoScalingGroupComplianceChecker(config.autoScalingGroup!);
    this.#DynamoDBComplianceChecker = new DynamoDBComplianceChecker(
      config.dynamodb!
    );
    this.#IAMPolicyComplianceChecker = new IAMPolicyComplianceChecker(
      config.iam!
    );
    this.#LambdaComplianceChecker = new LambdaComplianceChecker(config.lambda!);
    this.#RDSComplianceChecker = new RDSComplianceChecker(config.rds!);
  }

  public visit(node: IConstruct): void {
    if (node instanceof CfnStage) {
      this.#ApiGatewayComplianceChecker.checkCompliance(node);
    } else if (node instanceof CfnAutoScalingGroup) {
      this.#AutoScalingGroupComplianceChecker.checkCompliance(node);
    } else if (node instanceof CfnTable) {
      this.#DynamoDBComplianceChecker.checkCompliance(node);
    } else if (node instanceof CfnPolicy) {
      this.#IAMPolicyComplianceChecker.checkCompliance(node);
    } else if (node instanceof CfnFunction) {
      this.#LambdaComplianceChecker.checkCompliance(node);
    } else if (node instanceof CfnDBInstance || node instanceof CfnDBCluster) {
      this.#RDSComplianceChecker.checkCompliance(node);
    }
  }
}
