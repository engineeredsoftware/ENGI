/**
 * Map pipeline execution row status strings to deposit synthesis UI status
 * and user-visible error detail (source-safe).
 */

import type { DepositSynthesisStatus } from "@/components/deposits/DepositPageClient/hooks/use-deposit-synthesis-activity";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

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
  const detail =
    (typeof run.errorMessage === "string" && run.errorMessage.trim()) ||
    (typeof run.summary === "string" && run.summary.trim()) ||
    null;

  if (status === "cancelled") {
    // Reconciliation treats cancel as a clean terminal status (no error banner).
    return { status: "cancelled", error: null };
  }
  if (status === "failed" || status === "interrupted") {
    return {
      status: "failed",
      error: detail
        ? detail.startsWith("Run ")
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
  const detail =
    (typeof run.errorMessage === "string" && run.errorMessage.trim()) ||
    (typeof run.summary === "string" && run.summary.trim()) ||
    null;

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
