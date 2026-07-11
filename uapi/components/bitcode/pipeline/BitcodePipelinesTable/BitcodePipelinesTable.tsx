'use client';

/**
 * Master-detail pipelines table wrapper (filter + paginate WorkspaceRun rows).
 * Relocated from TerminalTransactionsTable — shared by Deposits, Reads, Auxillaries.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import React, { useEffect, useMemo } from 'react';

import BitcodeTransactionsTable from '@/components/bitcode/pipeline/BitcodeTransactionsTable/BitcodeTransactionsTable';
import type {
  TransactionDataMode,
  TransactionFilters,
  TransactionPagination,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

import {
  buildTerminalTransactionFilterOptions,
  filterTerminalTransactions,
  normalizeTerminalTransactions,
} from '@/components/bitcode/pipeline/models/pipeline-transactions';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

export interface BitcodePipelinesTableProps {
  runs: WorkspaceRun[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters: () => void;
  pagination: TransactionPagination;
  onPaginationChange: (nextPagination: TransactionPagination) => void;
  isLoadingRuns: boolean;
  runsError: string | null;
  transactionDataMode: TransactionDataMode;
  surface?: 'terminal' | 'exchange' | 'pipelines';
}

export default function BitcodePipelinesTable({
  runs,
  selectedTransactionId,
  onSelectTransaction,
  filters,
  onFiltersChange,
  onResetFilters,
  pagination,
  onPaginationChange,
  isLoadingRuns,
  runsError,
  transactionDataMode,
  surface = 'pipelines',
}: BitcodePipelinesTableProps) {
  const records = useMemo(() => normalizeTerminalTransactions(runs), [runs]);
  const options = useMemo(() => buildTerminalTransactionFilterOptions(records), [records]);
  const filteredRecords = useMemo(() => filterTerminalTransactions(records, filters), [filters, records]);
  const ownTransactionCount = useMemo(
    () => filteredRecords.filter((record) => record.isOwnTransaction).length,
    [filteredRecords],
  );
  const visibleTokenTotal = useMemo(
    () => filteredRecords.reduce((total, record) => total + (record.tokenTotal ?? 0), 0),
    [filteredRecords],
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRecords.length / pagination.pageSize)),
    [filteredRecords.length, pagination.pageSize],
  );
  const currentPage = Math.min(pagination.page, totalPages);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.pageSize;
    return filteredRecords.slice(startIndex, startIndex + pagination.pageSize);
  }, [currentPage, filteredRecords, pagination.pageSize]);
  const startRecord = filteredRecords.length === 0 ? 0 : (currentPage - 1) * pagination.pageSize + 1;
  const endRecord = filteredRecords.length === 0 ? 0 : startRecord + paginatedRecords.length - 1;

  useEffect(() => {
    if (pagination.page === currentPage) return;
    onPaginationChange({ page: currentPage, pageSize: pagination.pageSize });
  }, [currentPage, onPaginationChange, pagination.page, pagination.pageSize]);

  return (
    <BitcodeTransactionsTable
      records={paginatedRecords}
      filteredRecordCount={filteredRecords.length}
      ownTransactionCount={ownTransactionCount}
      visibleTokenTotal={visibleTokenTotal}
      selectedTransactionId={selectedTransactionId}
      onSelectTransaction={onSelectTransaction}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onResetFilters={onResetFilters}
      pagination={{
        page: currentPage,
        pageSize: pagination.pageSize,
        totalRecords: filteredRecords.length,
        totalPages,
        startRecord,
        endRecord,
      }}
      onPaginationChange={onPaginationChange}
      statusOptions={options.statuses}
      repositoryOptions={options.repositories}
      participantOptions={options.participants}
      proofStatusOptions={options.proofStatuses}
      isLoading={isLoadingRuns}
      error={runsError}
      dataMode={transactionDataMode}
      surface={surface}
    />
  );
}

/** @deprecated Prefer `BitcodePipelinesTable`. */
export { BitcodePipelinesTable as TerminalTransactionsTable };
