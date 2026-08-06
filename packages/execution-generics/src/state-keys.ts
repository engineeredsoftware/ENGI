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
 * Expand selection-model key path malformations into candidates.
 *
 * Live deposit Implementation Refine (2026-07-17) emitted forms that failed
 * both strict and single-hash lenient resolution, emptying selectedContext:
 *   '#deposit#obfuscations'  (leading # + ns#key instead of ns:key)
 *   '#seq-3#phase:discovery#discovery#codebaseComprehension'
 * Canonical remains '<execution-path>#<namespace>:<key>'.
 */
export function expandExecutionStateKeyPathCandidates(keyPath: string): string[] {
  if (typeof keyPath !== 'string' || !keyPath.length) return [];
  const out: string[] = [keyPath];
  let s = keyPath.trim();
  // Leading '#' with no path before it: '#deposit:x' or '#deposit#x'
  while (s.startsWith(EXECUTION_STATE_KEY_PATH_SEPARATOR)) {
    s = s.slice(1);
  }
  if (s !== keyPath) out.push(s);

  // Single-hash namespace#key → namespace:key (existing live shorthand).
  const firstHash = s.indexOf(EXECUTION_STATE_KEY_PATH_SEPARATOR);
  if (firstHash >= 0) {
    const oneReplace =
      s.slice(0, firstHash) + ':' + s.slice(firstHash + 1);
    out.push(oneReplace);
  }

  // Multi-hash: treat last two segments as namespace + key.
  // '#seq-3#phase:discovery#discovery#codebaseComprehension'
  //   → discovery:codebaseComprehension
  //   → phase:discovery:codebaseComprehension (depth-first tries ns prefixes)
  //   → seq-3/phase:discovery#discovery:codebaseComprehension
  const parts = s.split(EXECUTION_STATE_KEY_PATH_SEPARATOR).filter(Boolean);
  if (parts.length >= 2) {
    const key = parts[parts.length - 1]!;
    const nsPart = parts[parts.length - 2]!;
    if (key && !key.includes(':')) {
      out.push(`${nsPart}:${key}`);
      // If nsPart is already 'phase:discovery', also try bare 'discovery:key'.
      if (nsPart.includes(':')) {
        const nsLeaf = nsPart.split(':').pop()!;
        if (nsLeaf) out.push(`${nsLeaf}:${key}`);
      }
      if (parts.length >= 3) {
        const execPath = parts.slice(0, -2).join('/');
        out.push(`${execPath}${EXECUTION_STATE_KEY_PATH_SEPARATOR}${nsPart}:${key}`);
        if (nsPart.includes(':')) {
          const nsLeaf = nsPart.split(':').pop()!;
          out.push(`${execPath}${EXECUTION_STATE_KEY_PATH_SEPARATOR}${nsLeaf}:${key}`);
        }
      }
    }
    // Last segment already 'namespace:key' (canonical after path hashes).
    if (key.includes(':') && parts.length >= 2) {
      const execPath = parts.slice(0, -1).join('/');
      out.push(`${execPath}${EXECUTION_STATE_KEY_PATH_SEPARATOR}${key}`);
      out.push(key);
    }
  }

  // Collapse every remaining '#' to ':' for simple two-token forms only.
  if (parts.length === 2 && !parts[1]!.includes(':')) {
    out.push(`${parts[0]}:${parts[1]}`);
  }

  return Array.from(new Set(out.filter((c) => typeof c === 'string' && c.length > 0)));
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
 *
 * Also tries {@link expandExecutionStateKeyPathCandidates} so selection-model
 * shorthand does not empty PrepareConciseContext selectedContext.
 */
export function resolveExecutionStateKeyPath(
  root: Execution,
  keyPath: string
): ResolvedExecutionStateKey {
  if (typeof keyPath !== 'string' || !keyPath.length) return { found: false };

  for (const candidate of expandExecutionStateKeyPathCandidates(keyPath)) {
    const resolved = resolveExecutionStateKeyPathOnce(root, candidate);
    if (resolved.found) return resolved;
  }
  return { found: false };
}

/** Single-path resolve (strict + original one-hash lenient). No candidate expand. */
function resolveExecutionStateKeyPathOnce(
  root: Execution,
  keyPath: string
): ResolvedExecutionStateKey {
  if (typeof keyPath !== 'string' || !keyPath.length) return { found: false };
  const hashAt = keyPath.indexOf(EXECUTION_STATE_KEY_PATH_SEPARATOR);

  if (hashAt >= 0) {
    const strict = resolveStrictKeyPath(root, keyPath, hashAt);
    if (strict.found) return strict;
  }

  // Lenient fallback: selection models routinely emit shorthand instead of the
  // canonical '<execution-path>#<namespace>:<key>' — observed live:
  // 'deposit#obfuscations' (namespace before the '#'). Reinterpret the whole
  // string as '<namespace>:<key>' and resolve it against the first node
  // (depth-first from the root) that carries it.
  const namespaceAndKey =
    hashAt >= 0 ? keyPath.replace(EXECUTION_STATE_KEY_PATH_SEPARATOR, ':') : keyPath;
  if (!namespaceAndKey.includes(':')) return { found: false };
  return resolveNamespaceAndKeyDepthFirst(root, namespaceAndKey);
}

function resolveStrictKeyPath(
  root: Execution,
  keyPath: string,
  hashAt: number
): ResolvedExecutionStateKey {
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

  return resolveNamespaceAndKeyOnNode(node, namespaceAndKey);
}

function resolveNamespaceAndKeyOnNode(
  node: Execution,
  namespaceAndKey: string
): ResolvedExecutionStateKey {
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

function resolveNamespaceAndKeyDepthFirst(
  node: Execution,
  namespaceAndKey: string
): ResolvedExecutionStateKey {
  const local = resolveNamespaceAndKeyOnNode(node, namespaceAndKey);
  if (local.found) return local;
  for (const child of node.children.values()) {
    const resolved = resolveNamespaceAndKeyDepthFirst(child, namespaceAndKey);
    if (resolved.found) return resolved;
  }
  return { found: false };
}
