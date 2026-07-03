/**
 * EXECUTION GENERICS - Pure Bitcode execution primitives
 *
 * Canonical reusable execution infrastructure for Bitcode.
 * Two primitives that compose broadly:
 *
 * 1. Execution - State accumulation with storage control
 * 2. Executor - Pure functions that transform input to output
 *
 * From these, the repository can build:
 * - agents and tool invocations
 * - phase and pipeline orchestrators
 * - live `ad hoc` execution
 * - retained reference execution families admitted for porting
 *
 * @doc-package
 * version: 1.0.0
 * pattern: executor-composition
 * philosophy: "Execution and Executor are the stable primitives; orchestration families are layered above them"
 */
export { Execution, createExecution } from './Execution';
export { registerExecution, getExecution, unregisterExecution, hasExecution, getActiveExecutionCount } from './execution-registry';
export type { Executor } from './types';
export { walkExecutionStateKeys, resolveExecutionStateKeyPath, formatExecutionStateKeyPath, executionStateSegment, EXECUTION_STATE_KEY_PATH_SEPARATOR, type ExecutionStateKeysTree, type ResolvedExecutionStateKey } from './state-keys';
export * from './store/registry';
export { sequential } from './executors/sequential_executor';
export { parallel } from './executors/parallel_executor';
export { pipe } from './executors/pipe_executor';
export { conditional } from './executors/conditional_executor';
export { repeat } from './executors/repeat_executor';
export { dynamic } from './executors/dynamic_executor';
export { switchExecutor } from './executors/switch_executor';
export { branch } from './executors/branch_executor';
export { identity } from './executors/identity_executor';
export { transform } from './executors/transform_executor';
export { tryExecutor } from './executors/try_executor';
export { timeout } from './executors/timeout_executor';
export { retry } from './executors/retry_executor';
export { ResilientExecutor, withResilience, withRetry, withTimeout, type RetryOptions, type CircuitBreakerOptions, type ResilientExecutorConfig } from './executors/resilient_executor';
export { cache } from './executors/cache_executor';
export { gate } from './executors/gate_executor';
export { ExecutionStorageDestination } from './storage/StorageDestination';
export type { ExecutionStorageConfig, ExecutionStorageOptions, ExecutionStorageResult } from './storage/StorageDestination';
export { DEFAULT_EXECUTION_STORAGE_OPTIONS } from './storage/StorageDestination';
export { ExecutionStorageAdapter } from './storage/ExecutionStorageAdapter';
export { ExecutionStreamAdapter, ExecutionStreamEventType, type ExecutionStreamConfig } from './storage/ExecutionStreamAdapter';
export type { StorableValue, StorableObject, StorableArray, TypedStore, NamespaceRegistry, ExecutionNamespaces, KnownNamespace, NamespaceValue } from './types';
export { recordFileChange, getFileChanges, getFileChangeStats, extractFileChangesFromToolResults, clearFileChanges, type FileChange, type FileChangeStats } from './store/file-change-tracker';
export { storeAgentStepWorkUpdate, storeIterationWorkUpdate, buildAgentStepWorkUpdate, buildSDIVFPipelineUpdate, accumulateIterationWorkContext, consumeIterationWorkContext, type WorkUpdate, type AgentStepWorkUpdate, type SDIVFPipelineUpdate, type ToolUsageUpdate, } from './work-update';
export { ShortCircuitSignalSchema, hasShortCircuitSignal, ShortCircuitError } from './signals/ShortCircuitSignal';
export type { ShortCircuitSignal, AgentOutput } from './signals/ShortCircuitSignal';
export { ExecutionPrompt } from './prompts/ExecutionPrompt';
export { ExecutionToolRegistry, ExecutionTool } from './tools/ExecutionToolRegistry';
export { ExecutionLLMRegistry } from './llms/ExecutionLLMRegistry';
/**
 * Quick Start:
 *
 * ```typescript
 * import { Execution, sequential, parallel, conditional } from '@bitcode/execution-generics';
 *
 * // Compose executors (these are all just functions)
 * const pipeline = sequential(
 *   validate,
 *   parallel(analyze, classify),
 *   conditional(hasRisks, mitigate)
 * );
 *
 * // Run with execution context
 * const execution = new Execution('my-pipeline');
 * const result = await pipeline(input, execution);
 *
 * // Extract accumulated intelligence with type safety
 * const insights = execution.get<AnalysisInsights>('analysis', 'insights');
 * const risks = execution.get<RiskProfile>('classification', 'risks');
 * ```
 *
 * Bitcode execution, retained agent/tool orchestration, and admitted reference pipelines all build on these primitives.
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Everything is an executor - pure async functions
 * 2. Executors compose - sequential, parallel, conditional, etc.
 * 3. Execution accumulates - all state stored with namespaces
 * 4. Type safety enforced - StorableValue constraints
 * 5. No magic - just functions, no classes or complex hierarchies
 */
