/**
 * Reads URL search-param helpers.
 *
 * Opening a pipeline detail **pushes** history so the browser Back button
 * returns to the /reads list. Closing detail and other query edits **replace**.
 */
"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildReadsHref } from "@/components/bitcode/routes/ProductRoutes/product-routes";
import {
  clearPipelineTransactionId,
  writePipelineTransactionId,
} from "@/components/bitcode/pipeline/models/pipeline-selection-query";

const READS_ROUTE = "/reads";

export function useReadUrlNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const readCurrentSearchParams = useCallback(
    () =>
      typeof window !== "undefined" && window.location.pathname === READS_ROUTE
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const replaceReadSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.replace(buildReadsHref(query), { scroll: false });
    },
    [router],
  );

  const pushReadSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.push(buildReadsHref(query), { scroll: false });
    },
    [router],
  );

  /**
   * Open pipeline detail. Pushes history so native browser Back returns to /reads.
   */
  const openReadRouteTransaction = useCallback(
    (transactionId: string) => {
      pushReadSearchParams(
        writePipelineTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [pushReadSearchParams, readCurrentSearchParams],
  );

  /**
   * Attach a live synthesis run id in-place (no history push).
   * Avoids remounting the page client mid-run (deposit stability twin).
   */
  const attachLiveReadRun = useCallback(
    (transactionId: string) => {
      replaceReadSearchParams(
        writePipelineTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [readCurrentSearchParams, replaceReadSearchParams],
  );

  const closePipelineDetail = useCallback(() => {
    replaceReadSearchParams(
      clearPipelineTransactionId(readCurrentSearchParams()),
    );
  }, [readCurrentSearchParams, replaceReadSearchParams]);

  return {
    searchParams,
    readCurrentSearchParams,
    replaceReadSearchParams,
    pushReadSearchParams,
    openReadRouteTransaction,
    attachLiveReadRun,
    closePipelineDetail,
  };
}
