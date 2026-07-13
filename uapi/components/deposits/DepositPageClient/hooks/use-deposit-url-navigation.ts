/**
 * Deposit URL search-param helpers: replace route query and transaction selection.
 */
"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildDepositHref,
  DEPOSIT_ROUTE,
} from "@/components/bitcode/routes/ProductRoutes/product-routes";
import {
  clearTerminalTransactionId,
  writeTerminalTransactionId,
} from "@/components/bitcode/pipeline/models/pipeline-selection-query";

export function useDepositUrlNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const readCurrentSearchParams = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.location.pathname === DEPOSIT_ROUTE
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const replaceDepositSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.replace(buildDepositHref(query), { scroll: false });
    },
    [router],
  );

  const replaceDepositRouteTransaction = useCallback(
    (transactionId: string) => {
      replaceDepositSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [readCurrentSearchParams, replaceDepositSearchParams],
  );

  const clearDepositRouteTransaction = useCallback(() => {
    replaceDepositSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
  }, [readCurrentSearchParams, replaceDepositSearchParams]);

  return {
    searchParams,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    replaceDepositRouteTransaction,
    clearDepositRouteTransaction,
  };
}
