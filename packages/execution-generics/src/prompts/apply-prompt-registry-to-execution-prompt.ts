/**
 * Apply a Prompt (Registry of PromptPart) onto an ExecutionPrompt.
 *
 * Paths are written under ExecutionPrompt roots only:
 *   generic_system:… | specific_execution:…
 *
 * Optional namespace prefixes logical keys under specific_execution
 * (e.g. namespace `pipeline:primitive` + path `identity` →
 *  specific_execution:pipeline:primitive:identity).
 */

import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import type { Prompt } from '@bitcode/prompts/prompt';
import type { ExecutionPrompt } from './ExecutionPrompt';

export type PromptRegistryLike = {
  getAllPaths?: () => string[];
  get?: (path: string) => unknown;
  getPaths?: () => string[];
};

export function applyPromptRegistryToExecutionPrompt(
  target: ExecutionPrompt,
  source: PromptRegistryLike | Prompt | null | undefined,
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

    let logical = String(rawPath);
    if (logical.startsWith('specific_execution:')) {
      logical = logical.slice('specific_execution:'.length);
    } else if (logical.startsWith('generic_system:')) {
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
 * Format a composed Prompt and store it as a single call-site PromptPart on
 * the ExecutionPrompt (one node → one wire block when preferred).
 *
 * Path: specific_execution:call_site:{kind}
 * Optional marker path records Execution inclusion for dedupe.
 */
export function applyComposedCallSiteNodePrompt(
  target: ExecutionPrompt,
  composed: Prompt | null | undefined,
  kind: string,
  options?: { includesExecution?: boolean },
): void {
  if (!target || !composed) return;
  let text = '';
  try {
    text = String(composed.format?.() ?? '').trim();
  } catch {
    // Requirements may fail on blank roots — collect non-empty paths manually.
    const paths =
      typeof (composed as any).getAllPaths === 'function'
        ? (composed as any).getAllPaths()
        : typeof (composed as any).getPaths === 'function'
          ? (composed as any).getPaths()
          : [];
    const parts: string[] = [];
    for (const path of [...paths].sort()) {
      if (path === 'generic_system' || path === 'specific_execution') continue;
      const part = (composed as any).get?.(path);
      const t = part == null ? '' : String(part).trim();
      if (t) parts.push(t);
    }
    text = parts.join('\n\n');
  }
  if (!text) return;
  const { createPromptPart } = require('@bitcode/prompts/parts/PromptPart') as typeof import('@bitcode/prompts/parts/PromptPart');
  target.setSpecificExecution(`call_site:${kind}`, createPromptPart(text));
  if (options?.includesExecution) {
    target.setSpecificExecution(
      'call_site:includes_execution',
      createPromptPart('1'),
    );
  }
}
