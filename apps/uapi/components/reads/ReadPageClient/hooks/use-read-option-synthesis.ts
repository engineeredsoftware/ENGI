/**
 * Read option synthesis lifecycle (deposit twin).
 * Dispatches POST /api/read/synthesize-options, polls history for selection envelope.
 * Cancel: POST /api/executions/[runId]/cancel (same cooperative path as deposit).
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import { trackProductEvent } from "@/lib/product-analytics";

export type ReadSynthesisStatus =
  | "idle"
  | "running"
  | "complete"
  | "failed"
  | "cancelled";

export type ReadSynthesizedOption = {
  index: number;
  kind?: string | null;
  title?: string | null;
  summary?: string | null;
  coveredSourcePaths?: string[];
  confidence?: number | null;
  patch?: unknown;
  measurements?: {
    absolutes?: unknown[];
    needinesses?: unknown[];
  };
  needFit?: number | null;
  /** Aggregate BTD scalar when the selection envelope supplies it. */
  totalBtd?: number | null;
  selectable?: boolean;
  settleable?: boolean;
};

export type ReadSelectionEnvelope = {
  schema?: string;
  surface?: string;
  purpose?: string;
  nextPipeline?: string;
  need?: string | null;
  repositoryFullName?: string | null;
  options?: ReadSynthesizedOption[];
  readyToPresent?: boolean;
  validationSummary?: string | null;
};

