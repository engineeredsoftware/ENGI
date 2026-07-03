/**
 * FailsafeGenerationSequence - Canonical failsafes sequence builder
 *
 * Formalizes the default step generation as THREE failsafes in fixed order,
 * each with a DISTINCT trigger and a DISTINCT job:
 *
 * 1. PrepareConciseContext (context failsafe; ALWAYS runs; selection-only):
 *    ONE selection Thinkings against the key-selection schema over the
 *    keys-only root execution state, then the value read-in of exactly the
 *    selected keys.
 * 2. ChunkThenSum (input failsafe; trigger = composed request exceeds the
 *    request limit): ONE task Thinkings when the request fits; per-chunk task
 *    generations + one summing pass when it does not.
 * 3. StitchUntilComplete (output failsafe; trigger = schema-INCOMPLETE or
 *    truncated): repair-only, error-carrying stitch generations, bounded.
 *
 * The sequence is selection -> task(xchunks) -> repair-only; the failsafes do
 * NOT wrap three identical task generations. Tools execution is a Step-level
 * postprocess and is composed by step factories after this core.
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
 * createFailsafeGenerationSequence - Build the default
 * selection -> task(xchunks) -> repair-only step generation
 */
export declare function createFailsafeGenerationSequence<TIn, TOut>(options: FailsafeGenerationOptions<TOut>): FailsafeGenerationSequence<TIn, TOut>;
export declare function createContextfulFailsafedThinkingsGeneration<TIn, TOut>(options: FailsafeGenerationOptions<TOut>): FailsafeGenerationSequence<TIn, TOut>;
export declare const createFailsafedGeneration: typeof createContextfulFailsafedThinkingsGeneration;
