/**
 * AGENT-GENERICS - Agent orchestration primitives over generation bases
 *
 * Hierarchy:
 *   generation-generics → generic-generations/{failsafes,thinkings}
 *     → agent-generics (this package: Agent, Step, Generation factories, QuickAgent)
 *     → generic-agents/PTRR (PTRRAgent base: Plan→Try→Retry→Refine)
 *     → product / measure / conversation agents
 *
 * PTRR base lives in `@bitcode/generic-agents-ptrr` and is re-exported for product agent assembly.
 * Each PTRR step runs 3 FailsafeGenerations (PrepareConciseContext → ChunkThenSum →
 * StitchUntilComplete), each driving ThinkingsGeneration (Reason → Judge → StructuredOutput).
 * There is no "substep" construct — Failsafes and Thinkings are Generations.
 *
 * Generation vocabulary: @bitcode/generation-generics
 * Failsafe prepared-context types: @bitcode/generic-generations-failsafes
 * LLM-bound failsafe/thinkings factories: ./generations
 *
 * @doc-package
 * version: 1.0.0
 * pattern: agent-primitives + ptrr-reexport
 * philosophy: "Agents compose generic generations; product specializes agents"
 */

// ==================== CORE TYPES ====================

// Generation vocabulary (prefer direct import from generation-generics)
export {
  FailsafeGeneration,
  ThinkingsGeneration,
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

// Agent creation (primitives)
export {
  factoryAgent,
  factoryAgentWithSingleStep,
  factoryQuickAgent,
  factoryAgentWithGenerations,
} from './agents/factories';

// PTRR base — implementation in @bitcode/generic-agents-ptrr (prefer direct import)
export {
  factoryPTRRAgent,
  factoryPTRRAgentWithGenerations,
  type PTRRAgent,
  type BitcodePTRRFactoryConfig,
  type BitcodePTRRPromptCarrier,
  type BitcodePTRRPromptValue,
  type BitcodePTRRStepName,
  type BitcodePTRRStepPromptCarrier,
  type BitcodePTRRStepPromptRegistry,
} from '@bitcode/generic-agents-ptrr';


// ==================== MEASUREMENT ====================
//
// Hierarchy (full ancestry naming at product layers):
//   Measurement primitives     → @bitcode/measurement-generics
//   MeasureAgent base          → @bitcode/generic-measurements-measure-agent
//   AbsolutesMeasureAgent      → @bitcode/generic-measurements-absolutes
//   NeedinessesMeasureAgent    → @bitcode/generic-measurements-needinesses
//   SynthesizeAssetPacks…      → @bitcode/generic-asset-packs-synthesis
//
// Composition re-exports of the measurement hierarchy (leaf packages remain source of truth).

export {
  MeasurementReadingSchema,
  MeasurementOutputSchema,
  type MeasurementKindCategory,
  type MeasurementSpec,
  type MeasurementReading,
  type MeasurementOutput,
} from '@bitcode/measurement-generics';

export {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasureAgentConfig,
} from '@bitcode/generic-measurements-measure-agent';

export {
  factoryAbsolutesMeasureAgent,
  type AbsolutesMeasureAgent,
  type AbsolutesMeasureAgentConfig,
} from '@bitcode/generic-measurements-absolutes';

export {
  NEEDINESSES_MEASUREMENT_CATEGORY,
  NEEDINESSES_FRAMING,
  type NeedinessesMeasureAgentConfig,
} from '@bitcode/generic-measurements-needinesses';

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
export {
  PlanStepOutputSchema,
  omitUseToolsFromSchema,
  sanitizeRefineStepOutput,
  type PlanStepOutput,
} from './steps/step-schemas';
// Generation factories (Failsafe + Thinkings + tools + step aliases)
export {
  factoryPlanGeneration,
  factoryTryGeneration,
  factoryRefineGeneration,
  factoryRetryGeneration,
  factoryGeneration,
  createFailsafedGenerationSequence,
  createFailsafedThinkingsGeneration,
  createFailsafedGeneration,
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete,
  PCC_KEY_SELECTION_SCHEMA,
  type PrepareConciseContextSelectionInput,
  factoryReason,
  factoryJudge,
  factoryStructuredOutput,
  factoryToolsExecution,
  factoryValidation,
  factoryAgentFailsafeGenerationExecution,
  factoryAgentThinkingsGenerationExecution,
  factoryAgentToolGenerationExecution,
  projectPromptSafeValue,
  safePromptJson,
  isPreparedTaskInput,
  buildPreparedTaskLlmPayload,
} from './generations/factories';
export {
  createThinkingsGeneration,
  isSkipThinkingsJudgeAndStructuredOutput,
} from './steps/thinkings-generation';
export {
  createFailsafeGenerationSequence,
  createContextfulFailsafedThinkingsGeneration,
  isSkipFailsafes,
} from './steps/failsafe-sequence';

// ==================== EXECUTION TYPES ====================

// Agent execution hierarchy with full registry support
export {
  AgentExecution,
  createAgentExecution,
  StepExecution,
  GenerationExecution,
  FailsafeGenerationExecution,
  ThinkingsGenerationExecution,
  factoryStepExecution,
  factoryGenerationExecution,
  factoryFailsafeGenerationExecution,
  factoryThinkingsGenerationExecution,

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
