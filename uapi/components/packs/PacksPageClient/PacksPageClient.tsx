"use client";

/**
 * Packs experience page client — thin orchestration for /packs.
 *
 * Network-scope PackActivity master-detail: portfolio overview, filters/table,
 * and source-safe detail. Data fetch lives in `use-packs-activity`.
 */

import React, { useCallback, useMemo } from "react";
import { Package } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ProductRouteEnterpriseSummary,
  ProductRouteShell,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatCount,
  readParam,
} from "@/components/packs/models/packs-format";
import { usePacksActivity } from "./hooks/use-packs-activity";
import { PacksPortfolioOverview } from "@/components/packs/PacksPortfolioOverview/PacksPortfolioOverview";
import { PacksActivityMaster } from "@/components/packs/PacksActivityMaster/PacksActivityMaster";
import { PacksActivityDetail } from "@/components/packs/PacksActivityDetail/PacksActivityDetail";

export default function PacksPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  );

  const {
    records,
    detail,
    summary,
    marketIntelligence,
    isLoading,
    error,
    refresh,
  } = usePacksActivity(routeParams);

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
            description:
              "Reading demand, supply, settlement, and repair signals.",
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
            description:
              "Rows with contributor/depositor allocation readback.",
          },
        ]}
      />

      <PacksPortfolioOverview
        marketIntelligence={marketIntelligence}
        isLoading={isLoading}
        onWriteParams={writeParams}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.9fr)]">
        <PacksActivityMaster
          routeParams={routeParams}
          search={search}
          type={type}
          state={state}
          sort={sort}
          direction={direction}
          records={records}
          selectedId={selectedId}
          isLoading={isLoading}
          error={error}
          topTypes={topTypes}
          hasRows={hasRows}
          onWriteParams={writeParams}
          onRefresh={() => {
            void refresh();
          }}
        />
        <PacksActivityDetail detail={detail} />
      </section>
    </ProductRouteShell>
  );
}
