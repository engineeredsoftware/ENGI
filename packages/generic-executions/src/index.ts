/**
 * @bitcode/generic-executions
 *
 * Base **Execution** helpers over the Execution primitive.
 *
 * Hierarchy:
 *   Execution (@bitcode/execution-generics)
 *     → process-root Execution helpers (this package)
 *     → product pipeline executions (asset-packs-pipelines, …)
 *
 * There is no separate Context state: process defaults are an Execution.
 * There is no `@bitcode/context-generics` dual — import this package.
 */

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
} from './process-root';
