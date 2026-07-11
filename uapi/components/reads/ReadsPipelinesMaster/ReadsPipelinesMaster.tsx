/**
 * Reads pipelines master panel — table + header chrome for master-detail drill-in.
 */
"use client";

import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import BitcodePipelinesTable from "@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable";
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export type ReadsPipelinesMasterProps = {
  selectedRun: WorkspaceRun | null;
  onCloseDetail: () => void;
  onRefresh: () => void;
  runs: WorkspaceRun[];
  onSelectTransaction: (id: string | null) => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  pagination: TransactionPagination;
  onPaginationChange: (pagination: TransactionPagination) => void;
  isLoadingRuns: boolean;
  runsError: string | null;
};

export function ReadsPipelinesMaster({
  selectedRun,
  onCloseDetail,
  onRefresh,
  runs,
  onSelectTransaction,
  filters,
  onFiltersChange,
  pagination,
  onPaginationChange,
  isLoadingRuns,
  runsError,
}: ReadsPipelinesMasterProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {selectedRun ? (
            <button
              type="button"
              onClick={onCloseDetail}
              className="inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-200 transition hover:border-sky-300/30 hover:bg-sky-300/10"
              aria-label="Back to Read pipelines"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Pipelines
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Read pipelines
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-sky-300/30 hover:bg-sky-300/10"
          aria-label="Refresh Read pipelines"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {selectedRun ? null : (
        <div className="mt-4" data-testid="reads-pipelines-table">
          <BitcodePipelinesTable
            runs={runs}
            selectedTransactionId={null}
            onSelectTransaction={onSelectTransaction}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onResetFilters={() => onFiltersChange(DEFAULT_TRANSACTION_FILTERS)}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            isLoadingRuns={isLoadingRuns}
            runsError={runsError}
            transactionDataMode="live"
            surface="pipelines"
          />
        </div>
      )}
    </>
  );
}
