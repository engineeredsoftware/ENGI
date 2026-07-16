/**
 * @bitcode/generic-pipelines-execution-pipeline-sdivf
 *
 * Base ExecutionPipelineSDIVF — phase shell only (Setup-[DIV]*-Finish).
 * No agents, tools, or product domains. Product pipelines inject phase
 * Executors and name themselves Specific+SDIVF+Pipeline (e.g.
 * ExecutionPipelineSDIVFSynthesizeReadAssetPacks). Settle is Simple, not SDIVF.
 */

export type { ExecutionPipelineSDIVF } from './execution-pipeline-sdivf-factory';

export {
  factoryExecutionPipelineSDIVF,
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVFConfig,
  type ExecutionPipelineSDIVFExecutorConfig,
} from './execution-pipeline-sdivf-factory';

export {
  ExecutionPipelineSDIVFPhase,
  factoryExecutionPipelineSDIVFPhaseDelegators,
} from './execution-pipeline-sdivf-phases';

export { EXECUTION_PIPELINE_SDIVF_PROMPT } from './prompts/execution-pipeline-sdivf-prompt';
export {
  EXECUTION_PHASE_SDIVF_SETUP_PROMPT,
  EXECUTION_PHASE_SDIVF_DISCOVERY_PROMPT,
  EXECUTION_PHASE_SDIVF_IMPLEMENTATION_PROMPT,
  EXECUTION_PHASE_SDIVF_VALIDATION_PROMPT,
  EXECUTION_PHASE_SDIVF_FINISH_PROMPT,
  executionPhaseSdivfPromptFor,
} from './prompts/execution-phase-sdivf-prompts';
