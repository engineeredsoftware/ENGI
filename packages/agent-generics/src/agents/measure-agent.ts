/**
 * measure-agent — the generic-agents base measurer (V48 Gate 3).
 *
 * The formal PTRR base for MEASUREMENT. A measure-agent does not synthesize,
 * alter, or re-create an artifact — it MEASURES an already-synthesized one,
 * emitting one honest reading per requested measurement with a source-safe
 * rationale. It is the base of the measurement hierarchy:
 *
 *   measure-agent                      (this file — the PTRR base)
 *     └─ measure-agent-absolutes       (absolutes-category framing)
 *     └─ measure-agent-needinesses     (needinesses-category framing; Gate 4)
 *          └─ agent-measure-absolutes / agent-measure-needinesses
 *             (asset-pack concrete measurers, lens-aware)
 *
 * The hierarchy is realized as LAYERED FACTORIES (the codebase idiom): each
 * "base" is a factory that configures the more general factory, bottoming out in
 * factoryAgentWithPTRR. There is no class inheritance.
 *
 * Source-safety: a measurer reasons over the SOURCE-SAFE descriptor of an
 * artifact (metadata, a patch descriptor, a comprehension) — never raw source,
 * code, secrets, or file contents — and its readings are scalars + a source-safe
 * rationale. Telemetry withholds content universally (sourceSafeStreamEvent).
 */

import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { factoryAgentWithPTRR } from './factories';
import type { Agent } from '../types';

const part = (content: string): PromptPart => content as PromptPart;

/** The two formal measurement categories (V48 measurement taxonomy). */
export type MeasurementCategory = 'absolute' | 'neediness';

/**
 * One measurement the measure-agent is asked to read. `unit` declares the
 * reading's nature: a count unit (`functions` | `types` | `files`) expects a raw
 * `magnitude` alongside the normalized `volume`; `estimate` / `normalized`
 * carry the measure in `volume` alone.
 */
export interface MeasurementSpec {
  measurementKind: string;
  label: string;
  unit: 'functions' | 'types' | 'files' | 'estimate' | 'normalized' | string;
  guidance: string;
  /** When true the measurement carries a raw integer/quantity magnitude. */
  hasMagnitude?: boolean;
}

/** One reading the measure-agent returns for a requested measurement. */
export const MeasurementReadingSchema = z.object({
  measurementKind: z.string().min(1),
  /** Raw count/quantity for sizes; omitted for normalized/estimate measures. */
  magnitude: z.coerce.number().optional(),
  /** Normalized 0..1 — the value the weighted composite uses. */
  volume: z.coerce.number().min(0).max(1),
  /** Source-safe justification for the reading. */
  rationale: z.string().min(1).max(700),
});
export type MeasurementReading = z.infer<typeof MeasurementReadingSchema>;

export const MeasureAgentOutputSchema = z.object({
  measurements: z.array(MeasurementReadingSchema).min(1),
  summary: z.string().min(1).max(700),
});
export type MeasureAgentOutput = z.infer<typeof MeasureAgentOutputSchema>;

export interface MeasureAgentConfig {
  name: string;
  description?: string;
  /** What is being measured, e.g. "a synthesized source-safe AssetPack patch". */
  subject: string;
  category: MeasurementCategory;
  /** The category-specific framing line(s) (what this category means). */
  categoryFraming: string;
  /** The measurements to read. */
  measurements: MeasurementSpec[];
  plan?: { chunkThreshold?: number };
  try?: { chunkThreshold?: number };
  refine?: { maxAttempts?: number };
  retry?: { maxAttempts?: number };
}

/** A measure-agent: a PTRR agent plus the specs/category it measures. */
export type MeasureAgent = Agent<any, MeasureAgentOutput> & {
  measurementSpecs: MeasurementSpec[];
  measurementCategory: MeasurementCategory;
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

function createMeasurePrompt(config: MeasureAgentConfig): Prompt {
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
 * factoryMeasureAgent — the base of the measure-agent hierarchy. Builds a PTRR
 * measurement agent from a category + a set of measurement specs. Higher bases
 * (factoryMeasureAgentAbsolutes, …) call this with their category framing; the
 * asset-pack concrete measurers call those with their catalog.
 */
export function factoryMeasureAgent(config: MeasureAgentConfig): MeasureAgent {
  if (!config.measurements || config.measurements.length === 0) {
    throw new Error('factoryMeasureAgent requires at least one measurement spec.');
  }
  const prompt = createMeasurePrompt(config);
  const agent = factoryAgentWithPTRR<any, MeasureAgentOutput>({
    name: config.name,
    description:
      config.description ??
      `Measures the ${config.category} measurements of ${config.subject}.`,
    outputSchema: MeasureAgentOutputSchema,
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
  }) as MeasureAgent;
}
