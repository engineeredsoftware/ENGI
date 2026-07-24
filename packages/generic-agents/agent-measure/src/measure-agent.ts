/**
 * MeasureAgent — generic-agents PTRR base measurer.
 *
 * Location: packages/generic-agents/agent-measure (agent implementer).
 * Measurement primitives: @bitcode/measurement-generics.
 * Category bases (framing only):
 *   → AbsolutesMeasureAgent (generic-measurements/absolutes)
 *   → NeedinessesMeasureAgent (generic-measurements/needinesses)
 * Product:
 *   → SynthesizeAssetPacksAbsolutesMeasureAgent (generic-asset-packs/synthesis)
 *
 * Shared base is intentional: absolutes vs needinesses differ only by category,
 * framing, and neediness `-fit` validation — not by PTRR/prompt plumbing.
 *
 * Prompt identity: named raw PromptParts under @bitcode/prompts (measure_*).
 */

import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_AGENT_MEASURE_HONESTY_FOOTER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_honesty_footer';
import { PROMPTPART_GENERIC_AGENT_MEASURE_IDENTITY_CORE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_identity_core';
import { PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_PLAN } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_ptrr_plan';
import { PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_REFINE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_ptrr_refine';
import { PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_RETRY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_ptrr_retry';
import { PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_TRY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_ptrr_try';
import { PROMPTPART_GENERIC_AGENT_MEASURE_READING_CONTRACT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_reading_contract';
import { PROMPTPART_GENERIC_AGENT_MEASURE_SOURCE_SAFE_RULE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_measure_source_safe_rule';
import { factoryPTRRAgent } from '@bitcode/agent-generics/agents/factories';
import type { Agent } from '@bitcode/agent-generics/types';
import type {
  MeasurementKindCategory,
  MeasurementSpec,
  MeasurementOutput,
} from '@bitcode/measurement-generics';
import {
  MeasurementOutputSchema,
} from '@bitcode/measurement-generics';

export type {
  MeasurementKindCategory,
  MeasurementSpec,
  MeasurementReading,
  MeasurementOutput,
} from '@bitcode/measurement-generics';
export {
  MeasurementReadingSchema,
  MeasurementOutputSchema,
} from '@bitcode/measurement-generics';

const part = (content: string): PromptPart => content as PromptPart;

export interface MeasureAgentConfig {
  name: string;
  description?: string;
  /** What is being measured, e.g. "a synthesized source-safe DataPack patch". */
  subject: string;
  category: MeasurementKindCategory;
  /** The category-specific framing line(s) (what this category means). */
  categoryFraming: string;
  /** The measurements to read. */
  measurements: MeasurementSpec[];
  plan?: { chunkThreshold?: number };
  try?: { chunkThreshold?: number };
  refine?: { maxAttempts?: number };
  retry?: { maxAttempts?: number };
}

/** MeasureAgent: PTRR agent plus the specs/category it measures. */
export type MeasureAgent = Agent<any, MeasurementOutput> & {
  measurementSpecs: MeasurementSpec[];
  measurementCategory: MeasurementKindCategory;
  /** Registry-backed measure prompt (identity, requirements, ptrr:*). */
  measurePrompt: Prompt;
};

function buildMeasureIdentity(config: MeasureAgentConfig): PromptPart {
  return part(
    [
      String(PROMPTPART_GENERIC_AGENT_MEASURE_IDENTITY_CORE),
      `You MEASURE ${config.subject}.`,
      config.categoryFraming,
      'Emit exactly one reading per requested measurement, each with a short source-safe rationale.',
      String(PROMPTPART_GENERIC_AGENT_MEASURE_SOURCE_SAFE_RULE),
    ].join(' '),
  );
}

function buildMeasureRequirements(config: MeasureAgentConfig): PromptPart {
  const lines: string[] = [
    `Measure the ${config.category} measurements below over the artifact you are given.`,
    String(PROMPTPART_GENERIC_AGENT_MEASURE_READING_CONTRACT),
    'The measurements:',
    ...config.measurements.map(
      (spec) => `  ${spec.measurementKind} [${spec.unit}]: ${spec.guidance}`,
    ),
    String(PROMPTPART_GENERIC_AGENT_MEASURE_HONESTY_FOOTER),
  ];
  return part(lines.join('\n'));
}

/**
 * createMeasurePrompt — compose named measure PromptParts + dynamic catalog lines.
 * Product agents normally go through factoryMeasureAgent; this is the pure prompt surface.
 */
export function createMeasurePrompt(config: MeasureAgentConfig): Prompt {
  if (!config.measurements || config.measurements.length === 0) {
    throw new Error('createMeasurePrompt requires at least one measurement spec.');
  }
  const prompt = new Prompt();
  prompt.set('agent:identity', buildMeasureIdentity(config));
  prompt.set('agent:requirements', buildMeasureRequirements(config));
  prompt.set('ptrr:plan', PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_PLAN);
  prompt.set('ptrr:try', PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_TRY);
  prompt.set('ptrr:refine', PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_REFINE);
  prompt.set('ptrr:retry', PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

/**
 * factoryMeasureAgent — base MeasureAgent factory. Higher bases
 * (factoryAbsolutesMeasureAgent, …) call this with category framing;
 * product measurers call those with their catalogs.
 */
export function factoryMeasureAgent(config: MeasureAgentConfig): MeasureAgent {
  if (!config.measurements || config.measurements.length === 0) {
    throw new Error('factoryMeasureAgent requires at least one measurement spec.');
  }
  const prompt = createMeasurePrompt(config);
  const agent = factoryPTRRAgent<any, MeasurementOutput>({
    name: config.name,
    description:
      config.description ??
      `Measures the ${config.category} measurements of ${config.subject}.`,
    outputSchema: MeasurementOutputSchema as z.ZodType<MeasurementOutput>,
    // Quantity tools stay host-side (merge-authoritative). Quality judges over descriptors.
    tools: [],
    prompt,
    stepPrompts: {
      plan: () => prompt,
      try: () => prompt,
      refine: () => prompt,
      retry: () => prompt,
    },
    plan: { chunkThreshold: config.plan?.chunkThreshold ?? 2000 },
    try: { chunkThreshold: config.try?.chunkThreshold ?? 4000 },
    refine: { maxAttempts: config.refine?.maxAttempts ?? 2 },
    retry: { maxAttempts: config.retry?.maxAttempts ?? 1 },
  });
  return Object.assign(agent, {
    measurementSpecs: config.measurements,
    measurementCategory: config.category,
    measurePrompt: prompt,
  }) as MeasureAgent;
}
