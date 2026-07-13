/**
 * @bitcode/context
 *
 * Process-global context bag (repo/task/stream handles) for legacy runners.
 *
 * Failsafe prepared-context types and helpers (PrepareConciseContext selection /
 * chunking) live with failsafes:
 *   @bitcode/generic-generations-failsafes
 * and are re-exported here only for compatibility.
 */

export * from './context';
export * from './serialize';

// Compatibility re-exports — prefer @bitcode/generic-generations-failsafes
export type {
  ContextSelector,
  PreparedContext,
  PrepareConciseContextOptions,
  PrepareConciseContextResult,
} from '@bitcode/generic-generations-failsafes';
export {
  estimateSerializedSize,
  createContextSelectors,
  chunkContext,
  prepareConciseContext,
} from '@bitcode/generic-generations-failsafes';
