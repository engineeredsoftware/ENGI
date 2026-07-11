'use client';

import React from 'react';

import {
  buildBitcodeTransactionActiveFilterChips,
  clearBitcodeTransactionFilter,
} from '@/components/bitcode/pipeline/BitcodeTransactionActiveFilters/bitcode-transaction-active-filters';
import type { TransactionFilters } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeTransactionsActiveFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters?: () => void;
}

export default function BitcodeTransactionsActiveFilters({
  filters,
  onFiltersChange,
  onResetFilters,
}: BitcodeTransactionsActiveFiltersProps) {
  const activeChips = buildBitcodeTransactionActiveFilterChips(filters);

  if (!activeChips.length) return null;

  return (
    // One row: posture summary · active chips · clear-all.
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em]">
      <span className="text-neutral-500">
        {activeChips.length} active {activeChips.length === 1 ? 'filter' : 'filters'}
      </span>
      {activeChips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => onFiltersChange(clearBitcodeTransactionFilter(filters, chip.key))}
          className="border border-white/10 bg-black/20 px-2.5 py-1.5 text-left text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
        >
          {chip.label}: {chip.value} ×
        </button>
      ))}
      {onResetFilters ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="border border-white/10 bg-black/20 px-2.5 py-1.5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
