/**
 * @bitcode/generic-asset-packs-synthesis
 *
 * Shared synthesize AssetPack base for **both** deposit and read pipelines:
 * - SynthesisAssetPack (extends AssetPack primitive + measurements)
 * - measurement catalogs + AbsolutesMeasureAgent
 * - AssetPackPatchArtifact
 *
 * Hierarchy:
 *   AssetPack → SynthesisAssetPack → DepositSynthesized | ReadSynthesized
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
