import {
  buildBitcodeActivityRecordFromExecutionEvent,
  summarizeBitcodeActivityKinds,
  type BitcodeActivityKind,
  type BitcodeActivityRecord,
} from '@/components/base/bitcode/activity/bitcode-activity-model';

type ExecutionEvent = {
  id?: string;
  created_at?: string;
  event?: any;
};

export interface TerminalRunActivitySnapshot {
  output: string;
  outputDetails: Record<string, any>;
  activityRecords: BitcodeActivityRecord[];
  activityKinds: BitcodeActivityKind[];
  executionState: Record<string, any>;
  isStreamingComplete: boolean;
  generationCount: number;
  error: string | null;
  latestWorkUpdate: any | null;
  iterationUpdates: any[];
  /**
   * The synthesis pipeline mode latched from the stream (the
   * 'synthesize-asset-packs' namespace 'mode' store carries 'deposit'|'read').
   * Null until the store event arrives.
   */
  mode: 'deposit' | 'read' | null;
  /**
   * The DIV loop's CURRENT iteration (1-based, latched from the
   * pipeline/currentIteration store) — null before the loop starts and once
   * the finish phase begins. Drives the header's 'iter N' marker.
   */
  currentIteration: number | null;
  /**
   * The CURRENT active call-chain: the rolling Phase→Agent→Step→Failsafe→
   * Generation context after the last streamed event — drives live header
   * trackers without re-parsing the log.
   */
  latestContext: {
    phase: string | null;
    agent: string | null;
    step: string | null;
    failsafe: string | null;
    generation: string | null;
  } | null;
}

export type MockRunActivitySnapshot = {
  output: string;
  outputDetails: Record<string, any>;
  executionState?: Record<string, any>;
  latestWorkUpdate?: any | null;
  iterationUpdates?: any[];
  isStreamingComplete?: boolean;
  generationCount?: number;
  error?: string | null;
};

