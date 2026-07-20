/**
 * SynthesizeAssetPacks measurement product types.
 *
 * Measurement KINDS: absolutes | needinesses (nested carrier on AssetPacks).
 * Hierarchy: product measurement types over Measurement / MeasureAgent bases.
 */

import type { MeasurementSpec } from '@bitcode/measurement-generics';

/** Deposit | read synthesis mode (separate product pipelines; no lens). */
export type SynthesizeAssetPacksMode = 'deposit' | 'read';

/** Soft policy / legacy relative specs (not formal absolute or neediness kinds). */
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
  /** Always true under V48 absolute reading law (magnitude always required). */
  hasMagnitude: true;
}

/**
 * One absolute reading. **Always** carries magnitude + volume + unit + weight.
 * Quantity: magnitude = raw count. Quality: magnitude mirrors volume (0..1).
 */
export interface AssetPackCandidateMeasurement {
  measurementKind: string;
  label: string;
  weight: number;
  volume: number;
  magnitude: number;
  unit: string;
  category: 'absolute';
  rationale?: string;
  /**
   * Source-safe, instance-facing prose for **this** AssetPack reading
   * (generated when/after measurement). Never raw source.
   */
  descriptor?: string;
}

/** One neediness reading (read path only). Same numeric law as absolutes for fields. */
export interface AssetPackNeedinessMeasurement {
  measurementKind: string;
  label: string;
  weight: number;
  volume: number;
  magnitude: number;
  unit: string;
  category: 'neediness';
  rationale?: string;
  /** Source-safe instance prose for this reading (when attached). */
  descriptor?: string;
}

/**
 * Canonical nested measurement kinds object on an AssetPack / deposit option.
 * Deposit: needinesses is always [].
 * Read: needinesses populated; need-fit composite derived separately.
 */
export interface AssetPackMeasurementsByKind {
  absolutes: AssetPackCandidateMeasurement[];
  needinesses: AssetPackNeedinessMeasurement[];
}

export function emptyAssetPackMeasurements(): AssetPackMeasurementsByKind {
  return { absolutes: [], needinesses: [] };
}
