"use client";

/**
 * Packs master panel — Deposit/Read twin chrome for master-detail drill-in.
 *
 * Title chrome is a stable card (same geometry on master and detail). List
 * chrome (filter mosaic → active-filter rail → table → type totals) is a
 * separate card so drill-in does not reflow the title. Left square swaps
 * disabled New trade (master) ↔ Back (detail) so title text does not move.
 */

import React from "react";
import { ArrowLeft, Plus } from "lucide-react";
import type {
  PackActivityRecord,
  PackActivitySortDirection,
  PackActivitySortKey,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatType,
  type PacksTypeFilter,
} from "@/components/packs/models/packs-format";
import { PacksActivityActiveFilters } from "@/components/packs/PacksActivityActiveFilters/PacksActivityActiveFilters";
import { PacksActivityFilterBar } from "@/components/packs/PacksActivityFilterBar/PacksActivityFilterBar";
import { PacksActivityTable } from "@/components/packs/PacksActivityTable/PacksActivityTable";

export type PacksActivityMasterProps = {
  isDetailOpen: boolean;
  onCloseDetail: () => void;
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
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
  isDetailOpen,
  onCloseDetail,
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
    <div className="grid min-w-0 gap-4" data-testid="packs-pipelines-master">
      {/* Stable title card — square New (disabled) / Back (detail) twin of Read/Deposit. */}
      <section
        className="border border-white/10 bg-white/[0.035] px-4 py-4"
        aria-label="Packs"
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* Same 11×11 square: disabled green New (master), enabled Back (detail). */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            {isDetailOpen ? (
              <button
                type="button"
                onClick={onCloseDetail}
                className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
                aria-label="Back to Exchange"
                title="Back to Exchange"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-none border border-emerald-200/35 bg-[linear-gradient(180deg,rgba(103,254,183,0.55),rgba(16,185,129,0.48))] text-slate-950/70 opacity-55 shadow-[0_0_0_1px_rgba(167,243,208,0.2)_inset,0_8px_24px_rgba(16,185,129,0.2)]"
                aria-label="New trade"
                title="New trade (coming soon)"
                data-testid="packs-open-compose"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="min-w-0 leading-none">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Exchange Ledger
            </p>
            <h2 className="mt-1.5 text-lg font-semibold leading-none text-white">
              Bitcode Tokens
            </h2>
          </div>
        </div>
      </section>

      {!isDetailOpen ? (
        // List chrome is its own card so the title card never grows/shrinks.
        <section
          className="min-w-0 border border-white/10 bg-white/[0.035] px-4 py-4"
          data-testid="packs-activity-table"
          aria-label="Exchange activity"
        >
          <PacksActivityFilterBar
            routeParams={routeParams}
            search={search}
            type={type}
            state={state}
            sort={sort}
            direction={direction}
            onWriteParams={onWriteParams}
          />

          <PacksActivityActiveFilters
            routeParams={routeParams}
            search={search}
            type={type}
            state={state}
            sort={sort}
            direction={direction}
            onWriteParams={onWriteParams}
            onRefresh={onRefresh}
            refreshLabel="Refresh Packs"
          />

          <PacksActivityTable
            records={records}
            selectedId={selectedId}
            isLoading={isLoading}
            error={error}
            hasRows={hasRows}
            onWriteParams={onWriteParams}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-500">
              {topTypes.length ? (
                topTypes.map(([activityType, count]) => (
                  <span
                    key={activityType}
                    className="border border-white/10 bg-white/[0.035] px-2.5 py-1"
                  >
                    {formatType(activityType as PacksTypeFilter)} {count}
                  </span>
                ))
              ) : (
                <span>No active type totals</span>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
