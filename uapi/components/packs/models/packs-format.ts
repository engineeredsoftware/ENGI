/**
 * Pure formatters and shared option catalogs for the Packs experience.
 * React status presentation lives in PacksStatusPill (not here).
 */

import type {
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";

/** Network-scope AssetPack commodity filters (not personal pipeline activity). */
export const PACKS_TYPE_OPTIONS: Array<{
  value: PackActivityType | "all";
  label: string;
}> = [
  { value: "all", label: "All AssetPacks" },
  { value: "depository-assetpack", label: "Depository AssetPacks" },
  { value: "settled-assetpack", label: "Settled AssetPacks" },
];

export const PACKS_SORT_OPTIONS: Array<{
  value: PackActivitySortKey;
  label: string;
}> = [
  { value: "timestamp", label: "Time" },
  { value: "title", label: "Title" },
  { value: "value", label: "Value" },
  { value: "settlementState", label: "Settlement" },
  { value: "compensationState", label: "Compensation" },
  { value: "deliveryState", label: "Delivery" },
  { value: "repairState", label: "Repair" },
];

/** Facet filter keys bound to URL params on the packs master filter bar. */
export const PACKS_FACET_FILTERS = [
  ["settlementState", "Settlement facet"],
  ["compensationState", "Compensation facet"],
  ["deliveryState", "Delivery facet"],
  ["repairState", "Repair facet"],
] as const;

export function readParam(params: URLSearchParams, key: string, fallback = "") {
  return String(params.get(key) || fallback);
}

export function formatTimestamp(value: string | null) {
  if (!value) return "No timestamp";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCount(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatSats(value: number) {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)} sats`;
}

export function formatType(value: PackActivityType) {
  return (
    PACKS_TYPE_OPTIONS.find((option) => option.value === value)?.label || value
  );
}

export function formatActivityValue(record: {
  values: Array<{ amount: number | string; unit: string }>;
  measurements: Array<{ value: number | string; unit: string | null }>;
}) {
  if (record.values[0]) {
    return `${record.values[0].amount} ${record.values[0].unit}`;
  }
  if (record.measurements[0]) {
    return `${record.measurements[0].value} ${record.measurements[0].unit || ""}`;
  }
  return "not measured";
}
