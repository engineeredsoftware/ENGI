/**
 * TIMEOUT EXECUTOR - Time-bounded execution
 * 
 * Protect against long-running operations:
 * - LLM calls with time limits
 * - External API timeouts
 * - Bounded computations
 * 
 * Example:
 * timeout(
 *   llmGeneration,
 *   30000,  // 30 seconds
 *   async (input, exec) => {
 *     exec.store('timeout', 'occurred', true);
 *     return { ...input, timedOut: true };
 *   }
 * )
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const timeout = <T>(
  executor: Executor<T, T>,
  timeoutMs: number,
  onTimeout?: (input: T, execution: Execution) => T | Promise<T>
): Executor<T, T> =>
  async (input, execution) => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    try {
      return await Promise.race([
        executor(input, execution),
        timeoutPromise
      ]);
    } catch (error) {
      if ((error as Error).message.includes('Timeout') && onTimeout) {
        return onTimeout(input, execution);
      }
      throw error;
    }
  };