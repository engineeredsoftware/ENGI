/**
 * Deposit URL search-param helpers.
 *
 * Opening a pipeline detail **pushes** history so the browser Back button
 * returns to the /deposits list (without transactionId). In-place query edits
 * (repo, stage flags) and closing detail **replace** so they do not stack.
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

  const pushDepositSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.push(buildDepositHref(query), { scroll: false });
    },
    [router],
  );

  /**
   * Open historical or live pipeline detail. Pushes a history entry so native
   * browser Back returns to the deposits list (or prior query without transactionId).
   */
  const openDepositRouteTransaction = useCallback(
    (transactionId: string) => {
      pushDepositSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [pushDepositSearchParams, readCurrentSearchParams],
  );

  /** @deprecated Prefer openDepositRouteTransaction (push, not replace). */
  const replaceDepositRouteTransaction = openDepositRouteTransaction;

  /** Close detail: strip transactionId without adding another history step. */
  const clearDepositRouteTransaction = useCallback(() => {
    replaceDepositSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
  }, [readCurrentSearchParams, replaceDepositSearchParams]);

  return {
    searchParams,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    pushDepositSearchParams,
    openDepositRouteTransaction,
    replaceDepositRouteTransaction,
    clearDepositRouteTransaction,
  };
}
