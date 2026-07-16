/**
 * PIPELINE STREAM INTEGRATION - Connect pipelines to streaming infrastructure
 * 
 * Provides helpers to wire up pipeline executions with stream managers
 * for real-time event emission during pipeline executions.
 */

import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { Execution } from '@bitcode/execution-generics/Execution';
import { toPhaseLower, toStepLower } from '../types/primitives';
import { Streamer } from '@bitcode/api/streams';
import { ExecutionEventsModel } from '@bitcode/orm';

type SupabaseClient = any;

/**
 * Configuration for pipeline streaming
 */
export interface PipelineStreamConfig {
  runId: string;
  userId: string;
  pipelineRunId?: string | null;
  supabase?: SupabaseClient;
  streamToDatabase?: boolean;
  streamToSSE?: boolean;
  structuredToDatabase?: boolean;
}

// Source-safety law (V48): pipeline telemetry must never serialize raw prompts
// or provider responses (rawPromptVisible/rawProviderResponseVisible=false). Raw
// prompt/response content auto-streams via Execution.store under the `llm`
// namespace, but the content-bearing key NAMES drift between the two LLM-call
// paths: the formal Thinkings substeps store `input`/`prompt`/`output`/
// `parsedOutput`, while AgentLLMsRegistry/ExecutionPipelineLLMRegistry (direct getLLM
// calls) store `messages`/`config`/`response`. A content-key denylist silently
// missed `response`, so a raw model response leaked through as a status-event
// message (and the renderer split that multi-line payload into one row per
// line). We therefore withhold by ALLOWLIST: every `llm` store is content-
// withheld EXCEPT a fixed set of source-safe metadata keys. This is robust to
// new content keys and is applied universally to every pipeline stream event
// (not per-pipeline).
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

// Content-bearing NON-llm stores that can carry verbatim depositor source and
// must therefore also be withheld (same allowlist philosophy — the withheld
// projection keeps only fixed source-safe metadata):
//  - pipeline:input      the full pipeline input, which on a deposit carries
//                        the verbatim inventory (inventory.sources[*].content);
//  - deposit:inventory   the verbatim depositor source inventory itself;
//  - tool:input/result   ExecutionTool.execute raw tool args/results
//                        (repository reads flow straight through these);
//  - tools:invocation/result  the Thinkings tool-loop's per-invocation
//                        args/results stores.
// Tool telemetry keeps its name/duration/status metadata: those live in the
// SEPARATE tool:name/startTime/endTime/status stores (each store() call is its
// own event) plus the safe projection fields below.
const SOURCE_CONTENT_BEARING_KEYS_BY_NAMESPACE: Record<string, Set<string>> = {
  pipeline: new Set(['input']),
  deposit: new Set(['inventory']),
  tool: new Set(['input', 'result']),
  tools: new Set(['invocation', 'result']),
  // PCC's read-in re-carries the resolved VALUES of the selected keys — when
  // the selection includes the inventory, selectedContext holds verbatim
  // source (observed live, run 59504a3e). context:keys/selectedKeys/
  // missingKeys stay visible: key NAMES are source-safe.
  context: new Set(['selectedContext', 'full']),
};

/**
 * Estimate serialized character weight without building a giant string.
 * Full-repo deposit inventories can exceed V8 string limits when
 * JSON.stringify'd (~hundreds of MB of inventory.sources[*].content), which
 * previously crashed runs with "Invalid string length" during telemetry.
 */
