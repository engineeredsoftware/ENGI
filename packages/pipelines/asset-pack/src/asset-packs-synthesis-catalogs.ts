/**
 * AssetPacksSynthesis measurement catalogs (lens catalogs + ABSOLUTES).
 *
 * Deposit and read lenses share the absolute material-property catalog;
 * relative measurement catalogs differ by lens. Weights sum to 1 per catalog.
 */

import type {
  AssetPackAbsoluteSpec,
  AssetPackMeasurementSpec,
  AssetPacksSynthesisLens,
} from './asset-packs-synthesis-types';

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

export function measurementCatalogForLens(lens: AssetPacksSynthesisLens): AssetPackMeasurementSpec[] {
  return lens === 'read' ? READ_MEASUREMENT_CATALOG : DEPOSIT_MEASUREMENT_CATALOG;
}

/**
 * The ABSOLUTES catalog (formalized non-needinesses).
 *
 * Absolute measurements are INTRINSIC properties of digital material:
 *   - Quantity — size, symbolic richness, modularity (Tool-authoritative)
 *   - Quality — objectives fidelity, correctness, computational usage (measure-agent)
 *
 * Weights sum to 1. Lens-shared; reading finalizes its own relative catalog separately.
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
      'QUANTITY · size: how many distinct functions/behaviors the synthesized patch encodes. magnitude = the count (static analysis).',
  },
  {
    measurementKind: 'type-count',
    label: 'Types',
    unit: 'types',
    hasMagnitude: true,
    weight: 0.1,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct types/interfaces/schemas the patch defines. magnitude = the count (static analysis).',
  },
  {
    measurementKind: 'file-span',
    label: 'File span',
    unit: 'files',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many files the patch creates/modifies (patch descriptor). magnitude = the count.',
  },
  {
    measurementKind: 'symbolic-richness',
    label: 'Symbolic richness',
    unit: 'symbols',
    hasMagnitude: true,
    weight: 0.12,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · symbolic richness: how dense the material is in distinct symbols/identifiers (static analysis). magnitude = unique symbol count; volume normalizes richness per file.',
  },
  {
    measurementKind: 'modularity',
    label: 'Modularity',
    unit: 'modules',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · modularity: how modular the material is (distinct path modules / top-level packages touched). magnitude = module count; volume rewards multi-module structure without sprawl.',
  },
  // —— Quality properties (measure-agent judgment, grounded in quantities) ——
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    weight: 0.18,
    propertyClass: 'quality',
    guidance:
      'QUALITY · correctness: 0..1 fidelity and internal coherence of the synthesized knowledge — faithful to Discovery comprehension and buildable as described.',
  },
  {
    measurementKind: 'objectives-fidelity',
    label: 'Objectives fidelity',
    unit: 'estimate',
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · objectives: 0..1 how well the pack serves the deposit/read objectives (obfuscation guidance, demand context, Discovery intent) without leaking withheld material.',
  },
  {
    measurementKind: 'computational-usage',
    label: 'Computational usage',
    unit: 'estimate',
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · computational-usage requirements: 0..1 estimated computational demand of the material (complexity of the knowledge surface: denser/richer packs score higher usage requirements).',
  },
];

export const ASSET_PACK_ABSOLUTE_KINDS: string[] = ASSET_PACK_ABSOLUTES_CATALOG.map(
  (spec) => spec.measurementKind,
);

/**
 * Deposit neediness — read-demand PREVIEW. NOT a member of DEPOSIT_MEASUREMENT_CATALOG;
 * a separate, forward-looking estimate previewed beside the absolutes.
 */
export const DEPOSIT_NEEDINESS_MEASUREMENT = {
  measurementKind: 'neediness',
  label: 'Neediness (est. read demand)',
  guidance:
    'Estimated reading demand the AssetPack would satisfy — the deposit-side preview of read Need-fit and earning potential. Computed from the depository-search demand signal and the supply scarcity it addresses.',
} as const;
