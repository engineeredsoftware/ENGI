// Canonical location for all generic streaming helpers used across Bitcode.
// Prefer `@bitcode/api/streams`.

// DataStream type - properly typed for streaming data chunks
export interface DataStream {
  writeData(chunk: string | object): Promise<void>;
  flush?(): Promise<void>;
}

import { log } from '@bitcode/logger';
import { supabaseAdmin } from '@bitcode/supabase';

// Import canonical types from pipelines-generics (SSOT)
import type {
  PhaseTitle,
  StepTitle,
  MetaStep,
  SubStep,
  ExecutionState as PipelineExecutionState
} from '@bitcode/pipelines-generics';

// Re-export canonical stream-facing type names.
export type ExecutionPhase = PhaseTitle;
export type ExecutionStep = StepTitle;
export type FailsafeStep = MetaStep;
export type GenerationStep = SubStep;

// ExecutionState for stream messages (re-export from pipelines-generics)
export type ExecutionState = PipelineExecutionState;

/* ---- Message type definitions ------------------------------------------------ */

export interface ToolUseMessage {
  toolName: string;
  args?: any;
  result?: any;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface GenerationMessage {
  model?: string;
  input: any;
  output?: any;
  error?: string;
  tokens?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  metadata?: Record<string, any>;
}

export interface FileDiff {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  linesAdded?: number;
  linesRemoved?: number;
  oldContent?: string;
  newContent?: string;
  language?: string;
}

export interface FileTreeChange {
  filesCreated: number;
  filesModified: number;
  filesDeleted: number;
  totalLinesAdded: number;
  totalLinesRemoved: number;
  files: FileDiff[];
}

export interface StreamMessage {
  type: 'generation' | 'tool-use' | 'error' | 'completion' | 'thinking' | 'file-diff';
  executionState?: ExecutionState;
  progress?: 'in-progress' | 'success' | 'warning' | 'error';
  message: string;
  detail?: string;
  result?: any;
  duration?: number;
  correlationId?: string;
  timestamp?: string;
  metadata?: object;
  fileDiff?: FileDiff; // Single file diff
  fileTree?: FileTreeChange; // Complete file tree changes
}

/* ---- Core helpers ------------------------------------------------------------ */

export async function writeStreamMessage(dataStream: DataStream | undefined, message: StreamMessage) {
  if (!dataStream) {
    log('No data stream available', 'warn', { message });
    return;
  }

  try {
    if (!message.detail && message.message) message.detail = `Processing: ${message.message}`;

    /* ---- Execution path helpers ------------------------------------------- */
    if (message.executionState) {
      if (!message.executionState.phase) message.executionState.phase = 'Setup';

      const executionPath = [
        message.executionState.phase,
        message.executionState.agent,
        message.executionState.step,
        message.executionState.failsafe,
        message.executionState.generation,
      ]
        .filter(Boolean)
        .join(' → ');

      if (executionPath && !message.message.includes(executionPath)) {
        message.message = `[${executionPath}] ${message.message}`;
      }
    }

    // Mark schema validation messages so that UIs can highlight them.
    if (message.metadata && typeof message.metadata === 'object' && message.message?.includes('schema')) {
      message.metadata = { ...message.metadata, messageCategory: 'schema-validation' };
    }

    // Enhance file diff messages with summary statistics
    if (message.type === 'file-diff' && message.fileDiff) {
      const { action, path, linesAdded = 0, linesRemoved = 0 } = message.fileDiff;
      message.detail = `${action === 'created' ? 'Created' : action === 'deleted' ? 'Deleted' : 'Modified'} ${path} (+${linesAdded}/-${linesRemoved})`;
    }

    // Enhance file tree change messages with total statistics
    if (message.type === 'file-diff' && message.fileTree) {
      const { filesCreated, filesModified, filesDeleted, totalLinesAdded, totalLinesRemoved } = message.fileTree;
      message.detail = `${filesCreated} created, ${filesModified} modified, ${filesDeleted} deleted (+${totalLinesAdded}/-${totalLinesRemoved} lines)`;
    }

    if (message.executionState && message.metadata) (message.metadata as any).executionState = message.executionState;

    if (message.executionState) {
      if (!message.metadata) message.metadata = {};
      (message.metadata as any).executionPath = {
        phase: message.executionState.phase,
        agent: message.executionState.agent,
        step: message.executionState.step,
        failsafe: message.executionState.failsafe,
        generation: message.executionState.generation,
        fullPath: [
          message.executionState.phase,
          message.executionState.agent,
          message.executionState.step,
          message.executionState.failsafe,
          message.executionState.generation,
        ]
          .filter(Boolean)
          .join(' → '),
      };
    }

    const formatted = { ...message, timestamp: message.timestamp || new Date().toISOString() };
    if (!formatted.correlationId && formatted.metadata) {
      const rid = (formatted.metadata as any).runId || (formatted.metadata as any).run_id;
      if (typeof rid === 'string') formatted.correlationId = rid;
    }

    await dataStream.writeData(JSON.stringify(formatted) + '\n');

    if (formatted.type === 'error' || formatted.progress === 'error') {
      try {
        await supabaseAdmin
          .from('error_logs')
          .insert({ level: 'error', message: formatted.detail || formatted.message, metadata: formatted.metadata });
      } catch { }
    }

    /* -------------------------------------------------------------------
     * NEW: Persist every stream message so that admin dashboards can query
     *      historical logs even after the run has finished.  We write into
     *      the new `stream_logs` table with a best-effort insert – failures
     *      must never affect pipeline execution.
     * ------------------------------------------------------------------- */
    try {
      const runId = formatted.correlationId || (formatted.metadata as any)?.runId || (formatted.metadata as any)?.run_id;

      // Guard: only persist when we have a run identifier to relate the row
      if (typeof runId === 'string' && runId.length > 0) {
        await supabaseAdmin.from('stream_logs').insert({
          run_id: runId,
          type: formatted.type,
          progress: formatted.progress,
          message: formatted.message,
          detail: formatted.detail,
          result: formatted.result,
          metadata: formatted.metadata,
          ts: formatted.timestamp || new Date().toISOString(),
        });
      }
    } catch (err) {
      log('Failed to persist stream message', 'warn', { err });
    }

    if (process.env.NODE_ENV === 'development') {
      log('Stream message sent', 'debug', {
        type: message.type,
        phase: message.executionState?.phase,
        agent: message.executionState?.agent,
        step: message.executionState?.step,
      });
    }
  } catch (err) {
    log('Failed to write stream message', 'error', { err });
    try {
      await dataStream.writeData(
        JSON.stringify({ type: 'error', message: 'Failed to stream message', detail: err instanceof Error ? err.message : String(err) }) +
        '\n',
      );
    } catch { }
  }
}

export async function writeStreamError(
  dataStream: DataStream | undefined,
  error: Error | string,
  correlationId?: string,
) {
  await writeStreamMessage(dataStream, {
    type: 'error',
    message: typeof error === 'string' ? error : error.message,
    detail: typeof error === 'string' ? undefined : error.stack,
    correlationId,
  });
}

export async function writeStreamWarning(
  dataStream: DataStream | undefined,
  message: string,
  detail?: string,
  metadata?: object,
  correlationId?: string,
) {
  await writeStreamMessage(dataStream, {
    type: 'tool-use',
    progress: 'warning',
    message,
    detail,
    metadata,
    correlationId,
  });
}

/* ---- Higher level helpers --------------------------------------------------- */

export async function writeStreamToolUse(
  dataStream: DataStream | undefined,
  toolUse: ToolUseMessage,
  executionState?: ExecutionState,
  correlationId?: string,
) {
  const { trace } = await import('@bitcode/observability');
  await trace(`tool:${toolUse.toolName}`, async () => {
    const startMsg = `Tool: ${toolUse.toolName}`;
    const detail = toolUse.error
      ? `Error: ${toolUse.error}`
      : toolUse.result !== undefined
        ? `Result: ${typeof toolUse.result === 'string'
          ? toolUse.result.slice(0, 150) + (String(toolUse.result).length > 150 ? '...' : '')
          : JSON.stringify(toolUse.result)}`
        : 'No result';

    await writeStreamMessage(dataStream, {
      type: 'tool-use',
      executionState,
      message: startMsg,
      detail,
      metadata: { ...toolUse, args: toolUse.args, duration: toolUse.duration },
      correlationId,
    });
  });
}

/**
 * Stream a generation event (LLM/AI model invocation).
 * Aligned with modern agent architecture terminology.
 */
export async function writeStreamGeneration(
  dataStream: DataStream | undefined,
  call: GenerationMessage & { purpose?: string;[key: string]: any },
  executionState?: ExecutionState,
  correlationId?: string,
) {
  if (!dataStream) return;

  // Derive a user-friendly message headline
  const headlineParts: string[] = [];
  if (call.model) headlineParts.push(call.model);
  if (call.purpose) headlineParts.push(call.purpose);
  const headline = headlineParts.length > 0 ? headlineParts.join(' – ') : 'Generation';

  // Determine progress from available information
  const progress: 'in-progress' | 'success' | 'error' = call.error
    ? 'error'
    : call.output !== undefined
      ? 'success'
      : 'in-progress';

  await writeStreamMessage(dataStream, {
    type: 'generation',
    executionState,
    progress,
    message: headline,
    detail: call.error,
    result: call.output,
    metadata: { ...call },
    correlationId,
  });
}

/**
 * Stream a *chain-of-thought* fragment so that UIs can surface the model's
 * reasoning process without polluting the main result channel.
 */
export async function writeStreamThinking(
  dataStream: DataStream | undefined,
  text: string,
  executionState?: ExecutionState,
  correlationId?: string,
) {
  if (!dataStream) return;

  await writeStreamMessage(dataStream, {
    type: 'thinking',
    executionState,
    message: text,
    correlationId,
  });
}
