/**
 * TRANSFORM EXECUTOR - Adapt input/output types
 * 
 * Bridge between different executor interfaces:
 * - Convert data formats
 * - Add/remove fields
 * - Bridge incompatible types
 * 
 * Example:
 * transform(
 *   numberExecutor,
 *   (str: string) => parseInt(str),      // string → number
 *   (num: number) => num.toString()       // number → string
 * )
 */

import type { Executor } from '@bitcode/executor-generics';

export const transform = <TIn, TOut, UIn, UOut>(
  executor: Executor<UIn, UOut>,
  mapInput: (input: TIn) => UIn | Promise<UIn>,
  mapOutput: (output: UOut) => TOut | Promise<TOut>
): Executor<TIn, TOut> =>
  async (input, execution) => {
    const mappedInput = await mapInput(input);
    const result = await executor(mappedInput, execution);
    return mapOutput(result);
  };