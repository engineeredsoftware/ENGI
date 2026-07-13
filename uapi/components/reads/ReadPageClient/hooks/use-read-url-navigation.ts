/**
 * Reads URL search-param helpers: replace route query and transaction selection.
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

  const replaceReadRouteTransaction = useCallback(
    (transactionId: string) => {
      replaceReadSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [readCurrentSearchParams, replaceReadSearchParams],
  );

  const closePipelineDetail = useCallback(() => {
    replaceReadSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
  }, [readCurrentSearchParams, replaceReadSearchParams]);

  return {
    searchParams,
    readCurrentSearchParams,
    replaceReadSearchParams,
    replaceReadRouteTransaction,
    closePipelineDetail,
  };
}
