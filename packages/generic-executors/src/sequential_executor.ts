/**
 * SEQUENTIAL EXECUTOR - Pipe through steps in order
 * 
 * Each executor receives the output of the previous one.
 * Creates execution tree: seq-0 → seq-1 → seq-2 → ...
 * 
 * Foundation of:
 * - PTRR flow: sequential(plan, try, refine, retry)
 * - SDIVF pipeline: sequential(setup, divLoop, finish)
 * - PTRR substeps (conceptual): Steps compose parent Failsafes, each running Generation children.
 *   Do not sequence Reason/Judge/Structured across failsafes; parents orchestrate children.
 */

import type { Executor } from '@bitcode/executor-generics';

export const sequential = <T>(...executors: Executor<T, T>[]): Executor<T, T> =>
  async (input, execution) => {
    let result = input;
    for (let i = 0; i < executors.length; i++) {
      result = await executors[i](result, execution.child(`seq-${i}`));
    }
    return result;
  };
