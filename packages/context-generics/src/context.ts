/**
 * BC surface formerly packages/context/context.
 *
 * Process defaults are a process-root Execution — not a parallel Context bag.
 * Prefer @bitcode/generic-executions (`initializeProcessRoot`, …).
 */

export {
  type GlobalContext,
  type ProcessRootFields,
  initializeContext,
  createContext,
  getGlobalContext,
  endContext,
  setGlobalContext,
  prepareContextForPrompt,
  initializeProcessRoot,
  getProcessRootExecution,
  getProcessRootFields,
  endProcessRoot,
  setProcessRootFields,
  prepareProcessRootForPrompt,
} from '@bitcode/generic-executions';
