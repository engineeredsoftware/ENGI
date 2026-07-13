import { createHash } from 'node:crypto';
import { z } from 'zod';
import { extractJsonFromResponse } from '@bitcode/parsing';
import { factoryLLMRegistryWithProviders, resolveDefaultLLMConfig } from '@bitcode/generic-llms';
import type { LLM } from '@bitcode/llm-generics';
import type {
  DepositoryFitResultEvidence,
  DepositorySearchRead,
} from './depository-search';
import { isAssetPackRealInferenceEnabled } from './runtime-inference-policy';
import {
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  listReadingPipelineTelemetryTrace,
} from './reading-pipeline-contract';

export type ReadNeedReviewState =
  | 'needs_acceptance'
  | 'accepted'
  | 'rejected'
  | 'resynthesis_requested';

export interface ReadNeedMeasurementDimension {
  dimension: string;
  weight: number;
  volume: number;
}

export interface ReadNeedRequest {
  schema: 'bitcode.read.request';
  requestId: string;
  prompt: string;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  targetArtifactKinds: string[];
  closureCriteria: string[];
  failureModes: string[];
  feedbackHistory: string[];
  previousNeedId?: string | null;
}

export interface ReadNeed {
  schema: 'bitcode.read.need';
  needId: string;
  reviewState: ReadNeedReviewState;
  measurementRoot: string;
  request: ReadNeedRequest;
  read: {
    id?: string | null;
    prompt: string;
    repositoryFullName?: string | null;
    sourceBranch?: string | null;
    sourceCommit?: string | null;
  };
  requirements: string[];
  closureCriteria: string[];
  failureModes: string[];
  targetArtifactKinds: string[];
  sourceConstraints: {
    repositoryFullName?: string | null;
    sourceBranch?: string | null;
    sourceCommit?: string | null;
    protectedSourceDisclosure: 'forbidden_before_settlement';
  };
  proofExpectations: string[];
  pricingMeasurementInputs: {
    measurementVector: ReadNeedMeasurementDimension[];
    weightedRequestedVolume: number;
    shareToFeeFormula: string;
  };
  feedbackHistory: string[];
  review?: {
    status: 'accepted' | 'rejected';
    acceptedAt?: string;
    acceptanceRoot?: string;
    nextStage?: 'finding_fits';
    rejectedAt?: string;
    rejectionRoot?: string;
    blockedStage?: 'finding_fits';
    feedbackHistory?: string[];
  };
  inferenceReceipt?: ReadNeedComprehensionSynthesisInferenceReceipt;
}

export interface ReadNeedComprehensionSynthesisInferenceReceipt {
  schema: 'bitcode.read-need-comprehension-synthesis.inference-receipt';
  pipelineName: typeof READ_NEED_COMPREHENSION_SYNTHESIS;
  receiptId: string;
  needId: string;
  requestId: string;
  reviewState: ReadNeedReviewState;
  mode: 'deterministic-fallback' | 'real-inference';
  phaseIds: string[];
  agentIds: string[];
  ptrrStepIds: string[];
  failsafeSequenceIds: string[];
  thinkingsGenerationIds: string[];
  promptTemplateIds: string[];
  interpolationContextKeys: string[];
  outputSchemaIds: string[];
  telemetryEventIds: string[];
  sourceSafety: {
    protectedSourceVisible: false;
    rawProviderResponseVisible: false;
    unpaidAssetPackSourceVisible: false;
    credentialsSerialized: false;
  };
  reviewBoundary: {
    supportsResynthesisWithFeedback: true;
    acceptedNeedRequiredForFindingFits: true;
    feedbackHistoryCount: number;
    previousNeedId: string | null;
  };
  roots: {
    receiptRoot: string;
    measurementRoot: string;
    promptTemplateRoot: string;
    telemetryTraceRoot: string;
    typedOutputRoot: string;
  };
}

export interface ReadFitsFindingAdmission {
  admitted: boolean;
  blockers: string[];
  acceptedNeed: ReadNeed | null;
}

export type AssetPackReadRightState =
  | 'owner_read'
  | 'licensed_read'
  | 'pending_settlement'
  | 'denied';

export interface ShareToFeeQuote {
  formula: string;
  needId: string;
  needMeasurementRoot: string;
  measurementVector: ReadNeedMeasurementDimension[];
  admittedFitQuality: number;
  weightedAdmittedVolume: number;
  sats: number;
  feeSchedule: {
    satsPerWeightedVolume: number;
    minimumSats: number;
    dustFloorSats: number;
    networkFeePosture: 'reader_wallet_authorized_before_broadcast';
  };
  finalityState: 'preview_not_paid';
  payer: 'reader';
  quoteRoot: string;
}

export interface AssetPackSourceSafePreview {
  schema: 'bitcode.asset-pack.source-safe-preview';
  previewId: string;
  assetPackId: string;
  need: {
    needId: string;
    measurementRoot: string;
    reviewState: ReadNeedReviewState;
    acceptanceRoot: string | null;
  };
  fit: {
    resultState: string;
    resultReasons: string[];
    admittedFitQuality: number;
    fitDepositAssetIds: string[];
    selectedCandidateAssetIds: string[];
    queryRoot: string | null;
    rankingRoot: string | null;
    searchedAssetCount: number;
    embeddingPolicy: unknown;
    scoreBand: 'high' | 'reviewable' | 'blocked' | 'none';
  };
  measurements: {
    needVector: ReadNeedMeasurementDimension[];
    weightedRequestedVolume: number;
    weightedAdmittedVolume: number;
  };
  roots: {
    needMeasurementRoot: string;
    queryRoot: string | null;
    rankingRoot: string | null;
    proofRoot: string;
    sourceManifestRoot: string;
    previewRoot: string;
  };
  feeQuote: ShareToFeeQuote;
  rangeProjection: {
    status: 'projected_not_minted';
    tokenCount: number;
    normalizedBitcodeVolume: number;
    rangeStart: number | null;
    rangeEndExclusive: number | null;
    projectionRoot: string;
  };
  disclosurePolicy: {
    protectedSourceDisclosure: 'forbidden_before_settlement';
    visibleBeforeSettlement: string[];
    withheldBeforeSettlement: string[];
  };
  accessPolicy: {
    accessPolicyId: string;
    accessPolicyHash: string;
    readRightState: AssetPackReadRightState;
  };
  settlementBoundary: {
    payer: 'reader';
    payee: 'depositor';
    serverCustody: false;
    btcFeeRequired: true;
    readbackRequiredBeforeUnlock: true;
    ownershipTruth: 'asset_pack_range_and_license_rows';
  };
  unlock: {
    state: AssetPackReadRightState;
    sourceAvailable: boolean;
    reason: string;
  };
  delivery: {
    pullRequestTarget: string | null;
    availableAfterSettlement: true;
  };
  createdAt: string;
}

