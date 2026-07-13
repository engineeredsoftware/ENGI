import { createHash } from 'node:crypto';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
  listReadingPipelineTelemetryTrace,
  summarizeReadingPipelineContract,
} from './reading-pipeline-contract';
import {
  admitReadFitsFinding,
  type ReadFitsFindingAdmission,
  type ReadNeed,
} from './read-need';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
  summarizeDepositoryCandidateForFitEvidence,
  type DepositoryCandidateFitEvidence,
  type DepositoryFitResultEvidence,
  type DepositorySearchResult,
} from './depository-search';

export type ReadFitsFindingStorageRecordKind =
  | 'accepted_need_admission'
  | 'query_plan'
  | 'search_channel'
  | 'candidate_ranking'
  | 'selected_fit_provenance'
  | 'fit_result'
  | 'replay_receipt'
  | 'repair_posture'
  | 'telemetry_receipt';

export type ReadFitsFindingRepairAction =
  | 'accept_read_need'
  | 'supply_depository_assets'
  | 'repair_candidate_proof'
  | 'repair_candidate_measurement'
  | 'repair_candidate_readback'
  | 'adjust_need_constraints_or_thresholds'
  | 'continue_to_assetpack_preview';

export interface ReadFitsFindingSourceSafety {
  sourceSafetyClass: 'source_safe_read_fits_finding_runtime_metadata';
  protectedSourceVisible: false;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface ReadFitsFindingStorageRecord {
  schema: 'bitcode.read-fits-finding.storage-record';
  recordId: string;
  recordKind: ReadFitsFindingStorageRecordKind;
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  namespace: string;
  key: string;
  root: string;
  sourceSafety: ReadFitsFindingSourceSafety;
  payload: Record<string, unknown>;
}

export interface ReadFitsFindingTelemetryReceipt {
  schema: 'bitcode.read-fits-finding.telemetry-receipt';
  receiptId: string;
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  resultState: DepositorySearchResult['resultState'];
  phaseIds: string[];
  agentIds: string[];
  ptrrStepIds: string[];
  failsafeSequenceIds: string[];
  thinkingsGenerationIds: string[];
  toolIds: string[];
  outputSchemaIds: string[];
  root: string;
}

export interface ReadFitsFindingReplayReceipt {
  schema: 'bitcode.read-fits-finding.replay-receipt';
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  replayMode: 'source-safe-query-ranking-selected-fit-replay';
  acceptedNeedId: string | null;
  resultState: DepositorySearchResult['resultState'];
  queryPlanRoot: string;
  queryRoot: string;
  rankingRoot: string;
  selectedFitProvenanceRoot: string;
  searchReceiptRoot: string;
  fitResultRoot: string;
  depositorySupplyIndexRoot: string | null;
  replayRoot: string;
  replayableRecordKinds: ReadFitsFindingStorageRecordKind[];
  verified: {
    queryPlanRootMatchesSearchReceipt: boolean;
    queryRootMatchesSearchReceipt: boolean;
    rankingRootMatchesSearchReceipt: boolean;
    selectedFitProvenanceRootMatchesSearchReceipt: boolean;
    embeddingPolicyMatchesSearchReceipt: boolean;
    candidateCountsMatchSearchReceipt: boolean;
  };
}

export interface ReadFitsFindingRepairPosture {
  schema: 'bitcode.read-fits-finding.repair-posture';
  resultState: DepositorySearchResult['resultState'];
  blockers: string[];
  warnings: string[];
  nextActions: ReadFitsFindingRepairAction[];
  sourceSafeReason: string;
}

export interface ReadFitsFindingRuntime {
  schema: 'bitcode.read-fits-finding-runtime';
  runtimeId: string;
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  acceptedNeed: {
    needId: string;
    requestId: string;
    reviewState: ReadNeed['reviewState'];
    measurementRoot: string;
    acceptanceRoot: string | null;
  } | null;
  findingFitsAdmission: {
    admitted: boolean;
    blockers: string[];
  };
  resultState: DepositorySearchResult['resultState'];
  resultReasons: string[];
  searchSummary: {
    searchedAssetCount: number;
    rankedCandidateCount: number;
    selectedCandidateCount: number;
    fitDepositCount: number;
    blockedCandidateCount: number;
    rejectedCandidateCount: number;
    selectedCandidateAssetIds: string[];
    fitDepositAssetIds: string[];
    blockedCandidateAssetIds: string[];
  };
  queryPlan: DepositorySearchResult['queryPlan'];
  embeddingPolicy: DepositorySearchResult['embeddingPolicy'];
  rankingEvidence: DepositoryCandidateFitEvidence[];
  selectedFitEvidence: DepositoryCandidateFitEvidence[];
  fitResultEvidence: DepositoryFitResultEvidence;
  storageProjection: ReadFitsFindingStorageRecord[];
  telemetryReceipts: ReadFitsFindingTelemetryReceipt[];
  replayReceipt: ReadFitsFindingReplayReceipt;
  repairPosture: ReadFitsFindingRepairPosture;
  sourceSafety: ReadFitsFindingSourceSafety;
  proofRoots: {
    runtimeRoot: string;
    storageRoot: string;
    telemetryRoot: string;
    replayRoot: string;
    queryPlanRoot: string;
    queryRoot: string;
    rankingRoot: string;
    selectedFitProvenanceRoot: string;
  };
}

const SOURCE_SAFETY: ReadFitsFindingSourceSafety = {
  sourceSafetyClass: 'source_safe_read_fits_finding_runtime_metadata',
  protectedSourceVisible: false,
  rawProtectedPromptVisible: false,
  rawProviderResponseVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function rootOf(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function recordId(kind: ReadFitsFindingStorageRecordKind, key: string, root: string): string {
  return `read-fits-${kind}-${sha256(`${key}:${root}`).slice(0, 16)}`;
}

function storageRecord(
  recordKind: ReadFitsFindingStorageRecordKind,
  namespace: string,
  key: string,
  payload: Record<string, unknown>,
): ReadFitsFindingStorageRecord {
  const root = rootOf({
    recordKind,
    namespace,
    key,
    payload,
  });
  return {
    schema: 'bitcode.read-fits-finding.storage-record',
    recordId: recordId(recordKind, `${namespace}:${key}`, root),
    recordKind,
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    namespace,
    key,
    root,
    sourceSafety: SOURCE_SAFETY,
    payload,
  };
}

function acceptedNeedSummary(admission: ReadFitsFindingAdmission): ReadFitsFindingRuntime['acceptedNeed'] {
  const need = admission.acceptedNeed;
  if (!need) return null;
  return {
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    measurementRoot: need.measurementRoot,
    acceptanceRoot: need.review?.acceptanceRoot || null,
  };
}

function telemetryReceipt(result: DepositorySearchResult): ReadFitsFindingTelemetryReceipt {
  const trace = listReadingPipelineTelemetryTrace(READ_FITS_FINDING_SYNTHESIS_CONTRACT);
  const phaseIds = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId);
  const agentIds = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
    phase.agents.map((agent) => agent.agentId)
  );
  const ptrrStepIds = trace.map((entry) => entry.ptrrStepId);
  const failsafeSequenceIds = trace.flatMap((entry) =>
    entry.thinkingsGenerations.map((generation) => `${entry.ptrrStepId}.${generation.failsafe}`)
  );
  const thinkingsGenerationIds = trace.flatMap((entry) => entry.thinkingsGenerationIds);
  const toolIds = [...new Set(trace.flatMap((entry) => entry.toolIds))].sort();
  const outputSchemaIds = [...new Set(trace.map((entry) => entry.outputType))].sort();
  const root = rootOf({
    resultState: result.resultState,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    toolIds,
    outputSchemaIds,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
  });
  return {
    schema: 'bitcode.read-fits-finding.telemetry-receipt',
    receiptId: `read-fits-telemetry-${sha256(root).slice(0, 16)}`,
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    resultState: result.resultState,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    toolIds,
    outputSchemaIds,
    root,
  };
}

function fitResultRoot(fitResult: DepositoryFitResultEvidence): string {
  return rootOf({
    resultState: fitResult.resultState,
    fitDepositAssetIds: fitResult.fitDepositAssetIds,
    selectedCandidateAssetIds: fitResult.selectedCandidateAssetIds,
    queryRoot: fitResult.queryRoot,
    rankingRoot: fitResult.rankingRoot,
    searchedAssetCount: fitResult.searchedAssetCount,
    selectionTrace: fitResult.selectionTrace,
  });
}

function replayReceipt(input: {
  admission: ReadFitsFindingAdmission;
  result: DepositorySearchResult;
  fitResult: DepositoryFitResultEvidence;
}): ReadFitsFindingReplayReceipt {
  const result = input.result;
  const receipt = result.searchReceipt;
  const candidateCounts = {
    ranked: result.candidateRanking.length,
    selected: result.selectedCandidates.length,
    fitDeposits: result.fitDeposits.length,
    blocked: result.blockedCandidates.length,
    rejected: result.rejectedCandidates.length,
  };
  const fitRoot = fitResultRoot(input.fitResult);
  const depositorySupplyIndexRoot = result.depositorySupplyIndex?.roots.indexRoot || null;
  const verified = {
    queryPlanRootMatchesSearchReceipt: result.queryPlan.queryPlanRoot === receipt.queryPlanRoot,
    queryRootMatchesSearchReceipt: result.queryRoot === receipt.queryRoot,
    rankingRootMatchesSearchReceipt: result.rankingRoot === receipt.rankingRoot,
    selectedFitProvenanceRootMatchesSearchReceipt:
      receipt.selectedFitProvenanceRoot === receipt.roots.selectedFitProvenanceRoot,
    embeddingPolicyMatchesSearchReceipt:
      stableStringify(result.embeddingPolicy) === stableStringify(receipt.embeddingPolicy),
    candidateCountsMatchSearchReceipt:
      stableStringify(candidateCounts) === stableStringify(receipt.candidateCounts),
  };
  const replayableRecordKinds: ReadFitsFindingStorageRecordKind[] = [
    'accepted_need_admission',
    'query_plan',
    'candidate_ranking',
    'selected_fit_provenance',
    'fit_result',
    'replay_receipt',
  ];
  const replayRoot = rootOf({
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    acceptedNeedId: input.admission.acceptedNeed?.needId || null,
    resultState: result.resultState,
    queryPlanRoot: result.queryPlan.queryPlanRoot,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    selectedFitProvenanceRoot: receipt.selectedFitProvenanceRoot,
    searchReceiptRoot: receipt.roots.receiptRoot,
    fitResultRoot: fitRoot,
    depositorySupplyIndexRoot,
    candidateCounts,
    verified,
  });

  return {
    schema: 'bitcode.read-fits-finding.replay-receipt',
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    replayMode: 'source-safe-query-ranking-selected-fit-replay',
    acceptedNeedId: input.admission.acceptedNeed?.needId || null,
    resultState: result.resultState,
    queryPlanRoot: result.queryPlan.queryPlanRoot,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    selectedFitProvenanceRoot: receipt.selectedFitProvenanceRoot,
    searchReceiptRoot: receipt.roots.receiptRoot,
    fitResultRoot: fitRoot,
    depositorySupplyIndexRoot,
    replayRoot,
    replayableRecordKinds,
    verified,
  };
}

function repairPosture(
  admission: ReadFitsFindingAdmission,
  result: DepositorySearchResult,
): ReadFitsFindingRepairPosture {
  const warnings = [
    ...new Set(result.selectedCandidates.flatMap((candidate) => candidate.verification.warnings)),
  ].sort();
  const blockers = [
    ...new Set([
      ...admission.blockers,
      ...result.blockedCandidates.flatMap((candidate) => candidate.verification.blockers),
      ...result.resultReasons.filter((reason) => result.resultState === 'blocked_readiness' && reason),
    ]),
  ].sort();
  const nextActions: ReadFitsFindingRepairAction[] = [];

  if (!admission.admitted) nextActions.push('accept_read_need');
  if (!result.searchedAssetCount) nextActions.push('supply_depository_assets');
  if (warnings.includes('wallet_or_attestation_proof_missing')) nextActions.push('repair_candidate_proof');
  if (warnings.includes('asset_measurement_evidence_missing')) nextActions.push('repair_candidate_measurement');
  if (warnings.some((warning) => warning.includes('readback_missing'))) {
    nextActions.push('repair_candidate_readback');
  }
  if (result.resultState === 'no_worthy_fit') nextActions.push('adjust_need_constraints_or_thresholds');
  if (result.resultState === 'worthy_fit') nextActions.push('continue_to_assetpack_preview');

  return {
    schema: 'bitcode.read-fits-finding.repair-posture',
    resultState: result.resultState,
    blockers,
    warnings,
    nextActions: [...new Set(nextActions)],
    sourceSafeReason:
      result.resultState === 'worthy_fit'
        ? 'Fit deposits are ready for source-safe AssetPack preview.'
        : 'Finding Fits remains repairable using Need admission, candidate proof, measurement, readback, or threshold evidence.',
  };
}

export function buildReadFitsFindingRuntime(input: {
  admission: ReadFitsFindingAdmission;
  result: DepositorySearchResult;
  fitResult?: DepositoryFitResultEvidence;
}): ReadFitsFindingRuntime {
  const fitResult = input.fitResult || buildDepositoryFitResultEvidence(input.result);
  const telemetry = telemetryReceipt(input.result);
  const replay = replayReceipt({
    admission: input.admission,
    result: input.result,
    fitResult,
  });
  const repair = repairPosture(input.admission, input.result);
  const rankingEvidence = input.result.candidateRanking.map(summarizeDepositoryCandidateForFitEvidence);
  const selectedFitEvidence = input.result.fitDeposits.map(summarizeDepositoryCandidateForFitEvidence);
  const acceptedNeed = acceptedNeedSummary(input.admission);
  const records: ReadFitsFindingStorageRecord[] = [
    storageRecord('accepted_need_admission', 'read/finding-fits', 'admission', {
      admitted: input.admission.admitted,
      blockers: input.admission.blockers,
      acceptedNeed,
    }),
    storageRecord('query_plan', 'depository/search', 'sourceSafeQueryPlan', {
      queryPlan: input.result.queryPlan,
      queryPlanRoot: input.result.queryPlan.queryPlanRoot,
      queryRoot: input.result.queryRoot,
      embeddingPolicy: input.result.embeddingPolicy,
    }),
    ...input.result.queryPlan.channels.map((channel) =>
      storageRecord('search_channel', 'depository/search/channels', channel.channelId, {
        ...channel,
        channelId: channel.channelId,
      })
    ),
    storageRecord('candidate_ranking', 'depository/search', 'sourceSafeCandidateRankingRecord', {
      rankedCandidateCount: rankingEvidence.length,
      rankingRoot: input.result.rankingRoot,
      rankingEvidence,
    }),
    storageRecord('selected_fit_provenance', 'depository/search', 'sourceSafeSelectedFitProvenanceRecord', {
      selectedFitProvenanceRoot: replay.selectedFitProvenanceRoot,
      selectedCandidateAssetIds: input.result.selectedCandidateAssetIds,
      fitDepositAssetIds: input.result.fitDepositAssetIds,
      selectedFitEvidence,
    }),
    storageRecord('fit_result', 'fit', 'sourceSafeResultRecord', {
      fitResult,
      fitResultRoot: replay.fitResultRoot,
    }),
    storageRecord('replay_receipt', 'read/finding-fits', 'replayReceipt', replay as unknown as Record<string, unknown>),
    storageRecord('repair_posture', 'read/finding-fits', 'repairPosture', repair as unknown as Record<string, unknown>),
    storageRecord('telemetry_receipt', 'read/finding-fits', 'telemetryReceipt', telemetry as unknown as Record<string, unknown>),
  ];
  const storageRoot = rootOf(records.map((record) => ({ recordId: record.recordId, root: record.root })));
  const telemetryRoot = rootOf([telemetry.root]);
  const runtimeRoot = rootOf({
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    acceptedNeed,
    resultState: input.result.resultState,
    resultReasons: input.result.resultReasons,
    queryPlanRoot: input.result.queryPlan.queryPlanRoot,
    queryRoot: input.result.queryRoot,
    rankingRoot: input.result.rankingRoot,
    selectedFitProvenanceRoot: replay.selectedFitProvenanceRoot,
    replayRoot: replay.replayRoot,
    storageRoot,
    telemetryRoot,
  });

  return {
    schema: 'bitcode.read-fits-finding-runtime',
    runtimeId: `read-fits-runtime-${sha256(runtimeRoot).slice(0, 16)}`,
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    acceptedNeed,
    findingFitsAdmission: {
      admitted: input.admission.admitted,
      blockers: input.admission.blockers,
    },
    resultState: input.result.resultState,
    resultReasons: input.result.resultReasons,
    searchSummary: {
      searchedAssetCount: input.result.searchedAssetCount,
      rankedCandidateCount: input.result.candidateRanking.length,
      selectedCandidateCount: input.result.selectedCandidates.length,
      fitDepositCount: input.result.fitDeposits.length,
      blockedCandidateCount: input.result.blockedCandidates.length,
      rejectedCandidateCount: input.result.rejectedCandidates.length,
      selectedCandidateAssetIds: input.result.selectedCandidateAssetIds,
      fitDepositAssetIds: input.result.fitDepositAssetIds,
      blockedCandidateAssetIds: input.result.blockedCandidates.map((candidate) => candidate.assetId),
    },
    queryPlan: input.result.queryPlan,
    embeddingPolicy: input.result.embeddingPolicy,
    rankingEvidence,
    selectedFitEvidence,
    fitResultEvidence: fitResult,
    storageProjection: records,
    telemetryReceipts: [telemetry],
    replayReceipt: replay,
    repairPosture: repair,
    sourceSafety: SOURCE_SAFETY,
    proofRoots: {
      runtimeRoot,
      storageRoot,
      telemetryRoot,
      replayRoot: replay.replayRoot,
      queryPlanRoot: input.result.queryPlan.queryPlanRoot,
      queryRoot: input.result.queryRoot,
      rankingRoot: input.result.rankingRoot,
      selectedFitProvenanceRoot: replay.selectedFitProvenanceRoot,
    },
  };
}

export async function buildReadFitsFindingRuntimeForPipelineInput(
  input: unknown,
  execution?: { store?: (namespace: string, key: string, value: unknown) => void; parent?: unknown },
): Promise<ReadFitsFindingRuntime> {
  const admission = admitReadFitsFinding(input);
  const result = await runDepositorySearchForPipelineInput(input, execution);
  return buildReadFitsFindingRuntime({
    admission,
    result,
    fitResult: buildDepositoryFitResultEvidence(result),
  });
}

export function persistReadFitsFindingRuntime(
  execution: {
    store?: (namespace: string, key: string, value: unknown) => void;
  } | null | undefined,
  runtime: ReadFitsFindingRuntime,
): void {
  try {
    execution?.store?.('read/finding-fits', 'runtime', runtime);
    execution?.store?.('read/finding-fits', 'runtimeRoot', runtime.proofRoots.runtimeRoot);
    execution?.store?.('read/finding-fits', 'storageRoot', runtime.proofRoots.storageRoot);
    execution?.store?.('read/finding-fits', 'telemetryRoot', runtime.proofRoots.telemetryRoot);
    execution?.store?.('read/finding-fits', 'replayReceipt', runtime.replayReceipt);
    execution?.store?.('read/finding-fits', 'replayRoot', runtime.replayReceipt.replayRoot);
    execution?.store?.('read/finding-fits', 'repairPosture', runtime.repairPosture);
    execution?.store?.('depository/search', 'sourceSafeCandidateRanking', runtime.rankingEvidence);
    execution?.store?.('depository/search', 'sourceSafeSelectedFitEvidence', runtime.selectedFitEvidence);
    execution?.store?.('fit', 'sourceSafeResult', runtime.fitResultEvidence);
    for (const record of runtime.storageProjection) {
      execution?.store?.(record.namespace, record.key, record.payload);
    }
  } catch {
    // Search runtime storage must not fail a completed typed pipeline result.
  }
}

export function summarizeReadFitsFindingRuntime(runtime: ReadFitsFindingRuntime) {
  return {
    schema: runtime.schema,
    runtimeId: runtime.runtimeId,
    pipelineName: runtime.pipelineName,
    acceptedNeed: runtime.acceptedNeed,
    findingFitsAdmission: runtime.findingFitsAdmission,
    resultState: runtime.resultState,
    resultReasons: runtime.resultReasons,
    searchSummary: runtime.searchSummary,
    storageRecordCount: runtime.storageProjection.length,
    telemetryReceiptCount: runtime.telemetryReceipts.length,
    replayReceipt: runtime.replayReceipt,
    repairPosture: runtime.repairPosture,
    sourceSafety: runtime.sourceSafety,
    proofRoots: runtime.proofRoots,
    pipelineContract: summarizeReadingPipelineContract(READ_FITS_FINDING_SYNTHESIS_CONTRACT),
  };
}
