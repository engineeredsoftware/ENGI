import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';

import WalletSessionPersistenceBridge from '@/app/WalletSessionPersistenceBridge';
import {
  BITCODE_LOCAL_WALLET_STORAGE_KEY,
  readLocalBitcodeWalletIdentity,
} from '@bitcode/auth/wallet-local';
import { mutateUserData } from '@/hooks/useUserData';

const getUser = jest.fn();

jest.mock('@bitcode/supabase/ssr/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser,
    },
  })),
}));

jest.mock('@/hooks/useUserData', () => ({
  mutateUserData: jest.fn(async () => undefined),
}));

jest.mock('@bitcode/auth/qa-telemetry', () => ({
  bitcodeQaTelemetry: jest.fn(),
  compactBitcodeAddress: (value: string | null | undefined) => value ?? null,
}));

const mockMutateUserData = mutateUserData as jest.MockedFunction<typeof mutateUserData>;

describe('WalletSessionPersistenceBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        walletConnectionStatus: {
          verificationState: 'pending',
          metadata: {
            connectedAt: '2026-05-14T14:08:42.562Z',
          },
        },
      }),
    })) as jest.Mock;
  });

  it('persists a locally signed wallet proof once a Supabase session exists', async () => {
    window.localStorage.setItem(
      BITCODE_LOCAL_WALLET_STORAGE_KEY,
      JSON.stringify({
        address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        provider: 'leather',
        network: 'testnet',
        status: 'pending',
        connectedAt: '2026-05-14T14:02:36.000Z',
        proofKind: 'bitcoin_message_signature',
        paymentAddress: 'tb1q8whqdsl7853r8fft6sj7dnh4tcvm2xkhs7d8t2',
        authAddress: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        addressType: 'p2tr',
        message: 'Bitcode Bitcoin wallet authentication\nAddress: tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2\nPurpose: Authenticate Bitcode commercial profile',
        signature: 'signed-proof',
        persistence: 'local',
      }),
    );

    render(<WalletSessionPersistenceBridge />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/wallet/authenticate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(mockMutateUserData).toHaveBeenCalled();
    });

    const persistedIdentity = readLocalBitcodeWalletIdentity();
    expect(persistedIdentity?.persistence).toBe('server');
    expect(persistedIdentity?.provider).toBe('leather');
    expect(persistedIdentity?.connectedAt).toBe('2026-05-14T14:08:42.562Z');
  });

  it('derives the wallet binding from the OAuth identity when nothing is staged locally', async () => {
    const oauthAddress = 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2';
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          identities: [
            {
              provider: 'custom:bitcode-bitcoin',
              identity_data: { sub: `bitcoin:testnet:${oauthAddress}` },
            },
          ],
        },
      },
      error: null,
    });
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({
        walletConnectionStatus: {
          address: oauthAddress,
          provider: 'leather',
          network: 'testnet',
          verificationState: 'pending',
          metadata: { connectedAt: '2026-06-12T18:53:26.059Z' },
        },
      }),
    })) as jest.Mock;

    render(<WalletSessionPersistenceBridge />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/wallet/authenticate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ source: 'oauth-identity', proofKind: 'provider_session' }),
        }),
      );
      expect(mockMutateUserData).toHaveBeenCalled();
    });

    const persistedIdentity = readLocalBitcodeWalletIdentity();
    expect(persistedIdentity?.persistence).toBe('server');
    expect(persistedIdentity?.address).toBe(oauthAddress);
    expect(persistedIdentity?.provider).toBe('leather');
    expect(persistedIdentity?.proofKind).toBe('provider_session');
    expect(persistedIdentity?.connectedAt).toBe('2026-06-12T18:53:26.059Z');
  });

  it('skips identity-derived binding for sessions without a Bitcoin OAuth identity', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ provider: 'github' }] } },
      error: null,
    });

    render(<WalletSessionPersistenceBridge />);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not call wallet persistence without a Supabase user session', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    window.localStorage.setItem(
      BITCODE_LOCAL_WALLET_STORAGE_KEY,
      JSON.stringify({
        address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        provider: 'leather',
        network: 'testnet',
        status: 'pending',
        connectedAt: '2026-05-14T14:02:36.000Z',
        proofKind: 'bitcoin_message_signature',
        message: 'Bitcode Bitcoin wallet authentication\nAddress: tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2\nPurpose: Authenticate Bitcode commercial profile',
        signature: 'signed-proof',
        persistence: 'local',
      }),
    );

    render(<WalletSessionPersistenceBridge />);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
