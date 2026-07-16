/**
 * @bitcode/generic-pipelines-simple
 *
 * Base ExecutionPipelineSimple (hierarchy: Simple + Pipeline primitive).
 * Product pipelines name themselves Specific+Simple+Pipeline, e.g.
 * ExecutionPipelineSimpleSettleAssetPack — linear stages, no DIV loop.
 */

export type { ExecutionPipelineSimple } from './simple-factory';

export {
  factoryExecutionPipelineSimple,
  factoryExecutionPipelineSimpleFromExecutors,
  factoryExecutionPipelineSimpleSequential,
  type ExecutionPipelineSimpleConfig,
  type ExecutionPipelineSimpleStage,
} from './simple-factory';
