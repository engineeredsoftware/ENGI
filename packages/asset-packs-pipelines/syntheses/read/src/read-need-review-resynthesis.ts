import { createHash } from 'node:crypto';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  listReadingPipelineTelemetryTrace,
  summarizeReadingPipelineContract,
} from './reading-pipeline-contract';
import {
  admitReadFitsFinding,
  isAcceptedReadNeed,
  type ReadFitsFindingAdmission,
  type ReadNeed,
  type ReadNeedComprehensionSynthesisInferenceReceipt,
  type ReadNeedReviewState,
} from './read-need';

export type ReadNeedReviewResynthesisAction =
  | 'synthesize_read_need'
  | 'resynthesize_read_need'
  | 'accept_read_need'
  | 'reject_read_need';

export type ReadNeedReviewStorageRecordKind =
  | 'read_request'
  | 'synthesized_need'
  | 'feedback'
  | 'resynthesis_attempt'
  | 'need_measurement'
  | 'accepted_need_admission'
  | 'rejected_need_posture'
  | 'telemetry_receipt';

export interface ReadNeedReviewStorageRecord {
  schema: 'bitcode.read-need-review.storage-record';
  recordId: string;
  recordKind: ReadNeedReviewStorageRecordKind;
  pipelineName: typeof READ_NEED_COMPREHENSION_SYNTHESIS;
  namespace: string;
  key: string;
  root: string;
  sourceSafety: ReadNeedReviewSourceSafety;
  payload: Record<string, unknown>;
}

export interface ReadNeedReviewTelemetryReceipt {
  schema: 'bitcode.read-need-review.telemetry-receipt';
  receiptId: string;
  pipelineName: typeof READ_NEED_COMPREHENSION_SYNTHESIS;
  action: ReadNeedReviewResynthesisAction;
  needId: string;
  requestId: string;
  reviewState: ReadNeedReviewState;
  phaseIds: string[];
  agentIds: string[];
  ptrrStepIds: string[];
  failsafeSequenceIds: string[];
  thinkingsGenerationIds: string[];
  promptTemplateIds: string[];
  outputSchemaIds: string[];
  root: string;
}

export interface ReadNeedReviewSourceSafety {
  sourceSafetyClass: 'source_safe_read_need_review_resynthesis_metadata';
  protectedSourceVisible: false;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface ReadNeedReviewResynthesisRuntime {
  schema: 'bitcode.read-need-review-resynthesis-runtime';
  runtimeId: string;
  pipelineName: typeof READ_NEED_COMPREHENSION_SYNTHESIS;
  nextPipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  action: ReadNeedReviewResynthesisAction;
  requestId: string;
  currentNeedId: string;
  previousNeedId: string | null;
  reviewState: ReadNeedReviewState;
  findingFitsAdmission: ReadFitsFindingAdmission;
  reviewLoop: {
    readRequestPersisted: true;
    synthesizedNeedPersisted: true;
    feedbackHistoryPersisted: true;
    resynthesisAttemptPersisted: boolean;
    needMeasurementPersisted: true;
    acceptedNeedAdmissionPersisted: boolean;
    rejectedNeedPosturePersisted: boolean;
    findingFitsBlockedUntilAcceptedNeed: true;
  };
  storageProjection: ReadNeedReviewStorageRecord[];
  telemetryReceipts: ReadNeedReviewTelemetryReceipt[];
  sourceSafety: ReadNeedReviewSourceSafety;
  proofRoots: {
    runtimeRoot: string;
    storageRoot: string;
    telemetryRoot: string;
    measurementRoot: string;
    readRequestRoot: string;
  };
  nextProtocolAction: string;
}

const SOURCE_SAFETY: ReadNeedReviewSourceSafety = {
  sourceSafetyClass: 'source_safe_read_need_review_resynthesis_metadata',
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

function recordId(kind: ReadNeedReviewStorageRecordKind, needId: string, key: string): string {
  return `read-need-${kind}-${sha256(`${needId}:${key}`).slice(0, 16)}`;
}

function storageRecord(
  need: ReadNeed,
  recordKind: ReadNeedReviewStorageRecordKind,
  namespace: string,
  key: string,
  payload: Record<string, unknown>,
): ReadNeedReviewStorageRecord {
  const root = rootOf({
    recordKind,
    namespace,
    key,
    payload,
  });
  return {
    schema: 'bitcode.read-need-review.storage-record',
    recordId: recordId(recordKind, need.needId, `${namespace}:${key}:${root}`),
    recordKind,
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    namespace,
    key,
    root,
    sourceSafety: SOURCE_SAFETY,
    payload,
  };
}

function telemetryReceipt(
  action: ReadNeedReviewResynthesisAction,
  need: ReadNeed,
): ReadNeedReviewTelemetryReceipt {
  const trace = listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT);
  const receipt = need.inferenceReceipt;
  const phaseIds = receipt?.phaseIds || READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId);
  const agentIds = receipt?.agentIds || READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) => phase.agents.map((agent) => agent.agentId));
  const ptrrStepIds = receipt?.ptrrStepIds || trace.map((entry) => entry.ptrrStepId);
  const failsafeSequenceIds = receipt?.failsafeSequenceIds || trace.flatMap((entry) =>
    entry.thinkingsGenerations.map((generation) => `${entry.ptrrStepId}.${generation.failsafe}`)
  );
  const thinkingsGenerationIds = receipt?.thinkingsGenerationIds || trace.flatMap((entry) => entry.thinkingsGenerationIds);
  const promptTemplateIds = receipt?.promptTemplateIds || READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
    phase.agents.flatMap((agent) => [
      agent.promptRegistry.agentPromptId,
      ...Object.values(agent.promptRegistry.ptrrStepPromptIds),
      ...agent.ptrrSteps.flatMap((step) => step.prompt?.templateId ? [step.prompt.templateId] : []),
    ])
  );
  const outputSchemaIds = receipt?.outputSchemaIds || [
    ...new Set(trace.map((entry) => entry.outputType)),
  ];
  const root = rootOf({
    action,
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    promptTemplateIds,
    outputSchemaIds,
  });
  return {
    schema: 'bitcode.read-need-review.telemetry-receipt',
    receiptId: `read-need-telemetry-${sha256(root).slice(0, 16)}`,
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    action,
    needId: need.needId,
    requestId: need.request.requestId,
    reviewState: need.reviewState,
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds,
    thinkingsGenerationIds,
    promptTemplateIds,
    outputSchemaIds,
    root,
  };
}

