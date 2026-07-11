'use client';

import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
  type TransactionLens,
  type TransactionOwnership,
  type TransactionSort,
} from './bitcode-transaction-types';

export type BitcodeTransactionActiveFilterChip = {
  key: keyof TransactionFilters;
  label: string;
  value: string;
};

const OWNERSHIP_LABELS: Record<Exclude<TransactionOwnership, 'all'>, string> = {
  mine: 'My transactions',
  network: 'Pack activity',
};

const LENS_LABELS: Record<Exclude<TransactionLens, 'all'>, string> = {
  deposit: 'Deposit',
  read: 'Read',
  closure: 'Closure',
};

const SORT_LABELS: Record<TransactionSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'most-tokens': 'Most tokens',
  'highest-btc-fee-basis': 'Highest BTC Fee Basis',
};

export function buildBitcodeTransactionActiveFilterChips(
  filters: TransactionFilters,
): BitcodeTransactionActiveFilterChip[] {
  const chips: BitcodeTransactionActiveFilterChip[] = [];

  if (filters.searchTerm.trim()) {
    chips.push({
      key: 'searchTerm',
      label: 'Search',
      value: filters.searchTerm.trim(),
    });
  }

  if (filters.status !== DEFAULT_TRANSACTION_FILTERS.status) {
    chips.push({
      key: 'status',
      label: 'Status',
      value: filters.status,
    });
  }

  if (filters.ownership !== DEFAULT_TRANSACTION_FILTERS.ownership) {
    chips.push({
      key: 'ownership',
      label: 'Ownership',
      value:
        filters.ownership === 'all'
          ? 'All transactions'
          : OWNERSHIP_LABELS[filters.ownership],
    });
  }

  if (filters.transactionLens !== DEFAULT_TRANSACTION_FILTERS.transactionLens) {
    chips.push({
      key: 'transactionLens',
      label: 'Lens',
      value:
        filters.transactionLens === 'all'
          ? 'All activity'
          : LENS_LABELS[filters.transactionLens],
    });
  }

  if (filters.repository !== DEFAULT_TRANSACTION_FILTERS.repository) {
    chips.push({
      key: 'repository',
      label: 'Repository',
      value: filters.repository,
    });
  }

  if (filters.participant !== DEFAULT_TRANSACTION_FILTERS.participant) {
    chips.push({
      key: 'participant',
      label: 'Participant',
      value: filters.participant,
    });
  }

  if (filters.proofStatus !== DEFAULT_TRANSACTION_FILTERS.proofStatus) {
    chips.push({
      key: 'proofStatus',
      label: 'Proof',
      value: filters.proofStatus,
    });
  }

  if (filters.sort !== DEFAULT_TRANSACTION_FILTERS.sort) {
    chips.push({
      key: 'sort',
      label: 'Sort',
      value: SORT_LABELS[filters.sort],
    });
  }

  return chips;
}

export function clearBitcodeTransactionFilter(
  filters: TransactionFilters,
  key: keyof TransactionFilters,
): TransactionFilters {
  return {
    ...filters,
    [key]: DEFAULT_TRANSACTION_FILTERS[key],
  };
}
