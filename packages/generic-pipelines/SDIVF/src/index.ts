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
  /** @deprecated Use factorySDIVFPipelineFromExecutors */
  factorySDIVFExecutorPipeline,
  type SDIVFPipelineConfig,
  type SDIVFPipelineExecutorConfig,
  /** @deprecated Use SDIVFPipelineConfig */
  type SDIVFConfig,
  /** @deprecated Use SDIVFPipelineExecutorConfig */
  type SDIVFExecutorConfig,
} from './sdivf-factory';

export {
  SDIVFPipelinePhase,
  factorySDIVFPipelinePhaseDelegators,
  /** @deprecated Use SDIVFPipelinePhase */
  SDIVFPhase,
  /** @deprecated Use factorySDIVFPipelinePhaseDelegators */
  factorySDIVFPhaseDelegators,
} from './sdivf-phases';
