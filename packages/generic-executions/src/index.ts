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
  // BC Context vocabulary
  type GlobalContext,
  initializeContext,
  createContext,
  getGlobalContext,
  endContext,
  setGlobalContext,
  prepareContextForPrompt,
  serializeContext,
} from './process-root';
