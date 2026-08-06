/**
 * @jest-environment node
 */

jest.mock('@bitcode/orm', () => {
  const mergeBitcodeProfileSettings = (existingSettings: any, patch: any) => ({
    ...(existingSettings ?? {}),
    bitcodeProfile: {
      ...(existingSettings?.bitcodeProfile ?? {}),
      walletBinding: patch.walletBinding,
    },
  });

  const hydrateBitcodeProfile = (profile: any) => {
    const walletBinding = profile?.settings?.bitcodeProfile?.walletBinding ?? null;
    return {
      ...profile,
      wallet_address: walletBinding?.address ?? null,
      wallet_provider: walletBinding?.provider ?? null,
      wallet_binding_status: walletBinding?.status ?? null,
      wallet_bound_at: walletBinding?.boundAt ?? null,
    };
  };

  return {
    hydrateBitcodeProfile,
    mergeBitcodeProfileSettings,
  };
});

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { POST } from '@/app/api/wallet/authenticate/route';

function createSelectBuilder(data: unknown = null) {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function createUpsertBuilder(error: { message: string } | null = null) {
  return {
    upsert: jest.fn().mockResolvedValue({ error }),
  };
}

function installSupabaseMocks(options: {
  user?: { id: string } | null;
  existingProfile?: Record<string, unknown> | null;
  connectionError?: { message: string } | null;
}) {
  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: Object.prototype.hasOwnProperty.call(options, 'user') ? options.user : { id: 'user-1' } },
        error: null,
      }),
    },
  });

  const profileReadBuilder = createSelectBuilder(options.existingProfile ?? null);
  const profileWriteBuilder = createUpsertBuilder();
  const connectionWriteBuilder = createUpsertBuilder(options.connectionError ?? null);

  (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'user_profiles') {
      const hasReadStarted = profileReadBuilder.select.mock.calls.length > 0;
      return hasReadStarted ? profileWriteBuilder : profileReadBuilder;
    }
    if (table === 'user_connections') return connectionWriteBuilder;
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    profileReadBuilder,
    profileWriteBuilder,
    connectionWriteBuilder,
  };
}

function createRequest(overrides: Record<string, unknown> = {}) {
  const address = 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq';
  return new Request('http://localhost/api/wallet/authenticate', {
    method: 'POST',
    body: JSON.stringify({
      address,
      provider: 'unisat',
      network: 'testnet',
      message: [
        'Bitcode Bitcoin wallet authentication',
        `Address: ${address}`,
        'Network: testnet',
        'Origin: http://localhost:3001',
        'Issued: 2026-05-09T00:00:00.000Z',
        'Nonce: test',
        'Purpose: Authenticate Bitcode commercial profile, BTC fee readiness, and BTD source-share access.',
      ].join('\n'),
      signature: 'bip322-signature',
      proofKind: 'bitcoin_message_signature',
      paymentAddress: 'tb1qpaymentaddressqqqqqqqqqqqqqqqqqqq',
      authAddress: address,
      addressType: 'p2tr',
      issuedAt: '2026-05-09T00:00:00.000Z',
      connectedAt: '2026-05-09T00:00:00.000Z',
      ...overrides,
    }),
  });
}

