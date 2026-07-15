import { createHash } from 'node:crypto';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  listReadingPipelineTelemetryTrace,
  type ReadingPipelineName,
  type ReadingPipelineTelemetryTraceEntry,
} from './reading-pipeline-contract';
import type { ReadNeedReviewResynthesisRuntime } from './read-need-review-resynthesis';
import type { ReadFitsFindingRuntime } from './read-fits-finding-runtime';
import type { AssetPackPreviewBoundary } from './asset-pack-preview-boundary';
import type { AssetPackSettlementRightsDeliveryBoundary } from './asset-pack-settlement-rights-delivery';

export type ReadingOperationalTelemetryEventKind =
  | 'phase'
  | 'ptrr-agent'
  | 'ptrr-step'
  | 'failsafe'
  | 'thinkings-generation'
  | 'tool'
  | 'storage'
  | 'ledger'
  | 'wallet'
  | 'delivery'
  | 'ui'
  | 'repair';

export type ReadingOperationalTelemetryProgress =
  | 'planned'
  | 'running'
  | 'completed'
  | 'blocked'
  | 'repair-required';

export type ReadingOperationalTelemetryRunbookHookId =
  | 'open-rich-execution-log'
  | 'inspect-source-safe-metadata'
  | 'retry-read-need-resynthesis'
  | 'repair-depository-search-readback'
  | 'observe-btc-payment-finality'
  | 'repair-ledger-database-storage-projection'
  | 'recover-pull-request-delivery';

