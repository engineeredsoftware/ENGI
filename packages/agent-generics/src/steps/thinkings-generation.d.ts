/**
 * ThinkingsGeneration - A single Generation composed of three child LLM calls
 * in strict order: Reason → Judge → StructuredOutput.
 *
 * This is the atomic typed "Generation" used by steps. Failsafe wrappers
 * (PTRR-specific) can execute this generation under different parents.
 */
import { type Executor } from '@bitcode/execution-generics';
import { z } from 'zod';
export type ThinkingsGeneration<TIn = any, TOut = any> = Executor<TIn, TOut>;
export declare function createThinkingsGeneration<TIn, TOut>(outputSchema: z.ZodType<TOut>): ThinkingsGeneration<TIn, TOut>;
