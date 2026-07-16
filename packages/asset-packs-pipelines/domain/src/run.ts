/**
 * Canonical run exports for the AssetPack SDIVF pipeline.
 *
 * Callers should use runSynthesizeAssetPacksSDIVFPipeline (or the product
 * deposit/read packages) and treat Finish as the final phase.
 */

export {
  runSynthesizeAssetPacksSDIVFPipeline,
  synthesizeAssetPacksSDIVFPipeline,
  factorySynthesizeAssetPacksSDIVFPipeline,
} from './index';

import { runSynthesizeAssetPacksSDIVFPipeline } from './index';
export default runSynthesizeAssetPacksSDIVFPipeline;
