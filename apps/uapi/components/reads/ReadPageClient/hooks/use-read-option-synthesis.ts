/**
 * Read option synthesis lifecycle (deposit twin).
 * Dispatches POST /api/read/synthesize-options, polls history for selection envelope.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";

export type ReadSynthesisStatus = "idle" | "running" | "complete" | "failed";

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
  repositoryContext: ProductRepositoryContextState | null;
  need: string;
  /** Deposit forcedInclusions twin — paths that should steer need comprehension. */
  relevantPaths?: string[];
  /** Deposit forcedExclusions twin — paths to de-emphasize / exclude from fit. */
  irrelevantPaths?: string[];
  onRunDispatched?: (runId: string) => void;
  refreshLiveRuns?: () => void | Promise<unknown>;
}) {
  const {
    repositoryContext,
    need,
    relevantPaths = [],
    irrelevantPaths = [],
    onRunDispatched,
    refreshLiveRuns,
  } = input;
  const [status, setStatus] = useState<ReadSynthesisStatus>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [envelope, setEnvelope] = useState<ReadSelectionEnvelope | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          if (st === "failed" || st === "cancelled") {
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
            void Promise.resolve(refreshLiveRuns?.() as unknown);
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
          forcedInclusions: relevantPaths,
          forcedExclusions: irrelevantPaths,
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
      void Promise.resolve(refreshLiveRuns?.() as unknown);
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

  /** Clear compose/detail synthesis state when returning to the pipelines master. */
  const reset = useCallback(() => {
    stopPoll();
    setStatus("idle");
    setRunId(null);
    setError(null);
    setEnvelope(null);
    setSelectedIndexes([]);
  }, [stopPoll]);

  return {
    status,
    runId,
    error,
    envelope,
    options: envelope?.options || [],
    selectedIndexes,
    setSelectedIndexes,
    toggleSelect,
    synthesize,
    reset,
  };
}
