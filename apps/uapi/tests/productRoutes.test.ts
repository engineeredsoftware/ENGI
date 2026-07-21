/**
 * Product route helpers — canonical launch entrypoints for Exchange / Reads / Deposits.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  EXCHANGE_ROUTE,
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
    expect(EXCHANGE_ROUTE).toBe('/exchange');
    // Compat alias only — product experience name is Exchange.
    expect(PACKS_ROUTE).toBe('/exchange');
    expect(READS_ROUTE).toBe('/reads');
    expect(DEPOSITS_ROUTE).toBe('/deposits');
  });

  it('builds hrefs with and without query strings', () => {
    expect(buildExchangeHref()).toBe('/exchange');
    // buildPacksHref remains for rare compat emitters of the legacy path.
    expect(buildPacksHref()).toBe('/exchange');
    expect(buildReadsHref('transactionId=run-1')).toBe('/reads?transactionId=run-1');
    expect(buildDepositsHref(new URLSearchParams({ stage: 'source' }))).toBe(
      '/deposits?stage=source',
    );
  });
});
