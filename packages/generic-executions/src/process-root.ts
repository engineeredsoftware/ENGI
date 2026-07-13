/**
 * Process-root Execution — process-scoped defaults formerly called GlobalContext.
 *
 * Law: there is no parallel "Context" state. Repo/task/stream defaults live on a
 * registered process-root Execution under the `process` namespace. Product
 * pipelines (synthesize-deposits, …) create their own Execution trees; they may
 * seed from process-root but do not maintain a second state model.
 */

import { Execution, createExecution } from '@bitcode/execution-generics/Execution';
import {
  registerExecution,
  getExecution,
  unregisterExecution,
} from '@bitcode/execution-generics/execution-registry';

/** Fixed id for the process-scoped root Execution. */
export const PROCESS_ROOT_EXECUTION_ID = 'process-root' as const;

/** Namespace for process-level defaults (repo, task, stream handles). */
export const PROCESS_NAMESPACE = 'process' as const;

/**
 * Process-level fields stored on the process-root Execution.
 * Formerly GlobalContext — kept as a plain bag for BC projection only.
 */
export interface ProcessRootFields {
  repoOwner?: string;
  repoName?: string;
  repoBranch?: string;
  repoCommit?: string;
  repoPath?: string;
  task?: string;
  userId?: string | number;
  connectionId?: number;
  attachments?: unknown[];
  otfInstructions?: unknown[];
  dataStream?: {
    writeData?: (...args: unknown[]) => Promise<void> | void;
    close?: (...args: unknown[]) => Promise<void> | void;
  };
}

const PROCESS_FIELD_KEYS: (keyof ProcessRootFields)[] = [
  'repoOwner',
  'repoName',
  'repoBranch',
  'repoCommit',
  'repoPath',
  'task',
  'userId',
  'connectionId',
  'attachments',
  'otfInstructions',
  'dataStream',
];

function ensureProcessRoot(): Execution {
  const existing = getExecution(PROCESS_ROOT_EXECUTION_ID);
  if (existing) return existing;
  const execution = createExecution(PROCESS_ROOT_EXECUTION_ID);
  registerExecution(PROCESS_ROOT_EXECUTION_ID, execution);
  return execution;
}

function writeFields(execution: Execution, fields: ProcessRootFields): void {
  for (const key of PROCESS_FIELD_KEYS) {
    if (key in fields && fields[key] !== undefined) {
      execution.store(PROCESS_NAMESPACE, key, fields[key] as never);
    }
  }
}

function readFields(execution: Execution): ProcessRootFields {
  const out: ProcessRootFields = {};
  for (const key of PROCESS_FIELD_KEYS) {
    const value = execution.get(PROCESS_NAMESPACE, key);
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

/** Initialize (or replace) process-root Execution with the given fields. */
export function initializeProcessRoot(fields: ProcessRootFields = {}): Execution {
  // Replace prior process root so initialize is fail-closed about stale state.
  unregisterExecution(PROCESS_ROOT_EXECUTION_ID);
  const execution = createExecution(PROCESS_ROOT_EXECUTION_ID);
  writeFields(execution, fields);
  registerExecution(PROCESS_ROOT_EXECUTION_ID, execution);
  return execution;
}

/** Merge fields onto process-root (creates root if missing). */
export function setProcessRootFields(fields: ProcessRootFields): Execution {
  const execution = ensureProcessRoot();
  writeFields(execution, fields);
  return execution;
}

/** Return the process-root Execution (creates empty root if missing). */
export function getProcessRootExecution(): Execution {
  return ensureProcessRoot();
}

/** Read process-root fields as a plain object (BC projection). */
export function getProcessRootFields(): ProcessRootFields {
  return readFields(ensureProcessRoot());
}

/** Clear and unregister process-root. */
export function endProcessRoot(): void {
  unregisterExecution(PROCESS_ROOT_EXECUTION_ID);
}

/** Source-safe projection for prompts (no dataStream). */
export function prepareProcessRootForPrompt(fields?: ProcessRootFields) {
  const merged = { ...getProcessRootFields(), ...(fields || {}) };
  return {
    repoOwner: merged.repoOwner,
    repoName: merged.repoName,
    branch: merged.repoBranch,
    commit: merged.repoCommit,
    task: merged.task,
    otfInstructions: merged.otfInstructions,
  };
}

/** Serialize process fields without live stream handles. */
export function serializeProcessRootFields(
  fields: ProcessRootFields = getProcessRootFields(),
): Record<string, unknown> {
  const { dataStream, ...rest } = fields;
  return {
    ...rest,
    dataStream: dataStream
      ? {
          hasWriter: Boolean(dataStream.writeData),
          hasCloser: Boolean(dataStream.close),
        }
      : undefined,
  };
}

// --- BC names (deprecated vocabulary: "Context" → Execution) -----------------

/** @deprecated Use ProcessRootFields — Context is not a separate state model. */
export type GlobalContext = ProcessRootFields;

/** @deprecated Use initializeProcessRoot. */
export async function initializeContext(
  context: ProcessRootFields = {},
): Promise<ProcessRootFields> {
  initializeProcessRoot(context);
  return getProcessRootFields();
}

/** @deprecated Use setProcessRootFields / initializeProcessRoot. */
export function createContext(context: ProcessRootFields): ProcessRootFields {
  initializeProcessRoot(context);
  return getProcessRootFields();
}

/** @deprecated Use getProcessRootFields. */
export function getGlobalContext(): ProcessRootFields {
  return getProcessRootFields();
}

/** @deprecated Use endProcessRoot. */
export async function endContext(): Promise<void> {
  endProcessRoot();
}

/** @deprecated Use setProcessRootFields. */
export function setGlobalContext(context: ProcessRootFields): void {
  setProcessRootFields(context);
}

/** @deprecated Use prepareProcessRootForPrompt. */
export function prepareContextForPrompt(context?: ProcessRootFields) {
  return prepareProcessRootForPrompt(context);
}

/** @deprecated Use serializeProcessRootFields. */
export function serializeContext(
  context: ProcessRootFields = getProcessRootFields(),
): Record<string, unknown> {
  return serializeProcessRootFields(context);
}
