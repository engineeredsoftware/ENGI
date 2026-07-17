/**
 * Canonical run exports for the AssetPack SDIVF pipeline.
 *
 * Callers should use runExecutionPipelineSDIVFSynthesizeAssetPacks (or the product
 * deposit/read packages) and treat Finish as the final phase.
 */

export {
  runExecutionPipelineSDIVFSynthesizeAssetPacks,
  executionPipelineSDIVFSynthesizeAssetPacks,
  factoryExecutionPipelineSDIVFSynthesizeAssetPacks,
} from './index';

import { runExecutionPipelineSDIVFSynthesizeAssetPacks } from './index';
export default runExecutionPipelineSDIVFSynthesizeAssetPacks;
