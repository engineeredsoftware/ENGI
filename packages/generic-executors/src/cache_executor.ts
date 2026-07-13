/**
 * CACHE EXECUTOR - Memoize results in execution
 * 
 * Pure functional caching using execution storage.
 * Perfect for expensive operations:
 * - LLM generations with same prompt
 * - File analysis results
 * - Complex computations
 * 
 * Example:
 * cache(
 *   'analysis-cache',
 *   performAnalysis,
 *   (input) => `${input.file}:${input.version}`
 * )
 */

import type { Executor } from '@bitcode/executor-generics';

/** Cached values must be storeable on Execution (serializable ephemeral store). */
export const cache = <T, R>(
  cacheId: string,
  executor: Executor<T, R>,
  keyGenerator: (input: T) => string
): Executor<T, R> =>
  async (input, execution) => {
    const key = keyGenerator(input);
    const cacheKey = `${cacheId}:${key}`;
    
    // Check cache
    const cached = execution.get<R>('cache', cacheKey);
    if (cached !== undefined) {
      execution.store('cache_hits', cacheKey, Date.now());
      return cached;
    }
    
    // Execute and cache
    const result = await executor(input, execution);
    execution.store('cache', cacheKey, result as StorableValue);
    execution.store('cache_misses', cacheKey, Date.now());
    
    return result;
  };