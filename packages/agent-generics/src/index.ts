/**
 * AGENT-GENERICS - Agent orchestration over generation bases
 *
 * Hierarchy:
 *   generation-generics → generic-generations/{failsafes,thinkings}
 *     → agent-generics (this package: Agent + PTRR composition)
 *     → product (pipeline-asset-pack agents / synthesis)
 *
 * Agents are Executors that sequence PTRR-style steps. Each step runs 3 failsafe
 * parents (PrepareConciseContext → ChunkThenSum → StitchUntilComplete), each
 * driving Thinkings (Reason → Judge → StructuredOutput). Tools run after failsafes.
 *
 * Generation vocabulary: @bitcode/generation-generics
 * Failsafe prepared-context types: @bitcode/generic-generations-failsafes
 * LLM-bound failsafe/thinkings factories still hosted here until AgentExecution
 * coupling is inverted into pure Execution + LLM registry.
 *
 * @doc-package
 * version: 1.0.0
 * pattern: ptrr-orchestration
 * philosophy: "Agents compose generic generations; product specializes agents"
 */

// ==================== CORE TYPES ====================

// Generation vocabulary (prefer direct import from generation-generics)
export {
  FailsafeMetaSubStep,
  GenerationSubMetaSubStep,
  type Generation,
} from '@bitcode/generation-generics';

// Failsafe prepared-context types (prefer generic-generations-failsafes)
export type {
  PreparedContext,
  ContextSelector,
  PrepareConciseContextOptions,
  PrepareConciseContextResult,
} from '@bitcode/generic-generations-failsafes';
export {
  estimateSerializedSize,
  createContextSelectors,
  chunkContext,
  prepareConciseContext,
} from '@bitcode/generic-generations-failsafes';

// Agent enums and types
export {
  AgentVariationStep,
} from './types';

// Agent interfaces
export type {
  Agent,
  AgentStep,
  AgentGeneration,
  QuickAgent,
  StepExecutor,
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
