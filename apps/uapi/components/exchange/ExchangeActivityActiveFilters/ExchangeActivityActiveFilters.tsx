'use client';

/**
 * Packs active-filter + trailing icon rail — Deposit/Read twin of
 * BitcodeTransactionsActiveFilters. Clear (left of refresh) when non-default
 * filters are set; refresh permanently right-aligned.
 */

import React from 'react';
import { FilterX, RefreshCw } from 'lucide-react';
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
} from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import {
  PACKS_FACET_FILTERS,
  PACKS_SORT_OPTIONS,
  PACKS_TYPE_OPTIONS,
  readParam,
  type PacksTypeFilter,
} from '@/components/exchange/models/exchange-format';

export type ExchangeActivityActiveFiltersProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  onWriteParams: (updates: Record<string, string | null>) => void;
  onRefresh: () => void;
  refreshLabel?: string;
};

const ICON_BOX_CLASS =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10';

type ActiveChip = { key: string; label: string; value: string };

function buildActiveChips(props: {
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
}): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (props.search.trim()) {
    chips.push({ key: 'q', label: 'Search', value: props.search.trim() });
  }
  if (props.type && props.type !== 'all') {
    const typeLabel =
      PACKS_TYPE_OPTIONS.find((o) => o.value === props.type)?.label ?? props.type;
    chips.push({ key: 'type', label: 'Type', value: typeLabel });
  }
  if (props.state && props.state !== 'all') {
    chips.push({ key: 'state', label: 'State', value: props.state });
  }
  if (props.sort && props.sort !== 'timestamp') {
    const sortLabel =
      PACKS_SORT_OPTIONS.find((o) => o.value === props.sort)?.label ?? props.sort;
    chips.push({ key: 'sort', label: 'Sort', value: sortLabel });
  }
  if (props.direction && props.direction !== 'desc') {
    chips.push({ key: 'direction', label: 'Direction', value: props.direction });
  }
  for (const [facetKey, facetLabel] of PACKS_FACET_FILTERS) {
    const value = readParam(props.routeParams, facetKey, 'all');
    if (value && value !== 'all') {
      chips.push({
        key: facetKey,
        label: facetLabel.replace(/ facet$/i, ''),
        value,
      });
    }
  }
  return chips;
}

/** Clear every non-default pack filter param (keep detailId alone). */
export function packsDefaultFilterUpdates(): Record<string, string | null> {
  return {
    q: null,
    type: null,
    state: null,
    sort: null,
    direction: null,
    settlementState: null,
    compensationState: null,
    deliveryState: null,
    repairState: null,
  };
}

export function ExchangeActivityActiveFilters({
  routeParams,
  search,
  type,
  state,
  sort,
  direction,
  onWriteParams,
  onRefresh,
  refreshLabel = 'Refresh Packs',
}: ExchangeActivityActiveFiltersProps) {
  const activeChips = buildActiveChips({
    routeParams,
    search,
    type,
    state,
    sort,
    direction,
  });
  const hasChips = activeChips.length > 0;

  return (
    <div className="mt-3 flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em]">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {hasChips ? (
          <>
            <span className="text-neutral-500">
              {activeChips.length} active{' '}
              {activeChips.length === 1 ? 'filter' : 'filters'}
            </span>
            {activeChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => onWriteParams({ [chip.key]: null })}
                className="border border-white/10 bg-black/20 px-2.5 py-1.5 text-left text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
              >
                {chip.label}: {chip.value} ×
              </button>
            ))}
          </>
        ) : (
          <span className="text-neutral-600" aria-hidden="true" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {hasChips ? (
          <button
            type="button"
            onClick={() => onWriteParams(packsDefaultFilterUpdates())}
            className={ICON_BOX_CLASS}
            aria-label="Clear all filters"
            title="Clear all filters"
            data-testid="packs-activity-clear-filters"
          >
            <FilterX className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRefresh}
          className={ICON_BOX_CLASS}
          aria-label={refreshLabel}
          title={refreshLabel}
          data-testid="packs-activity-refresh"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
