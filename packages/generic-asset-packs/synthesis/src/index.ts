/**
 * @bitcode/generic-asset-packs-synthesis
 *
 * Product surface for SynthesizeAssetPacks:
 * - measurement catalogs + AbsolutesMeasureAgent
 * - AssetPackPatchArtifact (product Artifact over PatchArtifact base)
 *
 * Hierarchy (artifacts):
 *   Artifact → PatchArtifact → AssetPackPatchArtifact
 */

export * from './types';
export * from './measurement-catalogs';
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
