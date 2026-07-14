/**
 * Measurement primitives — vocabulary for measuring synthesized artifacts.
 *
 * Hierarchy naming law (full ancestry always encoded at product layers):
 *   Measurement                              — primitive vocabulary
 *   AbsolutesMeasurement / MeasureAgent      — base implementations
 *   NeedinessesMeasurement / MeasureAgent    — reader-relative base
 *   SynthesizeAssetPacksAbsolutesMeasureAgent — product + base + agent
 *
 * Measurement KINDS (V48): **absolutes** | **needinesses** (more kinds later).
 * AssetPack carrier (nested kinds object):
 *   measurements: { absolutes: Reading[], needinesses: Reading[] }
 *
 * A Measurement is a source-safe reading of properties of digital material.
 * Measure-agents produce MeasurementOutput; they do not synthesize artifacts.
 */

import { z } from 'zod';

/** Formal measurement kinds (V48 taxonomy). More kinds may be added later. */
export type MeasurementKindCategory = 'absolute' | 'neediness';

/** @deprecated Use MeasurementKindCategory — "category" was prior wording. */
export type MeasurementCategory = MeasurementKindCategory;

/**
 * One measurement requested of a measurer.
 * Absolutes: fixed product catalog. Needinesses: static reading catalog +
 * dynamic dimensions inferred for a Need; need-fit is a composite, not a raw row.
 */
export interface MeasurementSpec {
  measurementKind: string;
  label: string;
  unit: 'functions' | 'types' | 'files' | 'symbols' | 'modules' | 'estimate' | 'normalized' | string;
  guidance: string;
  /** When true the measurement carries a raw integer/quantity magnitude. */
  hasMagnitude?: boolean;
}

/**
 * One measure-agent reading (intermediate). volume required; magnitude optional
 * until host buildMeasurement normalizes product absolutes (always magnitude+volume).
 */
export const MeasurementReadingSchema = z.object({
  measurementKind: z.string().min(1),
  /** Raw count when present; host fills for product absolute rows. */
  magnitude: z.coerce.number().optional(),
  /** Normalized 0..1 — the value the weighted composite uses. */
  volume: z.coerce.number().min(0).max(1),
  /** Source-safe justification for the reading. */
  rationale: z.string().min(1).max(700).optional(),
});
export type MeasurementReading = z.infer<typeof MeasurementReadingSchema>;

/** Nested kinds object on AssetPacks (canonical carrier). */
export const AssetPackMeasurementsSchema = z.object({
  absolutes: z.array(MeasurementReadingSchema).default([]),
  needinesses: z.array(MeasurementReadingSchema).default([]),
});
export type AssetPackMeasurements = z.infer<typeof AssetPackMeasurementsSchema>;

/** Empty nested measurements bag (deposit starts with needinesses: []). */
export function emptyAssetPackMeasurements(): AssetPackMeasurements {
  return { absolutes: [], needinesses: [] };
}

/** Canonical measure-agent output shape (flat readings; host nests by kind). */
export const MeasurementOutputSchema = z.object({
  measurements: z.array(MeasurementReadingSchema).min(1),
  summary: z.string().min(1).max(700),
});
export type MeasurementOutput = z.infer<typeof MeasurementOutputSchema>;

/** @deprecated Use MeasurementOutputSchema */
export const MeasureAgentOutputSchema = MeasurementOutputSchema;
/** @deprecated Use MeasurementOutput */
export type MeasureAgentOutput = MeasurementOutput;