type ReadNeedSourceInput = {
  read?: unknown;
  definitionOfRead?: unknown;
  readRequest?: unknown;
  sourceRevision?: unknown;
  repository?: unknown;
  readMeasurement?: unknown;
  targetArtifactKinds?: unknown;
  targetKinds?: unknown;
  closureCriteria?: unknown;
  failureModes?: unknown;
  feedback?: unknown;
  readNeed?: unknown;
  previousReadNeed?: unknown;
};

const inferredStringListSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string') return [value];
    return value;
  },
  z.array(z.string()).default([]),
);

export const ReadNeedComprehensionSynthesisSchema = z.object({
  requirements: inferredStringListSchema,
  closureCriteria: inferredStringListSchema,
  failureModes: inferredStringListSchema,
  targetArtifactKinds: inferredStringListSchema,
  proofExpectations: inferredStringListSchema,
}).strict();

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = stringValue(value);
    if (candidate) return candidate;
  }
  return null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => stringValue(entry))
    .filter(Boolean);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getPath(value: unknown, path: string[]): unknown {
  let cursor = value;
  for (const part of path) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

function normalizeArtifactKind(value: string): string {
  return value.toLowerCase().replace(/[_\s]+/g, '-');
}

function priorReadNeed(input: ReadNeedSourceInput): Record<string, unknown> | null {
  const direct = recordValue(input.readNeed);
  if (direct?.schema === 'bitcode.read.need') return direct;
  const previous = recordValue(input.previousReadNeed);
  return previous?.schema === 'bitcode.read.need' ? previous : null;
}

function normalizeSource(input: ReadNeedSourceInput) {
  const readRecord = recordValue(input.read);
  const requestRecord = recordValue(input.readRequest);
  const sourceRevision = recordValue(input.sourceRevision);
  const repository = recordValue(input.repository);
  const readMeasurement = recordValue(input.readMeasurement);
  const prompt = firstString(
    typeof input.read === 'string' ? input.read : undefined,
    readRecord?.prompt,
    readRecord?.read,
    requestRecord?.prompt,
    requestRecord?.read,
    input.definitionOfRead,
    readMeasurement?.prompt,
    readMeasurement?.summary
  ) || '';

  return {
    id: firstString(readRecord?.id, readRecord?.readId, requestRecord?.id, requestRecord?.readId, readMeasurement?.id),
    prompt,
    repositoryFullName: firstString(
      sourceRevision?.repositoryFullName,
      repository?.fullName,
      repository?.repositoryFullName,
      repository?.repo,
      readRecord?.repositoryFullName,
      requestRecord?.repositoryFullName,
      readMeasurement?.repositoryFullName,
      getPath(readMeasurement, ['scenario', 'repo'])
    ),
    sourceBranch: firstString(
      sourceRevision?.branch,
      repository?.branch,
      readRecord?.sourceBranch,
      requestRecord?.sourceBranch,
      readMeasurement?.sourceBranch
    ),
    sourceCommit: firstString(
      sourceRevision?.commit,
      repository?.commit,
      readRecord?.sourceCommit,
      requestRecord?.sourceCommit,
      readMeasurement?.sourceCommit
    ),
  };
}

function normalizeTargetArtifactKinds(input: ReadNeedSourceInput): string[] {
  const readRecord = recordValue(input.read);
  const requestRecord = recordValue(input.readRequest);
  const readMeasurement = recordValue(input.readMeasurement);
  const kinds = [
    ...stringArray(input.targetArtifactKinds),
    ...stringArray(input.targetKinds),
    ...stringArray(readRecord?.targetArtifactKinds),
    ...stringArray(readRecord?.targetKinds),
    ...stringArray(requestRecord?.targetArtifactKinds),
    ...stringArray(requestRecord?.targetKinds),
    ...stringArray(readMeasurement?.targetArtifactKinds),
  ];
  const normalized = [...new Set(kinds.map(normalizeArtifactKind).filter(Boolean))];
  return normalized.length
    ? normalized
    : ['repository-revision', 'asset-pack-evidence', 'proof-root', 'reconciliation-readback'];
}

function defaultRequirements(read: ReturnType<typeof normalizeSource>): string[] {
  return [
    'Understand the reader request as a bounded source-reading need before searching the depository.',
    'Find source-bound deposited evidence that satisfies the accepted Need, not merely related prose.',
    'Preserve proof, measurement, and reconciliation readback requirements through Finding Fits and AssetPack synthesis.',
    'Prevent protected source disclosure before preview approval and settlement readback.',
    ...(read.repositoryFullName ? [`Bind Fit candidates to repository ${read.repositoryFullName}.`] : []),
    ...(read.sourceCommit ? [`Bind Fit candidates to source commit ${read.sourceCommit}.`] : []),
  ];
}

function defaultClosureCriteria(read: ReturnType<typeof normalizeSource>): string[] {
  return [
    'The Need has requirements, target artifact kinds, proof expectations, and failure modes.',
    'Finding Fits discovery is source-bound to the accepted Need repository, branch, and commit constraints.',
    'The Fit result exposes query root, ranking root, fit deposit ids, score evidence, and proof/readback posture.',
    'The AssetPack preview excludes protected source material before settlement.',
    'BTC fee, ownership, license, journal, and ledger rows must be read back before unlock.',
    ...(read.prompt ? [`The Fit must satisfy: ${read.prompt}`] : []),
  ];
}

function defaultFailureModes(): string[] {
  return [
    'need_not_accepted',
    'repository_mismatch',
    'source_commit_mismatch',
    'proof_or_measurement_missing',
    'source_preview_before_settlement',
    'ledger_database_readback_missing',
  ];
}

function measurementVectorForNeed(
  read: ReturnType<typeof normalizeSource>,
  targetArtifactKinds: string[],
  closureCriteria: string[]
): ReadNeedMeasurementDimension[] {
  const promptVolume = Math.max(1, Math.ceil(read.prompt.length / 160));
  const targetVolume = Math.max(1, targetArtifactKinds.length);
  const closureVolume = Math.max(1, closureCriteria.length);
  return [
    { dimension: 'semantic_relevance', weight: 0.36, volume: promptVolume },
    { dimension: 'source_binding', weight: 0.24, volume: read.repositoryFullName ? 1 : 0 },
    { dimension: 'artifact_kind_fit', weight: 0.20, volume: targetVolume },
    { dimension: 'closure_specificity', weight: 0.20, volume: closureVolume },
  ];
}

function weightedMeasurementVolume(vector: ReadNeedMeasurementDimension[], admittedFitQuality = 1): number {
  return Number(vector
    .reduce((total, entry) => total + (entry.weight * entry.volume * admittedFitQuality), 0)
    .toFixed(6));
}

function clampQuality(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function readNeedReceiptRoot(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function buildReadNeedComprehensionSynthesisInferenceReceipt(
  need: Omit<ReadNeed, 'inferenceReceipt'>,
  mode: ReadNeedComprehensionSynthesisInferenceReceipt['mode']
): ReadNeedComprehensionSynthesisInferenceReceipt {
  const trace = listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT);
  const phaseIds = READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId);
  const agentIds = READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
    phase.agents.map((agent) => agent.agentId)
  );
  const promptTemplateIds = uniqueStrings(
    READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
      phase.agents.flatMap((agent) => [
        agent.promptRegistry.agentPromptId,
        ...Object.values(agent.promptRegistry.ptrrStepPromptIds),
        ...agent.ptrrSteps.flatMap((step) => step.prompt?.templateId ? [step.prompt.templateId] : []),
        ...agent.ptrrSteps.flatMap((step) => step.thinkingsGenerations.flatMap((generation) => [
          generation.reasonPromptId,
          generation.judgePromptId,
          generation.structuredOutputPromptId,
        ])),
      ])
    )
  );
  const interpolationContextKeys = uniqueStrings(
    READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
      phase.agents.flatMap((agent) =>
        agent.ptrrSteps.flatMap((step) => step.prompt?.interpolatedContextKeys || [])
      )
    )
  );
  const outputSchemaIds = uniqueStrings([
    ...trace.map((entry) => entry.outputType),
    ...READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
      phase.agents.map((agent) => agent.returnType)
    ),
  ]);
  const telemetryEventIds = uniqueStrings(trace.flatMap((entry) => entry.telemetry));
  const ptrrStepIds = trace.map((entry) => entry.ptrrStepId);
  const thinkingsGenerationIds = uniqueStrings(trace.flatMap((entry) => entry.thinkingsGenerationIds));
  const failsafeSequenceIds = uniqueStrings(
    trace.flatMap((entry) =>
      entry.thinkingsGenerations.map((generation) =>
        `${entry.ptrrStepId}.${generation.failsafe}`
      )
    )
  );
  const promptTemplateRoot = readNeedReceiptRoot({
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    promptTemplateIds,
    interpolationContextKeys,
  });
  const telemetryTraceRoot = readNeedReceiptRoot({
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    telemetryEventIds,
  });
  const typedOutputRoot = readNeedReceiptRoot({
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    requirements: need.requirements,
    closureCriteria: need.closureCriteria,
    failureModes: need.failureModes,
    targetArtifactKinds: need.targetArtifactKinds,
    proofExpectations: need.proofExpectations,
    measurementRoot: need.measurementRoot,
  });
  const receiptRoot = readNeedReceiptRoot({
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    mode,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    promptTemplateRoot,
    telemetryTraceRoot,
    typedOutputRoot,
  });

  return {
    schema: 'bitcode.read-need-comprehension-synthesis.inference-receipt',
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    receiptId: `read-need-receipt-${sha256(receiptRoot).slice(0, 16)}`,
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    mode,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    promptTemplateIds,
    interpolationContextKeys,
    outputSchemaIds,
    telemetryEventIds,
    sourceSafety: {
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
    },
    reviewBoundary: {
      supportsResynthesisWithFeedback: true,
      acceptedNeedRequiredForFindingFits: true,
      feedbackHistoryCount: need.feedbackHistory.length,
      previousNeedId: need.request.previousNeedId || null,
    },
    roots: {
      receiptRoot,
      measurementRoot: need.measurementRoot,
      promptTemplateRoot,
      telemetryTraceRoot,
      typedOutputRoot,
    },
  };
}

