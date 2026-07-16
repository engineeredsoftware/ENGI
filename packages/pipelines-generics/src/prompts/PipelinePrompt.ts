/**
 * PipelinePrompt - Primitive Prompt class for pipeline call-site authoring.
 *
 * Content lives in raw_promptparts; this class (and product subclasses)
 * assemble hierarchical paths under ExecutionPrompt roots when attached.
 *
 * Call-site law: see .docs/PROMPTING.md
 *   Pipeline composed = Execution ⊕ Pipeline ⊕ base ⊕ specific (once)
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart, type PromptPart } from '@bitcode/prompts/parts/PromptPart';

/**
 * Base Pipeline Prompt registry.
 *
 * Specific pipeline implementations merge base/specific layers; attach
 * folds Execution once via attachPipelinePromptHierarchy.
 */
export class PipelinePrompt extends Prompt {
  constructor() {
    super();
    this.require('generic_system');
    this.require('specific_execution');
  }

  setPipeline(path: string, prompt: PromptPart | string): this {
    const part = typeof prompt === 'string' ? createPromptPart(prompt) : prompt;
    return this.set(`specific_execution:pipeline:${path}`, part);
  }

  setPhase(path: string, prompt: PromptPart | string): this {
    const part = typeof prompt === 'string' ? createPromptPart(prompt) : prompt;
    return this.set(`specific_execution:phase:${path}`, part);
  }

  setAgent(path: string, prompt: PromptPart | string): this {
    const part = typeof prompt === 'string' ? createPromptPart(prompt) : prompt;
    return this.set(`specific_execution:agent:${path}`, part);
  }

  static create(name: string): PipelinePrompt {
    const prompt = new PipelinePrompt();
    prompt.setPipeline('name', name);
    return prompt;
  }
}
