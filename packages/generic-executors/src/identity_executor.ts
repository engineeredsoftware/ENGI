/**
 * IDENTITY EXECUTOR - Pass-through unchanged
 * 
 * The simplest executor - returns input as-is.
 * Useful for:
 * - Default branches
 * - Testing
 * - Placeholder steps
 * - No-op conditions
 * 
 * Example:
 * conditional(
 *   needsProcessing,
 *   heavyProcessor,
 *   identity()  // Just pass through
 * )
 */

import { Executor } from '@bitcode/executor-generics';

export const identity = <T>(): Executor<T, T> => 
  async (input) => input;