function withReadNeedInferenceReceipt(
  need: Omit<ReadNeed, 'inferenceReceipt'>,
  mode: ReadNeedComprehensionSynthesisInferenceReceipt['mode'] = 'deterministic-fallback'
): ReadNeed {
  return {
    ...need,
    inferenceReceipt: buildReadNeedComprehensionSynthesisInferenceReceipt(need, mode),
  };
}

function withoutReadNeedInferenceReceipt(need: ReadNeed): Omit<ReadNeed, 'inferenceReceipt'> {
  const { inferenceReceipt: _receipt, ...baseNeed } = need;
  return baseNeed;
}

function storeReadNeedInferenceReceipt(execution: any, receipt: ReadNeedComprehensionSynthesisInferenceReceipt): void {
  try {
    execution?.store?.('read-need-comprehension', 'inferenceReceipt', receipt);
    execution?.store?.('read-need-comprehension', 'receiptRoot', receipt.roots.receiptRoot);
    execution?.store?.('read-need-comprehension', 'telemetryTraceRoot', receipt.roots.telemetryTraceRoot);
    execution?.store?.('read-need-comprehension', 'sourceSafety', receipt.sourceSafety);
  } catch {
    // Receipt storage must never make Need synthesis fail after typed output exists.
  }
}

export function synthesizeReadNeedForPipelineInput(input: ReadNeedSourceInput): ReadNeed {
  const read = normalizeSource(input);
  const targetArtifactKinds = normalizeTargetArtifactKinds(input);
  const previousNeed = priorReadNeed(input);
  const explicitClosureCriteria = [
    ...stringArray(input.closureCriteria),
    ...stringArray(recordValue(input.read)?.closureCriteria),
    ...stringArray(recordValue(input.readRequest)?.closureCriteria),
    ...stringArray(recordValue(input.readMeasurement)?.closureCriteria),
  ];
  const closureCriteria = explicitClosureCriteria.length
    ? uniqueStrings(explicitClosureCriteria)
    : defaultClosureCriteria(read);
  const failureModes = [
    ...defaultFailureModes(),
    ...stringArray(input.failureModes),
    ...stringArray(recordValue(input.read)?.failureModes),
    ...stringArray(recordValue(input.readRequest)?.failureModes),
  ];
  const feedbackHistory = uniqueStrings([
    ...stringArray(previousNeed?.feedbackHistory),
    ...stringArray(recordValue(previousNeed?.request)?.feedbackHistory),
    ...stringArray(recordValue(input.readRequest)?.feedback),
    ...stringArray(input.feedback),
  ]);
  const measurementVector = measurementVectorForNeed(read, targetArtifactKinds, closureCriteria);
  const readRequest: ReadNeedRequest = {
    schema: 'bitcode.read.request',
    requestId: read.id || `request-${sha256(stableStringify({ read, targetArtifactKinds })).slice(0, 16)}`,
    prompt: read.prompt,
    repositoryFullName: read.repositoryFullName,
    sourceBranch: read.sourceBranch,
    sourceCommit: read.sourceCommit,
    targetArtifactKinds,
    closureCriteria,
    failureModes: uniqueStrings(failureModes),
    feedbackHistory,
    previousNeedId: firstString(previousNeed?.needId),
  };
  const seed = {
    request: readRequest,
    read,
    targetArtifactKinds,
    closureCriteria,
    feedbackHistory,
    measurementVector,
  };
  const measurementRoot = `sha256:${sha256(stableStringify({
    read,
    targetArtifactKinds,
    closureCriteria,
    measurementVector,
  }))}`;

  const need: Omit<ReadNeed, 'inferenceReceipt'> = {
    schema: 'bitcode.read.need',
    needId: `need-${sha256(stableStringify(seed)).slice(0, 16)}`,
    reviewState: 'needs_acceptance',
    measurementRoot,
    request: readRequest,
    read,
    requirements: defaultRequirements(read),
    closureCriteria,
    failureModes: readRequest.failureModes,
    targetArtifactKinds,
    sourceConstraints: {
      repositoryFullName: read.repositoryFullName,
      sourceBranch: read.sourceBranch,
      sourceCommit: read.sourceCommit,
      protectedSourceDisclosure: 'forbidden_before_settlement',
    },
    proofExpectations: [
      'source-bound fit deposit ranking root',
      'proof root',
      'measurement evidence',
      'settlement readback before unlock',
    ],
    pricingMeasurementInputs: {
      measurementVector,
      weightedRequestedVolume: weightedMeasurementVolume(measurementVector),
      shareToFeeFormula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
    },
    feedbackHistory,
  };

  return withReadNeedInferenceReceipt(need);
}

