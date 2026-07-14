/**
 * @bitcode/generic-asset-packs-synthesis
 *
 * Base AssetPack of Bitcode shared by all three product implementations:
 * DepositSynthesized, ReadSynthesized, ReadSynthesizedSettled.
 *
 * Hierarchy:
 *   AssetPack → SynthesisAssetPack
 *     → DepositSynthesized | ReadSynthesized | ReadSynthesizedSettled
 *   Artifact → PatchArtifact → AssetPackPatchArtifact
 */

export * from './types';
export * from './measurement-catalogs';
export * from './synthesis-asset-pack';
export {
  factorySynthesizeAssetPacksAbsolutesMeasureAgent,
  factoryAssetPackMeasureAbsolutesAgent,
} from './synthesize-asset-packs-absolutes-measure-agent';

export type { AssetPackPatchArtifact, BuildAssetPackPatchArtifactInput } from './asset-pack-patch-artifact';
export {
  ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
  buildAssetPackPatchArtifact,
  serializeAssetPackPatchArtifactJson,
  saveAssetPackPatchArtifact,
} from './asset-pack-patch-artifact';