export interface ReadingOperationalTelemetrySourceSafety {
  sourceSafetyClass: 'source_safe_reading_operational_telemetry_repair_readback_metadata';
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  protectedSourcePayloadSerialized: false;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  rawInterpolatedPromptVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface ReadingOperationalExecutionState {
  pipeline?: ReadingPipelineName | 'AssetPackPreviewBoundary' | 'AssetPackSettlementRightsDeliveryBoundary';
  phase?: string;
  phaseId?: string;
  agent?: string;
  agentId?: string;
  step?: 'plan' | 'try' | 'refine' | 'retry' | string;
  ptrrStepId?: string;
  ptrrStepName?: string;
  failsafe?: string;
  generation?: string;
  thinkingsGenerationId?: string;
  tool?: string | { name?: string; toolId?: string };
  promptTemplateId?: string;
  outputSchema?: string;
  returnType?: string;
  eventId?: string;
  proofRoot?: string;
  redactionPosture?: string;
  promptDisclosurePosture?: string;
  resultDisclosurePosture?: string;
  failClosedState?: string;
}

export interface ReadingOperationalTelemetryEvent {
  schema: 'bitcode.reading.operational-telemetry-event';
  eventId: string;
  runId: string;
  eventKind: ReadingOperationalTelemetryEventKind;
  progress: ReadingOperationalTelemetryProgress;
  message: string;
  timestamp: string;
  executionState: ReadingOperationalExecutionState;
  metadata: Record<string, unknown>;
  sourceSafety: ReadingOperationalTelemetrySourceSafety;
  proofRoot: string;
}

export interface ReadingOperationalRepairRunbookHook {
  schema: 'bitcode.reading.operational-repair-runbook-hook';
  hookId: ReadingOperationalTelemetryRunbookHookId;
  label: string;
  triggerEventKinds: ReadingOperationalTelemetryEventKind[];
  repairActions: string[];
  proofRoot: string;
}

export interface ReadingOperationalOperatorReadback {
  schema: 'bitcode.reading.operational-operator-readback';
  readbackId: string;
  runId: string;
  stageStates: {
    requestRead: ReadingOperationalTelemetryProgress;
    reviewSynthesizedNeed: ReadingOperationalTelemetryProgress;
    requestFindingFits: ReadingOperationalTelemetryProgress;
    reviewAssetPackPreview: ReadingOperationalTelemetryProgress;
    buyAssetPackSettle: ReadingOperationalTelemetryProgress;
  };
  eventCounts: Record<ReadingOperationalTelemetryEventKind, number>;
  proofRoots: {
    readNeedRuntimeRoot: string | null;
    readFitsRuntimeRoot: string | null;
    previewBoundaryRoot: string | null;
    settlementBoundaryRoot: string | null;
    telemetryRoot: string;
    repairRoot: string;
    readbackRoot: string;
  };
  blockers: string[];
  warnings: string[];
  runbookHooks: ReadingOperationalRepairRunbookHook[];
  sourceSafety: ReadingOperationalTelemetrySourceSafety;
}

export interface ReadingOperationalTelemetryStorageRecord {
  schema: 'bitcode.reading.operational-telemetry.storage-record';
  recordId: string;
  namespace: string;
  key: string;
  recordKind: 'event_stream' | 'operator_readback' | 'repair_runbook' | 'telemetry_root';
  root: string;
  sourceSafety: ReadingOperationalTelemetrySourceSafety;
  payload: Record<string, unknown>;
}

export interface ReadingOperationalTelemetryRepairReadback {
  schema: 'bitcode.reading.operational-telemetry-repair-readback';
  readbackId: string;
  runId: string;
  streamEvents: ReadingOperationalTelemetryEvent[];
  operatorReadback: ReadingOperationalOperatorReadback;
  storageProjection: ReadingOperationalTelemetryStorageRecord[];
  runbookHooks: ReadingOperationalRepairRunbookHook[];
  sourceSafety: ReadingOperationalTelemetrySourceSafety;
  proofRoots: {
    telemetryRoot: string;
    eventStreamRoot: string;
    repairRoot: string;
    readbackRoot: string;
    storageRoot: string;
  };
}

export interface ReadingOperationalTelemetryRepairReadbackInput {
  runId?: string | null;
  readNeedRuntime?: ReadNeedReviewResynthesisRuntime | null;
  readFitsRuntime?: ReadFitsFindingRuntime | null;
  previewBoundary?: AssetPackPreviewBoundary | null;
  settlementBoundary?: AssetPackSettlementRightsDeliveryBoundary | null;
  createdAt?: string;
}

const SOURCE_SAFETY: ReadingOperationalTelemetrySourceSafety = {
  sourceSafetyClass: 'source_safe_reading_operational_telemetry_repair_readback_metadata',
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawProviderResponseVisible: false,
  rawInterpolatedPromptVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
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

function jsonSafe<T>(value: T): Record<string, unknown> {
  return JSON.parse(stableStringify(value)) as Record<string, unknown>;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function shortRoot(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.length > 36 ? `${value.slice(0, 24)}...${value.slice(-8)}` : value;
}

function eventId(runId: string, kind: ReadingOperationalTelemetryEventKind, key: string, root: string): string {
  return `reading-telemetry-${kind}-${sha256(`${runId}:${key}:${root}`).slice(0, 16)}`;
}

function streamEvent(input: {
  runId: string;
  eventKind: ReadingOperationalTelemetryEventKind;
  progress: ReadingOperationalTelemetryProgress;
  message: string;
  timestamp: string;
  executionState: Omit<ReadingOperationalExecutionState, 'eventId' | 'proofRoot' | 'redactionPosture' | 'promptDisclosurePosture' | 'resultDisclosurePosture'> & {
    failClosedState?: string;
  };
  metadata?: Record<string, unknown>;
}): ReadingOperationalTelemetryEvent {
  const proofRoot = rootOf({
    eventKind: input.eventKind,
    progress: input.progress,
    message: input.message,
    executionState: input.executionState,
    metadata: input.metadata || {},
  });
  const id = eventId(input.runId, input.eventKind, input.message, proofRoot);
  return {
    schema: 'bitcode.reading.operational-telemetry-event',
    eventId: id,
    runId: input.runId,
    eventKind: input.eventKind,
    progress: input.progress,
    message: input.message,
    timestamp: input.timestamp,
    executionState: {
      ...input.executionState,
      eventId: id,
      proofRoot,
      redactionPosture: SOURCE_SAFETY.sourceSafetyClass,
      promptDisclosurePosture: 'prompt_template_id_only',
      resultDisclosurePosture: 'parsed_result_shape_and_proof_roots_only',
    },
    metadata: input.metadata || {},
    sourceSafety: SOURCE_SAFETY,
    proofRoot,
  };
}

function pipelineTraceEvents(input: {
  runId: string;
  timestamp: string;
  pipelineName: ReadingPipelineName;
  traces: ReadingPipelineTelemetryTraceEntry[];
  resultState: string;
}): ReadingOperationalTelemetryEvent[] {
  const events: ReadingOperationalTelemetryEvent[] = [];
  const phaseIds = [...new Set(input.traces.map((trace) => trace.phaseId))].sort();
  for (const phaseId of phaseIds) {
    events.push(streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'phase',
      progress: 'completed',
      message: `${input.pipelineName} phase ${phaseId} observed`,
      executionState: {
        pipeline: input.pipelineName,
        phaseId,
        phase: phaseId.split('.').pop() || phaseId,
        outputSchema: 'PipelinePhaseReceipt',
        returnType: 'PipelinePhaseReceipt',
      },
      metadata: { pipelineName: input.pipelineName, phaseId, resultState: input.resultState },
    }));
  }

  for (const trace of input.traces) {
    events.push(streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'ptrr-agent',
      progress: 'completed',
      message: `${trace.agentId} PTRR agent observed`,
      executionState: {
        pipeline: input.pipelineName,
        phaseId: trace.phaseId,
        phase: trace.phaseId.split('.').pop() || trace.phaseId,
        agent: trace.agentId.split('.').pop() || trace.agentId,
        agentId: trace.agentId,
        outputSchema: trace.outputType,
        returnType: trace.returnType,
      },
      metadata: { inputType: trace.inputType, outputType: trace.outputType, toolIds: trace.toolIds },
    }));
    events.push(streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'ptrr-step',
      progress: 'completed',
      message: `${trace.ptrrStepId} PTRR ${trace.ptrrStepName} step observed`,
      executionState: {
        pipeline: input.pipelineName,
        phaseId: trace.phaseId,
        agentId: trace.agentId,
        agent: trace.agentId.split('.').pop() || trace.agentId,
        step: trace.ptrrStepName,
        ptrrStepId: trace.ptrrStepId,
        ptrrStepName: trace.ptrrStepName,
        outputSchema: trace.outputType,
        returnType: trace.returnType,
      },
      metadata: { stores: trace.stores, telemetry: trace.telemetry, kind: trace.kind },
    }));

    for (const generation of trace.thinkingsGenerations) {
      events.push(streamEvent({
        runId: input.runId,
        timestamp: input.timestamp,
        eventKind: 'failsafe',
        progress: 'completed',
        message: `${generation.thinkingsGenerationId} Failsafe context observed`,
        executionState: {
          pipeline: input.pipelineName,
          phaseId: trace.phaseId,
          agentId: trace.agentId,
          ptrrStepId: trace.ptrrStepId,
          step: trace.ptrrStepName,
          failsafe: generation.failsafe,
          outputSchema: generation.returnTypes.structuredOutput,
          returnType: generation.returnTypes.structuredOutput,
        },
        metadata: {
          thinkingsGenerationId: generation.thinkingsGenerationId,
          stores: generation.stores,
          telemetry: generation.telemetry,
        },
      }));
      for (const generationName of ['reason', 'judge', 'structured-output'] as const) {
        const promptTemplateId =
          generationName === 'reason'
            ? generation.reasonPromptId
            : generationName === 'judge'
              ? generation.judgePromptId
              : generation.structuredOutputPromptId;
        const returnType =
          generationName === 'reason'
            ? generation.returnTypes.reason
            : generationName === 'judge'
              ? generation.returnTypes.judge
              : generation.returnTypes.structuredOutput;
        events.push(streamEvent({
          runId: input.runId,
          timestamp: input.timestamp,
          eventKind: 'thinkings-generation',
          progress: 'completed',
          message: `${generation.thinkingsGenerationId}.${generationName} typed inference observed`,
          executionState: {
            pipeline: input.pipelineName,
            phaseId: trace.phaseId,
            agentId: trace.agentId,
            ptrrStepId: trace.ptrrStepId,
            step: trace.ptrrStepName,
            failsafe: generation.failsafe,
            generation: generationName,
            thinkingsGenerationId: generation.thinkingsGenerationId,
            promptTemplateId,
            outputSchema: returnType,
            returnType,
          },
          metadata: {
            promptTemplateId,
            promptDisclosure: 'template_identity_only',
            rawProviderResponse: 'withheld',
            parsedTypedResult: returnType,
          },
        }));
      }
    }

    for (const toolId of trace.toolIds) {
      events.push(streamEvent({
        runId: input.runId,
        timestamp: input.timestamp,
        eventKind: 'tool',
        progress: 'completed',
        message: `${toolId} tool execution observed`,
        executionState: {
          pipeline: input.pipelineName,
          phaseId: trace.phaseId,
          agentId: trace.agentId,
          ptrrStepId: trace.ptrrStepId,
          step: trace.ptrrStepName,
          tool: { name: toolId, toolId },
          outputSchema: trace.outputType,
          returnType: trace.outputType,
        },
        metadata: { toolId, inputType: trace.inputType, outputType: trace.outputType },
      }));
    }
  }
  return events;
}

