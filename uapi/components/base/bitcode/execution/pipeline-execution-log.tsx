/* eslint-disable react/no-multi-comp */
"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef } from 'react';
import { ContentVisibility } from '@/components/base/bitcode/perf/ContentVisibility';
import { ProcessingIndicator } from '@/components/base/bitcode/indicators/ProcessingIndicator';
import {
  CheckCircledIcon,
  CheckIcon,
  ClipboardCopyIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ChevronRightIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import FileDiffViewer from './FileDiffViewer';
import type { FileDiff, FileTreeChange } from '@bitcode/streams';

// ---------------------------------------------------------------------------
// Custom Bitcode log icons
// ---------------------------------------------------------------------------

// 1. Robot (AI) – friendly minimal droid head
const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="7" width="14" height="10" rx="2" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <line x1="12" y1="4" x2="12" y2="7" />
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
    <path d="M9 16h6" />
  </svg>
);

// 2. Wrench (Tool-Use) – sleek spanner
const WrenchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 7a5 5 0 0 1-6.8 4.7L7.7 19.2a2.8 2.8 0 0 1-4 0 2.8 2.8 0 0 1 0-4l7.5-7.5A5 5 0 0 1 15 2a5 5 0 0 1 5 5z" />
    <circle cx="9" cy="15" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

// 3. Thought bubble (Thinking) – airy cloud + dots
const ThoughtBubbleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6 10a6 6 0 0 1 11.3-2.8A5 5 0 0 1 18 18H7a4 4 0 0 1-1-7.9 6.1 6.1 0 0 1 0-.1z" />
    <circle cx="5" cy="19" r="1.2" />
    <circle cx="3.5" cy="21" r="0.8" />
  </svg>
);


// ---------------------------------------------------------------------------
// Helper — format ISO timestamp into HH:MM 24-hour (no seconds) for compact rows
// ---------------------------------------------------------------------------

function formatTime(ts?: string) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

import { PathPill } from './PathPill';
import { ExecutionContextPillRow, buildFailsafePillLabel } from './ExecutionContextPillRow';
import { TelemetryExplainerTrigger } from './TelemetryExplainerTrigger';
import { getTelemetryPillExplainer, getTelemetryRowIconExplainer } from './telemetry-pill-explainers';
import {
  SDIVF_PHASES,
  describeExecutionContext,
  normalizePhaseName,
  normalizeStepName,
  type SynthesisPipelineMode,
} from './execution-telemetry-format';
import { buildStepViewModel } from '@/app/executions/utilities/execution-step-viewmodel';

// ---------------------------------------------------------------------------
// NOTE: This component originally grouped log entries by Phase / Iteration.
// The backend now streams already–normalized `StreamMessage` objects where
// every chunk is a *single* "line".  UIs should therefore treat each message
// independently and display an accordion per-line – no phase grouping.
// ---------------------------------------------------------------------------

// Phases are still useful when we want to infer metadata, however the UI no
// longer surfaces them as first-class sections.  Keep the canonical list for
// lightweight inference / tagging only.
const PHASES = SDIVF_PHASES;

interface PipelineRunLogProps {
  output: string;
  isProcessing: boolean;
  error: string | null;
  outputDetails?: Record<string, any>;
  onRetry: () => void;
  onDismissError: () => void;
  userHasScrolled: boolean;
  setUserHasScrolled: (value: boolean) => void;
  /** Force compact styling regardless of viewport width */
  compact?: boolean;
  /**
   * The full run payload the "Copy raw logs" button copies (all streamed logs, all
   * inputs, etc. — source-safe). When a string it is copied verbatim; otherwise it is
   * JSON-stringified. When omitted, the button falls back to the rendered output +
   * outputDetails + error.
   */
  copyData?: unknown;
  /**
   * The synthesis pipeline mode when the page knows it ('/deposits' passes
   * 'deposit'). Prefixes the processing sentence with 'While Depositing, …' /
   * 'While Reading, …'. When omitted, falls back to the mode latched from the
   * stream (stamped onto rows by the activity builder); when neither is known
   * the sentence renders without the prefix.
   */
  pipelineMode?: SynthesisPipelineMode | null;
  /**
   * The CURRENT live call chain (the same rolling context the page's header
   * tracker renders). Rows only appear for COMPLETED LLM/tool calls, so before
   * the first row lands the processing indicator would otherwise read a bare
   * 'Processing' while the header already shows Phase→Agent→Step pills — this
   * keeps the two surfaces telling one story.
   */
  liveContext?: {
    phase: string | null;
    agent: string | null;
    step: string | null;
    failsafe: string | null;
    generation: string | null;
  } | null;
}

// Threshold (in px) below which we switch to compact layout automatically.
const COMPACT_WIDTH_THRESHOLD = 420;

interface LogLine {
  text: string;
  phase?: string;
  pipeline?: string;
  phaseId?: string;
  agent?: string;
  agentId?: string;
  step?: string;
  ptrrStepId?: string;
  ptrrStepName?: string;
  failsafe?: string;
  generation?: string;
  // Failsafe-repair markers: a stitch-repair generation (iteration N), a chunk
  // task generation (index within the chunked run), or the chunk summing
  // generation. Rendered on the failsafe pill so a real failsafe-handling
  // case (>0 stitches, >1 chunks) is visible per row.
  stitchIteration?: number;
  chunkIndex?: number;
  chunkSum?: boolean;
  // Pipeline mode ('deposit' | 'read') latched from the stream by the activity
  // builder — the processing indicator's 'While Depositing, …' prefix fallback.
  pipelineMode?: string;
  tool?: any;
  promptTemplateId?: string;
  outputSchema?: string;
  returnType?: string;
  eventId?: string;
  proofRoot?: string;
  redactionPosture?: string;
  promptDisclosurePosture?: string;
  resultDisclosurePosture?: string;
  failClosedState?: string;
  iteration?: number;
  timestamp?: string;
  details?: any;
  isError?: boolean;
  isSuccess?: boolean;
  isInfo?: boolean;
  isComplete?: boolean;

  // Canonical stream `type` – e.g. 'generation', 'tool-use', 'thinking', 'error', 'completion'
  type?: string;
}

function extractExecutionState(storedChunk: any) {
  return storedChunk?.status?.executionState ||
    storedChunk?.status?.metadata?.executionState ||
    storedChunk?.executionState ||
    storedChunk?.telemetry?.executionState ||
    storedChunk?.status?.telemetry?.executionState ||
    storedChunk?.operatorReadback?.executionState ||
    null;
}

