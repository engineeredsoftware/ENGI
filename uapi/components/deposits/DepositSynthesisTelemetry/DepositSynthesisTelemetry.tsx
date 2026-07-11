/**
 * Deposit synthesis telemetry panel — live run log, readiness verdicts, cancel control.
 * Presentational; parent owns pipeline state and cancel/retry handlers.
 */
"use client";

import React from "react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { ExecutionContextPillRow } from "@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow";
import { PipelineExecutionLog } from "@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog";
import { RunClock } from "@/components/bitcode/pipeline/RunClock/RunClock";
import { QuantumOrb } from "@/components/bitcode/effects/quantum-orb";
import { verifiedAccessOrbConfig } from "@/components/marketing/MarketingLandingShared/MarketingLandingShared";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";

/** Live call-chain context for the telemetry pill row. */
export type DepositSynthesisLiveContext = {
  phase?: string | null;
  agent?: string | null;
  step?: string | null;
  failsafe?: string | null;
  generation?: string | number | null;
} | null;

/** Subset of pipeline run activity used by the deposit telemetry panel. */
export type DepositSynthesisActivity = {
  output: string;
  outputDetails?: Record<string, any>;
  error?: string | null;
  currentIteration?: number | null;
  readyToFinishVerdicts: Array<{
    iteration?: number | null;
    finalApproval?: boolean;
    recommendation?: string | null;
    qualityScore?: number | null;
    overallConfidence?: number | null;
    warningsCount: number;
    summary?: string | null;
    reasons: string[];
  }>;
};

export type DepositSynthesisTelemetryProps = {
  telemetryRef?: React.Ref<HTMLElement | null> | React.RefObject<HTMLElement | null>;
  synthesisRunId: string;
  synthesisRunExpectsOptions: boolean;
  synthesisLiveContext: DepositSynthesisLiveContext;
  synthesisRunning: boolean;
  synthesisRunStartMs: number | null;
  synthesisRunEndMs: number | null;
  synthesisActivity: DepositSynthesisActivity;
  synthesisStatus: "idle" | "running" | "completed" | "failed" | "cancelled" | string;
  synthesisError: string | null;
  isCancellingSynthesis: boolean;
  onCancel: () => void;
  onRetry: () => void;
  onDismissError: () => void;
  synthesisLogScrolled: boolean;
  setSynthesisLogScrolled: (value: boolean) => void;
  repositoryContext: TerminalRepositoryContextState | null;
  obfuscations: string;
  forcedInclusions: string[];
  forcedExclusions: string[];
  synthesisEvents: unknown[] | unknown;
};