function storageEvents(input: ReadingOperationalTelemetryRepairReadbackInput & {
  runId: string;
  timestamp: string;
}): ReadingOperationalTelemetryEvent[] {
  const records = [
    ...(input.readNeedRuntime?.storageProjection || []).map((record) => ({
      namespace: record.namespace,
      key: record.key,
      kind: record.recordKind,
      root: record.root,
      pipeline: input.readNeedRuntime?.pipelineName,
    })),
    ...(input.readFitsRuntime?.storageProjection || []).map((record) => ({
      namespace: record.namespace,
      key: record.key,
      kind: record.recordKind,
      root: record.root,
      pipeline: input.readFitsRuntime?.pipelineName,
    })),
    ...(input.previewBoundary?.storageProjection || []).map((record) => ({
      namespace: record.namespace,
      key: record.key,
      kind: record.recordKind,
      root: record.root,
      pipeline: 'AssetPackPreviewBoundary' as const,
    })),
    ...(input.settlementBoundary?.storageProjection || []).map((record) => ({
      namespace: record.namespace,
      key: record.key,
      kind: record.recordKind,
      root: record.root,
      pipeline: 'AssetPackSettlementRightsDeliveryBoundary' as const,
    })),
  ];

  return records.map((record) => streamEvent({
    runId: input.runId,
    timestamp: input.timestamp,
    eventKind: 'storage',
    progress: 'completed',
    message: `${record.namespace}/${record.key} storage projection observed`,
    executionState: {
      pipeline: record.pipeline,
      phase: 'Finish',
      outputSchema: 'ReadingOperationalStorageProjection',
      returnType: 'ReadingOperationalStorageProjection',
    },
    metadata: {
      namespace: record.namespace,
      key: record.key,
      recordKind: record.kind,
      root: record.root,
    },
  }));
}

