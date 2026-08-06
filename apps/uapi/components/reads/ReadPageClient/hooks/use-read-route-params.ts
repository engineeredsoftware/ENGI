/**
 * Reads route search-param helpers — stage, selected pipeline transaction id,
 * and purchase-flow intent from Exchange continue-to-settle CTA.
 */
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { readReadRouteStage } from "@/components/reads/models/read-route-model";
import { readProductTransactionId } from "@/components/bitcode/pipeline/models/pipeline-selection-query";

export type ReadPurchaseIntent = {
  active: boolean;
  exchangeActivityId: string | null;
  synthesisRunId: string | null;
  selectedIndex: number | null;
  packTitle: string | null;
};

export function parseReadPurchaseIntent(
  params: URLSearchParams,
): ReadPurchaseIntent {
  const intent = (params.get("intent") || "").toLowerCase();
  const synthesisRunId = params.get("synthesisRunId");
  const exchangeActivityId = params.get("exchangeActivityId");
  const selectedRaw = params.get("selectedIndex");
  const selectedIndex =
    selectedRaw != null && selectedRaw !== "" && Number.isFinite(Number(selectedRaw))
      ? Number(selectedRaw)
      : null;
  const packTitle = params.get("packTitle");
  const active =
    intent === "purchase" ||
    Boolean(synthesisRunId) ||
    Boolean(exchangeActivityId);
  return {
    active,
    exchangeActivityId: exchangeActivityId || null,
    synthesisRunId: synthesisRunId || null,
    selectedIndex,
    packTitle: packTitle || null,
  };
}

export function useReadRouteParams() {
  const searchParams = useSearchParams();
  const routeSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedTransactionId = useMemo(
    () => readProductTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const routeReadingStage = useMemo(
    () => readReadRouteStage(routeSearchParams),
    [routeSearchParams],
  );
  const purchaseIntent = useMemo(
    () => parseReadPurchaseIntent(routeSearchParams),
    [routeSearchParams],
  );
  return {
    searchParams,
    routeSearchParams,
    selectedTransactionId,
    routeReadingStage,
    purchaseIntent,
  };
}
