/**
 * @bitcode/asset-packs-generics
 *
 * AssetPack **primitive** contracts for Bitcode Protocol.
 * Measurements (absolutes | needinesses) are part of the primitive shape via
 * `@bitcode/measurement-generics`.
 *
 * Hierarchy:
 *   AssetPack (this)
 *     → SynthesisAssetPack           (@bitcode/generic-asset-packs-synthesis)
 *         → DepositSynthesizedAssetPack
 *         → ReadSynthesizedAssetPack
 */

export type { AssetPackId, AssetPackIdentity } from './identity';
export {
  ASSET_PACK_SCHEMA_PREFIX,
  isAssetPackId,
  assertAssetPackId,
} from './identity';

export type { AssetPackSourceBinding } from './source-binding';
export { createAssetPackSourceBinding } from './source-binding';

export type {
  AssetPackFileOp,
  AssetPackPatchFileChange,
  AssetPackPatchDescriptor,
} from './patch';
export { createAssetPackPatchDescriptor } from './patch';

export type {
  AssetPack,
  AssetPackDeliveryMechanism,
  AssetPackWrittenAssetKind,
  AssetPackMeasurements,
} from './types';
export {
  ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  emptyAssetPackMeasurements,
} from './types';

/** Re-export measurement primitives used on AssetPack.measurements. */
export type {
  MeasurementReading,
  MeasurementKindCategory,
  MeasurementCategory,
} from '@bitcode/measurement-generics';
