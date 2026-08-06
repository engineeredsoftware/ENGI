/**
 * Compose Prompt registries (primitive → base → specific).
 *
 * Lives next to ExecutionPrompt: any EE that owns an ExecutionPrompt may
 * author layers as Prompt registries and merge them before attach.
 *
 * Prefer {@link composeNamespacedPromptLayers} for call-site blocks so
 * Execution identity is not overwritten by Pipeline identity on the same path.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

/**
 * Merge Prompt layers left→right (same-path later wins).
 * Null/undefined layers are skipped.
 */
export function composePromptLayers(
  layers: Array<Prompt | null | undefined>,
): Prompt {
  const composed = new Prompt();
  for (const layer of layers) {
    if (!layer || typeof (layer as any).merge !== 'function') continue;
    composed.merge(layer);
  }
  return composed;
}

/**
 * Compose layers under distinct path namespaces so primitive/base/specific
 * do not clobber each other (e.g. execution:identity vs pipeline:identity).
 *
 * Format order: path sort (namespace alphabetically within a node).
 * Prefer naming namespaces so order is intentional: execution, pipeline, …
 */
export function composeNamespacedPromptLayers(
  layers: Array<{ namespace: string; prompt: Prompt | null | undefined }>,
): Prompt {
  const composed = new Prompt();
  for (const { namespace, prompt } of layers) {
    if (!prompt || !namespace) continue;
    const ns = namespace.replace(/^:+|:+$/g, '');
    const getPaths =
      typeof (prompt as any).getAllPaths === 'function'
        ? () => (prompt as any).getAllPaths()
        : typeof (prompt as any).getPaths === 'function'
          ? () => (prompt as any).getPaths()
          : () => [];
    for (const rawPath of getPaths()) {
      if (!rawPath || rawPath === 'generic_system' || rawPath === 'specific_execution') {
        continue;
      }
      const part = (prompt as any).get?.(rawPath);
      if (part == null || !String(part).trim()) continue;
      composed.set(`${ns}:${rawPath}`, part as PromptPart);
    }
  }
  return composed;
}
