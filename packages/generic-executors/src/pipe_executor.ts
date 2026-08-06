/**
 * PIPE EXECUTOR - Type-safe sequential composition
 * 
 * Compose executors with different types across type boundaries.
 * Essential for building complex flows with type safety.
 * 
 * Example:
 * pipe(
 *   parseString,      // string → ParsedData
 *   validateData,     // ParsedData → ValidData  
 *   transformData,    // ValidData → Result
 * )
 */

import type { Executor } from '@bitcode/executor-generics';

export function pipe<A, B>(e1: Executor<A, B>): Executor<A, B>;
export function pipe<A, B, C>(
  e1: Executor<A, B>,
  e2: Executor<B, C>
): Executor<A, C>;
export function pipe<A, B, C, D>(
  e1: Executor<A, B>,
  e2: Executor<B, C>,
  e3: Executor<C, D>
): Executor<A, D>;
export function pipe<A, B, C, D, E>(
  e1: Executor<A, B>,
  e2: Executor<B, C>,
  e3: Executor<C, D>,
  e4: Executor<D, E>
): Executor<A, E>;
export function pipe(...executors: Executor[]): Executor {
  return async (input, execution) => {
    let result = input;
    for (let i = 0; i < executors.length; i++) {
      result = await executors[i](result, execution.child(`pipe-${i}`));
    }
    return result;
  };
}