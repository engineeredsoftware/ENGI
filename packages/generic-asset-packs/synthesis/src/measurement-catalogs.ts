/**
 * SynthesizeAssetPacks catalogs.
 *
 * **Absolutes (law):** `ASSET_PACK_ABSOLUTES_CATALOG` — intrinsic material properties;
 * host/tools measure; weights sum to 1.
 *
 * **Synthesis policy (not measurements):** optional depositor/reader guidance rows used
 * only for synthesis *prompts* / commercial steering language — never as
 * `measurements.absolutes[]` volumes. LLMs must not invent absolute volumes.
 */

import type {
  AssetPackAbsoluteSpec,
  AssetPackMeasurementSpec,
  SynthesizeAssetPacksMode,
} from './types';

/**
 * Deposit synthesis **policy** rows (steering language only — not absolute KINDs).
 * Host attaches real absolutes via the measure stack.
 */
export const DEPOSIT_SYNTHESIS_POLICY_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.36,
    guidance:
      'Policy (not a measured absolute): prefer packs that cover meaningful knowledge in the inventory.',
  },
  {
    measurementKind: 'demand-alignment',
    label: 'Demand alignment',
    weight: 0.4,
    guidance:
      'Policy (not a measured absolute): prefer packs aligned with depositor steering / demand context.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.24,
    guidance:
      'Policy (not a measured absolute): prefer packs reusable outside this repository.',
  },
];

/**
 * Read synthesis **policy** rows (steering language only — not neediness volumes).
 * Needinesses are measured on the read path under `measurements.needinesses`.
 */
export const READ_SYNTHESIS_POLICY_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'need-fit',
    label: 'Need fit',
    weight: 0.44,
    guidance:
      'Policy (not an absolute): prefer packs that appear to fit the reviewed Need (host measures needinesses later).',
  },
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.28,
    guidance:
      'Policy (not a measured absolute): prefer packs covering Need-relevant source knowledge.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.28,
    guidance:
      'Policy (not a measured absolute): prefer packs reusable in the buyer context.',
  },
];

/** Resolve synthesis policy catalog by product mode (not absolute measurement law). */
export function synthesisPolicyCatalogForMode(
  mode: SynthesizeAssetPacksMode,
): AssetPackMeasurementSpec[] {
  return mode === 'read' ? READ_SYNTHESIS_POLICY_CATALOG : DEPOSIT_SYNTHESIS_POLICY_CATALOG;
}

/** @deprecated Use DEPOSIT_SYNTHESIS_POLICY_CATALOG — not absolute measurements. */
export const DEPOSIT_MEASUREMENT_CATALOG = DEPOSIT_SYNTHESIS_POLICY_CATALOG;
/** @deprecated Use READ_SYNTHESIS_POLICY_CATALOG — not absolute measurements. */
export const READ_MEASUREMENT_CATALOG = READ_SYNTHESIS_POLICY_CATALOG;
/** @deprecated Use synthesisPolicyCatalogForMode — not absolute measurements. */
export function measurementCatalogForLens(
  lens: SynthesizeAssetPacksMode,
): AssetPackMeasurementSpec[] {
  return synthesisPolicyCatalogForMode(lens);
}

/**
 * ABSOLUTES measurement KIND catalog (intrinsic digital-material properties).
 *
 * Quantity — tool-authoritative. Quality — measure-agent grounded judgment.
 * Weights sum to 1. Shared for deposit and read absolute readings.
 * P1 structure: lang-span, test-surface, api-surface (2026-07).
 */
export const ASSET_PACK_ABSOLUTES_CATALOG: AssetPackAbsoluteSpec[] = [
  // —— Quantity (tool-authoritative) — weight mass ≈ 0.55 ——
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    hasMagnitude: true,
    weight: 0.09,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct functions/behaviors the synthesized patch encodes. magnitude = the count (static analysis); volume = normalized 0..1.',
  },
  {
    measurementKind: 'type-count',
    label: 'Types',
    unit: 'types',
    hasMagnitude: true,
    weight: 0.07,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct types/interfaces/schemas the patch defines. magnitude = the count; volume = normalized 0..1.',
  },
  {
    measurementKind: 'file-span',
    label: 'File span',
    unit: 'files',
    hasMagnitude: true,
    weight: 0.05,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many files the patch creates/modifies. magnitude = the count; volume = normalized 0..1.',
  },
  {
    measurementKind: 'symbolic-richness',
    label: 'Symbolic richness',
    unit: 'symbols',
    hasMagnitude: true,
    weight: 0.09,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · symbolic richness: magnitude = unique symbol count; volume normalizes richness per file.',
  },
  {
    measurementKind: 'modularity',
    label: 'Modularity',
    unit: 'modules',
    hasMagnitude: true,
    weight: 0.05,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · modularity: magnitude = module count; volume rewards multi-module structure without sprawl.',
  },
  {
    measurementKind: 'lang-span',
    label: 'Language span',
    unit: 'languages',
    hasMagnitude: true,
    weight: 0.06,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · languages: magnitude = distinct languages in the covered set (path/ext); volume = normalized 0..1.',
  },
  {
    measurementKind: 'test-surface',
    label: 'Test surface',
    unit: 'tests',
    hasMagnitude: true,
    weight: 0.07,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · tests/proofs: magnitude = test paths + test-like functions under the patch; volume = normalized 0..1.',
  },
  {
    measurementKind: 'api-surface',
    label: 'API surface',
    unit: 'exports',
    hasMagnitude: true,
    weight: 0.07,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · exports: magnitude = public/export entrypoints detected in covered source; volume = normalized 0..1.',
  },
  // —— Quality (measure-agent judgment) — weight mass ≈ 0.45 ——
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · correctness: volume 0..1 fidelity/coherence; magnitude mirrors volume (always required).',
  },
  {
    measurementKind: 'objectives-fidelity',
    label: 'Objectives fidelity',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.15,
    propertyClass: 'quality',
    guidance:
      'QUALITY · objectives: volume 0..1 serves deposit/read objectives without leakage; magnitude mirrors volume.',
  },
  {
    measurementKind: 'computational-usage',
    label: 'Computational usage',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.14,
    propertyClass: 'quality',
    guidance:
      'QUALITY · computational-usage: volume 0..1 estimated computational demand; magnitude mirrors volume.',
  },
];

export const ASSET_PACK_ABSOLUTE_KINDS: string[] = ASSET_PACK_ABSOLUTES_CATALOG.map(
  (spec) => spec.measurementKind,
);

/** Assert catalog weights sum to 1 (within float epsilon). */
export function assertAbsolutesCatalogWeights(): void {
  const sum = ASSET_PACK_ABSOLUTES_CATALOG.reduce((s, row) => s + row.weight, 0);
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error(`ASSET_PACK_ABSOLUTES_CATALOG weights sum to ${sum}, expected 1`);
  }
}

/**
 * @deprecated Deposit needinesses are always []. Kept for re-export stability.
 */
export const DEPOSIT_NEEDINESS_MEASUREMENT = {
  measurementKind: 'neediness',
  label: 'Neediness (REMOVED from deposit)',
  guidance:
    'Deprecated. Deposit DataPacks use measurements.absolutes only; needinesses are read-path only.',
} as const;
