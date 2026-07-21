'use client';

/* eslint-disable react/no-multi-comp */

import React, { useRef, useState, useEffect, useLayoutEffect, forwardRef } from 'react';
import { ContentVisibility } from '@/components/bitcode/perf/ContentVisibility/ContentVisibility';
import { ProcessingIndicator } from '@/components/bitcode/indicators/ProcessingIndicator/ProcessingIndicator';
import {
  CheckIcon,
  ClipboardCopyIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import {
  buildRawLogCopyText,
  buildTerseLogCopyText,
  buildProcessingStallLabel,
  distillTerseValue,
  compactTerseEvent,
} from './pipeline-execution-log-copy';
import {
  extractExecutionState,
  applyExecutionStateToLogLine,
} from './pipeline-execution-log-state';
import { copyTextToClipboard } from './pipeline-execution-log-clipboard';
import { renderLogLine, TYPE_STYLES } from './pipeline-execution-log-render-line';

export {
  buildRawLogCopyText,
  buildTerseLogCopyText,
  buildProcessingStallLabel,
  distillTerseValue,
  compactTerseEvent,
} from './pipeline-execution-log-copy';
export { copyTextToClipboard } from './pipeline-execution-log-clipboard';

import {
  SDIVF_PHASES,
  describeExecutionContext,
  normalizePhaseName,
  normalizeStepName,
  type SynthesisPipelineMode,
} from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';

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
  /**
   * Run start epoch ms for elapsed log timestamps (+m:ss). When omitted,
   * falls back to the earliest line timestamp in the rendered set.
   */
  startedAtMs?: number | null;
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

// ---------------------------------------------------------------------------
// Visual style mapping per canonical stream `type`
// ---------------------------------------------------------------------------


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

// "Copy terse logs" string budgets: ordinary string fields truncate to
// TERSE_STRING_LIMIT; fields whose key looks error-ish (error/message/stack)
// keep TERSE_ERROR_STRING_LIMIT so failure forensics survive the distillation.

/**
 * Recursively distill a copy payload for the "Copy terse logs" button: every
 * string over its budget is truncated to a preview + '… [+N chars]' marker,
 * while structure, ordering, counts, numbers, and short fields (the run's
 * phase/agent/step/failsafe hierarchy, statuses, usage, timestamps) survive
 * whole. Pure + exported for unit testing.
 */

/**
 * Compact one streamed run event ({id, created_at, event} or a bare payload)
 * into a terse row: timestamp, canonical type, store identity (namespace/key),
 * the full Phase→Agent→Step→Failsafe→Generation call chain + repair markers,
 * provider/model/usage, a bounded message preview, and (near-)complete error
 * bodies. Everything else — the raw stored values, executionState duplicates,
 * metadata snapshots — is the payload bulk and is dropped.
 */

/**
 * Build the text the "Copy terse logs" button copies: the same run payload as
 * "Copy raw logs", distilled to a much smaller but still debugging-useful
 * form. When `copyData` carries an `events` array (the /deposits shape), every
 * event compacts to its terse row (`compactTerseEvent`) and the
 * `outputDetails` duplication is omitted; other payload fields keep their
 * structure with long strings truncated (`distillTerseValue`) — error bodies
 * keep a much larger budget. Pure + exported for unit testing.
 */

// Matches the default BITCODE_LLM_CALL_TIMEOUT_MS (AgentLLMsRegistry /
// ExecutionPipelineLLMRegistry, 180s) — past this many seconds with no new row, an
// in-flight LLM call should already have timed out server-side, so continued
// silence is a genuine-hang signal rather than a merely slow generation.

/**
 * Build the live "While {Depositing|Reading}, during {Phase}, {Agent} Agent is
 * {Step}... · Ns since last update" label for the processing indicator, from
 * the last known log line + the current tick. Pure + exported for unit
 * testing. Returns the bare fallback label when there is no prior line yet
 * (nothing streamed since the run started) or not enough context to describe.
 * The pipeline prefix uses the explicit `pipelineMode` when the page passed
 * one, else the mode latched from the stream onto the last line, else none.
 */

/**
 * Copy text to the clipboard, returning whether it succeeded. Tries the modern
 * `navigator.clipboard` (requires a secure context) and, when that is unavailable or
 * fails (e.g. `/deposits` loaded over plain http on a LAN IP), falls back to a hidden
 * textarea + `document.execCommand('copy')`. Pure + exported for unit testing.
 */

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
  liveContext,
  startedAtMs = null,
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
          className="flex h-7 w-7 items-center justify-center border border-white/10 bg-black/40 text-neutral-300 backdrop-blur-sm transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
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
          className="flex h-7 w-7 items-center justify-center border border-white/10 bg-black/40 text-neutral-300 backdrop-blur-sm transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
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
        {/* The log's own error banner (QA F19): errors render here, not in a
            separate pane, so the telemetry surface is the single place a run's
            terminal failure is visible. Dismiss clears it; Retry re-dispatches
            (the caller's onRetry — typically a fresh synthesis run). */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-start justify-between gap-3 border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs leading-5 text-rose-100"
          >
            <p className="min-w-0 flex-1 break-words">{error}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="border border-rose-200/35 px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/55 hover:bg-rose-300/10"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onDismissError}
                aria-label="Dismiss error"
                className="border border-rose-200/35 px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/55 hover:bg-rose-300/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {flatLines.length === 0 && !isProcessing && (
          <div className="text-center text-gray-400 py-8">No logs available</div>
        )}

        {/* Empty state placeholder when processing but no logs yet — styled
            exactly like a collapsed log row (same bar, no chevron: there is
            no detail payload to expand). */}
        {isProcessing && flatLines.length === 0 && (
          <div className="relative flex items-center gap-1 w-full pl-7 pr-3 py-2 min-h-[34px] mb-4 select-none text-[0.78rem] font-medium text-emerald-200 backdrop-blur-md bg-white/5 dark:bg-white/2 border-l-2 border-emerald-400/25">
            <span className="truncate min-w-0 text-[0.82rem] leading-none m-0 flex-1">Initializing</span>
            <span className="text-[10px] text-gray-500 flex-shrink-0 select-none ml-1">preparing</span>
          </div>
        )}

        {/* ---- Flat list view – each stream chunk renders as a single line ---- */}

        {flatLines.map((logLine, idx) => {
          // Elapsed from run start: explicit prop, else earliest line timestamp.
          let runStart = startedAtMs;
          if (runStart == null || !Number.isFinite(runStart)) {
            const firstTs = flatLines.find((l) => l.timestamp)?.timestamp;
            if (firstTs) {
              const ms = new Date(firstTs).getTime();
              runStart = Number.isFinite(ms) ? ms : null;
            }
          }
          return renderLogLine(
            logLine,
            `line-${idx}`,
            idx,
            idx > 0 ? flatLines[idx - 1].iteration : undefined,
            toggleLine,
            expandedLines,
            getLineClass as any,
            compact,
            pipelineMode,
            runStart,
          );
        })}

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
          const { label, likelyStalled } = buildProcessingStallLabel(lastLine as any, nowTick, pipelineMode);
          return <ProcessingIndicator label={label} stalled={likelyStalled} />;
        })()}
      </div>
    </div>
    </div>
  );
});

PipelineExecutionLog.displayName = 'PipelineExecutionLog';
