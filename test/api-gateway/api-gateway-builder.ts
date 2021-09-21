import {
  RestApi,
  MethodLoggingLevel,
  CfnClientCertificate,
} from "@aws-cdk/aws-apigateway";
import { Stack } from "@aws-cdk/core";
import { IBuilder } from "../IBuilder";

export class ApiGatewayBuilder implements IBuilder<RestApi> {
  private readonly _stack: Stack;
  private _loggingLevel: MethodLoggingLevel = MethodLoggingLevel.ERROR;
  private _clientCertificate?: CfnClientCertificate;

  constructor(stack: Stack) {
    this._stack = stack;

    this._clientCertificate = new CfnClientCertificate(
      this._stack,
      "ClientCertificate",
      {}
    );
  }

  withLoggingLevel(loggingLevel: MethodLoggingLevel): ApiGatewayBuilder {
    this._loggingLevel = loggingLevel;

    return this;
  }

  withClientCertificate(certificate: CfnClientCertificate): ApiGatewayBuilder {
    this._clientCertificate = certificate;

    return this;
  }

  build(): RestApi {
    const api = new RestApi(this._stack, "ApiGateway", {
      deployOptions: {
        loggingLevel: this._loggingLevel,
        clientCertificateId: this._clientCertificate?.logicalId,
      },
    });

    api.root.addMethod("ANY");

    return api;
  }
}
