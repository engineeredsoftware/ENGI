import type { LogLine } from './pipeline-execution-log-render-line';
/**
 * Pure copy/distillation helpers for PipelineExecutionLog.
 * Kept free of React so unit tests can cover log copy without mounting the log UI.
 */

import { describeExecutionContext } from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';
import { extractExecutionState } from './pipeline-execution-log-state';

const TERSE_STRING_LIMIT = 200;
const TERSE_ERROR_STRING_LIMIT = 2000;
const TERSE_ERROR_KEY = /error|message|stack/i;

const LIKELY_STALL_SECONDS = 180;


export function buildRawLogCopyText(args: {
  copyData?: unknown;
  output?: string;
  outputDetails?: Record<string, any>;
  error?: string | null;
}): string {
  const { copyData, output, outputDetails, error } = args;
  if (copyData !== undefined) {
    return typeof copyData === 'string' ? copyData : JSON.stringify(copyData, null, 2);
  }
  return [
    output || '',
    outputDetails && Object.keys(outputDetails).length
      ? `\n\n=== details ===\n${JSON.stringify(outputDetails, null, 2)}`
      : '',
    error ? `\n\n=== error ===\n${error}` : '',
  ].join('');
}


export function distillTerseValue(value: unknown, keyHint?: string): unknown {
  if (typeof value === 'string') {
    const limit = keyHint && TERSE_ERROR_KEY.test(keyHint) ? TERSE_ERROR_STRING_LIMIT : TERSE_STRING_LIMIT;
    return value.length > limit ? `${value.slice(0, limit)}… [+${value.length - limit} chars]` : value;
  }
  if (Array.isArray(value)) return value.map((item) => distillTerseValue(item, keyHint));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = distillTerseValue(entry, key);
    }
    return out;
  }
  return value;
}


export function compactTerseEvent(entry: unknown): Record<string, unknown> {
  const record = entry && typeof entry === 'object' ? (entry as Record<string, any>) : null;
  const payload = record && 'event' in record ? record.event : entry;
  const compact: Record<string, unknown> = {};
  if (record?.created_at) compact.created_at = record.created_at;
  if (!payload || typeof payload !== 'object') {
    if (payload !== undefined && payload !== null) compact.value = distillTerseValue(payload);
    return compact;
  }
  if (payload.type) compact.type = payload.type;
  // Store identity: names WHAT was stored — tiny and load-bearing for ordering
  // forensics (which agent/step/failsafe emitted what, in what sequence).
  if (payload.namespace) compact.namespace = payload.namespace;
  if (payload.key) compact.key = payload.key;
  const executionState = extractExecutionState(payload) || {};
  const CHAIN_FIELDS = [
    'pipeline',
    'phase',
    'agent',
    'step',
    'failsafe',
    'generation',
    'tool',
    'ptrrStepName',
    'promptTemplateId',
    'outputSchema',
    'returnType',
  ] as const;
  for (const field of CHAIN_FIELDS) {
    const value = executionState[field];
    if (value !== undefined && value !== null && value !== '') compact[field] = value;
  }
  if (typeof executionState.stitchIteration === 'number') compact.stitchIteration = executionState.stitchIteration;
  if (typeof executionState.chunkIndex === 'number') compact.chunkIndex = executionState.chunkIndex;
  if (executionState.chunkSum === true) compact.chunkSum = true;
  const status = payload.status || {};
  // The source-safe stream projection carries its metadata under `data`
  // (provider/model/tool/phase/agent/step/generation, plus contentChars for
  // withheld bodies); `llm:usage` store events carry the usage object AS data.
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  for (const field of ['phase', 'agent', 'step', 'generation', 'tool'] as const) {
    if (compact[field] === undefined && data[field] !== undefined && data[field] !== null && data[field] !== '') {
      compact[field] = data[field];
    }
  }
  const provider = payload.provider ?? status.provider ?? data.provider ?? executionState.provider;
  const model = payload.model ?? status.model ?? data.model ?? executionState.model;
  const usage =
    payload.usage ??
    status.usage ??
    (payload.namespace === 'llm' && payload.key === 'usage' ? payload.data : undefined) ??
    executionState.usage;
  if (provider) compact.provider = provider;
  if (model) compact.model = model;
  if (usage !== undefined && usage !== null) compact.usage = distillTerseValue(usage);
  if (typeof data.contentChars === 'number') compact.contentChars = data.contentChars;
  if (typeof data.ok === 'boolean') compact.ok = data.ok;
  const message = payload.message ?? status.message ?? payload.text;
  // 'message' keyHint: event messages carry stall/failure text, so they get
  // the larger error budget the __terse note promises for message fields.
  if (typeof message === 'string' && message) compact.message = distillTerseValue(message, 'message');
  const errorBody = payload.error ?? status.error;
  if (errorBody !== undefined && errorBody !== null) compact.error = distillTerseValue(errorBody, 'error');
  return compact;
}


