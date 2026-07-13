/**
 * FailsafeGenerationPrompt — minimal prompt for a FailsafeGeneration parent.
 *
 * Adds context for the three failsafe kinds:
 * - PrepareConciseContext: CONTEXT SIGNAL/NOISE
 * - ChunkThenSum: BIG INPUT
 * - StitchUntilComplete: CONVERSATIONSUTPUT
 *
 * Hierarchy: Generation → FailsafeGeneration → (ThinkingsGeneration children)
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide failsafe handling instruction"
 * current_version: "BITCODE_V26_FAILSAFE_SUBSTEP_PROMPT_REGISTRY.1"
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

export interface FailsafeGenerationPromptConfig {
  // Just what this failsafe handles
  handle: PromptPart; // e.g., "Filter context noise" / "Process chunks" / "Complete output"
}

/**
 * FailsafeGenerationPrompt — handling instruction for one FailsafeGeneration.
 *
 * Contains only the handling instruction. Each failsafe runs ThinkingsGeneration
 * children (Reason → Judge → StructuredOutput).
 */
export class FailsafeGenerationPrompt extends Prompt {
  constructor(config: FailsafeGenerationPromptConfig) {
    super();
    
    // Set only the handling instruction
    this.set('failsafe:handle', config.handle);
  }
  
  /**
   * Get the handling instruction
   */
  getHandle(): PromptPart {
    return this.get('failsafe:handle') as PromptPart;
  }
}
