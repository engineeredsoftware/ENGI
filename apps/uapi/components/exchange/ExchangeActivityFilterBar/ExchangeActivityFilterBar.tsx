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
} from "@/components/exchange/models/exchange-format";
import {
  PACKS_FILTER_EXPLAINERS,
  type PacksFilterExplainerKey,
} from "@/components/exchange/models/exchange-filter-explainers";

export type ExchangeActivityFilterBarProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

/** Match BitcodeTransactionsFilterBar field chrome (gap owned by FilterCell). */
const FIELD_CLASS =
  "h-9 w-full min-w-0 max-w-full overflow-hidden border border-white/10 bg-[rgba(10,15,30,0.88)] px-2.5 text-sm text-white outline-none transition placeholder:truncate placeholder:text-neutral-500 focus:border-emerald-400/40 phone:px-3";

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
    <div className={["flex min-w-0 max-w-full flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <span className="flex h-4 min-w-0 items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
        <span className="min-w-0 truncate" title={label}>
          {label}
        </span>
        <BitcodeInlineExplainer
          explainer={explainer}
          side="bottom"
          className="shrink-0"
          triggerAriaLabel={`More info about the ${label} filter`}
        />
      </span>
      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}

export function ExchangeActivityFilterBar({
  routeParams,
  search,
  type,
  state,
  sort,
  direction,
  onWriteParams,
}: ExchangeActivityFilterBarProps) {
  return (
    // Compact mosaic twin of BitcodeTransactionsFilterBar — no nested card.
    // Parent list card owns vertical spacing (title chrome is a sibling card).
    <div
      className="grid w-full min-w-0 max-w-full grid-cols-2 items-start gap-2 tablet:grid-cols-4 xl:grid-cols-5"
      data-testid="packs-activity-filter-bar"
    >
      <FilterCell label="Search" explainerKey="search" className="col-span-2">
        <label className="relative mt-0 block min-w-0 max-w-full">
          <span className="sr-only">Search pack activity</span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 phone:left-3"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) =>
              onWriteParams({ q: event.currentTarget.value })
            }
            className={`${FIELD_CLASS} mt-0 pl-9 pr-2.5 phone:pl-10 phone:pr-3`}
            placeholder="Search packs…"
            title="Search packs, measurements, absolutes, proofs, states…"
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
          className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16 phone:px-3"
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

      {PACKS_FACET_FILTERS.map(([key, label]) => {
        const shortLabel = label.replace(/ facet$/i, "");
        return (
          <FilterCell
            key={key}
            label={shortLabel}
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
              placeholder={shortLabel}
              title={label}
              aria-label={label}
            />
          </FilterCell>
        );
      })}
    </div>
  );
}
