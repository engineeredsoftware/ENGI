/**
 * EXECUTION GENERICS - Bitcode Execution primitive + composition barrel
 *
 * Hierarchy (prefer leaf packages for new code):
 *   @bitcode/execution-generics              Execution (state) — this package owns the class
 *   @bitcode/executor-generics               Executor (sequence type)
 *   @bitcode/generic-executors               sequential, parallel, pipe, retry, …
 *   @bitcode/generic-executions              process-root Execution helpers
 *
 * There is no separate "Context" state model. Process defaults are a process-root
 * Execution (@bitcode/generic-executions). Product state lives on pipeline trees.
 *
 * This package re-exports Executor combinators and process-root helpers .
 *
 * @doc-package
 * version: 1.0.0
 * pattern: executor-composition
 * philosophy: "Execution and Executor are the stable primitives; orchestration families are layered above them"
 */

// ==================== CORE PRIMITIVES ====================

// The Execution class and factory
export {
  Execution,
  createExecution
} from './Execution';

// Active execution registry (for instruction submission)
export {
  registerExecution,
  getExecution,
  unregisterExecution,
  hasExecution,
  getActiveExecutionCount
} from './execution-registry';

// The Executor type — owned by @bitcode/executor-generics
export type { Executor } from '@bitcode/executor-generics';

// Keys-only execution-state projection (PrepareConciseContext selection input)
export {
  walkExecutionStateKeys,
  resolveExecutionStateKeyPath,
  formatExecutionStateKeyPath,
  executionStateSegment,
  EXECUTION_STATE_KEY_PATH_SEPARATOR,
  type ExecutionStateKeysTree,
  type ResolvedExecutionStateKey
} from './state-keys';
// Store Keys/Namespaces Registry (typed helpers)
export * from './store/registry';

// ==================== EXECUTOR COMPOSITION (generic-executors) ====================

export {
  sequential,
  parallel,
  pipe,
  conditional,
  repeat,
  dynamic,
  switchExecutor,
  branch,
  identity,
  transform,
  tryExecutor,
  timeout,
  retry,
  ResilientExecutor,
  withResilience,
  withRetry,
  withTimeout,
  cache,
  gate,
  type RetryOptions,
  type CircuitBreakerOptions,
  type ResilientExecutorConfig,
} from '@bitcode/generic-executors';

// Process-root Execution helpers (@bitcode/generic-executions)
export {
  PROCESS_ROOT_EXECUTION_ID,
  PROCESS_NAMESPACE,
  type ProcessRootFields,
  initializeProcessRoot,
  setProcessRootFields,
  getProcessRootExecution,
  getProcessRootFields,
  endProcessRoot,
  prepareProcessRootForPrompt,
  serializeProcessRootFields,
} from '@bitcode/generic-executions';

// ==================== STORAGE CONTROL ====================

// Storage destination enum
export { ExecutionStorageDestination } from './storage/StorageDestination';

// Storage types
export type {
  ExecutionStorageConfig,
  ExecutionStorageOptions,
  ExecutionStorageResult
} from './storage/StorageDestination';

// Default storage options
export { DEFAULT_EXECUTION_STORAGE_OPTIONS } from './storage/StorageDestination';

// Storage adapter for persistence
export { ExecutionStorageAdapter } from './storage/ExecutionStorageAdapter';

// Stream adapter for real-time streaming
export {
  ExecutionStreamAdapter,
  ExecutionStreamEventType,
  type ExecutionStreamConfig 
} from './storage/ExecutionStreamAdapter';

// Type-safe storage types
export type {
  StorableValue,
  StorableObject,
  StorableArray,
  TypedStore,
  NamespaceRegistry,
  ExecutionNamespaces,
  KnownNamespace,
  NamespaceValue
} from './types';

// File change tracking
export {
  recordFileChange,
  getFileChanges,
  getFileChangeStats,
  extractFileChangesFromToolResults,
  clearFileChanges,
  type FileChange,
  type FileChangeStats
} from './store/file-change-tracker';

// Work updates
export {
  storeAgentStepWorkUpdate,
  storeIterationWorkUpdate,
  buildAgentStepWorkUpdate,
  buildSDIVFPipelineUpdate,
  accumulateIterationWorkContext,
  consumeIterationWorkContext,
  type WorkUpdate,
  type AgentStepWorkUpdate,
  type SDIVFPipelineUpdate,
  type ToolUsageUpdate,
} from './work-update';

// ==================== SIGNALS ====================

// Short circuit signal for pipeline termination
export {
  ShortCircuitSignalSchema,
  hasShortCircuitSignal,
  ShortCircuitError
} from './signals/ShortCircuitSignal';

export type {
  ShortCircuitSignal,
  AgentOutput
} from './signals/ShortCircuitSignal';

// ==================== REGISTRY INTEGRATIONS ====================

// ExecutionPrompt base class
export { ExecutionPrompt } from './prompts/ExecutionPrompt';

// ExecutionToolRegistry and ExecutionTool
export { 
  ExecutionToolRegistry,
  ExecutionTool
} from './tools/ExecutionToolRegistry';

// ExecutionLLMRegistry
export {
  ExecutionLLMRegistry
} from './llms/ExecutionLLMRegistry';

// ==================== USAGE EXAMPLE ====================
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
