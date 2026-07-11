/**
 * Canonical product route constants and href builders for the website
 * experiences (Packs, Reads, Deposits).
 *
 * V48 law: launch entrypoints are `/packs`, `/reads`, `/deposits` — not the
 * retired `/terminal` cockpit. Shared selection/history models and page shells
 * must import from here (or Bitcode re-exports), never invent parallel route
 * strings in experience code.
 *
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 * @see internal-docs/BITCODE_FRONTEND_ARCHITECTURE.md
 */

/** Packs dashboard — post-auth default and exchange activity surface. */
export const PACKS_ROUTE = '/packs' as const;

/** Reads experience (plural product route). */
export const READS_ROUTE = '/reads' as const;

/** Deposits experience (plural product route). */
export const DEPOSITS_ROUTE = '/deposits' as const;

/**
 * Compatibility aliases matching historical singular export names used by
 * deposit/read clients during the Terminal → experience migration.
 * Prefer `READS_ROUTE` / `DEPOSITS_ROUTE` in new code.
 */
export const READ_ROUTE = READS_ROUTE;
export const DEPOSIT_ROUTE = DEPOSITS_ROUTE;

/** Historical alias: Exchange activity resolves to Packs. */
export const EXCHANGE_ROUTE = PACKS_ROUTE;

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

/** @deprecated Prefer `buildReadsHref` — kept for call-site migration. */
export function buildReadHref(params?: URLSearchParams | string | null): string {
  return buildReadsHref(params);
}

export function buildDepositsHref(
  params?: URLSearchParams | string | null,
): string {
  return buildRouteHref(DEPOSITS_ROUTE, params);
}

/** @deprecated Prefer `buildDepositsHref` — kept for call-site migration. */
export function buildDepositHref(
  params?: URLSearchParams | string | null,
): string {
  return buildDepositsHref(params);
}

export function buildExchangeHref(
  params?: URLSearchParams | string | null,
): string {
  return buildPacksHref(params);
}
