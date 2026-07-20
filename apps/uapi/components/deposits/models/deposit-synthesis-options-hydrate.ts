/**
 * Fetch depositOptionSynthesis from execution history with retries.
 *
 * Host/dispatch can mark status=completed a few hundred ms before
 * output.depositOptionSynthesis is visible on the history GET (run 95bf1a4b
 * / e359 false "options not found" banner). Retry before fail-closed UI.
 */

import { isDepositSynthesisTerminalStatus } from "@/components/deposits/models/deposit-run-status";

export type DepositSynthesisHistoryRun = {
  status?: string;
  summary?: string;
  type?: string;
  error?: { message?: string } | string | null;
  context?: Record<string, unknown>;
  output?: {
    depositOptionSynthesis?: unknown;
    reviewProjections?: unknown;
    summary?: string;
    partial?: unknown;
    finishPresent?: unknown;
    hostBudgetExceeded?: unknown;
    hostErrorMessage?: unknown;
  };
};

export type DepositSynthesisOptionsHydrateResult =
  | {
      kind: "found";
      run: DepositSynthesisHistoryRun;
      synthesis: unknown;
      reviewProjections: unknown[];
    }
  | {
      kind: "missing";
      run: DepositSynthesisHistoryRun | null;
      attempts: number;
      httpOk: boolean;
    }
  | {
      kind: "http-error";
      status: number;
      attempts: number;
    };

export type FetchDepositSynthesisOptionsInput = {
  runId: string;
  /** Default 6 — covers late Finish write on sandbox (~1–3s). */
  maxAttempts?: number;
  /** Default 500ms between attempts. */
  delayMs?: number;
  fetchImpl?: typeof fetch;
  sleepImpl?: (ms: number) => Promise<void>;
  signal?: AbortSignal;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * True when a completed row is still allowed to grow output (retry, not fail).
 * Failed/cancelled rows without synthesis should fail immediately after first read.
 */
export function shouldRetryMissingDepositOptions(input: {
  status?: unknown;
  hasSynthesis: boolean;
}): boolean {
  if (input.hasSynthesis) return false;
  const s = String(input.status || "").toLowerCase();
  // completed / partial: output may still land; failed/interrupted: do not spin.
  return s === "completed" || s === "partial" || s === "running" || s === "";
}

export async function fetchDepositOptionSynthesisWithRetry(
  input: FetchDepositSynthesisOptionsInput,
): Promise<DepositSynthesisOptionsHydrateResult> {
  const maxAttempts = Math.max(1, input.maxAttempts ?? 6);
  const delayMs = Math.max(0, input.delayMs ?? 500);
  const fetchImpl = input.fetchImpl ?? fetch;
  const sleepImpl = input.sleepImpl ?? defaultSleep;

  let lastRun: DepositSynthesisHistoryRun | null = null;
  let lastHttpOk = false;
  let lastStatus = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (input.signal?.aborted) {
      return { kind: "missing", run: lastRun, attempts: attempt, httpOk: lastHttpOk };
    }

    const res = await fetchImpl(
      `/api/executions/history/${encodeURIComponent(input.runId)}`,
      { signal: input.signal },
    );
    lastStatus = res.status;
    lastHttpOk = res.ok;

    if (!res.ok) {
      // 404 can race dispatch: keep retrying until budget exhausted.
      if (res.status === 404 && attempt < maxAttempts) {
        await sleepImpl(delayMs);
        continue;
      }
      return { kind: "http-error", status: res.status, attempts: attempt };
    }

    const data = (await res.json().catch(() => null)) as {
      run?: DepositSynthesisHistoryRun;
    } | null;
    const run = data?.run ?? null;
    lastRun = run;
    const synthesis = run?.output?.depositOptionSynthesis;
    if (synthesis) {
      const reviewProjections = Array.isArray(run?.output?.reviewProjections)
        ? (run!.output!.reviewProjections as unknown[])
        : [];
      return {
        kind: "found",
        run: run!,
        synthesis,
        reviewProjections,
      };
    }

    const rowStatus = run?.status;
    const terminal = isDepositSynthesisTerminalStatus(rowStatus);
    const retry =
      attempt < maxAttempts &&
      shouldRetryMissingDepositOptions({
        status: rowStatus,
        hasSynthesis: false,
      });

    // Hard failures: stop early (no point waiting for options that will not land).
    if (
      terminal &&
      (String(rowStatus).toLowerCase() === "failed" ||
        String(rowStatus).toLowerCase() === "interrupted" ||
        String(rowStatus).toLowerCase() === "cancelled")
    ) {
      return { kind: "missing", run, attempts: attempt, httpOk: true };
    }

    if (retry) {
      await sleepImpl(delayMs);
      continue;
    }

    return { kind: "missing", run, attempts: attempt, httpOk: true };
  }

  return {
    kind: "missing",
    run: lastRun,
    attempts: maxAttempts,
    httpOk: lastHttpOk || lastStatus === 0,
  };
}

