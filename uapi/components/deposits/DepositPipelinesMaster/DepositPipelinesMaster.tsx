'use client';

/**
 * Deposit pipelines master panel — table + header chrome for master-detail drill-in.
 */

import React from "react";
import { ArrowLeft, Plus } from "lucide-react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import BitcodePipelinesTable from "@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable";
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export type DepositPipelinesMasterProps = {
  isDepositDetailOpen: boolean;
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

export function DepositPipelinesMaster({
  isDepositDetailOpen,
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
}: DepositPipelinesMasterProps) {
  return (
    <section
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Deposit"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {isDepositDetailOpen ? (
            <button
              type="button"
              onClick={onCloseDetail}
              className="inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-200 transition hover:border-violet-300/30 hover:bg-violet-300/10"
              aria-label="Back to Deposit"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Pipelines
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <span>Deposit</span>
              <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.readback} />
            </h2>
          </div>
        </div>
        {/* Primary action owns the top-right: new deposit is the dominant CTA. */}
        {!isDepositDetailOpen ? (
          <button
            type="button"
            onClick={onOpenCompose}
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-violet-200/55 bg-[linear-gradient(180deg,rgba(167,139,250,0.95),rgba(139,92,246,0.88))] text-slate-950 shadow-[0_0_0_1px_rgba(196,181,253,0.35)_inset,0_12px_36px_rgba(139,92,246,0.42),0_0_28px_rgba(167,139,250,0.28)] transition hover:border-violet-100/70 hover:bg-[linear-gradient(180deg,rgba(196,181,253,1),rgba(167,139,250,0.95))] hover:shadow-[0_0_0_1px_rgba(221,214,254,0.45)_inset,0_14px_40px_rgba(139,92,246,0.5),0_0_34px_rgba(167,139,250,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(4,8,18,0.9)] active:translate-y-px"
            aria-label="New deposit"
            title="New deposit"
            data-testid="deposit-open-compose"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {!isDepositDetailOpen ? (
        <div className="mt-4" data-testid="deposits-pipelines-table">
          <BitcodePipelinesTable
            runs={runs}
            selectedTransactionId={selectedTransactionId}
            onSelectTransaction={onSelectTransaction}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onResetFilters={() =>
              onFiltersChange({
                ...DEFAULT_TRANSACTION_FILTERS,
                transactionLens: "deposit",
              })
            }
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            isLoadingRuns={isLoadingRuns}
            runsError={runsError}
            transactionDataMode="live"
            surface="pipelines"
            onRefresh={onRefresh}
            refreshLabel="Refresh Deposit"
          />
        </div>
      ) : null}
    </section>
  );
}