// ---------------------------------------------------------------------------
// ReadNeedComprehensionSynthesis real inference (non-configurable)
//
// There is no profile and no deterministic fallback: when real inference is
// enabled (the master /deposit switch), the Need comprehension ALWAYS performs
// real generation through one ThinkingsGeneration (reason -> judge ->
// structured output). Determinism for tests comes from mocking the LLM provider
// at the boundary (execution LLM registry), never from a branch in here.
// ---------------------------------------------------------------------------

type ReadNeedResolvedLLM = { llm: LLM; model?: string; provider?: string; source: string };

const readNeedStringListSchema = z.preprocess(
  (value) => (typeof value === 'string' ? [value] : value),
  z.array(z.string()).default([]),
);

const ReadNeedReasoningSchema = z.object({
  analysis: z.string().default(''),
  steps: readNeedStringListSchema,
  conclusion: z.string().default(''),
  confidence: z.coerce.number().min(0).max(1).catch(0),
  useTools: z.array(z.any()).optional(),
});

const ReadNeedJudgmentSchema = z.object({
  quality: z.coerce.number().min(0).max(1).catch(0),
  issues: readNeedStringListSchema,
  suggestions: readNeedStringListSchema,
  approved: z.preprocess((value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return value;
  }, z.boolean().default(false)),
});

function createReadNeedInferenceNode(execution: any, agentName: string): any {
  if (typeof execution?.child === 'function') {
    return execution.child(`agent:${agentName}:inference`);
  }
  return execution;
}

function resolveReadNeedConfiguredLLM(execution: any, agentExecution: any): ReadNeedResolvedLLM | undefined {
  const candidates = [
    execution?.getRoot?.(),
    execution,
    agentExecution?.getRoot?.(),
    agentExecution,
  ];
  for (const candidate of candidates) {
    try {
      const llm = candidate?.llms?.getDefaultLLM?.();
      if (llm) return { llm, source: 'execution-registry' };
    } catch {}
  }
  return undefined;
}

function readNeedHasProviderCredential(provider: string): boolean {
  switch (provider.toLowerCase()) {
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY);
    case 'anthropic':
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case 'google':
      return Boolean(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY
      );
    default:
      return true;
  }
}

function resolveReadNeedEnvironmentLLM(): ReadNeedResolvedLLM | undefined {
  const { provider, model } = resolveDefaultLLMConfig();
  if (!readNeedHasProviderCredential(provider)) return undefined;
  try {
    const registry = factoryLLMRegistryWithProviders();
    if (typeof (registry as any).setDefaultProvider === 'function') {
      (registry as any).setDefaultProvider(provider);
    }
    registry.configure('*', {
      model,
      responseFormat: 'json',
      temperature: 0.2,
      maxTokens: 4096,
    });
    return {
      llm: registry.getLLM(['*'], provider),
      provider,
      model,
      source: 'environment-registry',
    };
  } catch {
    return undefined;
  }
}

function mergeReadNeedUsage(...usages: Array<Record<string, number> | undefined>): Record<string, number> | undefined {
  const merged: Record<string, number> = {};
  for (const usage of usages) {
    if (!usage) continue;
    for (const [key, value] of Object.entries(usage)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        merged[key] = (merged[key] || 0) + value;
      }
    }
  }
  return Object.keys(merged).length ? merged : undefined;
}

