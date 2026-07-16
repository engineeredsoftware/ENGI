/**
 * @bitcode/generic-pipelines-sdivf
 *
 * Base SDIVFPipeline — phase shell only (Setup-[DIV]*-Finish).
 * No agents, tools, or product domains. Product pipelines inject phase
 * Executors and name themselves Specific+SDIVF+Pipeline (e.g.
 * SynthesizeReadAssetPacksSDIVFPipeline). Settle is Simple, not SDIVF.
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

export { SDIVF_PIPELINE_PROMPT } from './prompts/sdivf-pipeline-prompt';
export {
  SDIVF_PHASE_SETUP_PROMPT,
  SDIVF_PHASE_DISCOVERY_PROMPT,
  SDIVF_PHASE_IMPLEMENTATION_PROMPT,
  SDIVF_PHASE_VALIDATION_PROMPT,
  SDIVF_PHASE_FINISH_PROMPT,
  sdivfPhasePromptFor,
} from './prompts/sdivf-phase-prompts';
