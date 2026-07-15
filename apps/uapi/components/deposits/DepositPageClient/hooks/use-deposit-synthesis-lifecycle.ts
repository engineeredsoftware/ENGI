/**
 * Deposit synthesis lifecycle: resume options on complete, row reconciliation,
 * adoption from master selection, dispatch, and telemetry auto-scroll.
 */
"use client";

import { useCallback, useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { trackProductEvent } from "@/lib/product-analytics";
import { writeDepositRouteStage } from "@/components/deposits/models/deposit-route-model";
import {
  adoptSelectionStatusFromRun,
  synthesisStatusFromRunRow,
} from "@/components/deposits/models/deposit-run-status";
import type { DepositSynthesisStatus } from "./use-deposit-synthesis-activity";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import type { DepositRealSynthesis } from "@/components/deposits/models/deposit-real-synthesis";

export function useDepositSynthesisLifecycle(input: {
  synthesisStatus: DepositSynthesisStatus;
  setSynthesisStatus: (s: DepositSynthesisStatus) => void;
  synthesisRunId: string | null;
  setSynthesisRunId: (id: string | null) => void;
  realSynthesis: DepositRealSynthesis;
  setRealSynthesis: Dispatch<SetStateAction<DepositRealSynthesis>>;
  synthesisActivity: {
    error: string | null;
    isStreamingComplete: boolean;
  };
  synthesisExecutionMatchesRun: boolean;
  synthesisStreamError: string | null;
  synthesisExecution: unknown;
  synthesisDispatchedAtMs: number | null;
  setSynthesisDispatchedAtMs: (ms: number | null) => void;
  setSynthesisError: (error: string | null) => void;
  synthesisRunExpectsOptions: boolean;
  setSynthesisRunExpectsOptions: (v: boolean) => void;
  setOptionsRequested: (v: boolean) => void;
  setSynthesisLogScrolled: (v: boolean) => void;
  liveRuns: WorkspaceRun[];
  selectedRun: WorkspaceRun | null;
  readCurrentSearchParams: () => URLSearchParams;
  replaceDepositSearchParams: (p: URLSearchParams) => void;
  replaceDepositRouteTransaction: (id: string) => void;
  refreshLiveRuns: () => void | Promise<unknown>;
  obfuscations: string;
  forcedInclusions: string[];
  forcedExclusions: string[];
  repositoryContext: ProductRepositoryContextState | null;
  depositoryDemandSignals: Array<{ label: string }>;
  readingDemandSignals: Array<{ label: string }>;
  existingDepositorySignals: unknown;
  synthesizeOptionsRef: MutableRefObject<(() => Promise<void>) | null>;
  synthesisTelemetryRef: MutableRefObject<HTMLElement | null>;
}) {
  const {
    synthesisStatus,
    setSynthesisStatus,
    synthesisRunId,
    setSynthesisRunId,
    realSynthesis,
    setRealSynthesis,
    synthesisActivity,
    synthesisExecutionMatchesRun,
    synthesisStreamError,
    synthesisExecution,
    synthesisDispatchedAtMs,
    setSynthesisDispatchedAtMs,
    setSynthesisError,
    synthesisRunExpectsOptions,
    setSynthesisRunExpectsOptions,
    setOptionsRequested,
    setSynthesisLogScrolled,
    liveRuns,
    selectedRun,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    replaceDepositRouteTransaction,
    refreshLiveRuns,
    obfuscations,
    forcedInclusions,
    forcedExclusions,
    repositoryContext,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
    synthesizeOptionsRef,
    synthesisTelemetryRef,
  } = input;

  const lastAdoptedSelectionIdRef = useRef<string | null>(null);

  // Resume synthesized options when a dispatched/adopted run completes.
  useEffect(() => {
    if (
      (synthesisStatus !== "running" && synthesisStatus !== "complete") ||
      !synthesisRunId ||
      realSynthesis
    ) {
      return;
    }
    if (
      synthesisActivity.error &&
      (synthesisExecutionMatchesRun || synthesisStreamError)
    ) {
      setSynthesisStatus("failed");
      setSynthesisError(synthesisActivity.error);
      if (synthesisDispatchedAtMs !== null) {
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: {
            stage: "run",
            durationMs: Date.now() - synthesisDispatchedAtMs,
          },
        });
      }
      return;
    }
    if (!synthesisExecutionMatchesRun) return;
    const rowCompleted =
      String(
        (synthesisExecution as { status?: string } | null)?.status || "",
      ).toLowerCase() === "completed";
    if (!synthesisActivity.isStreamingComplete && !rowCompleted) return;
    if (!synthesisRunExpectsOptions) {
      setSynthesisStatus("complete");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/executions/history/${synthesisRunId}`);
        const data = await res.json().catch(() => null);
        const output = data?.run?.output as
          | { depositOptionSynthesis?: unknown; reviewProjections?: unknown }
          | undefined;
        const synthesis = output?.depositOptionSynthesis;
        if (!res.ok || !synthesis) {
          throw new Error("Synthesized options were not found for this run.");
        }
        if (cancelled) return;
        setRealSynthesis({
          synthesis: synthesis as NonNullable<DepositRealSynthesis>["synthesis"],
          reviewProjections: Array.isArray(output?.reviewProjections)
            ? (output!.reviewProjections as NonNullable<
                DepositRealSynthesis
              >["reviewProjections"])
            : [],
        });
        setOptionsRequested(true);
        setSynthesisStatus("complete");
        if (synthesisDispatchedAtMs !== null) {
          const options = (synthesis as { options?: unknown[] }).options;
          trackProductEvent({
            name: "deposit_synthesis_completed",
            data: {
              optionCount: Array.isArray(options) ? options.length : 0,
              durationMs: Date.now() - synthesisDispatchedAtMs,
            },
          });
        }
        replaceDepositSearchParams(
          writeDepositRouteStage(readCurrentSearchParams(), "review-options"),
        );
        void refreshLiveRuns();
      } catch (error) {
        if (cancelled) return;
        setSynthesisStatus("failed");
        setSynthesisError(
          error instanceof Error
            ? error.message
            : "Synthesis result not found.",
        );
        if (synthesisDispatchedAtMs !== null) {
          trackProductEvent({
            name: "deposit_synthesis_failed",
            data: {
              stage: "resume",
              durationMs: Date.now() - synthesisDispatchedAtMs,
            },
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    synthesisStatus,
    synthesisRunId,
    synthesisRunExpectsOptions,
    realSynthesis,
    synthesisActivity.isStreamingComplete,
    synthesisActivity.error,
    synthesisDispatchedAtMs,
    synthesisExecution,
    synthesisExecutionMatchesRun,
    synthesisStreamError,
    readCurrentSearchParams,
    refreshLiveRuns,
    replaceDepositSearchParams,
    setOptionsRequested,
    setRealSynthesis,
    setSynthesisError,
    setSynthesisStatus,
  ]);

  // Row-status reconciliation when SSE is quiet but the row is terminal.
  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const run = liveRuns.find((candidate) => candidate.id === synthesisRunId);
    if (!run) return;
    const mapped = synthesisStatusFromRunRow(run);
    if (mapped.status === "running") return;
    setSynthesisStatus(mapped.status);
    setSynthesisError(mapped.error);
    if (synthesisDispatchedAtMs === null) return;
    if (mapped.status === "cancelled") {
      trackProductEvent({
        name: "deposit_synthesis_cancelled",
        data: { durationMs: Date.now() - synthesisDispatchedAtMs },
      });
    } else if (mapped.status === "failed") {
      trackProductEvent({
        name: "deposit_synthesis_failed",
        data: {
          stage: "run",
          durationMs: Date.now() - synthesisDispatchedAtMs,
        },
      });
    }
  }, [
    liveRuns,
    setSynthesisError,
    setSynthesisStatus,
    synthesisDispatchedAtMs,
    synthesisRunId,
    synthesisStatus,
  ]);

  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const interval = window.setInterval(() => {
      void refreshLiveRuns();
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [refreshLiveRuns, synthesisRunId, synthesisStatus]);

  // Master-detail adoption from URL selection.
  useEffect(() => {
    const run = selectedRun;
    if (!run?.id) {
      lastAdoptedSelectionIdRef.current = null;
      return;
    }
    if (lastAdoptedSelectionIdRef.current === run.id) return;
    lastAdoptedSelectionIdRef.current = run.id;
    if (run.id === synthesisRunId) return;
    if (synthesisDispatchedAtMs !== null && synthesisStatus === "running") {
      return;
    }
    setSynthesisRunId(run.id);
    setSynthesisRunExpectsOptions(
      run.contextSource === "deposit-option-synthesis",
    );
    setSynthesisDispatchedAtMs(null);
    setSynthesisLogScrolled(false);
    setRealSynthesis(null);
    setSynthesisError(null);
    setOptionsRequested(false);
    const mapped = adoptSelectionStatusFromRun(run);
    setSynthesisStatus(mapped.status);
    setSynthesisError(mapped.error);
  }, [
    selectedRun,
    setOptionsRequested,
    setRealSynthesis,
    setSynthesisDispatchedAtMs,
    setSynthesisError,
    setSynthesisLogScrolled,
    setSynthesisRunExpectsOptions,
    setSynthesisRunId,
    setSynthesisStatus,
    synthesisRunId,
    synthesisDispatchedAtMs,
    synthesisStatus,
  ]);

  const handleSynthesizeOptions = useCallback(
    async (instructionsOverride?: string) => {
      const effectiveInstructions =
        typeof instructionsOverride === "string" && instructionsOverride.trim()
          ? instructionsOverride
          : obfuscations;
      setSynthesisStatus("running");
      setSynthesisError(null);
      setRealSynthesis(null);
      const runId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setSynthesisRunId(runId);
      setSynthesisRunExpectsOptions(true);
      setSynthesisDispatchedAtMs(Date.now());
      setSynthesisLogScrolled(false);

      try {
        const response = await fetch("/api/deposit/synthesize-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            repositoryFullName:
              repositoryContext?.selectedRepository?.fullName || null,
            sourceBranch: repositoryContext?.selectedBranch || null,
            sourceCommit: repositoryContext?.selectedCommit || null,
            obfuscations: effectiveInstructions,
            forcedInclusions,
            forcedExclusions,
            demandContext: [
              ...depositoryDemandSignals.map((signal) => signal.label),
              ...readingDemandSignals.map((signal) => signal.label),
            ],
            depositoryDemandSignals,
            readingDemandSignals,
            existingDepositorySignals,
          }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : "Deposit option synthesis failed.",
          );
        }
        trackProductEvent({
          name: "deposit_synthesis_dispatched",
          data: {
            hasObfuscations: Boolean(effectiveInstructions.trim()),
            forcedInclusionCount: forcedInclusions.length,
            forcedExclusionCount: forcedExclusions.length,
            demandSignalCount:
              depositoryDemandSignals.length + readingDemandSignals.length,
          },
        });
        void Promise.resolve(refreshLiveRuns() as unknown).then(() => {
          replaceDepositRouteTransaction(runId);
        });
      } catch (error) {
        setSynthesisStatus("failed");
        setSynthesisError(
          error instanceof Error
            ? error.message
            : "Deposit option synthesis failed.",
        );
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: { stage: "dispatch", durationMs: null },
        });
      }
    },
    [
      depositoryDemandSignals,
      existingDepositorySignals,
      forcedExclusions,
      forcedInclusions,
      obfuscations,
      readingDemandSignals,
      refreshLiveRuns,
      replaceDepositRouteTransaction,
      repositoryContext,
      setRealSynthesis,
      setSynthesisDispatchedAtMs,
      setSynthesisError,
      setSynthesisLogScrolled,
      setSynthesisRunExpectsOptions,
      setSynthesisRunId,
      setSynthesisStatus,
    ],
  );

  useEffect(() => {
    synthesizeOptionsRef.current = handleSynthesizeOptions;
  }, [handleSynthesizeOptions, synthesizeOptionsRef]);

  useEffect(() => {
    if (!synthesisRunId || synthesisDispatchedAtMs === null) return;
    synthesisTelemetryRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [synthesisDispatchedAtMs, synthesisRunId, synthesisTelemetryRef]);

  return { handleSynthesizeOptions };
}
