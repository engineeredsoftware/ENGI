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
    auth: {
      admin: {
        createUser: jest.fn(),
        generateLink: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  },
}));

jest.mock('@bitcode/auth/ethereum-auth-verify', () => {
  const actual = jest.requireActual('@bitcode/auth/ethereum-auth-verify');
  return {
    ...actual,
    verifyBitcodeEthereumAuthSignature: jest.fn(),
  };
});

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { verifyBitcodeEthereumAuthSignature } from '@bitcode/auth/ethereum-auth-verify';
import { POST } from '@/app/api/wallet/session/route';

const ADDRESS = '0xabcdef0000000000000000000000000000000001';

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

function createRequest(overrides: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/wallet/session', {
    method: 'POST',
    body: JSON.stringify({
      address: ADDRESS,
      provider: 'metamask',
      network: 'sepolia',
      message: 'Bitcode wants you to sign in with your Ethereum account:\n' + ADDRESS,
      signature: '0x' + 'ab'.repeat(65),
      proofKind: 'ethereum_personal_sign',
      paymentAddress: ADDRESS,
      authAddress: ADDRESS,
      addressType: 'ethereum',
      chainId: 11155111,
      connectedAt: new Date().toISOString(),
      ...overrides,
    }),
  });
}

describe('POST /api/wallet/session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyBitcodeEthereumAuthSignature as jest.Mock).mockReturnValue({
      ok: true,
      address: ADDRESS,
    });
  });

  it('rejects invalid proof kinds', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await POST(createRequest({ proofKind: 'bitcoin_message_signature' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'invalid_proof_kind' }),
    );
  });

  it('rejects failed signature verification', async () => {
    (verifyBitcodeEthereumAuthSignature as jest.Mock).mockReturnValue({
      ok: false,
      error: 'bad sig',
      code: 'signature_mismatch',
    });
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'signature_mismatch' }),
    );
  });

  it('binds Ethereum wallet to an existing Bitcode session without reminting', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'existing-user' } },
          error: null,
        }),
      },
    });

    const profileReadBuilder = createSelectBuilder(null);
    const profileWriteBuilder = createUpsertBuilder();
    const connectionWriteBuilder = createUpsertBuilder();
    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'user_profiles') {
        const hasReadStarted = profileReadBuilder.select.mock.calls.length > 0;
        return hasReadStarted ? profileWriteBuilder : profileReadBuilder;
      }
      if (table === 'user_connections') return connectionWriteBuilder;
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.sessionEstablished).toBe(false);
    expect(body.session).toBeNull();
    expect(body.walletConnectionStatus).toEqual(
      expect.objectContaining({
        address: ADDRESS,
        provider: 'metamask',
        verificationState: 'verified',
      }),
    );
    expect(supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
    expect(profileWriteBuilder.upsert).toHaveBeenCalled();
    expect(connectionWriteBuilder.upsert).toHaveBeenCalled();
  });

  it('mints a new Bitcode session when no session exists', async () => {
    const verifyOtp = jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
          expires_at: 1_700_000_000,
          token_type: 'bearer',
        },
        user: { id: 'new-user' },
      },
      error: null,
    });

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        verifyOtp,
      },
    });

    (supabaseAdmin.auth.admin.createUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'new-user', email: `${ADDRESS}@ethereum.wallet.bitcode.local` } },
      error: null,
    });
    (supabaseAdmin.auth.admin.generateLink as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'new-user' },
        properties: { hashed_token: 'token-hash' },
      },
      error: null,
    });

    const profileReadBuilder = createSelectBuilder(null);
    const profileWriteBuilder = createUpsertBuilder();
    const connectionWriteBuilder = createUpsertBuilder();
    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'user_profiles') {
        const hasReadStarted = profileReadBuilder.select.mock.calls.length > 0;
        return hasReadStarted ? profileWriteBuilder : profileReadBuilder;
      }
      if (table === 'user_connections') return connectionWriteBuilder;
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.sessionEstablished).toBe(true);
    expect(body.session).toEqual(
      expect.objectContaining({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    );
    expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalled();
    expect(verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'token-hash',
    });
  });
});
