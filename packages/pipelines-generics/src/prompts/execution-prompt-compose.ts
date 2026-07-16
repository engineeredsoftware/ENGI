/**
 * Re-export call-site compose primitives from execution-generics.
 *
 * Prefer importing from `@bitcode/execution-generics` for new code.
 * This path remains for pipeline-package-local imports during the stack.
 */

export {
  applyPromptRegistryToExecutionPrompt,
  applyComposedCallSiteNodePrompt,
  type PromptRegistryLike,
} from '@bitcode/execution-generics';
export {
  composePromptLayers,
  composeNamespacedPromptLayers,
} from '@bitcode/execution-generics';
