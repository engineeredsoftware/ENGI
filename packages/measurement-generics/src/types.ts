/**
 * Measurement primitives — vocabulary for measuring synthesized DataPacks.
 *
 * Hierarchy naming law (full ancestry always encoded at product layers):
 *   Measurement                              — primitive vocabulary
 *   AbsolutesMeasurement / MeasureAgent      — base implementations
 *   NeedinessesMeasurement / MeasureAgent    — reader-relative base
 *   MaterialIdentity (domain)                — multi-valued buyer-visible identity
 *   SynthesizeAssetPacksAbsolutesMeasureAgent — product + base + agent
 *
 * Measurement KINDS (V48+): **absolutes** | **needinesses** | **materialIdentity**.
 * DataPack carrier (nested kinds object):
 *   measurements: {
 *     absolutes: Reading[],
 *     needinesses: Reading[],          // deposit always []
 *     materialIdentity?: bag           // compositions / inventories / tags (domain-typed)
 *   }
 *
 * A Measurement is a source-safe reading of properties of digital material.
 * Measure-agents produce MeasurementOutput; they do not synthesize artifacts.
 * Typed materialIdentity lives in
 * `@bitcode/generic-measurements-domain-data-pack-material-identity` —
 * this primitive only admits the optional bag on the carrier.
 */

import { z } from 'zod';

/** Formal measurement kinds (V48 taxonomy). More kinds may be added later. */
export type MeasurementKindCategory = 'absolute' | 'neediness' | 'material-identity';

/**
 * One measurement requested of a measurer.
 * Absolutes: fixed product catalog. Needinesses: static reading catalog +
 * dynamic dimensions inferred for a Need; need-fit is a composite, not a raw row.
 */
export interface MeasurementSpec {
  measurementKind: string;
  label: string;
  unit:
    | 'functions'
    | 'types'
    | 'files'
    | 'symbols'
    | 'modules'
    | 'languages'
    | 'tests'
    | 'exports'
    | 'estimate'
    | 'normalized'
    | string;
  guidance: string;
  /** When true the measurement carries a raw integer/quantity magnitude. */
  hasMagnitude?: boolean;
}

/** Soft-trim free text so LLM verbose rationales/summaries still parse. */
function clampMeasurementText(value: unknown, max = 700): string {
  const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  if (!text) return text;
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
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
  rationale: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') return undefined;
      const clamped = clampMeasurementText(value, 700);
      return clamped.length > 0 ? clamped : undefined;
    },
    z.string().min(1).max(700).optional(),
  ),
});
export type MeasurementReading = z.infer<typeof MeasurementReadingSchema>;

/**
 * Honesty for one absolute row on the product carrier.
 * expanded-fill = catalogue completeness only (not a measured zero).
 */
export type AbsoluteReadingStatus =
  | 'measured'
  | 'estimated'
  | 'insufficient_evidence'
  | 'expanded-fill'
  | 'not_run'
  | 'not_implemented';

/**
 * Product-visible measure telemetry (deposit review / Exchange honesty strip).
 * Not a substitute for absolute rows — explains how the bag was produced.
 */
export type DataPackMeasureReport = {
  measuredFromBodies: number;
  coveredPathCount: number;
  bodyCoverageRatio: number;
  expandedFillCount: number;
  mode: 'deep' | 'thin' | 'path-only';
  toolInvocations?: number;
  /** Kinds with status measured | estimated (not fill / not_run). */
  measuredKindCount?: number;
};

export const DataPackMeasureReportSchema = z.object({
  measuredFromBodies: z.number().int().min(0),
  coveredPathCount: z.number().int().min(0),
  bodyCoverageRatio: z.number().min(0).max(1),
  expandedFillCount: z.number().int().min(0),
  mode: z.enum(['deep', 'thin', 'path-only']),
  toolInvocations: z.number().int().min(0).optional(),
  measuredKindCount: z.number().int().min(0).optional(),
});

/**
 * Nested kinds object on DataPacks (canonical carrier).
 * materialIdentity is domain-typed at product layers; primitive keeps it open.
 */
export const AssetPackMeasurementsSchema = z.object({
  absolutes: z.array(MeasurementReadingSchema).default([]),
  needinesses: z.array(MeasurementReadingSchema).default([]),
  /** Buyer-visible multi-valued identity (compositions, inventories, tags). */
  materialIdentity: z.record(z.unknown()).optional().nullable(),
  /** Measure-session honesty telemetry (bodies, coverage, fill count). */
  measureReport: DataPackMeasureReportSchema.optional().nullable(),
});
export type AssetPackMeasurements = z.infer<typeof AssetPackMeasurementsSchema>;

/** Empty nested measurements bag (deposit starts with needinesses: []). */
export function emptyAssetPackMeasurements(): AssetPackMeasurements {
  return { absolutes: [], needinesses: [], materialIdentity: null };
}

/** Canonical measure-agent output shape (flat readings; host nests by kind). */
export const MeasurementOutputSchema = z.object({
  measurements: z.array(MeasurementReadingSchema).min(1),
  summary: z.preprocess(
    (value) => clampMeasurementText(value, 700),
    z.string().min(1).max(700),
  ),
});
export type MeasurementOutput = z.infer<typeof MeasurementOutputSchema>;
