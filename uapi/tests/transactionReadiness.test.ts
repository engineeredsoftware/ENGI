/**
 * Transaction readiness (relocated from Terminal).
 */
import { deriveBitcodeTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-readiness';

describe('transaction-readiness', () => {
  it('requires connect before transacting', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: false,
      hasRepositoryProvider: false,
      hasWalletBinding: false,
    });
    expect(readiness.status).toBe('connect-required');
    expect(readiness.canSettle).toBe(false);
  });

  it('is ready when wallet, repo, and verification are present', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: true,
      hasWalletBinding: true,
      hasVerifiedWalletBinding: true,
      hasStoredVerifiedWalletBinding: true,
      requiresRepositoryAnchor: true,
      hasRepositoryAnchor: true,
    });
    expect(readiness.status).toBe('ready');
    expect(readiness.canTransact).toBe(true);
    expect(readiness.canSettle).toBe(true);
    expect(readiness.nextAction).not.toMatch(/Terminal/i);
  });
});
