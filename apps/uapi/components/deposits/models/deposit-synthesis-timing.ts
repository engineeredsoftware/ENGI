/**
 * Pure wall-clock helpers for deposit synthesis run timing.
 * Prefer the executions-row timestamps; fall back to stream events / dispatch.
 */

export function resolveSynthesisRunStartMs(input: {
  executionStartedAt?: string | null;
  firstEventCreatedAt?: string | null;
  dispatchedAtMs?: number | null;
}): number | null {
  const fromRow = input.executionStartedAt
    ? new Date(input.executionStartedAt).getTime()
    : Number.NaN;
  if (Number.isFinite(fromRow)) return fromRow;
  const fromEvent = input.firstEventCreatedAt
    ? new Date(input.firstEventCreatedAt).getTime()
    : Number.NaN;
  if (Number.isFinite(fromEvent)) return fromEvent;
  return input.dispatchedAtMs ?? null;
}

export function resolveSynthesisRunEndMs(input: {
  running: boolean;
  executionCompletedAt?: string | null;
  executionDurationMs?: number | null;
  executionStartedAt?: string | null;
  lastEventCreatedAt?: string | null;
}): number | null {
  if (input.running) return null;
  const completedAt = input.executionCompletedAt
    ? new Date(input.executionCompletedAt).getTime()
    : Number.NaN;
  if (Number.isFinite(completedAt)) return completedAt;
  const durationMs =
    typeof input.executionDurationMs === "number" &&
    Number.isFinite(input.executionDurationMs)
      ? input.executionDurationMs
      : null;
  const startedAt = input.executionStartedAt
    ? new Date(input.executionStartedAt).getTime()
    : Number.NaN;
  if (durationMs !== null && Number.isFinite(startedAt)) {
    return startedAt + durationMs;
  }
  const fromEvent = input.lastEventCreatedAt
    ? new Date(input.lastEventCreatedAt).getTime()
    : Number.NaN;
  return Number.isFinite(fromEvent) ? fromEvent : null;
}
