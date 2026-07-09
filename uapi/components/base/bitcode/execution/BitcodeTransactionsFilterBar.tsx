'use client';

import React from 'react';

import BitcodeInlineExplainer from './BitcodeInlineExplainer';
import { BITCODE_TRANSACTION_FILTER_EXPLAINERS } from './bitcode-transaction-explainers';
import { SearchableSelect } from '@/components/base/bitcode/forms/SearchableSelect';
import type { TransactionFilters, TransactionOwnership, TransactionSort } from './bitcode-transaction-types';

interface BitcodeTransactionsFilterBarProps {
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters?: () => void;
  statusOptions: string[];
  repositoryOptions: string[];
  participantOptions: string[];
  proofStatusOptions: string[];
}

// The one rich searchable dropdown (SearchableSelect, extracted from the
// repository picker) styled for the dark filter mosaic.
const FILTER_TRIGGER_CLASS =
  'mt-1.5 h-9 border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white hover:bg-white/10 hover:text-white';

function FilterCell({
  label,
  explainer,
  children,
  className,
}: {
  label: string;
  explainer: (typeof BITCODE_TRANSACTION_FILTER_EXPLAINERS)[keyof typeof BITCODE_TRANSACTION_FILTER_EXPLAINERS];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
        <span>{label}</span>
        <BitcodeInlineExplainer explainer={explainer} />
      </span>
      {children}
    </div>
  );
}

export default function BitcodeTransactionsFilterBar({
  filters,
  onFiltersChange,
  onResetFilters,
  statusOptions,
  repositoryOptions,
  participantOptions,
  proofStatusOptions,
}: BitcodeTransactionsFilterBarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.searchTerm);

  React.useEffect(() => {
    setSearchValue(filters.searchTerm);
  }, [filters.searchTerm]);

  const updateFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const withAll = (allLabel: string, options: string[]) => [
    { key: 'all', label: allLabel },
    ...options.map((option) => ({ key: option, label: option })),
  ];

  return (
    // Compact mosaic: multi-column at every width (never a one-filter-per-row
    // stack) so the bar spends horizontal space instead of vertical. Search
    // is the FIRST filter card in the flow, same size as the rest.
    <div className="mt-4 grid grid-cols-2 gap-2 tablet:grid-cols-4 xl:grid-cols-8">
      <FilterCell
        label="Search transactions"
        explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.search}
      >
        <input
          aria-label="Search transactions"
          value={searchValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearchValue(nextValue);
            updateFilter('searchTerm', nextValue);
          }}
          placeholder="Search ids, repos, branches, proof posture, participants…"
          className="mt-1.5 h-9 w-full border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
        />
      </FilterCell>

      <FilterCell label="Status" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.status}>
        <SearchableSelect
          aria-label="Status"
          items={withAll('All statuses', statusOptions)}
          value={filters.status}
          onSelect={(key) => updateFilter('status', key ?? 'all')}
          placeholder="All statuses"
          searchPlaceholder="Search statuses…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Ownership" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.ownership}>
        <SearchableSelect
          aria-label="Ownership"
          items={[
            { key: 'all', label: 'All participants' },
            { key: 'mine', label: 'My transactions' },
            { key: 'network', label: 'Exchange transactions' },
          ]}
          value={filters.ownership}
          onSelect={(key) => updateFilter('ownership', (key ?? 'all') as TransactionOwnership)}
          placeholder="All participants"
          searchPlaceholder="Search ownership…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Action lens" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.transactionLens}>
        <SearchableSelect
          aria-label="Action lens"
          items={[
            { key: 'all', label: 'All lenses' },
            { key: 'deposit', label: 'Deposit' },
            { key: 'read', label: 'Read' },
            { key: 'closure', label: 'Closure' },
          ]}
          value={filters.transactionLens}
          onSelect={(key) =>
            updateFilter('transactionLens', (key ?? 'all') as TransactionFilters['transactionLens'])
          }
          placeholder="All lenses"
          searchPlaceholder="Search lenses…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Repository" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.repository}>
        <SearchableSelect
          aria-label="Repository"
          items={withAll('All repositories', repositoryOptions)}
          value={filters.repository}
          onSelect={(key) => updateFilter('repository', key ?? 'all')}
          placeholder="All repositories"
          searchPlaceholder="Search repositories…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Participant" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.participant}>
        <SearchableSelect
          aria-label="Participant"
          items={withAll('All participants', participantOptions)}
          value={filters.participant}
          onSelect={(key) => updateFilter('participant', key ?? 'all')}
          placeholder="All participants"
          searchPlaceholder="Search participants…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Proof posture" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.proofStatus}>
        <SearchableSelect
          aria-label="Proof posture"
          items={withAll('All proof states', proofStatusOptions)}
          value={filters.proofStatus}
          onSelect={(key) => updateFilter('proofStatus', key ?? 'all')}
          placeholder="All proof states"
          searchPlaceholder="Search proof states…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

      <FilterCell label="Sort" explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.sort}>
        <SearchableSelect
          aria-label="Sort"
          items={[
            { key: 'newest', label: 'Newest first' },
            { key: 'oldest', label: 'Oldest first' },
            { key: 'most-tokens', label: 'Most tokens' },
            { key: 'highest-btc-fee-basis', label: 'Highest BTC Fee Basis' },
          ]}
          value={filters.sort}
          onSelect={(key) => updateFilter('sort', (key ?? 'newest') as TransactionSort)}
          placeholder="Newest first"
          searchPlaceholder="Search sort orders…"
          className={FILTER_TRIGGER_CLASS}
        />
      </FilterCell>

    </div>
  );
}
