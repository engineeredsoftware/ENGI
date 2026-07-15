'use client';

/**
 * Active filter chips row — always mounts when a trailing refresh control is
 * provided so that control permanently occupies the right side (near the
 * table's Started column alignment), even when no chips are active.
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

import {
  buildBitcodeTransactionActiveFilterChips,
  clearBitcodeTransactionFilter,
} from '@/components/bitcode/pipeline/BitcodeTransactionActiveFilters/bitcode-transaction-active-filters';
import type { TransactionFilters } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeTransactionsActiveFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters?: () => void;
  onRefresh?: () => void;
  refreshLabel?: string;
}

export default function BitcodeTransactionsActiveFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  onRefresh,
  refreshLabel = 'Refresh',
}: BitcodeTransactionsActiveFiltersProps) {
  const activeChips = buildBitcodeTransactionActiveFilterChips(filters);
  const hasChips = activeChips.length > 0;

  if (!hasChips && !onRefresh) return null;

  return (
    // Permanent row: chips (left) + optional refresh (right, sticky to trailing edge).
    <div className="mt-3 flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em]">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {hasChips ? (
          <>
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
          </>
        ) : (
          <span className="text-neutral-600" aria-hidden="true">
            {/* Reserved left rail so refresh stays right-aligned even with no chips. */}
          </span>
        )}
      </div>

      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
          aria-label={refreshLabel}
          title={refreshLabel}
          data-testid="bitcode-transactions-refresh"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