describe('POST /api/wallet/authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires an active Bitcode session before server-side wallet persistence', async () => {
    installSupabaseMocks({ user: null });

    const response = await POST(createRequest());
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'wallet_session_required' }),
    );
  });

  it('persists Bitcoin wallet profile plus connection posture', async () => {
    const { profileWriteBuilder, connectionWriteBuilder } = installSupabaseMocks({
      user: { id: 'user-1' },
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(201);
    expect(profileWriteBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        username: 'wallet_tb1qcmrcalqa',
        settings: expect.objectContaining({
          bitcodeProfile: expect.objectContaining({
            walletBinding: expect.objectContaining({
              address: 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq',
              provider: 'unisat',
              status: 'pending',
              network: 'testnet',
              proofKind: 'bitcoin_message_signature',
              paymentAddress: 'tb1qpaymentaddressqqqqqqqqqqqqqqqqqqq',
              authAddress: 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq',
              addressType: 'p2tr',
            }),
          }),
        }),
      }),
      { onConflict: 'id' },
    );
    expect(connectionWriteBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        provider: 'unisat',
        connection_data: expect.objectContaining({
          verification_state: 'pending',
          auth_source: 'bitcoin_wallet_provider',
          proof_kind: 'bitcoin_message_signature',
          payment_address: 'tb1qpaymentaddressqqqqqqqqqqqqqqqqqqq',
          auth_address: 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq',
          address_type: 'p2tr',
          signature: 'bip322-signature',
        }),
      }),
      { onConflict: 'user_id,provider' },
    );
  });

  it('rejects Ethereum addresses and EVM provider submissions', async () => {
    installSupabaseMocks({ user: { id: 'user-1' } });

    const response = await POST(createRequest({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      provider: 'metamask',
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringContaining('Bitcoin wallet address') }),
    );
  });

  it('requires signed Bitcoin proof messages to match the Bitcode challenge', async () => {
    installSupabaseMocks({ user: { id: 'user-1' } });

    const response = await POST(createRequest({ message: 'not a Bitcode challenge' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringContaining('Bitcode authentication challenge') }),
    );
  });

  const OAUTH_ADDRESS = 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2';
  const OAUTH_USER = {
    id: 'user-1',
    identities: [
      {
        provider: 'custom:bitcode-bitcoin',
        created_at: '2026-06-12T18:53:23.217Z',
        identity_data: {
          sub: `bitcoin:testnet:${OAUTH_ADDRESS}`,
          name: 'Leather Bitcoin wallet',
          preferred_username: 'btc_tb1p6x70u8ag7hkmgs',
        },
      },
    ],
  };

  function createOAuthIdentityRequest() {
    return new Request('http://localhost/api/wallet/authenticate', {
      method: 'POST',
      body: JSON.stringify({ source: 'oauth-identity', proofKind: 'provider_session' }),
    });
  }

  it('derives the wallet binding server-side from the session OAuth identity', async () => {
    const { profileWriteBuilder, connectionWriteBuilder } = installSupabaseMocks({
      user: OAUTH_USER,
    });

    const response = await POST(createOAuthIdentityRequest());
    expect(response.status).toBe(201);
    expect(profileWriteBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        username: 'wallet_tb1p6x70u8ag',
        settings: expect.objectContaining({
          bitcodeProfile: expect.objectContaining({
            walletBinding: expect.objectContaining({
              address: OAUTH_ADDRESS,
              provider: 'leather',
              status: 'pending',
              network: 'testnet',
              proofKind: 'provider_session',
              authAddress: OAUTH_ADDRESS,
            }),
          }),
        }),
      }),
      { onConflict: 'id' },
    );
    expect(connectionWriteBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        provider: 'leather',
        connection_data: expect.objectContaining({
          auth_source: 'bitcoin_wallet_oauth_identity',
          proof_kind: 'provider_session',
          verification_state: 'pending',
        }),
      }),
      { onConflict: 'user_id,provider' },
    );
  });

  it('no-ops idempotently when the OAuth identity binding already exists', async () => {
    const { profileWriteBuilder, connectionWriteBuilder } = installSupabaseMocks({
      user: OAUTH_USER,
      existingProfile: {
        id: 'user-1',
        username: 'wallet_tb1p6x70u8ag',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: OAUTH_ADDRESS,
              provider: 'leather',
              status: 'pending',
              boundAt: '2026-06-12T18:53:23.217Z',
              network: 'testnet',
            },
          },
        },
      },
    });

    const response = await POST(createOAuthIdentityRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        success: true,
        alreadyBound: true,
        walletConnectionStatus: expect.objectContaining({
          address: OAUTH_ADDRESS,
          provider: 'leather',
          verificationState: 'pending',
        }),
      }),
    );
    expect(profileWriteBuilder.upsert).not.toHaveBeenCalled();
    expect(connectionWriteBuilder.upsert).not.toHaveBeenCalled();
  });

  it('rejects oauth-identity mode when the session carries no Bitcoin identity', async () => {
    installSupabaseMocks({ user: { id: 'user-1' } });

    const response = await POST(createOAuthIdentityRequest());
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'wallet_oauth_identity_missing' }),
    );
  });

  it('surfaces the migration prerequisite if wallet connection persistence is still constrained', async () => {
    installSupabaseMocks({
      user: { id: 'user-1' },
      connectionError: { message: 'violates check constraint "user_connections_provider_check"' },
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        code: 'wallet_connection_persist_failed',
        remediation: expect.stringContaining('provider-constraint migration'),
      }),
    );
  });
});
