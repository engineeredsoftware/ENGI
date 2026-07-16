/**
 * Work Update Contracts
 *
 * Work updates provide real-time visibility into what an execution is doing.
 * They are emitted during execution (agent steps, DIV iterations) and streamed
 * to the UI via the ExecutionStreamAdapter when stored under the
 * `work-update` namespace.
 */

import type { Execution } from './Execution';
import type { StorableObject, StorableValue } from './types';
import {
  getFileChanges,
  clearFileChanges,
  type FileChange,
} from './store/file-change-tracker';

/**
 * Shared tool usage summary.
 */
export interface ToolUsageUpdate extends StorableObject {
  name: string;
  description?: string;
  successful?: boolean;
  metadata?: Record<string, StorableValue>;
}

/**
 * Base shape for all work updates.
 */
export interface WorkUpdate extends StorableObject {
  id: string;
  timestamp: string;
  prose: string;
  files: FileChange[];
  tools: ToolUsageUpdate[];
  meta?: Record<string, StorableValue>;
}

/**
 * Work update emitted after an agent step completes (Plan/Try/Refine/Retry).
 */
export interface AgentStepWorkUpdate extends WorkUpdate {
  phase?: string;
  agent: string;
  step: 'Plan' | 'Try' | 'Refine' | 'Retry';
}

/**
 * Work update emitted after a SDIVF DIV iteration completes (Validation ready-to-instruct).
 * The prose is the self-instruction text for the next iteration.
 */
/** Work update for an ExecutionPipelineSDIVF DIV iteration (hierarchy-named). */
export interface ExecutionPipelineSDIVFUpdate extends WorkUpdate {
  iteration: number;
  selfInstruction: string;
  confidence: number;
  suggestions: string[];
}

/** @deprecated Use ExecutionPipelineSDIVFUpdate */
export type SDIVFPipelineUpdate = ExecutionPipelineSDIVFUpdate;

const WORK_UPDATE_NAMESPACE = 'work-update';
const LATEST_AGENT_STEP_KEY = 'latest-agent-step';

interface IterationAggregateState {
  files: FileChange[];
  tools: ToolUsageUpdate[];
}

const iterationAggregateState = new WeakMap<Execution, IterationAggregateState>();

/**
 * Store the latest agent step work update on the root execution.
 * Existing file-change snapshots on the step execution are cleared to avoid
 * bleeding state into future updates.
 */
export function storeAgentStepWorkUpdate(
  execution: Execution,
  update: AgentStepWorkUpdate
): void {
  const root = execution.getRoot();
  root.store(WORK_UPDATE_NAMESPACE, LATEST_AGENT_STEP_KEY, update);
}

/**
 * Append (or overwrite) the work update for a specific DIV iteration.
 * Also store the latest iteration update for quick access.
 */
export function storeIterationWorkUpdate(
  execution: Execution,
  update: ExecutionPipelineSDIVFUpdate
): void {
  const root = execution.getRoot();
  root.store(WORK_UPDATE_NAMESPACE, `iteration-${update.iteration}`, update);
  root.store(WORK_UPDATE_NAMESPACE, 'latest-iteration', update);
}

/**
 * Helper to build an AgentStepWorkUpdate using the data captured on the step
 * execution. This clears step-level file change buffers after extraction.
 */
export function buildAgentStepWorkUpdate(params: {
  execution: Execution;
  agent: string;
  phase?: string;
  step: 'Plan' | 'Try' | 'Refine' | 'Retry';
  prose: string;
  tools: ToolUsageUpdate[];
  meta?: Record<string, StorableValue>;
}): AgentStepWorkUpdate {
  const { execution, agent, phase, step, prose, tools, meta } = params;
  const files = getFileChanges(execution);
  clearFileChanges(execution);

  accumulateIterationWorkContext(execution, files, tools);

  return {
    id: `${execution.id}:${Date.now()}`,
    timestamp: new Date().toISOString(),
    prose,
    files,
    tools,
    phase,
    agent,
    step,
    meta,
  };
}

/**
 * Helper to build an ExecutionPipelineSDIVF DIV-iteration work update.
 */
export function buildExecutionPipelineSDIVFUpdate(params: {
  execution: Execution;
  iteration: number;
  prose: string;
  selfInstruction: string;
  confidence: number;
  suggestions: string[];
  tools: ToolUsageUpdate[];
  meta?: Record<string, StorableValue>;
}): ExecutionPipelineSDIVFUpdate {
  const { execution, iteration, prose, selfInstruction, confidence, suggestions, tools, meta } =
    params;
  const aggregate = consumeIterationWorkContext(execution);
  const files = aggregate.files.length ? aggregate.files : getFileChanges(execution);
  const combinedTools = aggregate.tools.length ? aggregate.tools : tools;
  clearFileChanges(execution);

  return {
    id: `${execution.id}:iteration-${iteration}:${Date.now()}`,
    timestamp: new Date().toISOString(),
    prose,
    files,
    tools: combinedTools,
    iteration,
    selfInstruction,
    confidence,
    suggestions,
    meta,
  };
}

/** @deprecated Use buildExecutionPipelineSDIVFUpdate */
export const buildSDIVFPipelineUpdate = buildExecutionPipelineSDIVFUpdate;

export function accumulateIterationWorkContext(
  execution: Execution,
  files: FileChange[],
  tools: ToolUsageUpdate[]
): void {
  if (!files.length && !tools.length) return;
  const root = execution.getRoot();
  const aggregate = iterationAggregateState.get(root) || { files: [], tools: [] };
  aggregate.files = aggregate.files.concat(files);
  aggregate.tools = aggregate.tools.concat(tools);
  iterationAggregateState.set(root, aggregate);
}

export function consumeIterationWorkContext(execution: Execution): IterationAggregateState {
  const root = execution.getRoot();
  const aggregate = iterationAggregateState.get(root) || { files: [], tools: [] };
  iterationAggregateState.set(root, { files: [], tools: [] });
  return aggregate;
}
