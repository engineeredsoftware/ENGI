export const TERMINAL_ROUTE = '/terminal' as const;
export const PACKS_ROUTE = '/packs' as const;
export const READ_ROUTE = '/reads' as const;
export const DEPOSIT_ROUTE = '/deposits' as const;
export const EXCHANGE_ROUTE = PACKS_ROUTE;

export function buildTerminalHref(params?: URLSearchParams | string | null) {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${TERMINAL_ROUTE}?${query}` : TERMINAL_ROUTE;
}

export function buildPacksHref(params?: URLSearchParams | string | null) {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${PACKS_ROUTE}?${query}` : PACKS_ROUTE;
}

export function buildReadHref(params?: URLSearchParams | string | null) {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${READ_ROUTE}?${query}` : READ_ROUTE;
}

export function buildDepositHref(params?: URLSearchParams | string | null) {
  const query = typeof params === 'string' ? params : params?.toString();
  return query ? `${DEPOSIT_ROUTE}?${query}` : DEPOSIT_ROUTE;
}

export function buildExchangeHref(params?: URLSearchParams | string | null) {
  return buildPacksHref(params);
}
