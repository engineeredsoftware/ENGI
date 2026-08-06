/**
 * Deposit route search-param helpers — stage, selected pipeline transaction id.
 */
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { readDepositRouteStage } from "@/components/deposits/models/deposit-route-model";
import { readProductTransactionId } from "@/components/bitcode/pipeline/models/pipeline-selection-query";

export function useDepositRouteParams() {
  const searchParams = useSearchParams();
  const routeSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedTransactionId = useMemo(
    () => readProductTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const routeDepositStage = useMemo(
    () => readDepositRouteStage(routeSearchParams),
    [routeSearchParams],
  );
  return { searchParams, routeSearchParams, selectedTransactionId, routeDepositStage };
}