function applyExecutionStateToLogLine(logLine: LogLine, executionState: any, storedChunk: any) {
  const {
    phase,
    agent,
    step,
    tool,
    failsafe,
    generation,
    pipeline,
    phaseId,
    agentId,
    ptrrStepId,
    ptrrStepName,
    promptTemplateId,
    outputSchema,
    returnType,
    eventId,
    proofRoot,
    redactionPosture,
    promptDisclosurePosture,
    resultDisclosurePosture,
    failClosedState,
  } = executionState || {};
  logLine.phase = normalizePhaseName(phase);
  logLine.pipeline = pipeline;
  if (typeof (executionState || {}).pipelineMode === 'string') logLine.pipelineMode = executionState.pipelineMode;
  logLine.phaseId = phaseId;
  logLine.agent = agent;
  logLine.agentId = agentId;
  logLine.step = normalizeStepName(step);
  logLine.ptrrStepId = ptrrStepId;
  logLine.ptrrStepName = ptrrStepName;
  logLine.failsafe = failsafe;
  logLine.generation = generation;
  if (typeof (executionState || {}).stitchIteration === 'number') logLine.stitchIteration = executionState.stitchIteration;
  if (typeof (executionState || {}).chunkIndex === 'number') logLine.chunkIndex = executionState.chunkIndex;
  if ((executionState || {}).chunkSum === true) logLine.chunkSum = true;
  // DIV-loop iteration (1-based, latched from pipeline/currentIteration by the
  // activity builder) — rendered as the row's 'iter N' marker.
  if (typeof (executionState || {}).iteration === 'number') logLine.iteration = executionState.iteration;
  logLine.tool = tool;
  logLine.promptTemplateId = promptTemplateId;
  logLine.outputSchema = outputSchema;
  logLine.returnType = returnType;
  logLine.eventId = eventId;
  logLine.proofRoot = proofRoot;
  logLine.redactionPosture = redactionPosture;
  logLine.promptDisclosurePosture = promptDisclosurePosture;
  logLine.resultDisclosurePosture = resultDisclosurePosture;
  logLine.failClosedState = failClosedState;

  logLine.details = {
    ...storedChunk,
    status: {
      ...(storedChunk?.status || {}),
      executionState,
      metadata: {
        ...(storedChunk?.metadata || {}),
        ...(storedChunk?.status?.metadata || {}),
      },
    },
    pipeline,
    phaseId,
    agentId,
    step: normalizeStepName(step),
    ptrrStepId,
    ptrrStepName,
    failsafe,
    generation,
    tool,
    promptTemplateId,
    outputSchema,
    returnType,
    eventId,
    proofRoot,
    redactionPosture,
    promptDisclosurePosture,
    resultDisclosurePosture,
    failClosedState,
  };
}

// ---------------------------------------------------------------------------
// Visual style mapping per canonical stream `type`
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<
  string,
  {
    bg: string; // background utility classes
    text: string; // text colour classes
    border: string; // left border colour
    Icon: React.ComponentType<any>;
    glow?: boolean;
  }
