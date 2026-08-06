/**
 * Map pipeline execution row status strings to deposit synthesis UI status
 * and user-visible error detail (source-safe).
 */

import type { DepositSynthesisStatus } from "@/components/deposits/DepositPageClient/hooks/use-deposit-synthesis-activity";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

function readDetail(
  run: Pick<WorkspaceRun, "errorMessage" | "summary">,
): string | null {
  return (
    (typeof run.errorMessage === "string" && run.errorMessage.trim()) ||
    (typeof run.summary === "string" && run.summary.trim()) ||
    null
  );
}

/** Terminal row statuses that end the live synthesis wait. */
export function isDepositSynthesisTerminalStatus(status: unknown): boolean {
  const s = String(status || "").toLowerCase();
  return (
    s === "completed" ||
    s === "partial" ||
    s === "failed" ||
    s === "interrupted" ||
    s === "cancelled"
  );
}

/**
 * Message when a terminal run has no depositOptionSynthesis payload.
 * Prefer host/partial summaries over a generic "options not found".
 */
export function messageForMissingDepositOptions(input: {
  status?: unknown;
  summary?: unknown;
  errorMessage?: unknown;
  hostBudgetExceeded?: unknown;
  hostErrorMessage?: unknown;
  finishPresent?: unknown;
}): string {
  const summary =
    (typeof input.summary === "string" && input.summary.trim()) ||
    (typeof input.errorMessage === "string" && input.errorMessage.trim()) ||
    null;
  const hostMsg =
    typeof input.hostErrorMessage === "string" && input.hostErrorMessage.trim()
      ? input.hostErrorMessage.trim()
      : null;
  const status = String(input.status || "").toLowerCase();
  const budget =
    input.hostBudgetExceeded === true ||
    (hostMsg && /host runtime budget|PipelineHostTimeoutError/i.test(hostMsg));

  if (budget || status === "partial") {
    const parts = [
      summary ||
        "Partial synthesis — the host stopped before Finish packaged presentable AssetPack options.",
      hostMsg && !summary?.includes(hostMsg.slice(0, 40)) ? hostMsg : null,
      "Large repositories often exhaust Discovery/Implementation within the host budget; re-run or raise BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS / maxDuration.",
    ].filter(Boolean);
    return parts.join(" ");
  }

  if (input.finishPresent === false) {
    return (
      summary ||
      "Synthesis finished without a Finish selection envelope — no presentable AssetPack options."
    );
  }

  return (
    summary ||
    "Synthesized options were not found for this run."
  );
}

export function synthesisStatusFromRunRow(
  run: Pick<WorkspaceRun, "status" | "errorMessage" | "summary">,
): {
  status: Extract<
    DepositSynthesisStatus,
    "running" | "complete" | "failed" | "cancelled"
  >;
  error: string | null;
} {
  const status = String(run.status || "").toLowerCase();
  const detail = readDetail(run);

  if (status === "cancelled") {
    // Reconciliation treats cancel as a clean terminal status (no error banner).
    return { status: "cancelled", error: null };
  }
  // Host budget / Finish-missing partials: terminal with operator-visible reason.
  if (status === "partial") {
    return {
      status: "failed",
      error: messageForMissingDepositOptions({
        status: "partial",
        summary: detail,
        hostBudgetExceeded: true,
      }),
    };
  }
  if (status === "failed" || status === "interrupted") {
    // Prefer the persisted fail-closed / host summary (e.g. zero admissible
    // options) over a generic miss — run 36858f68 finished 3 packs in-box then
    // dispatch validation dropped them; UI must show that reason.
    return {
      status: "failed",
      error: detail
        ? detail.startsWith("Run ")
          ? detail
          : detail.includes("zero admissible") ||
              detail.includes("fail-closed") ||
              detail.includes("Partial synthesis")
            ? detail
            : `Run ${status} — ${detail}`
        : status === "interrupted"
          ? "Run interrupted — host stopped mid-pipeline (restart, maxDuration, or crash). Check server logs."
          : "Run failed — no error message was persisted. The host may have been killed mid-pipeline.",
    };
  }
  if (status === "completed") {
    return { status: "complete", error: null };
  }
  return { status: "running", error: null };
}

/** Status text for adopting a historical row into the detail pane. */
export function adoptSelectionStatusFromRun(
  run: Pick<WorkspaceRun, "status" | "errorMessage" | "summary">,
): {
  status: DepositSynthesisStatus;
  error: string | null;
} {
  const status = String(run.status || "").toLowerCase();
  const detail = readDetail(run);

  if (status === "partial") {
    return {
      status: "failed",
      error: messageForMissingDepositOptions({
        status: "partial",
        summary: detail,
        hostBudgetExceeded: true,
      }),
    };
  }
  if (
    status === "failed" ||
    status === "interrupted" ||
    status === "cancelled"
  ) {
    return {
      status: "failed",
      error: detail
        ? detail.startsWith("Run ")
          ? detail
          : `Run ${status} — ${detail}`
        : status === "interrupted"
          ? "Run interrupted — host stopped mid-pipeline (restart, maxDuration, or crash)."
          : status === "cancelled"
            ? "Run cancelled."
            : "Run failed — no error message was persisted.",
    };
  }
  if (status === "completed") {
    return { status: "complete", error: null };
  }
  return { status: "running", error: null };
}
