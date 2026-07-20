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
  isDepositSynthesisTerminalStatus,
  messageForMissingDepositOptions,
  synthesisStatusFromRunRow,
} from "@/components/deposits/models/deposit-run-status";
import { fetchDepositOptionSynthesisWithRetry } from "@/components/deposits/models/deposit-synthesis-options-hydrate";
import type { DepositSynthesisStatus } from "./use-deposit-synthesis-activity";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
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
  openDepositRouteTransaction: (id: string) => void;
  refreshLiveRuns: (options?: { soft?: boolean }) => void | Promise<unknown>;
  obfuscations: string;
  permissibleSources: string[];
  impermissibleSources: string[];
  repositoryContext: RepositoryContextState | null;
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
    openDepositRouteTransaction,
    refreshLiveRuns,
    obfuscations,
    permissibleSources,
    impermissibleSources,
    repositoryContext,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
    synthesizeOptionsRef,
    synthesisTelemetryRef,
  } = input;

  const lastAdoptedSelectionIdRef = useRef<string | null>(null);
  /** Prevents duplicate concurrent history fetches for the same run. */
  const optionsHydrateInFlightRef = useRef<string | null>(null);
  /**
   * After retries exhaust for a run id, do not loop hydrate forever while
   * status stays failed. Cleared on adopt/dispatch of a new run.
   */
  const hydrateExhaustedForRunRef = useRef<string | null>(null);

  // Resume synthesized options when a dispatched/adopted run completes OR when
  // revisiting a historical deposit synthesis detail (cold reload). Do not
  // require live SSE match — history row is enough for completed runs.
  // Also recover from false "options not found" (status=failed) once per run id
  // when the row is completed in liveRuns (soft-refresh / remount recovery).
  useEffect(() => {
    const liveRow = liveRuns.find((r) => r.id === synthesisRunId);
    const liveCompleted =
      String(liveRow?.status || "").toLowerCase() === "completed";
    const recoverableFailed =
      synthesisStatus === "failed" &&
      synthesisRunExpectsOptions &&
      !realSynthesis &&
      liveCompleted &&
      hydrateExhaustedForRunRef.current !== synthesisRunId;
    if (
      (synthesisStatus !== "running" &&
        synthesisStatus !== "complete" &&
        !recoverableFailed) ||
      !synthesisRunId ||
      realSynthesis
    ) {
      return;
    }
    if (
      synthesisActivity.error &&
      (synthesisExecutionMatchesRun || synthesisStreamError) &&
      synthesisStatus === "running"
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

    const rowStatus = String(
      (synthesisExecution as { status?: string } | null)?.status ||
        liveRuns.find((r) => r.id === synthesisRunId)?.status ||
        "",
    ).toLowerCase();
    const rowTerminal = isDepositSynthesisTerminalStatus(rowStatus);
    // Live runs wait for stream completion or terminal row; historical
    // complete adoptions fetch immediately (row may not be in execution hook yet).
    if (
      synthesisStatus === "running" &&
      !synthesisActivity.isStreamingComplete &&
      !rowTerminal &&
      !synthesisExecutionMatchesRun
    ) {
      return;
    }
    if (
      synthesisStatus === "running" &&
      !synthesisActivity.isStreamingComplete &&
      !rowTerminal
    ) {
      return;
    }
    // Always attempt hydrate for deposit synthesis context. If the list row
    // lacked contextSource, still try history — output presence decides.
    if (
      !synthesisRunExpectsOptions &&
      synthesisStatus === "complete" &&
      !rowTerminal &&
      !synthesisExecutionMatchesRun
    ) {
      // Non-synthesis bookmark rows (anchors) stay complete without options.
      return;
    }

    if (optionsHydrateInFlightRef.current === synthesisRunId) return;
    optionsHydrateInFlightRef.current = synthesisRunId;

    const abort = new AbortController();
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchDepositOptionSynthesisWithRetry({
          runId: synthesisRunId,
          // Short delays in test so unit tests do not wall-clock wait 3s.
          maxAttempts: process.env.NODE_ENV === "test" ? 4 : 6,
          delayMs: process.env.NODE_ENV === "test" ? 0 : 500,
          signal: abort.signal,
        });

        if (cancelled || abort.signal.aborted) return;

        if (result.kind === "http-error") {
          throw new Error(
            `Unable to load synthesis history for this run. (${result.status})`,
          );
        }

        if (result.kind === "found") {
          hydrateExhaustedForRunRef.current = null;
          setRealSynthesis({
            synthesis: result.synthesis as NonNullable<
              DepositRealSynthesis
            >["synthesis"],
            reviewProjections: result.reviewProjections as NonNullable<
              DepositRealSynthesis
            >["reviewProjections"],
          });
          setOptionsRequested(true);
          setSynthesisRunExpectsOptions(true);
          setSynthesisStatus("complete");
          setSynthesisError(null);
          if (synthesisDispatchedAtMs !== null) {
            const options = (result.synthesis as { options?: unknown[] })
              .options;
            trackProductEvent({
              name: "deposit_synthesis_completed",
              data: {
                optionCount: Array.isArray(options) ? options.length : 0,
                durationMs: Date.now() - synthesisDispatchedAtMs,
              },
            });
          }
          replaceDepositSearchParams(
            writeDepositRouteStage(
              readCurrentSearchParams(),
              "review-options",
            ),
          );
          void refreshLiveRuns({ soft: true });
          return;
        }

        // missing after retries — do not re-enter for this run id
        hydrateExhaustedForRunRef.current = synthesisRunId;
        const run = result.run;
        const output = run?.output;
        const contextSource =
          typeof run?.context?.source === "string" ? run.context.source : null;
        const isDepositSynthesis =
          contextSource === "deposit-option-synthesis" ||
          String(run?.type || "").includes("deposit");

        if (!isDepositSynthesis && !synthesisRunExpectsOptions) {
          setSynthesisStatus("complete");
          return;
        }

        const hostErrorMessage =
          (typeof output?.hostErrorMessage === "string" &&
            output.hostErrorMessage) ||
          (typeof run?.context?.hostErrorMessage === "string" &&
            String(run.context.hostErrorMessage)) ||
          (typeof run?.error === "string" && run.error) ||
          (run?.error &&
          typeof run.error === "object" &&
          typeof run.error.message === "string"
            ? run.error.message
            : null);
        const summary =
          (typeof output?.summary === "string" && output.summary) ||
          (typeof run?.summary === "string" && run.summary) ||
          hostErrorMessage ||
          null;
        const message =
          summary &&
          (String(run?.status || rowStatus).toLowerCase() === "failed" ||
            String(run?.status || rowStatus).toLowerCase() === "partial" ||
            /fail-closed|zero admissible|host budget|Partial synthesis/i.test(
              summary,
            ))
            ? summary
            : messageForMissingDepositOptions({
                status: run?.status || rowStatus,
                summary,
                hostBudgetExceeded:
                  output?.hostBudgetExceeded === true ||
                  run?.context?.hostBudgetExceeded === true,
                hostErrorMessage,
                finishPresent: output?.finishPresent,
              });

        if (synthesisRunExpectsOptions || isDepositSynthesis) {
          setSynthesisStatus("failed");
          setSynthesisError(message);
        } else {
          setSynthesisStatus("complete");
        }
        if (synthesisDispatchedAtMs !== null) {
          trackProductEvent({
            name: "deposit_synthesis_failed",
            data: {
              stage: "resume",
              partial: true,
              hostBudgetExceeded: Boolean(
                output?.hostBudgetExceeded || run?.context?.hostBudgetExceeded,
              ),
              durationMs: Date.now() - synthesisDispatchedAtMs,
            },
          });
        }
        void refreshLiveRuns({ soft: true });
      } catch (error) {
        if (cancelled || abort.signal.aborted) return;
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
      } finally {
        if (optionsHydrateInFlightRef.current === synthesisRunId) {
          optionsHydrateInFlightRef.current = null;
        }
      }
    })();
    return () => {
      cancelled = true;
      abort.abort();
      if (optionsHydrateInFlightRef.current === synthesisRunId) {
        optionsHydrateInFlightRef.current = null;
      }
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
    liveRuns,
    readCurrentSearchParams,
    refreshLiveRuns,
    replaceDepositSearchParams,
    setOptionsRequested,
    setRealSynthesis,
    setSynthesisError,
    setSynthesisRunExpectsOptions,
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
      void refreshLiveRuns({ soft: true });
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
    // Expect options for deposit synthesis rows, deposit pipeline types, or
    // any completed agentic deposit run — list context can be thin on reload.
    const expectsOptions =
      run.contextSource === "deposit-option-synthesis" ||
      String(run.type || "").includes("deposit") ||
      /deposit|asset.?pack|synthes/i.test(String(run.summary || ""));
    setSynthesisRunExpectsOptions(expectsOptions);
    setSynthesisDispatchedAtMs(null);
    setSynthesisLogScrolled(false);
    setRealSynthesis(null);
    setSynthesisError(null);
    setOptionsRequested(false);
    optionsHydrateInFlightRef.current = null;
    hydrateExhaustedForRunRef.current = null;
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
      optionsHydrateInFlightRef.current = null;
      hydrateExhaustedForRunRef.current = null;

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
            permissibleSources,
            impermissibleSources,
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
            permissibleSourceCount: permissibleSources.length,
            impermissibleSourceCount: impermissibleSources.length,
            demandSignalCount:
              depositoryDemandSignals.length + readingDemandSignals.length,
          },
        });
        void Promise.resolve(refreshLiveRuns({ soft: true }) as unknown).then(
          () => {
            openDepositRouteTransaction(runId);
          },
        );
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
      impermissibleSources,
      permissibleSources,
      obfuscations,
      readingDemandSignals,
      refreshLiveRuns,
      openDepositRouteTransaction,
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
