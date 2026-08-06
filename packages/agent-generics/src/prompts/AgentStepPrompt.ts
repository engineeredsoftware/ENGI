/**
 * Agent Step Prompt - Minimal prompt for step-level context
 * 
 * AgentStepPrompt adds step-specific context (Plan/Try/Refine/Retry)
 * to the Registry-backed agent-level prompt. Still minimal: only the purpose of the step.
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide step-specific purpose that applies to all generations under the step"
 * current_version: "BITCODE_V26_AGENT_STEP_PROMPT_REGISTRY.1"
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

export interface AgentStepPromptConfig {
  // Just the purpose of this step
  purpose: PromptPart; // What this step does (Plan/Try/Refine/Retry)
}

/**
 * AgentStepPrompt - Minimal step-level prompt
 * 
 * Adds only the step purpose. This applies to all Failsafe and
 * Thinkings generations within this PTRR step.
 */
export class AgentStepPrompt extends Prompt {
  constructor(config: AgentStepPromptConfig) {
    super();
    
    // Set only the purpose
    this.set('step:purpose', config.purpose);
    
    // That's it! Progressive specificity
  }
  
  /**
   * Get the step purpose
   */
  getPurpose(): PromptPart {
    return this.get('step:purpose') as PromptPart;
  }
}
