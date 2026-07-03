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
export declare const EXECUTION_STATE_KEY_PATH_SEPARATOR = "#";
/** The short display segment of an execution node (mirrors Execution.getPath). */
export declare function executionStateSegment(execution: Execution): string;
/**
 * Format a stable, addressable key path:
 * '<execution-path>#<namespace>:<key>' with '/'-joined path segments.
 */
export declare function formatExecutionStateKeyPath(pathSegments: string[], namespace: string, key: string): string;
/**
 * Walk the FULL execution state below (and including) the given node and
 * return the nested keys-only tree. Empty subtrees (no stores anywhere below)
 * are omitted to keep the rendering concise.
 */
export declare function walkExecutionStateKeys(execution: Execution): ExecutionStateKeysTree;
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
export declare function resolveExecutionStateKeyPath(root: Execution, keyPath: string): ResolvedExecutionStateKey;
