import React from 'react';

import { ExecutionPhase, ExecutionStep, FailsafeStep, GenerationStep } from '@bitcode/streams';
import { normalizeStepName } from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';
import styles from './pipeline-execution-log-header.module.css';

interface PipelineRunLogHeaderProps {
  isProcessing: boolean;
  executionState: {
    phase?: ExecutionPhase;
    agent?: string;
    step?: ExecutionStep;
    failsafe?: FailsafeStep;
    generation?: GenerationStep;
    tool?: string | { name?: string };
    pipeline?: string;
    phaseId?: string;
    agentId?: string;
    ptrrStepId?: string;
    ptrrStepName?: string;
    thinkingsGenerationId?: string;
    promptTemplateId?: string;
    outputSchema?: string;
    returnType?: string;
    eventId?: string;
    proofRoot?: string;
    redactionPosture?: string;
    promptDisclosurePosture?: string;
    resultDisclosurePosture?: string;
    failClosedState?: string;
  };
  isStreamingComplete: boolean;
  generationCount: number;
  error: string | null;
  runId?: string;
  metadataRows?: Array<{ label: string; value: string }>;
  onOpenDetails?: (runId: string) => void;
  onNavigateToExecution?: (runId: string) => void;
  onClose?: () => void;
}

export function PipelineExecutionLogHeader({
  isProcessing,
  executionState,
  isStreamingComplete,
  generationCount,
  error,
  runId,
  metadataRows = [],
  onOpenDetails,
  onNavigateToExecution,
  onClose
}: PipelineRunLogHeaderProps) {
  const { phase, agent, step } = executionState || {};
  const failsafe = executionState?.failsafe;
  const generation = executionState?.generation;
  const tool = executionState?.tool;
  const toolLabel = typeof tool === 'string' ? tool : tool?.name || '';
  const pipelineLabel = executionState?.pipeline;
  const ptrrStepLabel = executionState?.ptrrStepId || executionState?.ptrrStepName;
  const schemaLabel = executionState?.outputSchema || executionState?.returnType;

  const formatMeta = (m?: FailsafeStep | string) => {
    const v = String(m || '');
    switch (v) {
      case 'prepare_concise_context': return 'Prepare Context';
      case 'prepare-concise-context': return 'Prepare Context';
      case 'chunk_then_sum': return 'Chunk Then Sum';
      case 'chunk-then-sum': return 'Chunk Then Sum';
      case 'stitch_until_complete': return 'Stitch Until Complete';
      case 'stitch-until-complete': return 'Stitch Until Complete';
      default: return v || 'Meta NA';
    }
  };
  const compactIdentifier = (value?: string, segments = 3) => {
    const parts = String(value || '').split('.').filter(Boolean);
    return parts.length > segments ? parts.slice(-segments).join('.') : parts.join('.') || '';
  };
  const headerMetadataRows = [
    pipelineLabel ? { label: 'pipeline', value: pipelineLabel } : null,
    executionState?.phaseId ? { label: 'phase id', value: compactIdentifier(executionState.phaseId, 2) } : null,
    executionState?.agentId ? { label: 'PTRR agent', value: compactIdentifier(executionState.agentId, 3) } : null,
    ptrrStepLabel ? { label: 'PTRR step', value: compactIdentifier(String(ptrrStepLabel), 3) } : null,
    schemaLabel ? { label: 'schema', value: String(schemaLabel) } : null,
    executionState?.eventId ? { label: 'event', value: compactIdentifier(String(executionState.eventId), 2) } : null,
    executionState?.proofRoot ? { label: 'proof', value: compactIdentifier(String(executionState.proofRoot), 2) } : null,
    executionState?.redactionPosture ? { label: 'redaction', value: String(executionState.redactionPosture) } : null,
    executionState?.promptDisclosurePosture ? { label: 'prompt', value: String(executionState.promptDisclosurePosture) } : null,
    executionState?.resultDisclosurePosture ? { label: 'result', value: String(executionState.resultDisclosurePosture) } : null,
    executionState?.failClosedState ? { label: 'fail closed', value: String(executionState.failClosedState) } : null,
    ...metadataRows,
  ].filter((row): row is { label: string; value: string } => Boolean(row?.value));

  return (
    <div className="relative px-4 py-3 border-b border-[#1f2937] flex flex-wrap items-center justify-between backdrop-blur-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-sky-500/2 to-transparent opacity-30" />

      <div className="flex flex-col space-y-1 flex-grow relative min-w-0">
        <div className="flex items-center space-x-2">
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="absolute w-3 h-3 bg-emerald-400/20 animate-ping" />
              <div className="relative w-2 h-2 bg-emerald-400 animate-pulse-slow" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            {/* Phase - Primary Information */}
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-100 tracking-wide font-mono truncate">
                {phase || "Processing"}
              </h3>
            </div>

            {/* Agent - Secondary Information */}
            <div className="flex items-center flex-wrap gap-1.5 mt-1">
              <span className="text-xs font-medium bg-sky-400/10 text-sky-400 px-2 py-0.5 whitespace-nowrap">
                {agent || "Non Agent"}
              </span>
              {pipelineLabel && (
                <span className="text-xs font-medium bg-violet-400/10 text-violet-300 px-2 py-0.5 whitespace-nowrap">
                  {pipelineLabel}
                </span>
              )}

              {/* Show current step if available and different from agent name */}
              {step && step !== agent && (
                <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 whitespace-nowrap">
                  {normalizeStepName(step)}
                </span>
              )}
            </div>

            {/* Execution Flow - Tertiary Information */}
            <div className={`flex items-center mt-2 overflow-x-auto pb-1 ${styles.hideScrollbar}`}>
              <div className="flex items-center space-x-1 text-xs whitespace-nowrap">
                {/* Failsafe */}
                <span className="px-1.5 py-0.5 bg-gray-800/70 text-gray-300 border border-gray-700/50 text-[0.65rem]">
                  {formatMeta(failsafe)}
                </span>

                <svg className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                {/* Step */}
                <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 font-medium border border-gray-700/50 text-[0.65rem]">
                  {step ? normalizeStepName(step) : "Step NA"}
                </span>

                <svg className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                {/* Generation */}
                <span className="px-1.5 py-0.5 bg-gray-800/30 text-gray-400 border border-gray-700/20 text-[0.65rem]">
                  {generation || "Gen NA"}
                </span>

                {toolLabel ? (
                  <>
                    <svg className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="max-w-[12rem] truncate px-1.5 py-0.5 bg-purple-500/10 text-purple-200 border border-purple-400/20 text-[0.65rem]">
                      {toolLabel}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {headerMetadataRows.length ? (
              <dl className={`mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 ${styles.hideScrollbar}`}>
                {headerMetadataRows.map((row) => (
                  <div
                    key={`${row.label}:${row.value}`}
                    className="flex min-w-0 items-center gap-1 border border-gray-700/50 bg-gray-900/70 px-1.5 py-0.5 text-[0.62rem]"
                  >
                    <dt className="shrink-0 uppercase tracking-[0.12em] text-gray-500">{row.label}</dt>
                    <dd className="max-w-[11rem] truncate font-mono text-gray-300">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right Side: LLM Calls Counter + Status */}
      <div className="flex items-center flex-wrap gap-2 mt-2 tablet:mt-0">
        {/* Model Calls Counter */}
        {isProcessing && (
          <div className="relative flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-400/20 shadow-inner">
            {/* subtle glow */}
            <span className="absolute inset-0 bg-emerald-500/20 blur-md animate-pulse-slow" />
            <span className="relative text-xs font-semibold text-emerald-300 font-mono">
              {generationCount.toString().padStart(2, '0')}
            </span>
            <span className="relative text-xs text-emerald-200">AI</span>
          </div>
        )}

        {/* Status Indicator */}
        {isStreamingComplete && !error ? (
          <div className="flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
            <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">Complete</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-1 bg-red-500/10 px-2 py-0.5 border border-red-500/20">
            <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs text-red-400 font-medium whitespace-nowrap">Error</span>
          </div>
        ) : null}

        {(runId && (onOpenDetails || onNavigateToExecution)) && (
          <div className="flex items-center gap-1">
            {onOpenDetails && (
              <button
                type="button"
                onClick={() => onOpenDetails(runId)}
                className="px-2 py-0.5 text-xs border border-emerald-400/30 text-emerald-200 hover:bg-emerald-900/30 transition"
              >
                View Details
              </button>
            )}
            {onNavigateToExecution && (
              <button
                type="button"
                onClick={() => onNavigateToExecution(runId)}
                className="px-2 py-0.5 text-xs border border-sky-400/30 text-sky-200 hover:bg-sky-900/20 transition"
              >
                Open Page
              </button>
            )}
          </div>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 text-xs border border-gray-600/40 text-gray-200 hover:bg-gray-900/40 transition"
            aria-label="Close execution log"
          >
            Close
          </button>
        )}
      </div>
      
      {/* Styles moved to CSS Module */}
    </div>
  );
}
