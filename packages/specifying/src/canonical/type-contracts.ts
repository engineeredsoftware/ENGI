export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type ReadId = Brand<string, 'ReadId'>;
export type AssetId = Brand<string, 'AssetId'>;
export type BranchName = Brand<string, 'BranchName'>;
export type ContentRoot = Brand<string, 'ContentRoot'>;
export type UnitHash = Brand<string, 'UnitHash'>;
export type PolicyRef = Brand<string, 'PolicyRef'>;
export type LedgerAccountId = Brand<string, 'LedgerAccountId'>;
export type SignerAddress = Brand<string, 'SignerAddress'>;

export type RealizationProfileId = 'A' | 'B';
export type RealizationProfileKind = 'realization-profile';

export interface RealizationIdentity {
  readonly whoItIs: string;
  readonly operatorRole: string;
  readonly audienceMeaning: string;
}

export interface RealizationProfileDefinition {
  readonly profileId: RealizationProfileId;
  readonly label: string;
  readonly shortLabel: string;
  readonly identity: RealizationIdentity;
  readonly depositMode: string;
  readonly readMode: string;
  readonly assetPackShape: string;
  readonly settlementShape: string;
  readonly scenarioFamilies: readonly string[];
  readonly composition: readonly string[];
  readonly boundaryRealityNote: string;
}

export interface BuiltRealizationProfile {
  readonly profileKind: RealizationProfileKind;
  readonly profileDiscriminant: `realization-profile:${RealizationProfileId}`;
  readonly profileId: RealizationProfileId;
  readonly label: string;
  readonly shortLabel: string;
  readonly identity: RealizationIdentity;
  readonly depositMode: string;
  readonly readMode: string;
  readonly assetPackShape: string;
  readonly settlementShape: string;
  readonly scenarioFamilies: string[];
  readonly composition: string[];
  readonly boundaryRealityNote: string;
}

export interface RealizationProfileSubjectShape {
  readonly realizationProfileId?: string | undefined;
  readonly scenarioFamily?: string | undefined;
}

export type RealizationProfileSubject = string | RealizationProfileSubjectShape;

export type SourceContributionEntryKind = 'source-contribution-entry';
export type SettlementParticipationRecordKind = 'settlement-participation-record';
export type SourceContributionDisposition = 'positive-marginal-contribution' | 'clipped-to-zero';
export type SelectionStatus = 'selected-into-branch' | 'not-selected-into-branch';
export type SettlementStatus = 'settlement-participating' | 'excluded-from-settlement';
export type CreditDisposition = 'positive-credit' | 'zero-credit-participating' | 'no-credit-nonparticipant';
export type SettlementDisposition = 'credited-in-ledger' | 'participating-zero-credit' | 'not-in-settlement-ledger';

export interface SourceContributionDispositionInput {
  readonly clipped?: boolean | undefined;
}

export interface SettlementParticipationInput {
  readonly selected?: boolean | undefined;
  readonly settlementParticipating?: boolean | undefined;
  readonly creditedMicroUnits?: string | undefined;
  readonly contributionDisposition?: SourceContributionDisposition | undefined;
  readonly branchMode?: string | undefined;
  readonly useTier?: string | undefined;
}

export interface SettlementParticipationStruct {
  readonly recordKind: SettlementParticipationRecordKind;
  readonly selectionStatus: SelectionStatus;
  readonly settlementStatus: SettlementStatus;
  readonly creditDisposition: CreditDisposition;
  readonly settlementDisposition: SettlementDisposition;
  readonly contributionDisposition: SourceContributionDisposition;
  readonly positivelyCredited: boolean;
  readonly zeroCreditParticipating: boolean;
  readonly excludedFromSettlement: boolean;
  readonly exclusionReason: string | null;
}

export type EvaluatorMode = 'inferred' | 'static' | 'hybrid';
export type EvaluatorKind =
  | 'inferred-evaluator'
  | 'deterministic-static-command'
  | 'hybrid-pipeline-stage'
  | string;
export type MeasurementClass =
  | 'inferred-measurement'
  | 'static-analysis'
  | 'hybrid-evaluation'
  | string;
export type PromptValueType = 'string' | 'string[]' | 'object';

export interface EvaluatorSurfaceContract {
  readonly evaluatorId: string;
  readonly evaluatorKind: EvaluatorKind;
  readonly measurementClass: MeasurementClass;
  readonly mode: EvaluatorMode;
  readonly modelId: string;
  readonly promptId: string | null;
  readonly toolId: string | null;
  readonly replayableTrace: boolean;
  readonly profile: string;
  readonly standIn: boolean;
  readonly evidenceRefs: string[];
}

