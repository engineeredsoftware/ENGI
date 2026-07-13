/**
 * Shared pure value helpers used by deposit-read evidence row builders.
 */
import {
  countList,
  numericValue,
  objectValue,
  shortIdentifier,
  stringList,
  terminalReadNeed,
  textValue,
  type TerminalReadNeedReviewRuntimeState,
  type TerminalReadNeedState,
} from './read-workbench-values';
import type {
  DepositReadCompletedEvidence,
  WorkbenchKeyValueRow,
} from './deposit-read-evidence-types';

import type { TerminalReadFitsFindingSynthesisHarnessEvent } from '@/components/bitcode/pipeline/PipelineHarnessClient/pipeline-harness-client';

export function buildReadNeedRows(currentReadNeed: TerminalReadNeedState | null): WorkbenchKeyValueRow[] {
  if (!currentReadNeed) return [];
  return [
    {
      label: 'Need id',
      value: shortIdentifier(currentReadNeed.needId) || currentReadNeed.needId || 'pending',
    },
    {
      label: 'Request id',
      value:
        shortIdentifier(currentReadNeed.request?.requestId) ||
        currentReadNeed.request?.requestId ||
        'pending',
    },
    {
      label: 'Measurement root',
      value:
        shortIdentifier(currentReadNeed.measurementRoot) ||
        currentReadNeed.measurementRoot ||
        'pending',
    },
    { label: 'Review state', value: currentReadNeed.reviewState || 'pending' },
    {
      label: 'Target kinds',
      value: stringList(currentReadNeed.targetArtifactKinds).join(', ') || 'pending',
    },
    {
      label: 'Closure criteria',
      value: String(stringList(currentReadNeed.closureCriteria).length),
    },
    {
      label: 'Weighted volume',
      value: String(currentReadNeed.pricingMeasurementInputs?.weightedRequestedVolume ?? 'pending'),
    },
    { label: 'Feedback turns', value: String(stringList(currentReadNeed.feedbackHistory).length) },
    {
      label: 'Previous Need',
      value:
        shortIdentifier(currentReadNeed.request?.previousNeedId) ||
        currentReadNeed.request?.previousNeedId ||
        'none',
    },
  ];
}

export function buildReadNeedRuntimeRows(params: {
  readNeedReviewRuntime: TerminalReadNeedReviewRuntimeState | null;
  readNeedTelemetry: Record<string, unknown> | null;
  readNeedStorageProjection: Array<Record<string, unknown>>;
}): WorkbenchKeyValueRow[] {
  const { readNeedReviewRuntime, readNeedTelemetry, readNeedStorageProjection } = params;
  if (!readNeedReviewRuntime && !readNeedTelemetry && readNeedStorageProjection.length === 0) {
    return [];
  }
  const admission = objectValue(readNeedReviewRuntime?.findingFitsAdmission);
  const proofRoots = objectValue(readNeedReviewRuntime?.proofRoots);
  return [
    {
      label: 'Runtime',
      value:
        shortIdentifier(readNeedReviewRuntime?.runtimeId) ||
        textValue(readNeedReviewRuntime?.runtimeId) ||
        'pending',
    },
    { label: 'Action', value: textValue(readNeedReviewRuntime?.action) || 'pending' },
    { label: 'Admission', value: admission?.admitted === true ? 'admitted' : 'blocked' },
    { label: 'Blockers', value: stringList(admission?.blockers).join(', ') || 'none' },
    {
      label: 'Storage records',
      value: String(readNeedStorageProjection.length || 'pending'),
    },
    { label: 'Runtime root', value: shortIdentifier(proofRoots?.runtimeRoot) || 'pending' },
    { label: 'Storage root', value: shortIdentifier(proofRoots?.storageRoot) || 'pending' },
    {
      label: 'Telemetry root',
      value: shortIdentifier(proofRoots?.telemetryRoot || readNeedTelemetry?.telemetryRoot) || 'pending',
    },
    {
      label: 'PTRR step',
      value:
        shortIdentifier(readNeedTelemetry?.ptrrStepId) ||
        textValue(readNeedTelemetry?.ptrrStepId) ||
        'pending',
    },
    { label: 'Return type', value: textValue(readNeedTelemetry?.returnType) || 'pending' },
  ];
}

