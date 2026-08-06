/**
 * PROMPT PART - SEMANTIC UNIT OF INTELLIGENCE
 *
 * PromptPart is the foundational type for all prompts in Bitcode.
 * It represents a semantic, composable unit of prompt intelligence.
 *
 * ## LAW (PromptPart residence)
 *
 * ALL authored PromptPart *strings* are written exclusively under:
 *   packages/prompts/src/raw_promptparts/{generic,specific}/
 * with naming:
 *   promptpart_[generic|specific]_[domain]_[PROMPTCLASSNAME]_[semanticcontext]_[POSITION].ts
 *
 * Outside raw_promptparts:
 *   - Import raw PROMPTPART_* constants
 *   - Assemble them into Prompt registries
 *   - Use createPromptPartFromPrompt(prompt) only to brand a *composed* Prompt.format() result
 *
 * NEVER author prompt prose via createPromptPart('…') outside raw_promptparts.
 *
 * @category Core Types
 * @priority Critical - Foundation of prompt system
 */

import type { Prompt } from '../prompt';

/**
 * PromptPart - A semantic unit of prompt content
 *
 * Branded string for type safety. PromptParts are immutable semantic units.
 */
export type PromptPart = string & { readonly __brand: 'PromptPart' };

/**
 * Brand a string as PromptPart.
 *
 * **Residence law:** Call this only inside `raw_promptparts/**` (or package-internal
 * plumbing that re-brands an already-raw constant). Do not use with ad-hoc prose
 * outside raw_promptparts — write a raw file and import it.
 */
export function createPromptPart(content: string): PromptPart {
  return content as PromptPart;
}

/**
 * Brand the formatted text of an assembled Prompt as a single PromptPart.
 *
 * Use when a composed Prompt (primitive ⊕ base ⊕ specific raw parts) becomes
 * one call-site node block (e.g. applyComposedCallSiteNodePrompt).
 * Does not author new prose — only formats paths already filled from raw parts.
 */
export function createPromptPartFromPrompt(prompt: Prompt): PromptPart {
  let text = '';
  try {
    if (typeof (prompt as any).format === 'function') {
      text = String((prompt as any).format() || '').trim();
    }
  } catch {
    text = '';
  }
  if (!text) {
    const getPaths =
      typeof (prompt as any).getAllPaths === 'function'
        ? () => (prompt as any).getAllPaths()
        : typeof (prompt as any).getPaths === 'function'
          ? () => (prompt as any).getPaths()
          : () => [];
    const parts: string[] = [];
    for (const path of [...getPaths()].sort()) {
      if (!path || path === 'generic_system' || path === 'specific_execution') continue;
      const part = (prompt as any).get?.(path);
      const t = part == null ? '' : String(part).trim();
      if (t) parts.push(t);
    }
    text = parts.join('\n\n');
  }
  return createPromptPart(text);
}

/**
 * Type guard for PromptPart
 */
export function isPromptPart(value: unknown): value is PromptPart {
  return typeof value === 'string';
}

/**
 * Empty PromptPart constant (non-prose marker)
 */
export const EMPTY_PROMPT_PART: PromptPart = createPromptPart('');

/**
 * PromptPart metadata for build-time intelligence
 */
export interface PromptPartMetadata {
  /** Unique identifier */
  id: string;

  /** Category (generic/specific) */
  category: 'generic' | 'specific';

  /** Semantic type */
  semanticType: 'identity' | 'objective' | 'methodology' | 'behavior' | 'constraint' | 'tool_doc';

  /** Version */
  version: string;

  /** Dependencies on other PromptParts */
  dependencies?: string[];

  /** Build-time optimizations */
  optimizations?: {
    cacheable?: boolean;
    precompile?: boolean;
    inline?: boolean;
  };
}
