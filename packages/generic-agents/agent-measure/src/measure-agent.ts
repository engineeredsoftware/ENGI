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
 */

import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
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
  /** What is being measured, e.g. "a synthesized source-safe AssetPack patch". */
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
    `You are a MEASURE agent. You MEASURE ${config.subject} — an ALREADY-synthesized ` +
      'artifact. You do NOT synthesize, author, alter, or re-create it; you read its ' +
      `properties and report honest measurements. ${config.categoryFraming} Emit exactly ` +
      'one reading per requested measurement, each with a short source-safe rationale. ' +
      'Be source-safe: reason over the provided source-safe descriptor and metadata, ' +
      'never quote raw source, code, secrets, or file contents.',
  );
}

function buildMeasureRequirements(config: MeasureAgentConfig): PromptPart {
  const lines: string[] = [
    `Measure the ${config.category} measurements below over the artifact you are given.`,
    'Return one reading per measurement, each with:',
    '- measurementKind: EXACTLY the key named below.',
    '- volume: a normalized 0..1 reading (the comparable measure).',
    '- magnitude: for COUNT units (functions, types, files) the raw integer count;',
    '  omit magnitude for estimate / normalized units (volume carries the measure).',
    '- rationale: a short, source-safe justification.',
    'The measurements:',
    ...config.measurements.map(
      (spec) => `  ${spec.measurementKind} [${spec.unit}]: ${spec.guidance}`,
    ),
    'Measure honestly — an empty or trivial artifact reads low; do not inflate.',
    'summary: at most 700 characters (one short paragraph).',
    'rationale: at most 700 characters each; prefer one sentence.',
    'Return ONLY {"measurements":[ ... ],"summary":string}.',
  ];
  return part(lines.join('\n'));
}

const MEASURE_PLAN = part(
  'Plan: identify, from the source-safe descriptor, the signal that grounds each ' +
    'requested measurement (no raw source required).',
);
const MEASURE_TRY = part(
  'Try: read each measurement — a normalized 0..1 volume (and a raw magnitude for ' +
    'count units) with a source-safe rationale.',
);
const MEASURE_REFINE = part(
  'Refine: ensure every requested measurement has exactly one honest reading, units ' +
    'are respected (counts carry a magnitude), and no rationale leaks raw source.',
);
const MEASURE_RETRY = part(
  'Retry: emit a minimal honest reading for any missing measurement rather than ' +
    'failing the measurement.',
);

/**
 * createMeasurePrompt — build the measure Prompt registry (testable / proof-bound later).
 * Product agents normally go through factoryMeasureAgent; this is the pure prompt surface.
 */
export function createMeasurePrompt(config: MeasureAgentConfig): Prompt {
  if (!config.measurements || config.measurements.length === 0) {
    throw new Error('createMeasurePrompt requires at least one measurement spec.');
  }
  const prompt = new Prompt();
  prompt.set('agent:identity', buildMeasureIdentity(config));
  prompt.set('agent:requirements', buildMeasureRequirements(config));
  prompt.set('ptrr:plan', MEASURE_PLAN);
  prompt.set('ptrr:try', MEASURE_TRY);
  prompt.set('ptrr:refine', MEASURE_REFINE);
  prompt.set('ptrr:retry', MEASURE_RETRY);
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
    // Zod preprocess widens _input; factory expects output-shaped ZodType.
    outputSchema: MeasurementOutputSchema as z.ZodType<MeasurementOutput>,
    // Quantity/verification tools stay host-side today (merge-authoritative).
    // Quality judges over source-safe descriptors only — tools: [] until tool surface lands.
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
