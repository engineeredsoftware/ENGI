/**
 * Packs URL search-param read/write helpers for the page client.
 * Mirrors deposits/reads route-param hooks: parent owns navigation only.
 */
"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
  PackActivityType,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { readParam } from "@/components/packs/models/packs-format";

export function usePacksRouteParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  );

  const search = readParam(routeParams, "q");
  const type = readParam(routeParams, "type", "all") as
    | PackActivityType
    | "all";
  const state = readParam(routeParams, "state", "all");
  const sort = readParam(
    routeParams,
    "sort",
    "timestamp",
  ) as PackActivitySortKey;
  const direction = readParam(
    routeParams,
    "direction",
    "desc",
  ) as PackActivitySortDirection;
  const detailId = readParam(routeParams, "detailId");

  const writeParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(routeParams);
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, routeParams, router],
  );

  return {
    routeParams,
    search,
    type,
    state,
    sort,
    direction,
    detailId,
    writeParams,
  };
}
