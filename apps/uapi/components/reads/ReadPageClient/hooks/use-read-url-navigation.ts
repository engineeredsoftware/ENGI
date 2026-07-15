/**
 * Reads URL search-param helpers.
 *
 * Opening a pipeline detail **pushes** history so the browser Back button
 * returns to the /reads list. Closing detail and other query edits **replace**.
 */
"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildReadHref } from "@/components/bitcode/routes/ProductRoutes/product-routes";
import {
  clearTerminalTransactionId,
  writeTerminalTransactionId,
} from "@/components/bitcode/pipeline/models/pipeline-selection-query";

const READ_ROUTE = "/reads";

export function useReadUrlNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const readCurrentSearchParams = useCallback(
    () =>
      typeof window !== "undefined" && window.location.pathname === READ_ROUTE
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const replaceReadSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.replace(buildReadHref(query), { scroll: false });
    },
    [router],
  );

  const pushReadSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.push(buildReadHref(query), { scroll: false });
    },
    [router],
  );

  /**
   * Open pipeline detail. Pushes history so native browser Back returns to /reads.
   */
  const openReadRouteTransaction = useCallback(
    (transactionId: string) => {
      pushReadSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [pushReadSearchParams, readCurrentSearchParams],
  );

  /** @deprecated Prefer openReadRouteTransaction (push, not replace). */
  const replaceReadRouteTransaction = openReadRouteTransaction;

  const closePipelineDetail = useCallback(() => {
    replaceReadSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
  }, [readCurrentSearchParams, replaceReadSearchParams]);

  return {
    searchParams,
    readCurrentSearchParams,
    replaceReadSearchParams,
    pushReadSearchParams,
    openReadRouteTransaction,
    replaceReadRouteTransaction,
    closePipelineDetail,
  };
}