function nextProtocolAction(need: ReadNeed, admission: ReadFitsFindingAdmission): string {
  if (admission.admitted) return 'Run Finding Fits with the accepted Read-Need.';
  if (need.reviewState === 'rejected') return 'Revise or resynthesize the Read-Need before Finding Fits can run.';
  return 'Review and accept the synthesized Read-Need before Finding Fits.';
}

export function buildReadNeedReviewResynthesisRuntime(input: {
  action: ReadNeedReviewResynthesisAction;
  readNeed: ReadNeed;
  previousReadNeed?: ReadNeed | null;
  feedback?: string[];
}): ReadNeedReviewResynthesisRuntime {
  const readNeed = input.readNeed;
  const previousNeedId = readNeed.request.previousNeedId || input.previousReadNeed?.needId || null;
  const findingFitsAdmission = admitReadFitsFinding({
    acceptedReadNeed: isAcceptedReadNeed(readNeed) ? readNeed : undefined,
    readNeed,
    requireAcceptedReadNeed: true,
  });
  const feedbackHistory = readNeed.feedbackHistory || [];
  const resynthesisAttemptPersisted = input.action === 'resynthesize_read_need' || Boolean(previousNeedId);
  const acceptedNeedAdmissionPersisted = findingFitsAdmission.admitted;
  const rejectedNeedPosturePersisted = readNeed.reviewState === 'rejected';
  const telemetry = telemetryReceipt(input.action, readNeed);
  const records: ReadNeedReviewStorageRecord[] = [
    storageRecord(readNeed, 'read_request', 'read/need', 'request', {
      requestId: readNeed.request.requestId,
      prompt: readNeed.request.prompt,
      repositoryFullName: readNeed.request.repositoryFullName || null,
      sourceBranch: readNeed.request.sourceBranch || null,
      sourceCommit: readNeed.request.sourceCommit || null,
      targetArtifactKinds: readNeed.request.targetArtifactKinds,
      closureCriteria: readNeed.request.closureCriteria,
      failureModes: readNeed.request.failureModes,
      previousNeedId,
    }),
    storageRecord(readNeed, 'synthesized_need', 'read/need', 'current', {
      needId: readNeed.needId,
      reviewState: readNeed.reviewState,
      requirements: readNeed.requirements,
      closureCriteria: readNeed.closureCriteria,
      failureModes: readNeed.failureModes,
      targetArtifactKinds: readNeed.targetArtifactKinds,
      proofExpectations: readNeed.proofExpectations,
      sourceConstraints: readNeed.sourceConstraints,
    }),
    storageRecord(readNeed, 'feedback', 'read/need', 'feedbackHistory', {
      feedbackHistory,
      feedbackCount: feedbackHistory.length,
    }),
    storageRecord(readNeed, 'need_measurement', 'read/need', 'measurement', {
      needId: readNeed.needId,
      measurementRoot: readNeed.measurementRoot,
      pricingMeasurementInputs: readNeed.pricingMeasurementInputs,
    }),
    storageRecord(readNeed, 'telemetry_receipt', 'read/need', 'telemetryReceipt', telemetry as unknown as Record<string, unknown>),
  ];

  if (resynthesisAttemptPersisted) {
    records.push(storageRecord(readNeed, 'resynthesis_attempt', 'read/need', 'resynthesisAttempt', {
      previousNeedId,
      currentNeedId: readNeed.needId,
      feedbackHistory,
      action: input.action,
    }));
  }

  if (acceptedNeedAdmissionPersisted) {
    records.push(storageRecord(readNeed, 'accepted_need_admission', 'read/need', 'accepted', {
      needId: readNeed.needId,
      reviewState: readNeed.reviewState,
      acceptanceRoot: readNeed.review?.acceptanceRoot || null,
      nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
      blockers: findingFitsAdmission.blockers,
    }));
  }

  if (rejectedNeedPosturePersisted) {
    records.push(storageRecord(readNeed, 'rejected_need_posture', 'read/need', 'rejected', {
      needId: readNeed.needId,
      reviewState: readNeed.reviewState,
      rejectionRoot: readNeed.review?.rejectionRoot || null,
      blockedStage: 'finding_fits',
      blockers: findingFitsAdmission.blockers,
      feedbackHistory,
    }));
  }

  const storageRoot = rootOf(records.map((record) => ({ recordId: record.recordId, root: record.root })));
  const telemetryRoot = rootOf([telemetry.root]);
  const readRequestRoot = rootOf(readNeed.request);
  const runtimeRoot = rootOf({
    action: input.action,
    requestId: readNeed.request.requestId,
    currentNeedId: readNeed.needId,
    previousNeedId,
    reviewState: readNeed.reviewState,
    storageRoot,
    telemetryRoot,
    findingFitsAdmission,
  });

  return {
    schema: 'bitcode.read-need-review-resynthesis-runtime',
    runtimeId: `read-need-runtime-${sha256(runtimeRoot).slice(0, 16)}`,
    pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
    nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
    action: input.action,
    requestId: readNeed.request.requestId,
    currentNeedId: readNeed.needId,
    previousNeedId,
    reviewState: readNeed.reviewState,
    findingFitsAdmission,
    reviewLoop: {
      readRequestPersisted: true,
      synthesizedNeedPersisted: true,
      feedbackHistoryPersisted: true,
      resynthesisAttemptPersisted,
      needMeasurementPersisted: true,
      acceptedNeedAdmissionPersisted,
      rejectedNeedPosturePersisted,
      findingFitsBlockedUntilAcceptedNeed: true,
    },
    storageProjection: records,
    telemetryReceipts: [telemetry],
    sourceSafety: SOURCE_SAFETY,
    proofRoots: {
      runtimeRoot,
      storageRoot,
      telemetryRoot,
      measurementRoot: readNeed.measurementRoot,
      readRequestRoot,
    },
    nextProtocolAction: nextProtocolAction(readNeed, findingFitsAdmission),
  };
}