export interface PromptSchemaEntry {
  readonly field: string;
  readonly type: PromptValueType;
  readonly required: boolean;
}

export interface PromptContextInput {
  readonly field: string;
  readonly value: unknown;
  readonly source: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly artifactBindings?: readonly string[] | undefined;
  readonly notes?: string | null | undefined;
}

export interface PromptContractCompleteness {
  readonly ok: boolean;
  readonly missingPlaceholderBindings: string[];
  readonly unusedContextFields: string[];
  readonly undeclaredNonRenderedContextFields: string[];
}

export interface PromptContractShape {
  readonly promptId: string;
  readonly templateVersion: string;
  readonly outputFields: string[];
  readonly templateHash: string;
  readonly contextSchemaHash: string;
  readonly outputSchemaHash: string;
  readonly placeholderSet: string[];
  readonly declaredContextFields: string[];
  readonly nonRenderedContextFields: string[];
  readonly renderedContextFields: string[];
  readonly unusedContextFields: string[];
  readonly missingPlaceholderBindings: string[];
  readonly undeclaredNonRenderedContextFields: string[];
  readonly evidenceRefDigest: string;
  readonly downstreamArtifactBindings: string[];
  readonly expectedOutputSchema: PromptSchemaEntry[];
  readonly parseContractId: string;
  readonly parseMode: 'strict-json-object';
  readonly requiresExactTopLevelKeys: true;
  readonly allowsExtraneousText: false;
  readonly onParseFailure: 'reject-and-emit-telemetry';
  readonly onMissingRequiredField: 'fail-closed';
  readonly completeness: PromptContractCompleteness;
  readonly contractHash: string;
}

export interface PromptSurfaceLineage {
  readonly derivedFrom: string[];
  readonly evidenceRefs: string[];
  readonly outputFields: string[];
  readonly downstreamArtifacts: string[];
}

export interface ParsableCompletionContract {
  readonly contractId: string;
  readonly evaluatorId: string;
  readonly payloadType: PromptValueType;
  readonly schemaHash: string;
  readonly ownedOutputFields: string[];
  readonly requiredTopLevelKeys: string[];
  readonly parseMode: 'strict-json-object';
  readonly requiresExactTopLevelKeys: true;
  readonly allowsExtraneousText: false;
  readonly downstreamArtifacts: string[];
  readonly onParseFailure: 'reject-and-emit-telemetry';
  readonly onMissingRequiredField: 'fail-closed';
}

export interface BuiltPromptSurface {
  readonly promptId: string;
  readonly purpose: string;
  readonly templateVersion: string;
  readonly template: string;
  readonly interpolatedPrompt: string;
  readonly interpolatedValues: Record<string, unknown>;
  readonly contextInputs: Array<PromptContextInput & { readonly order: number; readonly evidenceRefs: string[]; readonly artifactBindings: string[]; readonly notes: string | null }>;
  readonly lineage: PromptSurfaceLineage;
  readonly promptContract: PromptContractShape;
  readonly parsableCompletionContract: ParsableCompletionContract;
  readonly evaluatorSurface: EvaluatorSurfaceContract;
}

export interface ParsedCompletionEnvelope {
  readonly envelopeId: string;
  readonly promptId: string;
  readonly parseContractId: string;
  readonly contractHash: string | null;
  readonly promptTemplateVersion: string;
  readonly parsedAt: string;
  readonly executionMode: string;
  readonly standIn: boolean;
  readonly parseOutcome: 'accepted-strict-json-object';
  readonly ownedOutputFields: string[];
  readonly requiredTopLevelKeys: string[];
  readonly normalizedParsedPayload: Record<string, unknown>;
  readonly evidenceRefs: string[];
  readonly downstreamArtifacts: string[];
  readonly evaluatorSurface: EvaluatorSurfaceContract | null;
  readonly payloadHash: string;
  readonly envelopeHash: string;
  readonly admissible: true;
}

export interface ProjectionArtifactRule {
  readonly path: string;
  readonly sensitiveDataClass: string;
  readonly disclosable: boolean;
}

export interface ProjectionPrincipalPolicy {
  readonly allowPrivateArtifacts: boolean;
  readonly allowSourceMaterial: boolean;
  readonly allowRawBranchFiles: boolean;
  readonly visibleSensitiveDataClasses: string[];
}

export interface ProjectionPolicyShape {
  readonly conformanceProfile: string;
  readonly productionIntentProfile: string;
  readonly defaultPrincipal: string;
  readonly principals: Record<string, ProjectionPrincipalPolicy>;
  readonly artifactRules: ProjectionArtifactRule[];
  readonly privateArtifactPaths: string[];
  readonly publicArtifactPaths: string[];
  readonly materializedBranchFileCount: number;
}
