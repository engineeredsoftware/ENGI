"use client";

/**
 * Packs activity data grid — Deposit/Read data-table chrome twin.
 * Column headers always render. Loading/empty share fixed status-row height.
 */

import React from "react";
import type {
  PackActivityMeasurement,
  PackActivityRecord,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import {
  PRODUCT_DATA_TABLE_CLASS,
  PRODUCT_DATA_TABLE_HEAD_CLASS,
  PRODUCT_DATA_TABLE_SHELL_CLASS,
  PRODUCT_DATA_TABLE_TD_CLASS,
  PRODUCT_DATA_TABLE_TH_CLASS,
} from "@/components/bitcode/pipeline/BitcodeTransactionsDataTable/BitcodeTransactionsDataTable";
import {
  ProductDataTableLoadingRow,
  ProductDataTableMessageRow,
} from "@/components/bitcode/pipeline/ProductDataTableStatus/ProductDataTableStatus";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  formatActivityValue,
  formatPackKind,
  formatTimestamp,
} from "@/components/packs/models/packs-format";
import {
  PACKS_COLUMN_EXPLAINERS,
  type PacksColumnExplainerKey,
} from "@/components/packs/models/packs-column-explainers";
import { PacksStatusPill } from "@/components/packs/PacksStatusPill/PacksStatusPill";

function PacksColumnHeader({
  label,
  explainerKey,
}: {
  label: string;
  explainerKey: PacksColumnExplainerKey;
}) {
  const explainer: BitcodeExplainer = PACKS_COLUMN_EXPLAINERS[explainerKey];
  return (
    <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
      <span className="inline-flex items-center gap-2">
        <span>{label}</span>
        <BitcodeInlineExplainer
          explainer={explainer}
          triggerAriaLabel={`More info about the ${label} column`}
        />
      </span>
    </th>
  );
}

export type PacksActivityTableProps = {
  records: PackActivityRecord[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  hasRows: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

const COL_COUNT = 7;

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
    // Height is natural: header + status row, or header + data rows. No min-h.
    <div
      data-testid="packs-activity-data-table-shell"
      className={PRODUCT_DATA_TABLE_SHELL_CLASS}
    >
      <table
        data-testid="packs-enterprise-activity-grid"
        aria-label="Pack activity economic operation table"
        className={PRODUCT_DATA_TABLE_CLASS}
      >
        <thead className={PRODUCT_DATA_TABLE_HEAD_CLASS}>
          <tr>
            <PacksColumnHeader label="Pack" explainerKey="pack" />
            <PacksColumnHeader label="Measurements" explainerKey="measurements" />
            <PacksColumnHeader label="Kind" explainerKey="type" />
            <PacksColumnHeader label="BTD" explainerKey="value" />
            <PacksColumnHeader label="Settlement" explainerKey="settlement" />
            <PacksColumnHeader label="Delivery" explainerKey="delivery" />
            <PacksColumnHeader label="Time" explainerKey="time" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <ProductDataTableLoadingRow
              colCount={COL_COUNT}
              label="Loading pack activity"
              data-testid="packs-activity-loading-state"
            />
          ) : error ? (
            <ProductDataTableMessageRow
              colCount={COL_COUNT}
              tone="error"
              role="alert"
            >
              {error}
            </ProductDataTableMessageRow>
          ) : !hasRows ? (
            <ProductDataTableMessageRow colCount={COL_COUNT}>
              No matching pack activity. Adjust search parameters.
            </ProductDataTableMessageRow>
          ) : (
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
                  className={`cursor-pointer border-t border-white/6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/55 ${selected ? "bg-emerald-400/10" : "hover:bg-white/5"
                    }`}
                >
                  <td className={`${PRODUCT_DATA_TABLE_TD_CLASS} max-w-[360px]`}>
                    <span className="block truncate text-sm font-medium text-white">
                      {record.assetPackTitle || record.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-400">
                      {record.description}
                    </span>
                    <span className="mt-1.5 block font-mono text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                      {record.id}
                    </span>
                  </td>
                  <td
                    className={`${PRODUCT_DATA_TABLE_TD_CLASS} min-w-[200px] max-w-[320px]`}
                  >
                    {shown.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {shown.map((measurement) => (
                          <span
                            key={`${record.id}:${measurement.id}:${measurement.label}`}
                            className="max-w-full truncate border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[0.62rem] text-neutral-200"
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
                  <td
                    className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}
                  >
                    <span className="block">{formatPackKind(record.assetPackKind)}</span>
                    <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-neutral-500">
                      {record.assetPackKind || record.type}
                    </span>
                  </td>
                  <td
                    className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}
                  >
                    {formatActivityValue(record)}
                  </td>
                  <td className={PRODUCT_DATA_TABLE_TD_CLASS}>
                    <PacksStatusPill value={record.settlementState} />
                  </td>
                  <td className={PRODUCT_DATA_TABLE_TD_CLASS}>
                    <PacksStatusPill value={record.deliveryState} />
                  </td>
                  <td
                    className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}
                  >
                    {formatTimestamp(record.timestamp)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
