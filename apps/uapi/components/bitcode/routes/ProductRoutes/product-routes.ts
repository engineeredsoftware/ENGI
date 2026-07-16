/**
 * Canonical product route constants and href builders for the website
 * experiences (Packs, Reads, Deposits).
 *
 * V48 law: launch entrypoints are `/packs`, `/reads`, `/deposits` — not the
 * retired `/packs` cockpit. Shared selection/history models and page shells
 * must import from here (or Bitcode re-exports), never invent parallel route
 * strings in experience code.
 *
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 * @see .docs/BITCODE_FRONTEND_ARCHITECTURE.md
 */

/** Packs dashboard — post-auth default and exchange activity surface. */
export const PACKS_ROUTE = '/packs' as const;

/** Reads experience (plural product route). */
export const READS_ROUTE = '/reads' as const;

/** Deposits experience (plural product route). */
export const DEPOSITS_ROUTE = '/deposits' as const;

function buildRouteHref(
  route: string,
  params?: URLSearchParams | string | null,
): string {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${route}?${query}` : route;
}

export function buildPacksHref(params?: URLSearchParams | string | null): string {
  return buildRouteHref(PACKS_ROUTE, params);
}

export function buildReadsHref(params?: URLSearchParams | string | null): string {
  return buildRouteHref(READS_ROUTE, params);
}

export function buildDepositsHref(
  params?: URLSearchParams | string | null,
): string {
  return buildRouteHref(DEPOSITS_ROUTE, params);
}

export function buildExchangeHref(
  params?: URLSearchParams | string | null,
): string {
  return buildPacksHref(params);
}
