/**
 * Agent-specific prompt exports
 * 
 * Complete prompt hierarchy with progressive specificity:
 * 
 * 1. AgentPrompt: Minimal (name + identity only)
 * 2. AgentStepPrompt: Step purpose only (Plan/Try/Refine/Retry)
 * 3. FailsafeGenerationPrompt: Handling instruction (Context/Chunk/Stitch)
 * 4. ThinkingsGenerationPrompt: Generation instruction (Reason/Judge/Output)
 * 5. ToolExecutionPrompt: Tool execution instruction
 *
 * Tools and schemas are injected automatically at execution time.
 * Each level adds minimal context that applies to all its children.
 *
 */

export { AgentPrompt, type AgentPromptConfig } from './AgentPrompt';
export { AgentStepPrompt, type AgentStepPromptConfig } from './AgentStepPrompt';
export { FailsafeGenerationPrompt, type FailsafeGenerationPromptConfig } from './FailsafeGenerationPrompt';
export { ThinkingsGenerationPrompt, type ThinkingsGenerationPromptConfig } from './ThinkingsGenerationPrompt';
export { ToolExecutionPrompt, type ToolExecutionPromptConfig } from './ToolExecutionPrompt';

/** @deprecated Prefer FailsafeGenerationPromptConfig */
export type { ThinkingsGenerationPromptConfig as AgentGenerationSubStepPromptConfig } from './ThinkingsGenerationPrompt';