/**
 * ExecutionPipelineSDIVF base re-export surface for pipelines-generics callers.
 * Prefer importing `@bitcode/generic-pipelines-sdivf` directly.
 *
 * Hierarchy: pipelines-generics (Pipeline) → generic-pipelines/SDIVF (ExecutionPipelineSDIVF)
 * → asset-packs-pipelines domain (ExecutionPipelineSDIVFSynthesizeAssetPacks).
 */

export {
  factoryExecutionPipelineSDIVF,
  factoryExecutionPipelineSDIVFFromExecutors,
    type ExecutionPipelineSDIVF,
  type ExecutionPipelineSDIVFConfig,
  type ExecutionPipelineSDIVFExecutorConfig,
    } from '@bitcode/generic-pipelines-sdivf';