function settlementEvents(input: ReadingOperationalTelemetryRepairReadbackInput & {
  runId: string;
  timestamp: string;
}): ReadingOperationalTelemetryEvent[] {
  const settlement = input.settlementBoundary;
  if (!settlement) return [];
  const progress: ReadingOperationalTelemetryProgress =
    settlement.state === 'settlement_delivered' ? 'completed' : 'repair-required';
  return [
    streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'wallet',
      progress,
      message: `BTC payment ${settlement.paymentObservation.observedDebitSats}/${settlement.paymentObservation.expectedSats} sats observed`,
      executionState: {
        pipeline: 'AssetPackSettlementRightsDeliveryBoundary',
        phase: 'Finish',
        outputSchema: 'AssetPackSettlementPaymentObservation',
        returnType: 'AssetPackSettlementPaymentObservation',
        failClosedState: progress === 'repair-required' ? settlement.state : undefined,
      },
      metadata: {
        paymentReceiptRoot: settlement.paymentObservation.paymentReceiptRoot,
        txid: settlement.paymentObservation.txid,
        btcNetwork: settlement.paymentObservation.btcNetwork,
        serverCustody: settlement.paymentObservation.serverCustody,
      },
    }),
    streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'ledger',
      progress,
      message: `Ledger/database/storage reconciliation ${settlement.reconciliationReport.state}`,
      executionState: {
        pipeline: 'AssetPackSettlementRightsDeliveryBoundary',
        phase: 'Finish',
        outputSchema: 'LedgerDatabaseReconciliationReport',
        returnType: 'LedgerDatabaseReconciliationReport',
        failClosedState: settlement.reconciliationReport.blocking ? 'ledger_database_storage_projection_not_aligned' : undefined,
      },
      metadata: {
        reconciliationRoot: settlement.proofRoots.reconciliationRoot,
        blocking: settlement.reconciliationReport.blocking,
        repairActions: settlement.reconciliationReport.repairActions,
      },
    }),
    streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'delivery',
      progress,
      message: `Pull-request delivery ${settlement.deliveryUnlock.state}`,
      executionState: {
        pipeline: 'AssetPackSettlementRightsDeliveryBoundary',
        phase: 'Finish',
        outputSchema: 'AssetPackDeliveryUnlockReceipt',
        returnType: 'AssetPackDeliveryUnlockReceipt',
        failClosedState: settlement.deliveryUnlock.blockerCodes[0],
      },
      metadata: {
        deliveryRoot: settlement.deliveryUnlock.deliveryRoot,
        pullRequestTarget: settlement.deliveryUnlock.pullRequestTarget,
        sourceBearingDeliveryVisibleToReader: settlement.deliveryUnlock.sourceBearingDeliveryVisibleToReader,
        blockerCodes: settlement.deliveryUnlock.blockerCodes,
      },
    }),
  ];
}

