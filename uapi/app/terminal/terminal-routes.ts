/**
 * @deprecated Compatibility shim. Import product routes from
 * `@/components/bitcode/routes/product-routes` instead.
 *
 * `TERMINAL_ROUTE` / `buildTerminalHref` remain only for residual Terminal
 * cockpit code during eradication. New code must not use them.
 */

export {
  PACKS_ROUTE,
  READS_ROUTE,
  DEPOSITS_ROUTE,
  READ_ROUTE,
  DEPOSIT_ROUTE,
  EXCHANGE_ROUTE,
  buildPacksHref,
  buildReadsHref,
  buildReadHref,
  buildDepositsHref,
  buildDepositHref,
  buildExchangeHref,
} from '@/components/bitcode/routes/product-routes';

/** @deprecated Terminal cockpit route — redirect-only after eradication. */
export const TERMINAL_ROUTE = '/terminal' as const;

/** @deprecated Prefer `buildPacksHref` or experience-specific builders. */
export function buildTerminalHref(params?: URLSearchParams | string | null) {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${TERMINAL_ROUTE}?${query}` : TERMINAL_ROUTE;
}
