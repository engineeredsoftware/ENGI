/**
 * Canonical run exports for the AssetPack SDIVF pipeline.
 *
 * Callers should use runExecutionPipelineSDIVFSynthesizeAssetPacks (or the product
 * deposit/read packages) and treat Finish as the final phase.
 *
 * Re-exports dual-entry from the package index (no circular import of factories).
 */

export {
  default,
  runExecutionPipelineSDIVFSynthesizeAssetPacks,
} from './index';
