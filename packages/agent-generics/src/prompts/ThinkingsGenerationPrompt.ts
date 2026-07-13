/**
 * ThinkingsGenerationPrompt — minimal prompt for ThinkingsGeneration children.
 *
 * Adds the generation instruction for Reason / Judge / StructuredOutput.
 * At this level, tools_doc_code_tools and output_schema are AUTOMATICALLY added
 * by the execution system.
 *
 * Hierarchy: Generation → ThinkingsGeneration (children of each FailsafeGeneration)
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide generation instruction for thinkings execution"
 * current_version: "BITCODE_V26_AGENT_GENERATION_SUBSTEP_PROMPT_REGISTRY.1"
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

export interface ThinkingsGenerationPromptConfig {
  // Just the generation instruction
  generate: PromptPart; // What to generate (reason/judge/structured output)
}

/**
 * ThinkingsGenerationPrompt — instruction for one Thinkings generation kind.
 *
 * Contains only the generation instruction. The execution system
 * automatically adds:
 * - tools_doc_code_tools: Documentation for available tools
 * - output_schema: Expected output schema (for StructuredOutput)
 *
 * These are NOT manually set — they're injected at execution time
 * based on what's available to this specific ThinkingsGeneration.
 */
export class ThinkingsGenerationPrompt extends Prompt {
  constructor(config: ThinkingsGenerationPromptConfig) {
    super();
    
    // Set only the generation instruction
    this.set('substep:generate', config.generate);
    
    // tools_doc_code_tools and output_schema are added AUTOMATICALLY
    // at execution time - we don't set them here!
  }
  
  /**
   * Get the generation instruction
   */
  getGenerate(): PromptPart {
    return this.get('substep:generate') as PromptPart;
  }
  
  /**
   * Called by execution system to inject tool documentation
   * @internal
   */
  injectToolDocs(toolDocs: PromptPart): void {
    this.set('auto:tools_doc_code_tools', toolDocs);
  }
  
  /**
   * Called by execution system to inject output schema
   * @internal
   */
  injectOutputSchema(schema: PromptPart): void {
    this.set('auto:output_schema', schema);
  }
}
