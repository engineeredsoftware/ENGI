/**
 * @bitcode/executor-generics
 *
 * Executor **primitive** — the sequence unit over Execution state.
 *
 * Hierarchy:
 *   Execution                              # @bitcode/execution-generics (state)
 *   Executor                               # this package (sequence)
 *     → @bitcode/generic-executors         # sequential, parallel, retry, …
 *   Execution base helpers                 # @bitcode/generic-executions
 *
 * Law: there is no separate "Context" state bag. Process defaults and pipeline
 * state live on Execution trees (store/get + registry).
 */

import type { Execution } from '@bitcode/execution-generics/Execution';

/**
 * The fundamental sequence primitive — an async function of (input, execution).
 */
export type Executor<TInput = any, TOutput = any> = (
  input: TInput,
  execution: Execution,
) => Promise<TOutput>;