function uiEvents(input: ReadingOperationalTelemetryRepairReadbackInput & {
  runId: string;
  timestamp: string;
}): ReadingOperationalTelemetryEvent[] {
  const stageStates = stageStatesFor(input);
  return [
    ['requestRead', 'Request Read', stageStates.requestRead],
    ['reviewSynthesizedNeed', 'Review Synthesized Need', stageStates.reviewSynthesizedNeed],
    ['requestFindingFits', 'Request Finding Fits', stageStates.requestFindingFits],
    ['reviewAssetPackPreview', 'Review AssetPack Preview', stageStates.reviewAssetPackPreview],
    ['buyAssetPackSettle', 'Buy AssetPack And Settle', stageStates.buyAssetPackSettle],
  ].map(([stageId, label, progress]) => streamEvent({
    runId: input.runId,
    timestamp: input.timestamp,
    eventKind: 'ui',
    progress: progress as ReadingOperationalTelemetryProgress,
    message: `${label} UI state ${progress}`,
    executionState: {
      phase: 'Finish',
      outputSchema: 'ProductEnterpriseReadingUxState',
      returnType: 'ProductEnterpriseReadingUxState',
      failClosedState: progress === 'blocked' || progress === 'repair-required' ? String(stageId) : undefined,
    },
    metadata: { readingStageId: stageId },
  }));
}

function repairEvents(input: ReadingOperationalTelemetryRepairReadbackInput & {
  runId: string;
  timestamp: string;
}): ReadingOperationalTelemetryEvent[] {
  const blockers = blockersFor(input);
  if (!blockers.length) {
    return [streamEvent({
      runId: input.runId,
      timestamp: input.timestamp,
      eventKind: 'repair',
      progress: 'completed',
      message: 'No Reading repair blockers observed',
      executionState: {
        phase: 'Finish',
        outputSchema: 'ReadingOperationalRepairPosture',
        returnType: 'ReadingOperationalRepairPosture',
      },
      metadata: { blockers: [] },
    })];
  }
  return blockers.map((blocker) => streamEvent({
    runId: input.runId,
    timestamp: input.timestamp,
    eventKind: 'repair',
    progress: 'repair-required',
    message: `Repair required: ${blocker}`,
    executionState: {
      phase: 'Finish',
      outputSchema: 'ReadingOperationalRepairPosture',
      returnType: 'ReadingOperationalRepairPosture',
      failClosedState: blocker,
    },
    metadata: { blocker },
  }));
}

function stageStatesFor(input: ReadingOperationalTelemetryRepairReadbackInput): ReadingOperationalOperatorReadback['stageStates'] {
  const needAccepted = input.readNeedRuntime?.reviewState === 'accepted';
  const fitsReady = input.readFitsRuntime?.resultState === 'worthy_fit';
  const previewReady = Boolean(input.previewBoundary);
  const settlementDelivered = input.settlementBoundary?.state === 'settlement_delivered';
  const settlementRepair = Boolean(input.settlementBoundary && !settlementDelivered);

  return {
    requestRead: input.readNeedRuntime ? 'completed' : 'blocked',
    reviewSynthesizedNeed: needAccepted ? 'completed' : input.readNeedRuntime ? 'blocked' : 'planned',
    requestFindingFits: fitsReady ? 'completed' : needAccepted ? 'blocked' : 'planned',
    reviewAssetPackPreview: previewReady ? 'completed' : fitsReady ? 'blocked' : 'planned',
    buyAssetPackSettle: settlementDelivered ? 'completed' : settlementRepair ? 'repair-required' : previewReady ? 'blocked' : 'planned',
  };
}

