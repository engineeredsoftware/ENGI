/**
 * @bitcode/agent-generics generations
 *
 * Base implementations of Generation-shaped factories used under PTRR steps:
 * Failsafe generations, Thinkings generations, and tools postprocess.
 */

export * from './factories';
export {
  createThinkingsGeneration,
  isSkipThinkingsJudgeAndStructuredOutput,
} from '../steps/thinkings-generation';
export {
  createFailsafeGenerationSequence,
  createContextfulFailsafedThinkingsGeneration,
  isSkipFailsafes,
} from '../steps/failsafe-sequence';
