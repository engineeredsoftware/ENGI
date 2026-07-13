/**
 * AGENT-GENERICS - Agent orchestration primitives over generation bases
 *
 * Hierarchy:
 *   generation-generics → generic-generations/{failsafes,thinkings}
 *     → agent-generics (this package: Agent primitive, execution, substeps, QuickAgent)
 *     → generic-agents/PTRR (PTRRAgent base: Plan→Try→Refine→Retry)
 *     → product / measure / conversation agents
 *
 * PTRR base lives in `@bitcode/generic-agents-ptrr` and is re-exported here for BC.
 * Each PTRR step runs 3 failsafe parents (PrepareConciseContext → ChunkThenSum →
 * StitchUntilComplete), each driving Thinkings (Reason → Judge → StructuredOutput).
 *
 * Generation vocabulary: @bitcode/generation-generics
 * Failsafe prepared-context types: @bitcode/generic-generations-failsafes
 * LLM-bound failsafe/thinkings factories still hosted here until AgentExecution
 * coupling is inverted into pure Execution + LLM registry.
 *
 * @doc-package
 * version: 1.0.0
 * pattern: agent-primitives + ptrr-reexport
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
  factoryAgentWithPTRR,
  factoryAgentWithPTRRGenerations,
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
//   SynthesizeAssetPacks…      → @bitcode/asset-packs-synthesis
//
// Re-exported for compatibility; prefer package-direct imports in new code.

export {
  MeasurementReadingSchema,
  MeasurementOutputSchema,
  MeasureAgentOutputSchema,
  type MeasurementCategory,
  type MeasurementSpec,
  type MeasurementReading,
  type MeasurementOutput,
  type MeasureAgentOutput,
} from '@bitcode/measurement-generics';

export {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasureAgentConfig,
} from '@bitcode/generic-measurements-measure-agent';

export {
  factoryAbsolutesMeasureAgent,
  factoryMeasureAgentAbsolutes,
  type AbsolutesMeasureAgent,
  type AbsolutesMeasureAgentConfig,
  type MeasureAgentAbsolutesConfig,
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
