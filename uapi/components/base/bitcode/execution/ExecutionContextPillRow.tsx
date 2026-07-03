'use client';

import React from 'react';

import { PathPill, type PillType } from './PathPill';
import { TelemetryExplainerTrigger } from './TelemetryExplainerTrigger';
import { getTelemetryPillExplainer } from './telemetry-pill-explainers';
import {
  formatAgentPillName,
  formatFailsafeName,
  formatGenerationName,
  normalizePhaseName,
  normalizeStepName,
  type SynthesisPipelineMode,
} from './execution-telemetry-format';

export interface ExecutionContextPillRowProps {
  phase?: string | null;
  agent?: string | null;
  step?: string | null;
  failsafe?: string | null;
  generation?: string | null;
  tool?: string | null;
  /** Failsafe-repair markers rendered as pill badges ('… · stitch ×N'). */
  stitchIteration?: number;
  chunkIndex?: number;
  chunkSum?: boolean;
  /** Pipeline mode, when known — sharpens the phase tooltip copy. */
  mode?: SynthesisPipelineMode | string | null;
  className?: string;
}

/**
 * Badge real failsafe-handling work on the pill label with one shared ×N
 * pattern: CS counts chunks ('chunk ×N' = the Nth chunk task generation,
 * 'sum' the combining generation), SC counts stitches ('stitch ×N' = the Nth
 * repair). Absent markers = the non-triggering path.
 */
export function buildFailsafePillLabel(args: {
  failsafe: string;
  stitchIteration?: number;
  chunkIndex?: number;
  chunkSum?: boolean;
}): string {
  let label = formatFailsafeName(args.failsafe);
  if (typeof args.stitchIteration === 'number' && args.stitchIteration > 0) {
    label = `${label} · stitch ×${args.stitchIteration}`;
  } else if (args.chunkSum) {
    label = `${label} · sum`;
  } else if (typeof args.chunkIndex === 'number') {
    label = `${label} · chunk ×${args.chunkIndex}`;
  }
  return label;
}

/**
 * ONE inline, wrapping row of call-chain pills in canonical order — phase,
 * agent, step, failsafe, generation (+ tool) — each wrapped as a rich-tooltip
 * trigger. Used by the log title-lines and by /deposit's live header tracker
 * so the call chain always reads identically.
 */
export function ExecutionContextPillRow({
  phase,
  agent,
  step,
  failsafe,
  generation,
  tool,
  stitchIteration,
  chunkIndex,
  chunkSum,
  mode,
  className = '',
}: ExecutionContextPillRowProps) {
  const pills: { type: PillType; label: string; raw: string }[] = [];
  if (phase) pills.push({ type: 'phase', label: normalizePhaseName(phase) || phase, raw: phase });
  if (agent) pills.push({ type: 'agent', label: formatAgentPillName(agent), raw: agent });
  if (step) pills.push({ type: 'step', label: normalizeStepName(step), raw: step });
  if (failsafe) {
    pills.push({
      type: 'failsafe',
      label: buildFailsafePillLabel({ failsafe, stitchIteration, chunkIndex, chunkSum }),
      raw: failsafe,
    });
  }
  if (generation) pills.push({ type: 'generation', label: formatGenerationName(generation), raw: generation });
  if (tool) pills.push({ type: 'tool', label: tool, raw: tool });

  if (pills.length === 0) return null;

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-1 ${className}`}>
      {pills.map((pill) => (
        <TelemetryExplainerTrigger
          key={pill.type}
          explainer={getTelemetryPillExplainer(pill.type, pill.raw, mode, { agent, step })}
        >
          <PathPill type={pill.type} label={pill.label} />
        </TelemetryExplainerTrigger>
      ))}
    </div>
  );
}
