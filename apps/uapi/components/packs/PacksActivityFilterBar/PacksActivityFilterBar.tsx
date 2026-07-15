'use client';

/**
 * Packs master filter bar — Deposit/Read twin of BitcodeTransactionsFilterBar.
 * Flat mosaic (no nested card chrome). URL writes via onWriteParams.
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

/** Match BitcodeTransactionsFilterBar field chrome. */
const FIELD_CLASS =
  "mt-1.5 h-9 w-full min-w-0 border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40";

function FilterCell({
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
    <div className={className}>
      <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
        <span>{label}</span>
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
    // Compact mosaic twin of BitcodeTransactionsFilterBar — no nested card.
    <div
      className="mt-4 grid grid-cols-2 gap-2 tablet:grid-cols-4 xl:grid-cols-5"
      data-testid="packs-activity-filter-bar"
    >
      <FilterCell label="Search" explainerKey="search" className="col-span-2 tablet:col-span-2">
        <label className="relative mt-1.5 block min-w-0">
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
            className={`${FIELD_CLASS} mt-0 pl-10 pr-3`}
            placeholder="Search packs, measurements, absolutes, proofs, states…"
          />
        </label>
      </FilterCell>

      <FilterCell label="Type" explainerKey="type">
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
      </FilterCell>

      <FilterCell label="State" explainerKey="state">
        <input
          value={state === "all" ? "" : state}
          onChange={(event) =>
            onWriteParams({ state: event.currentTarget.value || null })
          }
          className={FIELD_CLASS}
          placeholder="State"
          aria-label="State filter"
        />
      </FilterCell>

      <FilterCell label="Sort" explainerKey="sort">
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
      </FilterCell>

      <FilterCell label="Direction" explainerKey="direction">
        <button
          type="button"
          onClick={() =>
            onWriteParams({
              direction: direction === "asc" ? "desc" : "asc",
            })
          }
          className="mt-1.5 inline-flex h-9 w-full items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16"
          aria-label={`Sort direction ${direction}`}
        >
          {direction === "asc" ? (
            <ArrowUpWideNarrow className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
          )}
          {direction}
        </button>
      </FilterCell>

      {PACKS_FACET_FILTERS.map(([key, label]) => (
        <FilterCell
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
            className={FIELD_CLASS}
            placeholder={label}
            aria-label={label}
          />
        </FilterCell>
      ))}
    </div>
  );
}