export function estimateSerializedChars(
  value: unknown,
  budget = 50_000_000,
): number {
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
    if (t === 'bigint') {
      total += String(node).length + 1;
      return;
    }
    if (Array.isArray(node)) {
      // inventory.sources — O(n) length sum, not deep string walks of every blob.
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

export function sourceSafeStreamEvent(event: any): any {
  if (!event || typeof event !== 'object') return event;
  const namespace = String((event as any).namespace ?? '');
  const key = String((event as any).key ?? '');
  // llm-namespace stores carry raw prompt/response content: withhold every llm
  // store EXCEPT the fixed metadata allowlist. A fixed set of non-llm stores
  // (pipeline input / deposit inventory / tool args+results) carries verbatim
  // source content and is withheld too. Everything else passes through
  // unchanged.
  const isLlmContent = namespace === 'llm' && !SOURCE_SAFE_LLM_METADATA_KEYS.has(key);
  const isSourceContent =
    SOURCE_CONTENT_BEARING_KEYS_BY_NAMESPACE[namespace]?.has(key) === true;
  if (!isLlmContent && !isSourceContent) {
    return event;
  }
  const data =
    (event as any).data && typeof (event as any).data === 'object'
      ? ((event as any).data as Record<string, any>)
      : {};
  // Prefer an already-computed contentChars from an upstream redaction (onStore
  // stubs huge inventories so the stream never holds verbatim sources).
  let contentChars: number | null =
    typeof data.contentChars === 'number' && Number.isFinite(data.contentChars)
      ? data.contentChars
      : null;
  if (contentChars == null) {
    if (typeof (event as any).data === 'string') {
      contentChars = (event as any).data.length;
    } else if (typeof data.content === 'string') {
      contentChars = data.content.length;
    } else if (typeof data.prompt === 'string') {
      contentChars = data.prompt.length;
    } else if ((event as any).data && typeof (event as any).data === 'object') {
      // Walk-only size estimate — never JSON.stringify multi-hundred-MB inventories.
      contentChars = estimateSerializedChars((event as any).data);
    }
  }
  const state =
    (event as any).executionState && typeof (event as any).executionState === 'object'
      ? (event as any).executionState
      : {};
  // The stream adapter mirrors content into metadata.stores (toolEvents /
  // generations snapshots) — strip it so withheld content cannot leak through
  // the enrichment side channel.
  const metadata =
    (event as any).metadata && typeof (event as any).metadata === 'object'
      ? (() => {
          const { stores: _stores, ...rest } = (event as any).metadata as Record<string, any>;
          return rest;
        })()
      : (event as any).metadata;
  return {
    ...event,
    metadata,
    message: '[content withheld — source-safe]',
    data: {
      contentWithheld: true,
      sourceSafetyClass: 'source_safe',
      stage: key,
      namespace,
      generation: data.generation ?? state.generation ?? null,
      provider: data.provider ?? null,
      model: data.model ?? null,
      // Tool metadata survives: name + outcome, never args/results.
      tool: typeof data.tool === 'string' ? data.tool : null,
      ok: typeof data.ok === 'boolean' ? data.ok : null,
      contentChars,
      phase: data.phase ?? state.phase ?? null,
      agent: data.agent ?? state.agent ?? null,
      step: data.step ?? state.step ?? null,
    },
  };
}

/**
 * Wire up a pipeline execution with streaming
 *
 * This registers a stream manager with the execution so that
 * all storage operations emit stream events automatically.
 */
export function enablePipelineStreaming(
  execution: Execution,
  config: PipelineStreamConfig
): Streamer {
  // Create streamer
  const streamer = new Streamer({
    streamId: config.runId,
    userId: config.userId,
  });

  // Register streamer with execution
  ExecutionStreamAdapter.registerStreamer(execution.id, streamer);

  // If database streaming is enabled, wire up event persistence
  const legacyExecutionEventsEnabled =
    config.streamToDatabase &&
    config.supabase &&
    (config.structuredToDatabase !== true || process?.env?.BITCODE_PIPELINE_LEGACY_EVENTS_DB === '1');

  if (legacyExecutionEventsEnabled && config.supabase) {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRe.test(String(config.runId || ''));

    // Ensure an `executions` row exists before any `execution_events` row can
    // reference it (execution_events.run_id has a FK to executions.id). Idempotent
    // (duplicate insert = row already exists, either way).
    const ensureExecutionsRowExists = async (): Promise<void> => {
      if (!isUuid) return;
      const now = new Date().toISOString();
      try {
        await config.supabase.from('executions').insert({
          id: config.runId,
          user_id: config.userId,
          status: 'running',
          type: 'agentic-execution:asset-pack',
          started_at: now,
          created_at: now,
          updated_at: now,
        } as any);
      } catch (e: any) {
        if (!String(e?.message || '').toLowerCase().includes('duplicate')) {
          // swallow non-duplicate as best-effort; the retry-on-FK-violation below
          // is the guaranteed backstop.
        }
      }
    };

    // Fire immediately (don't block registerStreamer/emitEvent below), but track
    // the promise so the FIRST event to persist can await it — otherwise the
    // initial "Pipeline execution started" status event (emitted synchronously
    // right after this function returns, e.g. by createStreamingExecution) races
    // this insert and can hit a 23503 FK violation before the row lands.
    let pendingEnsureRow: Promise<void> | null = ensureExecutionsRowExists();

    const eventsModel = new ExecutionEventsModel(config.supabase);

    // Subscribe to stream events and persist them
    streamer.subscribe(async (event) => {
      if (pendingEnsureRow) {
        await pendingEnsureRow;
        pendingEnsureRow = null;
      }
      const persist = () =>
        eventsModel.create({
          run_id: config.runId,
          event_type: event.type,
          event_data: sourceSafeStreamEvent(event),
          created_at: new Date().toISOString(),
        });
      try {
        await persist();
      } catch (error: any) {
        // Self-healing backstop: if the executions row still doesn't exist (any
        // residual race — slow network, replica lag, concurrent dispatch), ensure
        // it and retry once before giving up.
        if (error?.code === '23503') {
          try {
            await ensureExecutionsRowExists();
            await persist();
            return;
          } catch (retryError) {
            console.error('Failed to persist stream event after ensuring executions row:', retryError);
            return;
          }
        }
        console.error('Failed to persist stream event:', error);
      }
    });
  }

  // Optional structured persistence into the AssetPack execution hierarchy.
  const structuredEnabled = config.structuredToDatabase ?? (process?.env?.BITCODE_PIPELINE_STRUCTURED_DB === '1');
  if (structuredEnabled && config.supabase) {
    const supabase = config.supabase;
    const phaseState: { currentPhaseId: string | null; currentPhaseName: string | null } = {
      currentPhaseId: null,
      currentPhaseName: null,
    };
    const phaseIdByName = new Map<string, string>();
    const agentStepMap = new Map<string, string>();
    const generationMessagesByContext = new Map<string, unknown>();
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const deliverableRunId = String(config.runId || '');
    const canPersistDeliverableHierarchy = uuidRe.test(deliverableRunId);
    let deliverableRunReady: Promise<boolean> | null = null;
    let structuredWriteQueue: Promise<unknown> = Promise.resolve();

    const insertRow = async (table: string, row: any, returningId = false) => {
      const query = (supabase as any).from(table).insert(row);
      return returningId && query?.select
        ? query.select('id').single()
        : query;
    };

    const updateRows = async (table: string, patch: any, column: string, value: string) => {
      return (supabase as any).from(table).update(patch).eq(column, value);
    };

    const ensureDeliverableRun = (): Promise<boolean> => {
      if (!canPersistDeliverableHierarchy) {
        return Promise.resolve(false);
      }
      if (!deliverableRunReady) {
        const now = new Date().toISOString();
        deliverableRunReady = Promise.resolve(
          insertRow('deliverable_pipeline_runs', {
            id: deliverableRunId,
            user_id: config.userId,
            pipeline_run_id: config.pipelineRunId ?? null,
            pipeline_type: 'asset_pack',
            status: 'running',
            started_at: now,
            created_at: now,
            updated_at: now,
            input_data: {
              runId: config.runId,
              executionId: execution.id,
            },
            config: {
              structuredStreaming: true,
              streamToDatabase: config.streamToDatabase === true,
            },
            context: {
              bitcodePipelineHarness: true,
              source: 'pipeline-stream-integration',
            },
          })
        )
          .then(async (result: any) => {
            const message = String(result?.error?.message || result?.message || '').toLowerCase();
            const duplicate = message.includes('duplicate') || message.includes('already exists');
            if (duplicate && config.pipelineRunId) {
              await updateRows('deliverable_pipeline_runs', {
                pipeline_run_id: config.pipelineRunId,
                updated_at: new Date().toISOString(),
              }, 'id', deliverableRunId).catch(() => {});
            }
            return !message || duplicate;
          })
          .catch((error: any) => {
            const message = String(error?.message || '').toLowerCase();
            return message.includes('duplicate') || message.includes('already exists');
          });
      }
      return deliverableRunReady;
    };

    const persistDeliverableEvent = async (event: any, phaseName: string | null, agentName: string | null) => {
      if (!(await ensureDeliverableRun())) return;
      await insertRow('deliverable_pipeline_events', {
        run_id: deliverableRunId,
        event_type: String(event?.type || 'status'),
        event_data: event ?? {},
        phase: phaseName,
        agent_name: agentName,
      }).catch(() => {});
    };

    const normalizeEventContext = (event: any) => {
      const es = event?.executionState || {};
      const data = event?.data || {};
      const phaseName = toPhaseLower(String(event?.phase || es?.phase || data?.phase || '')) ?? null;
      const agentName = String(event?.agent || es?.agent || data?.agent || '').trim() || null;
      const stepType = toStepLower(String(event?.step || es?.step || data?.step || 'try')) ?? null;
      const failsafe = String(event?.failsafe || es?.failsafe || data?.failsafe || '').trim() || null;
      const generation = String(event?.generation || es?.generation || data?.generation || '').trim() || null;
      return { phaseName, agentName, stepType, failsafe, generation };
    };

    const agentStepKey = (
      phaseId: string | null,
      phaseName: string | null,
      agentName: string | null,
      stepType: string | null
    ) => `${phaseId || phaseName || 'unknown'}:${agentName || 'unknown'}:${stepType || 'try'}`;

    const generationContextKey = (context: ReturnType<typeof normalizeEventContext>) =>
      [
        context.phaseName || 'unknown',
        context.agentName || 'unknown',
        context.stepType || 'try',
        context.failsafe || 'none',
        context.generation || 'none',
      ].join(':');

    const normalizeToolExecutionEvent = (event: any) => {
      const type = String(event?.type || '');
      if (type === 'tool-use') {
        return {
          toolName: event?.data?.tool || event?.metadata?.toolName || 'tool',
          input: event?.data?.input ?? null,
          output: event?.data?.output ?? null,
          error: event?.data?.error ?? null,
        };
      }

      const isStoredToolResult =
        type === 'status' &&
        event?.namespace === 'tools' &&
        event?.data &&
        typeof event.data === 'object' &&
        event.data.tool;

      if (!isStoredToolResult) {
        return null;
      }

      return {
        toolName: event.data.tool,
        input: event.data.input ?? null,
        output: event.data.output ?? null,
        error: event.data.error ?? null,
      };
    };

    const normalizeToolError = (error: unknown) => {
      if (!error) return null;
      if (typeof error === 'object') return error;
      return { message: String(error) };
    };

    const markDeliverableRun = async (status: 'completed' | 'failed', payload?: any) => {
      if (!(await ensureDeliverableRun())) return;
      const now = new Date().toISOString();
      await updateRows('deliverable_pipeline_runs', {
        status,
        completed_at: now,
        updated_at: now,
        output_data: status === 'completed' ? (payload ?? {}) : {},
        error_data: status === 'failed' ? (payload ?? {}) : null,
      }, 'id', deliverableRunId).catch(() => {});
    };

    const ensurePhaseDelegationForEvent = async (
      phaseId: string | null | undefined,
      phaseName: string | null,
      now: string
    ): Promise<string | null> => {
      if (phaseId) return phaseId;
      if (!phaseName || !(await ensureDeliverableRun())) return null;
      const existing = phaseIdByName.get(phaseName);
      if (existing) return existing;

      const row: import('../types/db').DPPhaseDelegationInsert = {
        run_id: deliverableRunId,
        phase_name: phaseName,
        started_at: now,
        completed_at: now,
        status: 'completed',
        input_data: { inferredFrom: 'tool-execution-event' },
        output_data: { inferredFrom: 'tool-execution-event' },
      } as any;
      const { data, error } = await insertRow('deliverable_pipeline_phase_delegations', row, true);
      if (!error && data?.id) {
        phaseIdByName.set(phaseName, data.id);
        return data.id;
      }
      return null;
    };

    const ensureAgentStepForEvent = async (
      phaseId: string | null,
      phaseName: string | null,
      agentName: string | null,
      stepType: string | null,
      now: string
    ): Promise<string | null> => {
      if (!(phaseId && agentName && stepType)) return null;
      const key = agentStepKey(phaseId, phaseName, agentName, stepType);
      const existing = agentStepMap.get(key);
      if (existing) return existing;

      const row: import('../types/db').DPAgentStepInsert = {
        phase_delegation_id: phaseId,
        agent_name: agentName,
        step_type: stepType,
        started_at: now,
        completed_at: now,
        status: 'completed',
        input_data: { inferredFrom: 'tool-execution-event' },
        output_data: { inferredFrom: 'tool-execution-event' },
      } as any;
      const { data, error } = await insertRow('deliverable_pipeline_agent_steps', row, true);
      if (!error && data?.id) {
        agentStepMap.set(key, data.id);
        return data.id;
      }
      return null;
    };

    const completeOpenHierarchyRows = async (now: string) => {
      if (!(await ensureDeliverableRun())) return;
      const { data: openPhases } = await (supabase as any)
        .from('deliverable_pipeline_phase_delegations')
        .select('id')
        .eq('run_id', deliverableRunId)
        .eq('status', 'running');
      const openPhaseIds = Array.isArray(openPhases)
        ? openPhases.map((row: any) => row?.id).filter(Boolean)
        : [];
      if (!openPhaseIds.length) return;
      await (supabase as any)
        .from('deliverable_pipeline_agent_steps')
        .update({
          completed_at: now,
          status: 'completed',
        })
        .in('phase_delegation_id', openPhaseIds)
        .eq('status', 'running');
      await (supabase as any)
        .from('deliverable_pipeline_phase_delegations')
        .update({
          completed_at: now,
          status: 'completed',
        })
        .in('id', openPhaseIds)
        .eq('status', 'running');
    };

    const persistStructuredEvent = async (event: any) => {
      try {
        const type = String(event?.type || '');
        const context = normalizeEventContext(event);
        const now = new Date().toISOString();
        const { phaseName, agentName, stepType } = context;

        await persistDeliverableEvent(event, phaseName, agentName);

        const structuredTool = normalizeToolExecutionEvent(event);
        if (structuredTool && await ensureDeliverableRun()) {
          let phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
          phaseId = await ensurePhaseDelegationForEvent(phaseId ?? null, phaseName, now);
          const key = agentStepKey(phaseId ?? null, phaseName, agentName, stepType);
          const agentStepId =
            agentStepMap.get(key) ||
            await ensureAgentStepForEvent(phaseId ?? null, phaseName, agentName, stepType, now);
          const row: import('../types/db').DPToolExecInsert = {
            agent_step_id: agentStepId,
            substep_id: null,
            tool_name: structuredTool.toolName as any,
            tool_input: structuredTool.input as any,
            tool_output: structuredTool.output as any,
            tool_error: normalizeToolError(structuredTool.error) as any,
            created_at: now as any
          } as any;
          await insertRow('deliverable_pipeline_tool_executions', row);
        }

        if (type === 'phase-start') {
          if (!(phaseName && await ensureDeliverableRun())) return;
          const row: import('../types/db').DPPhaseDelegationInsert = {
            run_id: deliverableRunId,
            phase_name: phaseName,
            started_at: now,
            status: 'running',
            input_data: event?.data ?? {},
          } as any;
          const { data, error } = await insertRow('deliverable_pipeline_phase_delegations', row, true);
          if (!error && data?.id) {
            phaseState.currentPhaseId = data.id;
            phaseState.currentPhaseName = phaseName;
            phaseIdByName.set(phaseName, data.id);
          }
        } else if (type === 'phase-complete') {
          const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
          if (phaseId) {
            const failed = event?.data?.status === 'failed' || event?.data?.error;
            await updateRows('deliverable_pipeline_phase_delegations', {
              completed_at: now,
              status: failed ? 'failed' : 'completed',
              output_data: failed ? {} : (event?.data ?? {}),
              error_data: failed ? (event?.data?.error ?? event?.data ?? {}) : null,
            }, 'id', phaseId);
            if (failed) await markDeliverableRun('failed', event?.data?.error ?? event?.data);
          }
        } else if (type === 'agent-start') {
          const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
          if (phaseId && agentName && stepType) {
            const row: import('../types/db').DPAgentStepInsert = {
              phase_delegation_id: phaseId,
              agent_name: agentName,
              step_type: stepType,
              started_at: now,
              status: 'running',
              input_data: event?.data ?? {},
            } as any;
            const { data, error } = await insertRow('deliverable_pipeline_agent_steps', row, true);
            if (!error && data?.id) {
              agentStepMap.set(agentStepKey(phaseId, phaseName, agentName, stepType), data.id);
            }
          }
        } else if (type === 'agent-complete') {
          const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
          const key = agentStepKey(phaseId ?? null, phaseName, agentName, stepType);
          const id = agentStepMap.get(key);
          if (id) {
            const failed = event?.data?.status === 'failed' || event?.data?.error;
            await updateRows('deliverable_pipeline_agent_steps', {
              completed_at: now,
              status: failed ? 'failed' : 'completed',
              output_data: failed ? {} : (event?.data ?? {}),
              error_data: failed ? (event?.data?.error ?? event?.data ?? {}) : null,
            }, 'id', id);
          }
        } else if (type === 'error') {
          await markDeliverableRun('failed', event?.data ?? event);
          await updateRows('executions', { status: 'failed', completed_at: now }, 'id', config.runId).catch(() => {});
        } else if (type === 'completion') {
          await markDeliverableRun('completed', event?.data ?? event);
        } else if (type === 'generation') {
          if (!(await ensureDeliverableRun())) return;
          const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
          const key = agentStepKey(phaseId ?? null, phaseName, agentName, stepType);
          const agentStepId = agentStepMap.get(key) || null;
          const provider = event?.data?.provider || event?.metadata?.provider || null;
          const model = event?.data?.model || event?.metadata?.model || null;
          const messages =
            event?.data?.messages ??
            generationMessagesByContext.get(generationContextKey(context)) ??
            [];
          const response = event?.data?.response ?? {
            content: event?.data?.content ?? event?.data?.output ?? null,
            parsed: event?.data?.parsed ?? event?.data?.structuredOutput ?? null,
            raw: event?.data ?? {},
          };
          const row: import('../types/db').DPGenerationInsert = {
            run_id: deliverableRunId,
            phase_delegation_id: phaseId ?? null,
            agent_step_id: agentStepId,
            substep_id: null,
            model_provider: (provider || 'unknown') as any,
            model_name: (model || 'unknown') as any,
            messages: messages as any,
            response: response as any,
            created_at: now as any
          } as any;
          await insertRow('deliverable_pipeline_generations', row);
        } else if (type === 'status') {
          if (event?.namespace === 'llm' && event?.key === 'input') {
            const messages = event?.data?.messages;
            if (Array.isArray(messages)) {
              generationMessagesByContext.set(generationContextKey(context), messages);
            }
          }
          try {
            if (event?.namespace === 'llm' && event?.key === 'parsedOutput') {
              const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
              const key = agentStepKey(phaseId ?? null, phaseName, agentName, stepType);
              const agentStepId = agentStepMap.get(key) || null;
              if (agentStepId) {
                const { data: last, error: selErr } = await (supabase as any)
                  .from('deliverable_pipeline_generations')
                  .select('id,response')
                  .eq('agent_step_id', agentStepId)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                if (!selErr && last?.id) {
                  const previousResponse =
                    last.response && typeof last.response === 'object' && !Array.isArray(last.response)
                      ? last.response
                      : {};
                  await supabase
                    .from('deliverable_pipeline_generations')
                    .update({
                      response: {
                        ...previousResponse,
                        parsed: event?.data?.parsed ?? event?.data ?? null,
                        parsedAt: now,
                      },
                    })
                    .eq('id', last.id);
                }
              }
            }
          } catch (e) {
            // best-effort only
          }
          // Optional enrichment: correlate llm.usage to latest generation for this agent step
          try {
            if (event?.namespace === 'llm' && event?.key === 'usage') {
              const phaseId = phaseState.currentPhaseId || (phaseName ? phaseIdByName.get(phaseName) : null);
              const key = agentStepKey(phaseId ?? null, phaseName, agentName, stepType);
              const agentStepId = agentStepMap.get(key) || null;
              if (agentStepId) {
                const { data: last, error: selErr } = await (supabase as any)
                  .from('deliverable_pipeline_generations')
                  .select('id')
                  .eq('agent_step_id', agentStepId)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                if (!selErr && last?.id) {
                  const usage = event?.data || {};
                  await supabase
                    .from('deliverable_pipeline_generations')
                    .update({
                      input_tokens: usage.promptTokens ?? usage.inputTokens ?? null,
                      output_tokens: usage.completionTokens ?? usage.outputTokens ?? null,
                      total_tokens: usage.totalTokens ?? null,
                    })
                    .eq('id', last.id);
                }
              }
            }
          } catch (e) {
            // best-effort only
          }
        }

        // If Finish phase completes, mark run completed.
        if (type === 'phase-complete' && phaseName === 'finish') {
          await completeOpenHierarchyRows(now);
          await markDeliverableRun('completed', event?.data ?? event);
          await updateRows('executions', { status: 'completed', completed_at: now }, 'id', config.runId).catch(() => {});
        }
      } catch (err) {
        console.error('Structured stream persistence error', err);
      }
    };

    streamer.subscribe((event: any) => {
      structuredWriteQueue = structuredWriteQueue
        .catch(() => {})
        .then(() => persistStructuredEvent(event));
    });
    (streamer as any).flushStructuredWrites = () => structuredWriteQueue.catch(() => {});
  }

  // Note: Cleanup should be handled by the pipeline implementation
  // when it completes, by calling:
  // ExecutionStreamAdapter.unregisterStreamer(execution.id);

  return streamer;
}

/**
 * Create a streaming-enabled pipeline execution
 * 
 * Convenience function that creates an execution with streaming pre-configured.
 */
export function createStreamingExecution(
  config: PipelineStreamConfig & { parent?: Execution }
): Execution {
      const execution = new Execution(config.runId, config.parent);

  // Canonical run identity: substep diagnostics (e.g. the raw LLM I/O
  // sidecar directory) resolve the run id via findUp('execution',
  // 'correlationId') from arbitrarily deep child nodes.
  execution.store('execution', 'correlationId', config.runId);

  // Enable streaming
  enablePipelineStreaming(execution, config);
  
  // Emit initial status event
  ExecutionStreamAdapter.emitEvent(
    execution.id,
    'status' as any,
    {
      message: 'Pipeline execution started',
      runId: config.runId,
      userId: config.userId,
    }
  );
  
  return execution;
}

/**
 * Helper to emit phase transitions
 */
export async function emitPhaseTransition(
  execution: Execution,
  phase: string,
  transition: 'start' | 'complete',
  metadata?: any
): Promise<void> {
  await ExecutionStreamAdapter.emitEvent(
    execution.id,
    transition === 'start' ? 'phase-start' as any : 'phase-complete' as any,
    {
      phase,
      transition,
      ...metadata,
    }
  );
}

/**
 * Helper to emit agent activity
 */
export async function emitAgentActivity(
  execution: Execution,
  agent: string,
  activity: 'start' | 'complete' | 'error',
  metadata?: any
): Promise<void> {
  const eventType = activity === 'error' ? 'error' : `agent-${activity}`;
  
  await ExecutionStreamAdapter.emitEvent(
    execution.id,
    eventType as any,
    {
      agent,
      activity,
      ...metadata,
    }
  );
}

/**
 * Helper to emit tool usage
 */
export async function emitToolUsage(
  execution: Execution,
  tool: string,
  input: any,
  output?: any,
  error?: any
): Promise<void> {
  await ExecutionStreamAdapter.emitEvent(
    execution.id,
    'tool-use' as any,
    {
      tool,
      input,
      output,
      error,
      status: error ? 'failed' : 'success',
    }
  );
}
