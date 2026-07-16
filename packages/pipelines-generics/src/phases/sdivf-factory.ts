/**
 * SDIVFPipeline base re-export surface for pipelines-generics callers.
 * Prefer importing `@bitcode/generic-pipelines-sdivf` directly.
 *
 * Hierarchy: pipelines-generics (Pipeline) → generic-pipelines/SDIVF (SDIVFPipeline)
 * → asset-packs-pipelines domain (SynthesizeAssetPacksSDIVFPipeline).
 */

export {
  factorySDIVFPipeline,
  factorySDIVFPipelineFromExecutors,
    type SDIVFPipeline,
  type SDIVFPipelineConfig,
  type SDIVFPipelineExecutorConfig,
    } from '@bitcode/generic-pipelines-sdivf';
