/**
 * PIPELINES-GENERICS - Pipeline Execution Primitives
 *
 * This package provides the foundational abstractions for building
 * pipelines. Pipelines are Executors that sequence PhaseDelegators.
 * PhaseDelegators are Executors that delegate to Agents.
 *
 * These are reusable orchestration primitives (Pipeline, ExecutionPhaseDelegator,
 * composition). The SDIVF *base implementation* lives in
 * `@bitcode/generic-pipelines-sdivf` and is re-exported here for compatibility.
 *
 * Hierarchy:
 *   pipelines-generics (this package — primitives)
 *     → generic-pipelines/SDIVF (base SDIVF loop)
 *       → pipeline-asset-pack (SynthesizeAssetPacks / settle-asset-pack-pipeline)
 *
 * Core Concepts:
 * - Pipeline: Top-level Executor orchestrating phases
 * - ExecutionPhaseDelegator: Executor that delegates work to Agents
 * - SDIVF base: Setup-[Discovery-Implementation-Validation]*-Finish (generic-pipelines-sdivf)
 * 
 * @doc-code
 * type: package
 * category: pipeline-primitives
 * pattern: executor-composition
 */

// Pipeline and ExecutionPhaseDelegator types
export {
  type Pipeline,
  ExecutionPipeline,
  type ExecutionPhaseDelegator,
  ExecutionPhase,
  factoryExecutionPipeline,
  factoryExecutionPhase
} from './execution/pipeline-types';
export {
  type ExecutionPipelineLineage,
  type ExecutionPipelineFamily,
  type ExecutionPipelinePosture,
  inferExecutionPipelineLineage
} from './execution/ExecutionPipeline';

// Pipeline factories
export {
  factoryPipeline,
  factoryPipelineWithDIVFinishLoop
} from './pipeline-factory';

// Quick pipeline (single QuickPhase, no phases semantics)
export {
  factoryQuickPipeline,
  type QuickPhase
} from './quick-pipeline';

// Phase factories (primitives)
export {
  factoryPhaseDelegator,
  factorySequentialPhaseDelegator,
  factoryParallelPhaseDelegator,
} from './phases/phase-factory';

// ExecutionPipelineSDIVF base — owned by @bitcode/generic-pipelines-sdivf
// (re-exported for compatibility; prefer importing that package directly)
export {
  factoryExecutionPipelineSDIVFPhaseDelegators,
  ExecutionPipelineSDIVFPhase,
  factoryExecutionPipelineSDIVF,
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVF,
  type ExecutionPipelineSDIVFConfig,
  type ExecutionPipelineSDIVFExecutorConfig,
} from '@bitcode/generic-pipelines-sdivf';

// Streaming integration for real-time pipeline updates
export {
  enablePipelineStreaming,
  createStreamingExecution,
  emitPhaseTransition,
  emitAgentActivity,
  emitToolUsage,
  type PipelineStreamConfig
} from './streaming/pipeline-stream-integration';

// Pipeline Prompt (EE) + hierarchical attach helpers
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
  factoryExecutionPhasePrimitivePrompt,
  EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT,
  EXECUTION_PHASE_PRIMITIVE_DISCOVERY_PROMPT,
  EXECUTION_PHASE_PRIMITIVE_IMPLEMENTATION_PROMPT,
  EXECUTION_PHASE_PRIMITIVE_VALIDATION_PROMPT,
  EXECUTION_PHASE_PRIMITIVE_FINISH_PROMPT,
} from './prompts/execution-phase-primitive-prompt';
export {
  attachExecutionPipelinePromptHierarchy,
  attachExecutionPhasePromptHierarchy,
  resolveExecutionPipelinePromptHost,
} from './prompts/execution-prompt-attach-hierarchy';

// Metrics
export { computePipelineMetrics } from './execution/Metrics';
export { descendExecution, resumeDescriptorFromEvent } from './execution/resume';

// Minimal agent→executor adapter for composition
export { createAgentExecutor } from './execution/agent-executor';
export { isExecutionDebugEnabled, enableExecutionDebug, debugWrapExecutorStep } from './execution/debug';

// Canonical primitive types and mappers (DB + Streams SSOT)
export type {
  PhaseLower,
  PhaseTitle,
  StepLower,
  StepTitle,
  MetaStep,
  SubStep,
  ExecutionState
} from './types/primitives';
export { toPhaseLower, toPhaseTitle, toStepLower, isMetaStep, isSubStep } from './types/primitives';

// Pipeline DB aliases (built from ORM types)
export type {
  DPPhaseDelegation,
  DPPhaseDelegationInsert,
  DPAgentStep,
  DPAgentStepInsert,
  DPGeneration,
  DPGenerationInsert,
  DPToolExec,
  DPToolExecInsert
} from './types/db';

// Direct pipeline-runner composition exports.
export {
  createPhaseRunner,
  type PhaseConfig,
  type AgentStep
} from './execution/ExecutionPipelineExecutor';

// Registry surfaces used by asset-packs-pipelines domain preprocess.
export { ExecutionPipelineLLMRegistry } from './execution/ExecutionPipelineLLMRegistry';
export { ExecutionPipelinePromptRegistry } from './execution/ExecutionPipelinePromptRegistry';
export { ExecutionPipelineToolRegistry } from './execution/ExecutionPipelineToolRegistry';
export { ExecutionPipelineAgentRegistry } from './execution/ExecutionPipelineAgentRegistry';
// Class re-export for callers that need the concrete execution type symbol.
export { ExecutionPipeline as ExecutionPipelineClass } from './execution/ExecutionPipeline';
