import { deriveBitcodeTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-readiness';

describe('deriveBitcodeTransactionReadiness', () => {
  it('fails closed for transaction-bearing work until wallet and repository scope are both ready', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: false,
      hasWalletBinding: false,
    });

    expect(readiness.status).toBe('wallet-and-repository-pending');
    expect(readiness.canReview).toBe(true);
    expect(readiness.canTransact).toBe(false);
    expect(readiness.blockers.map((entry) => entry.id)).toEqual([
      'wallet-binding',
      'repository-provider',
    ]);
  });

  it('requires a repository anchor when the Bitcode is executing anchored work', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: true,
      hasWalletBinding: true,
      hasVerifiedWalletBinding: true,
      hasStoredVerifiedWalletBinding: true,
      requiresRepositoryAnchor: true,
      hasRepositoryAnchor: false,
    });

    expect(readiness.status).toBe('repository-anchor-pending');
    expect(readiness.canTransact).toBe(false);
    expect(readiness.summary).toContain('Select a repository anchor');
  });

  it('keeps settlement staged when wallet identity exists without verified provider signing', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: true,
      hasWalletBinding: true,
      hasVerifiedWalletBinding: false,
      hasStoredVerifiedWalletBinding: false,
      requiresRepositoryAnchor: true,
      hasRepositoryAnchor: true,
    });

    expect(readiness.status).toBe('wallet-verification-pending');
    expect(readiness.canTransact).toBe(true);
    expect(readiness.canSettle).toBe(false);
    expect(readiness.summary).toContain('signed settlement remains staged');
  });

  it('fails closed when the repository provider attachment exists but the live session is invalid', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: false,
      hasWalletBinding: true,
      hasVerifiedWalletBinding: true,
      hasStoredVerifiedWalletBinding: true,
      requiresRepositoryAnchor: true,
      hasRepositoryAnchor: true,
    });

    expect(readiness.status).toBe('repository-provider-pending');
    expect(readiness.label).toBe('repository reconnect required');
    expect(readiness.canTransact).toBe(false);
    expect(readiness.canSettle).toBe(false);
    expect(readiness.summary).toContain('Reconnect GitHub');
  });

  it('fails closed when saved verified wallet signer posture exists but the live signer session is missing', () => {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: true,
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: true,
      hasWalletBinding: true,
      hasVerifiedWalletBinding: false,
      hasStoredVerifiedWalletBinding: true,
      requiresRepositoryAnchor: true,
      hasRepositoryAnchor: true,
    });

    expect(readiness.status).toBe('wallet-verification-pending');
    expect(readiness.label).toBe('wallet reconnect required');
    expect(readiness.canTransact).toBe(true);
    expect(readiness.canSettle).toBe(false);
    expect(readiness.summary).toContain('live wallet-provider signing session is no longer available');
  });

  it('becomes ready once wallet identity, verified signing, and repository scope are all present', () => {
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
    expect(readiness.blockers).toEqual([]);
  });
});
