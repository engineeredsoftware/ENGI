/**
 * Fetch and refresh network-scope PackActivity for /exchange (compat /exchange).
 * Scope is always network (Depository ledger), never personal pipelines.
 *
 * Deposit/Read parity: list fetch is independent of drill-in detailId so
 * master↔detail navigation never reloads the table (no isLoading flash).
 * Detail projection is derived client-side from the cached records.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPackActivityDetailProjection,
  type PackActivityDetailProjection,
  type PackActivityRecord,
  type PackActivitySummary,
  type PackPortfolioMarketIntelligence,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import type { PacksActivityPayload } from "@/components/exchange/models/exchange-activity-types";

/** Params that shape the list query — never include detailId (selection only). */
function listQueryString(routeParams: URLSearchParams): string {
  const params = new URLSearchParams(routeParams);
  params.delete("detailId");
  params.set("limit", params.get("limit") || "80");
  params.set("scope", "network");
  return params.toString();
}

export function useExchangeActivity(
  routeParams: URLSearchParams,
  detailId: string | null = null,
) {
  const [records, setRecords] = useState<PackActivityRecord[]>([]);
  const [summary, setSummary] = useState<PackActivitySummary | null>(null);
  const [marketIntelligence, setMarketIntelligence] =
    useState<PackPortfolioMarketIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable list key: filter/sort only — opening/closing detail does not re-key.
  const listKey = useMemo(() => listQueryString(routeParams), [routeParams]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/packs/activity?${listKey}`, {
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as PacksActivityPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to read pack activity.");
      }
      setRecords(payload.records || []);
      setSummary(payload.summary || null);
      setMarketIntelligence(payload.marketIntelligence || null);
    } catch (loadError) {
      setRecords([]);
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
  }, [listKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Drill-in detail from cached rows (no network, no list isLoading).
  const detail = useMemo((): PackActivityDetailProjection | null => {
    if (!detailId) return null;
    const selected = records.find((record) => record.id === detailId);
    if (!selected) return null;
    return buildPackActivityDetailProjection(selected);
  }, [detailId, records]);

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