export function persistReadNeedReviewResynthesisRuntime(
  execution: {
    store?: (namespace: string, key: string, value: unknown) => void;
  } | null | undefined,
  runtime: ReadNeedReviewResynthesisRuntime,
): void {
  try {
    execution?.store?.('read-need-review', 'runtime', runtime);
    execution?.store?.('read-need-review', 'runtimeRoot', runtime.proofRoots.runtimeRoot);
    execution?.store?.('read-need-review', 'storageRoot', runtime.proofRoots.storageRoot);
    execution?.store?.('read-need-review', 'telemetryRoot', runtime.proofRoots.telemetryRoot);
    execution?.store?.('read-need-review', 'findingFitsAdmission', runtime.findingFitsAdmission);
    for (const record of runtime.storageProjection) {
      execution?.store?.(record.namespace, record.key, record.payload);
    }
  } catch {
    // Runtime persistence is best-effort once typed route/package output exists.
  }
}

export function summarizeReadNeedReviewResynthesisRuntime(runtime: ReadNeedReviewResynthesisRuntime) {
  return {
    schema: runtime.schema,
    runtimeId: runtime.runtimeId,
    pipelineName: runtime.pipelineName,
    nextPipelineName: runtime.nextPipelineName,
    action: runtime.action,
    requestId: runtime.requestId,
    currentNeedId: runtime.currentNeedId,
    previousNeedId: runtime.previousNeedId,
    reviewState: runtime.reviewState,
    findingFitsAdmitted: runtime.findingFitsAdmission.admitted,
    blockers: runtime.findingFitsAdmission.blockers,
    storageRecordCount: runtime.storageProjection.length,
    telemetryReceiptCount: runtime.telemetryReceipts.length,
    reviewLoop: runtime.reviewLoop,
    sourceSafety: runtime.sourceSafety,
    proofRoots: runtime.proofRoots,
    pipelineContract: summarizeReadingPipelineContract(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
  };
}
