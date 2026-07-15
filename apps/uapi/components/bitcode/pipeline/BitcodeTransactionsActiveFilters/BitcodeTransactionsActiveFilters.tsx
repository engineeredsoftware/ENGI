'use client';

/**
 * Active filter chips row — chips on the left; trailing icon rail on the right
 * (clear-all left of refresh). Refresh permanently occupies the far right when
 * provided, even when no chips are active.
 */

import React from 'react';
import { FilterX, RefreshCw } from 'lucide-react';

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

const ICON_BOX_CLASS =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10';

export default function BitcodeTransactionsActiveFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  onRefresh,
  refreshLabel = 'Refresh',
}: BitcodeTransactionsActiveFiltersProps) {
  const activeChips = buildBitcodeTransactionActiveFilterChips(filters);
  const hasChips = activeChips.length > 0;
  const showClearAll = Boolean(hasChips && onResetFilters);

  if (!hasChips && !onRefresh) return null;

  return (
    // Permanent row: chips (left) + icon rail (right: clear then refresh).
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
          </>
        ) : (
          <span className="text-neutral-600" aria-hidden="true">
            {/* Reserved left rail so trailing icons stay right-aligned. */}
          </span>
        )}
      </div>

      {(showClearAll || onRefresh) ? (
        <div className="flex shrink-0 items-center gap-1.5">
          {showClearAll ? (
            <button
              type="button"
              onClick={onResetFilters}
              className={ICON_BOX_CLASS}
              aria-label="Clear all filters"
              title="Clear all filters"
              data-testid="bitcode-transactions-clear-filters"
            >
              <FilterX className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className={ICON_BOX_CLASS}
              aria-label={refreshLabel}
              title={refreshLabel}
              data-testid="bitcode-transactions-refresh"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
