/**
 * PIPELINES-GENERICS - Pipeline Execution Primitives
 *
 * This package provides the foundational abstractions for building
 * pipelines. Pipelines are Executors that sequence PhaseDelegators.
 * PhaseDelegators are Executors that delegate to Agents.
 *
 * These are reusable orchestration primitives (Pipeline, PhaseDelegator,
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
 * - PhaseDelegator: Executor that delegates work to Agents
 * - SDIVF base: Setup-[Discovery-Implementation-Validation]*-Finish (generic-pipelines-sdivf)
 * 
 * @doc-code
 * type: package
 * category: pipeline-primitives
 * pattern: executor-composition
 */

// Pipeline and PhaseDelegator types
export {
  type Pipeline,
  PipelineExecution,
  type PhaseDelegator,
  PhaseDelegation,
  factoryPipelineExecution,
  factoryPhaseDelegation
} from './execution/pipeline-types';
export {
  type PipelineExecutionLineage,
  type PipelineExecutionFamily,
  type PipelineExecutionPosture,
  inferPipelineExecutionLineage
} from './execution/PipelineExecution';

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

// SDIVFPipeline base — owned by @bitcode/generic-pipelines-sdivf
// (re-exported for compatibility; prefer importing that package directly)
export {
  factorySDIVFPipelinePhaseDelegators,
  factorySDIVFPhaseDelegators,
  SDIVFPipelinePhase,
  SDIVFPhase,
  factorySDIVFPipeline,
  factorySDIVFPipelineFromExecutors,
  factorySDIVFExecutorPipeline,
  type SDIVFPipeline,
  type SDIVFPipelineConfig,
  type SDIVFPipelineExecutorConfig,
  type SDIVFConfig,
  type SDIVFExecutorConfig,
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

// Pipeline Prompt (EE)
export { PipelinePrompt } from './prompts/PipelinePrompt';

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
} from './execution/PipelineExecutor';

// Registry surfaces used by asset-packs-pipelines domain preprocess.
export { PipelineLLMRegistry } from './execution/PipelineLLMRegistry';
export { PipelinePromptRegistry } from './execution/PipelinePromptRegistry';
export { PipelineToolRegistry } from './execution/PipelineToolRegistry';
export { PipelineAgentRegistry } from './execution/PipelineAgentRegistry';
// Class re-export for callers that need the concrete execution type symbol.
export { PipelineExecution as PipelineExecutionClass } from './execution/PipelineExecution';
