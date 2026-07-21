/**
 * Canonical product route constants and href builders for the website
 * experiences (Exchange, Reads, Deposits).
 *
 * V48 law: launch entrypoints are `/exchange`, `/reads`, `/deposits`.
 * `/packs` remains a compatibility redirect into Exchange (retired product name).
 * Commodity language **AssetPack** is unchanged and is not a product route name.
 *
 * Shared selection/history models and page shells must import from here (or
 * Bitcode re-exports), never invent parallel route strings in experience code.
 *
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 * @see .docs/BITCODE_SOURCE_LAYOUT.md
 */

/** Exchange activity surface — durable AssetPack portfolio / activity reread. */
export const EXCHANGE_ROUTE = '/exchange' as const;

/**
 * @deprecated Product name is Exchange. Prefer {@link EXCHANGE_ROUTE}.
 * `/packs` is retained only as a compatibility redirect.
 */
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

export function buildExchangeHref(
  params?: URLSearchParams | string | null,
): string {
  return buildRouteHref(EXCHANGE_ROUTE, params);
}

/**
 * @deprecated Prefer {@link buildExchangeHref}. Builds `/packs` only for
 * rare compat surfaces that must still emit the legacy path.
 */
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

/** True when pathname is the Exchange experience (canonical or packs compat). */
export function isExchangePathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === EXCHANGE_ROUTE ||
    pathname.startsWith(`${EXCHANGE_ROUTE}/`) ||
    pathname === PACKS_ROUTE ||
    pathname.startsWith(`${PACKS_ROUTE}/`)
  );
}