export function buildHarnessIdentifierRows(params: {
  harnessRequestState: {
    ready: boolean;
    request?: {
      readId?: string;
      acceptedReadNeed?: unknown;
      depositId?: string;
      sourceCommit?: string;
    } | null;
  };
  acceptedReadNeed: TerminalReadNeedState | null;
  harnessEvents: TerminalReadFitsFindingSynthesisHarnessEvent[];
}): WorkbenchKeyValueRow[] {
  const { harnessRequestState, acceptedReadNeed, harnessEvents } = params;
  const rows: WorkbenchKeyValueRow[] = [];
  const request = harnessRequestState.request;
  if (harnessRequestState.ready && request) {
    rows.push(
      {
        label: 'read',
        value: shortIdentifier(request.readId) || 'pending',
      },
      {
        label: 'need',
        value: shortIdentifier(terminalReadNeed(request.acceptedReadNeed)?.needId) || 'pending',
      },
      {
        label: 'deposit',
        value: shortIdentifier(request.depositId) || 'pending',
      },
      {
        label: 'commit',
        value: shortIdentifier(request.sourceCommit) || 'pending',
      },
    );
  } else if (acceptedReadNeed?.needId) {
    rows.push({
      label: 'need',
      value: shortIdentifier(acceptedReadNeed.needId) || acceptedReadNeed.needId,
    });
  }

  let sandboxId: string | null = null;
  let runId: string | null = null;
  let pipelineRunId: string | null = null;
  let lastTelemetryLine: string | null = null;
  let inferenceProfile: string | null = null;
  let inferenceGate: string | null = null;
  let runtimeBudget: string | null = null;
  let supabaseHost: string | null = null;

  for (const event of harnessEvents) {
    const data = objectValue(event.data);
    if (!data) continue;
    runId = textValue(data.runId) || runId;
    sandboxId = textValue(data.sandboxId) || sandboxId;
    inferenceProfile = textValue(data.realInferenceProfile) || inferenceProfile;
    inferenceGate =
      typeof data.realInferenceRequired === 'boolean'
        ? data.realInferenceRequired
          ? 'required'
          : 'local optional'
        : inferenceGate;
    runtimeBudget =
      typeof data.runtimeBudgetMs === 'number' && Number.isFinite(data.runtimeBudgetMs)
        ? `${data.runtimeBudgetMs}ms`
        : runtimeBudget;
    supabaseHost = textValue(data.supabaseHost) || supabaseHost;
    if (event.event === 'harness-event') {
      sandboxId = textValue(data.sandboxId) || sandboxId;
      const telemetryEvent = objectValue(data.telemetryEvent);
      runId = textValue(telemetryEvent?.runId) || runId;
      pipelineRunId = textValue(telemetryEvent?.pipelineRunId) || pipelineRunId;
      lastTelemetryLine =
        data.type === 'telemetry-artifact-event' ? String(data.lineNumber || '') : lastTelemetryLine;
    }
  }

  if (sandboxId) rows.push({ label: 'sandbox', value: shortIdentifier(sandboxId) || sandboxId });
  if (runId) rows.push({ label: 'run', value: shortIdentifier(runId) || runId });
  if (pipelineRunId) {
    rows.push({ label: 'pipeline row', value: shortIdentifier(pipelineRunId) || pipelineRunId });
  }
  if (inferenceGate) rows.push({ label: 'inference gate', value: inferenceGate });
  if (inferenceProfile) rows.push({ label: 'profile', value: inferenceProfile });
  if (runtimeBudget) rows.push({ label: 'budget', value: runtimeBudget });
  if (supabaseHost) rows.push({ label: 'database', value: supabaseHost });
  if (lastTelemetryLine) rows.push({ label: 'telemetry line', value: lastTelemetryLine });
  return rows;
}