async function runReadNeedComprehensionInference<T>(params: {
  agentName: string;
  phase: string;
  step?: string;
  systemPrompt: string;
  userPrompt: string;
  promptTemplate?: { system?: string; user?: string; templateId?: string };
  schema: z.ZodType<T>;
  execution: any;
}): Promise<T> {
  const { agentName, phase, step = 'try', systemPrompt, userPrompt, promptTemplate, schema, execution } = params;
  const agentExecution = createReadNeedInferenceNode(execution, agentName);
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  try {
    agentExecution?.store?.('phase', 'current', phase);
    agentExecution?.store?.('agent', 'name', agentName);
    agentExecution?.store?.('step', 'name', step);
    agentExecution?.store?.('bounded-inference', 'mode', 'thinkings-generation');
    agentExecution?.store?.('bounded-inference', 'stack', {
      ptrrStep: step,
      failsafeSequence: ['prepare-concise-context', 'chunk-then-sum', 'stitch-until-complete'],
      thinkingsGenerationStages: ['reason', 'judge', 'structured_output'],
    });
    agentExecution?.store?.('llm', 'input', {
      messages,
      promptTemplate: promptTemplate || { system: systemPrompt, user: userPrompt },
      interpolatedPrompt: { system: systemPrompt, user: userPrompt },
      phase,
      agent: agentName,
      step,
      failsafeSequence: ['prepare-concise-context', 'chunk-then-sum', 'stitch-until-complete'],
      generation: 'thinkings-generation',
      generationSequence: ['reason', 'judge', 'structured_output'],
    });
  } catch {}

  const resolvedLLM = resolveReadNeedConfiguredLLM(execution, agentExecution) ?? resolveReadNeedEnvironmentLLM();
  if (!resolvedLLM) {
    const error = 'Real AssetPack inference is enabled, but no configured LLM could be resolved.';
    try {
      agentExecution?.store?.('bounded-inference', 'status', 'blocked-no-llm');
      agentExecution?.store?.('bounded-inference', 'error', error);
    } catch {}
    throw new Error(error);
  }

  try {
    try {
      agentExecution?.store?.('bounded-inference', 'provider', {
        source: resolvedLLM.source,
        provider: resolvedLLM.provider,
        model: resolvedLLM.model,
      });
    } catch {}

    const reasoningOutput = await resolvedLLM.llm({
      messages: [
        ...messages,
        {
          role: 'user' as const,
          content: [
            'ThinkingsGeneration stage 1/3: reason.',
            'Return only JSON with keys: analysis, steps, conclusion, confidence.',
          ].join('\n'),
        },
      ],
      config: { responseFormat: 'json', temperature: 0.2, maxTokens: 2048 },
    });
    const reasoning = ReadNeedReasoningSchema.parse(JSON.parse(extractJsonFromResponse(reasoningOutput.content)));

    const judgmentOutput = await resolvedLLM.llm({
      messages: [
        ...messages,
        {
          role: 'user' as const,
          content: [
            'ThinkingsGeneration stage 2/3: judge the prior reasoning.',
            'Return only JSON with keys: quality, issues, suggestions, approved.',
            `Reasoning JSON: ${JSON.stringify(reasoning)}`,
          ].join('\n'),
        },
      ],
      config: { responseFormat: 'json', temperature: 0.2, maxTokens: 2048 },
    });
    const judgment = ReadNeedJudgmentSchema.parse(JSON.parse(extractJsonFromResponse(judgmentOutput.content)));

    const output = await resolvedLLM.llm({
      messages: [
        ...messages,
        {
          role: 'user' as const,
          content: [
            'ThinkingsGeneration stage 3/3: structured output.',
            'Use the original task, the reasoning, and the judgment to return only the requested typed JSON.',
            `Reasoning JSON: ${JSON.stringify(reasoning)}`,
            `Judgment JSON: ${JSON.stringify(judgment)}`,
          ].join('\n'),
        },
      ],
      config: { responseFormat: 'json', temperature: 0.2, maxTokens: 4096 },
    });
    try {
      agentExecution?.store?.('llm', 'reasoningOutput', {
        content: reasoningOutput.content,
        rawResponse: reasoningOutput.content,
        parsedTypedOutput: reasoning,
        phase, agent: agentName, step, generation: 'reason',
        provider: reasoningOutput.metadata?.provider ?? resolvedLLM.provider,
        model: reasoningOutput.metadata?.model ?? resolvedLLM.model,
      });
      agentExecution?.store?.('llm', 'judgmentOutput', {
        content: judgmentOutput.content,
        rawResponse: judgmentOutput.content,
        parsedTypedOutput: judgment,
        phase, agent: agentName, step, generation: 'judge',
        provider: judgmentOutput.metadata?.provider ?? resolvedLLM.provider,
        model: judgmentOutput.metadata?.model ?? resolvedLLM.model,
      });
      agentExecution?.store?.('llm', 'output', {
        content: output.content,
        rawResponse: output.content,
        phase, agent: agentName, step, generation: 'structured_output',
        reasoning, judgment,
        provider: output.metadata?.provider ?? resolvedLLM.provider,
        model: output.metadata?.model ?? resolvedLLM.model,
      });
      agentExecution?.store?.('llm', 'usage', mergeReadNeedUsage(reasoningOutput.usage, judgmentOutput.usage, output.usage));
    } catch {}

    let parsed: T;
    try {
      parsed = schema.parse(JSON.parse(extractJsonFromResponse(output.content)));
    } catch (validationError) {
      // One corrective pass: feed the validation error back so the model can fix
      // the shape instead of failing the run.
      const corrected = await resolvedLLM.llm({
        messages: [
          ...messages,
          {
            role: 'user' as const,
            content: [
              'ThinkingsGeneration stage 3/3 (correction): your previous JSON failed schema validation.',
              `Validation error: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
              'Return ONLY corrected JSON that strictly matches the required shape, including every required top-level key. No markdown, no prose.',
              `Reasoning JSON: ${JSON.stringify(reasoning)}`,
              `Judgment JSON: ${JSON.stringify(judgment)}`,
            ].join('\n'),
          },
        ],
        config: { responseFormat: 'json', temperature: 0.1, maxTokens: 4096 },
      });
      try { agentExecution?.store?.('bounded-inference', 'status', 'corrected-retry'); } catch {}
      parsed = schema.parse(JSON.parse(extractJsonFromResponse(corrected.content)));
    }
    try {
      agentExecution?.store?.('llm', 'parsedOutput', {
        parsed,
        parsedTypedOutput: parsed,
        phase, agent: agentName, step, generation: 'structured_output',
        reasoning, judgment,
        provider: output.metadata?.provider ?? resolvedLLM.provider,
        model: output.metadata?.model ?? resolvedLLM.model,
      });
      agentExecution?.store?.('bounded-inference', 'status', 'success');
    } catch {}
    return parsed;
  } catch (error) {
    try {
      agentExecution?.store?.('bounded-inference', 'status', 'failed');
      agentExecution?.store?.('bounded-inference', 'error', error instanceof Error ? error.message : String(error));
    } catch {}
    throw error;
  }
}

export async function synthesizeReadNeedForPipelineInputWithInference(
  input: ReadNeedSourceInput,
  execution?: any,
): Promise<ReadNeed> {
  const fallbackNeed = synthesizeReadNeedForPipelineInput(input);
  if (!isAssetPackRealInferenceEnabled()) {
    return fallbackNeed;
  }

  const read = normalizeSource(input);
  const targetArtifactKinds = normalizeTargetArtifactKinds(input);
  const explicitClosureCriteria = [
    ...stringArray(input.closureCriteria),
    ...stringArray(recordValue(input.read)?.closureCriteria),
    ...stringArray(recordValue(input.readRequest)?.closureCriteria),
    ...stringArray(recordValue(input.readMeasurement)?.closureCriteria),
  ];
  const inferred = await runReadNeedComprehensionInference({
    agentName: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer',
    phase: 'ReadNeedComprehensionSynthesis.comprehend',
    step: 'try',
    systemPrompt: [
      'You are the ReadNeedComprehensionSynthesis PTRR agent for Bitcode Reading.',
      'Synthesize exactly and only what the reader asked Bitcode to read, no more and no less.',
      'Return only schema-valid source-constrained Need comprehension fields that can later drive ReadFitsFindingSynthesis after user review and acceptance.',
      'Preserve repository, branch, commit, target artifact kinds, closure criteria, failure modes, feedback history, and prior Need lineage as constraints on the Need.',
      'Do not search deposits, rank fits, claim that a fit exists, quote final BTC payment, transfer BTD rights, promise delivery, or show protected AssetPack source.',
    ].join('\n'),
    userPrompt: JSON.stringify({
      read,
      targetArtifactKinds,
      closureCriteria: explicitClosureCriteria,
      failureModes: stringArray(input.failureModes),
      feedbackHistory: fallbackNeed.feedbackHistory,
      previousNeedId: fallbackNeed.request.previousNeedId,
      sourceConstraints: fallbackNeed.sourceConstraints,
      reviewBoundary: fallbackNeed.inferenceReceipt?.reviewBoundary,
      requiredOutput:
        'requirements, closureCriteria, failureModes, targetArtifactKinds, proofExpectations',
    }),
    promptTemplate: {
      templateId: 'ReadNeedComprehensionSynthesis.prompt.need-synthesis',
      system: 'ReadNeedComprehensionSynthesis PTRR agent prompt',
      user: 'Read request, source constraints, closure criteria, target artifact kinds, failure modes, and feedback history.',
    },
    schema: ReadNeedComprehensionSynthesisSchema,
    execution,
  });

  const inferredRequirements = stringArray(inferred.requirements);
  const inferredClosureCriteria = stringArray(inferred.closureCriteria);
  const inferredFailureModes = stringArray(inferred.failureModes);
  const inferredTargetArtifactKinds = stringArray(inferred.targetArtifactKinds);
  const inferredProofExpectations = stringArray(inferred.proofExpectations);
  const closureCriteria = inferredClosureCriteria.length
    ? inferredClosureCriteria
    : fallbackNeed.closureCriteria;
  const synthesized = synthesizeReadNeedForPipelineInput({
    ...input,
    closureCriteria,
    failureModes: inferredFailureModes.length
      ? inferredFailureModes
      : fallbackNeed.failureModes,
    targetArtifactKinds: inferredTargetArtifactKinds.length
      ? inferredTargetArtifactKinds
      : fallbackNeed.targetArtifactKinds,
  });

  const inferredNeed = {
    ...synthesized,
    requirements: inferredRequirements.length
      ? inferredRequirements
      : synthesized.requirements,
    proofExpectations: inferredProofExpectations.length
      ? inferredProofExpectations
      : synthesized.proofExpectations,
  };
  const withReceipt = withReadNeedInferenceReceipt(
    withoutReadNeedInferenceReceipt(inferredNeed),
    'real-inference'
  );
  storeReadNeedInferenceReceipt(execution, withReceipt.inferenceReceipt!);
  return withReceipt;
}

export function acceptReadNeed(
  need: ReadNeed,
  acceptedAt = new Date().toISOString()
): ReadNeed {
  const acceptanceRoot = `sha256:${sha256(stableStringify({
    needId: need.needId,
    measurementRoot: need.measurementRoot,
    acceptedAt,
    nextStage: 'finding_fits',
  }))}`;
  const baseNeed = withoutReadNeedInferenceReceipt(need);
  const accepted: Omit<ReadNeed, 'inferenceReceipt'> = {
    ...baseNeed,
    reviewState: 'accepted',
    review: {
      status: 'accepted',
      acceptedAt,
      acceptanceRoot,
      nextStage: 'finding_fits',
    },
  };
  return withReadNeedInferenceReceipt(accepted, need.inferenceReceipt?.mode || 'deterministic-fallback');
}

export function rejectReadNeed(
  need: ReadNeed,
  feedback: string[] = [],
  rejectedAt = new Date().toISOString()
): ReadNeed {
  const feedbackHistory = uniqueStrings([
    ...need.feedbackHistory,
    ...feedback,
  ]);
  const rejectionRoot = `sha256:${sha256(stableStringify({
    needId: need.needId,
    measurementRoot: need.measurementRoot,
    rejectedAt,
    blockedStage: 'finding_fits',
    feedbackHistory,
  }))}`;
  const baseNeed = withoutReadNeedInferenceReceipt(need);
  const rejected: Omit<ReadNeed, 'inferenceReceipt'> = {
    ...baseNeed,
    reviewState: 'rejected',
    feedbackHistory,
    request: {
      ...baseNeed.request,
      feedbackHistory,
    },
    review: {
      status: 'rejected',
      rejectedAt,
      rejectionRoot,
      blockedStage: 'finding_fits',
      feedbackHistory,
    },
  };
  return withReadNeedInferenceReceipt(rejected, need.inferenceReceipt?.mode || 'deterministic-fallback');
}

export function isAcceptedReadNeed(value: unknown): value is ReadNeed {
  const record = recordValue(value);
  return Boolean(
    record?.schema === 'bitcode.read.need' &&
    record.reviewState === 'accepted' &&
    typeof record.needId === 'string' &&
    typeof record.measurementRoot === 'string'
  );
}

export function resolveReadNeedFromPipelineInput(input: unknown): ReadNeed | null {
  const record = recordValue(input);
  const direct = record?.acceptedReadNeed ?? record?.readNeed ?? record?.need;
  return isAcceptedReadNeed(direct) || recordValue(direct)?.schema === 'bitcode.read.need'
    ? direct as ReadNeed
    : null;
}

export function shouldRequireAcceptedReadNeed(input: unknown): boolean {
  const record = recordValue(input);
  return Boolean(
    process.env.BITCODE_PIPELINE_REQUIRE_ACCEPTED_READ_NEED === '1' ||
    record?.requireAcceptedReadNeed === true ||
    recordValue(record?.harness)?.requireAcceptedReadNeed === true
  );
}

export function admitReadFitsFinding(input: unknown): ReadFitsFindingAdmission {
  const readNeed = resolveReadNeedFromPipelineInput(input);
  if (isAcceptedReadNeed(readNeed)) {
    return { admitted: true, blockers: [], acceptedNeed: readNeed };
  }
  if (!shouldRequireAcceptedReadNeed(input)) {
    return { admitted: true, blockers: [], acceptedNeed: null };
  }
  const blockers = recordValue(readNeed)?.reviewState === 'rejected'
    ? ['read_need_rejected', 'accepted_read_need_missing']
    : ['accepted_read_need_missing'];
  return {
    admitted: false,
    blockers,
    acceptedNeed: null,
  };
}

export function readNeedToDepositorySearchRead(need: ReadNeed): DepositorySearchRead {
  return {
    id: need.needId,
    prompt: need.read.prompt,
    repositoryFullName: need.sourceConstraints.repositoryFullName,
    sourceBranch: need.sourceConstraints.sourceBranch,
    sourceCommit: need.sourceConstraints.sourceCommit,
    targetArtifactKinds: need.targetArtifactKinds,
    closureCriteria: need.closureCriteria,
    failureModes: need.failureModes,
  };
}

export function buildShareToFeePreview(input: {
  need: ReadNeed;
  admittedFitQuality: number;
  satsPerWeightedVolume?: number;
  minimumSats?: number;
  dustFloorSats?: number;
}): ShareToFeeQuote {
  const admittedFitQuality = clampQuality(input.admittedFitQuality);
  const weightedAdmittedVolume = weightedMeasurementVolume(
    input.need.pricingMeasurementInputs.measurementVector,
    admittedFitQuality
  );
  const satsPerWeightedVolume = input.satsPerWeightedVolume ?? 1000;
  const minimumSats = input.minimumSats ?? 546;
  const dustFloorSats = input.dustFloorSats ?? 546;
  const sats = Math.max(minimumSats, dustFloorSats, Math.round(weightedAdmittedVolume * satsPerWeightedVolume));
  const feeSchedule = {
    satsPerWeightedVolume,
    minimumSats,
    dustFloorSats,
    networkFeePosture: 'reader_wallet_authorized_before_broadcast' as const,
  };
  const quoteRoot = `sha256:${sha256(stableStringify({
    formula: input.need.pricingMeasurementInputs.shareToFeeFormula,
    needId: input.need.needId,
    needMeasurementRoot: input.need.measurementRoot,
    measurementVector: input.need.pricingMeasurementInputs.measurementVector,
    admittedFitQuality,
    weightedAdmittedVolume,
    sats,
    feeSchedule,
  }))}`;

  return {
    formula: input.need.pricingMeasurementInputs.shareToFeeFormula,
    needId: input.need.needId,
    needMeasurementRoot: input.need.measurementRoot,
    measurementVector: input.need.pricingMeasurementInputs.measurementVector,
    admittedFitQuality,
    weightedAdmittedVolume,
    sats,
    feeSchedule,
    finalityState: 'preview_not_paid' as const,
    payer: 'reader' as const,
    quoteRoot,
  };
}

function scoreBandFor(quality: number): AssetPackSourceSafePreview['fit']['scoreBand'] {
  if (quality >= 0.8) return 'high';
  if (quality >= 0.62) return 'reviewable';
  if (quality > 0) return 'blocked';
  return 'none';
}

function highestSelectedFitQuality(fitResult: DepositoryFitResultEvidence | null | undefined): number {
  const scores = fitResult?.selectionTrace?.selectedCandidates
    ?.map((candidate) => candidate.scores.finalScore)
    .filter((score) => Number.isFinite(score)) || [];
  return scores.length ? clampQuality(Math.max(...scores)) : 0;
}

function firstSelectedProofRoot(fitResult: DepositoryFitResultEvidence | null | undefined): string | null {
  const selected = fitResult?.selectionTrace?.selectedCandidates?.[0];
  return selected?.proofEvidence?.proofRoot || null;
}

export function resolveAssetPackReadRightState(input: {
  hasOwnerClaim?: boolean;
  hasReadLicense?: boolean;
  settlementReadbackComplete?: boolean;
  settlementPending?: boolean;
  policyDenied?: boolean;
}): AssetPackReadRightState {
  if (input.policyDenied) return 'denied';
  if (input.hasOwnerClaim) return 'owner_read';
  if (input.hasReadLicense && input.settlementReadbackComplete) return 'licensed_read';
  if (input.settlementPending !== false) return 'pending_settlement';
  return 'denied';
}

export function buildAssetPackSourceSafePreview(input: {
  need: ReadNeed;
  fitResult?: DepositoryFitResultEvidence | null;
  assetPackId?: string | null;
  proofRoot?: string | null;
  sourceManifestRoot?: string | null;
  accessPolicyId?: string | null;
  accessPolicyHash?: string | null;
  rangeStart?: number | null;
  tokenCount?: number | null;
  pullRequestTarget?: string | null;
  createdAt?: string;
}): AssetPackSourceSafePreview {
  const fitResult = input.fitResult || null;
  const admittedFitQuality = fitResult?.resultState === 'worthy_fit'
    ? highestSelectedFitQuality(fitResult)
    : 0;
  const feeQuote = buildShareToFeePreview({
    need: input.need,
    admittedFitQuality,
  });
  const fitDepositAssetIds = fitResult?.fitDepositAssetIds || fitResult?.selectedCandidateAssetIds || [];
  const selectedCandidateAssetIds = fitResult?.selectedCandidateAssetIds || fitDepositAssetIds;
  const assetPackId = firstString(input.assetPackId)
    || `asset-pack-${sha256(stableStringify({
      needId: input.need.needId,
      fitDepositAssetIds,
      queryRoot: fitResult?.queryRoot || null,
      rankingRoot: fitResult?.rankingRoot || null,
    })).slice(0, 16)}`;
  const sourceManifestRoot = firstString(input.sourceManifestRoot)
    || `sha256:${sha256(stableStringify({
      assetPackId,
      fitDepositAssetIds,
      withheld: 'protected_source_before_settlement',
    }))}`;
  const proofRoot = firstString(input.proofRoot)
    || firstSelectedProofRoot(fitResult)
    || `sha256:${sha256(stableStringify({
      needId: input.need.needId,
      assetPackId,
      queryRoot: fitResult?.queryRoot || null,
      rankingRoot: fitResult?.rankingRoot || null,
    }))}`;
  const accessPolicyId = firstString(input.accessPolicyId) || `access-policy-${sha256(`${assetPackId}:read-rights`).slice(0, 12)}`;
  const accessPolicyHash = firstString(input.accessPolicyHash) || `sha256:${sha256(stableStringify({
    accessPolicyId,
    assetPackId,
    ownerRead: true,
    licensedRead: true,
    confidentiality: 'public_proof_private_source',
  }))}`;
  const normalizedBitcodeVolume = Math.max(1, Math.ceil(feeQuote.weightedAdmittedVolume || 1));
  const tokenCount = Math.max(1, Math.ceil(Number(input.tokenCount || normalizedBitcodeVolume)));
  const rangeStart = Number.isSafeInteger(input.rangeStart) ? Number(input.rangeStart) : null;
  const rangeEndExclusive = rangeStart === null ? null : rangeStart + tokenCount;
  const projectionRoot = `sha256:${sha256(stableStringify({
    assetPackId,
    needId: input.need.needId,
    feeQuoteRoot: feeQuote.quoteRoot,
    tokenCount,
    normalizedBitcodeVolume,
    rangeStart,
    rangeEndExclusive,
  }))}`;
  const previewRoot = `sha256:${sha256(stableStringify({
    assetPackId,
    needId: input.need.needId,
    fitResultState: fitResult?.resultState || 'blocked_readiness',
    fitDepositAssetIds,
    feeQuoteRoot: feeQuote.quoteRoot,
    projectionRoot,
    sourceManifestRoot,
    proofRoot,
    accessPolicyHash,
  }))}`;
  const readRightState = resolveAssetPackReadRightState({ settlementPending: true });

  return {
    schema: 'bitcode.asset-pack.source-safe-preview',
    previewId: `preview-${sha256(previewRoot).slice(0, 16)}`,
    assetPackId,
    need: {
      needId: input.need.needId,
      measurementRoot: input.need.measurementRoot,
      reviewState: input.need.reviewState,
      acceptanceRoot: input.need.review?.acceptanceRoot || null,
    },
    fit: {
      resultState: fitResult?.resultState || 'blocked_readiness',
      resultReasons: fitResult?.resultReasons || ['Finding Fits has not produced worthy source-bound evidence.'],
      admittedFitQuality,
      fitDepositAssetIds,
      selectedCandidateAssetIds,
      queryRoot: fitResult?.queryRoot || null,
      rankingRoot: fitResult?.rankingRoot || null,
      searchedAssetCount: fitResult?.searchedAssetCount || 0,
      embeddingPolicy: fitResult?.embeddingPolicy || null,
      scoreBand: scoreBandFor(admittedFitQuality),
    },
    measurements: {
      needVector: input.need.pricingMeasurementInputs.measurementVector,
      weightedRequestedVolume: input.need.pricingMeasurementInputs.weightedRequestedVolume,
      weightedAdmittedVolume: feeQuote.weightedAdmittedVolume,
    },
    roots: {
      needMeasurementRoot: input.need.measurementRoot,
      queryRoot: fitResult?.queryRoot || null,
      rankingRoot: fitResult?.rankingRoot || null,
      proofRoot,
      sourceManifestRoot,
      previewRoot,
    },
    feeQuote,
    rangeProjection: {
      status: 'projected_not_minted',
      tokenCount,
      normalizedBitcodeVolume,
      rangeStart,
      rangeEndExclusive,
      projectionRoot,
    },
    disclosurePolicy: {
      protectedSourceDisclosure: 'forbidden_before_settlement',
      visibleBeforeSettlement: [
        'need measurement',
        'fit measurement',
        'fit deposit ids',
        'selected candidate ids field alias',
        'roots',
        'score band',
        'proof posture',
        'ownership boundary',
        'settlement boundary',
        'BTC quote',
      ],
      withheldBeforeSettlement: [
        'protected source content',
        'full AssetPack patch',
        'source-bearing manifest entries',
        'licensed read payload',
      ],
    },
    accessPolicy: {
      accessPolicyId,
      accessPolicyHash,
      readRightState,
    },
    settlementBoundary: {
      payer: 'reader',
      payee: 'depositor',
      serverCustody: false,
      btcFeeRequired: true,
      readbackRequiredBeforeUnlock: true,
      ownershipTruth: 'asset_pack_range_and_license_rows',
    },
    unlock: {
      state: readRightState,
      sourceAvailable: false,
      reason: 'AssetPack source remains withheld until BTC fee, BTD range, ownership/license, journal, anchor, and database readback agree.',
    },
    delivery: {
      pullRequestTarget: firstString(input.pullRequestTarget),
      availableAfterSettlement: true,
    },
    createdAt: input.createdAt || new Date().toISOString(),
  };
}
