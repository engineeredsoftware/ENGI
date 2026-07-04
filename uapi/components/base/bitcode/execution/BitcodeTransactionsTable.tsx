'use client';

import React from 'react';

import BitcodeTransactionsDataTable from './BitcodeTransactionsDataTable';
import BitcodeTransactionsActiveFilters from './BitcodeTransactionsActiveFilters';
import BitcodeTransactionsFilterBar from './BitcodeTransactionsFilterBar';
import BitcodeTransactionsOverview from './BitcodeTransactionsOverview';
import BitcodeTransactionsPagination from './BitcodeTransactionsPagination';
import type {
  TransactionDataMode,
  TransactionFilters,
  TransactionPagination,
  TransactionPaginationSummary,
  TransactionRecord,
} from './bitcode-transaction-types';

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
  surface?: 'terminal' | 'exchange' | 'pipelines';
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
  surface = 'terminal',
}: BitcodeTransactionsTableProps) {
  const isExchangeSurface = surface === 'exchange';
  const isPipelinesSurface = surface === 'pipelines';
  const tableKicker = isExchangeSurface
    ? 'Exchange master-detail'
    : isPipelinesSurface
      ? 'Pipelines master-detail'
      : 'Terminal activity';
  const tableTitle = isExchangeSurface
    ? 'Searchable Exchange activity table'
    : isPipelinesSurface
      ? 'Pipeline runs'
      : 'Recent Terminal activity';
  const tableSummary = isExchangeSurface
    ? 'The Exchange master table is searchable and filterable across market activity or your own activity. Select any row to load AssetPack evidence, proofs, history, and execution detail in the Exchange detail pane.'
    : isPipelinesSurface
      ? 'Every pipeline run for this account, searchable and filterable. Select a running row to attach its live telemetry stream, or a completed row to resume its persisted results in the detail below.'
      : 'Terminal uses this shared activity table as a focused result surface for recent Deposit, Read, proof, and closure work. Select a row to read its AssetPack evidence, proof posture, history, and execution updates.';

  return (
    <section
      data-testid="bitcode-transactions-table-shell"
      aria-labelledby="bitcodeTransactionsTableTitle"
      className="rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
        />
      </div>

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
      />

      <BitcodeTransactionsDataTable
        records={records}
        selectedTransactionId={selectedTransactionId}
        onSelectTransaction={onSelectTransaction}
        isLoading={isLoading}
        error={error}
      />

      {!isLoading && !error ? (
        <BitcodeTransactionsPagination pagination={pagination} onPaginationChange={onPaginationChange} />
      ) : null}
    </section>
  );
}
