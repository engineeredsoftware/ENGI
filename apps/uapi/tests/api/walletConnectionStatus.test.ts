/**
 * @jest-environment node
 */

import { readBitcodeWalletConnectionStatus } from '@/app/api/wallet/_shared';

function createSupabaseWithWalletConnection(connectionData: Record<string, unknown> | null) {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: connectionData
        ? {
            provider: 'leather',
            connection_data: connectionData,
            updated_at: '2026-05-15T13:09:38.702Z',
          }
        : null,
      error: null,
    }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return {
    from: jest.fn(() => builder),
  } as any;
}

const profile = {
  settings: {
    bitcodeProfile: {
      walletBinding: {
        address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        provider: 'leather',
        status: 'pending',
        boundAt: '2026-05-14T16:03:52.251Z',
      },
    },
  },
};

describe('readBitcodeWalletConnectionStatus', () => {
  it('treats a provider-backed pending Bitcoin message signature as live V28 signer readiness', async () => {
    const status = await readBitcodeWalletConnectionStatus({
      supabase: createSupabaseWithWalletConnection({
        address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        verification_state: 'pending',
        proof_kind: 'bitcoin_message_signature',
        message: 'Bitcode Bitcoin wallet authentication',
        signature: 'wallet-signature',
        network: 'testnet',
        auth_address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        payment_address: 'tb1q8whqdsl7853r8fft6sj7dnh4tcvm2xkhs7d8t2',
        address_type: 'p2tr',
      }),
      userId: 'user-1',
      profile,
    });

    expect(status).toEqual(expect.objectContaining({
      connected: true,
      provider: 'leather',
      valid: true,
      verificationState: 'pending',
      address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
    }));
    expect(status?.metadata).toEqual(expect.objectContaining({
      proofKind: 'bitcoin_message_signature',
      network: 'testnet',
      authAddress: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
      paymentAddress: 'tb1q8whqdsl7853r8fft6sj7dnh4tcvm2xkhs7d8t2',
      addressType: 'p2tr',
    }));
  });

  it('does not accept pending provider-session posture as signed settlement readiness', async () => {
    const status = await readBitcodeWalletConnectionStatus({
      supabase: createSupabaseWithWalletConnection({
        address: 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2',
        verification_state: 'pending',
        proof_kind: 'provider_session',
      }),
      userId: 'user-1',
      profile,
    });

    expect(status?.connected).toBe(true);
    expect(status?.valid).toBe(false);
  });
});
