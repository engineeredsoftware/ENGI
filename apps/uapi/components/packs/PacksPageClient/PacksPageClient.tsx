"use client";

/**
 * Packs experience page client — thin orchestration for /packs.
 *
 * Deposit/Read parity: compact ProductRouteShell header metrics + drill-in
 * master-detail (table master → select AssetPack row → rich detail + Back).
 * Network-scope PackActivity only. Fetch in `use-packs-activity`; URL in
 * `use-packs-route-params`.
 */

import React, { useCallback, useMemo } from "react";
import { Package } from "lucide-react";

import { ProductRouteShell } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { ProductDetailStage } from "@/components/bitcode/routes/ProductRouteEntrance/ProductRouteEntrance";
import { formatCount } from "@/components/packs/models/packs-format";
import { usePacksActivity } from "./hooks/use-packs-activity";
import { usePacksRouteParams } from "./hooks/use-packs-route-params";
import { PacksActivityMaster } from "@/components/packs/PacksActivityMaster/PacksActivityMaster";
import { PacksActivityDetail } from "@/components/packs/PacksActivityDetail/PacksActivityDetail";
import { PacksPortfolioStrip } from "@/components/packs/PacksPortfolioStrip/PacksPortfolioStrip";
import { useUserData } from "@/hooks/useUserData";

export default function PacksPageClient() {
  const { walletConnectionStatus, data: userData } = useUserData();
  const viewerEthereumAddress =
    walletConnectionStatus?.address ||
    (typeof (userData as { profile?: { wallet_address?: string } } | null)?.profile
      ?.wallet_address === 'string'
      ? (userData as { profile: { wallet_address: string } }).profile.wallet_address
      : null);
  const {
    routeParams,
    search,
    type,
    state,
    sort,
    direction,
    detailId,
    writeParams,
  } = usePacksRouteParams();

  const {
    records,
    detail,
    summary,
    marketIntelligence,
    isLoading,
    error,
    refresh,
  } = usePacksActivity(routeParams);

  // Drill-in selection is URL-driven only (deposit/read twin) — do not
  // auto-open the first row into detail on list view.
  const isDetailOpen = Boolean(detailId);
  const selectedId = detailId || null;
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

  const closeDetail = useCallback(() => {
    writeParams({ detailId: null });
  }, [writeParams]);

  return (
    <ProductRouteShell
      testId="route-shell-packs"
      tone="emerald"
      label="Packs"
      title="Pack activity"
      summary="Network AssetPack ledger: select a row for source-safe proof, settlement, compensation, and delivery."
      icon={Package}
      // Hold chips until activity summary loads so the set enters once.
      metricsReady={!isLoading}
      metrics={[
        {
          label: "Rows",
          description:
            "How many PackActivity rows match the current filters in the network ledger.",
          value: formatCount(summary?.total || records.length),
        },
        {
          label: "Positions",
          description:
            "Distinct AssetPack portfolio positions derived from network activity.",
          value: formatCount(marketIntelligence?.positions.length || 0),
        },
        {
          label: "Signals",
          description:
            "Market intelligence signals (demand, supply, settlement, repair).",
          value: formatCount(marketIntelligence?.signals.length || 0),
        },
        {
          label: "Settlement",
          description: "Rows with settlement posture ready for inspection.",
          value: formatCount(summary?.settlementReady || 0),
        },
        {
          label: "Compensation",
          description:
            "Rows with contributor/depositor allocation readback ready.",
          value: formatCount(summary?.compensationReady || 0),
        },
      ]}
    >
      <PacksActivityMaster
        isDetailOpen={isDetailOpen}
        onCloseDetail={closeDetail}
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

      <ProductDetailStage
        open={!isDetailOpen}
        stageKey="packs-portfolio"
        className="min-w-0"
      >
        <PacksPortfolioStrip
          marketIntelligence={marketIntelligence}
          isLoading={isLoading}
          onWriteParams={writeParams}
        />
      </ProductDetailStage>

      <ProductDetailStage
        open={isDetailOpen}
        stageKey={selectedId || "packs-detail"}
        testId="packs-run-detail"
        className="grid min-w-0 gap-4 phone:gap-5 laptop:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.55fr)]"
      >
        <PacksActivityDetail
          detail={detail}
          layout="main"
          viewerEthereumAddress={viewerEthereumAddress}
          onPayoutFinalized={() => void refresh()}
        />
        <PacksActivityDetail detail={detail} layout="aside" />
      </ProductDetailStage>
    </ProductRouteShell>
  );
}
