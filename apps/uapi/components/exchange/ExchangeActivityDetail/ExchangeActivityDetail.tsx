"use client";

/**
 * Packs detail shell for drill-in master-detail.
 * - layout="main": overview, measurements, states, accounting (primary column)
 * - layout="aside": governance + proof roots (route-state twin)
 * - layout="full": legacy single-column stack (tests / compact embeds)
 */

import React, { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { ProductRouteStatePanel } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivityDetailProjection,
  PackActivityMeasurement,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatActivityValue,
  formatPackKind,
  formatTimestamp,
} from "@/components/exchange/models/exchange-format";
import { ExchangeDetailSection } from "@/components/exchange/ExchangeDetailSection/ExchangeDetailSection";
import { ExchangeActivityDetailStates } from "@/components/exchange/ExchangeActivityDetailStates/ExchangeActivityDetailStates";
import { ExchangeActivityDetailAccounting } from "@/components/exchange/ExchangeActivityDetailAccounting/ExchangeActivityDetailAccounting";
import { ExchangeActivityDetailGovernance } from "@/components/exchange/ExchangeActivityDetailGovernance/ExchangeActivityDetailGovernance";
import { ExchangeActivityDetailProofRoots } from "@/components/exchange/ExchangeActivityDetailProofRoots/ExchangeActivityDetailProofRoots";
import {
  ExchangeActivityDetailPayout,
  type PacksPendingPayout,
} from "@/components/exchange/ExchangeActivityDetailPayout/ExchangeActivityDetailPayout";
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  type AbsoluteFamily,
} from "@bitcode/generic-measurements-domain-data-pack-absolutes-catalog";

export type ExchangeActivityDetailProps = {
  detail: PackActivityDetailProjection | null;
  /** Column role in the deposit/read-style detail grid. */
  layout?: "main" | "aside" | "full";
  /** Current user ethereum address (lowercased) for seller/buyer role. */
  viewerEthereumAddress?: string | null;
  onPayoutFinalized?: () => void;
};

function DetailHeader({ detail }: { detail: PackActivityDetailProjection }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Source-safe detail
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {detail.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-300">
        {detail.description}
      </p>
    </div>
  );
}

/** Catalogue family order for absolute measurement grid sections. */
const ABSOLUTE_FAMILY_ORDER: AbsoluteFamily[] = [
  "structure",
  "verification",
  "hygiene",
  "provenance",
  "semantics",
  "value",
];

const FAMILY_LABELS: Record<AbsoluteFamily, string> = {
  structure: "Structure",
  verification: "Verification",
  hygiene: "Hygiene",
  provenance: "Provenance",
  semantics: "Semantics",
  value: "Value",
};

const KIND_TO_FAMILY: Record<string, AbsoluteFamily> = Object.fromEntries(
  DATA_PACK_ABSOLUTES_CATALOG.map((s) => [s.measurementKind, s.family]),
);

function absoluteKindOf(m: PackActivityMeasurement): string | null {
  if (m.kind) return String(m.kind).replace(/^absolute:/, "");
  if (m.id?.startsWith("absolute:")) return m.id.slice("absolute:".length);
  return null;
}

function formatMeasurementDisplayValue(m: PackActivityMeasurement): string {
  const unit = m.unit && m.unit !== "normalized" && m.unit !== "estimate" ? ` ${m.unit}` : "";
  // Prefer integer magnitude for count-like units; avoid showing volume as "0.2 files".
  if (
    typeof m.value === "number" &&
    Number.isFinite(m.value) &&
    m.unit &&
    ["functions", "types", "files", "symbols", "modules", "languages", "tests", "exports", "dependencies", "keys", "edges", "components"].includes(
      m.unit,
    )
  ) {
    const n = m.value;
    // If value looks like a 0..1 volume mistaken for magnitude, prefer volume% only.
    if (n > 0 && n < 1 && typeof m.volume === "number" && Math.abs(n - m.volume) < 1e-6) {
      return `${(m.volume * 100).toFixed(0)}%`;
    }
    return `${Number.isInteger(n) ? n : Number(n.toFixed(2))}${unit}`;
  }
  if (typeof m.value === "number" && Number.isFinite(m.value) && m.value >= 0 && m.value <= 1 && !m.unit) {
    return `${(m.value * 100).toFixed(0)}%`;
  }
  return `${m.value}${unit}`;
}

function statusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case "measured":
      return "border-emerald-300/35 bg-emerald-300/12 text-emerald-100";
    case "estimated":
      return "border-sky-300/35 bg-sky-300/10 text-sky-100";
    case "expanded-fill":
      return "border-white/10 bg-white/[0.04] text-neutral-500";
    case "not_run":
    case "not_implemented":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100/90";
    case "insufficient_evidence":
      return "border-rose-300/25 bg-rose-300/8 text-rose-100/85";
    default:
      return "border-white/10 bg-white/[0.04] text-neutral-500";
  }
}

function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "measured":
      return "measured";
    case "estimated":
      return "estimated";
    case "expanded-fill":
      return "catalogue fill";
    case "not_run":
      return "not run";
    case "not_implemented":
      return "not implemented";
    case "insufficient_evidence":
      return "insufficient evidence";
    default:
      return "";
  }
}

function MeasurementTile({ measurement }: { measurement: PackActivityMeasurement }) {
  const status = measurement.status || null;
  const isFill = status === "expanded-fill";
  return (
    <div
      className={`flex min-h-[5.5rem] flex-col gap-1.5 border px-3 py-2.5 text-sm ${
        isFill
          ? "border-white/6 bg-black/10"
          : "border-white/10 bg-black/18"
      }`}
      data-testid="exchange-measurement-tile"
      data-kind={absoluteKindOf(measurement) || measurement.id}
      data-status={status || "unknown"}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`min-w-0 text-[0.82rem] font-medium leading-snug ${
            isFill ? "text-neutral-500" : "text-neutral-100"
          }`}
        >
          {measurement.label}
        </span>
        <span
          className={`shrink-0 font-mono text-[0.78rem] tabular-nums ${
            isFill ? "text-neutral-600" : "text-emerald-100/90"
          }`}
        >
          {isFill ? "—" : formatMeasurementDisplayValue(measurement)}
        </span>
      </div>
      {status ? (
        <span
          className={`w-fit rounded-sm border px-1.5 py-0.5 text-[0.52rem] font-medium ${statusBadgeClass(status)}`}
        >
          {statusLabel(status)}
        </span>
      ) : null}
      {!isFill &&
      (typeof measurement.weight === "number" ||
        typeof measurement.volume === "number") ? (
        <p className="font-mono text-[0.62rem] leading-4 text-neutral-500">
          {typeof measurement.weight === "number"
            ? `w ${measurement.weight.toFixed(3)}`
            : null}
          {typeof measurement.weight === "number" &&
          typeof measurement.volume === "number"
            ? " · "
            : null}
          {typeof measurement.volume === "number"
            ? `vol ${(measurement.volume * 100).toFixed(0)}%`
            : null}
        </p>
      ) : null}
      {isFill ? (
        <p className="text-[0.68rem] leading-4 text-neutral-600">
          Not measured — catalogue placeholder
        </p>
      ) : measurement.descriptor ? (
        <p className="line-clamp-3 text-[0.68rem] leading-4 text-neutral-500">
          {measurement.descriptor}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Absolute measurements as family-grouped responsive grid (not a 46-row stack).
 * Non-absolute rows (BTD, etc.) sit in a trailing "Other" band.
 */
function MeasurementsGrid({
  measurements,
}: {
  measurements: PackActivityMeasurement[];
}) {
  const { families, other } = useMemo(() => {
    const byFamily = new Map<AbsoluteFamily, PackActivityMeasurement[]>();
    for (const f of ABSOLUTE_FAMILY_ORDER) byFamily.set(f, []);
    const rest: PackActivityMeasurement[] = [];
    for (const m of measurements) {
      const kind = absoluteKindOf(m);
      const family = kind ? KIND_TO_FAMILY[kind] : undefined;
      if (family && byFamily.has(family)) {
        byFamily.get(family)!.push(m);
      } else if (m.id?.startsWith("absolute:") || m.kind) {
        // Absolute-ish but unknown family — keep under structure tail.
        byFamily.get("structure")!.push(m);
      } else {
        rest.push(m);
      }
    }
    return {
      families: ABSOLUTE_FAMILY_ORDER.map((f) => ({
        family: f,
        label: FAMILY_LABELS[f],
        items: byFamily.get(f) || [],
      })).filter((g) => g.items.length > 0),
      other: rest,
    };
  }, [measurements]);

  if (!measurements.length) {
    return (
      <p className="text-sm text-neutral-500">No source-safe measurements recorded.</p>
    );
  }

  return (
    <div className="space-y-5" data-testid="exchange-measurements-grid">
      {families.map((group) => (
        <div key={group.family} data-family={group.family}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h4 className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200/75">
              {group.label}
            </h4>
            <span className="font-mono text-[0.62rem] text-neutral-600">
              {group.items.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 phone:grid-cols-2 laptop:grid-cols-3">
            {group.items.map((measurement) => (
              <MeasurementTile
                key={`${measurement.id}:${String(measurement.value)}`}
                measurement={measurement}
              />
            ))}
          </div>
        </div>
      ))}
      {other.length ? (
        <div data-family="other">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h4 className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Other
            </h4>
            <span className="font-mono text-[0.62rem] text-neutral-600">{other.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 phone:grid-cols-2 laptop:grid-cols-3">
            {other.map((measurement) => (
              <MeasurementTile
                key={`${measurement.id}:${String(measurement.value)}`}
                measurement={measurement}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OverviewAndMeasurements({
  detail,
}: {
  detail: PackActivityDetailProjection;
}) {
  return (
    <>
      <ExchangeDetailSection title="Overview">
        <dl className="grid gap-3 text-sm tablet:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Kind</dt>
            <dd className="mt-1 text-neutral-100">
              {formatPackKind(detail.assetPackKind || detail.overview.assetPackKind)}
              {(detail.assetPackKind || detail.overview.assetPackKind) ? (
                <span className="mt-0.5 block font-mono text-[0.68rem] text-neutral-500">
                  {detail.assetPackKind || detail.overview.assetPackKind}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">BTD (unsettled estimate)</dt>
            <dd className="mt-1 font-mono text-neutral-100">
              {formatActivityValue(detail)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">State</dt>
            <dd className="mt-1 text-neutral-100">
              {detail.overview.state || "not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Repository</dt>
            <dd className="mt-1 text-neutral-100">
              {detail.overview.repository || "not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Time</dt>
            <dd className="mt-1 text-neutral-100">
              {formatTimestamp(detail.timestamp)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Activity</dt>
            <dd className="mt-1 text-neutral-500">{detail.type}</dd>
          </div>
        </dl>
      </ExchangeDetailSection>

      <MeasureReportStrip
        measureReport={detail.measureReport}
        measurements={detail.measurements}
      />

      <MaterialIdentityStrip materialIdentity={detail.materialIdentity} />

      <ExchangeDetailSection
        title={`Measurements · ${detail.measurements.length || 0}`}
      >
        <MeasurementsGrid measurements={detail.measurements} />
      </ExchangeDetailSection>
    </>
  );
}

/** Product-visible measure honesty strip (bodies / coverage / fill). */
function MeasureReportStrip({
  measureReport,
  measurements,
}: {
  measureReport?: Record<string, unknown> | null;
  measurements: PackActivityMeasurement[];
}) {
  const measuredCount = measurements.filter(
    (m) => m.status === "measured" || m.status === "estimated",
  ).length;
  const fillCount = measurements.filter((m) => m.status === "expanded-fill").length;
  const hasReport =
    measureReport &&
    typeof measureReport === "object" &&
    typeof measureReport.measuredFromBodies === "number";
  if (!hasReport && measuredCount === 0 && fillCount === 0) return null;
  return (
    <ExchangeDetailSection title="Measure report">
      <p
        className="text-sm leading-6 text-neutral-300"
        data-testid="exchange-measure-report"
      >
        {hasReport ? (
          <>
            Measured from{" "}
            <span className="text-violet-100">
              {String(measureReport!.measuredFromBodies)}
            </span>{" "}
            file
            {Number(measureReport!.measuredFromBodies) === 1 ? "" : "s"}
            {typeof measureReport!.bodyCoverageRatio === "number"
              ? ` · coverage ${Math.round(Number(measureReport!.bodyCoverageRatio) * 100)}%`
              : ""}
            {typeof measureReport!.mode === "string"
              ? ` · mode ${String(measureReport!.mode)}`
              : ""}
            {" · "}
            {measuredCount} measured / estimated · {fillCount} catalogue fill
          </>
        ) : (
          <>
            {measuredCount} measured / estimated · {fillCount} catalogue fill
            {measurements.length
              ? ` · ${measurements.length} catalogue rows`
              : ""}
          </>
        )}
      </p>
    </ExchangeDetailSection>
  );
}

/**
 * Buyer-visible material identity: purpose, languages, frameworks, patterns,
 * runtimes, top deps — source-safe only (no IP).
 */
function MaterialIdentityStrip({
  materialIdentity,
}: {
  materialIdentity?: Record<string, unknown> | null;
}) {
  if (!materialIdentity || typeof materialIdentity !== "object") return null;
  const tagSets = Array.isArray(materialIdentity.tagSets)
    ? (materialIdentity.tagSets as Array<{
        kind?: string;
        label?: string;
        tags?: string[];
        primary?: string | null;
      }>)
    : [];
  const compositions = Array.isArray(materialIdentity.compositions)
    ? (materialIdentity.compositions as Array<{
        kind?: string;
        label?: string;
        shares?: Record<string, number>;
        primary?: string | null;
      }>)
    : [];
  const inventories = Array.isArray(materialIdentity.inventories)
    ? (materialIdentity.inventories as Array<{
        kind?: string;
        label?: string;
        items?: Array<{ id?: string; label?: string; usageShare?: number }>;
        totalCount?: number;
      }>)
    : [];

  const purpose = tagSets.find((t) => t.kind === "purpose");
  const runtimes = tagSets.find((t) => t.kind === "runtimes");
  const patterns = tagSets.find((t) => t.kind === "architectural-patterns");
  const lang = compositions.find((c) => c.kind === "language-mix");
  const frameworks = inventories.find((i) => i.kind === "frameworks");
  const deps = inventories.find((i) => i.kind === "dependencies");

  const hasAny =
    (purpose?.tags?.length || 0) > 0 ||
    (lang && Object.keys(lang.shares || {}).length > 0) ||
    (frameworks?.items?.length || 0) > 0 ||
    (runtimes?.tags?.length || 0) > 0 ||
    (deps?.items?.length || 0) > 0;
  if (!hasAny) return null;

  const chip = (text: string, key: string) => (
    <span
      key={key}
      className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.68rem] text-neutral-200"
    >
      {text}
    </span>
  );

  const langChips = Object.entries(lang?.shares || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => chip(`${k} ${Math.round(v * 100)}%`, `lang-${k}`));

  return (
    <ExchangeDetailSection title="Material identity">
      <div
        className="space-y-3 text-sm"
        data-testid="exchange-material-identity"
      >
        {purpose?.primary || purpose?.tags?.length ? (
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Purpose
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(purpose?.tags || [purpose?.primary]).filter(Boolean).map((t, i) =>
                chip(String(t), `purpose-${i}`),
              )}
            </div>
          </div>
        ) : null}
        {langChips.length ? (
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Languages
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{langChips}</div>
          </div>
        ) : null}
        {frameworks?.items?.length ? (
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Frameworks
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {frameworks.items.slice(0, 10).map((f) =>
                chip(String(f.label || f.id), `fw-${f.id}`),
              )}
            </div>
          </div>
        ) : null}
        {runtimes?.tags?.length ? (
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Runtimes
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {runtimes.tags.slice(0, 8).map((t, i) => chip(String(t), `rt-${i}`))}
            </div>
          </div>
        ) : null}
        {patterns?.tags?.length && patterns.tags[0] !== "unspecified" ? (
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Architecture
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {patterns.tags.slice(0, 8).map((t, i) => chip(String(t), `pat-${i}`))}
            </div>
          </div>
        ) : null}
        {deps?.items?.length ? (
          <div data-testid="exchange-dependency-inventory">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
              Dependencies by usage
              {typeof deps.totalCount === "number" &&
              deps.totalCount > (deps.items?.length || 0)
                ? ` · ${deps.totalCount} total`
                : ""}
            </p>
            <ul className="mt-1.5 max-h-40 space-y-0.5 overflow-y-auto font-mono text-[0.68rem]">
              {[...deps.items]
                .sort(
                  (a, b) =>
                    (Number(b.usageShare) || 0) - (Number(a.usageShare) || 0),
                )
                .slice(0, 14)
                .map((d) => (
                  <li
                    key={String(d.id || d.label)}
                    className="flex flex-wrap items-baseline gap-x-2 text-neutral-300"
                  >
                    <span className="text-neutral-100">
                      {String(d.label || d.id)}
                    </span>
                    {typeof d.usageShare === "number" && d.usageShare > 0 ? (
                      <span className="text-cyan-100/70">
                        {Math.round(d.usageShare * 100)}% usage
                      </span>
                    ) : null}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ExchangeDetailSection>
  );
}

function PayoutFromDetail({
  detail,
  viewerEthereumAddress,
  onPayoutFinalized,
}: {
  detail: PackActivityDetailProjection;
  viewerEthereumAddress?: string | null;
  onPayoutFinalized?: () => void;
}) {
  const meta = detail.metadata || {};
  const pending = (meta.pendingPayout || meta.payout) as PacksPendingPayout | undefined;
  if (!pending || typeof pending !== "object") return null;

  const viewer = (viewerEthereumAddress || "").toLowerCase();
  const seller = String(pending.sellerAccount || "").toLowerCase();
  const buyer = String(pending.buyerAccount || "").toLowerCase();
  const canFinalize = Boolean(viewer && seller && viewer === seller);
  const isBuyer = Boolean(viewer && buyer && viewer === buyer);
  const settleRunId =
    typeof meta.settleRunId === "string"
      ? meta.settleRunId
      : typeof detail.id === "string"
        ? detail.id
        : "";

  if (!settleRunId) return null;

  return (
    <ExchangeActivityDetailPayout
      settleRunId={settleRunId}
      pendingPayout={pending}
      canFinalize={canFinalize}
      isBuyer={isBuyer}
      entitledPatchSummary={
        typeof meta.entitledPatchSummary === "string"
          ? meta.entitledPatchSummary
          : typeof pending.patchSummary === "string"
            ? pending.patchSummary
            : null
      }
      entitledPatch={meta.entitledPatch ?? null}
      onFinalized={onPayoutFinalized}
    />
  );
}

export function ExchangeActivityDetail({
  detail,
  layout = "full",
  viewerEthereumAddress = null,
  onPayoutFinalized,
}: ExchangeActivityDetailProps) {
  if (!detail) {
    return (
      <aside
        className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
        data-testid={
          layout === "aside" ? "packs-detail-aside" : "packs-detail-main"
        }
      >
        <div className="py-12">
          <ProductRouteStatePanel
            variant="empty"
            title="No activity selected"
            message="Choose a row to inspect measurements, proof roots, settlement, compensation, delivery, and repair."
          />
        </div>
      </aside>
    );
  }

  if (layout === "aside") {
    return (
      <aside
        className="grid h-fit items-start gap-5"
        aria-label="Pack route state"
        data-testid="packs-detail-aside"
      >
        <div className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
          <div className="grid gap-5">
            {detail.governance ? (
              <ExchangeActivityDetailGovernance governance={detail.governance} />
            ) : null}
            <ExchangeActivityDetailProofRoots detail={detail} />
          </div>
        </div>
      </aside>
    );
  }

  if (layout === "main") {
    return (
      <div
        className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
        data-testid="packs-detail-main"
      >
        <div className="grid gap-5">
          <DetailHeader detail={detail} />
          <OverviewAndMeasurements detail={detail} />
          <PayoutFromDetail
            detail={detail}
            viewerEthereumAddress={viewerEthereumAddress}
            onPayoutFinalized={onPayoutFinalized}
          />
          <ExchangeActivityDetailStates detail={detail} />
          {detail.accounting ? (
            <ExchangeActivityDetailAccounting accounting={detail.accounting} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <aside
      className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
      data-testid="packs-detail-full"
    >
      <div className="grid gap-5">
        <DetailHeader detail={detail} />
        <OverviewAndMeasurements detail={detail} />
        <ExchangeActivityDetailStates detail={detail} />
        {detail.accounting ? (
          <ExchangeActivityDetailAccounting accounting={detail.accounting} />
        ) : null}
        {detail.governance ? (
          <ExchangeActivityDetailGovernance governance={detail.governance} />
        ) : null}
        <ExchangeActivityDetailProofRoots detail={detail} />
      </div>
    </aside>
  );
}
