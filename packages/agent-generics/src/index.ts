/**
 * AGENT-GENERICS - Retained agent orchestration primitives
 *
 * Agents are Executors that sequence retained PTRR-style steps.
 * This package survives as reusable orchestration infrastructure and as a
 * reference surface for Bitcode-native pipelines; it is not itself proof that
 * the old agent families remain live Bitcode canon.
 *
 * Different agent implementations are selected from registries dynamically.
 * Each step runs 3 failsafe parents sequentially, each running 3 generation children.
 * Tools execute AFTER all failsafes complete (conditional on reasoning + judgment output).
 * 
 * Key Abstractions:
 * - Agent: Executor that sequences PTRR steps
 * - Step: StepExecutor that sequences 7 SubSteps
 * - SubStep: The atomic operations (3 failsafes + 3 generation + 1 tool)
 * 
 * @doc-package
 * version: 1.0.0
 * pattern: ptrr-orchestration
 * philosophy: "Retained orchestration families remain reusable, but Bitcode decides which ones are admitted as live product behavior"
 */

// ==================== CORE TYPES ====================

// Agent enums and types
export {
  AgentVariationStep,
  FailsafeMetaSubStep,
  GenerationSubMetaSubStep
} from './types';

// Agent interfaces
export type {
  Agent,
  AgentStep,
  AgentGeneration,
  QuickAgent,
  StepExecutor,
  PreparedContext,
  Chunk,
  Reasoning,
  UseTool,
  Judgment,
  UsedTool
} from './types';

// ==================== AGENT FACTORIES ====================

// Agent creation
export {
  factoryAgent,
  factoryAgentWithPTRR,
  factoryAgentWithSingleStep,
  factoryQuickAgent
} from './agents/factories';
export {
  factoryAgentWithGenerations,
  factoryAgentWithPTRRGenerations
} from './agents/factories';
export type {
  BitcodePTRRFactoryConfig,
  BitcodePTRRPromptCarrier,
  BitcodePTRRPromptValue,
  BitcodePTRRStepName,
  BitcodePTRRStepPromptCarrier,
  BitcodePTRRStepPromptRegistry
} from './agents/factories';

// ==================== MEASURE AGENTS ====================

// The measurement base hierarchy: measure-agent (PTRR base) ->
// measure-agent-absolutes (+ measure-agent-needinesses, Gate 4) -> the asset-pack
// concrete measurers. Layered factories, not class inheritance.
export {
  factoryMeasureAgent,
  MeasurementReadingSchema,
  MeasureAgentOutputSchema
} from './agents/measure-agent';
export type {
  MeasureAgent,
  MeasureAgentConfig,
  MeasureAgentOutput,
  MeasurementCategory,
  MeasurementReading,
  MeasurementSpec
} from './agents/measure-agent';
export { factoryMeasureAgentAbsolutes } from './agents/measure-agent-absolutes';
export type { MeasureAgentAbsolutesConfig } from './agents/measure-agent-absolutes';

// ==================== STEP FACTORIES ====================

// PTRR step creation
export {
  factoryPlanStep,
  factoryTryStep,
  factoryRefineStep,
  factoryRetryStep,
  factoryStep
} from './steps/factories';
// Canonical PTRR STEP output schemas (step outputs validate against STEP
// schemas, not the full agent schema — Plan's default plan shape lives here)
export { PlanStepOutputSchema, type PlanStepOutput } from './steps/step-schemas';
// Generation-first aliases
export {
  factoryPlanGeneration,
  factoryTryGeneration,
  factoryRefineGeneration,
  factoryRetryGeneration,
  factoryGeneration,
  createFailsafedGenerationSequence,
  createFailsafedThinkingsGeneration,
  createFailsafedGeneration
} from './generations/factories';
export { createThinkingsGeneration } from './steps/thinkings-generation';
export {
  createFailsafeGenerationSequence,
  createContextfulFailsafedThinkingsGeneration
} from './steps/failsafe-sequence';

// ==================== SUBSTEP FACTORIES ====================

// Failsafe substeps
export {
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete,
  PCC_KEY_SELECTION_SCHEMA,
  type PrepareConciseContextSelectionInput
} from './substeps/factories';

// Generation substeps
export {
  factoryReason,
  factoryJudge,
  factoryStructuredOutput,
  factoryToolsExecution,
  factoryValidation
} from './substeps/factories';

// Substep execution factories
export {
  factoryAgentFailsafeSubStepExecution,
  factoryAgentGenerationSubStepExecution,
  factoryAgentToolSubStepExecution
} from './substeps/factories';

// ==================== EXECUTION TYPES ====================

// Agent execution hierarchy with full registry support
export {
  AgentExecution,
  createAgentExecution,
  StepExecution,
  SubStepExecution,
  factoryStepExecution,
  factorySubStepExecution,
  
  // Registries
  AgentPromptsRegistry,
  AgentToolsRegistry,
  AgentLLMsRegistry,
  AgentAgentsRegistry,
  
  // Types
  ExecutionTool
} from './execution';

// Export ExecutionAgent as a type
export type { ExecutionAgent } from './execution';

// Export prompt structures
export { AgentPrompt } from './prompts/AgentPrompt';
export type { AgentPromptConfig } from './prompts/AgentPrompt';
export { AgentStepPrompt } from './prompts/AgentStepPrompt';
export type { AgentStepPromptConfig } from './prompts/AgentStepPrompt';

// Diagnostics
export { collectExecutionTrace, collectAgentTrace } from './diagnostics/trace';

// File diff integration
export {
  streamFileChangesAfterStep,
  withFileDiffStreaming
} from './execution/file-diff-integration';

// Phase helpers
export { normalizeStepName } from './phaseHelpers/normalizeStepName';
