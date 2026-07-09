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
export class ExecutionPrompt extends Prompt {
  constructor() {
    super();
    
    // Enforce root hierarchy - nothing else allowed at root
    this.require('generic_system');
    this.require('specific_execution');
  }
  
  /**
   * Record normalized preprocess intent under system prompts
   * Example path: preprocess/compute or preprocess/multi
   */
  setPreprocess(path: string, prompt: PromptPart): this {
    return this.setGenericSystem(`preprocess:${path}`, prompt);
  }

  /**
   * Set a generic system prompt
   */
  setGenericSystem(path: string, prompt: PromptPart): this {
    return this.set(`generic_system:${path}`, prompt);
  }
  
  /**
   * Set a specific execution prompt
   */
  setSpecificExecution(path: string, prompt: PromptPart): this {
    return this.set(`specific_execution:${path}`, prompt);
  }
  
  /**
   * Override set to enforce hierarchy
   */
  set(path: string, value: PromptPart, priority: number = 0): this {
    // Validate path starts with one of the two roots
    if (!path.startsWith('generic_system:') && !path.startsWith('specific_execution:') &&
        path !== 'generic_system' && path !== 'specific_execution') {
      throw new Error(
        `Invalid prompt path: ${path}. All paths must start with 'generic_system:' or 'specific_execution:'`
      );
    }
    
    return super.set(path, value, priority);
  }
}

export function createExecutionPrompt(): ExecutionPrompt {
  return new ExecutionPrompt();
}
