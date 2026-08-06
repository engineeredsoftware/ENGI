/**
 * @bitcode/generic-pipelines-execution-pipeline-sdivf
 *
 * Base ExecutionPipelineSDIVF — phase shell only (Setup-[DIV]*-Finish).
 * Owns all phase EE / PhaseDelegator concepts (not pipeline primitives).
 * No agents, tools, or product domains. Product pipelines inject phase
 * Executors (e.g. ExecutionPipelineSDIVFSynthesizeReadAssetPacks).
 * Settle is ExecutionPipelineSimple, not SDIVF.
 *
 * Hierarchy:
 *   pipelines-generics — ExecutionPipeline primitives
 *   this package — ExecutionPipelineSDIVF + ExecutionPipelineSDIVFExecutionPhase*
 *   asset-packs-pipelines — product specializations
 */

export type { ExecutionPipelineSDIVF } from './execution-pipeline-sdivf-factory';

export {
  factoryExecutionPipelineSDIVF,
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVFConfig,
  type ExecutionPipelineSDIVFExecutorConfig,
} from './execution-pipeline-sdivf-factory';

export {
  factoryExecutionPipelineSDIVFFromExecutionPhaseDelegators,
  factoryExecutionPipelineSDIVFWithDIVFinishLoop,
} from './execution-pipeline-sdivf-from-execution-phase-delegators';

export {
  ExecutionPipelineSDIVFPhase,
  factoryExecutionPipelineSDIVFPhaseDelegators,
} from './execution-pipeline-sdivf-phases';

export {
  type ExecutionPipelineSDIVFExecutionPhaseDelegator,
  ExecutionPipelineSDIVFExecutionPhase,
  factoryExecutionPipelineSDIVFExecutionPhase,
} from './execution-pipeline-sdivf-execution-phase';

export {
  factoryExecutionPipelineSDIVFExecutionPhaseDelegator,
  factoryExecutionPipelineSDIVFSequentialExecutionPhaseDelegator,
  factoryExecutionPipelineSDIVFParallelExecutionPhaseDelegator,
} from './execution-pipeline-sdivf-execution-phase-delegator-factory';

export {
  type ExecutionPipelineSDIVFExecutionPhaseRunnerConfig,
  factoryExecutionPipelineSDIVFExecutionPhaseRunner,
  type AgentStep,
  type PhaseResult,
} from './execution-pipeline-sdivf-execution-phase-runner';

export { EXECUTION_PIPELINE_SDIVF_PROMPT } from './prompts/execution-pipeline-sdivf-prompt';

export {
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_SETUP_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_DISCOVERY_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_IMPLEMENTATION_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_VALIDATION_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_FINISH_PROMPT,
  executionPipelineSDIVFExecutionPhaseBasePromptFor,
} from './prompts/execution-pipeline-sdivf-execution-phase-base-prompts';

export {
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_DISCOVERY_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_IMPLEMENTATION_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_VALIDATION_PROMPT,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_FINISH_PROMPT,
} from './prompts/execution-pipeline-sdivf-execution-phase-primitive-prompt';

export { attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy } from './prompts/execution-pipeline-sdivf-execution-phase-prompt-attach';
