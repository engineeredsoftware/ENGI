/**
 * @bitcode/generic-pipelines-execution-pipeline-simple
 *
 * Base ExecutionPipelineSimple (based on ExecutionPipeline).
 * Product: ExecutionPipelineSimpleSettleAssetPack — linear stages, no DIV loop.
 */

export type { ExecutionPipelineSimple } from './execution-pipeline-simple-factory';

export {
  factoryExecutionPipelineSimple,
  factoryExecutionPipelineSimpleFromExecutors,
  factoryExecutionPipelineSimpleSequential,
  type ExecutionPipelineSimpleConfig,
  type ExecutionPipelineSimpleStage,
} from './execution-pipeline-simple-factory';
