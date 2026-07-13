/**
 * @bitcode/context-generics
 *
 * Compatibility package for the retired dual "Context" state model.
 *
 * Law: state is Execution. Process defaults = process-root Execution
 * (@bitcode/generic-executions). Failsafe "prepared context" types remain
 * with failsafes (key selection over Execution state — not a state bag).
 *
 * Prefer:
 *   @bitcode/generic-executions
 *   @bitcode/execution-generics
 *   @bitcode/generic-generations-failsafes  (PreparedContext / prepareConciseContext)
 */

export * from './context';
export * from './serialize';

// Failsafe prepared-context types — prefer generic-generations-failsafes directly
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
