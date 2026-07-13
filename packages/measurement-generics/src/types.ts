/**
 * Measurement primitives — vocabulary for measuring synthesized artifacts.
 *
 * Hierarchy naming law (full ancestry always encoded at product layers):
 *   Measurement                              — primitive vocabulary
 *   AbsolutesMeasurement / MeasureAgent      — base implementations
 *   SynthesizeAssetPacksAbsolutesMeasureAgent — product + base + agent
 *
 * A Measurement is a source-safe reading of properties of digital material.
 * Measure-agents produce MeasurementOutput; they do not synthesize artifacts.
 */

import { z } from 'zod';

/** Formal measurement categories (V48 taxonomy). */
export type MeasurementCategory = 'absolute' | 'neediness';

/**
 * One measurement requested of a measurer.
 * `unit` declares nature: count units expect `magnitude` + normalized `volume`;
 * estimate/normalized units carry the measure in `volume` alone.
 */
export interface MeasurementSpec {
  measurementKind: string;
  label: string;
  unit: 'functions' | 'types' | 'files' | 'estimate' | 'normalized' | string;
  guidance: string;
  /** When true the measurement carries a raw integer/quantity magnitude. */
  hasMagnitude?: boolean;
}

/** One reading returned for a requested measurement. */
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

/** Canonical measure-agent output shape. */
export const MeasurementOutputSchema = z.object({
  measurements: z.array(MeasurementReadingSchema).min(1),
  summary: z.string().min(1).max(700),
});
export type MeasurementOutput = z.infer<typeof MeasurementOutputSchema>;

/** @deprecated Use MeasurementOutputSchema */
export const MeasureAgentOutputSchema = MeasurementOutputSchema;
/** @deprecated Use MeasurementOutput */
export type MeasureAgentOutput = MeasurementOutput;
