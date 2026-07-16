/**
 * SynthesizeAssetPacks measurement catalogs (lens + ABSOLUTES).
 * Lives in asset-packs/synthesis product package.
 *
 * Deposit and read lenses share the absolute material-property catalog;
 * relative measurement catalogs differ by lens. Weights sum to 1 per catalog.
 */

import type {
  AssetPackAbsoluteSpec,
  AssetPackMeasurementSpec,
  SynthesizeAssetPacksMode,
} from './types';

export const DEPOSIT_MEASUREMENT_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.36,
    guidance: 'How much of the meaningful source knowledge in the inventory this candidate covers.',
  },
  {
    measurementKind: 'demand-alignment',
    label: 'Demand alignment',
    weight: 0.4,
    guidance: 'Alignment with the demand context and depositor steering.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.24,
    guidance: 'How reusable the covered knowledge is outside this repository.',
  },
];

// The reading lens extends the deposit catalog with Need-relative measurements.
export const READ_MEASUREMENT_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'need-fit',
    label: 'Need fit',
    weight: 0.44,
    guidance: 'How directly the covered knowledge satisfies the reviewed read Need.',
  },
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.28,
    guidance: 'How much of the Need-relevant source knowledge this candidate covers.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.28,
    guidance: 'How reusable the covered knowledge is in the buyer context beyond the immediate Need.',
  },
];

export function measurementCatalogForLens(lens: SynthesizeAssetPacksMode): AssetPackMeasurementSpec[] {
  return lens === 'read' ? READ_MEASUREMENT_CATALOG : DEPOSIT_MEASUREMENT_CATALOG;
}

/**
 * ABSOLUTES measurement KIND catalog (intrinsic digital-material properties).
 *
 *   - Quantity — size, symbolic richness, modularity (Tool-authoritative)
 *   - Quality — objectives fidelity, correctness, computational usage (measure-agent)
 *
 * Weights sum to 1. Shared for deposit and read **absolute** readings.
 * Every absolute reading must carry **magnitude + volume + unit + weight**.
 * Needinesses are a **separate** measurement KIND (reading only) — see
 * `@bitcode/generic-measurements-needinesses`.
 */
export const ASSET_PACK_ABSOLUTES_CATALOG: AssetPackAbsoluteSpec[] = [
  // —— Quantity properties (Tool-authoritative sizes / structure) ——
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    hasMagnitude: true,
    weight: 0.12,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct functions/behaviors the synthesized patch encodes. magnitude = the count (static analysis); volume = normalized 0..1.',
  },
  {
    measurementKind: 'type-count',
    label: 'Types',
    unit: 'types',
    hasMagnitude: true,
    weight: 0.1,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct types/interfaces/schemas the patch defines. magnitude = the count; volume = normalized 0..1.',
  },
  {
    measurementKind: 'file-span',
    label: 'File span',
    unit: 'files',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many files the patch creates/modifies. magnitude = the count; volume = normalized 0..1.',
  },
  {
    measurementKind: 'symbolic-richness',
    label: 'Symbolic richness',
    unit: 'symbols',
    hasMagnitude: true,
    weight: 0.12,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · symbolic richness: magnitude = unique symbol count; volume normalizes richness per file.',
  },
  {
    measurementKind: 'modularity',
    label: 'Modularity',
    unit: 'modules',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · modularity: magnitude = module count; volume rewards multi-module structure without sprawl.',
  },
  // —— Quality properties (measure-agent judgment, grounded in quantities) ——
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.18,
    propertyClass: 'quality',
    guidance:
      'QUALITY · correctness: volume 0..1 fidelity/coherence; magnitude mirrors volume (always required).',
  },
  {
    measurementKind: 'objectives-fidelity',
    label: 'Objectives fidelity',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · objectives: volume 0..1 serves deposit/read objectives without leakage; magnitude mirrors volume.',
  },
  {
    measurementKind: 'computational-usage',
    label: 'Computational usage',
    unit: 'estimate',
    hasMagnitude: true,
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · computational-usage: volume 0..1 estimated computational demand; magnitude mirrors volume.',
  },
];

export const ASSET_PACK_ABSOLUTE_KINDS: string[] = ASSET_PACK_ABSOLUTES_CATALOG.map(
  (spec) => spec.measurementKind,
);

/**
 * measurement KIND rows under measurements.needinesses (see needinesses package).
 */
export const DEPOSIT_NEEDINESS_MEASUREMENT = {
  measurementKind: 'neediness',
  label: 'Neediness (REMOVED from deposit)',
  guidance:
    'Deprecated. Deposit AssetPacks use measurements.absolutes only; needinesses are read-path only.',
} as const;
