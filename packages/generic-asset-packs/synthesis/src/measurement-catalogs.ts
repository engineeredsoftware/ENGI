/**
 * DataPack synthesis catalogs.
 *
 * **Absolutes (law):** `DATA_PACK_ABSOLUTES_CATALOG` — **all 46 kinds**, each weighted,
 * **Σ weights = 1**. There is no separate 11-kind commercial subset (legacy).
 * SSOT: `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog`.
 *
 * Bare measures: `generic-measurements/absolutes/<kind>/`.
 * Tools: `generic-tools/tool-measure-<kind>/`.
 * Agent: `@bitcode/generic-agents-agent-measure-absolutes`.
 */

import type {
  AssetPackMeasurementSpec,
  SynthesizeAssetPacksMode,
  AssetPackAbsoluteSpec,
} from './types';

export {
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
  DATA_PACK_WEIGHTED_ABSOLUTE_KINDS,
  DATA_PACK_ABSOLUTE_KIND_OPTIONS,
  DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS,
  assertDataPackAbsolutesCatalogWeights,
  labelForDataPackAbsoluteKind,
  type DataPackAbsoluteKindSpec,
  type DataPackAbsoluteKindOption,
  type AbsoluteFamily,
  type AbsolutePolicyRole,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

import { DATA_PACK_ABSOLUTES_CATALOG as _CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

/**
 * Product MeasureAgent specs for all 46 commercial absolute kinds.
 * propertyClass maps non-quantity/quality families onto quantity|quality for the
 * existing MeasureAgent schema (verification/provenance/hygiene/value → quantity
 * for tool-grounded; quality stays quality).
 */
export const DATA_PACK_ABSOLUTES_PRODUCT_CATALOG: AssetPackAbsoluteSpec[] = _CATALOG.map((s) => ({
  measurementKind: s.measurementKind,
  label: s.label,
  unit: s.unit,
  guidance: s.guidance,
  hasMagnitude: true as const,
  weight: s.weight,
  propertyClass: (s.propertyClass === 'quality' ? 'quality' : 'quantity') as 'quantity' | 'quality',
}));

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

export function synthesisPolicyCatalogForMode(
  mode: SynthesizeAssetPacksMode,
): AssetPackMeasurementSpec[] {
  return mode === 'read' ? READ_SYNTHESIS_POLICY_CATALOG : DEPOSIT_SYNTHESIS_POLICY_CATALOG;
}

/** @deprecated Use DEPOSIT_SYNTHESIS_POLICY_CATALOG */
export const DEPOSIT_MEASUREMENT_CATALOG = DEPOSIT_SYNTHESIS_POLICY_CATALOG;
/** @deprecated Use READ_SYNTHESIS_POLICY_CATALOG */
export const READ_MEASUREMENT_CATALOG = READ_SYNTHESIS_POLICY_CATALOG;
/** @deprecated Use synthesisPolicyCatalogForMode */
export function measurementCatalogForLens(
  lens: SynthesizeAssetPacksMode,
): AssetPackMeasurementSpec[] {
  return synthesisPolicyCatalogForMode(lens);
}

export const DEPOSIT_NEEDINESS_MEASUREMENT = {
  measurementKind: 'neediness',
  label: 'Neediness (REMOVED from deposit)',
  guidance:
    'Deprecated. Deposit DataPacks use measurements.absolutes only; needinesses are read-path only.',
} as const;
