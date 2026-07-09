/**
 * EXECUTION STREAM ADAPTER - Bridge between execution storage and streaming
 * 
 * Hooks into the execution storage flow to emit stream events
 * when executions store data. This enables real-time streaming
 * of pipeline execution progress.
 */

import { Streamer } from '@bitcode/streams';
import { ExecutionStorageDestination } from './StorageDestination';

/**
 * Stream event types emitted during execution
 */
export enum ExecutionStreamEventType {
  PHASE_START = 'phase-start',
  PHASE_COMPLETE = 'phase-complete',
  AGENT_START = 'agent-start',
  AGENT_COMPLETE = 'agent-complete',
  TOOL_USE = 'tool-use',
  GENERATION = 'generation',
  THINKING = 'thinking',
  ERROR = 'error',
  COMPLETION = 'completion',
  STATUS = 'status',
  WORK_UPDATE = 'work-update',
  // In-band failsafe repair work (e.g. the stitch loop recording the
  // validation error it is about to repair) — NOT a terminal failure.
  REPAIR = 'repair',
}

/**
 * Stream adapter configuration
 */
export interface ExecutionStreamConfig {
  streamer?: Streamer;
  emitToDatabase?: boolean;
  runId?: string;
  userId?: string;
}

// Content-bearing stores that must never enter the stream payload with
// verbatim bodies (deposit inventory.sources, pipeline:input, llm prompts,
// tool args/results, PCC selectedContext). Mirrored from the pipelines-generics
// sourceSafeStreamEvent allowlist so redaction happens BEFORE emit — full-repo
// inventories (~hundreds of MB) previously crashed with "Invalid string length"
// when JSON.stringify'd for telemetry.
const SOURCE_SAFE_LLM_METADATA_KEYS = new Set([
  'startTime',
  'endTime',
  'duration',
  'usage',
  'status',
  'provider',
  'model',
  'configKey',
  'stopReason',
  'error',
]);
const SOURCE_CONTENT_BEARING_KEYS_BY_NAMESPACE: Record<string, Set<string>> = {
  pipeline: new Set(['input']),
  deposit: new Set(['inventory']),
  tool: new Set(['input', 'result']),
  tools: new Set(['invocation', 'result']),
  context: new Set(['selectedContext', 'full']),
};

/**
 * Adapter for streaming execution events
 */
export class ExecutionStreamAdapter {
  private static streamers = new Map<string, Streamer>();

  /**
   * Register a streamer for an execution
   */
  static registerStreamer(
    executionId: string,
    streamer: Streamer
  ): void {
    this.streamers.set(executionId, streamer);
  }

  /**
   * Unregister a streamer
   */
  static unregisterStreamer(executionId: string): void {
    this.streamers.delete(executionId);
  }

