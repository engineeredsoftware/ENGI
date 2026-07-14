/**
 * @bitcode/generic-asset-packs-measured-patch
 *
 * @deprecated Compatibility re-export of SynthesisAssetPack.
 * Prefer:
 *   @bitcode/generic-asset-packs-synthesis
 *   @bitcode/generic-asset-packs-deposit-synthesized
 *   @bitcode/generic-asset-packs-read-synthesized
 */

export type {
  MeasuredPatchAssetPack,
  MeasuredPatchMeasurement,
  MeasuredPatchMeasurementCategory,
  MeasuredPatchNeedinessPreview,
  SynthesisAssetPack,
} from './types';
export { MEASURED_PATCH_ASSET_PACK_SCHEMA, SYNTHESIS_ASSET_PACK_SCHEMA } from './types';

export {
  buildMeasuredPatchAssetPack,
  buildSynthesisAssetPack,
  measuredPatchToDepositContents,
  synthesisAssetPackToDepositContents,
  type BuildMeasuredPatchAssetPackInput,
  type BuildSynthesisAssetPackInput,
} from './builders';

export type {
  AssetPack,
  AssetPackId,
  AssetPackIdentity,
  AssetPackSourceBinding,
  AssetPackPatchDescriptor,
  AssetPackPatchFileChange,
  AssetPackDeliveryMechanism,
  AssetPackMeasurements,
} from '@bitcode/asset-packs-generics';
