/**
 * Execution state keys walking — the keys-only projection of an execution tree.
 *
 * PrepareConciseContext (the context failsafe) selects WHICH execution-state
 * values a task needs by inference over the FULL root execution state rendered
 * as KEYS ONLY — values never enter the selection prompt. This module provides:
 *
 * - walkExecutionStateKeys(root): the nested keys-only tree
 *   (child-execution segments -> namespaces -> key names)
 * - stable key paths of the form '<execution-path>#<namespace>:<key>' where
 *   <execution-path> is the '/'-joined chain of tree node names starting at
 *   the root segment
 * - resolveExecutionStateKeyPath(root, path): the read-in of exactly one
 *   selected key's VALUE (fail-soft: unresolvable paths report found:false)
 */

import { Execution } from './Execution';

/**
 * Keys-only tree node. Each entry is either:
 * - a namespace: an ARRAY of the key names stored in that namespace, or
 * - a child execution segment: a nested OBJECT (its own keys-only tree).
 * Values are NEVER included.
 */
export type ExecutionStateKeysTree = {
  [name: string]: string[] | ExecutionStateKeysTree;
};

export const EXECUTION_STATE_KEY_PATH_SEPARATOR = '#';

/** The short display segment of an execution node (mirrors Execution.getPath). */
export function executionStateSegment(execution: Execution): string {
  const id = execution.id;
  return id.includes('/') ? id.split('/').pop()! : id;
}

/**
 * Format a stable, addressable key path:
 * '<execution-path>#<namespace>:<key>' with '/'-joined path segments.
 */
export function formatExecutionStateKeyPath(
  pathSegments: string[],
  namespace: string,
  key: string
): string {
  return `${pathSegments.join('/')}${EXECUTION_STATE_KEY_PATH_SEPARATOR}${namespace}:${key}`;
}

/**
 * Walk the FULL execution state below (and including) the given node and
 * return the nested keys-only tree. Empty subtrees (no stores anywhere below)
 * are omitted to keep the rendering concise.
 */
export function walkExecutionStateKeys(execution: Execution): ExecutionStateKeysTree {
  const tree: ExecutionStateKeysTree = {};

  for (const namespace of execution.getNamespaces()) {
    const entries = execution.getAll(namespace);
    tree[namespace] = entries ? Array.from(entries.keys()).map(String) : [];
  }

  for (const child of execution.children.values()) {
    const childTree = walkExecutionStateKeys(child);
    if (Object.keys(childTree).length === 0) continue;
    tree[executionStateSegment(child)] = childTree;
  }

  return tree;
}

export interface ResolvedExecutionStateKey {
  found: boolean;
  value?: unknown;
}

/**
 * Resolve one stable key path against the execution tree rooted at `root`.
 *
 * Fail-soft by design: a malformed path, an unknown execution segment, an
 * unknown namespace or a missing key all report { found: false } — the caller
 * omits the miss rather than failing the pipeline.
 *
 * Namespaces may themselves contain ':' (e.g. 'agent:discovery'), so the
 * '<namespace>:<key>' remainder is resolved by trying every namespace whose
 * '<namespace>:' prefixes it, longest namespace first.
 */
export function resolveExecutionStateKeyPath(
  root: Execution,
  keyPath: string
): ResolvedExecutionStateKey {
  if (typeof keyPath !== 'string') return { found: false };
  const hashAt = keyPath.indexOf(EXECUTION_STATE_KEY_PATH_SEPARATOR);
  if (hashAt < 0) return { found: false };

  const execPath = keyPath.slice(0, hashAt);
  const namespaceAndKey = keyPath.slice(hashAt + 1);
  const segments = execPath.length ? execPath.split('/') : [];

  // Accept paths that either include or omit the root's own segment.
  let node: Execution | undefined = root;
  let index = 0;
  if (segments.length && segments[0] === executionStateSegment(root)) index = 1;

  for (; index < segments.length && node; index++) {
    const segment = segments[index];
    let next: Execution | undefined;
    for (const child of node.children.values()) {
      if (executionStateSegment(child) === segment) {
        next = child;
        break;
      }
    }
    node = next;
  }
  if (!node) return { found: false };

  const namespaces = node
    .getNamespaces()
    .filter((namespace) => namespaceAndKey.startsWith(`${namespace}:`))
    .sort((a, b) => b.length - a.length);

  for (const namespace of namespaces) {
    const key = namespaceAndKey.slice(namespace.length + 1);
    const entries = node.getAll(namespace);
    if (entries && entries.has(key)) {
      return { found: true, value: entries.get(key) };
    }
  }

  return { found: false };
}
