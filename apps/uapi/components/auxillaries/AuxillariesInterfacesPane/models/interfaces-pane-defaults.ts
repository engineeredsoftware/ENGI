/**
 * Interfaces pane preference types and default posture values.
 */

export type ProductDetailDensity = 'signal' | 'balanced' | 'full';
export type ExternalInterfaceEntry = 'mcp' | 'chatgpt' | 'packs';
export type ProofMode = 'visual' | 'mixed' | 'raw';
export type PromptTone = 'bounded' | 'formal' | 'decisive';
export type ExecutionBias = 'balanced' | 'quality' | 'throughput';

export interface InterfaceAdmissionRecord {
  interfaceId?: string;
  surface?: string;
  authMode?: string;
  readiness?: string;
  policyRequirements?: string[];
  policyConstraints?: string[];
  supportedActions?: string[];
  allowedActions?: string[];
  blockers?: string[];
  sourceSafetyClass?: string;
  deferredProductDepth?: string;
  interfaceAdmissionRoot?: string;
}

export interface InterfacesDefaults {
  productDetailDensity: ProductDetailDensity;
  externalInterfaceEntry: ExternalInterfaceEntry;
  proofMode: ProofMode;
  promptTone: PromptTone;
  executionBias: ExecutionBias;
}

export const DEFAULT_INTERFACES_DEFAULTS: InterfacesDefaults = {
  productDetailDensity: 'balanced',
  externalInterfaceEntry: 'packs',
  proofMode: 'mixed',
  promptTone: 'formal',
  executionBias: 'balanced',
};
