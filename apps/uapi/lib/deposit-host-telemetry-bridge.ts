/**
 * Bridge in-box telemetry.jsonl lines (host telemetry-artifact-event) into the
 * product execution stream so the deposit UI can show F19 formal rows + live
 * call-chain pills without waiting solely on sandbox→Supabase dual-write.
 *
 * Host runner summarizes stream events as `pipeline-stream-event` with
 * streamEventType / namespace / key / executionState preserved. Dispatch must
 * not flatten those to status strings alone — that is what produced thousands
 * of "telemetry-readback — xai" fragments and zero formal log rows.
 */

import { ExecutionStreamAdapter } from '@bitcode/execution-generics';

export type HostTelemetryArtifact = {
  type?: unknown;
  streamEventType?: unknown;
  stage?: unknown;
  namespace?: unknown;
  key?: unknown;
  message?: unknown;
  executionState?: unknown;
  executionPath?: unknown;
  executionNodeId?: unknown;
  data?: unknown;
  tool?: unknown;
  toolOk?: unknown;
  error?: { message?: unknown } | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * @returns true when a structured stream event was emitted (caller should not
 * also emit a lossy status string for the same artifact).
 */
export function bridgeHostTelemetryArtifactToExecutionStream(
  executionId: string,
  telemetryEvent: unknown,
): boolean {
  const te = asRecord(telemetryEvent) as HostTelemetryArtifact | null;
  if (!te) return false;

  const streamType = readString(te.streamEventType) || readString(te.type);
  const ns = readString(te.namespace);
  const key = readString(te.key);
  const executionState = asRecord(te.executionState);
  const message =
    readString(te.message).trim() ||
    readString(te.error && asRecord(te.error)?.message).trim() ||
    '[content withheld — source-safe]';
  const path = Array.isArray(te.executionPath) ? te.executionPath : undefined;
  const nodeId = readString(te.executionNodeId) || undefined;

  // Formal LLM call (F19).
  if (streamType === 'generation' || (ns === 'llm' && key === 'output')) {
    void ExecutionStreamAdapter.emitEvent(executionId, 'generation' as never, {
      namespace: ns || 'llm',
      key: key || 'output',
      message,
      executionState: executionState || undefined,
      executionPath: path,
      executionNodeId: nodeId,
      data:
        asRecord(te.data) ||
        ({
          contentWithheld: true,
          sourceSafetyClass: 'source_safe',
        } as Record<string, unknown>),
    });
    return true;
  }

  // Formal tool use (F19).
  if (
    streamType === 'tool-use' ||
    ((ns === 'tool' || ns === 'tools') && (key === 'result' || key === 'error'))
  ) {
    const data = asRecord(te.data) || {};
    // Prefer explicit tool fields, then tool:Name on path/node id (pipeline tools).
    let toolName =
      readString(te.tool) ||
      readString(data.tool) ||
      readString(data.toolName) ||
      readString((te as { toolId?: unknown }).toolId) ||
      '';
    if (!toolName && Array.isArray(path)) {
      for (let i = path.length - 1; i >= 0; i -= 1) {
        const segment = String(path[i] || '');
        const leaf = segment.includes('/')
          ? segment.split('/').filter(Boolean).pop() || segment
          : segment;
        if (leaf.startsWith('tool:') && leaf.length > 5) {
          toolName = leaf.slice(5);
          break;
        }
      }
    }
    if (!toolName && nodeId) {
      const leaf = nodeId.includes('/')
        ? nodeId.split('/').filter(Boolean).pop() || nodeId
        : nodeId;
      if (leaf.startsWith('tool:') && leaf.length > 5) toolName = leaf.slice(5);
    }
    const title = toolName || (key === 'error' ? 'tool (failed)' : 'tool');
    void ExecutionStreamAdapter.emitEvent(executionId, 'tool-use' as never, {
      namespace: ns || 'tool',
      key: key || 'result',
      // Product log title is the tool constructor name, not the word "tool".
      message: title,
      executionState: {
        ...(executionState || {}),
        ...(toolName ? { tool: toolName } : {}),
      },
      executionPath: path,
      executionNodeId: nodeId,
      metadata: toolName ? { toolName } : undefined,
      data: {
        ...data,
        tool: toolName || data.tool || null,
        ok: typeof te.toolOk === 'boolean' ? te.toolOk : data.ok,
        contentWithheld: true,
        sourceSafetyClass: 'source_safe',
      },
    });
    return true;
  }

  // Hierarchy context stores — update rolling pills without formal rows.
  if (
    (ns === 'phase' && (key === 'current' || key === 'name')) ||
    (ns === 'agent' && key === 'name') ||
    (ns === 'step' && key === 'name')
  ) {
    const data =
      typeof te.data === 'string'
        ? te.data
        : executionState?.[ns === 'phase' ? 'phase' : ns === 'agent' ? 'agent' : 'step'];
    if (typeof data === 'string' && data.trim()) {
      void ExecutionStreamAdapter.emitEvent(executionId, 'status' as never, {
        namespace: ns,
        key,
        data,
        executionState: executionState || undefined,
        message: `pipeline: ${ns}/${key}=${data}`,
      });
      return true;
    }
  }

  // executionState-bearing progress (phase/agent/step latched on the event).
  if (executionState && (executionState.phase || executionState.agent || executionState.step)) {
    const phase = readString(executionState.phase);
    const agent = readString(executionState.agent);
    const step = readString(executionState.step);
    void ExecutionStreamAdapter.emitEvent(executionId, 'status' as never, {
      namespace: ns || undefined,
      key: key || undefined,
      executionState,
      executionPath: path,
      message: [
        'pipeline: progress',
        phase && `phase=${phase}`,
        agent && `agent=${agent}`,
        step && `step=${step}`,
        streamType && streamType !== 'pipeline-stream-event' && streamType,
      ]
        .filter(Boolean)
        .join(' · '),
    });
    return true;
  }

  // Drop low-value summarized fragments (stage-only telemetry-readback / xai bits).
  return false;
}
