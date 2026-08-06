/**
 * PROMPT PART - SEMANTIC UNIT OF INTELLIGENCE
 *
 * LAW: authored PromptPart *strings* live exclusively under
 * packages/prompts/src/raw_promptparts/{generic,specific}/.
 * Outside that tree: import PROMPTPART_* and assemble Prompt registries;
 * use createPromptPartFromPrompt only to brand composed format() output.
 */

import type { Prompt } from '../prompt';

export type PromptPart = string & {
  readonly __brand: 'PromptPart';
};

/**
 * Brand a string as PromptPart.
 * **Residence law:** only inside raw_promptparts (or package-internal re-brand).
 */
export declare function createPromptPart(content: string): PromptPart;

/**
 * Brand a composed Prompt's formatted text as one PromptPart (no new prose).
 */
export declare function createPromptPartFromPrompt(prompt: Prompt): PromptPart;

export declare function isPromptPart(value: unknown): value is PromptPart;

export declare const EMPTY_PROMPT_PART: PromptPart;

export interface PromptPartMetadata {
  id: string;
  category: 'generic' | 'specific';
  semanticType: 'identity' | 'objective' | 'methodology' | 'behavior' | 'constraint' | 'tool_doc';
  version: string;
  dependencies?: string[];
  optimizations?: {
    cacheable?: boolean;
    precompile?: boolean;
    inline?: boolean;
  };
}
