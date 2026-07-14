/**
 * MeasuredPatchAssetPack — base AssetPack implementation used by all pipelines.
 *
 * Hierarchy:
 *   AssetPack (primitive) → MeasuredPatchAssetPack (this) → product options / settlement
 *
 * Measurement KINDS (nested carrier):
 *   measurements: { absolutes: [...], needinesses: [...] }
 * Deposit: needinesses always []. Read: needinesses populated; need-fit is composite.
 */

import type {
  AssetPack,
  AssetPackId,
  AssetPackPatchFileChange,
  AssetPackSourceBinding,
} from '@bitcode/asset-packs-generics';
import {
  ASSET_PACK_SCHEMA_PREFIX,
  ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
} from '@bitcode/asset-packs-generics';

export const MEASURED_PATCH_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.measured-patch` as const;

export type MeasuredPatchMeasurementCategory = 'absolute' | 'neediness';

/** One absolute or neediness reading — magnitude + volume always required. */
export interface MeasuredPatchMeasurement {
  id?: string;
  label: string;
  measurementKind: string;
  weight: number;
  volume: number;
  magnitude: number;
  unit: string;
  category: MeasuredPatchMeasurementCategory;
  evidenceRoot?: string;
  rationale?: string;
}

/** Nested measurement kinds object (canonical). */
export interface MeasuredPatchMeasurementsByKind {
  absolutes: MeasuredPatchMeasurement[];
  needinesses: MeasuredPatchMeasurement[];
}

/**
 * @deprecated Deposit must not use neediness preview. Read uses needinesses[].
 */
export interface MeasuredPatchNeedinessPreview {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}

/**
 * MeasuredPatchAssetPack — the only admitted AssetPack base implementation.
 */
export interface MeasuredPatchAssetPack extends AssetPack {
  identity: AssetPack['identity'] & {
    schema: typeof MEASURED_PATCH_ASSET_PACK_SCHEMA;
  };
  title: string;
  summary: string;
  /**
   * Nested kinds: absolutes (always) + needinesses (read only; [] on deposit).
   * Dual-compat: some paths still accept a flat MeasuredPatchMeasurement[] during migration.
   */
  measurements: MeasuredPatchMeasurementsByKind | MeasuredPatchMeasurement[];
  /** Weighted absolute composite when computed. */
  absoluteVolume?: number | null;
  /**
   * @deprecated Removed from deposit. Prefer measurements.needinesses on read.
   */
  neediness?: MeasuredPatchNeedinessPreview | null;
  provenantSourcePaths: string[];
  provenantSourceCount: number;
  writtenAssetKind?: typeof ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION;
}

export type {
  AssetPackId,
  AssetPackSourceBinding,
  AssetPackPatchFileChange,
};
