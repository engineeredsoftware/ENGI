/**
 * Canonical run exports for the AssetPack SDIVF pipeline.
 * 
 * Callers should use pipelineSDIVF or the package root and should treat
 * Finish as the final phase.
 * 
 * The actual implementation is in index.ts
 */

export {
  runSynthesizeAssetPacksSDIVFPipeline,
  runSDIVFPipeline,
  synthesizeAssetPacksSDIVFPipeline,
  assetPackPipeline,
} from './index';

import { runSynthesizeAssetPacksSDIVFPipeline } from './index';
export default runSynthesizeAssetPacksSDIVFPipeline;
