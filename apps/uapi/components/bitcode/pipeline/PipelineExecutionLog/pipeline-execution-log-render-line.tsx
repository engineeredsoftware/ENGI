'use client';

/**
 * Pure-ish log line renderer for PipelineExecutionLog (SRP: row presentation).
 */

import React from 'react';
import {
  CheckCircledIcon,
  CheckIcon,
  ClipboardCopyIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ChevronRightIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import {
  RobotIcon,
  WrenchIcon,
  ThoughtBubbleIcon,
} from './pipeline-execution-log-icons';
import { PathPill } from '@/components/bitcode/pipeline/PathPill/PathPill';
import { ExecutionContextPillRow, buildFailsafePillLabel } from '@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow';
import { TelemetryExplainerTrigger } from '@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger';
import { getTelemetryPillExplainer, getTelemetryRowIconExplainer } from '@/components/bitcode/pipeline/TelemetryPillExplainers/telemetry-pill-explainers';
import {
  normalizePhaseName,
  normalizeStepName,
  type SynthesisPipelineMode,
} from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';
import { buildStepViewModel } from '@/components/bitcode/pipeline/utilities/execution-step-viewmodel';
import FileDiffViewer from '@/components/bitcode/pipeline/FileDiffViewer/FileDiffViewer';
import { DetailsCopyButton } from './pipeline-execution-log-details-copy-button';
import { ContentVisibility } from '@/components/bitcode/perf/ContentVisibility/ContentVisibility';

// Structural log line type owned by the pipeline log UI.
export type LogLine = Record<string, any>;

export function formatTime(ts?: string) {
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


// ---------------------------------------------------------------------------
// Visual style mapping per canonical stream `type`
// ---------------------------------------------------------------------------

export const TYPE_STYLES: Record<
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

// Helper function to render a log line
export function renderLogLine(
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
        className={`relative flex items-center gap-1 w-full pl-7 pr-3 py-2 min-h-[34px] mb-4 last:mb-0 select-none text-[0.78rem] font-medium ${style.text} backdrop-blur-md bg-white/5 dark:bg-white/2 hover:bg-white/10 dark:hover:bg-white/10 transition-colors duration-200 border-l-2 ${style.border}`}
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
            className={`flex items-center justify-center ${style.text} shadow-lg backdrop-blur-sm`}
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
          <div className="pl-6 pr-4 py-3 ml-4 border-l border-emerald-500/20 bg-emerald-500/[0.02] text-gray-400/90 text-[11px] space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
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
          relative flex flex-col tablet:flex-row items-start tablet:items-center gap-2 tablet:gap-4 w-full px-3 tablet:px-4 desktop:px-5 py-2 tablet:py-3 laptop:py-4 cursor-pointer select-none text-xs tablet:text-sm desktop:text-base font-medium
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
              className={`flex items-center justify-center ${style.text} shadow-md`}
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
        <div className="pl-6 pr-4 py-3 ml-4 border-l border-emerald-500/20 bg-emerald-500/[0.02] text-gray-400/90">
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
                              className="flex items-center space-x-2 px-3 py-1.5 bg-[#1f2937]/30 border border-[#1f2937] group/file hover:border-[#67feb7]/30 transition-all duration-200"
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

