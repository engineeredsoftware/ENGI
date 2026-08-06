'use client';

import React from 'react';

import BitcodeTransactionsDataTable from '@/components/bitcode/pipeline/BitcodeTransactionsDataTable/BitcodeTransactionsDataTable';
import BitcodeTransactionsActiveFilters from '@/components/bitcode/pipeline/BitcodeTransactionsActiveFilters/BitcodeTransactionsActiveFilters';
import BitcodeTransactionsFilterBar from '@/components/bitcode/pipeline/BitcodeTransactionsFilterBar/BitcodeTransactionsFilterBar';
import BitcodeTransactionsOverview from '@/components/bitcode/pipeline/BitcodeTransactionsOverview/BitcodeTransactionsOverview';
import BitcodeTransactionsPagination from '@/components/bitcode/pipeline/BitcodeTransactionsPagination/BitcodeTransactionsPagination';
import type {
  TransactionDataMode,
  TransactionFilters,
  TransactionPagination,
  TransactionPaginationSummary,
  TransactionRecord,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeTransactionsTableProps {
  records: TransactionRecord[];
  filteredRecordCount: number;
  ownTransactionCount: number;
  visibleTokenTotal: number;
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters?: () => void;
  pagination: TransactionPaginationSummary;
  onPaginationChange: (nextPagination: TransactionPagination) => void;
  statusOptions: string[];
  repositoryOptions: string[];
  participantOptions: string[];
  proofStatusOptions: string[];
  isLoading: boolean;
  error: string | null;
  dataMode: TransactionDataMode;
  surface?: 'packs' | 'exchange' | 'pipelines' | 'wallet';
  onRefresh?: () => void;
  refreshLabel?: string;
}

export default function BitcodeTransactionsTable({
  records,
  filteredRecordCount,
  ownTransactionCount,
  visibleTokenTotal,
  selectedTransactionId,
  onSelectTransaction,
  filters,
  onFiltersChange,
  onResetFilters,
  pagination,
  onPaginationChange,
  statusOptions,
  repositoryOptions,
  participantOptions,
  proofStatusOptions,
  isLoading,
  error,
  dataMode,
  surface = 'packs',
  onRefresh,
  refreshLabel,
}: BitcodeTransactionsTableProps) {
  const isExchangeSurface = surface === 'exchange';
  const isPipelinesSurface = surface === 'pipelines';
  const isWalletSurface = surface === 'wallet';
  const tableKicker = isWalletSurface
    ? 'My account activity'
    : isExchangeSurface
      ? 'Exchange master-detail'
      : isPipelinesSurface
        ? 'Pipelines master-detail'
        : 'product activity';
  const tableTitle = isWalletSurface
    ? 'All my activity'
    : isExchangeSurface
      ? 'Searchable Exchange activity table'
      : isPipelinesSurface
        ? 'Pipeline runs'
        : 'Recent product activity';
  const tableSummary = isWalletSurface
    ? 'Everything that changed your account state — Reads, Deposits, Packs, anchors, ledger writes, and other history for this wallet/user only. Network market activity is excluded.'
    : isExchangeSurface
      ? 'The Exchange master table is searchable and filterable across market activity or your own activity. Select any row to load AssetPack evidence, proofs, history, and execution detail in the Exchange detail pane.'
      : isPipelinesSurface
        ? 'Every pipeline run for this account, searchable and filterable. Selecting a row opens the run detail in place — live telemetry stream when running, resumed results when completed — and Back returns to this table.'
        : 'product uses this shared activity table as a focused result surface for recent Deposit, Read, proof, and closure work. Select a row to read its AssetPack evidence, proof posture, history, and execution updates.';

  return (
    // No double-nesting: on the pipelines surface the page section already
    // provides the card chrome and the header, so the shell renders flat —
    // overview stats only, no second border/title/summary.
    <section
      data-testid="bitcode-transactions-table-shell"
      aria-labelledby={isPipelinesSurface ? undefined : "bitcodeTransactionsTableTitle"}
      aria-label={isPipelinesSurface ? tableTitle : undefined}
      className={
        isPipelinesSurface
          ? 'min-w-0 max-w-full overflow-x-hidden'
          : 'min-w-0 max-w-full overflow-x-hidden border border-white/8 bg-black/20 px-3 py-3 phone:px-4 phone:py-4'
      }
    >
      {isPipelinesSurface ? (
        <BitcodeTransactionsOverview
          recordCount={filteredRecordCount}
          ownTransactionCount={ownTransactionCount}
          visibleTokenTotal={visibleTokenTotal}
          selectedTransactionId={selectedTransactionId}
          dataMode={dataMode}
          statsReady={!isLoading}
        />
      ) : (
        // Title band, then full-width overview (data chips on their own row).
        <div className="flex flex-col gap-3">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-300/75">{tableKicker}</p>
            <h3 id="bitcodeTransactionsTableTitle" className="mt-1.5 text-lg font-semibold text-white">{tableTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-300">
              {tableSummary}
            </p>
          </div>

          <BitcodeTransactionsOverview
            recordCount={filteredRecordCount}
            ownTransactionCount={ownTransactionCount}
            visibleTokenTotal={visibleTokenTotal}
            selectedTransactionId={selectedTransactionId}
            dataMode={dataMode}
            statsReady={!isLoading}
          />
        </div>
      )}

      <BitcodeTransactionsFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        onResetFilters={onResetFilters}
        statusOptions={statusOptions}
        repositoryOptions={repositoryOptions}
        participantOptions={participantOptions}
        proofStatusOptions={proofStatusOptions}
      />

      <BitcodeTransactionsActiveFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onResetFilters={onResetFilters}
        onRefresh={onRefresh}
        refreshLabel={refreshLabel}
      />

      <BitcodeTransactionsDataTable
        records={records}
        selectedTransactionId={selectedTransactionId}
        onSelectTransaction={onSelectTransaction}
        isLoading={isLoading}
        error={error}
      />

      {/* Always mount pagination chrome so load → data does not reflow the rail. */}
      {!error ? (
        <div
          className={isLoading ? 'invisible pointer-events-none' : undefined}
          aria-hidden={isLoading || undefined}
        >
          <BitcodeTransactionsPagination
            pagination={pagination}
            onPaginationChange={onPaginationChange}
          />
        </div>
      ) : null}
    </section>
  );
}
