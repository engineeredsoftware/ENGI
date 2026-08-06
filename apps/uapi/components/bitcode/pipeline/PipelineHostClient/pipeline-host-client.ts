/**
 * Relocated from product experience components/pipeline-host-client.ts.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

import type {
  ProductDepositedSourceRevision,
  ProductDepositReadWorkbench,
} from '@/components/reads/models/deposit-read-workbench';
import type { RepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';

export type ProductReadFitsFindingSynthesisHostRequest = {
  mode: 'asset_pack_pipeline';
  readId: string;
  readPrompt: string;
  acceptedReadNeed: unknown;
  requireAcceptedReadNeed: true;
  depositId: string;
  depositAssetId?: string | null;
  depositHasWalletOrAttestationProof?: boolean;
  depositHasAssetMeasurementEvidence?: boolean;
  depositProofRoot?: string | null;
  depositMeasurementRoot?: string | null;
  depositReconciliationReadbackRoot?: string | null;
  repositoryFullName: string;
  sourceBranch: string;
  sourceCommit: string;
  sourceGitUrl?: string;
  sourceRevision?: string;
  connectionId?: string | number | null;
  sourceDepth: number;
};

export type ProductReadFitsFindingSynthesisHostRequestState =
  | {
      ready: true;
      request: ProductReadFitsFindingSynthesisHostRequest;
      missing: [];
    }
  | {
      ready: false;
      request: null;
      missing: string[];
    };

export type ProductReadFitsFindingSynthesisHostEvent = {
  event: string;
  data: unknown;
};

export type ProductReadFitsFindingSynthesisHostStreamSnapshot = {
  runId: string | null;
  output: string;
  outputDetails: Record<string, unknown>;
  executionState: Record<string, unknown>;
  isStreamingComplete: boolean;
  generationCount: number;
  error: string | null;
};

type StreamCallbacks = {
  onEvent?: (event: ProductReadFitsFindingSynthesisHostEvent) => void;
};

function normalizedText(value?: string | null): string {
  return String(value || '').trim();
}

function readRowValue(rows: Array<{ label: string; value: string }>, label: string): string {
  return normalizedText(rows.find((row) => row.label === label)?.value);
}

function githubCloneUrl(repositoryFullName: string): string {
  return `https://github.com/${repositoryFullName}.git`;
}

export function buildProductReadFitsFindingSynthesisHostRequest({
  workbench,
  repositoryContext,
  depositedSourceRevision,
  readActivityId,
  acceptedReadNeed,
}: {
  workbench: ProductDepositReadWorkbench | null;
  repositoryContext?: RepositoryContextState | null;
  depositedSourceRevision?: ProductDepositedSourceRevision | null;
  readActivityId?: string | null;
  acceptedReadNeed?: unknown;
}): ProductReadFitsFindingSynthesisHostRequestState {
  const selectedRepository = repositoryContext?.selectedRepository || null;
  const sourceRevision = workbench?.sourceRevision || null;
  const repositoryFullName = normalizedText(
    sourceRevision?.repositoryFullName ||
      depositedSourceRevision?.repositoryFullName ||
      selectedRepository?.fullName ||
      (workbench ? readRowValue(workbench.read.rows, 'Repository') : ''),
  );
  const sourceBranch = normalizedText(
    sourceRevision?.branch ||
      depositedSourceRevision?.branch ||
      repositoryContext?.selectedBranch ||
      selectedRepository?.defaultBranch ||
      (workbench ? readRowValue(workbench.fit.rows, 'Source branch') : ''),
  );
  const sourceCommit = normalizedText(
    sourceRevision?.commit ||
      depositedSourceRevision?.commit ||
      repositoryContext?.selectedCommit ||
      (workbench ? readRowValue(workbench.fit.rows, 'Source commit') : ''),
  );
  const depositId = normalizedText(depositedSourceRevision?.activityId || '');
  const readId = normalizedText(readActivityId || '');
  const acceptedNeed = recordValue(acceptedReadNeed);
  const acceptedNeedId = normalizedText(acceptedNeed?.needId as string | undefined);
  const acceptedNeedReviewState = normalizedText(acceptedNeed?.reviewState as string | undefined);

  const missing = [
    !workbench ? 'read-fit workbench' : null,
    !repositoryFullName ? 'repository' : null,
    !sourceBranch ? 'source branch' : null,
    !sourceCommit ? 'source commit' : null,
    !depositId ? 'deposit activity' : null,
    !readId ? 'admitted Read activity' : null,
    !acceptedNeedId || acceptedNeedReviewState !== 'accepted' ? 'accepted Read-Need' : null,
  ].filter((entry): entry is string => Boolean(entry));

  if (missing.length > 0 || !workbench) {
    return {
      ready: false,
      request: null,
      missing,
    };
  }

  return {
    ready: true,
    missing: [],
    request: {
      mode: 'asset_pack_pipeline',
      readId,
      readPrompt: workbench.read.summary,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositId,
      depositAssetId: depositedSourceRevision?.depositAssetId || null,
      depositHasWalletOrAttestationProof:
        depositedSourceRevision?.hasWalletOrAttestationProof ?? undefined,
      depositHasAssetMeasurementEvidence:
        depositedSourceRevision?.hasAssetMeasurementEvidence ?? undefined,
      depositProofRoot: depositedSourceRevision?.proofRoot || null,
      depositMeasurementRoot: depositedSourceRevision?.measurementRoot || null,
      depositReconciliationReadbackRoot: depositedSourceRevision?.reconciliationReadbackRoot || null,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourceGitUrl: selectedRepository?.cloneUrl || selectedRepository?.url || githubCloneUrl(repositoryFullName),
      sourceRevision: sourceCommit,
      sourceDepth: 1,
    },
  };
}

export function parseProductReadFitsFindingSynthesisHostSseBlock(
  block: string,
): ProductReadFitsFindingSynthesisHostEvent | null {
  const lines = block.split(/\r?\n/);
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim() || 'message';
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  }

  if (dataLines.length === 0) return null;

  const rawData = dataLines.join('\n');
  let data: unknown = rawData;
  try {
    data = JSON.parse(rawData);
  } catch {
    data = rawData;
  }

  return { event, data };
}

export function drainProductReadFitsFindingSynthesisHostSseBuffer(
  buffer: string,
  onEvent: (event: ProductReadFitsFindingSynthesisHostEvent) => void,
): string {
  let remaining = buffer.replace(/\r\n/g, '\n');
  let separatorIndex = remaining.indexOf('\n\n');

  while (separatorIndex >= 0) {
    const block = remaining.slice(0, separatorIndex);
    remaining = remaining.slice(separatorIndex + 2);
    const event = parseProductReadFitsFindingSynthesisHostSseBlock(block);
    if (event) onEvent(event);
    separatorIndex = remaining.indexOf('\n\n');
  }

  return remaining;
}

export async function streamProductReadFitsFindingSynthesisHost(
  request: ProductReadFitsFindingSynthesisHostRequest,
  callbacks: StreamCallbacks = {},
): Promise<void> {
  const response = await fetch('/api/pipeline-host/asset-pack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readHostRouteError(response));
  }

  if (!response.body) {
    throw new Error('Pipeline host response did not include a readable event stream.');
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer = drainProductReadFitsFindingSynthesisHostSseBuffer(
      buffer + decoder.decode(value, { stream: true }),
      (event) => callbacks.onEvent?.(event),
    );
  }

  const finalChunk = decoder.decode();
  if (finalChunk) {
    buffer = drainProductReadFitsFindingSynthesisHostSseBuffer(buffer + finalChunk, (event) =>
      callbacks.onEvent?.(event),
    );
  }
  if (buffer.trim()) {
    const event = parseProductReadFitsFindingSynthesisHostSseBlock(buffer);
    if (event) callbacks.onEvent?.(event);
  }
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringList(value: unknown, limit = 3): string[] {
  return Array.isArray(value)
    ? value.map((entry) => String(entry)).filter(Boolean).slice(0, limit)
    : [];
}

function summarizeCandidateIds(value: unknown): string {
  const ids = stringList(value, 3);
  if (!ids.length) return 'no selected candidates';
  return ids.length === 1 ? `candidate ${ids[0]}` : `candidates ${ids.join(', ')}`;
}

function numberText(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
}

function shortIdentifier(value: unknown): string | null {
  const text = stringIdentifier(value);
  if (!text) return null;
  return text.length > 16 ? `${text.slice(0, 12)}...` : text;
}

function contractIdentifier(value: unknown, segments = 3): string | null {
  const text = stringIdentifier(value);
  if (!text) return null;
  const parts = text.split('.').filter(Boolean);
  return parts.length > segments ? parts.slice(-segments).join('.') : text;
}

function stringIdentifier(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

function canonicalPhase(value: unknown, fallback = 'Setup'): string {
  const text = typeof value === 'string' ? value.toLowerCase() : '';
  if (text.includes('setup') || text.includes('admission') || text.includes('preflight')) return 'Setup';
  if (text.includes('discovery') || text.includes('search') || text.includes('recall') || text.includes('candidate')) return 'Discovery';
  if (text.includes('implementation') || text.includes('synthesis') || text.includes('asset-pack') || text.includes('write')) return 'Implementation';
  if (text.includes('validation') || text.includes('evaluate') || text.includes('quality') || text.includes('readiness')) return 'Validation';
  if (text.includes('finish') || text.includes('delivery') || text.includes('settlement') || text.includes('finality') || text.includes('readback')) return 'Finish';
  return fallback;
}

function classifyHostLogType(event: ProductReadFitsFindingSynthesisHostEvent): string {
  const data = recordValue(event.data);
  const type = data?.type ? String(data.type) : '';
  const telemetryEvent = recordValue(data?.telemetryEvent);
  const streamEventType = String(telemetryEvent?.streamEventType || telemetryEvent?.type || '').toLowerCase();
  const namespace = String(telemetryEvent?.namespace || '').toLowerCase();
  const key = String(telemetryEvent?.key || '').toLowerCase();

  if (event.event === 'host-failed') return 'error';
  if (event.event === 'host-completed') return 'completion';
  if (event.event === 'host-preflight' && data?.realInferenceEnabled === false) return 'error';
  if (type === 'command-started' || type === 'command-completed' || type === 'artifacts-read' || type === 'sandbox-created') {
    return 'tool-use';
  }
  if (type === 'telemetry-artifact-event') {
    if (streamEventType.includes('error')) return 'error';
    if (
      streamEventType.includes('generation') ||
      namespace === 'llm' ||
      key.includes('parsedoutput') ||
      typeof telemetryEvent?.inputMessageCount === 'number' ||
      typeof telemetryEvent?.outputContentLength === 'number' ||
      telemetryEvent?.promptTemplatePresent === true ||
      telemetryEvent?.interpolatedPromptPresent === true ||
      telemetryEvent?.reasoningPresent === true ||
      telemetryEvent?.judgmentPresent === true ||
      telemetryEvent?.rawModelResponsePresent === true ||
      telemetryEvent?.parsedTypedOutputPresent === true
    ) {
      return 'generation';
    }
    if (streamEventType.includes('tool') || namespace.includes('tool')) return 'tool-use';
    if (streamEventType.includes('complete')) return 'completion';
  }
  return 'thinking';
}

function buildHostExecutionState(event: ProductReadFitsFindingSynthesisHostEvent): Record<string, unknown> {
  if (event.event === 'host-completed') {
    return {
      phase: 'Finish',
      agent: 'asset-pack-pipeline-host',
      step: 'completed',
    };
  }
  if (event.event === 'host-failed') {
    return {
      phase: 'Setup',
      agent: 'asset-pack-pipeline-host',
      step: 'failed',
    };
  }

  const data = recordValue(event.data);
  const telemetryEvent = recordValue(data?.telemetryEvent);
  const telemetryExecutionState = recordValue(telemetryEvent?.executionState);
  const readingTelemetry =
    recordValue(telemetryEvent?.readingPipelineTelemetry) ||
    recordValue(data?.readingPipelineTelemetry);
  const type = data?.type ? String(data.type) : event.event;
  const stage = telemetryEvent?.stage || telemetryExecutionState?.phase || type;
  const streamEventType = telemetryEvent?.streamEventType || telemetryEvent?.type || type;
  const namespace = telemetryEvent?.namespace ? String(telemetryEvent.namespace) : null;
  const key = telemetryEvent?.key ? String(telemetryEvent.key) : null;

  return {
    phase: canonicalPhase(stage),
    agent:
      telemetryExecutionState?.agent ||
      telemetryEvent?.agent ||
      telemetryEvent?.agentName ||
      data?.agent ||
      data?.label ||
      'asset-pack-pipeline-host',
    step:
      readingTelemetry?.ptrrStepName ||
      telemetryExecutionState?.step ||
      telemetryEvent?.step ||
      streamEventType ||
      type,
    pipeline: readingTelemetry?.pipelineName || telemetryEvent?.pipelineName,
    phaseId: readingTelemetry?.phaseId || telemetryEvent?.phaseId,
    agentId: readingTelemetry?.agentId || telemetryEvent?.agentId,
    ptrrStepId: readingTelemetry?.ptrrStepId || telemetryEvent?.ptrrStepId,
    ptrrStepName: readingTelemetry?.ptrrStepName || telemetryEvent?.ptrrStepName,
    failsafe:
      readingTelemetry?.thinkingsFailsafe ||
      // Historical persisted events carry the pre-rename field name.
      readingTelemetry?.thricifiedFailsafe ||
      telemetryExecutionState?.failsafe ||
      telemetryEvent?.failsafe,
    generation:
      readingTelemetry?.thinkingsGenerationId ||
      // Historical persisted events carry the pre-rename field name.
      readingTelemetry?.thricifiedGenerationId ||
      telemetryExecutionState?.generation ||
      telemetryEvent?.generation ||
      (classifyHostLogType(event) === 'generation' ? [namespace, key].filter(Boolean).join('.') || 'model' : undefined),
    tool:
      readingTelemetry?.toolId ||
      telemetryExecutionState?.tool ||
      telemetryEvent?.tool ||
      telemetryEvent?.toolName ||
      (classifyHostLogType(event) === 'tool-use' ? type : undefined),
    promptTemplateId: readingTelemetry?.promptTemplateId || telemetryEvent?.promptTemplateId,
    outputSchema: readingTelemetry?.outputSchema || telemetryEvent?.outputSchema,
    returnType: readingTelemetry?.returnType || telemetryEvent?.returnType,
  };
}

function hostEventTimestamp(event: ProductReadFitsFindingSynthesisHostEvent): string | undefined {
  const data = recordValue(event.data);
  const telemetryEvent = recordValue(data?.telemetryEvent);
  const timestamp =
    telemetryEvent?.timestamp ||
    data?.startedAt ||
    data?.completedAt ||
    data?.timestamp ||
    null;
  return timestamp ? String(timestamp) : undefined;
}

function hostProgress(event: ProductReadFitsFindingSynthesisHostEvent): 'error' | 'success' | 'in-progress' {
  if (event.event === 'host-failed') return 'error';
  if (event.event === 'host-completed') return 'success';
  return 'in-progress';
}

export function buildProductReadFitsFindingSynthesisHostStreamSnapshot(
  events: ProductReadFitsFindingSynthesisHostEvent[],
  hostState: 'idle' | 'running' | 'completed' | 'failed',
  streamError: string | null = null,
): ProductReadFitsFindingSynthesisHostStreamSnapshot {
  const outputDetails: Record<string, unknown> = {};
  const outputLines: string[] = [];
  let latestExecutionState: Record<string, unknown> = {
    phase: hostState === 'completed' ? 'Finish' : 'Setup',
    agent: 'asset-pack-pipeline-host',
    step: hostState,
  };
  let generationCount = 0;
  let runId: string | null = null;

  events.forEach((event, index) => {
    const summary = summarizeProductReadFitsFindingSynthesisHostEvent(event);
    let line = summary;
    if (outputDetails[line]) {
      line = `${summary} #${index + 1}`;
    }

    const type = classifyHostLogType(event);
    const executionState = buildHostExecutionState(event);
    const timestamp = hostEventTimestamp(event);
    const data = recordValue(event.data);
    const telemetryEvent = recordValue(data?.telemetryEvent);
    const readingPipelineTelemetry =
      recordValue(telemetryEvent?.readingPipelineTelemetry) ||
      recordValue(data?.readingPipelineTelemetry);
    const evidence = recordValue(data?.evidence);

    runId =
      stringIdentifier(data?.runId) ||
      stringIdentifier(telemetryEvent?.runId) ||
      stringIdentifier(evidence?.runId) ||
      runId;

    if (type === 'generation') generationCount += 1;
    latestExecutionState = executionState;
    outputLines.push(line);
    outputDetails[line] = {
      type,
      timestamp,
      hostEvent: event.event,
      status: {
        message: summary,
        detail: summary,
        progress: hostProgress(event),
        timestamp,
        executionState,
        metadata: {
          hostEvent: event.event,
          hostPayload: event.data,
          telemetryEvent,
          readingPipelineTelemetry,
          inferenceAudit: telemetryEvent?.inferenceAudit || null,
        },
      },
    };
  });

  return {
    runId,
    output: outputLines.join('\n'),
    outputDetails,
    executionState: latestExecutionState,
    isStreamingComplete: hostState === 'completed' || hostState === 'failed',
    generationCount,
    error: streamError || (hostState === 'failed' ? 'Live AssetPack fit host run failed.' : null),
  };
}

function summarizeTelemetryArtifactEvent(data: Record<string, unknown>): string {
  const telemetryEvent = recordValue(data.telemetryEvent);
  if (!telemetryEvent) {
    return `Telemetry line ${String(data.lineNumber || '?')} could not be parsed.`;
  }

  const executionState = recordValue(telemetryEvent.executionState);
  const readingTelemetry =
    recordValue(telemetryEvent.readingPipelineTelemetry) ||
    recordValue(data.readingPipelineTelemetry);
  const streamType = String(
    telemetryEvent.streamEventType ||
      telemetryEvent.type ||
      'event',
  );
  const stage = String(
    telemetryEvent.stage ||
      executionState?.phase ||
      'telemetry-readback',
  );
  const namespace = telemetryEvent.namespace ? String(telemetryEvent.namespace) : null;
  const key = telemetryEvent.key ? String(telemetryEvent.key) : null;
  const runId = shortIdentifier(telemetryEvent.runId);
  const lineNumber = data.lineNumber ? `line ${String(data.lineNumber)}` : 'line';
  const executionPath = Array.isArray(telemetryEvent.executionPath)
    ? telemetryEvent.executionPath.map((entry) => String(entry)).filter(Boolean).slice(-4).join(' > ')
    : '';
  const dataKeys = stringList(telemetryEvent.dataKeys, 4);
  const inspectable = recordValue(telemetryEvent.inspectable);
  const inspectableKeys = stringList(inspectable?.keys, 4);
  const tool = readingTelemetry?.toolId
    ? String(readingTelemetry.toolId)
    : telemetryEvent.tool
      ? String(telemetryEvent.tool)
      : null;
  const toolState = typeof telemetryEvent.toolOk === 'boolean'
    ? telemetryEvent.toolOk
      ? 'ok'
      : 'failed'
    : null;
  const inputMessageCount = typeof telemetryEvent.inputMessageCount === 'number'
    ? `${telemetryEvent.inputMessageCount} input messages`
    : null;
  const outputContentLength = typeof telemetryEvent.outputContentLength === 'number'
    ? `${telemetryEvent.outputContentLength} output chars`
    : null;
  const parsedOutput = telemetryEvent.parsedOutputPresent === true ? 'parsed output present' : null;
  const promptTemplate = telemetryEvent.promptTemplatePresent === true ? 'prompt template present' : null;
  const interpolatedPrompt = telemetryEvent.interpolatedPromptPresent === true ? 'interpolated prompt present' : null;
  const reasoning = telemetryEvent.reasoningPresent === true ? 'reasoning present' : null;
  const judgment = telemetryEvent.judgmentPresent === true ? 'judgment present' : null;
  const rawResponse = telemetryEvent.rawModelResponsePresent === true ? 'raw response present' : null;
  const parsedTypedOutput = telemetryEvent.parsedTypedOutputPresent === true ? 'parsed typed output present' : null;
  const pipelineName = readingTelemetry?.pipelineName || telemetryEvent.pipelineName;
  const phaseId = readingTelemetry?.phaseId || telemetryEvent.phaseId;
  const ptrrStepId = readingTelemetry?.ptrrStepId || telemetryEvent.ptrrStepId;
  const thinkingsGenerationId =
    readingTelemetry?.thinkingsGenerationId ||
    telemetryEvent.thinkingsGenerationId ||
    // Historical persisted events carry the pre-rename field name.
    readingTelemetry?.thricifiedGenerationId ||
    telemetryEvent.thricifiedGenerationId;
  const promptTemplateId = readingTelemetry?.promptTemplateId || telemetryEvent.promptTemplateId;
  const outputSchema = readingTelemetry?.outputSchema || telemetryEvent.outputSchema;
  const returnType = readingTelemetry?.returnType || telemetryEvent.returnType;
  const toolDetails = [
    telemetryEvent.toolInputPresent === true ? 'input' : null,
    telemetryEvent.toolOutputPresent === true ? 'output' : null,
    telemetryEvent.toolErrorPresent === true ? 'error' : null,
  ].filter(Boolean).join('/');

  return [
    `Telemetry ${lineNumber}: ${stage} ${streamType}`,
    namespace || key ? [namespace, key].filter(Boolean).join('.') : null,
    executionPath ? `path ${executionPath}` : null,
    runId ? `run ${runId}` : null,
    pipelineName ? `pipeline ${String(pipelineName)}` : null,
    phaseId ? `phase ${contractIdentifier(phaseId, 2)}` : null,
    ptrrStepId ? `PTRR ${contractIdentifier(ptrrStepId, 3)}` : null,
    thinkingsGenerationId
      ? `ThinkingsGeneration ${contractIdentifier(thinkingsGenerationId, 4)}`
      : null,
    promptTemplateId ? `prompt ${contractIdentifier(promptTemplateId, 2)}` : null,
    outputSchema ? `schema ${String(outputSchema)}` : returnType ? `return ${String(returnType)}` : null,
    tool ? `tool ${tool}${toolState ? ` ${toolState}` : ''}${toolDetails ? ` ${toolDetails}` : ''}` : null,
    dataKeys.length ? `data ${dataKeys.join(', ')}` : null,
    inspectableKeys.length ? `inspectable ${inspectableKeys.join(', ')}` : null,
    inputMessageCount,
    outputContentLength,
    promptTemplate,
    interpolatedPrompt,
    reasoning,
    judgment,
    rawResponse,
    parsedOutput,
    parsedTypedOutput,
  ].filter(Boolean).join('; ') + '.';
}

export function summarizeProductReadFitsFindingSynthesisHostEvent(
  event: ProductReadFitsFindingSynthesisHostEvent,
): string {
  const data = recordValue(event.data);
  if (event.event === 'host-started') {
    const runId = shortIdentifier(data?.runId);
    const needId = shortIdentifier(data?.readNeedId);
    return [
      `Host started for ${data?.repositoryFullName || 'selected repository'}`,
      needId ? `Need ${needId}` : null,
      runId ? `run ${runId}` : null,
    ].filter(Boolean).join('; ') + '.';
  }
  if (event.event === 'host-preflight') {
    const realInferenceRequired = data?.realInferenceRequired !== false;
    const blockers = [
      realInferenceRequired && data?.realInferenceEnabled === false ? 'real inference flag missing' : null,
      data?.fullProfileRequiresAsyncCompletion === true
        ? 'full profile requires async completion gate'
        : null,
      data?.openaiCredentialProvided === false ? 'OpenAI credential missing' : null,
      data?.supabaseUrlProvided === false ? 'Supabase URL missing' : null,
      data?.supabaseServiceRoleProvided === false ? 'Supabase admin key missing' : null,
      data?.supabaseRestDbHostAligned === false ? 'Supabase REST/DB lane mismatch' : null,
    ].filter(Boolean);
    const profile = data?.realInferenceProfile ? String(data.realInferenceProfile) : null;
    const budget = numberText(data?.runtimeBudgetMs);
    const host = data?.supabaseHost ? String(data.supabaseHost) : null;
    const dbHost = data?.supabaseDbHost ? String(data.supabaseDbHost) : null;
    const hostText = host && dbHost && host !== dbHost ? `rest ${host} db ${dbHost}` : host ? `db ${host}` : null;
    return blockers.length
      ? `Host preflight blocked: ${blockers.join(', ')}.`
      : [
          realInferenceRequired
            ? 'Host preflight passed with real inference and database streaming credentials present'
            : 'Host preflight passed with database streaming credentials present; local real-inference strictness off',
          profile ? `profile ${profile}` : null,
          budget ? `budget ${budget}ms` : null,
          hostText,
        ].filter(Boolean).join('; ') + '.';
  }
  if (event.event === 'host-completed') {
    const evidence = recordValue(data?.evidence);
    const fitResult = recordValue(evidence?.fitResult);
    const depositorySearch = recordValue(evidence?.depositorySearch);
    const ledgerSettlement = recordValue(evidence?.ledgerSettlement);
    const sourceSafePreview = recordValue(evidence?.sourceSafePreview);
    const assetPackPreviewBoundary = recordValue(evidence?.assetPackPreviewBoundary);
    const settlementBoundary = recordValue(evidence?.assetPackSettlementRightsDeliveryBoundary);
    const deliveryUnlock = recordValue(settlementBoundary?.deliveryUnlock) ||
      recordValue(evidence?.assetPackDeliveryUnlock);
    const paymentObservation = recordValue(settlementBoundary?.paymentObservation);
    const finalityReceipt = recordValue(settlementBoundary?.finalityReceipt);
    const reconciliationReport = recordValue(settlementBoundary?.reconciliationReport) ||
      recordValue(evidence?.assetPackLedgerDatabaseStorageReconciliation);
    const boundaryQuoteReceipt = recordValue(assetPackPreviewBoundary?.quoteReceipt);
    const boundarySelectedFitProvenance = recordValue(assetPackPreviewBoundary?.selectedFitProvenance);
    const boundarySettlementInstructions = recordValue(assetPackPreviewBoundary?.settlementInstructions);
    const boundaryDeliveryPosture = recordValue(assetPackPreviewBoundary?.deliveryPosture);
    const assetPackDisclosureReview = recordValue(evidence?.assetPackDisclosureReview);
    const feeQuote =
      boundaryQuoteReceipt ||
      recordValue(evidence?.assetPackQuoteReceipt) ||
      recordValue(sourceSafePreview?.feeQuote);
    const unlock = recordValue(sourceSafePreview?.unlock) || recordValue(ledgerSettlement?.protectedSourceUnlock);
    const disclosureAccess = recordValue(assetPackDisclosureReview?.access);
    const disclosureLeakage = recordValue(assetPackDisclosureReview?.sourceLeakage);
    const fitState = String(fitResult?.resultState || evidence?.resultState || 'unknown');
    const searchedAssetCount = depositorySearch?.searchedAssetCount;
    const ledgerStatus = ledgerSettlement?.status
      ? `ledger ${String(ledgerSettlement.status)}`
      : null;
    const selectedCandidateText = summarizeCandidateIds(
      boundarySelectedFitProvenance?.selectedCandidateAssetIds ||
        fitResult?.selectedCandidateAssetIds ||
        depositorySearch?.selectedCandidateAssetIds,
    );
    const telemetryLineCount = Number(data?.telemetryLineCount || 0);
    const telemetryText = telemetryLineCount > 0
      ? ` telemetry ${telemetryLineCount} lines`
      : ' telemetry artifact pending';
    const feeQuoteText = typeof feeQuote?.sats === 'number'
      ? ` fee ${feeQuote.sats} sats`
      : null;
    const quoteText = boundaryQuoteReceipt?.quoteRoot
      ? ` quote ${shortIdentifier(boundaryQuoteReceipt.quoteRoot)}`
      : null;
    const settlementText = boundarySettlementInstructions?.state
      ? ` settlement ${String(boundarySettlementInstructions.state)}`
      : null;
    const deliveryText = boundaryDeliveryPosture?.state
      ? ` delivery ${String(boundaryDeliveryPosture.state)}`
      : null;
    const settlementBoundaryText = settlementBoundary?.state
      ? ` settlement-boundary ${String(settlementBoundary.state)}`
      : null;
    const paymentText = typeof paymentObservation?.observedDebitSats === 'number' &&
      typeof paymentObservation?.expectedSats === 'number'
        ? ` paid ${paymentObservation.observedDebitSats}/${paymentObservation.expectedSats} sats`
        : null;
    const finalityText = finalityReceipt?.finalityState
      ? ` finality ${String(finalityReceipt.finalityState)}`
      : null;
    const rightsText = settlementBoundary?.rightsTransferRoot
      ? ` rights ${shortIdentifier(settlementBoundary.rightsTransferRoot)}`
      : null;
    const deliveredText = deliveryUnlock?.state
      ? ` delivery-unlock ${String(deliveryUnlock.state)}`
      : null;
    const reconciliationText = reconciliationReport?.state
      ? ` reconciliation ${String(reconciliationReport.state)}`
      : null;
    const unlockText = unlock?.sourceAvailable === true
      ? ` source ${String(unlock.state || 'available')}`
      : unlock?.state
        ? ` source ${String(unlock.state)}`
        : null;
    const disclosureText = disclosureAccess?.sourceVisibility
      ? ` disclosure ${String(disclosureAccess.sourceVisibility)}`
      : null;
    const leakageText = disclosureLeakage?.protectedSourceDetected === true
      ? ` leakage ${String(disclosureLeakage.findingCount || 'detected')}`
      : disclosureLeakage
        ? ' leakage none'
        : null;
    const searchText = typeof searchedAssetCount === 'number'
      ? ` searched ${searchedAssetCount} assets`
      : ' searched asset count unknown';
    return [
      `Host completed with outcome ${String(data?.outcome || 'unknown')}`,
      `fit ${fitState}`,
      searchText,
      selectedCandidateText,
      ledgerStatus,
      feeQuoteText,
      quoteText,
      settlementText,
      deliveryText,
      settlementBoundaryText,
      paymentText,
      finalityText,
      rightsText,
      deliveredText,
      reconciliationText,
      unlockText,
      disclosureText,
      leakageText,
      telemetryText,
    ].filter(Boolean).join('; ') + '.';
  }
  if (event.event === 'host-failed') {
    return `Host failed: ${String(data?.error || 'unknown error')}`;
  }
  if (event.event === 'host-event') {
    if (!data) return 'Host event: unknown.';
    const type = String(data?.type || 'event');
    const label = data?.label ? String(data.label) : '';
    if (type === 'command-started' && label) {
      return `Host command started: ${label}.`;
    }
    if (type === 'command-completed' && label) {
      return `Host command completed: ${label} exit ${String(data?.exitCode ?? 'unknown')}.`;
    }
    if (type === 'artifacts-read') {
      return 'Host artifacts read back from sandbox.';
    }
    if (type === 'sandbox-created') {
      return `Host sandbox created: ${String(data?.sandboxId || 'unknown sandbox')}.`;
    }
    if (type === 'telemetry-artifact-event') {
      return summarizeTelemetryArtifactEvent(data);
    }
    if (type === 'sandbox-stopped') {
      return 'Host sandbox stopped after artifact export.';
    }
    return `Host event: ${type}.`;
  }
  return `Host stream event: ${event.event}.`;
}

async function readHostRouteError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  } catch {
    // Fall through to text/status fallback.
  }

  try {
    const text = await response.text();
    if (text.trim()) return text.trim();
  } catch {
    // Fall through to status fallback.
  }

  return `Pipeline host request failed with HTTP ${response.status}.`;
}
