"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Building2,
  LineChart,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ProductRouteEnterpriseSummary,
  ProductRouteKeyboardHint,
  ProductRouteProofDetail,
  ProductRouteShell,
  ProductRouteStatePanel,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivityDetailProjection,
  PackActivityRecord,
  PackActivitySummary,
  PackActivityType,
  PackActivitySortDirection,
  PackActivitySortKey,
  PackPortfolioMarketIntelligence,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";

type PacksActivityPayload = {
  ok: boolean;
  records: PackActivityRecord[];
  detail: PackActivityDetailProjection | null;
  summary: PackActivitySummary;
  marketIntelligence: PackPortfolioMarketIntelligence;
  error?: string;
};

import {
  PACKS_SORT_OPTIONS as SORT_OPTIONS,
  PACKS_TYPE_OPTIONS as TYPE_OPTIONS,
  readParam,
  formatTimestamp,
  formatCount,
  formatSats,
  formatType,
  statusPill,
} from "@/components/packs/models/packs-format";
import { PacksDetailSection as DetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";

export default function PacksPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  );
  const [records, setRecords] = useState<PackActivityRecord[]>([]);
  const [detail, setDetail] = useState<PackActivityDetailProjection | null>(
    null,
  );
  const [summary, setSummary] = useState<PackActivitySummary | null>(null);
  const [marketIntelligence, setMarketIntelligence] =
    useState<PackPortfolioMarketIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = readParam(routeParams, "q");
  const type = readParam(routeParams, "type", "all") as
    | PackActivityType
    | "all";
  const state = readParam(routeParams, "state", "all");
  const sort = readParam(
    routeParams,
    "sort",
    "timestamp",
  ) as PackActivitySortKey;
  const direction = readParam(
    routeParams,
    "direction",
    "desc",
  ) as PackActivitySortDirection;
  const detailId = readParam(routeParams, "detailId");

  const writeParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(routeParams);
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, routeParams, router],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams(routeParams);
    params.set("limit", params.get("limit") || "80");
    // /packs is ALWAYS the network-scope AssetPack ledger (admitted Depository
    // AssetPacks + settled/read APs) — never user-widenable back to personal
    // pipeline activity, which is /deposits' job.
    params.set("scope", "network");

    try {
      const response = await fetch(`/api/packs/activity?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as PacksActivityPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to read pack activity.");
      }
      setRecords(payload.records || []);
      setDetail(payload.detail || null);
      setSummary(payload.summary || null);
      setMarketIntelligence(payload.marketIntelligence || null);
    } catch (loadError) {
      setRecords([]);
      setDetail(null);
      setSummary(null);
      setMarketIntelligence(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to read pack activity.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [routeParams]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedId = detail?.id || detailId || records[0]?.id || null;
  const hasRows = records.length > 0;
  const topTypes = useMemo(
    () =>
      summary
        ? Object.entries(summary.types)
            .filter(([, count]) => count > 0)
            .slice(0, 4)
        : [],
    [summary],
  );

  return (
    <ProductRouteShell
      testId="route-shell-packs"
      tone="emerald"
      label="Packs"
      title="Pack activity"
      summary="Portfolio positions, market signals, proof roots, settlement, compensation, delivery, repair."
      icon={Package}
      metrics={[
        { label: "Rows", value: formatCount(summary?.total || records.length) },
        {
          label: "Positions",
          value: formatCount(marketIntelligence?.positions.length || 0),
        },
        {
          label: "Signals",
          value: formatCount(marketIntelligence?.signals.length || 0),
        },
        {
          label: "Settlement",
          value: formatCount(summary?.settlementReady || 0),
        },
        {
          label: "Compensation",
          value: formatCount(summary?.compensationReady || 0),
        },
      ]}
    >
      <ProductRouteEnterpriseSummary
        testId="packs-enterprise-economic-summary"
        tone="emerald"
        title="Enterprise economy overview"
        metrics={[
          {
            label: "Portfolio rows",
            value: formatCount(summary?.total || records.length),
            state: "activity",
            description: "Searchable source-safe PackActivity rows.",
          },
          {
            label: "Market signals",
            value: formatCount(marketIntelligence?.signals.length || 0),
            state: "demand/supply",
            description: "Reading demand, supply, settlement, and repair signals.",
          },
          {
            label: "Settlement ready",
            value: formatCount(summary?.settlementReady || 0),
            state: "quote/finality",
            description: "Rows with settlement posture ready for inspection.",
          },
          {
            label: "Compensation ready",
            value: formatCount(summary?.compensationReady || 0),
            state: "source-to-shares",
            description: "Rows with contributor/depositor allocation readback.",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200/80">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Portfolio positions
          </div>
          <div className="mt-4 grid gap-3 tablet:grid-cols-2">
            {(marketIntelligence?.positions || []).slice(0, 4).map((position) => (
              <button
                key={position.id}
                type="button"
                onClick={() =>
                  writeParams({
                    repository:
                      position.repository === "network"
                        ? null
                        : position.repository,
                    q: position.assetPackTitle,
                  })
                }
                className="min-h-[120px] border border-white/10 bg-black/18 p-3 text-left outline-none transition hover:border-emerald-300/35 focus-visible:ring-2 focus-visible:ring-emerald-300/55"
              >
                <span className="block truncate text-sm font-medium text-white">
                  {position.assetPackTitle}
                </span>
                <span className="mt-1 block truncate text-xs text-neutral-500">
                  {position.repository}
                </span>
                <span className="mt-3 grid grid-cols-3 gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                  <span>
                    <strong className="block font-mono text-neutral-100">
                      {position.activityCount}
                    </strong>
                    rows
                  </span>
                  <span>
                    <strong className="block font-mono text-neutral-100">
                      {formatCount(position.btdEstimate)}
                    </strong>
                    BTD
                  </span>
                  <span>
                    <strong className="block font-mono text-neutral-100">
                      {position.proofRootCount}
                    </strong>
                    roots
                  </span>
                </span>
                <span className="mt-3 block text-xs text-neutral-400">
                  {formatSats(position.valueTotalSats)}
                </span>
              </button>
            ))}
            {!marketIntelligence?.positions.length && (
              <ProductRouteStatePanel
                compact
                variant={isLoading ? "loading" : "empty"}
                title={isLoading ? "Reading portfolio" : "No positions yet"}
                message="Portfolio positions appear when pack activity has AssetPack identifiers."
              />
            )}
          </div>
        </div>

        <div className="border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200/80">
            <LineChart className="h-4 w-4" aria-hidden="true" />
            Market intelligence
          </div>
          <div className="mt-4 grid gap-3 tablet:grid-cols-2">
            {(marketIntelligence?.signals || []).slice(0, 4).map((signal) => (
              <button
                key={signal.id}
                type="button"
                onClick={() =>
                  writeParams({
                    q: signal.kind === "unfit-need" ? "unfit" : signal.kind,
                  })
                }
                className="min-h-[120px] border border-white/10 bg-black/18 p-3 text-left outline-none transition hover:border-emerald-300/35 focus-visible:ring-2 focus-visible:ring-emerald-300/55"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white">
                    {signal.label}
                  </span>
                  <span className="font-mono text-xs text-emerald-100">
                    {signal.strength}
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-xs leading-5 text-neutral-400">
                  {signal.description}
                </span>
                <span className="mt-3 block truncate text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                  {signal.repository || "network"} / {signal.state}
                </span>
              </button>
            ))}
            {!marketIntelligence?.signals.length && (
              <ProductRouteStatePanel
                compact
                variant={isLoading ? "loading" : "empty"}
                title={isLoading ? "Reading signals" : "No signals yet"}
                message="Demand, supply, settlement, compensation, delivery, and repair signals appear from source-safe activity."
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(marketIntelligence?.savedFilters || []).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => writeParams(filter.query)}
                className="inline-flex min-h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-300 transition hover:border-emerald-300/35 hover:text-emerald-100"
                title={filter.description}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.9fr)]">
        <div className="min-w-0 border border-white/10 bg-white/[0.035]">
          <div className="border-b border-white/10 px-4 py-3">
            <ProductRouteKeyboardHint
              testId="packs-keyboard-navigation"
              tone="emerald"
              shortcuts={[
                { keys: "Tab", label: "Move through filters, rows, and detail controls." },
                { keys: "Enter", label: "Select focused position, signal, filter, or activity row." },
                { keys: "Space", label: "Open or close expandable proof detail." },
              ]}
            />
          </div>
          <div className="grid gap-3 border-b border-white/10 p-4 laptop:grid-cols-[minmax(220px,1fr)_170px_150px_150px_auto]">
            <label className="relative min-w-0">
              <span className="sr-only">Search pack activity</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                aria-hidden="true"
              />
              <input
                value={search}
                onChange={(event) =>
                  writeParams({ q: event.currentTarget.value })
                }
                className="h-11 w-full border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-emerald-300/45"
                placeholder="Search titles, measurements, values, proof roots"
              />
            </label>
            <select
              value={type}
              onChange={(event) =>
                writeParams({ type: event.currentTarget.value })
              }
              className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none focus:border-emerald-300/45"
              aria-label="Activity type"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={state === "all" ? "" : state}
              onChange={(event) =>
                writeParams({ state: event.currentTarget.value || null })
              }
              className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-emerald-300/45"
              placeholder="State"
              aria-label="State filter"
            />
            <select
              value={sort}
              onChange={(event) =>
                writeParams({ sort: event.currentTarget.value })
              }
              className="h-11 border border-white/10 bg-black/30 px-3 text-sm text-neutral-200 outline-none focus:border-emerald-300/45"
              aria-label="Sort column"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                writeParams({ direction: direction === "asc" ? "desc" : "asc" })
              }
              className="inline-flex h-11 items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16"
            >
              {direction === "asc" ? (
                <ArrowUpWideNarrow className="h-4 w-4" />
              ) : (
                <ArrowDownWideNarrow className="h-4 w-4" />
              )}
              {direction}
            </button>
          </div>

          <div className="grid gap-3 border-b border-white/10 px-4 pb-4 tablet:grid-cols-4">
            {[
              ["settlementState", "Settlement facet"],
              ["compensationState", "Compensation facet"],
              ["deliveryState", "Delivery facet"],
              ["repairState", "Repair facet"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={readParam(routeParams, key, "all") === "all" ? "" : readParam(routeParams, key)}
                onChange={(event) =>
                  writeParams({ [key]: event.currentTarget.value || null })
                }
                className="h-10 border border-white/10 bg-black/30 px-3 text-xs text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-emerald-300/45"
                placeholder={label}
                aria-label={label}
              />
            ))}
          </div>

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
                      className={`transition ${record.id === selectedId ? "bg-emerald-400/[0.08]" : "hover:bg-white/[0.035]"}`}
                    >
                      <td className="max-w-[420px] border-b border-white/8 px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => writeParams({ detailId: record.id })}
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
                        {record.values[0]
                          ? `${record.values[0].amount} ${record.values[0].unit}`
                          : record.measurements[0]
                            ? `${record.measurements[0].value} ${record.measurements[0].unit || ""}`
                            : "not measured"}
                      </td>
                      <td className="border-b border-white/8 px-4 py-4 align-top">
                        {statusPill(record.settlementState)}
                      </td>
                      <td className="border-b border-white/8 px-4 py-4 align-top">
                        {statusPill(record.deliveryState)}
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
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-300 transition hover:border-emerald-300/30 hover:text-emerald-100"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        <aside className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
          {detail ? (
            <div className="grid gap-5">
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

              <DetailSection title="Overview">
                <dl className="grid gap-3 text-sm tablet:grid-cols-2">
                  <div>
                    <dt className="text-neutral-500">Type</dt>
                    <dd className="mt-1 text-neutral-100">
                      {formatType(detail.type)}
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
                </dl>
              </DetailSection>

              <DetailSection title="Measurements">
                <div className="grid gap-2">
                  {detail.measurements.length ? (
                    detail.measurements.map((measurement) => (
                      <div
                        key={`${measurement.id}:${measurement.value}`}
                        className="flex items-center justify-between gap-3 border border-white/10 bg-black/18 px-3 py-2 text-sm"
                      >
                        <span className="text-neutral-400">
                          {measurement.label}
                        </span>
                        <span className="font-mono text-neutral-100">
                          {measurement.value} {measurement.unit || ""}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">
                      No source-safe measurements recorded.
                    </p>
                  )}
                </div>
              </DetailSection>

              <DetailSection title="State readback">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    {statusPill(
                      detail.states.settlement,
                      "settlement not recorded",
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {statusPill(
                      detail.states.rights,
                      "BTD rights not recorded",
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {statusPill(
                      detail.states.compensation,
                      "compensation not recorded",
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {statusPill(
                      detail.states.delivery,
                      "delivery not recorded",
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {statusPill(detail.states.repair, "repair not recorded")}
                  </div>
                </div>
              </DetailSection>

              {detail.commodityState?.repairRequired ||
              detail.commodityState?.blockers?.length ? (
                <DetailSection title="Repair surface">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      {statusPill(
                        detail.states.repair || "repair-required",
                        "repair posture pending",
                      )}
                    </div>
                    <ul className="grid gap-1 text-xs text-neutral-400">
                      {(detail.commodityState?.blockers || []).map((blocker) => (
                        <li key={blocker} className="break-words">
                          {blocker}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-neutral-500">
                      State advances only through proof-backed readback; repair
                      fails closed until the missing or contradictory evidence
                      above is reconciled.
                    </p>
                  </div>
                </DetailSection>
              ) : null}

              {detail.accounting && (
                <DetailSection title="Accounting">
                  <dl className="grid gap-3 text-sm tablet:grid-cols-2">
                    <div>
                      <dt className="text-neutral-500">BTD/BTC state</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.accounting.state || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">BTD range</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.accounting.btdRangeState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">BTC settlement</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.accounting.btcSettlementState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Treasury route</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.accounting.treasuryRouteState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Contributors</dt>
                      <dd className="mt-1 font-mono text-neutral-100">
                        {detail.accounting.contributorCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Allocated</dt>
                      <dd className="mt-1 font-mono text-neutral-100">
                        {formatSats(detail.accounting.allocatedContributorSats)}
                      </dd>
                    </div>
                    {detail.accounting.statementRoot && (
                      <div className="tablet:col-span-2">
                        <dt className="text-neutral-500">Accounting root</dt>
                        <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
                          {detail.accounting.statementRoot}
                        </dd>
                      </div>
                    )}
                  </dl>
                </DetailSection>
              )}

              {detail.governance && (
                <DetailSection title="Governance">
                  <dl className="grid gap-3 text-sm tablet:grid-cols-2">
                    <div>
                      <dt className="text-neutral-500">Authority</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.governance.state || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Route</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.governance.route || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Wallet</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.governance.walletState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Spend</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.governance.spendState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Deposit</dt>
                      <dd className="mt-1 text-neutral-100">
                        {detail.governance.depositState || "not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Required denials</dt>
                      <dd className="mt-1 font-mono text-neutral-100">
                        {detail.governance.requiredDeniedActionCount}
                      </dd>
                    </div>
                    {detail.governance.authorityRoot && (
                      <div className="tablet:col-span-2">
                        <dt className="text-neutral-500">Authority root</dt>
                        <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
                          {detail.governance.authorityRoot}
                        </dd>
                      </div>
                    )}
                  </dl>
                </DetailSection>
              )}

              <DetailSection title="Proof roots">
                <ProductRouteProofDetail
                  testId="packs-expandable-proof-detail"
                  title="Expandable proof detail"
                  tone="emerald"
                  defaultOpen
                  roots={[
                    ...detail.proofRoots.map((proofRoot) => ({
                      id: proofRoot.id,
                      label: proofRoot.label,
                      root: proofRoot.root,
                    })),
                    {
                      id: "accounting-root",
                      label: "Accounting root",
                      root: detail.accounting?.statementRoot,
                    },
                    {
                      id: "authority-root",
                      label: "Authority root",
                      root: detail.governance?.authorityRoot,
                    },
                  ]}
                />
              </DetailSection>
            </div>
          ) : (
            <div className="py-12">
              <ProductRouteStatePanel
                variant="empty"
                title="No activity selected"
                message="Choose a row to inspect measurements, proof roots, settlement, compensation, delivery, and repair."
              />
            </div>
          )}
        </aside>
      </section>
    </ProductRouteShell>
  );
}
