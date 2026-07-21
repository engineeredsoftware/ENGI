/**
 * Reads pipelines master panel — table + header chrome for master-detail drill-in.
 * Deposit twin: title chrome is a stable card; list chrome is separate so drill-in
 * does not reflow the title. Back sits after the title text (never before).
 * New (+) opens compose detail while the list is open.
 */
'use client';

import React from "react";
import { ArrowLeft, Plus } from "lucide-react";
import BitcodePipelinesTable from "@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable";
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export type ReadsPipelinesMasterProps = {
  isReadDetailOpen: boolean;
  onCloseDetail: () => void;
  onOpenCompose: () => void;
  onRefresh: () => void;
  runs: WorkspaceRun[];
  selectedTransactionId: string | null;
  onSelectTransaction: (id: string | null) => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  pagination: TransactionPagination;
  onPaginationChange: (pagination: TransactionPagination) => void;
  isLoadingRuns: boolean;
  runsError: string | null;
};

export function ReadsPipelinesMaster({
  isReadDetailOpen,
  onCloseDetail,
  onOpenCompose,
  onRefresh,
  runs,
  selectedTransactionId,
  onSelectTransaction,
  filters,
  onFiltersChange,
  pagination,
  onPaginationChange,
  isLoadingRuns,
  runsError,
}: ReadsPipelinesMasterProps) {
  return (
    <div className="grid min-w-0 gap-4">
      {/* Stable title card — Back and New share one left action slot. */}
      <section
        className="border border-white/10 bg-white/[0.035] px-4 py-4"
        aria-label="Read"
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* Same 11×11 square for New (master) and Back (detail). */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            {isReadDetailOpen ? (
              <button
                type="button"
                onClick={onCloseDetail}
                className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-orange-300/30 hover:bg-orange-300/10"
                aria-label="Back to Read"
                title="Back to Read"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCompose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-orange-200/55 bg-[linear-gradient(180deg,rgba(251,146,60,0.95),rgba(249,115,22,0.88))] text-slate-950 shadow-[0_0_0_1px_rgba(254,215,170,0.35)_inset,0_12px_36px_rgba(249,115,22,0.42),0_0_28px_rgba(251,146,60,0.28)] transition hover:border-orange-100/70 hover:bg-[linear-gradient(180deg,rgba(253,186,116,1),rgba(251,146,60,0.95))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(4,8,18,0.9)] active:translate-y-px"
                aria-label="New read"
                title="New read"
                data-testid="reads-open-compose"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Pipelines
            </p>
            <h2 className="mt-1.5 text-lg font-semibold leading-none text-white">Read</h2>
          </div>
        </div>
      </section>

      {!isReadDetailOpen ? (
        <section
          className="border border-white/10 bg-white/[0.035] px-4 py-4"
          data-testid="reads-pipelines-table"
          aria-label="Read pipelines"
        >
          <BitcodePipelinesTable
            runs={runs}
            selectedTransactionId={selectedTransactionId}
            onSelectTransaction={onSelectTransaction}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onResetFilters={() =>
              onFiltersChange({
                ...DEFAULT_TRANSACTION_FILTERS,
                transactionLens: "read",
              })
            }
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            isLoadingRuns={isLoadingRuns}
            runsError={runsError}
            transactionDataMode="live"
            surface="pipelines"
            onRefresh={onRefresh}
            refreshLabel="Refresh Read"
          />
        </section>
      ) : null}
    </div>
  );
}
