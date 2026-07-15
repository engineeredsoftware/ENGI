'use client';

/**
 * Packs master filter bar: search/type/state/sort and economic facets.
 * URL writes are owned by the parent via onWriteParams.
 * Each control carries a rich BitcodeInlineExplainer (same pattern as
 * BitcodeTransactionsFilterBar).
 */

import React from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Search,
} from "lucide-react";
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  PACKS_FACET_FILTERS,
  PACKS_SORT_OPTIONS as SORT_OPTIONS,
  PACKS_TYPE_OPTIONS as TYPE_OPTIONS,
  readParam,
  type PacksTypeFilter,
} from "@/components/packs/models/packs-format";
import {
  PACKS_FILTER_EXPLAINERS,
  type PacksFilterExplainerKey,
} from "@/components/packs/models/packs-filter-explainers";

export type PacksActivityFilterBarProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

const FIELD_CLASS =
  "h-10 w-full min-w-0 border border-white/10 bg-black/30 px-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-emerald-300/45";

function FilterField({
  label,
  explainerKey,
  children,
  className = "",
}: {
  label: string;
  explainerKey: PacksFilterExplainerKey;
  children: React.ReactNode;
  className?: string;
}) {
  const explainer: BitcodeExplainer = PACKS_FILTER_EXPLAINERS[explainerKey];
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`.trim()}>
      <span className="flex min-h-[1rem] items-center gap-1.5 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-neutral-500">
        <span className="truncate">{label}</span>
        <BitcodeInlineExplainer
          explainer={explainer}
          side="bottom"
          triggerAriaLabel={`More info about the ${label} filter`}
        />
      </span>
      {children}
    </div>
  );
}

export function PacksActivityFilterBar({
  routeParams,
  search,
  type,
  state,
  sort,
  direction,
  onWriteParams,
}: PacksActivityFilterBarProps) {
  return (
    <div
      className="space-y-2.5 border-b border-white/10 p-3"
      data-testid="packs-activity-filter-bar"
    >
      {/*
        One shared horizontal pad + equal gap so primary controls and facets
        share the same left/right edges (previous p-3 vs px-4 drift).
      */}
      <div className="grid grid-cols-1 items-end gap-2.5 phone:grid-cols-2 laptop:grid-cols-[minmax(0,1.55fr)_minmax(9.5rem,0.72fr)_minmax(7.5rem,0.55fr)_minmax(8.5rem,0.62fr)_auto]">
        <FilterField label="Search" explainerKey="search">
          <label className="relative block min-w-0">
            <span className="sr-only">Search pack activity</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) =>
                onWriteParams({ q: event.currentTarget.value })
              }
              className={`${FIELD_CLASS} pl-10 pr-3`}
              placeholder="Search packs, measurements, absolutes, proofs, states…"
            />
          </label>
        </FilterField>

        <FilterField label="Type" explainerKey="type">
          <select
            value={type}
            onChange={(event) =>
              onWriteParams({ type: event.currentTarget.value })
            }
            className={FIELD_CLASS}
            aria-label="Activity type"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="State" explainerKey="state">
          <input
            value={state === "all" ? "" : state}
            onChange={(event) =>
              onWriteParams({ state: event.currentTarget.value || null })
            }
            className={FIELD_CLASS}
            placeholder="State"
            aria-label="State filter"
          />
        </FilterField>

        <FilterField label="Sort" explainerKey="sort">
          <select
            value={sort}
            onChange={(event) =>
              onWriteParams({ sort: event.currentTarget.value })
            }
            className={FIELD_CLASS}
            aria-label="Sort column"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Direction" explainerKey="direction" className="phone:col-span-2 laptop:col-span-1">
          <button
            type="button"
            onClick={() =>
              onWriteParams({
                direction: direction === "asc" ? "desc" : "asc",
              })
            }
            className="inline-flex h-10 w-full items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16 laptop:min-w-[5.75rem]"
            aria-label={`Sort direction ${direction}`}
          >
            {direction === "asc" ? (
              <ArrowUpWideNarrow className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
            )}
            {direction}
          </button>
        </FilterField>
      </div>

      <div className="grid grid-cols-1 items-end gap-2.5 phone:grid-cols-2 tablet:grid-cols-4">
        {PACKS_FACET_FILTERS.map(([key, label]) => (
          <FilterField
            key={key}
            label={label.replace(/ facet$/i, "")}
            explainerKey={key as PacksFilterExplainerKey}
          >
            <input
              value={
                readParam(routeParams, key, "all") === "all"
                  ? ""
                  : readParam(routeParams, key)
              }
              onChange={(event) =>
                onWriteParams({ [key]: event.currentTarget.value || null })
              }
              className={`${FIELD_CLASS} text-xs`}
              placeholder={label}
              aria-label={label}
            />
          </FilterField>
        ))}
      </div>
    </div>
  );
}
