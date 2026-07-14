/**
 * @bitcode/generic-pipelines-simple
 *
 * Base SimplePipeline (hierarchy: Simple + Pipeline primitive).
 * Product pipelines name themselves Specific+Simple+Pipeline, e.g.
 * SettleAssetPackSimplePipeline — linear stages, no DIV loop.
 */

export type { SimplePipeline } from './simple-factory';

export {
  factorySimplePipeline,
  factorySimplePipelineFromExecutors,
  factorySimpleSequentialPipeline,
  type SimplePipelineConfig,
  type SimplePipelineStage,
} from './simple-factory';
