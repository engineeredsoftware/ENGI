/**
 * REPEAT EXECUTOR - Loop until condition or count
 * 
 * Foundation of iterative intelligence:
 * - DIV loop: repeat until validation passes
 * - Retry logic: repeat until success
 * - Refinement: repeat until quality threshold
 * 
 * Options:
 * - times: Maximum iterations
 * - until: Stop when condition is true
 * - while: Continue while condition is true
 * 
 * Example:
 * repeat(improveQuality, {
 *   until: (exec) => exec.get('quality', 'score') > 0.9,
 *   times: 10
 * })
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const repeat = <T>(
  executor: Executor<T, T>,
  options: {
    until?: (execution: Execution) => boolean;
    while?: (execution: Execution) => boolean;
    times?: number;
  } = {}
): Executor<T, T> =>
  async (input, execution) => {
    let result = input;
    let iterations = 0;
    const maxIterations = options.times ?? Infinity;
    
    while (iterations < maxIterations) {
      // Check while condition
      if (options.while && !options.while(execution)) {
        break;
      }
      
      // Execute
      result = await executor(result, execution.child(`iter-${iterations}`));
      iterations++;
      
      // Check until condition
      if (options.until && options.until(execution)) {
        break;
      }
    }
    
    execution.store('meta', 'iterations', iterations);
    return result;
  };