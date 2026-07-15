"use client";

/**
 * Packs master panel — deposit/read twin chrome for master-detail drill-in.
 * Back when detail open; activity table + filters when master is showing.
 */

import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type {
  PackActivityRecord,
  PackActivitySortDirection,
  PackActivitySortKey,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatType,
  type PacksTypeFilter,
} from "@/components/packs/models/packs-format";
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
    <section
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Packs"
      data-testid="packs-pipelines-master"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {isDetailOpen ? (
            <button
              type="button"
              onClick={onCloseDetail}
              className="inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
              aria-label="Back to Packs"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
              Network ledger
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">Packs</h2>
          </div>
        </div>
        {!isDetailOpen ? (
          <button
            type="button"
            onClick={onRefresh}
            className="ml-auto inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-300 transition hover:border-emerald-300/30 hover:text-emerald-100"
            aria-label="Refresh Packs"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        ) : null}
      </div>

      {!isDetailOpen ? (
        <div className="mt-4 min-w-0 border border-white/10 bg-black/10">
          <PacksActivityFilterBar
            routeParams={routeParams}
            search={search}
            type={type}
            state={state}
            sort={sort}
            direction={direction}
            onWriteParams={onWriteParams}
          />

          <PacksActivityTable
            records={records}
            selectedId={selectedId}
            isLoading={isLoading}
            error={error}
            hasRows={hasRows}
            onWriteParams={onWriteParams}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
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
        </div>
      ) : null}
    </section>
  );
}
