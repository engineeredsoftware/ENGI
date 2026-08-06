'use client';

import React from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { BITCODE_TRANSACTION_FILTER_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';
import { SearchableSelect } from '@/components/bitcode/forms/SearchableSelect/SearchableSelect';
import type { TransactionFilters, TransactionOwnership, TransactionSort } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeTransactionsFilterBarProps {
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters?: () => void;
  statusOptions: string[];
  repositoryOptions: string[];
  participantOptions: string[];
  proofStatusOptions: string[];
}

// Dark filter mosaic chrome — full width, min-w-0 so 8-col grids do not blow out.
const FILTER_TRIGGER_CLASS =
  'mt-0 h-9 w-full min-w-0 max-w-full overflow-hidden border-white/10 bg-[rgba(10,15,30,0.88)] px-2.5 text-sm text-white hover:bg-white/10 hover:text-white phone:px-3';

const FILTER_INPUT_CLASS =
  'mt-0 h-9 w-full min-w-0 max-w-full border border-white/10 bg-[rgba(10,15,30,0.88)] px-2.5 text-sm text-white outline-none transition placeholder:truncate placeholder:text-neutral-500 focus:border-emerald-400/40 phone:px-3';

/**
 * Label + control stack. Fixed single-line label height keeps every control
 * on the same baseline across the mosaic (long labels like "Search
 * transactions" must not push their field down relative to neighbors).
 */
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
    <div className={['flex min-w-0 flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <span className="flex h-4 min-w-0 items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
        <span className="min-w-0 truncate" title={label}>
          {label}
        </span>
        <BitcodeInlineExplainer explainer={explainer} side="bottom" className="shrink-0" />
      </span>
      <div className="min-w-0 w-full">{children}</div>
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
    // Compact mosaic twin of Exchange packs filters: 2 cols from the base
    // band (phones sit under the 480px `phone` breakpoint — never stack one
    // filter per full row), denser at tablet/xl. Search spans the first row.
    <div
      className="mt-4 grid w-full min-w-0 max-w-full grid-cols-2 items-start gap-2 tablet:grid-cols-4 xl:grid-cols-8"
      data-testid="bitcode-transactions-filter-bar"
    >
      <FilterCell
        label="Search"
        explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.search}
        className="col-span-2 tablet:col-span-2 xl:col-span-2"
      >
        <input
          aria-label="Search transactions"
          value={searchValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearchValue(nextValue);
            updateFilter('searchTerm', nextValue);
          }}
          placeholder="Search ids, repos…"
          title="Search ids, repos, branches, proof posture, participants…"
          className={FILTER_INPUT_CLASS}
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
