/**
 * @bitcode/generic-pipelines-sdivf
 *
 * Base SDIVFPipeline (hierarchy: SDIVF + Pipeline primitive).
 * Product pipelines name themselves as Specific+SDIVF+Pipeline, e.g.
 * SynthesizeAssetPacksSDIVFPipeline — they do not reimplement the DIV loop.
 */

export type { SDIVFPipeline } from './sdivf-factory';

export {
  factorySDIVFPipeline,
  factorySDIVFPipelineFromExecutors,
  type SDIVFPipelineConfig,
  type SDIVFPipelineExecutorConfig,
} from './sdivf-factory';

export {
  SDIVFPipelinePhase,
  factorySDIVFPipelinePhaseDelegators,
} from './sdivf-phases';
