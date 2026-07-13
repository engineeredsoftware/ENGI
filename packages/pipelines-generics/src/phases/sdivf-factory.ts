/**
 * @deprecated Prefer `@bitcode/generic-pipelines-sdivf`.
 * Compatibility re-export of the SDIVFPipeline base (hierarchy: SDIVF + Pipeline).
 *
 * Hierarchy: pipelines-generics (Pipeline) → generic-pipelines/SDIVF (SDIVFPipeline)
 * → pipeline-asset-pack (SynthesizeAssetPacksSDIVFPipeline / future Settle…).
 */

export {
  factorySDIVFPipeline,
  factorySDIVFPipelineFromExecutors,
  factorySDIVFExecutorPipeline,
  type SDIVFPipeline,
  type SDIVFPipelineConfig,
  type SDIVFPipelineExecutorConfig,
  type SDIVFConfig,
  type SDIVFExecutorConfig,
} from '@bitcode/generic-pipelines-sdivf';