export function buildTerseLogCopyText(args: {
  copyData?: unknown;
  output?: string;
  outputDetails?: Record<string, any>;
  error?: string | null;
}): string {
  const { copyData, output, outputDetails, error } = args;
  const note =
    `Terse copy: run events are compacted to timestamp/type/call-chain/usage/error rows and long strings ` +
    `are truncated to a preview + '… [+N chars]' (error/message/stack fields keep up to ` +
    `${TERSE_ERROR_STRING_LIMIT} chars); ordering and counts are complete. Use 'Copy raw logs' for full bodies.`;
  if (
    copyData !== undefined &&
    copyData &&
    typeof copyData === 'object' &&
    !Array.isArray(copyData) &&
    Array.isArray((copyData as Record<string, any>).events)
  ) {
    const { events, outputDetails: duplicatedDetails, ...header } = copyData as Record<string, any>;
    void duplicatedDetails;
    const wrapped = {
      __terse: note,
      ...(distillTerseValue(header) as Record<string, unknown>),
      outputDetails: '[omitted — duplicates the events; use Copy raw logs for full bodies]',
      eventCount: events.length,
      firstEventAt: events[0]?.created_at ?? null,
      lastEventAt: events[events.length - 1]?.created_at ?? null,
      events: events.map(compactTerseEvent),
    };
    return JSON.stringify(wrapped, null, 2);
  }
  const source =
    copyData !== undefined
      ? copyData
      : { output: output || '', outputDetails: outputDetails ?? {}, error: error ?? null };
  const distilled = distillTerseValue(typeof source === 'string' ? { output: source } : source);
  const wrapped =
    distilled && typeof distilled === 'object' && !Array.isArray(distilled)
      ? { __terse: note, ...(distilled as Record<string, unknown>) }
      : { __terse: note, data: distilled };
  return JSON.stringify(wrapped, null, 2);
}


export function buildProcessingStallLabel(
  lastLine: Partial<Pick<LogLine, 'phase' | 'agent' | 'step' | 'failsafe' | 'generation' | 'timestamp' | 'pipelineMode'>> | undefined,
  nowMs: number,
  pipelineMode?: string | null,
): { label: string; likelyStalled: boolean } {
  if (!lastLine?.timestamp) return { label: 'Processing', likelyStalled: false };
  const lastMs = new Date(lastLine.timestamp).getTime();
  if (!Number.isFinite(lastMs)) return { label: 'Processing', likelyStalled: false };

  const elapsedSeconds = Math.max(0, Math.round((nowMs - lastMs) / 1000));
  const sentence = describeExecutionContext({ ...lastLine, mode: pipelineMode ?? lastLine.pipelineMode ?? null });
  const likelyStalled = elapsedSeconds >= LIKELY_STALL_SECONDS;
  const label = sentence
    ? `${sentence} · ${elapsedSeconds}s since last update`
    : `Processing · ${elapsedSeconds}s since last update`;
  return { label, likelyStalled };
}

