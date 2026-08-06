/**
 * Build call-site system text by walking the Execution tree root → leaf.
 *
 * Package home: execution-generics (not agent-generics). Agent-specific
 * role filtering (active failsafe / thinking) is injected via options.
 *
 * Each node with an ExecutionPrompt (or Prompt-like registry) contributes
 * one formatted block. Blocks join with NODE_SEPARATOR.
 *
 * Skips empty shells (seq-N with blank prompts). Does not invent content.
 */

import type { Execution } from '../Execution';

/** Separator between EE node prompt blocks on the wire. */
export const EXECUTION_HIERARCHY_PROMPT_NODE_SEPARATOR = '\n\n---\n\n';

export type ExecutionHierarchyPromptPathFilter = (
  path: string,
  context: { execution: Execution },
) => boolean;

export type BuildExecutionHierarchySystemPromptOptions = {
  /**
   * When provided, only include registry paths that pass the filter.
   * Used by agent-generics for failsafe/thinking role filtering.
   * When omitted, all non-root-placeholder paths are included.
   */
  pathFilter?: ExecutionHierarchyPromptPathFilter;
  /**
   * Optional node filter: return false to skip an entire EE node
   * (e.g. pure sequential shells with no meaningful prompt).
   */
  nodeFilter?: (execution: Execution) => boolean;
};

function isBlankRootOnly(prompt: any): boolean {
  if (!prompt || typeof prompt.getAllPaths !== 'function') return false;
  const paths: string[] = prompt.getAllPaths() || [];
  const meaningful = paths.filter(
    (p) =>
      p &&
      p !== 'generic_system' &&
      p !== 'specific_execution' &&
      String(prompt.get?.(p) ?? '').trim() &&
      String(prompt.get?.(p) ?? '').trim() !== '1',
  );
  // includes_execution marker alone is not a content block
  return meaningful.every(
    (p) =>
      p.endsWith('includes_execution') ||
      String(prompt.get?.(p) ?? '').trim().length <= 1,
  );
}

function formatPromptRegistry(
  prompt: any,
  pathFilter: ExecutionHierarchyPromptPathFilter | undefined,
  execution: Execution,
): string {
  if (!prompt) return '';
  if (typeof prompt.getAllPaths === 'function' && typeof prompt.get === 'function') {
    const paths: string[] = prompt.getAllPaths() || [];
    // Prefer composed call_site blocks when present (one node → one block).
    // Layered audit paths (pipeline:primitive:…) stay registered but are not
    // double-emitted on the wire.
    const callSitePaths = paths.filter(
      (p) =>
        (p.includes('call_site:') || p.includes(':call_site:')) &&
        !p.includes('includes_execution'),
    );
    const emitPaths =
      callSitePaths.length > 0
        ? callSitePaths
        : paths.filter(
            (p) =>
              p &&
              p !== 'generic_system' &&
              p !== 'specific_execution' &&
              !p.includes('includes_execution'),
          );

    const parts: string[] = [];
    for (const path of [...emitPaths].sort()) {
      if (pathFilter && !pathFilter(path, { execution })) continue;
      const part = prompt.get(path);
      const text = part == null ? '' : String(part).trim();
      if (text && text !== '1') parts.push(text);
    }
    return parts.join('\n\n');
  }
  if (typeof prompt.format === 'function') {
    try {
      return String(prompt.format() || '').trim();
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Walk parent chain root→leaf and join each node's ExecutionPrompt.
 */
export function buildExecutionHierarchySystemPrompt(
  leaf: Execution,
  options?: BuildExecutionHierarchySystemPromptOptions,
): string {
  const pathFilter = options?.pathFilter;
  const nodeFilter = options?.nodeFilter;
  const blocks: string[] = [];

  let current: Execution | undefined = leaf;
  const chain: Execution[] = [];
  while (current) {
    chain.unshift(current);
    current = current.parent;
  }

  for (const exec of chain) {
    if (nodeFilter && !nodeFilter(exec)) continue;

    if ('prompt' in exec && (exec as any).prompt) {
      const prompt = (exec as any).prompt;
      if (isBlankRootOnly(prompt)) continue;
      const formatted = formatPromptRegistry(prompt, pathFilter, exec);
      if (formatted) blocks.push(formatted);
      continue;
    }

    // Legacy: some agents keep system Prompt on prompts registry
    if ('prompts' in exec && (exec as any).prompts) {
      const agentPrompt =
        typeof (exec as any).prompts.get === 'function'
          ? (exec as any).prompts.get('system')
          : undefined;
      if (agentPrompt) {
        const text =
          typeof agentPrompt === 'string'
            ? agentPrompt.trim()
            : formatPromptRegistry(agentPrompt, pathFilter, exec);
        if (text) blocks.push(text);
      }
    }
  }

  return blocks.join(EXECUTION_HIERARCHY_PROMPT_NODE_SEPARATOR);
}
