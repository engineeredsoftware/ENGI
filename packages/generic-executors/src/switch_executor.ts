/**
 * SWITCH EXECUTOR - Pattern matching for execution
 * 
 * Structured branching for multiple paths:
 * - Route by agent type
 * - Handle different file types
 * - Process by category
 * 
 * Example:
 * switchExecutor(
 *   (input) => input.toolType,
 *   {
 *     'filesystem': fileSystemTool,
 *     'git': gitTool,
 *     'llm': llmTool
 *   },
 *   defaultTool
 * )
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const switchExecutor = <T, R>(
  selector: (input: T, execution: Execution) => string | Promise<string>,
  cases: Record<string, Executor<T, R>>,
  defaultCase?: Executor<T, R>
): Executor<T, R> =>
  async (input, execution) => {
    const key = await selector(input, execution);
    const executor = cases[key] ?? defaultCase;
    
    if (!executor) {
      throw new Error(`No executor for case: ${key}`);
    }
    
    return executor(input, execution.child(`case-${key}`));
  };