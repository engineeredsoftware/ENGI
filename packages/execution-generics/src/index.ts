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

// The Executor type - the heart of everything
export type { Executor } from './types';

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

// ==================== EXECUTOR COMPOSITION ====================

// Core composition patterns
export { sequential } from './executors/sequential_executor';
export { parallel } from './executors/parallel_executor';
export { pipe } from './executors/pipe_executor';

// Control flow executors
export { conditional } from './executors/conditional_executor';
export { repeat } from './executors/repeat_executor';
export { dynamic } from './executors/dynamic_executor';
export { switchExecutor } from './executors/switch_executor';
export { branch } from './executors/branch_executor';

// Transform executors
export { identity } from './executors/identity_executor';
export { transform } from './executors/transform_executor';

// Error handling executors
export { tryExecutor } from './executors/try_executor';
export { timeout } from './executors/timeout_executor';
export { retry } from './executors/retry_executor';

// Resilience patterns
export {
  ResilientExecutor,
  withResilience,
  withRetry,
  withTimeout,
  type RetryOptions,
  type CircuitBreakerOptions,
  type ResilientExecutorConfig
} from './executors/resilient_executor';

// Stateful utility executors
export { cache } from './executors/cache_executor';
export { gate } from './executors/gate_executor';

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
