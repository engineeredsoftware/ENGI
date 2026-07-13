/**
 * DYNAMIC EXECUTOR - Select executor at runtime
 * 
 * Adaptive intelligence based on accumulated knowledge:
 * - Choose chunking strategy by context count
 * - Select agent based on discovered problem type
 * - Pick optimal tool for the environment
 * 
 * Example:
 * dynamic((input, exec) => {
 *   const complexity = exec.get('analysis', 'complexity');
 *   if (complexity === 'simple') return simpleStrategy;
 *   if (complexity === 'complex') return complexStrategy;
 *   return defaultStrategy;
 * })
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const dynamic = <T, R>(
  selector: (input: T, execution: Execution) => Executor<T, R> | Promise<Executor<T, R>>
): Executor<T, R> =>
  async (input, execution) => {
    const executor = await selector(input, execution);
    return executor(input, execution);
  };