'use client';

/**
 * Deposit pipelines master panel — table + header chrome for master-detail drill-in.
 */

import React from "react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
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
        <div className="flex items-start gap-3">
          {isDepositDetailOpen ? (
            <button
              type="button"
              onClick={onCloseDetail}
              className="inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
              aria-label="Back to Deposit"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Pipelines
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <span>Deposit</span>
              <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.readback} />
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDepositDetailOpen ? (
            <button
              type="button"
              onClick={onOpenCompose}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
              aria-label="New deposit"
              title="New deposit"
              data-testid="deposit-open-compose"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
            aria-label="Refresh Deposit"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
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
          />
        </div>
      ) : null}
    </section>
  );
}
