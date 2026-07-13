/**
 * Packs master panel shell: filter bar, activity table, type totals, refresh.
 */
"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import type {
  PackActivityRecord,
  PackActivitySortDirection,
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { formatType } from "@/components/packs/models/packs-format";
import { PacksActivityFilterBar } from "@/components/packs/PacksActivityFilterBar/PacksActivityFilterBar";
import { PacksActivityTable } from "@/components/packs/PacksActivityTable/PacksActivityTable";

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
