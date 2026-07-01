// Diagnostics instrumentation utilities (formerly named hooks)
import type { Execution } from '@bitcode/execution-generics/Execution';
import { log, writePromptIO, writeStepTraceJSON, writeRawLLMIO } from '@bitcode/logger';
import { DIAG_ENABLED, DIAG_TRACES, DIAG_FULL_TRACES, DIAG_FULL_PROMPTS, DIAG_TRACE_MAX, DIAG_WRITE_PROMPT_IO, DIAG_WRITE_STEP_TRACES } from './config';
import { collectExecutionTrace, summarizeExecutionTrace } from './trace';

function getCtx(execution: Execution, sequence?: string) {
  const phase = (execution as any).findUp?.('phase', 'current');
  const step = (execution as any).findUp?.('step', 'name');
  const agentName = (execution as any).findUp?.('agent', 'name');
  const execId = (execution as any).id;
  const path = (execution as any).getPath?.() || [];
  const correlationId = (execution as any).findUp?.('pipeline', 'correlationId');
  // Surface any provider/model already stored on ancestors (best-effort)
  let providerUp: string | undefined;
  let modelUp: string | undefined;
  let failsafeUp: string | undefined;
  try { providerUp = (execution as any).findUp?.('llm', 'provider'); } catch {}
  try { modelUp = (execution as any).findUp?.('llm', 'model'); } catch {}
  try { failsafeUp = (execution as any).findUp?.('ptrr', 'failsafe'); } catch {}
  return { phase, step, agentName, execId, path, correlationId, sequence, provider: providerUp, model: modelUp, failsafe: failsafeUp };
}

let __diagBannerPrinted = false;
function maybeLogDiagnosticsBanner() {
  const wantBanner = (
    process?.env?.BITCODE_LOG_DIAG_CONFIG === '1'
    || process?.env?.LOG_LEVEL === 'debug'
    || String(process?.env?.BITCODE_WRITE_PROMPT_IO || '') === '1'
    || String(process?.env?.BITCODE_WRITE_STEP_TRACES || '') === '1'
    || String(process?.env?.BITCODE_LOG_TRACES || '') === '1'
  );
  if (!wantBanner || __diagBannerPrinted) return;
  __diagBannerPrinted = true;
  try {
    log('[diagnostics] configuration', 'info', {
      DIAG_ENABLED,
      DIAG_TRACES,
      DIAG_FULL_TRACES,
      DIAG_FULL_PROMPTS,
      DIAG_WRITE_PROMPT_IO,
      DIAG_WRITE_STEP_TRACES,
      DIAG_TRACE_MAX,
      LOG_LEVEL: process?.env?.LOG_LEVEL,
      BITCODE_EXECUTION_DEBUG: process?.env?.BITCODE_EXECUTION_DEBUG,
    });
  } catch {}
}

// A human-readable name for the raw LLM I/O sidecar file — phase, agent,
// step, failsafe, generation (thricified) — mirroring the same hierarchy
// the processing-indicator sentence reads out loud. writeRawLLMIO prefixes
// every file with a monotonic counter, so this name only needs to be
// legible, not unique.
function rawLLMPathKey(ctx: ReturnType<typeof getCtx>): string {
  return [ctx.phase, ctx.agentName, ctx.step, ctx.failsafe, ctx.sequence].filter(Boolean).join('-');
}

export async function logLLMSubstepStart(
  execution: Execution,
  sequence: string,
  systemPrompt: string,
  userPrompt: string,
  combinedPrompt: string,
  llmConfig?: { model?: string; provider?: string }
) {
  maybeLogDiagnosticsBanner();
  const ctx = getCtx(execution, sequence);

  // Always attempt the raw wire-exchange sidecar (its own env gate, default
  // on) — independent of the DIAG_* verbosity flags below, since this is a
  // local-debugging artifact meant to survive even when nothing else logs.
  writeRawLLMIO({
    executionId: String(ctx.correlationId || ''),
    pathKey: rawLLMPathKey(ctx),
    kind: 'request',
    provider: (llmConfig as any)?.provider,
    model: llmConfig?.model,
    content: { systemPrompt, userPrompt, combinedPrompt, ...ctx },
  }).catch(() => {});

  if (!(DIAG_ENABLED || DIAG_FULL_PROMPTS || DIAG_TRACES)) return;
  log('[llm substep] start', 'debug', {
    ...ctx,
    systemLen: systemPrompt.length,
    userLen: userPrompt.length,
    userPreview: userPrompt.slice(0, 200),
    promptLen: combinedPrompt.length,
    modelPlanned: llmConfig?.model,
    providerPlanned: (llmConfig as any)?.provider,
  });
  if (DIAG_FULL_PROMPTS) {
    log('[llm substep] prompt-full', 'debug', {
      ...ctx,
      systemPrompt,
      userPrompt,
      prompt: combinedPrompt,
    });
  }
}

