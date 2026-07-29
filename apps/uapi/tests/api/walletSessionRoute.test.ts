/**
 * @jest-environment node
 *
 * Connect = authenticate as the canonical wallet user (never bind-only onto
 * a different existing session).
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
        getUserById: jest.fn(),
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
const WALLET_EMAIL = `${ADDRESS}@ethereum.wallet.bitcode.local`;

function createRequest(overrides: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/wallet/session', {
    method: 'POST',
    body: JSON.stringify({
      address: ADDRESS,
      provider: 'metamask',
      network: 'sepolia',
      message:
        'Bitcode wants you to sign in with your Ethereum account:\n' + ADDRESS,
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

/** Fully chainable supabaseAdmin.from mock for scan + read + upsert paths. */
function installAdminTableMocks() {
  const profileUpserts: unknown[] = [];
  const connectionUpserts: unknown[] = [];

  function chain(result: { data?: unknown; error?: unknown } = { data: null, error: null }) {
    const builder: any = {};
    const methods = [
      'select',
      'eq',
      'in',
      'limit',
      'maybeSingle',
      'upsert',
      'update',
      'single',
    ];
    for (const method of methods) {
      builder[method] = jest.fn((...args: unknown[]) => {
        if (method === 'upsert') {
          // capture first arg for assertions
          return Promise.resolve({ error: null });
        }
        if (method === 'maybeSingle' || method === 'single') {
          return Promise.resolve({ data: result.data ?? null, error: result.error ?? null });
        }
        if (method === 'limit' || method === 'in') {
          // terminal for some scans
          return Promise.resolve({
            data: Array.isArray(result.data) ? result.data : [],
            error: null,
          });
        }
        return builder;
      });
    }
    // update().eq() terminal
    builder.update = jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }));
    return builder;
  }

  (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'user_profiles') {
      const builder = chain({ data: null });
      builder.limit = jest.fn().mockResolvedValue({ data: [], error: null });
      builder.upsert = jest.fn((payload: unknown) => {
        profileUpserts.push(payload);
        return Promise.resolve({ error: null });
      });
      return builder;
    }
    if (table === 'user_connections') {
      const builder = chain({ data: [] });
      builder.in = jest.fn().mockResolvedValue({ data: [], error: null });
      builder.limit = jest.fn().mockResolvedValue({ data: [], error: null });
      builder.upsert = jest.fn((payload: unknown) => {
        connectionUpserts.push(payload);
        return Promise.resolve({ error: null });
      });
      return builder;
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return { profileUpserts, connectionUpserts };
}

function mockMintPath(userId: string) {
  const verifyOtp = jest.fn().mockResolvedValue({
    data: {
      session: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: 1_700_000_000,
        token_type: 'bearer',
      },
      user: { id: userId },
    },
    error: null,
  });

  (supabaseAdmin.auth.admin.createUser as jest.Mock).mockResolvedValue({
    data: { user: { id: userId, email: WALLET_EMAIL } },
    error: null,
  });
  (supabaseAdmin.auth.admin.generateLink as jest.Mock).mockResolvedValue({
    data: {
      user: { id: userId, email: WALLET_EMAIL },
      properties: { hashed_token: 'token-hash' },
    },
    error: null,
  });
  (supabaseAdmin.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  });
  (supabaseAdmin.auth.admin.getUserById as jest.Mock).mockResolvedValue({
    data: { user: { id: userId, email: WALLET_EMAIL } },
    error: null,
  });

  return verifyOtp;
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

  it('mints a Bitcode session when no session exists', async () => {
    const verifyOtp = mockMintPath('new-user');
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        verifyOtp,
      },
    });
    const { profileUpserts, connectionUpserts } = installAdminTableMocks();

    const response = await POST(createRequest());
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.sessionEstablished).toBe(true);
    expect(body.sessionSwitched).toBe(false);
    expect(body.session).toEqual(
      expect.objectContaining({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    );
    expect(body.canonicalUserId).toBe('new-user');
    expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalled();
    expect(verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'token-hash',
    });
    expect(profileUpserts.some((p: any) => p?.id === 'new-user')).toBe(true);
    expect(connectionUpserts.some((p: any) => p?.user_id === 'new-user')).toBe(
      true,
    );
  });

  it('switches session to the wallet principal when a different user is already signed in', async () => {
    const verifyOtp = mockMintPath('wallet-principal');
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'other-session-user' } },
          error: null,
        }),
        verifyOtp,
      },
    });
    const { profileUpserts, connectionUpserts } = installAdminTableMocks();

    const response = await POST(createRequest());
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.sessionEstablished).toBe(true);
    expect(body.sessionSwitched).toBe(true);
    expect(body.canonicalUserId).toBe('wallet-principal');
    expect(body.session).toEqual(
      expect.objectContaining({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    );
    expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalled();
    expect(verifyOtp).toHaveBeenCalled();
    expect(profileUpserts.some((p: any) => p?.id === 'wallet-principal')).toBe(
      true,
    );
    expect(
      profileUpserts.some((p: any) => p?.id === 'other-session-user'),
    ).toBe(false);
    expect(
      connectionUpserts.some((p: any) => p?.user_id === 'wallet-principal'),
    ).toBe(true);
    expect(
      connectionUpserts.some((p: any) => p?.user_id === 'other-session-user'),
    ).toBe(false);
  });
});