> = {
  thinking: {
    bg: 'bg-gradient-to-r from-gray-700/25 to-gray-700/10',
    text: 'text-gray-300',
    border: 'border-gray-500/25',
    Icon: ThoughtBubbleIcon,
  },
  'generation': {
    bg: 'bg-gradient-to-r from-emerald-700/25 to-emerald-700/10',
    text: 'text-emerald-200',
    border: 'border-emerald-400/25',
    Icon: RobotIcon,
  },
  'tool-use': {
    bg: 'bg-gradient-to-r from-purple-700/25 to-purple-700/10',
    text: 'text-purple-200',
    border: 'border-purple-400/25',
    Icon: WrenchIcon,
  },
  'reading-telemetry': {
    bg: 'bg-gradient-to-r from-sky-700/20 to-emerald-700/10',
    text: 'text-sky-200',
    border: 'border-sky-400/25',
    Icon: InfoCircledIcon,
  },
  'operator-readback': {
    bg: 'bg-gradient-to-r from-emerald-700/20 to-sky-700/10',
    text: 'text-emerald-200',
    border: 'border-emerald-400/25',
    Icon: CheckCircledIcon,
  },
  repair: {
    bg: 'bg-gradient-to-r from-amber-700/20 to-red-700/10',
    text: 'text-amber-200',
    border: 'border-amber-400/25',
    Icon: ExclamationTriangleIcon,
  },
  completion: {
    bg: 'bg-gradient-to-r from-emerald-700/15 to-emerald-700/5',
    text: 'text-emerald-200',
    border: 'border-emerald-400/20',
    Icon: CheckCircledIcon,
  },
  error: {
    bg: 'bg-gradient-to-r from-red-700/15 to-red-700/5',
    text: 'text-red-200',
    border: 'border-red-400/20',
    Icon: ExclamationTriangleIcon,
  },
  'file-diff': {
    bg: 'bg-gradient-to-r from-indigo-700/25 to-indigo-700/10',
    text: 'text-indigo-200',
    border: 'border-indigo-400/25',
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
};

interface PhaseGroup {
  phase: string;
  lines: LogLine[];
  iterations: Map<number, LogLine[]>;
}

/**
 * Build the text the "Copy raw logs" button copies: the full run payload (`copyData`
 * — all streamed logs + inputs, source-safe) verbatim/JSON, or a fallback of the
 * rendered output + details + error. Pure + exported for unit testing.
 */
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

// "Copy terse logs" string budgets: ordinary string fields truncate to
// TERSE_STRING_LIMIT; fields whose key looks error-ish (error/message/stack)
// keep TERSE_ERROR_STRING_LIMIT so failure forensics survive the distillation.
const TERSE_STRING_LIMIT = 200;
const TERSE_ERROR_STRING_LIMIT = 2000;
const TERSE_ERROR_KEY = /error|message|stack/i;

/**
 * Recursively distill a copy payload for the "Copy terse logs" button: every
 * string over its budget is truncated to a preview + '… [+N chars]' marker,
 * while structure, ordering, counts, numbers, and short fields (the run's
 * phase/agent/step/failsafe hierarchy, statuses, usage, timestamps) survive
 * whole. Pure + exported for unit testing.
 */
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

/**
 * Compact one streamed run event ({id, created_at, event} or a bare payload)
 * into a terse row: timestamp, canonical type, store identity (namespace/key),
 * the full Phase→Agent→Step→Failsafe→Generation call chain + repair markers,
 * provider/model/usage, a bounded message preview, and (near-)complete error
 * bodies. Everything else — the raw stored values, executionState duplicates,
 * metadata snapshots — is the payload bulk and is dropped.
 */
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

/**
 * Build the text the "Copy terse logs" button copies: the same run payload as
 * "Copy raw logs", distilled to a much smaller but still debugging-useful
 * form. When `copyData` carries an `events` array (the /deposits shape), every
 * event compacts to its terse row (`compactTerseEvent`) and the
 * `outputDetails` duplication is omitted; other payload fields keep their
 * structure with long strings truncated (`distillTerseValue`) — error bodies
 * keep a much larger budget. Pure + exported for unit testing.
 */
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

// Matches the default BITCODE_LLM_CALL_TIMEOUT_MS (AgentLLMsRegistry /
// PipelineLLMRegistry) — past this many seconds with no new row, an in-flight
// LLM call should already have timed out server-side, so continued silence is
// a genuine-hang signal rather than a merely slow generation.
const LIKELY_STALL_SECONDS = 90;

/**
 * Build the live "While {Depositing|Reading}, during {Phase}, {Agent} Agent is
 * {Step}... · Ns since last update" label for the processing indicator, from
 * the last known log line + the current tick. Pure + exported for unit
 * testing. Returns the bare fallback label when there is no prior line yet
 * (nothing streamed since the run started) or not enough context to describe.
 * The pipeline prefix uses the explicit `pipelineMode` when the page passed
 * one, else the mode latched from the stream onto the last line, else none.
 */
export function buildProcessingStallLabel(
  lastLine: Pick<LogLine, 'phase' | 'agent' | 'step' | 'failsafe' | 'generation' | 'timestamp' | 'pipelineMode'> | undefined,
  nowMs: number,
  pipelineMode?: SynthesisPipelineMode | null,
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

/**
 * Copy text to the clipboard, returning whether it succeeded. Tries the modern
 * `navigator.clipboard` (requires a secure context) and, when that is unavailable or
 * fails (e.g. `/deposits` loaded over plain http on a LAN IP), falls back to a hidden
 * textarea + `document.execCommand('copy')`. Pure + exported for unit testing.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export const PipelineExecutionLog = forwardRef<HTMLDivElement, PipelineRunLogProps>(({
  output,
  isProcessing,
  error,
  outputDetails = {},
  onRetry,
  onDismissError,
  userHasScrolled,
  setUserHasScrolled,
  compact: compactProp,
  copyData,
  pipelineMode,
  liveContext
}, ref) => {
  // Automatic compact detection via container width
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoCompact, setAutoCompact] = useState(false);

  // Live "stalled since" signal (QA debug aid, V48 Gate 3): while processing, tick
  // once a second so the processing indicator can show elapsed time since the
  // last streamed event. This does NOT add a new formal log-line kind (F19's
  // "exactly LLM calls + Tool uses" contract is unchanged) — it only makes an
  // in-flight call's silence visible in real time, so a genuine hang (e.g. past
  // BITCODE_LLM_CALL_TIMEOUT_MS with no new row) is distinguishable from a slow
  // but progressing run instead of an unexplained blank gap.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isProcessing]);

  // "Copy raw logs": copy this run's full information (all streamed logs + inputs).
  const [copiedRaw, setCopiedRaw] = useState(false);
  const handleCopyRaw = async () => {
    const ok = await copyTextToClipboard(
      buildRawLogCopyText({ copyData, output, outputDetails, error }),
    );
    if (ok) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 1500);
    }
  };

  // "Copy terse logs": the same run payload distilled — long strings truncated,
  // hierarchy/ordering/errors kept — for a much smaller but still useful copy.
  const [copiedTerse, setCopiedTerse] = useState(false);
  const handleCopyTerse = async () => {
    const ok = await copyTextToClipboard(
      buildTerseLogCopyText({ copyData, output, outputDetails, error }),
    );
    if (ok) {
      setCopiedTerse(true);
      setTimeout(() => setCopiedTerse(false), 1500);
    }
  };

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    if (!containerRef.current) return;
    const el = containerRef.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldCompact = width <= COMPACT_WIDTH_THRESHOLD;
        setAutoCompact((prev) => (prev !== shouldCompact ? shouldCompact : prev));
      }
    });
    observer.observe(el);
    // Initial measurement
    setAutoCompact(el.offsetWidth <= COMPACT_WIDTH_THRESHOLD);

    return () => observer.disconnect();
  }, []);

  const compact = compactProp ?? autoCompact;
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [expandedIterations, setExpandedIterations] = useState<Record<string, boolean>>({});
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});
  const [processedLogs, setProcessedLogs] = useState<PhaseGroup[]>([]);
  const [flatLines, setFlatLines] = useState<LogLine[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // -------------------------------------------------------------------
  // Keyboard navigation helpers
  // -------------------------------------------------------------------

  const focusRow = (index: number) => {
    setFocusedIndex(index);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLDivElement>(`[data-log-index='${index}']`);
      el?.focus();
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = e;
    if (!flatLines.length) return;

    if (key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min((focusedIndex >= 0 ? focusedIndex + 1 : 0), flatLines.length - 1);
      focusRow(next);
    }
    else if (key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusedIndex > 0 ? focusedIndex - 1 : 0;
      focusRow(prev);
    }
    else if (key === 'ArrowRight') {
      if (focusedIndex >= 0) {
        const id = `line-${focusedIndex}`;
        setExpandedLines(prev => ({ ...prev, [id]: true }));
      }
    }
    else if (key === 'ArrowLeft') {
      if (focusedIndex >= 0) {
        const id = `line-${focusedIndex}`;
        setExpandedLines(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // Process and organize log lines
  useEffect(() => {
    if (!output) return;

    const lines = output.split('\n').filter(line => line.trim());

    const flat: LogLine[] = [];

    // Prepare phase groups for internal analytics; the visible view uses flat logs.
    const phaseGroups = new Map<string, PhaseGroup>();
    PHASES.forEach(phase => {
      phaseGroups.set(phase, { phase, lines: [], iterations: new Map() });
    });

    // Process each line
    lines.forEach(line => {
      // A row key may carry a unique suffix after a null separator (so distinct
      // LLM/tool calls with identical withheld text never collapse under the
      // text-keyed de-dup). Display only the text before the separator; look up
      // details by the full key.
      const sepIdx = line.indexOf('\u0000');
      const displayText = sepIdx >= 0 ? line.slice(0, sepIdx) : line;
      const logLine: LogLine & { type?: string } = { text: displayText } as any;
      const storedChunk =
        outputDetails?.[line] ?? outputDetails?.[line.trim()] ?? outputDetails?.[displayText.trim()];

      // Preserve canonical stream message `type` if available for colour-coding
      if (storedChunk?.type) {
        logLine.type = storedChunk.type;
      } else if (storedChunk?.schema === 'bitcode.reading.operational-operator-readback') {
        logLine.type = 'operator-readback';
      } else if (storedChunk?.eventKind === 'repair') {
        logLine.type = 'repair';
      } else if (storedChunk?.schema === 'bitcode.reading.operational-telemetry-event' || storedChunk?.eventKind) {
        logLine.type = 'reading-telemetry';
      } else {
        // Heuristic fallback when mock data lacks explicit type
        const lower = displayText.toLowerCase();
        if (lower.includes('thinking')) logLine.type = 'thinking';
        else if (lower.includes('tool')) logLine.type = 'tool-use';
        else if (lower.includes('ai call') || lower.includes('(ai') || lower.includes('generation')) logLine.type = 'generation';
        else if (lower.includes('error')) logLine.type = 'error';
        else if (lower.includes('complete') || lower.includes('finalizing')) logLine.type = 'completion';
        else logLine.type = undefined;
      }
      
      // Handle 'thinking' stream events with dedicated executionState
      if (storedChunk?.type === 'thinking') {
        const { executionState, message, detail, timestamp } = storedChunk;
        logLine.text = message;
        if (executionState) {
          logLine.phase = normalizePhaseName(executionState.phase);
          logLine.agent = executionState.agent;
          logLine.step = normalizeStepName(executionState.step);
          logLine.failsafe = executionState.failsafe;
          logLine.generation = executionState.generation;
          if (typeof executionState.pipelineMode === 'string') logLine.pipelineMode = executionState.pipelineMode;
        }
        logLine.details = storedChunk;
        logLine.timestamp = timestamp;
      }
      // Extract phase, agent, iteration from stored chunk
      else if (storedChunk) {
        const executionState = extractExecutionState(storedChunk);
        if (executionState) {
          applyExecutionStateToLogLine(logLine, executionState, storedChunk);
        }
        // If step is available directly in status
        else if (storedChunk.status?.step) {
          logLine.step = normalizeStepName(storedChunk.status.step);
        }

        // Try to extract iteration from the line or metadata
        const iterationMatch = displayText.match(/iteration[:\s]*(\d+)/i);
        if (iterationMatch) {
          logLine.iteration = parseInt(iterationMatch[1], 10);
        } else if (storedChunk.status?.metadata?.iteration) {
          logLine.iteration = storedChunk.status.metadata.iteration;
        }

        // Store details for expansion
        if (!logLine.details) logLine.details = storedChunk;

        // Extract timestamp if available
        logLine.timestamp = storedChunk.status?.timestamp || storedChunk.timestamp;

        // Use detail field if available for better context
        if (storedChunk.status?.detail) {
          logLine.details.detail = storedChunk.status.detail;
        }
      }

      // Clean up the log line text - remove any timestamp suffixes
      const textParts = displayText.split('_');
      if (textParts.length > 1 && /^\d+$/.test(textParts[textParts.length - 1])) {
        // Remove timestamp suffix
        logLine.text = textParts.slice(0, -1).join('_');
      }

      // Determine line type
      logLine.isError = displayText.toLowerCase().includes('error') ||
        (storedChunk?.status?.progress === 'error') ||
        storedChunk?.progress === 'blocked' ||
        storedChunk?.progress === 'repair-required';
      logLine.isSuccess = displayText.toLowerCase().includes('success') ||
        displayText.toLowerCase().includes('completed') ||
        (storedChunk?.status?.progress === 'success') ||
        storedChunk?.progress === 'completed';
      logLine.isInfo = displayText.toLowerCase().includes('info') ||
        displayText.toLowerCase().includes('processing') ||
        (storedChunk?.status?.progress === 'in-progress') ||
        storedChunk?.progress === 'running' ||
        storedChunk?.progress === 'planned';
      logLine.isComplete = displayText.toLowerCase().includes('complete') ||
        displayText.toLowerCase().includes('completed') ||
        (storedChunk?.status?.progress === 'success');

      // If phase is not specified, try to infer from the line text or stored chunk
      if (!logLine.phase) {
        // First try to get from stored chunk
        const executionState = extractExecutionState(storedChunk);
        if (executionState?.phase) {
          logLine.phase = normalizePhaseName(executionState.phase);
        } else {
          // Then try to infer from text
          for (const phase of PHASES) {
            if (displayText.includes(phase)) {
              logLine.phase = phase;
              break;
            }
          }
        }
      }

      // Default to "Setup" if no phase is detected
      const phase = normalizePhaseName(logLine.phase) || 'Setup';

      // Add to the appropriate phase group
      const phaseGroup = phaseGroups.get(phase);
      if (phaseGroup) {
        // Uniquely-keyed rows (separator-suffixed by the activity builder) are
        // distinct formal log lines — distinct LLM/tool calls can share withheld
        // text, so they must never be de-duped. Only legacy text-only lines fall
        // through to message de-dup.
        const isDuplicate = sepIdx < 0 && phaseGroup.lines.some(existingLine => {
          return existingLine.text === logLine.text &&
            existingLine.agent === logLine.agent &&
            existingLine.step === logLine.step &&
            existingLine.phase === logLine.phase;
        });

        if (!isDuplicate) {
          phaseGroup.lines.push(logLine);
          flat.push(logLine);

          // Add to iteration group if applicable
          if (logLine.iteration !== undefined) {
            if (!phaseGroup.iterations.has(logLine.iteration)) {
              phaseGroup.iterations.set(logLine.iteration, []);
            }
            phaseGroup.iterations.get(logLine.iteration)?.push(logLine);
          }
        }
      }
    });

    // Convert to array and sort by phase order
    const sortedPhaseGroups = Array.from(phaseGroups.values())
      .filter(group => group.lines.length > 0)
      .sort((a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase));

    // Sort lines within each phase by timestamp if available
    sortedPhaseGroups.forEach(group => {
      group.lines.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return 0;
      });

      // Also sort iteration lines
      group.iterations.forEach((lines, iteration) => {
        lines.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          }
          return 0;
        });
      });
    });

    setProcessedLogs(sortedPhaseGroups);

    // Sort flat list by timestamp if available, otherwise keep original order
    const sortedFlat = [...flat].sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });
    setFlatLines(sortedFlat);
  }, [output, outputDetails]);

  // Handle scroll events. A modest "near bottom" band (not exact-pixel) means
  // momentum/rounding still counts as following, while a deliberate scroll up to
  // read an earlier line or an open accordion stops the auto-follow; returning to
  // the bottom resumes it.
  const BOTTOM_FOLLOW_THRESHOLD_PX = 48;
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.clientHeight - target.scrollTop;

    if (distanceFromBottom > BOTTOM_FOLLOW_THRESHOLD_PX) {
      setUserHasScrolled(true);
    } else {
      setUserHasScrolled(false);
    }
  };

  // Auto-follow: pin the log to the latest line as rows stream in so the user can
  // watch passively — UNLESS they have scrolled away from the bottom, in which
  // case we respect their position and never yank them back. `userHasScrolled`
  // (maintained by handleScroll) flips back to false when they return to the
  // bottom, which resumes the follow here.
  useEffect(() => {
    if (userHasScrolled) return;
    const el = containerRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [flatLines, isProcessing, userHasScrolled]);

  // Toggle phase expansion
  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }));
  };

  // Toggle iteration expansion
  const toggleIteration = (phaseIteration: string) => {
    setExpandedIterations(prev => ({
      ...prev,
      [phaseIteration]: !prev[phaseIteration]
    }));
  };

  // Toggle line expansion
  const toggleLine = (lineId: string) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId]
    }));
  };

  // Get CSS class for line based on its type
  // Color-coding: Align with canonical stream `type`.  The palette is limited
  // to three primary hues (green, purple, orange) + semantic red for errors
  // and gray fallback for everything else.
  const getLineClass = (logLine: LogLine & { type?: string }) => {
    if (logLine.isError || logLine.type === 'error') return 'text-red-400';

    switch (logLine.type) {
      case 'thinking':
        return 'text-gray-300';
      case 'generation':
        return 'text-emerald-400'; // Bitcode green
      case 'tool-use':
        return 'text-purple-400';  // Bitcode purple
      case 'reading-telemetry':
        return 'text-sky-300';
      case 'operator-readback':
        return 'text-emerald-300';
      case 'repair':
        return 'text-amber-300';
      case 'completion':
        return 'text-emerald-400';
    }

    if (logLine.isSuccess || logLine.isComplete) return 'text-emerald-400';
    if (logLine.isInfo) return 'text-gray-300';
    return 'text-gray-400';
  };

  return (
    <div className="relative w-full">
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
        <button
          type="button"
          onClick={handleCopyTerse}
          title="Copy terse logs"
          aria-label="Copy terse logs"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/40 text-neutral-300 backdrop-blur-sm transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
        >
          {copiedTerse ? (
            <CheckIcon className="h-4 w-4 text-emerald-300" />
          ) : (
            <ListBulletIcon className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={handleCopyRaw}
          title="Copy raw logs"
          aria-label="Copy raw logs"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/40 text-neutral-300 backdrop-blur-sm transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
        >
          {copiedRaw ? (
            <CheckIcon className="h-4 w-4 text-emerald-300" />
          ) : (
            <ClipboardCopyIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="relative px-4 laptop:px-6 pb-3 laptop:pb-4 pt-11 overflow-auto custom-scrollbar group/logs w-full min-h-[240px] max-h-[min(65vh,600px)] focus:outline-none"
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
      <div className="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none opacity-0 transition-opacity duration-200 group-[.can-scroll-up]/logs:opacity-60 z-10" />
      <div className="absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 transition-opacity duration-200 group-[.can-scroll-down]/logs:opacity-60 z-10" />

      <div className="pb-4 w-full">
        {flatLines.length === 0 && !isProcessing && (
          <div className="text-center text-gray-400 py-8">No logs available</div>
        )}

        {/* Empty state placeholder when processing but no logs yet — styled
            exactly like a collapsed log row (same bar, no chevron: there is
            no detail payload to expand). */}
        {isProcessing && flatLines.length === 0 && (
          <div className="relative flex items-center gap-1 w-full rounded-lg pl-7 pr-3 py-2 min-h-[34px] mb-4 select-none text-[0.78rem] font-medium text-emerald-200 backdrop-blur-md bg-white/5 dark:bg-white/2 border-l-2 border-emerald-400/25">
            <span className="truncate min-w-0 text-[0.82rem] leading-none m-0 flex-1">Initializing</span>
            <span className="text-[10px] text-gray-500 flex-shrink-0 select-none ml-1">preparing</span>
          </div>
        )}

        {/* ---- Flat list view – each stream chunk renders as a single line ---- */}

        {flatLines.map((logLine, idx) =>
          renderLogLine(
            logLine,
            `line-${idx}`,
            idx,
            idx > 0 ? flatLines[idx - 1].iteration : undefined,
            toggleLine,
            expandedLines,
            getLineClass,
            compact,
            pipelineMode,
          ),
        )}

        {/* Processing indicator — shows the last known Phase→Agent→Step→Failsafe→
            Thinkings context + elapsed time since the last streamed event, so a
            genuine hang is visible live instead of an unexplained blank gap.
            Before the FIRST row lands (rows are completed calls only), fall
            back to the page's live call-chain context so this line and the
            header pills tell one story instead of a bare 'Processing'. */}
        {isProcessing && (() => {
          const lastLine = flatLines[flatLines.length - 1];
          if (!lastLine && liveContext) {
            const sentence = describeExecutionContext({ ...liveContext, mode: pipelineMode ?? null });
            if (sentence) return <ProcessingIndicator label={sentence} stalled={false} />;
          }
          const { label, likelyStalled } = buildProcessingStallLabel(lastLine, nowTick, pipelineMode);
          return <ProcessingIndicator label={label} stalled={likelyStalled} />;
        })()}
      </div>
    </div>
    </div>
  );
});

