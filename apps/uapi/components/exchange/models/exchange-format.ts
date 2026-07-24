/**
 * Pure formatters and shared option catalogs for the Packs experience.
 * React status presentation lives in ExchangeStatusPill (not here).
 *
 * Absolute kind options come from the measurement catalogue SSOT — never hand-lists.
 */

import type {
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  DATA_PACK_ABSOLUTE_KIND_OPTIONS,
  DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS,
  DATA_PACK_ABSOLUTE_KINDS,
  labelForDataPackAbsoluteKind,
} from "@bitcode/generic-measurements-domain-data-pack-absolutes-catalog";

/**
 * Type filter values for /exchange master. Includes synthetic "My" ownership lenses
 * (read bought, deposited unsettled/settled) plus network commodity cuts.
 */
export type PacksTypeFilter =
  | PackActivityType
  | "all"
  | "my-assetpacks"
  | "my-read-bought"
  | "my-deposited-unsettled"
  | "my-deposited-settled"
  | "needs-payout-review";

/** Commodity + ownership filters for the Packs type control. */
export const PACKS_TYPE_OPTIONS: Array<{
  value: PacksTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All DataPacks" },
  { value: "my-assetpacks", label: "My DataPacks" },
  { value: "my-read-bought", label: "My reads (bought)" },
  { value: "my-deposited-unsettled", label: "My deposits (unsettled)" },
  { value: "my-deposited-settled", label: "My deposits (settled)" },
  { value: "needs-payout-review", label: "Needs payout review" },
  { value: "depository-assetpack", label: "Depository DataPacks" },
  { value: "settled-assetpack", label: "Settled DataPacks" },
];

/** Synthetic ownership filters — matched against the signed-in account's packs. */
export const PACKS_MY_TYPE_FILTERS = new Set<PacksTypeFilter>([
  "my-assetpacks",
  "my-read-bought",
  "my-deposited-unsettled",
  "my-deposited-settled",
]);

export function isPacksMyTypeFilter(
  value: string | null | undefined,
): value is
  | "my-assetpacks"
  | "my-read-bought"
  | "my-deposited-unsettled"
  | "my-deposited-settled" {
  return Boolean(value && PACKS_MY_TYPE_FILTERS.has(value as PacksTypeFilter));
}

/** Settled packs awaiting seller BTD/pay-asset finalize. */
export function packNeedsPayoutReview(record: {
  type?: string | null;
  metadata?: Record<string, unknown> | null;
  compensationState?: string | null;
  settlementState?: string | null;
}): boolean {
  if (record.type && record.type !== "settled-assetpack" && record.type !== "settlement") {
    // Prefer settled commodity; still allow explicit payout metadata on other rows.
  }
  const meta = record.metadata || {};
  const pending = meta.pendingPayout;
  if (pending && typeof pending === "object" && !Array.isArray(pending)) {
    const status = String((pending as { status?: string }).status || "").toLowerCase();
    if (status === "pending-seller-review" || status === "pending") return true;
    if (status === "finalized") return false;
  }
  const payoutState = String(
    meta.payoutState || record.compensationState || "",
  ).toLowerCase();
  return (
    payoutState === "pending-seller-review" ||
    payoutState === "pending-payout" ||
    payoutState === "awaiting-seller-finalize"
  );
}

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

/**
 * Absolute-kind filter options for Exchange — full target vocabulary (46 kinds).
 * SSOT: DATA_PACK_ABSOLUTE_KIND_SPECS via DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS.
 * Do not hand-maintain this list.
 */
export const PACKS_ABSOLUTE_KIND_OPTIONS = DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS;

/** Full absolute kind ids (no "all") — SSOT DATA_PACK_ABSOLUTE_KINDS. */
export const PACKS_ABSOLUTE_KINDS = DATA_PACK_ABSOLUTE_KINDS;

/** Rich option metadata (family, policyRole, weighted flag) from SSOT. */
export const PACKS_ABSOLUTE_KIND_META = DATA_PACK_ABSOLUTE_KIND_OPTIONS;

export { labelForDataPackAbsoluteKind };

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

export function formatType(value: PacksTypeFilter | PackActivityType) {
  return (
    PACKS_TYPE_OPTIONS.find((option) => option.value === value)?.label || value
  );
}

/** DataPack product kind labels (capability / pattern / operations). */
export function formatPackKind(kind: string | null | undefined): string {
  if (!kind) return "—";
  if (kind === "capability-slice") return "Capabilities";
  if (kind === "implementation-pattern") return "Patterns";
  if (kind === "proof-operations-slice") return "Operations";
  return kind;
}

/**
 * Commercial value cell for packs master.
 * Unsettled depository packs: BTD estimate (honesty class). Never first size chip.
 */
export function formatActivityValue(record: {
  type?: string;
  values: Array<{ amount: number | string; unit: string; id?: string }>;
  measurements: Array<{ value: number | string; unit: string | null }>;
  estimatedBtd?: number | null;
  estimatedBtdCells?: number | null;
}) {
  if (
    typeof record.estimatedBtd === "number" &&
    Number.isFinite(record.estimatedBtd)
  ) {
    return `${record.estimatedBtd.toFixed(3)} BTD (est.)`;
  }
  if (
    typeof record.estimatedBtdCells === "number" &&
    Number.isFinite(record.estimatedBtdCells)
  ) {
    return `${record.estimatedBtdCells} BTD cells (est.)`;
  }
  const btdValue = record.values.find(
    (v) =>
      v.id === "estimated-btd" ||
      v.id === "estimated-btd-cells" ||
      /btd/i.test(v.unit) ||
      /btd/i.test(v.id || ""),
  );
  if (btdValue) {
    const amount =
      typeof btdValue.amount === "number"
        ? btdValue.amount < 10
          ? btdValue.amount.toFixed(3)
          : String(btdValue.amount)
        : btdValue.amount;
    return `${amount} ${btdValue.unit}`;
  }
  if (record.type === "depository-assetpack") {
    return "BTD unestimated";
  }
  if (record.values[0]) {
    return `${record.values[0].amount} ${record.values[0].unit}`;
  }
  // Do not fall back to function-count chips as "value" for commercial rows.
  return "not measured";
}