/** Recoverable false-fail banners from the one-shot race. */
export function isRecoverableMissingOptionsError(
  message: string | null | undefined,
): boolean {
  if (!message) return false;
  return (
    /Synthesized options were not found/i.test(message) ||
    /Synthesis result not found/i.test(message) ||
    /Unable to load synthesis history/i.test(message)
  );
}

function asReviewProjections(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Prefer in-memory execution.output already loaded by usePipelineExecution —
 * no network when Finish/dispatch already wrote the selection envelope.
 */
export function extractDepositOptionSynthesisFromExecution(execution: unknown): {
  synthesis: unknown;
  reviewProjections: unknown[];
} | null {
  if (!execution || typeof execution !== "object") return null;
  const output = (execution as { output?: Record<string, unknown> }).output;
  if (!output || typeof output !== "object") return null;
  const synthesis = output.depositOptionSynthesis;
  if (!synthesis) return null;
  return {
    synthesis,
    reviewProjections: asReviewProjections(output.reviewProjections),
  };
}

/**
 * Prefer product-terminal completion SSE payload (written after row finalize)
 * so options render from the same signal that closes the stream — no GET.
 */
export function extractDepositOptionSynthesisFromEvents(
  events: Array<{ event?: Record<string, unknown> | null } | null | undefined>,
): {
  synthesis: unknown;
  reviewProjections: unknown[];
} | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const ev = events[i]?.event;
    if (!ev || typeof ev !== "object") continue;
    if (ev.type !== "completion") continue;
    // Product dispatcher stamps depositOptionsReady after finalize.
    // Ignore bare completion-shaped noise if any remains.
    const synthesis =
      ev.depositOptionSynthesis ??
      (ev.data && typeof ev.data === "object"
        ? (ev.data as { depositOptionSynthesis?: unknown }).depositOptionSynthesis
        : undefined);
    if (!synthesis) continue;
    const reviewProjections = asReviewProjections(
      ev.reviewProjections ??
        (ev.data && typeof ev.data === "object"
          ? (ev.data as { reviewProjections?: unknown }).reviewProjections
          : undefined),
    );
    return { synthesis, reviewProjections };
  }
  return null;
}

/**
 * True when the stream may still be open — do not fail-closed hydrate yet.
 * Product terminal is dispatch completion (depositOptionsReady) or row status.
 */
export function isDepositProductTerminalForOptions(input: {
  rowStatus?: unknown;
  events?: Array<{ event?: Record<string, unknown> | null } | null | undefined>;
}): boolean {
  if (isDepositSynthesisTerminalStatus(input.rowStatus)) return true;
  const events = input.events || [];
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const ev = events[i]?.event;
    if (!ev || ev.type !== "completion") continue;
    if (ev.depositOptionsReady === true || ev.productTerminal === true) {
      return true;
    }
    if (ev.depositOptionSynthesis) return true;
  }
  return false;
}
