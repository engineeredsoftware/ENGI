'use client';

/**
 * Packs activity data grid: loading/error/empty states and selectable rows.
 */

import React from "react";
import { ProductRouteStatePanel } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { PackActivityRecord } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatActivityValue,
  formatTimestamp,
  formatType,
} from "@/components/packs/models/packs-format";
import { PacksStatusPill } from "@/components/packs/PacksStatusPill/PacksStatusPill";

export type PacksActivityTableProps = {
  records: PackActivityRecord[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  hasRows: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

export function PacksActivityTable({
  records,
  selectedId,
  isLoading,
  error,
  hasRows,
  onWriteParams,
}: PacksActivityTableProps) {
  return (
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
                  {formatActivityValue(record)}
                </td>
                <td className="border-b border-white/8 px-4 py-4 align-top">
                  <PacksStatusPill value={record.settlementState} />
                </td>
                <td className="border-b border-white/8 px-4 py-4 align-top">
                  <PacksStatusPill value={record.deliveryState} />
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
  );
}
