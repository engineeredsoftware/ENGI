/**
 * Pure canonical wallet user resolution (Connect = authenticate).
 */
import {
  connectionDataMatchesEthereumAddress,
  mergeBoundWalletUserRows,
  profileSettingsMatchEthereumAddress,
  resolveCanonicalEthereumWalletUserId,
} from '@/app/api/wallet/wallet-ethereum-canonical-user';

const ADDRESS = '0xabcdef0000000000000000000000000000000001';

describe('wallet-ethereum-canonical-user', () => {
  it('matches connection_data address fields case-insensitively', () => {
    expect(
      connectionDataMatchesEthereumAddress(
        { wallet_address: ADDRESS.toUpperCase() },
        ADDRESS,
      ),
    ).toBe(true);
    expect(
      connectionDataMatchesEthereumAddress({ address: '0xdead' }, ADDRESS),
    ).toBe(false);
  });

  it('matches profile walletBinding address', () => {
    expect(
      profileSettingsMatchEthereumAddress(
        {
          bitcodeProfile: {
            walletBinding: { address: ADDRESS, status: 'verified' },
          },
        },
        ADDRESS,
      ),
    ).toBe(true);
  });

  it('prefers GitHub-owning bound user over wallet-email principal', () => {
    // Live bug class: eth_0xcc9d… wallet-email user vs eth_0xc1abe… with GH.
    const id = resolveCanonicalEthereumWalletUserId({
      walletEmailUserId: 'wallet-email-user',
      boundUsers: [
        {
          userId: 'wallet-email-user',
          boundAt: '2026-07-29T00:26:21Z',
          hasActiveGithub: false,
        },
        {
          userId: 'github-owner',
          boundAt: '2026-07-20T23:48:03Z',
          hasActiveGithub: true,
        },
      ],
    });
    expect(id).toBe('github-owner');
  });

  it('prefers GitHub owner among bound users', () => {
    const id = resolveCanonicalEthereumWalletUserId({
      walletEmailUserId: null,
      boundUsers: [
        {
          userId: 'plain',
          boundAt: '2026-01-01T00:00:00Z',
          hasActiveGithub: false,
        },
        {
          userId: 'with-gh',
          boundAt: '2026-02-01T00:00:00Z',
          hasActiveGithub: true,
        },
      ],
    });
    expect(id).toBe('with-gh');
  });

  it('uses wallet-email principal when no GitHub owner exists', () => {
    const id = resolveCanonicalEthereumWalletUserId({
      walletEmailUserId: 'wallet-email-user',
      boundUsers: [
        {
          userId: 'wallet-email-user',
          boundAt: '2026-07-29T00:26:21Z',
          hasActiveGithub: false,
        },
      ],
    });
    expect(id).toBe('wallet-email-user');
  });

  it('falls back to oldest bound user', () => {
    const id = resolveCanonicalEthereumWalletUserId({
      walletEmailUserId: null,
      boundUsers: [
        {
          userId: 'newer',
          boundAt: '2026-06-01T00:00:00Z',
          hasActiveGithub: false,
        },
        {
          userId: 'older',
          boundAt: '2026-01-01T00:00:00Z',
          hasActiveGithub: false,
        },
      ],
    });
    expect(id).toBe('older');
  });

  it('merges bound rows by userId', () => {
    const merged = mergeBoundWalletUserRows([
      {
        userId: 'u1',
        boundAt: '2026-02-01T00:00:00Z',
        hasActiveGithub: false,
      },
      {
        userId: 'u1',
        boundAt: '2026-01-01T00:00:00Z',
        hasActiveGithub: true,
      },
    ]);
    expect(merged).toEqual([
      {
        userId: 'u1',
        boundAt: '2026-01-01T00:00:00Z',
        hasActiveGithub: true,
      },
    ]);
  });
});
