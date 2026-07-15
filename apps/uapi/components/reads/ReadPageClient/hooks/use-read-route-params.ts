/**
 * Reads route search-param helpers — stage and selected pipeline transaction id.
 */
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { readReadRouteStage } from "@/components/reads/models/read-route-model";
import { readTerminalTransactionId } from "@/components/bitcode/pipeline/models/pipeline-selection-query";

export function useReadRouteParams() {
  const searchParams = useSearchParams();
  const routeSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedTransactionId = useMemo(
    () => readTerminalTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const routeReadingStage = useMemo(
    () => readReadRouteStage(routeSearchParams),
    [routeSearchParams],
  );
  return { searchParams, routeSearchParams, selectedTransactionId, routeReadingStage };
}
