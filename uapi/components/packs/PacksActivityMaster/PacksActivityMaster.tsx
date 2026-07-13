/**
 * Packs master table: filters, facets, activity grid, and type totals.
 */
"use client";

import React from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  ProductRouteKeyboardHint,
  ProductRouteStatePanel,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivityRecord,
  PackActivitySortDirection,
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  PACKS_SORT_OPTIONS as SORT_OPTIONS,
  PACKS_TYPE_OPTIONS as TYPE_OPTIONS,
  formatTimestamp,
  formatType,
  readParam,
  statusPill,
} from "@/components/packs/models/packs-format";

export type PacksActivityMasterProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PackActivityType | "all";
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  records: PackActivityRecord[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  topTypes: Array<[string, number]>;
  hasRows: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
  onRefresh: () => void;
};

export function PacksActivityMaster({
  routeParams,
  search,
  type,
  state,
  sort,
  direction,
  records,
  selectedId,
  isLoading,
  error,
  topTypes,
  hasRows,
  onWriteParams,
  onRefresh,
}: PacksActivityMasterProps) {
  return (
    <div className="min-w-0 border border-white/10 bg-white/[0.035]">
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
        {(
          [
            ["settlementState", "Settlement facet"],
            ["compensationState", "Compensation facet"],
            ["deliveryState", "Delivery facet"],
            ["repairState", "Repair facet"],
          ] as const
        ).map(([key, label]) => (
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

      <div className="overflow-x-auto">
        <table
          data-testid="packs-enterprise-activity-grid"
          aria-label="Pack activity economic operation table"
          className="min-w-full border-separate border-spacing-0 text-left"
        >
          <thead className="sticky top-0 z-10 bg-[#050915] text-[0.66rem] uppercase tracking-[0.18em] text-neutral-500">
            <tr>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Pack
              </th>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Type
              </th>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Value
              </th>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Settlement
              </th>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Delivery
              </th>
              <th className="border-b border-white/10 px-4 py-3 font-medium">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <ProductRouteStatePanel
                    compact
                    variant="loading"
                    title="Loading pack activity"
                    message="Activity rows are loading."
                  />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <ProductRouteStatePanel
                    compact
                    variant="error"
                    title="Pack activity unavailable"
                    message={error}
                  />
                </td>
              </tr>
            ) : hasRows ? (
              records.map((record) => (
                <tr
                  key={record.id}
                  aria-selected={record.id === selectedId}
                  className={`transition ${
                    record.id === selectedId
                      ? "bg-emerald-400/[0.08]"
                      : "hover:bg-white/[0.035]"
                  }`}
                >
                  <td className="max-w-[420px] border-b border-white/8 px-4 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => onWriteParams({ detailId: record.id })}
                      className="block w-full text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300/55"
                      aria-label={`Inspect ${record.assetPackTitle || record.title}`}
                    >
                      <span className="block truncate text-sm font-medium text-white">
                        {record.assetPackTitle || record.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-400">
                        {record.description}
                      </span>
                      <span className="mt-2 block font-mono text-[0.66rem] text-neutral-600">
                        {record.id}
                      </span>
                    </button>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top text-xs text-neutral-300">
                    {formatType(record.type)}
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top text-xs text-neutral-300">
                    {record.values[0]
                      ? `${record.values[0].amount} ${record.values[0].unit}`
                      : record.measurements[0]
                        ? `${record.measurements[0].value} ${record.measurements[0].unit || ""}`
                        : "not measured"}
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    {statusPill(record.settlementState)}
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    {statusPill(record.deliveryState)}
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top text-xs text-neutral-400">
                    {formatTimestamp(record.timestamp)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <ProductRouteStatePanel
                    compact
                    variant="empty"
                    title="No matching pack activity"
                    message="Adjust search, type, state, or sort filters."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <div className="flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-500">
          {topTypes.length ? (
            topTypes.map(([activityType, count]) => (
              <span
                key={activityType}
                className="border border-white/10 bg-white/[0.035] px-2.5 py-1"
              >
                {formatType(activityType as PackActivityType)} {count}
              </span>
            ))
          ) : (
            <span>No active type totals</span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-300 transition hover:border-emerald-300/30 hover:text-emerald-100"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>
    </div>
  );
}
