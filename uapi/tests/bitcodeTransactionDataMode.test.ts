import {
  getTransactionDataModeDescription,
  getTransactionDataModeLabel,
  isMockTransactionDataMode,
} from '@/components/bitcode/execution/bitcode-transaction-data-mode';

describe('bitcode-transaction-data-mode', () => {
  it('reports live, mock-review, and review-fallback labels', () => {
    expect(getTransactionDataModeLabel('live')).toBe('live detail');
    expect(getTransactionDataModeLabel('mock-review')).toBe('mock review');
    expect(getTransactionDataModeLabel('review-fallback')).toBe('review fallback');
  });

  it('distinguishes live data from mock-like transaction surfaces', () => {
    expect(isMockTransactionDataMode('live')).toBe(false);
    expect(isMockTransactionDataMode('mock-review')).toBe(true);
    expect(isMockTransactionDataMode('review-fallback')).toBe(true);
  });

  it('describes why review fallback is active', () => {
    expect(getTransactionDataModeDescription('review-fallback')).toContain('live history is empty');
  });
});
