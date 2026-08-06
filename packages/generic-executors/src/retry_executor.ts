/**
 * RETRY EXECUTOR - Resilient execution with backoff
 * 
 * Handle transient failures gracefully:
 * - API rate limits
 * - Network errors
 * - Temporary unavailability
 * 
 * Options:
 * - times: Maximum retry attempts
 * - delay: Initial delay in ms
 * - backoff: Multiplier for exponential backoff
 * - shouldRetry: Custom retry logic
 * 
 * Example:
 * retry(apiCall, {
 *   times: 3,
 *   delay: 1000,
 *   backoff: 2,  // 1s, 2s, 4s
 *   shouldRetry: (error) => error.code === 'RATE_LIMIT'
 * })
 */

import type { Executor } from '@bitcode/executor-generics';

export const retry = <T>(
  executor: Executor<T, T>,
  options: {
    times?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
  } = {}
): Executor<T, T> =>
  async (input, execution) => {
    const { times = 3, delay = 1000, backoff = 2, shouldRetry } = options;
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < times; attempt++) {
      try {
        return await executor(input, execution.child(`attempt-${attempt}`));
      } catch (error) {
        lastError = error as Error;
        
        if (shouldRetry && !shouldRetry(lastError, attempt)) {
          throw lastError;
        }
        
        if (attempt < times - 1) {
          const waitTime = delay * Math.pow(backoff, attempt);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError;
  };