/**
 * PIPELINES-GENERICS — ExecutionPipeline primitives (based on Execution).
 *
 * Hierarchy naming law: anything based on Execution encodes full ancestry
 * left→right (e.g. ExecutionPipeline, ExecutionPipelineSDIVF).
 *
 * Hierarchy:
 *   pipelines-generics (this package — ExecutionPipeline primitives only)
 *     → generic-pipelines/execution-pipeline-sdivf (ExecutionPipelineSDIVF + phases)
 *     → generic-pipelines/execution-pipeline-simple (ExecutionPipelineSimple stages)
 *       → asset-packs-pipelines/execution-pipeline-* (product)
 *
 * Core Concepts (this package):
 * - ExecutionPipeline / ExecutionPipelineFn — EE + executor form
 * - Registries, streaming, metrics, resume, agent-executor adapters
 *
 * SDIVF phases (ExecutionPipelineSDIVFExecutionPhase*) live ONLY in
 * @bitcode/generic-pipelines-execution-pipeline-sdivf.
 *
 * @doc-code
 * type: package
 * category: pipeline-primitives
 * pattern: executor-composition
 */

// ExecutionPipeline types
export {
  ExecutionPipeline,
  factoryExecutionPipeline,
} from './execution/execution-pipeline-types';
export {
  type ExecutionPipelineLineage,
  type ExecutionPipelineFamily,
  type ExecutionPipelinePosture,
  inferExecutionPipelineLineage,
} from './execution/ExecutionPipeline';

// ExecutionPipeline executor form
export { type ExecutionPipelineFn } from './execution-pipeline-factory';

// ExecutionPipelineQuick (single stage, no SDIVF phases)
export {
  factoryExecutionPipelineQuick,
  type ExecutionPipelineQuickStage,
  type ExecutionPipelineQuickConfig,
} from './quick-pipeline';

// Streaming integration for real-time pipeline updates
export {
  enablePipelineStreaming,
  createStreamingExecution,
  emitPhaseTransition,
  emitAgentActivity,
  emitToolUsage,
  type PipelineStreamConfig,
} from './streaming/pipeline-stream-integration';

// Pipeline Prompt (EE) + hierarchical attach helpers (pipeline only)
// Compose/walk primitives live in @bitcode/execution-generics; re-exported here.
export { ExecutionPipelinePrompt } from './prompts/execution-pipeline-prompt';
export {
  applyPromptRegistryToExecutionPrompt,
  applyComposedCallSiteNodePrompt,
  composePromptLayers,
  composeNamespacedPromptLayers,
} from './prompts/execution-prompt-compose';
export { EXECUTION_PIPELINE_PRIMITIVE_PROMPT } from './prompts/execution-pipeline-primitive-prompt';
export {
  attachExecutionPipelinePromptHierarchy,
  resolveExecutionPipelinePromptHost,
} from './prompts/execution-prompt-attach-hierarchy';

// Metrics
export { computePipelineMetrics } from './execution/Metrics';
export { descendExecution, resumeDescriptorFromEvent } from './execution/resume';

// Minimal agent→executor adapter for composition
export { createAgentExecutor } from './execution/agent-executor';
export {
  isExecutionDebugEnabled,
  enableExecutionDebug,
  debugWrapExecutorStep,
} from './execution/debug';

// Canonical primitive types and mappers (DB + Streams SSOT)
// Phase labels match product SDIVF vocabulary for telemetry.
export type {
  PhaseLower,
  PhaseTitle,
  StepLower,
  StepTitle,
  MetaStep,
  SubStep,
  ExecutionState,
} from './types/primitives';
export {
  toPhaseLower,
  toPhaseTitle,
  toStepLower,
  isMetaStep,
  isSubStep,
} from './types/primitives';

// Pipeline DB aliases (built from ORM types)
export type {
  DPPhaseDelegation,
  DPPhaseDelegationInsert,
  DPAgentStep,
  DPAgentStepInsert,
  DPGeneration,
  DPGenerationInsert,
  DPToolExec,
  DPToolExecInsert,
} from './types/db';

// Direct pipeline-runner composition exports.
export {
  ExecutionPipelineExecutor,
  createPhaseRunner,
  type PhaseConfig,
  type AgentStep,
  type PhaseResult,
} from './execution/ExecutionPipelineExecutor';

// Registry surfaces used by asset-packs-pipelines domain preprocess.
export { ExecutionPipelineLLMRegistry } from './execution/ExecutionPipelineLLMRegistry';
export { ExecutionPipelinePromptRegistry } from './execution/ExecutionPipelinePromptRegistry';
export { ExecutionPipelineToolRegistry } from './execution/ExecutionPipelineToolRegistry';
export { ExecutionPipelineAgentRegistry } from './execution/ExecutionPipelineAgentRegistry';
// Class re-export for callers that need the concrete execution type symbol.
export { ExecutionPipeline as ExecutionPipelineClass } from './execution/ExecutionPipeline';
