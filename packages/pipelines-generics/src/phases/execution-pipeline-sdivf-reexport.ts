/**
 * ExecutionPipelineSDIVF base re-export surface for pipelines-generics callers.
 * Prefer importing `@bitcode/generic-pipelines-execution-pipeline-sdivf` directly.
 *
 * Hierarchy: pipelines-generics (Pipeline) → generic-pipelines/execution-pipeline-sdivf (ExecutionPipelineSDIVF)
 * → asset-packs-pipelines domain (ExecutionPipelineSDIVFSynthesizeAssetPacks).
 */

export {
  factoryExecutionPipelineSDIVF,
  factoryExecutionPipelineSDIVFFromExecutors,
    type ExecutionPipelineSDIVF,
  type ExecutionPipelineSDIVFConfig,
  type ExecutionPipelineSDIVFExecutorConfig,
    } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