// One streamed event must render as exactly one accordion row. The renderer
// (PipelineExecutionLog) splits `output` on '\n', so any embedded newline in an
// event message would fragment a single event into many rows (and break the
// outputDetails key lookup, since the key is the full multi-line string). We
// therefore collapse every event line to a single bounded line. Raw model
// content is already withheld upstream by sourceSafeStreamEvent; this is the
// client-side guarantee that nothing can fragment or overflow the log even if a
// future event slips a newline through.
const MAX_ACTIVITY_LINE_CHARS = 280;
function toSafeSingleLine(value: string): string {
  const collapsed = String(value ?? '')
    .replace(/\s*\r?\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return collapsed.length > MAX_ACTIVITY_LINE_CHARS
    ? `${collapsed.slice(0, MAX_ACTIVITY_LINE_CHARS - 1)}…`
    : collapsed;
}

// ---------------------------------------------------------------------------
// Formal telemetry log-line contract (V48, QA F19)
//
// The rich telemetry renders EXACTLY two formal log-line kinds, plus a few
// terminal/high-level signals — nothing else:
//   • LLM call  — the inference leaf. Canonically the Thinkings substep output
//     (`llm/output`, stream type `generation`), whose value carries the full
//     hierarchy {phase, agent, step, failsafe, generation}. Rendered with all
//     five pills + source-safe content + provider/model/usage metadata.
//   • Tool use  — a tool invocation inside a step (`tool/result` on success,
//     `tool/error` on failure). Carries Phase/Agent/Step (from the rolling
//     context — tool stores don't embed the hierarchy) + tool name/arguments.
// Every other store event (step/agent/phase name stores, prompt-side llm keys,
// `llm/response` registry copies, cwd paths, generation markers, tool sub-keys)
// is intermediate CONTEXT: it updates the rolling hierarchy but never becomes a
// row. This is what stops `try` / `setup-plan` / `thinkings-generation` / path
// fragments from fragmenting the log and stabilizes the pipeline↔UI contract.
// ---------------------------------------------------------------------------

// A null byte separates a row's display text from a unique row key in the
// `output` string. The renderer splits each line on it: text before, key after.
// Distinct LLM/tool calls that share withheld text (e.g. two `[content withheld]`
// reason calls in one step) therefore stay distinct rows instead of collapsing
// under the renderer's text-keyed de-dup.
export const TELEMETRY_ROW_KEY_SEP = '\u0000';

interface ExecContext {
  phase?: string | null;
  agent?: string | null;
  step?: string | null;
  failsafe?: string | null;
  generation?: string | null;
  /** DIV-loop iteration (1-based), latched from pipeline/currentIteration. */
  iteration?: number | null;
}

function readEventExecutionState(payload: any): ExecContext {
  const es =
    (payload?.status?.executionState && typeof payload.status.executionState === 'object'
      ? payload.status.executionState
      : null) ||
    (payload?.executionState && typeof payload.executionState === 'object' ? payload.executionState : null) ||
    {};
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
  return {
    phase: es.phase ?? data.phase ?? null,
    agent: es.agent ?? data.agent ?? null,
    step: es.step ?? data.step ?? null,
    failsafe: es.failsafe ?? data.failsafe ?? null,
    generation: es.generation ?? data.generation ?? null,
  };
}

// Merge a freshly observed context into the rolling one (non-null wins). Name
// stores (`phase/current`, `agent/name`, `step/name`) and the live-stream
// `phase`/`agent` transition events carry the hierarchy as a bare value rather
// than in executionState, so fold those in explicitly.
function updateRollingContext(ctx: ExecContext, payload: any): void {
  const es = readEventExecutionState(payload);
  if (es.phase) ctx.phase = es.phase;
  if (es.agent) ctx.agent = es.agent;
  if (es.step) ctx.step = es.step;
  if (es.failsafe) ctx.failsafe = es.failsafe;
  if (es.generation) ctx.generation = es.generation;

  const ns = String(payload?.namespace || '');
  const key = String(payload?.key || '');
  const value = payload?.data;
  if (typeof value === 'string') {
    if (ns === 'phase' && (key === 'current' || key === 'name')) ctx.phase = value;
    if (ns === 'agent' && key === 'name') ctx.agent = value;
    if (ns === 'step' && key === 'name') ctx.step = value;
  }
  if (payload?.type === 'phase' && payload?.phase) ctx.phase = String(payload.phase);
  if (payload?.type === 'agent' && payload?.agent) ctx.agent = String(payload.agent);

  // DIV-loop iteration (1-based): the SDIVF executor variant stores
  // phase/iteration at each observed D/I/V phase start; the classic variant
  // stores pipeline/currentIteration at the top of each pass. Setup precedes
  // the first store and Finish runs outside the loop, so clear the latch once
  // the finish phase starts.
  if ((ns === 'phase' && key === 'iteration') || (ns === 'pipeline' && key === 'currentIteration')) {
    const iteration = Number(value);
    if (Number.isFinite(iteration) && iteration > 0) ctx.iteration = iteration;
  }
  if (String(ctx.phase || '').toLowerCase().includes('finish')) ctx.iteration = null;
}

type FormalLogLineKind = 'llm' | 'tool';

function classifyFormalLogLine(payload: any): FormalLogLineKind | null {
  const type = String(payload?.type || '');
  const ns = String(payload?.namespace || '');
  const key = String(payload?.key || '');

  // The rich telemetry renders ONLY the ultimate LLM-call layer and Tool uses —
  // each with its complete hierarchy (LLM: Phase/Agent/Step/Failsafe/Thinkings;
  // Tool: Phase/Agent/Step + tool). Everything else (informational status, phase
  // banners, completion/error notices) advances the rolling context but never
  // becomes a row; run completion is surfaced by the processing indicator and
  // errors by the log's error banner, not by accordion rows.

  // Formal LLM call: the Thinkings substep output is canonical (full hierarchy).
  if (type === 'generation') return 'llm';
  if (ns === 'llm' && key === 'output') return 'llm';

  // Formal tool use: one row per completed tool call (result | error).
  if (type === 'tool-use') return 'tool';
  if ((ns === 'tool' || ns === 'tools') && (key === 'result' || key === 'error')) return 'tool';

  return null;
}

export function buildTerminalRunActivityFromEvents(
  events: ExecutionEvent[],
  latestWorkUpdate: any | null,
  iterationUpdates: any[],
  streamError: string | null,
): TerminalRunActivitySnapshot {
  const outputDetails: Record<string, any> = {};
  const outputLines: string[] = [];
  const activityRecords = events
    .map((entry) => buildBitcodeActivityRecordFromExecutionEvent(entry))
    .filter((record): record is BitcodeActivityRecord => Boolean(record));
  const normalizedIterationUpdates = new Map<number | string, any>();
  const statusEvents = events.filter((entry) => entry.event?.type === 'status');
  const completionEvent = events.find((entry) => entry.event?.type === 'completion');
  // The run error is a GENUINE terminal error only. A 'validation'-namespace
  // error is the stitch failsafe recording the schema error it is actively
  // repairing (streamed as type 'repair' since the ExecutionStreamAdapter fix;
  // rows persisted before it are still typed 'error') — surfacing it as the
  // run error marked an actively-repairing run as failed.
  const errorEvent = events.find(
    (entry) => entry.event?.type === 'error' && entry.event?.namespace !== 'validation',
  );

  for (const update of iterationUpdates || []) {
    if (update && typeof update.iteration !== 'undefined') {
      normalizedIterationUpdates.set(update.iteration, update);
    }
  }

  // Rolling hierarchy + per-tool-node accumulators drive the formal log-line
  // contract: only LLM calls and Tool uses (plus terminal/high-level signals)
  // become rows; every other event just advances the rolling context.
  const rollingContext: ExecContext = {};
  const toolByNode = new Map<string, { name?: string; input?: unknown }>();
  let rowSeq = 0;
  // Pipeline mode latched from the 'synthesize-asset-packs'/'mode' store —
  // stamped onto subsequent rows (the processing indicator's 'While
  // Depositing, …' prefix fallback) and surfaced on the snapshot.
  let pipelineMode: 'deposit' | 'read' | null = null;

  const pushRow = (displayText: string, enriched: any) => {
    const text = toSafeSingleLine(displayText);
    if (!text) return;
    // Unique key keeps distinct LLM/tool calls from collapsing under the
    // renderer's text-keyed de-dup; the renderer strips everything from the
    // separator on for display.
    const rowKey = `${text}${TELEMETRY_ROW_KEY_SEP}${rowSeq++}`;
    outputLines.push(rowKey);
    outputDetails[rowKey] = enriched;
  };

  const stampExecutionState = (state: ExecContext, payload: any, extra?: Record<string, unknown>) => {
    const stamped = {
      ...state,
      ...(pipelineMode ? { pipelineMode } : {}),
      ...(extra || {}),
    };
    return {
      ...payload,
      executionState: stamped,
      status: {
        ...(payload?.status && typeof payload.status === 'object' ? payload.status : {}),
        executionState: stamped,
      },
    };
  };

  // Failsafe-repair markers derived from the execution path: a stitch-repair
  // generation runs under a 'stitch-<N>-gen-*' segment, a chunk task
  // generation under the 'chunks' subtree, and the chunk summing generation
  // under 'sum-gen-*'. Stamped into the row's executionState so the renderer
  // badges real failsafe-handling work (>0 stitches, >1 chunks).
  const deriveFailsafeRepairMarkers = (payload: any): Record<string, unknown> => {
    const path: unknown[] = Array.isArray(payload?.executionPath) ? payload.executionPath : [];
    const markers: Record<string, unknown> = {};
    for (let i = 0; i < path.length; i++) {
      const segment = String(path[i] ?? '');
      const stitch = segment.match(/^stitch-(\d+)-gen-/);
      if (stitch) markers.stitchIteration = Number(stitch[1]);
      if (segment.startsWith('sum-gen')) markers.chunkSum = true;
      if (segment === 'chunks') {
        const next = String(path[i + 1] ?? '');
        const trailingIndex = next.match(/(\d+)$/);
        // Child ids under 'chunks' are zero-based (seq-0, par-0, ...) — badge 1-based.
        markers.chunkIndex = trailingIndex ? Number(trailingIndex[1]) + 1 : 1;
      }
    }
    return markers;
  };

  for (const entry of events) {
    const payload = entry.event || {};
    if (payload?.type === 'work-update' && payload.update) {
      if (typeof payload.update.iteration !== 'undefined') {
        normalizedIterationUpdates.set(payload.update.iteration, payload.update);
      }
      continue;
    }

    // Every event advances the rolling hierarchy before we decide whether it is
    // itself a formal log line.
    updateRollingContext(rollingContext, payload);

    // Accumulate tool name/arguments per tool-execution node so the eventual
    // result/error row can render the complete tool-use line.
    const ns = String(payload?.namespace || '');
    const key = String(payload?.key || '');
    const nodeId = String(payload?.executionNodeId || '');

    // Latch the synthesis pipeline mode ('deposit' | 'read') from its store.
    if (ns === 'synthesize-asset-packs' && key === 'mode' && typeof payload?.data === 'string') {
      const candidate = payload.data.trim().toLowerCase();
      if (candidate === 'deposit' || candidate === 'read') pipelineMode = candidate;
    }
    if ((ns === 'tool' || ns === 'tools') && nodeId) {
      if (key === 'name' && typeof payload?.data === 'string') {
        const acc = toolByNode.get(nodeId) || {};
        acc.name = payload.data;
        toolByNode.set(nodeId, acc);
      } else if (key === 'input' || key === 'arguments') {
        const acc = toolByNode.get(nodeId) || {};
        acc.input = payload?.data ?? null;
        toolByNode.set(nodeId, acc);
      }
    }

    const kind = classifyFormalLogLine(payload);
    if (!kind) continue;

    if (kind === 'llm') {
      // The LLM call carries the full hierarchy itself; fall back to the rolling
      // context only for any field the event omits.
      const own = readEventExecutionState(payload);
      const merged: ExecContext = {
        phase: own.phase ?? rollingContext.phase ?? null,
        agent: own.agent ?? rollingContext.agent ?? null,
        step: own.step ?? rollingContext.step ?? null,
        failsafe: own.failsafe ?? null,
        generation: own.generation ?? null,
        iteration: rollingContext.iteration ?? null,
      };
      const text = String(payload?.message || payload?.status?.message || '[content withheld — source-safe]');
      pushRow(text, stampExecutionState(merged, { ...payload, type: 'generation' }, deriveFailsafeRepairMarkers(payload)));
      continue;
    }

    if (kind === 'tool') {
      const acc = toolByNode.get(nodeId) || {};
      // The execution node id carries the tool identity ('…/tool:<Name>')
      // deterministically; the name-store accumulator is only a fallback —
      // same-millisecond event scrambling can deliver a call's 'name' store
      // after its 'result', which used to leave rows named just 'tool'.
      const nodeToolSegment = nodeId
        .split('/')
        .reverse()
        .find((segment) => segment.startsWith('tool:'));
      const toolNameFromNode = nodeToolSegment ? nodeToolSegment.slice('tool:'.length) : '';
      const toolName =
        toolNameFromNode ||
        acc.name ||
        payload?.data?.tool ||
        payload?.metadata?.toolName ||
        (key === 'error' ? 'tool (failed)' : 'tool');
      // Tool uses have Phase/Agent/Step but no Failsafe/Thinkings.
      const merged: ExecContext = {
        phase: rollingContext.phase ?? null,
        agent: rollingContext.agent ?? null,
        step: rollingContext.step ?? null,
        iteration: rollingContext.iteration ?? null,
      };
      const enriched = stampExecutionState(merged, { ...payload, type: 'tool-use' }, { tool: toolName });
      enriched.metadata = {
        ...(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
        toolName,
        toolInput: acc.input ?? null,
      };
      pushRow(toolName, enriched);
      if (nodeId) toolByNode.delete(nodeId);
      continue;
    }
  }

  const latestStatusEvent = statusEvents[statusEvents.length - 1];

  const hasLatestContext = Boolean(
    rollingContext.phase || rollingContext.agent || rollingContext.step,
  );

  return {
    output: outputLines.join('\n'),
    outputDetails,
    activityRecords,
    activityKinds: summarizeBitcodeActivityKinds(activityRecords),
    executionState: latestStatusEvent?.event?.status?.executionState || {},
    isStreamingComplete: Boolean(completionEvent),
    generationCount: events.filter((entry) => entry.event?.type === 'generation').length,
    error: streamError || errorEvent?.event?.message || errorEvent?.event?.error || null,
    latestWorkUpdate,
    iterationUpdates: Array.from(normalizedIterationUpdates.values()),
    mode: pipelineMode,
    latestContext: hasLatestContext
      ? {
        phase: rollingContext.phase ?? null,
        agent: rollingContext.agent ?? null,
        step: rollingContext.step ?? null,
        failsafe: rollingContext.failsafe ?? null,
        generation: rollingContext.generation ?? null,
      }
      : null,
    currentIteration: rollingContext.iteration ?? null,
  };
}

export function buildTerminalRunActivityFromMock(
  snapshot: MockRunActivitySnapshot | null | undefined,
): TerminalRunActivitySnapshot | null {
  if (!snapshot) return null;

  const activityRecords = Object.values(snapshot.outputDetails || {})
    .map((payload, index) =>
      buildBitcodeActivityRecordFromExecutionEvent({
        id: `mock-activity:${index}`,
        created_at: payload?.timestamp || null,
        event: payload,
      }),
    )
    .filter((record): record is BitcodeActivityRecord => Boolean(record));

  return {
    output: snapshot.output || '',
    outputDetails: snapshot.outputDetails || {},
    activityRecords,
    activityKinds: summarizeBitcodeActivityKinds(activityRecords),
    executionState: snapshot.executionState || {},
    isStreamingComplete: snapshot.isStreamingComplete ?? true,
    generationCount: snapshot.generationCount ?? 0,
    error: snapshot.error ?? null,
    latestWorkUpdate: snapshot.latestWorkUpdate ?? null,
    iterationUpdates: snapshot.iterationUpdates || [],
    mode: null,
    latestContext: null,
    currentIteration: null,
  };
}
