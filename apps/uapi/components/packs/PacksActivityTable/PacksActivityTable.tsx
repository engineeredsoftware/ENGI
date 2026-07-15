"use client";

/**
 * Packs activity data grid: loading/error/empty states and whole-row selection.
 * Rows show title + measurements; click anywhere on the row opens detail.
 */

import React from "react";
import { ProductRouteStatePanel } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivityMeasurement,
  PackActivityRecord,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
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

function formatMeasurementChip(measurement: PackActivityMeasurement): string {
  const unit = measurement.unit ? ` ${measurement.unit}` : "";
  return `${measurement.label}: ${measurement.value}${unit}`;
}

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
              Measurements
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
              <td colSpan={7} className="px-4 py-10">
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
              <td colSpan={7} className="px-4 py-10">
                <ProductRouteStatePanel
                  compact
                  variant="error"
                  title="Pack activity unavailable"
                  message={error}
                />
              </td>
            </tr>
          ) : hasRows ? (
            records.map((record) => {
              const selected = record.id === selectedId;
              const measurements = record.measurements || [];
              const shown = measurements.slice(0, 4);
              const overflow = Math.max(0, measurements.length - shown.length);
              return (
                <tr
                  key={record.id}
                  role="button"
                  tabIndex={0}
                  aria-selected={selected}
                  aria-label={`Inspect ${record.assetPackTitle || record.title}`}
                  onClick={() => onWriteParams({ detailId: record.id })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onWriteParams({ detailId: record.id });
                    }
                  }}
                  className={`cursor-pointer outline-none transition focus-visible:bg-emerald-400/[0.1] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/45 ${
                    selected
                      ? "bg-emerald-400/[0.08]"
                      : "hover:bg-white/[0.035]"
                  }`}
                >
                  <td className="max-w-[360px] border-b border-white/8 px-4 py-3.5 align-top">
                    <span className="block truncate text-sm font-medium text-white">
                      {record.assetPackTitle || record.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-400">
                      {record.description}
                    </span>
                    <span className="mt-1.5 block font-mono text-[0.62rem] text-neutral-600">
                      {record.id}
                    </span>
                  </td>
                  <td className="min-w-[200px] max-w-[320px] border-b border-white/8 px-4 py-3.5 align-top">
                    {shown.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {shown.map((measurement) => (
                          <span
                            key={`${record.id}:${measurement.id}:${measurement.label}`}
                            className="max-w-full truncate border border-white/10 bg-black/25 px-1.5 py-0.5 font-mono text-[0.62rem] text-neutral-200"
                            title={formatMeasurementChip(measurement)}
                          >
                            {formatMeasurementChip(measurement)}
                          </span>
                        ))}
                        {overflow > 0 ? (
                          <span className="border border-white/8 px-1.5 py-0.5 text-[0.62rem] text-neutral-500">
                            +{overflow}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="border-b border-white/8 px-4 py-3.5 align-top text-xs text-neutral-300">
                    {formatType(record.type)}
                  </td>
                  <td className="border-b border-white/8 px-4 py-3.5 align-top text-xs text-neutral-300">
                    {formatActivityValue(record)}
                  </td>
                  <td className="border-b border-white/8 px-4 py-3.5 align-top">
                    <PacksStatusPill value={record.settlementState} />
                  </td>
                  <td className="border-b border-white/8 px-4 py-3.5 align-top">
                    <PacksStatusPill value={record.deliveryState} />
                  </td>
                  <td className="border-b border-white/8 px-4 py-3.5 align-top text-xs text-neutral-400">
                    {formatTimestamp(record.timestamp)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-10">
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
