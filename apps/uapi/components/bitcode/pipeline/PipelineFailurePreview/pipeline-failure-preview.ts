/**
 * Build a compact failure/cancel hover preview from execution events:
 * the last handful of phase → agent → step → failsafe → generation chains
 * plus a source-safe error message.
 */

export interface TerminalCallChainLine {
  phase?: string | null;
  agent?: string | null;
  step?: string | null;
  failsafe?: string | null;
  generation?: string | null;
  at?: string | null;
}

export interface PipelineFailurePreview {
  errorMessage: string | null;
  lines: TerminalCallChainLine[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readExecutionState(payload: Record<string, unknown> | null): Record<string, unknown> {
  if (!payload) return {};
  const direct = asRecord(payload.executionState);
  if (direct) return direct;
  const status = asRecord(payload.status);
  const nested = status ? asRecord(status.executionState) : null;
  return nested || {};
}

function chainKey(line: TerminalCallChainLine): string {
  return [line.phase, line.agent, line.step, line.failsafe, line.generation]
    .map((part) => String(part || '').toLowerCase())
    .join('|');
}

/**
 * Walk events newest-last (chronological array) and keep the last `limit`
 * distinct call chains that carry at least phase or agent or generation.
 */
export function buildPipelineFailurePreviewFromEvents(
  events: Array<{ event?: unknown; event_data?: unknown; created_at?: string | null }>,
  options: { errorMessage?: string | null; limit?: number } = {},
): PipelineFailurePreview {
  const limit = Math.max(1, Math.min(options.limit ?? 5, 12));
  const collected: TerminalCallChainLine[] = [];
  const list = Array.isArray(events) ? events : [];

  for (let i = list.length - 1; i >= 0 && collected.length < limit; i -= 1) {
    const entry = list[i];
    const payload =
      asRecord(entry?.event) || asRecord(entry?.event_data) || null;
    if (!payload) continue;
    // Skip pure error rows as call-chain (error is surfaced separately).
    if (asString(payload.type) === 'error') continue;
    const state = readExecutionState(payload);
    const line: TerminalCallChainLine = {
      phase:
        asString(state.phase) ||
        asString(payload.phase) ||
        asString(state.currentPhase),
      agent:
        asString(state.agent) ||
        asString(payload.agent) ||
        asString(state.currentAgent),
      step: asString(state.step) || asString(payload.step) || asString(state.currentStep),
      failsafe: asString(state.failsafe) || asString(payload.failsafe),
      generation: asString(state.generation) || asString(payload.generation),
      at: asString(entry?.created_at) || asString(payload.timestamp),
    };
    if (!line.phase && !line.agent && !line.generation && !line.failsafe) continue;
    const key = chainKey(line);
    if (collected.length > 0 && chainKey(collected[0]) === key) continue;
    collected.unshift(line);
  }

  return {
    errorMessage: asString(options.errorMessage) || null,
    lines: collected,
  };
}

export function isTerminalFailureStatus(status: string | null | undefined): boolean {
  const normalized = String(status || '').trim().toLowerCase();
  return (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'interrupted' ||
    normalized === 'error'
  );
}
