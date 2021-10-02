import { FSBPConfig } from "./aws-foundational-security-best-practices";

export abstract class BaseComplianceChecker<T> {
  protected readonly config: FSBPConfig;

  constructor(config: FSBPConfig) {
    this.config = config;
  }

  abstract checkCompliance(node: T): void;
}
