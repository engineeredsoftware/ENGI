/**
 * MeasuredPatchAssetPack — base AssetPack implementation used by all pipelines.
 *
 * Hierarchy:
 *   AssetPack (primitive) → MeasuredPatchAssetPack (this) → product options / settlement
 *
 * A measured patch carries:
 * - protocol identity + source binding + path+op patch (from asset-pack-generics)
 * - absolute/neediness measurements (Bitcode measurement law)
 * - provenant source path list (depositor-owned; still no raw source blobs)
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

export interface MeasuredPatchMeasurement {
  id: string;
  label: string;
  measurementKind: string;
  weight: number;
  volume: number;
  category?: MeasuredPatchMeasurementCategory;
  /** Raw count for size measurements (functions / types / files). */
  magnitude?: number;
  /** functions | types | files | estimate | normalized. */
  unit?: string;
  evidenceRoot?: string;
}

/** Deposit-side preview of read demand (0..1 family); separate from absolute composite. */
export interface MeasuredPatchNeedinessPreview {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}

/**
 * MeasuredPatchAssetPack — the only admitted AssetPack base implementation.
 * All synthesize/settle product pipelines produce or consume this shape.
 */
export interface MeasuredPatchAssetPack extends AssetPack {
  identity: AssetPack['identity'] & {
    schema: typeof MEASURED_PATCH_ASSET_PACK_SCHEMA;
  };
  /** Human title for review UIs (source-safe). */
  title: string;
  /** Short source-safe summary. */
  summary: string;
  /** Absolute (and optional neediness) measurements. */
  measurements: MeasuredPatchMeasurement[];
  /** Weighted absolute composite when computed. */
  absoluteVolume?: number | null;
  /** Read-demand preview (deposit earning estimate); null when unestimated. */
  neediness?: MeasuredPatchNeedinessPreview | null;
  /** Paths that become available for future reader settlement (no raw source). */
  provenantSourcePaths: string[];
  provenantSourceCount: number;
  writtenAssetKind?: typeof ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION;
}

export type {
  AssetPackId,
  AssetPackSourceBinding,
  AssetPackPatchFileChange,
};
