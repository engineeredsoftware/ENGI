/**
 * Pure formatters and shared option catalogs for the Packs experience.
 */

import React from "react";
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

export function statusPill(value: string | null, fallback = "not recorded") {
  const label = value || fallback;
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-300">
      {label}
    </span>
  );
}

