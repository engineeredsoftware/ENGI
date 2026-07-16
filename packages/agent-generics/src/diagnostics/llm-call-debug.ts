/**
 * LLM call-by-call debug ledger for production-like pipeline passes.
 *
 * When BITCODE_LLM_CALL_DEBUG=1 (or any BITCODE_DEBUG_STOP_AFTER_* is set),
 * each LLM request/response is appended under:
 *   $BITCODE_MONOREPO_ROOT/.tmp/llm-call-debug/<runId>/
 *
 * Abort marker (movable as we stabilize each call stack):
 *   BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=1
 *   BITCODE_DEBUG_STOP_AGENT_FILTER=<substring of agent name>
 * Optional:
 *   BITCODE_DEBUG_STOP_PHASE=setup
 *   BITCODE_DEBUG_STOP_STEP=plan
 *   BITCODE_DEBUG_STOP_FAILSAFE=prepare_concise_context
 *   BITCODE_DEBUG_STOP_GENERATION=reason
 *
 * Defaults match: Setup → first agent → Plan → prepare_concise_context → reason.
 */

import { mkdirSync, appendFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function monorepoRoot(): string {
  const env = process.env.BITCODE_MONOREPO_ROOT?.trim();
  if (env) return resolve(env);
  // Walk up from cwd looking for pnpm-workspace.yaml
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function llmCallDebugEnabled(): boolean {
  const explicit = String(process.env.BITCODE_LLM_CALL_DEBUG || '').toLowerCase();
  if (explicit === '1' || explicit === 'true') return true;
  if (explicit === '0' || explicit === 'false') return false;
  // Auto-enable when any hard-stop debug flag is on.
  return (
    String(process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON || '').toLowerCase() === '1' ||
    String(process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT || '').toLowerCase() ===
      '1'
  );
}

function safe(s: unknown, max = 120): string {
  return (
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .slice(0, max) || 'na'
  );
}

let __seq = 0;
let __runDir: string | null = null;

export function getLlmCallDebugRunDir(runId?: string): string {
  if (__runDir) return __runDir;
  const root = monorepoRoot();
  const id = safe(runId || process.env.BITCODE_PIPELINE_RUN_ID || `run-${Date.now()}`, 80);
  __runDir = join(root, '.tmp', 'llm-call-debug', id);
  try {
    mkdirSync(__runDir, { recursive: true });
  } catch {
    /* ignore */
  }
  // Write abort marker description once (operators move env flags, not this file).
  try {
    writeFileSync(
      join(__runDir, 'ABORT_MARKER.md'),
      [
        '# LLM call-by-call abort marker',
        '',
        'Current stop target (env — move after this stack is stable):',
        '',
        `- BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=${process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON || ''}`,
        `- BITCODE_DEBUG_STOP_AGENT_FILTER=${process.env.BITCODE_DEBUG_STOP_AGENT_FILTER || '(any)'}`,
        `- BITCODE_DEBUG_STOP_PHASE=${process.env.BITCODE_DEBUG_STOP_PHASE || 'setup (default if unset means any)'}`,
        `- BITCODE_DEBUG_STOP_STEP=${process.env.BITCODE_DEBUG_STOP_STEP || 'plan'}`,
        `- BITCODE_DEBUG_STOP_FAILSAFE=${process.env.BITCODE_DEBUG_STOP_FAILSAFE || 'prepare_concise_context'}`,
        `- BITCODE_DEBUG_STOP_GENERATION=${process.env.BITCODE_DEBUG_STOP_GENERATION || 'reason'}`,
        '',
        'First pass target: Setup → clone-vcs PTRR agent → Plan → prepare_concise_context → reason.',
        'PTRR order: Plan → Try → Retry → Refine. Force clone PTRR via BITCODE_DEBUG_FORCE_CLONE_PTRR=1.',
        'Next: move filter/generation after reviewing call-NNNN-*.json + ledger.jsonl + VERBATIM_WIRE_REPORT.md.',
        '',
      ].join('\n'),
      'utf8',
    );
  } catch {
    /* ignore */
  }
  return __runDir;
}

export interface LlmCallDebugRecord {
  kind: 'request' | 'response' | 'error' | 'abort';
  sequence: string;
  phase?: string;
  agentName?: string;
  step?: string;
  failsafe?: string;
  path?: string[];
  correlationId?: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  combinedPrompt?: string;
  content?: string;
  usage?: unknown;
  error?: unknown;
  extra?: Record<string, unknown>;
}

export function writeLlmCallDebug(record: LlmCallDebugRecord): string | undefined {
  if (!llmCallDebugEnabled()) return undefined;
  try {
    const seq = String(++__seq).padStart(4, '0');
    const dir = getLlmCallDebugRunDir(record.correlationId);
    const name = [
      seq,
      safe(record.kind),
      safe(record.phase),
      safe(record.agentName),
      safe(record.step),
      safe(record.failsafe),
      safe(record.sequence),
    ].join('-');
    const file = join(dir, `${name}.json`);
    const payload = {
      timestamp: new Date().toISOString(),
      seq: __seq,
      ...record,
    };
    writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
    appendFileSync(
      join(dir, 'ledger.jsonl'),
      JSON.stringify({
        timestamp: payload.timestamp,
        seq: __seq,
        kind: record.kind,
        phase: record.phase,
        agent: record.agentName,
        step: record.step,
        failsafe: record.failsafe,
        generation: record.sequence,
        model: record.model,
        provider: record.provider,
        path: record.path,
        file,
      }) + '\n',
      'utf8',
    );
    return file;
  } catch {
    return undefined;
  }
}

/**
 * Movable hard-stop predicate after a successful generation.
 * Default: first Plan step, prepare_concise_context failsafe, reason generation.
 */
export function shouldHardStopAfterLlmCall(
  ctx: {
    sequence: string;
    pathArr: string[];
    phase?: string;
    agentName?: string;
    step?: string;
    failsafe?: string;
  },
): { stop: boolean; reason?: string } {
  const stopFlag =
    String(process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON || '').toLowerCase() === '1';
  if (!stopFlag) return { stop: false };

  const wantGen = String(process.env.BITCODE_DEBUG_STOP_GENERATION || 'reason')
    .toLowerCase()
    .trim();
  if (String(ctx.sequence).toLowerCase() !== wantGen) return { stop: false };

  const wantStep = String(process.env.BITCODE_DEBUG_STOP_STEP || 'plan')
    .toLowerCase()
    .trim();
  const path = ctx.pathArr.map((p) => String(p).toLowerCase());
  const stepOk =
    path.includes(wantStep) ||
    String(ctx.step || '')
      .toLowerCase()
      .includes(wantStep);
  if (!stepOk) return { stop: false };

  const wantFailsafe = String(
    process.env.BITCODE_DEBUG_STOP_FAILSAFE || 'prepare_concise_context',
  )
    .toLowerCase()
    .trim();
  const failsafeOk =
    path.some((p) => p.includes(wantFailsafe)) ||
    String(ctx.failsafe || '')
      .toLowerCase()
      .includes(wantFailsafe);
  if (!failsafeOk) return { stop: false };

  // prepare_concise_context selection runs under selection/seq-N (not gen-0).
  // chunk_then_sum task thinkings use gen-0. Default: only require gen-0 when
  // the failsafe filter is not prepare.
  const isPrepareTarget = wantFailsafe.includes('prepare');
  const requireGen0Env = process.env.BITCODE_DEBUG_STOP_REQUIRE_GEN0;
  const requireGen0 =
    requireGen0Env != null && requireGen0Env !== ''
      ? String(requireGen0Env) !== '0'
      : !isPrepareTarget;
  if (requireGen0 && !path.includes('gen-0')) return { stop: false };

  const phaseFilter = process.env.BITCODE_DEBUG_STOP_PHASE?.trim();
  if (phaseFilter) {
    const phase = String(ctx.phase || '').toLowerCase();
    if (!phase.includes(phaseFilter.toLowerCase())) return { stop: false };
  }

  const agentFilter = process.env.BITCODE_DEBUG_STOP_AGENT_FILTER?.trim();
  if (agentFilter) {
    if (!String(ctx.agentName || '').includes(agentFilter)) return { stop: false };
  }

  return {
    stop: true,
    reason: `hard-stop after ${wantStep}/${wantFailsafe}/${wantGen} agent=${ctx.agentName || '?'}`,
  };
}
