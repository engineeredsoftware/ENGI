/**
 * Product route helpers — canonical launch entrypoints for Packs / Reads / Deposits.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  PACKS_ROUTE,
  READS_ROUTE,
  DEPOSITS_ROUTE,
  buildPacksHref,
  buildReadsHref,
  buildDepositsHref,
  buildExchangeHref,
} from '@/components/bitcode/routes/ProductRoutes/product-routes';

describe('product-routes', () => {
  it('exposes plural product routes as the canonical paths', () => {
    expect(PACKS_ROUTE).toBe('/packs');
    expect(READS_ROUTE).toBe('/reads');
    expect(DEPOSITS_ROUTE).toBe('/deposits');
  });

  it('builds hrefs with and without query strings', () => {
    expect(buildPacksHref()).toBe('/packs');
    expect(buildReadsHref('transactionId=run-1')).toBe('/reads?transactionId=run-1');
    expect(buildDepositsHref(new URLSearchParams({ stage: 'source' }))).toBe(
      '/deposits?stage=source',
    );
    expect(buildExchangeHref()).toBe('/packs');
  });
});
