/**
 * Live synthesis activity projection, cancel handler, and run clocks for deposits.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { usePipelineExecution } from "@/hooks/usePipelineExecution";
import { buildPipelineRunActivityFromEvents } from "@/components/bitcode/pipeline/models/pipeline-run-activity";
import { trackProductEvent } from "@/lib/product-analytics";
import {
  resolveSynthesisRunEndMs,
  resolveSynthesisRunStartMs,
} from "@/components/deposits/models/deposit-synthesis-timing";

export type DepositSynthesisStatus =
  | "idle"
  | "running"
  | "complete"
  | "failed"
  | "cancelled";

export function useDepositSynthesisActivity(input: {
  synthesisRunId: string | null;
  synthesisStatus: DepositSynthesisStatus;
  setSynthesisStatus: (status: DepositSynthesisStatus) => void;
  setSynthesisError: (error: string | null) => void;
  synthesisDispatchedAtMs: number | null;
  synthesisError: string | null;
  refreshLiveRuns: (options?: { soft?: boolean }) => void | Promise<unknown>;
}) {
  const {
    synthesisRunId,
    synthesisStatus,
    setSynthesisStatus,
    setSynthesisError,
    synthesisDispatchedAtMs,
    synthesisError,
    refreshLiveRuns,
  } = input;

  const [isCancellingSynthesis, setIsCancellingSynthesis] = useState(false);

  const {
    execution: synthesisExecution,
    events: synthesisEvents,
    latestWorkUpdate: synthesisWorkUpdate,
    iterationUpdates: synthesisIterationUpdates,
    error: synthesisStreamError,
  } = usePipelineExecution(synthesisRunId);

  const synthesisExecutionMatchesRun = Boolean(
    synthesisRunId &&
      (synthesisExecution as { id?: string } | null)?.id === synthesisRunId,
  );

  const synthesisActivity = useMemo(
    () =>
      buildPipelineRunActivityFromEvents(
        synthesisEvents,
        synthesisWorkUpdate,
        synthesisIterationUpdates,
        synthesisStreamError,
      ),
    [
      synthesisEvents,
      synthesisIterationUpdates,
      synthesisStreamError,
      synthesisWorkUpdate,
    ],
  );

  const synthesisRunning = synthesisStatus === "running";

  const handleCancelSynthesis = useCallback(async () => {
    if (!synthesisRunId || !synthesisRunning || isCancellingSynthesis) return;
    setIsCancellingSynthesis(true);
    try {
      const response = await fetch(
        `/api/executions/${encodeURIComponent(synthesisRunId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Run cancelled by depositor." }),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to cancel the synthesis run.",
        );
      }
      setSynthesisStatus("cancelled");
      setSynthesisError(null);
      const durationMs =
        synthesisDispatchedAtMs !== null
          ? Date.now() - synthesisDispatchedAtMs
          : null;
      trackProductEvent({
        name: "deposit_synthesis_cancelled",
        data: { durationMs },
      });
      void refreshLiveRuns({ soft: true });
    } catch (error) {
      setSynthesisError(
        error instanceof Error
          ? error.message
          : "Unable to cancel the synthesis run.",
      );
    } finally {
      setIsCancellingSynthesis(false);
    }
  }, [
    isCancellingSynthesis,
    refreshLiveRuns,
    setSynthesisError,
    setSynthesisStatus,
    synthesisDispatchedAtMs,
    synthesisRunId,
    synthesisRunning,
  ]);

  const synthesisRunStartMs = useMemo(
    () =>
      resolveSynthesisRunStartMs({
        executionStartedAt: (synthesisExecution as { started_at?: string | null } | null)
          ?.started_at,
        firstEventCreatedAt: synthesisEvents[0]?.created_at,
        dispatchedAtMs: synthesisDispatchedAtMs,
      }),
    [synthesisEvents, synthesisDispatchedAtMs, synthesisExecution],
  );

  const synthesisRunEndMs = useMemo(() => {
    const row = synthesisExecution as {
      completed_at?: string | null;
      duration_ms?: number | null;
      started_at?: string | null;
    } | null;
    return resolveSynthesisRunEndMs({
      running: synthesisRunning,
      executionCompletedAt: row?.completed_at,
      executionDurationMs: row?.duration_ms,
      executionStartedAt: row?.started_at,
      lastEventCreatedAt: synthesisEvents[synthesisEvents.length - 1]?.created_at,
    });
  }, [synthesisEvents, synthesisRunning, synthesisExecution]);

  const synthesisLiveContext =
    synthesisRunning && !synthesisError ? synthesisActivity.latestContext : null;

  return {
    synthesisExecution,
    synthesisEvents,
    synthesisWorkUpdate,
    synthesisIterationUpdates,
    synthesisStreamError,
    synthesisExecutionMatchesRun,
    synthesisActivity,
    synthesisRunning,
    isCancellingSynthesis,
    handleCancelSynthesis,
    synthesisRunStartMs,
    synthesisRunEndMs,
    synthesisLiveContext,
  };
}
