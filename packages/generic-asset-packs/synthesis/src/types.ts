/**
 * SynthesizeAssetPacks measurement product types.
 *
 * Hierarchy: product measurement types over Measurement / MeasureAgent bases.
 */

import type { MeasurementSpec } from '@bitcode/measurement-generics';

export type AssetPacksSynthesisLens = 'deposit' | 'read';

export interface AssetPackMeasurementSpec {
  measurementKind: string;
  label: string;
  weight: number;
  guidance: string;
}

export type AbsolutePropertyClass = 'quantity' | 'quality';

export interface AssetPackAbsoluteSpec extends MeasurementSpec {
  weight: number;
  propertyClass: AbsolutePropertyClass;
}

export interface AssetPackCandidateMeasurement {
  measurementKind: string;
  label: string;
  weight: number;
  volume: number;
  category?: 'absolute' | 'neediness';
  magnitude?: number;
  unit?: string;
}
