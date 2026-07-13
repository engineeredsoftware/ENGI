/**
 * Packs master filter bar: keyboard hint, search/type/state/sort, and facets.
 * URL writes are owned by the parent via onWriteParams.
 */
"use client";

import React from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Search,
} from "lucide-react";
import { ProductRouteKeyboardHint } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  PACKS_FACET_FILTERS,
  PACKS_SORT_OPTIONS as SORT_OPTIONS,
  PACKS_TYPE_OPTIONS as TYPE_OPTIONS,
  readParam,
} from "@/components/packs/models/packs-format";

export type PacksActivityFilterBarProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PackActivityType | "all";
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

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
    <>
      <div className="border-b border-white/10 px-4 py-3">
        <ProductRouteKeyboardHint
          testId="packs-keyboard-navigation"
          tone="emerald"
          shortcuts={[
            {
              keys: "Tab",
              label: "Move through filters, rows, and detail controls.",
            },
            {
              keys: "Enter",
              label:
                "Select focused position, signal, filter, or activity row.",
            },
            {
              keys: "Space",
              label: "Open or close expandable proof detail.",
            },
          ]}
        />
      </div>
      <div className="grid gap-3 border-b border-white/10 p-4 laptop:grid-cols-[minmax(220px,1fr)_170px_150px_150px_auto]">
        <label className="relative min-w-0">
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
            className="h-11 w-full border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-emerald-300/45"
            placeholder="Search titles, measurements, values, proof roots"
          />
        </label>
        <select
          value={type}
          onChange={(event) =>
            onWriteParams({ type: event.currentTarget.value })
          }
          className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none focus:border-emerald-300/45"
          aria-label="Activity type"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={state === "all" ? "" : state}
          onChange={(event) =>
            onWriteParams({ state: event.currentTarget.value || null })
          }
          className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-emerald-300/45"
          placeholder="State"
          aria-label="State filter"
        />
        <select
          value={sort}
          onChange={(event) =>
            onWriteParams({ sort: event.currentTarget.value })
          }
          className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none focus:border-emerald-300/45"
          aria-label="Sort column"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            onWriteParams({
              direction: direction === "asc" ? "desc" : "asc",
            })
          }
          className="inline-flex h-11 items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16"
        >
          {direction === "asc" ? (
            <ArrowUpWideNarrow className="h-4 w-4" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" />
          )}
          {direction}
        </button>
      </div>

      <div className="grid gap-3 border-b border-white/10 px-4 pb-4 tablet:grid-cols-4">
        {PACKS_FACET_FILTERS.map(([key, label]) => (
          <input
            key={key}
            value={
              readParam(routeParams, key, "all") === "all"
                ? ""
                : readParam(routeParams, key)
            }
            onChange={(event) =>
              onWriteParams({ [key]: event.currentTarget.value || null })
            }
            className="h-10 border border-white/10 bg-black/30 px-3 text-xs text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-emerald-300/45"
            placeholder={label}
            aria-label={label}
          />
        ))}
      </div>
    </>
  );
}