export function DepositSynthesisTelemetry({
  telemetryRef,
  synthesisRunId,
  synthesisRunExpectsOptions,
  synthesisLiveContext,
  synthesisRunning,
  synthesisRunStartMs,
  synthesisRunEndMs,
  synthesisActivity,
  synthesisStatus,
  synthesisError,
  isCancellingSynthesis,
  onCancel,
  onRetry,
  onDismissError,
  synthesisLogScrolled,
  setSynthesisLogScrolled,
  repositoryContext,
  obfuscations,
  forcedInclusions,
  forcedExclusions,
  synthesisEvents,
}: DepositSynthesisTelemetryProps) {
  return (
              <section
                ref={telemetryRef as any}
                className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] px-4 py-4"
                aria-label="Asset Pack Synthesis telemetry"
                data-testid="deposit-synthesis-telemetry"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                      {synthesisRunExpectsOptions
                        ? "Asset Pack Synthesis"
                        : "Pipeline run"}
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <span>Telemetry</span>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.synthesisTelemetry} />
                    </h2>
                    {synthesisLiveContext ? (
                      <div
                        className="mt-3"
                        data-testid="deposit-telemetry-live-tracker"
                      >
                        <ExecutionContextPillRow
                          phase={synthesisLiveContext.phase}
                          agent={synthesisLiveContext.agent}
                          step={synthesisLiveContext.step}
                          failsafe={synthesisLiveContext.failsafe}
                          generation={synthesisLiveContext.generation}
                          mode="deposit"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                        Source-safe pipeline telemetry streamed live from the
                        running synthesis: phases, agents, generation stages,
                        provider, model, and usage. Prompt and response content
                        stays withheld by law.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantumOrb
                      key={synthesisRunning ? "telemetry-orb-running" : "telemetry-orb-idle"}
                      size={24}
                      config={verifiedAccessOrbConfig}
                      initialState={synthesisRunning ? "active" : "rest"}
                      interactive={false}
                      respectReducedMotion
                      className="shrink-0"
                    />
                    <RunClock
                      startedAtMs={synthesisRunStartMs}
                      running={synthesisRunning}
                      endedAtMs={synthesisRunEndMs}
                      className="font-mono text-[0.72rem] text-emerald-100/90"
                    />
                    {typeof synthesisActivity.currentIteration === "number" && (
                      <span
                        title="DIV loop iteration (Discovery → Implementation → Validation)"
                        className="border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100"
                      >
                        iter {synthesisActivity.currentIteration}
                      </span>
                    )}
                    {synthesisRunning ? (
                      <button
                        type="button"
                        data-testid="deposit-cancel-synthesis"
                        aria-label="Cancel synthesis run"
                        disabled={isCancellingSynthesis}
                        onClick={() => {
                          onCancel();
                        }}
                        className="border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/45 hover:bg-rose-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isCancellingSynthesis ? "Cancelling…" : "Cancel run"}
                      </button>
                    ) : null}
                    {synthesisStatus === "cancelled" ? (
                      <span
                        data-testid="deposit-synthesis-cancelled-badge"
                        className="border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-rose-100"
                      >
                        Cancelled
                      </span>
                    ) : null}
                    <span className="border border-white/10 bg-black/30 px-3 py-2 font-mono text-[0.62rem] text-neutral-400">
                      {synthesisRunId}
                    </span>
                  </div>
                </div>
                {synthesisActivity.readyToFinishVerdicts.length > 0 &&
                  (() => {
                    const verdicts = synthesisActivity.readyToFinishVerdicts;
                    const latest = verdicts[verdicts.length - 1];
                    const prior = verdicts.slice(0, -1);
                    const approved = latest.finalApproval === true;
                    return (
                      <div
                        data-testid="deposit-telemetry-readiness-verdict"
                        className={`mt-3 border px-3 py-2 text-xs leading-5 ${approved
                          ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-100/90"
                          : "border-amber-300/20 bg-amber-300/5 text-amber-100/90"
                          }`}
                      >
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                          {`iter ${latest.iteration ?? "—"} verdict · `}
                          {approved
                            ? "ready to finish"
                            : `iterate${latest.recommendation ? ` (${latest.recommendation})` : ""}`}
                          {typeof latest.qualityScore === "number" &&
                            ` · quality ${latest.qualityScore.toFixed(2)}`}
                          {typeof latest.overallConfidence === "number" &&
                            ` · confidence ${latest.overallConfidence.toFixed(2)}`}
                          {latest.warningsCount > 0 && ` · ${latest.warningsCount} warnings`}
                        </p>
                        {approved
                          ? latest.summary && (
                            <p className="mt-1 max-w-4xl text-neutral-300">{latest.summary}</p>
                          )
                          : latest.reasons.length > 0 && (
                            <ul className="mt-1 max-w-4xl list-disc space-y-1 pl-4 text-neutral-300">
                              {latest.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          )}
                        {prior.length > 0 && (
                          <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
                            {prior
                              .map(
                                (verdict) =>
                                  `iter ${verdict.iteration ?? "—"}: ${verdict.finalApproval === true
                                    ? "ready"
                                    : `iterate (${verdict.recommendation ?? "not approved"}, ${verdict.reasons.length} reasons)`
                                  }`,
                              )
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                <div className="mt-4 min-w-0">
                  <PipelineExecutionLog
                    output={synthesisActivity.output}
                    outputDetails={synthesisActivity.outputDetails}
                    isProcessing={synthesisStatus === "running"}
                    error={
                      synthesisStatus === "failed"
                        ? synthesisError
                        : synthesisActivity.error
                    }
                    onRetry={() => {
                      onRetry();
                    }}
                    onDismissError={onDismissError}
                    userHasScrolled={synthesisLogScrolled}
                    setUserHasScrolled={setSynthesisLogScrolled}
                    pipelineMode="deposit"
                    liveContext={synthesisLiveContext}
                    copyData={{
                      runId: synthesisRunId,
                      status: synthesisStatus,
                      error:
                        synthesisStatus === "failed"
                          ? synthesisError
                          : synthesisActivity.error,
                      inputs: {
                        repositoryFullName:
                          repositoryContext?.selectedRepository?.fullName ?? null,
                        sourceBranch: repositoryContext?.selectedBranch ?? null,
                        sourceCommit: repositoryContext?.selectedCommit ?? null,
                        obfuscations,
                        forcedInclusions,
                        forcedExclusions,
                      },
                      outputDetails: synthesisActivity.outputDetails,
                      events: synthesisEvents,
                    }}
                    compact
                  />
                </div>
              </section>
  );
}
