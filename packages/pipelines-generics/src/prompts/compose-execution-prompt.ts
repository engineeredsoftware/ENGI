/**
 * Apply Prompt registries onto ExecutionPrompt for hierarchical LLM composition.
 *
 * Law:
 * - Each execution node (pipeline, phase, agent, step, failsafe, thinking) may
 *   own an ExecutionPrompt.
 * - Layers are additive by path; a later set on the same path overwrites.
 * - Call-site system text is buildHierarchicalPrompt(leaf): walk root→leaf,
 *   format each node's prompt (role-filtered for active failsafe/thinking).
 *
 * Hierarchy of *content* (authoring):
 *   primitive → base → specific  (merge onto one Prompt, then apply to EE)
 * Hierarchy of *nodes* (runtime):
 *   pipeline → phase → agent → step → failsafe → thinking
 */

import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import type { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { Prompt } from '@bitcode/prompts/prompt';

export type PromptLike = {
  getAllPaths?: () => string[];
  get?: (path: string) => unknown;
  getPaths?: () => string[];
};

/**
 * Copy every non-empty path from a Prompt (or Prompt-like registry) onto an
 * ExecutionPrompt under specific_execution, optionally namespaced.
 *
 * Example: namespace `pipeline:sdivf` + path `pattern` →
 *   specific_execution:pipeline:sdivf:pattern
 */
export function applyPromptRegistryToExecutionPrompt(
  target: ExecutionPrompt,
  source: PromptLike | Prompt | null | undefined,
  options?: {
    /** Path prefix under specific_execution (e.g. pipeline:primitive). */
    namespace?: string;
    /** When true, existing keys are not overwritten. Default false (later wins). */
    preserveExisting?: boolean;
  },
): void {
  if (!target || !source) return;
  const getPaths =
    typeof source.getAllPaths === 'function'
      ? () => source.getAllPaths!()
      : typeof source.getPaths === 'function'
        ? () => source.getPaths!()
        : null;
  if (!getPaths || typeof source.get !== 'function') return;

  const ns = (options?.namespace || '').replace(/^:+|:+$/g, '');
  const preserve = Boolean(options?.preserveExisting);

  for (const rawPath of getPaths()) {
    if (!rawPath || rawPath === 'generic_system' || rawPath === 'specific_execution') {
      continue;
    }
    const part = source.get(rawPath);
    if (part == null) continue;
    const text = String(part).trim();
    if (!text) continue;

    // Normalize authored paths that already include ExecutionPrompt roots.
    let logical = String(rawPath);
    if (logical.startsWith('specific_execution:')) {
      logical = logical.slice('specific_execution:'.length);
    } else if (logical.startsWith('generic_system:')) {
      // Keep generic_system parts under generic_system root.
      const gpath = logical.slice('generic_system:'.length);
      const full = ns ? `generic_system:${ns}:${gpath}` : `generic_system:${gpath}`;
      if (preserve && typeof (target as any).has === 'function' && (target as any).has(full)) {
        continue;
      }
      try {
        (target as any).setGenericSystem?.(ns ? `${ns}:${gpath}` : gpath, part as PromptPart);
      } catch {
        try {
          target.set(full, part as PromptPart);
        } catch {
          /* ignore invalid */
        }
      }
      continue;
    }

    const wireKey = ns ? `${ns}:${logical}` : logical;
    const full = `specific_execution:${wireKey}`;
    if (preserve && typeof (target as any).has === 'function' && (target as any).has(full)) {
      continue;
    }
    try {
      target.setSpecificExecution(wireKey, part as PromptPart);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Merge multiple Prompt layers (primitive → base → specific). Later layers
 * overwrite same logical paths on the composed Prompt.
 */
export function composePromptLayers(
  layers: Array<Prompt | null | undefined>,
): Prompt {
  const { Prompt } = require('@bitcode/prompts/prompt') as typeof import('@bitcode/prompts/prompt');
  const composed = new Prompt();
  for (const layer of layers) {
    if (!layer || typeof (layer as any).merge !== 'function') continue;
    composed.merge(layer);
  }
  return composed;
}
