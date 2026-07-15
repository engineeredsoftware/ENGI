/**
 * Fetch and refresh network-scope PackActivity for /packs.
 * Scope is always network (Depository ledger), never personal pipelines.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  PackActivityDetailProjection,
  PackActivityRecord,
  PackActivitySummary,
  PackPortfolioMarketIntelligence,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import type { PacksActivityPayload } from "@/components/packs/models/packs-activity-types";

export function usePacksActivity(routeParams: URLSearchParams) {
  const [records, setRecords] = useState<PackActivityRecord[]>([]);
  const [detail, setDetail] = useState<PackActivityDetailProjection | null>(
    null,
  );
  const [summary, setSummary] = useState<PackActivitySummary | null>(null);
  const [marketIntelligence, setMarketIntelligence] =
    useState<PackPortfolioMarketIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams(routeParams);
    params.set("limit", params.get("limit") || "80");
    // /packs is ALWAYS the network-scope AssetPack ledger — never personal
    // pipeline activity (that is /deposits).
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

  return {
    records,
    detail,
    summary,
    marketIntelligence,
    isLoading,
    error,
    refresh,
  };
}