export async function logLLMSubstepSuccess(
  execution: Execution,
  sequence: string,
  output: { content?: string; usage?: any; metadata?: any },
  combinedPrompt: string
) {
  maybeLogDiagnosticsBanner();
  const ctx = getCtx(execution, sequence);

  writeRawLLMIO({
    executionId: String(ctx.correlationId || ''),
    pathKey: rawLLMPathKey(ctx),
    kind: 'response',
    provider: output?.metadata?.provider,
    model: output?.metadata?.model,
    content: { content: output?.content, usage: output?.usage, metadata: output?.metadata },
  }).catch(() => {});

  if (DIAG_ENABLED || DIAG_FULL_PROMPTS || DIAG_TRACES) {
    log('[llm substep] success', 'debug', {
      ...ctx,
      durationMs: undefined,
      outputLen: String(output?.content || '').length,
      usage: output?.usage,
      stopReason: output?.metadata?.stopReason,
      model: output?.metadata?.model,
      provider: output?.metadata?.provider,
    });
    if (DIAG_FULL_PROMPTS) {
      log('[llm substep] completion-full', 'debug', {
        ...ctx,
        content: output?.content,
      });
    }
  }
  // Sidecar writing depends only on its own flag
  if (DIAG_WRITE_PROMPT_IO) {
    try {
      const inputPath = await writePromptIO({
        runId: String(ctx.correlationId || ''),
        phase: String(ctx.phase || ''),
        agent: String(ctx.agentName || ''),
        step: String(ctx.step || ''),
        sequence: String(sequence || ''),
        kind: 'input',
        content: combinedPrompt,
        provider: output?.metadata?.provider,
        model: output?.metadata?.model,
      });
      const outputPath = await writePromptIO({
        runId: String(ctx.correlationId || ''),
        phase: String(ctx.phase || ''),
        agent: String(ctx.agentName || ''),
        step: String(ctx.step || ''),
        sequence: String(sequence || ''),
        kind: 'output',
        content: String(output?.content ?? ''),
        provider: output?.metadata?.provider,
        model: output?.metadata?.model,
      });
      if (DIAG_ENABLED && (inputPath || outputPath)) {
        log('[llm substep] prompt-io', 'debug', { ...ctx, inputPath, outputPath });
      }
    } catch {}
  }
}

export function logLLMSubstepError(
  execution: Execution,
  sequence: string,
  err: unknown,
  durationMs?: number
) {
  const ctx = getCtx(execution, sequence);

  // The raw sidecar is the whole point on the failure path — a 413/400/etc.
  // from the provider is exactly the case where you need to see the literal
  // request that triggered it, and DIAG_ENABLED (verbose console logging)
  // being off shouldn't suppress that.
  writeRawLLMIO({
    executionId: String(ctx.correlationId || ''),
    pathKey: rawLLMPathKey(ctx),
    kind: 'error',
    provider: ctx.provider,
    model: ctx.model,
    content: err,
  }).catch(() => {});

  if (!DIAG_ENABLED) return;
  const message = err instanceof Error ? err.message : String(err);
  log('[llm substep] error', 'error', {
    ...ctx,
    error: message,
    durationMs
  });
}

export function logFailsafeEvent(
  execution: Execution,
  failsafe: 'prepare-context' | 'chunk-then-sum' | 'stitch-until-complete',
  data: Record<string, any>
) {
  maybeLogDiagnosticsBanner();
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(execution);
  log(`[failsafe] ${failsafe}`, 'debug', { ...ctx, ...data });
}

export function logStepTrace(stepExec: Execution, stepName: string) {
  maybeLogDiagnosticsBanner();
  if (!(DIAG_ENABLED || DIAG_WRITE_STEP_TRACES)) return;
  const trace = collectExecutionTrace(stepExec);
  const summary = summarizeExecutionTrace(trace);
  const ctx = getCtx(stepExec);
  // pluck provider/model if available
  let provider: string | undefined;
  let model: string | undefined;
  // quick scan through root namespaces
  const scan = (n: any) => {
    const ns = n?.namespaces?.llm as any;
    if (ns) { provider = provider || ns.provider; model = model || ns.model; }
    for (const c of n.children || []) if (!provider || !model) scan(c);
  };
  scan(trace);
  if (DIAG_ENABLED) {
    log('[trace] step summary', 'debug', { ...ctx, step: stepName, provider, model, summary });
  }
  if (DIAG_TRACES && DIAG_FULL_TRACES) {
    let traceForLog: any = trace;
    if (DIAG_TRACE_MAX) {
      const prune = (n: any) => {
        if (n?.prompt?.formatted && typeof n.prompt.formatted === 'string' && n.prompt.formatted.length > DIAG_TRACE_MAX!) {
          n.prompt.formatted = n.prompt.formatted.slice(0, DIAG_TRACE_MAX) + '… [truncated]';
        }
        for (const child of n.children || []) prune(child);
      };
      traceForLog = JSON.parse(JSON.stringify(trace));
      prune(traceForLog);
    }
    log('[trace] step full', 'debug', { ...ctx, step: stepName, trace: traceForLog });
  }

  // Optional: write JSON sidecar for programmatic analysis
  if (DIAG_WRITE_STEP_TRACES) {
    try {
      const includePrompts = DIAG_FULL_PROMPTS;
      const pruneMax = DIAG_TRACE_MAX;
      const copy = JSON.parse(JSON.stringify(trace));
      const transform = (n: any) => {
        if (!includePrompts && n.prompt) {
          // Keep only prompt length metadata to avoid leaking content
          const len = n.prompt?.formatted ? String(n.prompt.formatted).length : 0;
          n.prompt = len ? { formatted_len: len } : undefined;
        }
        if (includePrompts && pruneMax && n?.prompt?.formatted && typeof n.prompt.formatted === 'string' && n.prompt.formatted.length > pruneMax) {
          n.prompt.formatted = n.prompt.formatted.slice(0, pruneMax) + '… [truncated]';
        }
        for (const c of n.children || []) transform(c);
      };
      transform(copy);
      const runId = String(ctx.correlationId || '');
      writeStepTraceJSON({
        runId,
        phase: String(ctx.phase || ''),
        agent: String(ctx.agentName || ''),
        step: String(stepName || ''),
        provider,
        model,
        summary,
        trace: copy
      }).then((p) => { if ((DIAG_ENABLED || DIAG_TRACES) && p) log('[trace] sidecar', 'debug', { ...ctx, step: stepName, path: p }); }).catch(() => {});
    } catch {}
  }
}

