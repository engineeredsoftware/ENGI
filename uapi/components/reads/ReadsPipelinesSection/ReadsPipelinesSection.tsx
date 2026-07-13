/**
 * Reads pipelines master-detail section: table, non-pipeline run summary, telemetry.
 */
"use client";

import React from "react";
import { ReadsPipelinesMaster } from "@/components/reads/ReadsPipelinesMaster/ReadsPipelinesMaster";
import { ReadsPipelineTelemetry } from "@/components/reads/ReadsPipelineTelemetry/ReadsPipelineTelemetry";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type {
  TransactionFilters,
  TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import type { TerminalRunActivitySnapshot } from "@/components/bitcode/pipeline/models/pipeline-run-activity";
import type { SelectedRunPackSummary } from "@/components/reads/ReadPageClient/hooks/use-read-pipeline-telemetry";

export type ReadsPipelinesSectionProps = {
  selectedRun: WorkspaceRun | null;
  liveRuns: WorkspaceRun[];
  isLoadingRuns: boolean;
  runsLoadError: string | null;
  pipelineFilters: TransactionFilters;
  pipelinePagination: TransactionPagination;
  onFiltersChange: (filters: TransactionFilters) => void;
  onPaginationChange: (pagination: TransactionPagination) => void;
  onSelectTransaction: (id: string) => void;
  onCloseDetail: () => void;
  onRefresh: () => void;
  selectedPipelineRunId: string | null;
  telemetry: {
    readRunActivity: TerminalRunActivitySnapshot;
    readRunIsProcessing: boolean;
    readRunMode: string;
    readRunTelemetryError: string | null;
    readRunStartMs: number | null;
    readRunEndMs: number | null;
    readRunEvents: unknown[];
    readLogScrolled: boolean;
    setReadLogScrolled: (value: boolean) => void;
    onDismissError: () => void;
    selectedRunPacks: SelectedRunPackSummary | null;
  };
};

export function ReadsPipelinesSection({
  selectedRun,
  liveRuns,
  isLoadingRuns,
  runsLoadError,
  pipelineFilters,
  pipelinePagination,
  onFiltersChange,
  onPaginationChange,
  onSelectTransaction,
  onCloseDetail,
  onRefresh,
  selectedPipelineRunId,
  telemetry,
}: ReadsPipelinesSectionProps) {
  return (
    <section
      aria-label="Read pipelines"
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
    >
      <ReadsPipelinesMaster
        selectedRun={selectedRun}
        onCloseDetail={onCloseDetail}
        onRefresh={onRefresh}
        runs={liveRuns}
        onSelectTransaction={onSelectTransaction}
        filters={pipelineFilters}
        onFiltersChange={onFiltersChange}
        pagination={pipelinePagination}
        onPaginationChange={onPaginationChange}
        isLoadingRuns={isLoadingRuns}
        runsError={runsLoadError}
      />
      {selectedRun && !selectedPipelineRunId ? (
        <div data-testid="reads-run-summary" className="mt-4">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
            Run detail
          </p>
          <dl className="mt-3 grid gap-3 text-sm leading-6 text-neutral-200 tablet:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Run
              </dt>
              <dd className="font-mono text-xs">{selectedRun.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Type
              </dt>
              <dd>{selectedRun.type}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Status
              </dt>
              <dd>{selectedRun.status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Proof
              </dt>
              <dd>{selectedRun.proofStatus || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Closure
              </dt>
              <dd>{selectedRun.closureFocus || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Repository
              </dt>
              <dd>{selectedRun.repository || "—"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            This run is not a formal pipeline execution, so there is no streamed
            telemetry to replay; its readback lives in the flow panels below.
          </p>
        </div>
      ) : null}
      {selectedPipelineRunId ? (
        <ReadsPipelineTelemetry
          selectedRun={selectedRun}
          selectedPipelineRunId={selectedPipelineRunId}
          readRunActivity={telemetry.readRunActivity}
          readRunIsProcessing={telemetry.readRunIsProcessing}
          readRunMode={telemetry.readRunMode}
          readRunTelemetryError={telemetry.readRunTelemetryError}
          readRunStartMs={telemetry.readRunStartMs}
          readRunEndMs={telemetry.readRunEndMs}
          readRunEvents={telemetry.readRunEvents}
          readLogScrolled={telemetry.readLogScrolled}
          setReadLogScrolled={telemetry.setReadLogScrolled}
          onDismissError={telemetry.onDismissError}
          onRefresh={onRefresh}
          selectedRunPacks={telemetry.selectedRunPacks}
        />
      ) : null}
    </section>
  );
}
