/**
 * Product route helpers — canonical launch entrypoints for Packs / Reads / Deposits.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
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
} from '@/components/bitcode/routes/ProductRoutes/product-routes';

describe('product-routes', () => {
  it('exposes plural product routes as the canonical paths', () => {
    expect(PACKS_ROUTE).toBe('/packs');
    expect(READS_ROUTE).toBe('/reads');
    expect(DEPOSITS_ROUTE).toBe('/deposits');
  });

  it('keeps singular aliases equal to plural product routes', () => {
    expect(READ_ROUTE).toBe(READS_ROUTE);
    expect(DEPOSIT_ROUTE).toBe(DEPOSITS_ROUTE);
    expect(EXCHANGE_ROUTE).toBe(PACKS_ROUTE);
  });

  it('builds hrefs with and without query strings', () => {
    expect(buildPacksHref()).toBe('/packs');
    expect(buildReadsHref('transactionId=run-1')).toBe('/reads?transactionId=run-1');
    expect(buildDepositsHref(new URLSearchParams({ stage: 'source' }))).toBe(
      '/deposits?stage=source',
    );
  });

  it('keeps deprecated singular builders identical to plural builders', () => {
    const params = 'transactionId=abc';
    expect(buildReadHref(params)).toBe(buildReadsHref(params));
    expect(buildDepositHref(params)).toBe(buildDepositsHref(params));
    expect(buildExchangeHref(params)).toBe(buildPacksHref(params));
  });

  it('does not export Terminal route helpers', async () => {
    const mod = await import('@/components/bitcode/routes/ProductRoutes/product-routes');
    expect('TERMINAL_ROUTE' in mod).toBe(false);
    expect('buildTerminalHref' in mod).toBe(false);
  });
});