/**
 * Copy button for one expanded log line's Details JSON: copies exactly that
 * log-detail payload, pretty-printed, via the same clipboard helper as the
 * "Copy raw logs" button (modern clipboard + insecure-context execCommand
 * fallback).
 */
function DetailsCopyButton({ payload }: { payload: unknown }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy details JSON"
      aria-label="Copy details JSON"
      onClick={async (event) => {
        event.stopPropagation();
        const ok = await copyTextToClipboard(JSON.stringify(payload, null, 2));
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-black/30 text-neutral-400 transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
    >
      {copied ? (
        <CheckIcon className="h-3 w-3 text-emerald-300" />
      ) : (
        <ClipboardCopyIcon className="h-3 w-3" />
      )}
    </button>
  );
}

// Helper function to render a log line
function renderLogLine(
  logLine: LogLine,
  lineId: string,
  index: number,
  prevIteration: number | undefined,
  toggleLine: (id: string) => void,
  expandedLines: Record<string, boolean>,
  getLineClass: (logLine: LogLine) => string,
  compact: boolean,
  pipelineMode?: SynthesisPipelineMode | null,
) {
  const style = TYPE_STYLES[logLine.type || ''] || {
    bg: 'bg-gray-800/40',
    text: 'text-gray-300',
    border: 'border-gray-600/20',
    Icon: InfoCircledIcon,
  };

  const Icon = style.Icon;

  // Shared across layouts: the row's tool label, the mode used by the pill
  // tooltips (explicit page mode > latched stream mode), and the corner-icon
  // explainer (one LLM call vs one Tool use — F19's only two formal rows).
  const toolLabel = logLine.tool
    ? typeof logLine.tool === 'string'
      ? logLine.tool
      : logLine.tool.name || String(logLine.tool)
    : null;
  const rowMode = pipelineMode ?? (logLine.pipelineMode as SynthesisPipelineMode | undefined) ?? null;
  const rowIconExplainer = getTelemetryRowIconExplainer(
    logLine.type === 'tool-use' || logLine.tool ? 'tool' : 'llm',
  );
  // ONE inline, wrapping row of all call-chain pills (phase, agent, step,
  // failsafe, generation, tool) — each a rich-tooltip trigger. Rendered per
  // layout (with a layout-specific className) to the RIGHT of the chevron +
  // title on the SAME line, wrapping onto following lines only when out of
  // width.
  const pillRowProps = {
    phase: logLine.phase,
    agent: logLine.agent,
    step: logLine.step,
    failsafe: logLine.failsafe,
    generation: logLine.generation,
    tool: toolLabel,
    stitchIteration: logLine.stitchIteration,
    chunkIndex: logLine.chunkIndex,
    chunkSum: logLine.chunkSum,
    mode: rowMode,
  };

  const formatMeta = (m?: string) => {
    const v = String(m || '');
    switch (v) {
      case 'prepare_concise_context': return 'Prepare Context';
      case 'prepare-concise-context': return 'Prepare Context';
      case 'chunk_then_sum': return 'Chunk Then Sum';
      case 'chunk-then-sum': return 'Chunk Then Sum';
      case 'stitch_until_complete': return 'Stitch Until Complete';
      case 'stitch-until-complete': return 'Stitch Until Complete';
      default: return v;
    }
  };
  const formatContractId = (value?: string, segments = 3) => {
    const parts = String(value || '').split('.').filter(Boolean);
    return parts.length > segments ? parts.slice(-segments).join('.') : parts.join('.') || String(value || '');
  };

  const hasPills = Boolean(
    logLine.phase || logLine.agent || logLine.step || logLine.failsafe || logLine.generation || toolLabel,
  );

  // A row is expandable (chevron + click-to-toggle) only when there is a
  // detail payload to reveal — a chevron on a payload-less row is a lie.
  const hasDetails = Boolean(logLine.details);

  if (compact) {
    const RowContent = (
      <div
        className={`relative flex items-center gap-1 w-full rounded-lg pl-7 pr-3 py-2 min-h-[34px] mb-4 last:mb-0 select-none text-[0.78rem] font-medium ${style.text} backdrop-blur-md bg-white/5 dark:bg-white/2 hover:bg-white/10 dark:hover:bg-white/10 transition-colors duration-200 border-l-2 ${style.border}`}
        data-log-index={index}
        onClick={hasDetails ? () => toggleLine(lineId) : undefined}
        draggable
          onDragStart={(e) => {
            const payload = {
              text: logLine.text,
              agent: logLine.agent,
              step: logLine.step,
              failsafe: logLine.failsafe,
              generation: logLine.generation,
              tool: logLine.tool,
              details: logLine.details,
            };
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
            e.dataTransfer.effectAllowed = 'copy';
          }}
      >
        {/* Row-type badge (straddles outside top-left corner) — rich-tooltip
            trigger: 'one LLM call' / 'one Tool use'. */}
        <TelemetryExplainerTrigger
          explainer={rowIconExplainer}
          className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            className={`flex items-center justify-center ${style.text} rounded-full shadow-lg backdrop-blur-sm`}
            style={{ width: 28, height: 28, backgroundColor: 'currentColor' }}
          >
            <Icon className="w-[16px] h-[16px] text-gray-900 dark:text-gray-900/90" />
          </span>
        </TelemetryExplainerTrigger>

        {/* ONE line: chevron (only when a detail payload exists), title, then
            the inline pill row (phase, agent, step, failsafe, generation,
            + tool) flowing right — wrapping onto following lines only when
            out of width — then the DIV-loop iteration marker + timestamp. */}
        {hasDetails && (
          <ChevronRightIcon
            className={`w-4 h-4 flex-shrink-0 text-current opacity-60 transition-transform duration-300 ${
              expandedLines[lineId] ? 'rotate-90' : ''
            }`}
          />
        )}
        <span
          title={logLine.text}
          className={`truncate min-w-0 text-[0.82rem] leading-none m-0 ${hasPills ? 'max-w-[45%]' : 'flex-1'}`}
        >
          {logLine.text}
        </span>

        {hasPills && <ExecutionContextPillRow {...pillRowProps} className="flex-1 justify-end" />}

        {typeof logLine.iteration === 'number' && (
          <span
            title={`DIV loop iteration ${logLine.iteration}`}
            className="text-[10px] text-emerald-300/80 flex-shrink-0 select-none ml-1 font-mono"
          >
            iter {logLine.iteration}
          </span>
        )}
        {logLine.timestamp && (
          <span className="text-[10px] text-gray-500 flex-shrink-0 select-none ml-1">
            {formatTime(logLine.timestamp)}
          </span>
        )}
      </div>
    );

    // Expanded details (reuse original rendering at bottom)
    const Details = (
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandedLines[lineId] ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        {expandedLines[lineId] && (
          <div className="pl-6 pr-4 py-3 ml-4 border-l border-emerald-500/20 rounded-r bg-emerald-500/[0.02] text-gray-400/90 text-[11px] space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
            {logLine.text && (
              <div>
                <div className="text-emerald-400 font-semibold mb-0.5">Text</div>
                <div className="whitespace-pre-wrap select-text cursor-text">
                  {logLine.text}
                </div>
              </div>
            )}
            {logLine.details && (
              <div>
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className="text-emerald-400 font-semibold">Details</span>
                  <DetailsCopyButton payload={logLine.details} />
                </div>
                <pre className="whitespace-pre-wrap break-words select-text cursor-text">
                  {JSON.stringify(logLine.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div key={lineId} className="group/log">
        {RowContent}
        {Details}
      </div>
    );
  }

  // Iteration visual stuff --------------------------------------------------
  const hasIteration = typeof logLine.iteration === 'number';
  const isFirstInIter = logLine.iteration !== prevIteration;
  const neonPalette = [
    '#67FEB7', // emerald neon
    '#38BDF8', // sky
    '#E879F9', // fuchsia
    '#F87171', // red-ish
    '#FBBF24', // amber
    '#A78BFA', // violet
  ];
  const iterColor = hasIteration
    ? neonPalette[logLine.iteration! % neonPalette.length]
    : undefined;

  return (
    <div key={lineId} className="group/log">
      <div
        data-log-index={index}
        tabIndex={0}
        draggable
        onDragStart={(e) => {
          const payload = {
            text: logLine.text,
            agent: logLine.agent,
            step: logLine.step,
            failsafe: logLine.failsafe,
            generation: logLine.generation,
            tool: logLine.tool,
            details: logLine.details,
          };
          e.dataTransfer.setData('application/json', JSON.stringify(payload));
          e.dataTransfer.effectAllowed = 'copy';
        }}
        onClick={hasDetails ? () => toggleLine(lineId) : undefined}
        className={`
          relative flex flex-col tablet:flex-row items-start tablet:items-center gap-2 tablet:gap-4 w-full rounded-lg px-3 tablet:px-4 desktop:px-5 py-2 tablet:py-3 laptop:py-4 cursor-pointer select-none text-xs tablet:text-sm desktop:text-base font-medium
          ${style.text} backdrop-blur-md bg-white/5 dark:bg-white/2 hover:bg-white/10 dark:hover:bg-white/10 transition-colors duration-200
          border-l-[3px] ${style.border}
          ${style.glow ? 'ring-glow' : ''}
          animate-fade-in-up focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60
          ${hasIteration ? 'iter-connector' : ''}
        `}
        style={{
          cursor: 'grab',
          ...(iterColor ? { '--iter-color': iterColor } as React.CSSProperties : {}),
        }}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleLine(lineId);
          }
        }}
      >
        {/* Iteration bullet (drawn before arrow to align) */}
        {hasIteration && isFirstInIter && <span className="hidden laptop:inline-block iter-bullet" />}

        {/* Accordion arrow (hidden on xs; only when a detail payload exists) */}
        {hasDetails && (
          <ChevronRightIcon
            className={`hidden laptop:block w-4 h-4 laptop:w-5 laptop:h-5 text-current opacity-60 transition-transform duration-300 mx-auto ${
              expandedLines[lineId] ? 'rotate-90' : ''
            }`}
          />
        )}

        {/* Mobile chevron indicator handled inside mobile layout now */}

        {/* Type icon — rich-tooltip trigger ('one LLM call' / 'one Tool use') */}
        <TelemetryExplainerTrigger explainer={rowIconExplainer} className="hidden laptop:inline-flex mx-auto">
          <Icon className="w-6 h-6 laptop:w-7 laptop:h-7 text-current" />
        </TelemetryExplainerTrigger>

        {/* Desktop inline row */}
        <div className="hidden laptop:flex flex-1 items-center justify-between min-w-0">
          {/* Main text */}
          <span
            title={logLine.text}
            className="select-text cursor-text truncate min-w-0 flex-1 pr-3 text-xs tablet:text-sm laptop:text-[0.94rem] desktop:text-base font-medium leading-none h-5 flex items-center gap-1"
          >
            <Icon className="inline-block laptop:hidden w-4 h-4 text-current" />
            {logLine.text}
          </span>

          {/* Meta cluster + timestamp: the pill row flows right of the title
              on the SAME line, wrapping only when out of width. */}
          <div className="hidden laptop:flex items-center flex-wrap justify-end gap-1 laptop:max-w-[50%]">
            {/* Timestamp */}
            {logLine.timestamp && (
              <span className="text-[11px] text-gray-500 ml-auto font-normal select-none">
                {formatTime(logLine.timestamp)}
              </span>
            )}

            {hasPills && <ExecutionContextPillRow {...pillRowProps} className="justify-end" />}
          </div>
        </div>

        {/* Mobile / narrow layout */}
        <div className="laptop:hidden relative w-full pl-12 pr-3 py-2">
          {/* Floating Type Icon (circular bubble) — rich-tooltip trigger */}
          <TelemetryExplainerTrigger
            explainer={rowIconExplainer}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <span
              className={`flex items-center justify-center ${style.text} rounded-full shadow-md`}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'currentColor',
              }}
            >
              <Icon className="w-3 h-3 text-gray-900 dark:text-gray-900/90" />
            </span>
          </TelemetryExplainerTrigger>

          {/* ONE line: chevron, title, then the inline pill row flowing right
              (wrapping onto following lines only when out of width), timestamp. */}
          <div className="flex items-center gap-1 w-full min-w-0">
            {hasDetails && (
              <ChevronRightIcon
                className={`laptop:hidden w-3 h-3 flex-shrink-0 text-current opacity-60 transition-transform duration-300 ${
                  expandedLines[lineId] ? 'rotate-90' : ''
                }`}
              />
            )}

            <span
              title={logLine.text}
              className={`text-xs font-medium truncate min-w-0 ${hasPills ? 'max-w-[45%]' : 'flex-1'}`}
            >
              {logLine.text}
            </span>

            {hasPills && <ExecutionContextPillRow {...pillRowProps} className="flex-1 justify-end" />}

            {logLine.timestamp && (
              <span className="text-[11px] text-gray-500 flex-shrink-0 select-none">
                {formatTime(logLine.timestamp)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${expandedLines[lineId] ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="pl-6 pr-4 py-3 ml-4 border-l border-emerald-500/20 rounded-r bg-emerald-500/[0.02] text-gray-400/90">
          <ContentVisibility className="space-y-3 overflow-y-auto custom-scrollbar max-h-[600px] pr-2">
            {/* Agent info */}
            {logLine.agent && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-emerald-400">Agent:</div>
                <div className="text-sm pl-2 border-l-2 border-emerald-500/10 py-1">
                  {logLine.agent}
                </div>
              </div>
            )}

            {/* Timestamp */}
            {logLine.timestamp && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-emerald-400">Timestamp:</div>
                <div className="text-sm pl-2 border-l-2 border-emerald-500/10 py-1">
                  {new Date(logLine.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {/* File Diffs */}
            {logLine.type === 'file-diff' && logLine.details?.fileTree && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-indigo-400">File Changes:</div>
                <div className="mt-2">
                  <FileDiffViewer
                    files={logLine.details.fileTree.files || []}
                    renderMode="unified"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {logLine.type === 'file-diff' && logLine.details?.fileDiff && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-indigo-400">File Changed:</div>
                <div className="mt-2">
                  <FileDiffViewer
                    files={[logLine.details.fileDiff]}
                    renderMode="unified"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {/* Detail content */}
            {logLine.details && (
              <>
                {/* Status detail */}
                {(logLine.details.status?.detail || logLine.details.text) && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-emerald-400">Detail:</div>
                    <div className="text-sm pl-2 border-l-2 border-emerald-500/10 py-1 max-h-[200px] overflow-y-auto custom-scrollbar select-text cursor-text">
                      {logLine.details.status?.detail || logLine.details.text || logLine.text}
                    </div>
                  </div>
                )}

                {/* Execution State */}
                {logLine.details.status?.executionState && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-emerald-400">Execution State:</div>
                    <div className="text-sm pl-2 border-l-2 border-emerald-500/10 py-1">
                      <div className="flex flex-wrap items-center space-x-4 select-text cursor-text">
                        {logLine.phase && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Phase:</span>
                            <span className="text-xs text-emerald-300">{logLine.phase}</span>
                          </div>
                        )}
                        {logLine.pipeline && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Pipeline:</span>
                            <span className="text-xs text-emerald-300">{logLine.pipeline}</span>
                          </div>
                        )}
                        {logLine.phaseId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Phase ID:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.phaseId, 2)}</span>
                          </div>
                        )}
                        {logLine.agent && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Agent:</span>
                            <span className="text-xs text-emerald-300">{logLine.agent}</span>
                          </div>
                        )}
                        {logLine.agentId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">PTRR Agent:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.agentId, 3)}</span>
                          </div>
                        )}
                        {logLine.step && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Step:</span>
                            <span className="text-xs text-emerald-300">{logLine.step}</span>
                          </div>
                        )}
                        {logLine.ptrrStepId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">PTRR Step:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.ptrrStepId, 3)}</span>
                          </div>
                        )}
                        {logLine.failsafe && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Failsafe:</span>
                            <span className="text-xs text-emerald-300">{formatMeta(logLine.failsafe)}</span>
                          </div>
                        )}
                        {logLine.generation && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Generation:</span>
                            <span className="text-xs text-emerald-300">{formatMeta(logLine.generation)}</span>
                          </div>
                        )}
                        {logLine.promptTemplateId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Prompt:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.promptTemplateId, 2)}</span>
                          </div>
                        )}
                        {(logLine.outputSchema || logLine.returnType) && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Schema:</span>
                            <span className="text-xs text-emerald-300">{logLine.outputSchema || logLine.returnType}</span>
                          </div>
                        )}
                        {logLine.eventId && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Event:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.eventId, 2)}</span>
                          </div>
                        )}
                        {logLine.proofRoot && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Proof:</span>
                            <span className="text-xs text-emerald-300">{formatContractId(logLine.proofRoot, 2)}</span>
                          </div>
                        )}
                        {logLine.redactionPosture && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Redaction:</span>
                            <span className="text-xs text-emerald-300">{logLine.redactionPosture}</span>
                          </div>
                        )}
                        {logLine.promptDisclosurePosture && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Prompt:</span>
                            <span className="text-xs text-emerald-300">{logLine.promptDisclosurePosture}</span>
                          </div>
                        )}
                        {logLine.resultDisclosurePosture && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Result:</span>
                            <span className="text-xs text-emerald-300">{logLine.resultDisclosurePosture}</span>
                          </div>
                        )}
                        {logLine.failClosedState && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Fail Closed:</span>
                            <span className="text-xs text-emerald-300">{logLine.failClosedState}</span>
                          </div>
                        )}
                        {logLine.tool && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Tool:</span>
                            <span className="text-xs text-emerald-300">
                              {typeof logLine.tool === 'string'
                                ? logLine.tool
                                : logLine.tool.name || String(logLine.tool)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PTRR Snapshot (experimental) – uses stores if provided */}
                {(() => {
                  try {
                    const stores = logLine.details?.status?.metadata?.stores || logLine.details?.metadata?.stores;
                    const stepLower = String(logLine.step || '').toLowerCase();
                    // 'retry' must be tested before 'try' ('retry'.includes('try')).
                    const stepName = stepLower.includes('plan') ? 'plan'
                      : stepLower.includes('retry') || stepLower.includes('intensify') ? 'retry'
                      : stepLower.includes('try') || stepLower.includes('generate') ? 'try'
                      : stepLower.includes('refine') ? 'refine'
                      : undefined;
                    if (!stores || !logLine.phase || !logLine.agent || !stepName) return null;
                    const vm = buildStepViewModel({ phase: logLine.phase, agent: logLine.agent, step: stepName as any }, stores);
                    return (
                      <div className="space-y-1 mt-2">
                        <div className="text-xs font-medium text-emerald-400 flex items-center gap-2">
                          <span>PTRR Snapshot</span>
                          <span className="text-[10px] text-gray-500">experimental</span>
                        </div>
                        <div className="text-xs pl-2 border-l-2 border-emerald-500/10 py-1 grid gap-1">
                          <div>
                            <span className="text-gray-500 mr-1">Failsafes:</span>
                            {vm.failsafes.map(f => (
                              <span key={f.failsafe} className="inline-block mr-2 text-emerald-300">{formatMeta(f.failsafe)}</span>
                            ))}
                          </div>
                          {vm.tools.used.length > 0 && (
                            <div>
                              <span className="text-gray-500 mr-1">Tools used:</span>
                              {vm.tools.used.map((t, i) => (
                                <span key={i} className="inline-block mr-2 text-purple-300">{t.tool}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}

                {/* Selector groups */}
                {(logLine.phase || logLine.step || logLine.failsafe || logLine.generation) && (
                  <div className="space-y-3 pt-2">
                    {logLine.phase && (
                      <div>
                        <div className="text-xs font-medium text-emerald-400 mb-1">Phases:</div>
                        <div className="flex flex-wrap gap-1">
                          {['Setup','Discovery','Implementation','Validation','Finish'].map(p => (
                            <TelemetryExplainerTrigger key={p} explainer={getTelemetryPillExplainer('phase', p, rowMode)}>
                              <PathPill type="phase" label={p} className={p===logLine.phase ? '' : 'opacity-25'} />
                            </TelemetryExplainerTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                    {logLine.step && (
                      <div>
                        <div className="text-xs font-medium text-emerald-400 mb-1">Steps:</div>
                        <div className="flex flex-wrap gap-1">
                          {['Plan','Try','Refine','Retry'].map(s => (
                            <TelemetryExplainerTrigger key={s} explainer={getTelemetryPillExplainer('step', s, rowMode, { agent: logLine.agent, step: logLine.step })}>
                              <PathPill type="step" label={s} className={s===normalizeStepName(logLine.step) ? '' : 'opacity-25'} />
                            </TelemetryExplainerTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                    {logLine.failsafe && (
                      <div>
                        <div className="text-xs font-medium text-emerald-400 mb-1">Failsafes:</div>
                        <div className="flex flex-wrap gap-1">
                          {[
                            ['Prepare Context', 'prepare_concise_context'],
                            ['Chunk Then Sum', 'chunk_then_sum'],
                            ['Stitch Until Complete', 'stitch_until_complete'],
                          ].map(([m, rawFailsafe]) => (
                            <TelemetryExplainerTrigger key={m} explainer={getTelemetryPillExplainer('failsafe', rawFailsafe, rowMode, { agent: logLine.agent, step: logLine.step })}>
                              <PathPill type="failsafe" label={m} className={m===formatMeta(logLine.failsafe) ? '' : 'opacity-25'} />
                            </TelemetryExplainerTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                    {logLine.generation && (
                      <div>
                        <div className="text-xs font-medium text-emerald-400 mb-1">Generations:</div>
                        <div className="flex flex-wrap gap-1">
                          {['Reason','Judge','Structured Output'].map(sub => (
                            <TelemetryExplainerTrigger key={sub} explainer={getTelemetryPillExplainer('generation', sub, rowMode, { agent: logLine.agent, step: logLine.step })}>
                              <PathPill type="generation" label={sub} className={sub===formatMeta(logLine.generation) ? '' : 'opacity-25'} />
                            </TelemetryExplainerTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Files */}
                {(logLine.details.status?.metadata?.files ||
                  logLine.details.metadata?.files ||
                  logLine.details.files ||
                  logLine.details.paths) && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-emerald-400">Files:</div>
                      <div className="grid gap-2 pl-2">
                        {(logLine.details.status?.metadata?.files ||
                          logLine.details.metadata?.files ||
                          logLine.details.files ||
                          logLine.details.paths || []).map((f: string, fIdx: number) => (
                            <div
                              key={fIdx}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-[#1f2937]/30 rounded-md border border-[#1f2937] group/file hover:border-[#67feb7]/30 transition-all duration-200"
                            >
                              <svg className="w-3.5 h-3.5 text-[#67feb7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs text-gray-300 group-hover/file:text-[#67feb7] transition-colors duration-200 select-text cursor-text">
                                {f}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Additional metadata */}
                {logLine.details.status?.metadata && Object.keys(logLine.details.status.metadata).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-emerald-400">Metadata:</div>
                    <div className="text-sm pl-2 border-l-2 border-emerald-500/10 py-1">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto custom-scrollbar select-text cursor-text">
                        {JSON.stringify(logLine.details.status.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Raw data (for debugging) */}
                <div className="space-y-1 mt-4 pt-4 border-t border-emerald-500/10">
                  <div className="text-xs font-medium text-gray-500 flex items-center justify-between">
                    <span>Raw Data</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600">For debugging</span>
                      <DetailsCopyButton payload={logLine.details} />
                    </span>
                  </div>
                  <div className="text-sm pl-2 border-l-2 border-gray-700/30 py-1">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto custom-scrollbar text-gray-500 select-text cursor-text">
                      {JSON.stringify(logLine.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </ContentVisibility>
        </div>
      </div>
    </div>
  );
}

PipelineExecutionLog.displayName = 'PipelineExecutionLog';