  /**
   * Estimate serialized character weight without building a giant string.
   * Used so huge inventory stores report contentChars without JSON.stringify.
   */
  private static estimateSerializedChars(value: unknown, budget = 50_000_000): number {
    let total = 0;
    const visit = (node: unknown, keyHint = ''): void => {
      if (total >= budget) return;
      if (node == null) {
        total += 4;
        return;
      }
      const t = typeof node;
      if (t === 'string') {
        total += (node as string).length + 2;
        return;
      }
      if (t === 'number' || t === 'boolean') {
        total += String(node).length;
        return;
      }
      if (Array.isArray(node)) {
        // inventory.sources: sum content lengths without deep-walking every file blob.
        if (keyHint === 'sources' && node.length > 0 && node[0] && typeof node[0] === 'object') {
          total += 2;
          for (const item of node) {
            if (!item || typeof item !== 'object') continue;
            const file = item as { path?: unknown; content?: unknown };
            total +=
              20 +
              (typeof file.path === 'string' ? file.path.length : 0) +
              (typeof file.content === 'string' ? file.content.length : 0);
            if (total >= budget) return;
          }
          return;
        }
        total += 2;
        for (let i = 0; i < node.length; i += 1) {
          visit(node[i], keyHint);
          total += 1;
          if (total >= budget) return;
        }
        return;
      }
      if (t === 'object') {
        total += 2;
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
          total += k.length + 3;
          visit(v, k);
          if (total >= budget) return;
        }
      }
    };
    try {
      visit(value);
    } catch {
      return total > 0 ? total : 0;
    }
    return total;
  }

  private static isContentBearingStore(namespace: string, key: string): boolean {
    if (namespace === 'llm' && !SOURCE_SAFE_LLM_METADATA_KEYS.has(key)) return true;
    return SOURCE_CONTENT_BEARING_KEYS_BY_NAMESPACE[namespace]?.has(key) === true;
  }

  /**
   * Hook called when execution stores data
   * Emits appropriate stream events based on the storage namespace and key
   */
  static async onStore(
    executionId: string,
    namespace: string,
    key: string,
    value: any,
    destinations: ExecutionStorageDestination[],
    nodeInfo?: { nodeId: string; rootId: string; path: string[] }
  ): Promise<void> {
    const streamer = this.streamers.get(executionId);
    if (!streamer) return;

    // Determine event type based on namespace/key patterns
    const eventType = this.inferEventType(namespace, key, value);
    if (!eventType) return;

    const contentBearing = this.isContentBearingStore(namespace, key);

    // Best-effort metadata enrichment for UI (attach step stores when present).
    // Skip for content-bearing stores — never mirror raw inventory/prompt bodies
    // into metadata.stores (sourceSafeStreamEvent strips this channel too).
    const metadata: Record<string, any> = {};
    if (!contentBearing) {
      try {
        const stores: any = {};
        if (value && typeof value === 'object') {
          if (Array.isArray((value as any).usableTools)) {
            stores.tools = stores.tools || {};
            stores.tools.usable = (value as any).usableTools;
          }
          if (Array.isArray((value as any).useTools)) {
            stores.tools = stores.tools || {};
            stores.tools.use = (value as any).useTools;
          }
          if (Array.isArray((value as any).usedTools)) {
            stores.tools = stores.tools || {};
            stores.tools.used = (value as any).usedTools;
          }
          // Attach single tool invocation/result events as arrays if applicable
          if (namespace === 'tools' && key === 'invocation') {
            stores.toolEvents = stores.toolEvents || {};
            stores.toolEvents.invocation = [this.sanitizeData(value)];
          }
          if (namespace === 'tools' && key === 'result') {
            stores.toolEvents = stores.toolEvents || {};
            stores.toolEvents.result = [this.sanitizeData(value)];
          }
          // Attach generation output snapshots keyed by failsafe/generation
          if (namespace === 'llm') {
            const es = this.extractExecutionState(value);
            const fs = es.failsafe;
            const gn = es.generation;
            if (fs && gn) {
              stores.generations = stores.generations || {};
              stores.generations[fs] = stores.generations[fs] || {};
              (stores.generations[fs] as any)[gn] = {
                llm:
                  key === 'output'
                    ? { output: this.sanitizeData(value) }
                    : { input: this.sanitizeData(value) },
              };
            }
          }
        }
        if (Object.keys(stores).length > 0) metadata.stores = stores;
      } catch {}
    }

    // Content-bearing stores: emit a source-safe stub only. Never put
    // inventory.sources / pipeline input / llm bodies on the stream (they stay
    // in the in-memory Execution store for agents/measurement).
    const streamData = contentBearing
      ? {
          contentWithheld: true,
          sourceSafetyClass: 'source_safe',
          stage: key,
          namespace,
          contentChars: this.estimateSerializedChars(value),
          ...this.extractExecutionState(value),
        }
      : this.sanitizeData(value);

    // Build stream message
    const message = {
      type: eventType,
      executionId,
      executionNodeId: nodeInfo?.nodeId || executionId,
      executionRootId: nodeInfo?.rootId || executionId,
      executionPath: nodeInfo?.path || [],
      namespace,
      key,
      timestamp: new Date().toISOString(),
      executionState: this.extractExecutionState(value),
      message: contentBearing
        ? '[content withheld — source-safe]'
        : this.extractMessage(value),
      data: streamData,
      metadata,
    };

    if (eventType === ExecutionStreamEventType.WORK_UPDATE) {
      (message as any).update = message.data;
      (message as any).scope = key;
    }

    // Emit to stream
    await streamer.emit(message);
  }

  /**
   * Infer stream event type from storage patterns
   */
  private static inferEventType(
    namespace: string,
    key: string,
    value: any
  ): ExecutionStreamEventType | null {
    // Phase transitions
    if (namespace === 'phase' && key === 'start') {
      return ExecutionStreamEventType.PHASE_START;
    }
    if (namespace === 'phase' && key === 'complete') {
      return ExecutionStreamEventType.PHASE_COMPLETE;
    }

    // Agent activity
    if (namespace.startsWith('agent:')) {
      if (key === 'start') return ExecutionStreamEventType.AGENT_START;
      if (key === 'complete') return ExecutionStreamEventType.AGENT_COMPLETE;
    }

    // Tool usage: prefer 'result' as primary event; treat 'invocation' as status
    if (namespace === 'tools') {
      if (key === 'result') return ExecutionStreamEventType.TOOL_USE;
      if (key === 'invocation') return ExecutionStreamEventType.STATUS;
      return ExecutionStreamEventType.STATUS;
    }

    // Work updates
    if (namespace === 'work-update') {
      return ExecutionStreamEventType.WORK_UPDATE;
    }

    // Generation (LLM calls): prefer 'output' as primary event; treat 'input'/'prompt' as status
    if (namespace === 'llm') {
      if (key === 'output') return ExecutionStreamEventType.GENERATION;
      return ExecutionStreamEventType.STATUS;
    }

    // Thinking/reasoning
    if (namespace === 'thinking' || key.includes('reason')) {
      return ExecutionStreamEventType.THINKING;
    }

    // Failsafe repair context: the stitch loop stores the schema-validation
    // error it is ABOUT TO REPAIR ('validation'/'error') before running its
    // bounded repair generations. That is in-band failsafe work, not a
    // terminal failure — typing it 'error' made stream consumers treat an
    // actively-repairing run as failed (tail closed, run marked failed) while
    // the pipeline kept working.
    if (namespace === 'validation' && key === 'error') {
      return ExecutionStreamEventType.REPAIR;
    }

    // Errors
    if (namespace === 'error' || key === 'error') {
      return ExecutionStreamEventType.ERROR;
    }

    // Completion
    if (namespace === 'final' || key === 'completion') {
      return ExecutionStreamEventType.COMPLETION;
    }

    // Default to status
    return ExecutionStreamEventType.STATUS;
  }

  /**
   * Extract execution state from stored value
   */
  private static extractExecutionState(value: any): any {
    if (!value || typeof value !== 'object') return {};

    return {
      phase: value.phase || value.currentPhase,
      agent: value.agent || value.currentAgent,
      step: value.step || value.currentStep,
      failsafe: value.failsafe || value.currentFailsafe,
      generation: value.generation || value.currentGeneration,
    };
  }

  /**
   * Extract human-readable message from stored value
   */
  private static extractMessage(value: any): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';

    // Look for common message fields
    return value.message || 
           value.description || 
           value.status?.message ||
           value.text ||
           value.output ||
           '';
  }

  /**
   * Sanitize data for streaming (remove sensitive/large content)
   */
  private static sanitizeData(value: any): any {
    if (!value || typeof value !== 'object') return value;

    // Create shallow copy
    const sanitized = { ...value };

    // Remove large fields
    delete sanitized.fullContent;
    delete sanitized.rawData;
    delete sanitized.tokens;
    delete sanitized.embeddings;

    // Truncate long strings
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    }

    return sanitized;
  }

  /**
   * Emit a custom event directly
   */
  static async emitEvent(
    executionId: string,
    type: ExecutionStreamEventType,
    data: any
  ): Promise<void> {
    const streamer = this.streamers.get(executionId);
    if (!streamer) return;

    await streamer.emit({
      type,
      executionId,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }
} 