export function useReadOptionSynthesis(input: {
  repositoryContext: RepositoryContextState | null;
  need: string;
  /** Deposit permissibleSources twin — paths that should steer need comprehension. */
  relevantPaths?: string[];
  /** Deposit impermissibleSources twin — paths to de-emphasize / exclude from fit. */
  irrelevantPaths?: string[];
  /**
   * Live run id from URL / liveRuns table (deposit twin). When present and
   * still running, cancel works even after soft remount of compose state.
   */
  activeRunId?: string | null;
  activeRunStatus?: string | null;
  onRunDispatched?: (runId: string) => void;
  refreshLiveRuns?: (options?: { soft?: boolean }) => void | Promise<unknown>;
}) {
  const {
    repositoryContext,
    need,
    relevantPaths = [],
    irrelevantPaths = [],
    activeRunId = null,
    activeRunStatus = null,
    onRunDispatched,
    refreshLiveRuns,
  } = input;
  const [status, setStatus] = useState<ReadSynthesisStatus>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<ReadSelectionEnvelope | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dispatchedAtMsRef = useRef<number | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const pollForOptions = useCallback(
    (id: string) => {
      stopPoll();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/executions/history/${id}`);
          const data = await res.json().catch(() => null);
          const run = data?.run;
          const st = String(run?.status || "").toLowerCase();
          if (st === "cancelled") {
            stopPoll();
            setStatus("cancelled");
            setError(null);
            void Promise.resolve(refreshLiveRuns?.({ soft: true }) as unknown);
            return;
          }
          if (st === "failed") {
            stopPoll();
            setStatus("failed");
            setError(
              typeof run?.error?.message === "string"
                ? run.error.message
                : "Read option synthesis failed.",
            );
            return;
          }
          const output = run?.output as
            | {
                selectionEnvelope?: ReadSelectionEnvelope;
                options?: ReadSynthesizedOption[];
                success?: boolean;
              }
            | undefined;
          const nextEnvelope =
            output?.selectionEnvelope ||
            (Array.isArray(output?.options)
              ? {
                  options: output!.options,
                  purpose: "user-select-options-to-settle",
                  nextPipeline: "settle-asset-pack-pipeline",
                }
              : null);
          if (st === "completed" || nextEnvelope?.options?.length) {
            stopPoll();
            setEnvelope(nextEnvelope);
            setStatus("complete");
            setError(null);
            void Promise.resolve(refreshLiveRuns?.({ soft: true }) as unknown);
          }
        } catch {
          // keep polling until timeout via parent
        }
      }, 2500);
    },
    [refreshLiveRuns, stopPoll],
  );

  const synthesize = useCallback(async () => {
    const fullName = repositoryContext?.selectedRepository?.fullName;
    if (!fullName) {
      setError("Select a repository before synthesizing read options.");
      setStatus("failed");
      return;
    }
    if (!need.trim()) {
      setError("Enter a Need before synthesizing read options.");
      setStatus("failed");
      return;
    }

    setStatus("running");
    setError(null);
    setEnvelope(null);
    setSelectedIndexes([]);
    setIsCancelling(false);
    dispatchedAtMsRef.current = Date.now();
    const nextRunId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setRunId(nextRunId);

    try {
      const response = await fetch("/api/read/synthesize-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: nextRunId,
          repositoryFullName: fullName,
          sourceBranch: repositoryContext?.selectedBranch || null,
          sourceCommit: repositoryContext?.selectedCommit || null,
          need: need.trim(),
          // Deposit twin path steering (obfuscations inclusions/exclusions).
          relevantPaths,
          irrelevantPaths,
          permissibleSources: relevantPaths,
          impermissibleSources: irrelevantPaths,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Read option synthesis failed.",
        );
      }
      onRunDispatched?.(nextRunId);
      void Promise.resolve(refreshLiveRuns?.({ soft: true }) as unknown);
      pollForOptions(nextRunId);
    } catch (err) {
      stopPoll();
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Read option synthesis failed.");
    }
  }, [
    need,
    relevantPaths,
    irrelevantPaths,
    onRunDispatched,
    pollForOptions,
    refreshLiveRuns,
    repositoryContext?.selectedBranch,
    repositoryContext?.selectedCommit,
    repositoryContext?.selectedRepository?.fullName,
    stopPoll,
  ]);

  const toggleSelect = useCallback((index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }, []);

  // Adopt a still-running row from URL/liveRuns (deposit lifecycle twin).
  useEffect(() => {
    const active = String(activeRunId || "").trim();
    if (!active) return;
    const rowStatus = String(activeRunStatus || "").toLowerCase();
    if (rowStatus === "running") {
      if (runId !== active) setRunId(active);
      if (status !== "running" && status !== "complete") {
        setStatus("running");
        pollForOptions(active);
      }
      return;
    }
    if (rowStatus === "cancelled" && (status === "running" || runId === active)) {
      stopPoll();
      setRunId(active);
      setStatus("cancelled");
      setError(null);
    }
  }, [activeRunId, activeRunStatus, pollForOptions, runId, status, stopPoll]);

  /**
   * Cooperative cancel (deposit twin): mark execution cancelled; worker stops
   * and poll adopts cancelled status without treating it as a hard failure.
   * Targets local runId or active URL/liveRuns id when state was remounted.
   */
  const cancel = useCallback(async () => {
    const targetId = String(runId || activeRunId || "").trim();
    const rowRunning = String(activeRunStatus || "").toLowerCase() === "running";
    const canCancel =
      Boolean(targetId) &&
      !isCancelling &&
      (status === "running" || rowRunning);
    if (!canCancel || !targetId) return;
    setIsCancelling(true);
    try {
      const response = await fetch(
        `/api/executions/${encodeURIComponent(targetId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Run cancelled by reader." }),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to cancel the read synthesis run.",
        );
      }
      stopPoll();
      setRunId(targetId);
      setStatus("cancelled");
      setError(null);
      const durationMs =
        dispatchedAtMsRef.current !== null
          ? Date.now() - dispatchedAtMsRef.current
          : null;
      trackProductEvent({
        name: "read_synthesis_cancelled",
        data: { durationMs },
      });
      void Promise.resolve(refreshLiveRuns?.({ soft: true }) as unknown);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the read synthesis run.",
      );
    } finally {
      setIsCancelling(false);
    }
  }, [
    activeRunId,
    activeRunStatus,
    isCancelling,
    refreshLiveRuns,
    runId,
    status,
    stopPoll,
  ]);

  /** Clear compose/detail synthesis state when returning to the pipelines master. */
  const reset = useCallback(() => {
    stopPoll();
    setStatus("idle");
    setRunId(null);
    setError(null);
    setEnvelope(null);
    setSelectedIndexes([]);
    setIsCancelling(false);
    dispatchedAtMsRef.current = null;
  }, [stopPoll]);

  const synthesisRunning =
    status === "running" ||
    String(activeRunStatus || "").toLowerCase() === "running";

  return {
    status,
    runId: runId || activeRunId || null,
    error,
    envelope,
    options: envelope?.options || [],
    selectedIndexes,
    setSelectedIndexes,
    toggleSelect,
    synthesize,
    cancel,
    isCancelling,
    synthesisRunning,
    reset,
  };
}