function blockersFor(input: ReadingOperationalTelemetryRepairReadbackInput): string[] {
  return [
    ...(input.readNeedRuntime?.findingFitsAdmission.blockers || []),
    ...(input.readFitsRuntime?.repairPosture.blockers || []),
    ...(input.previewBoundary?.repairPosture.blockers || []),
    ...(input.settlementBoundary?.repairPosture.blockers || []),
  ].filter((blocker, index, blockers) => blocker && blockers.indexOf(blocker) === index).sort();
}

function warningsFor(input: ReadingOperationalTelemetryRepairReadbackInput): string[] {
  return [
    ...(input.readFitsRuntime?.repairPosture.warnings || []),
    ...(input.previewBoundary?.repairPosture.warnings || []),
    ...(input.settlementBoundary?.repairPosture.warnings || []),
  ].filter((warning, index, warnings) => warning && warnings.indexOf(warning) === index).sort();
}

function runbookHooksFor(input: ReadingOperationalTelemetryRepairReadbackInput): ReadingOperationalRepairRunbookHook[] {
  const hooks: Array<Omit<ReadingOperationalRepairRunbookHook, 'schema' | 'proofRoot'>> = [
    {
      hookId: 'open-rich-execution-log',
      label: 'Open the rich execution log and inspect source-safe event metadata.',
      triggerEventKinds: ['phase', 'ptrr-agent', 'ptrr-step', 'failsafe', 'thinkings-generation', 'tool'],
      repairActions: ['inspect_source_safe_execution_state'],
    },
    {
      hookId: 'inspect-source-safe-metadata',
      label: 'Inspect storage projections, proof roots, and disclosure posture without source leakage.',
      triggerEventKinds: ['storage', 'ui'],
      repairActions: ['compare_storage_roots', 'verify_disclosure_tier'],
    },
  ];

  if (!input.readNeedRuntime || input.readNeedRuntime.reviewState !== 'accepted') {
    hooks.push({
      hookId: 'retry-read-need-resynthesis',
      label: 'Retry or resynthesize the ReadNeed before Finding Fits.',
      triggerEventKinds: ['repair', 'ui'],
      repairActions: ['resynthesize_read_need', 'accept_read_need'],
    });
  }
  if (input.readFitsRuntime && input.readFitsRuntime.resultState !== 'worthy_fit') {
    hooks.push({
      hookId: 'repair-depository-search-readback',
      label: 'Repair Depository search evidence, candidate proofs, measurements, or readback.',
      triggerEventKinds: ['tool', 'repair'],
      repairActions: input.readFitsRuntime.repairPosture.nextActions,
    });
  }
  if (input.settlementBoundary) {
    if (input.settlementBoundary.state === 'blocked_until_payment_finality') {
      hooks.push({
        hookId: 'observe-btc-payment-finality',
        label: 'Observe BTC payment finality and retry settlement delivery.',
        triggerEventKinds: ['wallet', 'ledger', 'repair'],
        repairActions: input.settlementBoundary.repairPosture.nextActions,
      });
    }
    if (input.settlementBoundary.state === 'blocked_until_projection_repair') {
      hooks.push({
        hookId: 'repair-ledger-database-storage-projection',
        label: 'Repair ledger, database, and object-storage projection drift.',
        triggerEventKinds: ['ledger', 'storage', 'repair'],
        repairActions: input.settlementBoundary.repairPosture.nextActions,
      });
    }
    if (input.settlementBoundary.state === 'blocked_until_pull_request_delivery') {
      hooks.push({
        hookId: 'recover-pull-request-delivery',
        label: 'Recover the source-bearing pull-request delivery after settlement.',
        triggerEventKinds: ['delivery', 'repair'],
        repairActions: input.settlementBoundary.repairPosture.nextActions,
      });
    }
  }

  return hooks.map((hook) => ({
    schema: 'bitcode.reading.operational-repair-runbook-hook',
    ...hook,
    proofRoot: rootOf(hook),
  }));
}

