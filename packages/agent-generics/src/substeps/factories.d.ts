import { type ExecutionStateKeysTree } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { SubStepExecution } from '../execution';
import { z } from 'zod';
import { Reasoning, UseTool, Judgment, UsedTool } from '../types';
/**
 * Factory for Failsafe SubStep Executions
 */
export declare function factoryAgentFailsafeSubStepExecution(name: string, execution: Execution): SubStepExecution;
/**
 * Factory for Generation SubStep Executions
 */
export declare function factoryAgentGenerationSubStepExecution(name: string, execution: Execution): SubStepExecution;
/**
 * Factory for Tools SubStep Execution
 */
export declare function factoryAgentToolSubStepExecution(execution: Execution): SubStepExecution;
/**
 * Key-selection schema — PCC's selection inference runs against THIS schema,
 * never the step's output schema (PCC never attempts the task).
 */
export declare const PCC_KEY_SELECTION_SCHEMA: z.ZodObject<{
    selectedKeys: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    selectedKeys?: string[];
}, {
    selectedKeys?: string[];
}>;
/** The keys-only selection input shape (values NEVER included). */
export interface PrepareConciseContextSelectionInput {
    preparation: string;
    system: string;
    pipeline_execution_keys: ExecutionStateKeysTree;
}
/**
 * PrepareConciseContext - the CONTEXT failsafe (ALWAYS runs; selection-only)
 *
 * CRITICAL: This is a PARENT execution that:
 * 1. Renders the FULL root execution state as a keys-only tree
 *    (walkExecutionStateKeys — values never enter the selection prompt)
 * 2. Runs ONE selection Thinkings generation against the key-selection schema
 *    with input { preparation, system, pipeline_execution_keys }
 * 3. READS IN the values of exactly the selected keys from the execution
 *    state (misses are omitted, fail-soft, logged)
 * 4. Returns the original task input + the selected context for the task
 *    generation (ChunkThenSum) to consume
 */
export declare function factoryPrepareConciseContext<T>(selectionGeneration?: Executor<any, any>): Executor<T, T & {
    selectedKeys: string[];
    selectedContext: Record<string, unknown>;
}>;
/**
 * ChunkThenSum - the INPUT failsafe (trigger = the COMPOSED REQUEST exceeds
 * the request limit)
 *
 * CRITICAL: This is a PARENT execution that:
 * 1. Measures the ACTUAL composed request: the rendered hierarchical system
 *    prompt + the serialized task input INCLUDING the PCC-selected values
 * 2. Non-triggering (fits the request budget): exactly ONE task generation
 * 3. Triggering: chunks ONLY the selected context values — each chunk call
 *    gets the task input + ONLY its chunk (never the full accumulated input) —
 *    then ONE summing generation over the chunk results
 */
export declare function factoryChunkThenSum<T extends {
    selectedContext?: Record<string, unknown>;
}>(generationSubSteps: Executor<any, any>[], options?: {
    parallel?: boolean;
}): Executor<T, T & {
    processedResult: any;
}>;
/**
 * StitchUntilComplete - Parent execution that handles token limit overflows
 *
 * CRITICAL: This is a PARENT execution that:
 * 1. Checks if output hit the token limit (output length === max tokens)
 * 2. If truncated: recursively calls generation substeps to continue/stitch
 * 3. Continues until complete structured output is achieved
 * 4. Validates final output matches expected schema
 */
export declare function factoryStitchUntilComplete<T>(generationSubSteps: Executor<any, any>[], outputSchema?: z.ZodType<any>): Executor<T, T & {
    finalOutput: any;
}>;
/**
 * Judge - Generation substep that evaluates quality
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export declare function factoryJudge<T>(): Executor<T, T & {
    judgment: Judgment;
}>;
/**
 * Reason - Generation substep that applies logical reasoning
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export declare function factoryReason<T>(): Executor<T, T & {
    reasoning: Reasoning;
}>;
/**
 * StructuredOutput - Generation substep that produces formatted output
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export declare function factoryStructuredOutput<T, TSchema>(schema: z.ZodType<TSchema>): Executor<T, T & {
    output: TSchema;
}>;
/**
 * ToolsExecution - Executes tools selected by reasoning
 * Part of the 7-substep PTRR architecture (not a numbered substep itself)
 */
export declare function factoryToolsExecution<T extends {
    output?: {
        useTools?: UseTool[];
    };
}>(): Executor<T, T & {
    usedTools: UsedTool[];
}>;
/**
 * Validation - validates output against caller-supplied expectations.
 * Core PTRR agents should prefer schema validation inside StructuredOutput.
 */
export declare function factoryValidation<T>(validators?: Array<(input: T) => boolean | Promise<boolean>>): Executor<T, T & {
    validation: {
        passed: boolean;
        errors: string[];
    };
}>;
