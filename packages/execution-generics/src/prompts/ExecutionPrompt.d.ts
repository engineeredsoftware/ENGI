import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
/**
 * ExecutionPrompt - Base prompt for all executions with enforced hierarchy
 *
 * @doc-comment-developing-promptdevelopment
 * versions: []
 * domain: execution
 * intent: "Base prompt for all executions with enforced hierarchy ensuring proper system and execution prompt organization"
 *
 * All prompts MUST be under one of two root paths:
 * - generic_system: Reusable system prompts
 * - specific_execution: Execution-specific prompts
 */
export declare class ExecutionPrompt extends Prompt {
    constructor();
    /**
     * Record normalized preprocess intent under system prompts
     * Example path: preprocess/compute or preprocess/multi
     */
    setPreprocess(path: string, prompt: PromptPart): this;
    /**
     * Set a generic system prompt
     */
    setGenericSystem(path: string, prompt: PromptPart): this;
    /**
     * Set a specific execution prompt
     */
    setSpecificExecution(path: string, prompt: PromptPart): this;
    /**
     * Override set to enforce hierarchy
     */
    set(path: string, value: PromptPart, priority?: number): this;
}
export declare function createExecutionPrompt(): ExecutionPrompt;
