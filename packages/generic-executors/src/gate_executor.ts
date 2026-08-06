/**
 * GATE EXECUTOR - One-time conditional execution
 * 
 * Stores gate state in execution to avoid mutable closure.
 * Once opened/closed, stays that way for the execution.
 * 
 * Use cases:
 * - Feature flags
 * - One-time setup
 * - Circuit breakers
 * 
 * Example:
 * gate(
 *   'workspace-setup',
 *   async (input, exec) => !exec.get('env', 'CI'),
 *   setupWorkspace
 * )
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Executor } from '@bitcode/executor-generics';

export const gate = <T>(
  gateId: string,
  shouldOpen: (input: T, execution: Execution) => boolean | Promise<boolean>,
  gatedExecutor: Executor<T, T>
): Executor<T, T> =>
  async (input, execution) => {
    const gateKey = `gate:${gateId}`;
    let isOpen = execution.get('gates', gateKey);
    
    // First time - evaluate condition
    if (isOpen === undefined) {
      isOpen = await shouldOpen(input, execution);
      execution.store('gates', gateKey, isOpen);
    }
    
    // Execute if gate is open
    if (isOpen) {
      return gatedExecutor(input, execution);
    }
    
    return input;
  };