function eventCounts(events: ReadingOperationalTelemetryEvent[]): Record<ReadingOperationalTelemetryEventKind, number> {
  const counts = {
    phase: 0,
    'ptrr-agent': 0,
    'ptrr-step': 0,
    failsafe: 0,
    'thinkings-generation': 0,
    tool: 0,
    storage: 0,
    ledger: 0,
    wallet: 0,
    delivery: 0,
    ui: 0,
    repair: 0,
  };
  for (const event of events) counts[event.eventKind] += 1;
  return counts;
}

function storageRecord(
  recordKind: ReadingOperationalTelemetryStorageRecord['recordKind'],
  key: string,
  payload: Record<string, unknown>,
): ReadingOperationalTelemetryStorageRecord {
  const root = rootOf({ recordKind, key, payload });
  return {
    schema: 'bitcode.reading.operational-telemetry.storage-record',
    recordId: `reading-operational-${recordKind}-${sha256(`${key}:${root}`).slice(0, 16)}`,
    namespace: 'reading/operational',
    key,
    recordKind,
    root,
    sourceSafety: SOURCE_SAFETY,
    payload,
  };
}

export function buildReadingOperationalTelemetryRepairReadback(
  input: ReadingOperationalTelemetryRepairReadbackInput,
): ReadingOperationalTelemetryRepairReadback {
  const timestamp = input.createdAt || new Date(0).toISOString();
  const runId =
    firstString(
      input.runId,
      input.readNeedRuntime?.runtimeId,
      input.readFitsRuntime?.runtimeId,
      input.previewBoundary?.boundaryId,
      input.settlementBoundary?.boundaryId,
    ) || `reading-run-${sha256(timestamp).slice(0, 16)}`;
  const readNeedTraces = listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT);
  const readFitsTraces = listReadingPipelineTelemetryTrace(READ_FITS_FINDING_SYNTHESIS_CONTRACT);
  const streamEvents = [
    ...pipelineTraceEvents({
      runId,
      timestamp,
      pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
      traces: readNeedTraces,
      resultState: input.readNeedRuntime?.reviewState || 'unobserved',
    }),
    ...pipelineTraceEvents({
      runId,
      timestamp,
      pipelineName: READ_FITS_FINDING_SYNTHESIS,
      traces: readFitsTraces,
      resultState: input.readFitsRuntime?.resultState || 'unobserved',
    }),
    ...storageEvents({ ...input, runId, timestamp }),
    ...settlementEvents({ ...input, runId, timestamp }),
    ...uiEvents({ ...input, runId, timestamp }),
    ...repairEvents({ ...input, runId, timestamp }),
  ];
  const hooks = runbookHooksFor(input);
  const telemetryRoot = rootOf(streamEvents.map((event) => event.proofRoot));
  const repairRoot = rootOf({
    blockers: blockersFor(input),
    warnings: warningsFor(input),
    hooks: hooks.map((hook) => hook.proofRoot),
  });
  const readbackWithoutRoot = {
    schema: 'bitcode.reading.operational-operator-readback' as const,
    runId,
    stageStates: stageStatesFor(input),
    eventCounts: eventCounts(streamEvents),
    blockers: blockersFor(input),
    warnings: warningsFor(input),
    runbookHookIds: hooks.map((hook) => hook.hookId),
    proofRoots: {
      readNeedRuntimeRoot: input.readNeedRuntime?.proofRoots.runtimeRoot || null,
      readFitsRuntimeRoot: input.readFitsRuntime?.proofRoots.runtimeRoot || null,
      previewBoundaryRoot: input.previewBoundary?.proofRoots.boundaryRoot || null,
      settlementBoundaryRoot: input.settlementBoundary?.proofRoots.boundaryRoot || null,
      telemetryRoot,
      repairRoot,
    },
  };
  const readbackRoot = rootOf(readbackWithoutRoot);
  const readback: ReadingOperationalOperatorReadback = {
    schema: 'bitcode.reading.operational-operator-readback',
    readbackId: `reading-operational-readback-${sha256(readbackRoot).slice(0, 16)}`,
    runId,
    stageStates: readbackWithoutRoot.stageStates,
    eventCounts: readbackWithoutRoot.eventCounts,
    proofRoots: {
      readNeedRuntimeRoot: readbackWithoutRoot.proofRoots.readNeedRuntimeRoot,
      readFitsRuntimeRoot: readbackWithoutRoot.proofRoots.readFitsRuntimeRoot,
      previewBoundaryRoot: readbackWithoutRoot.proofRoots.previewBoundaryRoot,
      settlementBoundaryRoot: readbackWithoutRoot.proofRoots.settlementBoundaryRoot,
      telemetryRoot,
      repairRoot,
      readbackRoot,
    },
    blockers: readbackWithoutRoot.blockers,
    warnings: readbackWithoutRoot.warnings,
    runbookHooks: hooks,
    sourceSafety: SOURCE_SAFETY,
  };
  const storageProjection = [
    storageRecord('event_stream', 'sourceSafeStreamEvents', {
      eventCount: streamEvents.length,
      eventKinds: Object.keys(eventCounts(streamEvents)),
      telemetryRoot,
      events: streamEvents.map((event) => ({
        eventId: event.eventId,
        eventKind: event.eventKind,
        progress: event.progress,
        proofRoot: event.proofRoot,
        executionState: event.executionState,
      })),
    }),
    storageRecord('operator_readback', 'operatorReadback', jsonSafe(readback)),
    storageRecord('repair_runbook', 'repairRunbookHooks', {
      hookCount: hooks.length,
      hooks: hooks.map((hook) => jsonSafe(hook)),
    }),
    storageRecord('telemetry_root', 'telemetryRoots', {
      telemetryRoot,
      repairRoot,
      readbackRoot,
    }),
  ];
  const storageRoot = rootOf(storageProjection.map((record) => record.root));
  return {
    schema: 'bitcode.reading.operational-telemetry-repair-readback',
    readbackId: readback.readbackId,
    runId,
    streamEvents,
    operatorReadback: readback,
    storageProjection,
    runbookHooks: hooks,
    sourceSafety: SOURCE_SAFETY,
    proofRoots: {
      telemetryRoot,
      eventStreamRoot: rootOf(streamEvents.map((event) => event.eventId)),
      repairRoot,
      readbackRoot,
      storageRoot,
    },
  };
}

