/**
 * Generation factories — public entry for LLM-bound Failsafe + Thinkings
 * factories and PTRR step generation aliases.
 *
 * Hierarchy:
 *   Agent → Step → FailsafeGeneration (×3) → ThinkingsGeneration (Reason→Judge→SO)
 *                → tools postprocess
 */

// PTRR step factories re-exported under generation-first names
export {
  factoryPlanStep as factoryPlanGeneration,
  factoryTryStep as factoryTryGeneration,
  factoryRefineStep as factoryRefineGeneration,
  factoryRetryStep as factoryRetryGeneration,
  factoryStep as factoryGeneration,
} from '../steps/factories';

export {
  createFailsafeGenerationSequence as createFailsafedGenerationSequence,
  createContextfulFailsafedThinkingsGeneration as createFailsafedThinkingsGeneration,
  createFailsafedGeneration,
} from '../steps/failsafe-sequence';

// LLM-bound Failsafe / Thinkings / tools generation factories
export {
  // Prompt-safe helpers
  projectPromptSafeValue,
  safePromptJson,
  // Execution node factories
  factoryAgentFailsafeGenerationExecution,
  factoryAgentThinkingsGenerationExecution,
  factoryAgentToolGenerationExecution,
  // Failsafe generations
  PCC_KEY_SELECTION_SCHEMA,
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete,
  type PrepareConciseContextSelectionInput,
  // Thinkings generations
  factoryReason,
  factoryJudge,
  factoryStructuredOutput,
  // Tools postprocess + validation
  factoryToolsExecution,
  factoryValidation,
} from './llm-bound-factories';
