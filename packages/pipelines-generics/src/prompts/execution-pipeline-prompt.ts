/**
 * ExecutionPipelinePrompt - Primitive Prompt class for pipeline call-site authoring.
 *
 * LAW: Callers pass PromptPart values imported from raw_promptparts — never
 * ad-hoc strings. setPipeline/setPhase/setAgent accept PromptPart only.
 *
 * Call-site law: see .docs/PROMPTING.md
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizereadsassetpacks_name_corestatement';

/**
 * Base Pipeline Prompt registry.
 *
 * Specific pipeline implementations merge base/specific layers; attach
 * folds Execution once via attachExecutionPipelinePromptHierarchy.
 */
export class ExecutionPipelinePrompt extends Prompt {
  constructor() {
    super();
    this.require('generic_system');
    this.require('specific_execution');
  }

  setPipeline(path: string, prompt: PromptPart): this {
    return this.set(`specific_execution:pipeline:${path}`, prompt);
  }

  setPhase(path: string, prompt: PromptPart): this {
    return this.set(`specific_execution:phase:${path}`, prompt);
  }

  setAgent(path: string, prompt: PromptPart): this {
    return this.set(`specific_execution:agent:${path}`, prompt);
  }

  /**
   * Factory: seed pipeline name with a raw PromptPart (not free-form string).
   * Default uses read synthesize name only as a convenience demo path;
   * product code should pass its own name part.
   */
  static create(namePart: PromptPart = PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_NAME_CORESTATEMENT): ExecutionPipelinePrompt {
    const prompt = new ExecutionPipelinePrompt();
    prompt.setPipeline('name', namePart);
    return prompt;
  }
}
