/**
 * TRY EXECUTOR - Execute with error handling
 * 
 * Catch and handle errors without breaking the flow:
 * - Log errors to execution
 * - Provide fallback values
 * - Transform errors to results
 * 
 * Example:
 * tryExecutor(
 *   riskyOperation,
 *   async (error, input, exec) => {
 *     exec.store('errors', 'lastError', error.message);
 *     return fallbackOperation(input, exec);
 *   }
 * )
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const tryExecutor = <T>(
  executor: Executor<T, T>,
  errorHandler: (error: Error, input: T, execution: Execution) => T | Promise<T>
): Executor<T, T> =>
  async (input, execution) => {
    try {
      return await executor(input, execution);
    } catch (error) {
      execution.store('errors', Date.now().toString(), {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      return errorHandler(error as Error, input, execution);
    }
  };