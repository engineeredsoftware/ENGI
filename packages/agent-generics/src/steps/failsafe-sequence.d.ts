/**
 * FailsafeGenerationSequence - Canonical 3×3 sequence builder
 *
 * Formalizes the default step implementation: three failsafe parents, each
 * running the exact same three-generation children (Reason → Judge → Output).
 * Tools execution is a Step-level postprocess and is composed by step
 * factories after this core.
 */
import { type Executor } from '@bitcode/execution-generics';
import { z } from 'zod';
export type FailsafeGenerationSequence<TIn = any, TOut = any> = Executor<TIn, TOut>;
export interface FailsafeGenerationOptions<TOut> {
    outputSchema: z.ZodType<TOut>;
    enableParallelChunks?: boolean;
    onlyGenerations?: string[];
    onlyFailsafes?: string[];
}
/**
 * createFailsafeGenerationSequence - Build the default 3×3 + tools step
 */
export declare function createFailsafeGenerationSequence<TIn, TOut>(options: FailsafeGenerationOptions<TOut>): FailsafeGenerationSequence<TIn, TOut>;
export declare function createContextfulFailsafedThinkingsGeneration<TIn, TOut>(options: FailsafeGenerationOptions<TOut>): FailsafeGenerationSequence<TIn, TOut>;
export declare const createFailsafedGeneration: typeof createContextfulFailsafedThinkingsGeneration;
