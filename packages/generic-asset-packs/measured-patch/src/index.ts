/**
 * @bitcode/generic-asset-packs-measured-patch
 *
 * MeasuredPatchAssetPack base — the only AssetPack implementation used by
 * Bitcode product pipelines (synthesize-deposits, synthesize-reads, settle-reads).
 */

export type {
  MeasuredPatchAssetPack,
  MeasuredPatchMeasurement,
  MeasuredPatchMeasurementCategory,
  MeasuredPatchNeedinessPreview,
} from './types';
export { MEASURED_PATCH_ASSET_PACK_SCHEMA } from './types';

export {
  buildMeasuredPatchAssetPack,
  measuredPatchToDepositContents,
  type BuildMeasuredPatchAssetPackInput,
} from './builders';

// Primitive re-exports for convenience (prefer asset-pack-generics for pure primitives)
export type {
  AssetPack,
  AssetPackId,
  AssetPackIdentity,
  AssetPackSourceBinding,
  AssetPackPatchDescriptor,
  AssetPackPatchFileChange,
  AssetPackDeliveryMechanism,
} from '@bitcode/asset-packs-generics';
