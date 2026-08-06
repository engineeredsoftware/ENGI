/**
 * PARALLEL EXECUTOR - Run executors concurrently
 * 
 * All executors receive the same input. Results array in order.
 * Creates execution tree: par-0, par-1, par-2 (concurrent)
 * 
 * Powers:
 * - Multi-agent phases: parallel(...agentSteppers)
 * - Concurrent analysis: parallel(security, quality, performance)
 * - Chunk processing: parallel(...chunkProcessors)
 */

import type { Executor } from '@bitcode/executor-generics';

export const parallel = <T, R>(...executors: Executor<T, R>[]): Executor<T, R[]> =>
  async (input, execution) =>
    Promise.all(
      executors.map((executor, i) => 
        executor(input, execution.child(`par-${i}`))
      )
    );