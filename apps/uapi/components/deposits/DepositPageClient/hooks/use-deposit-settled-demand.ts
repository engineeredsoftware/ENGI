/**
 * Load settled-Depository demand for the selected deposit repository.
 * Fail closed to Unestimatable — never invent demand percentages.
 */
"use client";

import { useEffect, useState } from "react";
import {
  EMPTY_SETTLED_DEMAND_SIGNALS,
  unestimatableDemand,
  type DepositSettledDemandEstimate,
  type DepositSettledDemandSignals,
} from "@/components/deposits/models/deposit-settled-demand";

export function useDepositSettledDemand(
  repositoryFullName: string | null | undefined,
) {
  const [settledDemandEstimate, setSettledDemandEstimate] =
    useState<DepositSettledDemandEstimate | null>(null);
  const [settledDemandSignals, setSettledDemandSignals] =
    useState<DepositSettledDemandSignals>(EMPTY_SETTLED_DEMAND_SIGNALS);

  useEffect(() => {
    let cancelled = false;
    const fullName = repositoryFullName || "";
    const params = new URLSearchParams();
    if (fullName) params.set("repositoryFullName", fullName);
    void (async () => {
      try {
        const res = await fetch(
          `/api/deposit/demand-estimate?${params.toString()}`,
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok || !data?.estimate) {
          setSettledDemandEstimate(
            unestimatableDemand(
              typeof data?.error === "string"
                ? data.error
                : "Unestimatable: could not load settled Depository demand.",
            ),
          );
          setSettledDemandSignals(EMPTY_SETTLED_DEMAND_SIGNALS);
          return;
        }
        setSettledDemandEstimate(data.estimate);
        setSettledDemandSignals(
          data.signals || EMPTY_SETTLED_DEMAND_SIGNALS,
        );
      } catch {
        if (cancelled) return;
        setSettledDemandEstimate(
          unestimatableDemand(
            "Unestimatable: settled Depository demand request failed.",
          ),
        );
        setSettledDemandSignals(EMPTY_SETTLED_DEMAND_SIGNALS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repositoryFullName]);

  return { settledDemandEstimate, settledDemandSignals };
}