export function persistReadingOperationalTelemetryRepairReadback(
  execution: { store?: (namespace: string, key: string, value: unknown) => unknown } | null | undefined,
  readback: ReadingOperationalTelemetryRepairReadback,
): ReadingOperationalTelemetryRepairReadback {
  try {
    execution?.store?.('reading/operational', 'readback', readback as unknown as Record<string, unknown>);
    execution?.store?.('reading/operational', 'operatorReadback', readback.operatorReadback as unknown as Record<string, unknown>);
    execution?.store?.('reading/operational', 'streamEvents', readback.streamEvents as unknown as Record<string, unknown>);
    execution?.store?.('reading/operational', 'runbookHooks', readback.runbookHooks as unknown as Record<string, unknown>);
    execution?.store?.('reading/operational', 'telemetryRoot', readback.proofRoots.telemetryRoot);
    execution?.store?.('reading/operational', 'repairRoot', readback.proofRoots.repairRoot);
    execution?.store?.('reading/operational', 'readbackRoot', readback.proofRoots.readbackRoot);
    for (const record of readback.storageProjection) {
      execution?.store?.(record.namespace, record.key, record.payload);
    }
  } catch {
    // Operator readback storage must not mask a completed pipeline result.
  }
  return readback;
}

export function summarizeReadingOperationalTelemetryRepairReadback(
  readback: ReadingOperationalTelemetryRepairReadback,
) {
  return {
    schema: readback.schema,
    readbackId: readback.readbackId,
    runId: readback.runId,
    eventCount: readback.streamEvents.length,
    eventCounts: readback.operatorReadback.eventCounts,
    stageStates: readback.operatorReadback.stageStates,
    blockers: readback.operatorReadback.blockers,
    warnings: readback.operatorReadback.warnings,
    runbookHookIds: readback.runbookHooks.map((hook) => hook.hookId),
    sourceSafety: readback.sourceSafety,
    proofRoots: {
      telemetryRoot: shortRoot(readback.proofRoots.telemetryRoot),
      repairRoot: shortRoot(readback.proofRoots.repairRoot),
      readbackRoot: shortRoot(readback.proofRoots.readbackRoot),
    },
  };
}
