'use client';

/**
 * Selected pipeline run telemetry detail for the Reads pipelines section.
 * Presentational: parent owns stream activity, clocks, and pack resume state.
 */

import React from "react";
import Link from "next/link";
import { PipelineExecutionLog } from "@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog";
import { ExecutionContextPillRow } from "@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow";
import { RunClock } from "@/components/bitcode/pipeline/RunClock/RunClock";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { ProductRunActivitySnapshot } from "@/components/bitcode/pipeline/models/pipeline-run-activity";
import type { SelectedRunPackSummary } from "@/components/reads/ReadPageClient/hooks/use-read-pipeline-telemetry";

export type ReadsPipelineTelemetryProps = {
  selectedRun: WorkspaceRun | null;
  selectedPipelineRunId: string;
  readRunActivity: ProductRunActivitySnapshot;
  readRunIsProcessing: boolean;
  readRunMode: "deposit" | "read" | string;
  readRunTelemetryError: string | null;
  readRunStartMs: number | null;
  readRunEndMs: number | null;
  readRunEvents: unknown[];
  readLogScrolled: boolean;
  setReadLogScrolled: (value: boolean) => void;
  onDismissError: () => void;
  onRefresh: () => void;
  selectedRunPacks: SelectedRunPackSummary | null;
};

export function ReadsPipelineTelemetry({
  selectedRun,
  selectedPipelineRunId,
  readRunActivity,
  readRunIsProcessing,
  readRunMode,
  readRunTelemetryError,
  readRunStartMs,
  readRunEndMs,
  readRunEvents,
  readLogScrolled,
  setReadLogScrolled,
  onDismissError,
  onRefresh,
  selectedRunPacks,
}: ReadsPipelineTelemetryProps) {
  return (
    <section
      aria-label="Read pipeline telemetry"
      className="mt-4 border border-white/10 bg-black/20 px-4 py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-orange-200/80">
            Telemetry
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Read pipeline telemetry
          </h2>
          {readRunIsProcessing && readRunActivity.latestContext ? (
            <div className="mt-3" data-testid="reads-telemetry-live-tracker">
              <ExecutionContextPillRow
                phase={readRunActivity.latestContext.phase}
                agent={readRunActivity.latestContext.agent}
                step={readRunActivity.latestContext.step}
                failsafe={readRunActivity.latestContext.failsafe}
                generation={readRunActivity.latestContext.generation}
                mode={readRunMode}
              />
            </div>
          ) : (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
              Source-safe pipeline telemetry for the selected run: phases,
              agents, generation stages, provider, model, and usage. Prompt and
              response content stays withheld by law.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {typeof readRunActivity.currentIteration === "number" && (
            <span
              title="DIV loop iteration (Discovery → Implementation → Validation)"
              className="border border-orange-300/15 bg-orange-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-orange-100"
            >
              iter {readRunActivity.currentIteration}
            </span>
          )}
          <RunClock
            startedAtMs={readRunStartMs}
            running={readRunIsProcessing}
            endedAtMs={readRunEndMs}
            className="font-mono text-[0.72rem] text-orange-100/90"
          />
          <span className="border border-white/10 bg-black/30 px-3 py-2 font-mono text-[0.62rem] text-neutral-400">
            {selectedPipelineRunId}
          </span>
        </div>
      </div>
      {readRunActivity.readyToFinishVerdicts.length > 0 &&
        (() => {
          const verdicts = readRunActivity.readyToFinishVerdicts;
          const latest = verdicts[verdicts.length - 1];
          const approved = latest.finalApproval === true;
          return (
            <div
              data-testid="reads-telemetry-readiness-verdict"
              className={`mt-3 border px-3 py-2 text-xs leading-5 ${
                approved
                  ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-100/90"
                  : "border-amber-300/20 bg-amber-300/5 text-amber-100/90"
              }`}
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                {`iter ${latest.iteration ?? "—"} verdict · `}
                {approved
                  ? "ready to finish"
                  : `iterate${latest.recommendation ? ` (${latest.recommendation})` : ""}`}
                {latest.warningsCount > 0 && ` · ${latest.warningsCount} warnings`}
              </p>
              {approved
                ? latest.summary && (
                    <p className="mt-1 max-w-4xl text-neutral-300">
                      {latest.summary}
                    </p>
                  )
                : latest.reasons.length > 0 && (
                    <ul className="mt-1 max-w-4xl list-disc space-y-1 pl-4 text-neutral-300">
                      {latest.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  )}
            </div>
          );
        })()}
      <div className="mt-4 min-w-0">
        <PipelineExecutionLog
          output={readRunActivity.output}
          outputDetails={readRunActivity.outputDetails}
          isProcessing={Boolean(readRunIsProcessing)}
          error={readRunTelemetryError}
          onRetry={onRefresh}
          onDismissError={onDismissError}
          userHasScrolled={readLogScrolled}
          setUserHasScrolled={setReadLogScrolled}
          compact
          pipelineMode={readRunMode === "deposit" ? "deposit" : "read"}
          liveContext={readRunActivity.latestContext}
          copyData={{
            runId: selectedPipelineRunId,
            status: selectedRun?.status ?? null,
            error: readRunActivity.error,
            outputDetails: readRunActivity.outputDetails,
            events: readRunEvents,
          }}
        />
      </div>
      {selectedRunPacks?.runId === selectedPipelineRunId ? (
        <div
          data-testid="reads-synthesized-packs"
          className="mt-4 border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-3"
        >
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-emerald-200/80">
            Synthesized AssetPacks · {selectedRunPacks.options.length}
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-neutral-200">
            {selectedRunPacks.options.map((option) => (
              <li
                key={option.optionId}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              >
                <span className="font-mono text-[0.68rem] text-neutral-500">
                  {option.optionId}
                </span>
                <span>{option.title}</span>
                {option.coveredSourcePathCount > 0 ? (
                  <span className="text-xs text-neutral-500">
                    {option.coveredSourcePathCount} source paths
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <Link
            href={`/deposits?transactionId=${encodeURIComponent(selectedRunPacks.runId)}&depositStage=review-options`}
            className="mt-3 inline-flex items-center border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
          >
            Review in Deposits
          </Link>
        </div>
      ) : null}
    </section>
  );
}
