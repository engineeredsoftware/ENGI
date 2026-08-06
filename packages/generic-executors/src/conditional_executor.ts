/**
 * CONDITIONAL EXECUTOR - Branch based on condition
 *
 * Core Bitcode execution control:
 * - Skip steps when not needed
 * - Choose strategies based on context
 * - Handle errors gracefully
 * 
 * Example:
 * conditional(
 *   (input, exec) => exec.get('validation', 'passed'),
 *   proceedToFinish,
 *   handleValidationFailure
 * )
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const conditional = <T>(
  condition: (input: T, execution: Execution) => boolean | Promise<boolean>,
  thenExecutor: Executor<T, T>,
  elseExecutor?: Executor<T, T>
): Executor<T, T> =>
  async (input, execution) => {
    if (await condition(input, execution)) {
      return thenExecutor(input, execution.child('then'));
    } else if (elseExecutor) {
      return elseExecutor(input, execution.child('else'));
    }
    return input;
  };