// Optional debug-stop helpers to keep core code minimal
export function shouldDebugStopAfterFirstReason(substepExec: Execution, sequence: string): boolean {
  try {
    if (sequence !== 'reason') return false;
    const flag = String(process?.env?.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON || '').toLowerCase() === '1';
    if (!flag) return false;
    const pathArr = (substepExec as any).getPath?.() || [];
    const isPlanStep = pathArr.includes('plan');
    const inPrepareFailsafe = pathArr.some((p: string) => String(p).includes('prepare_concise_context'));
    const isFirstGen = pathArr.includes('gen-0');
    const ctx = getCtx(substepExec);
    const agentFilter = process?.env?.BITCODE_DEBUG_STOP_AGENT_FILTER;
    const agentMatches = agentFilter ? String(ctx.agentName || '').includes(String(agentFilter)) : true;
    if (isPlanStep && inPrepareFailsafe && isFirstGen && agentMatches) {
      log('[llm substep] debug-stop', 'info', { ...ctx, reason: 'BITCODE_DEBUG_STOP_AFTER_FIRST_REASON' });
      return true;
    }
  } catch {}
  return false;
}

export function shouldDebugStopAfterFirstStructuredOutput(substepExec: Execution, sequence: string): boolean {
  try {
    if (sequence !== 'structured_output') return false;
    const flag = String(process?.env?.BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT || '').toLowerCase() === '1';
    if (!flag) return false;
    const pathArr = (substepExec as any).getPath?.() || [];
    const isPlanStep = pathArr.includes('plan');
    const inPrepareFailsafe = pathArr.some((p: string) => String(p).includes('prepare_concise_context'));
    const isFirstStructured = pathArr.includes('gen-2');
    const ctx = getCtx(substepExec);
    const agentFilter = process?.env?.BITCODE_DEBUG_STOP_AGENT_FILTER;
    const agentMatches = agentFilter ? String(ctx.agentName || '').includes(String(agentFilter)) : true;
    if (isPlanStep && inPrepareFailsafe && isFirstStructured && agentMatches) {
      log('[llm substep] debug-stop', 'info', { ...ctx, reason: 'BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT' });
      return true;
    }
  } catch {}
  return false;
}

// ------------------------------------------------------------
// Tool execution event hooks
// ------------------------------------------------------------
export function logToolStart(execution: Execution, tool: string, inputPreview?: any) {
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(execution);
  log('[tool] start', 'debug', { ...ctx, tool, inputPreview });
}

export function logToolSuccess(execution: Execution, tool: string, outputPreview?: any) {
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(execution);
  log('[tool] success', 'debug', { ...ctx, tool, outputPreview });
}

export function logToolError(execution: Execution, tool: string, err: unknown) {
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(execution);
  const message = err instanceof Error ? err.message : String(err);
  log('[tool] error', 'error', { ...ctx, tool, error: message });
}

// ------------------------------------------------------------
// Step lifecycle hooks (start/error)
// ------------------------------------------------------------
export function logStepStart(stepExec: Execution, stepName: string) {
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(stepExec);
  log('[agent step] start', 'debug', { ...ctx, step: stepName });
}

export function logStepError(stepExec: Execution, stepName: string, err: unknown, durationMs?: number) {
  if (!(DIAG_ENABLED || DIAG_TRACES)) return;
  const ctx = getCtx(stepExec);
  const message = err instanceof Error ? err.message : String(err);
  log('[agent step] error', 'error', { ...ctx, step: stepName, error: message, durationMs });
}
