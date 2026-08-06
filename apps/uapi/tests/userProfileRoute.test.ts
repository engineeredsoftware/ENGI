jest.mock('@bitcode/orm', () => {
  const readBitcodeWalletBindingFromProfile = (profile: any) =>
    profile?.settings?.bitcodeProfile?.walletBinding ?? null;

  const mergeBitcodeProfileSettings = (existingSettings: any, patch: any) => {
    const existingBitcodeProfile = existingSettings?.bitcodeProfile ?? {};
    const walletBinding =
      patch.walletBinding === undefined ? existingBitcodeProfile.walletBinding ?? null : patch.walletBinding;

    return {
      ...(existingSettings ?? {}),
      bitcodeProfile: {
        companyName:
          patch.companyName === undefined ? existingBitcodeProfile.companyName ?? null : patch.companyName,
        teamMembers:
          patch.teamMembers === undefined ? existingBitcodeProfile.teamMembers ?? [] : patch.teamMembers,
        email: patch.email === undefined ? existingBitcodeProfile.email ?? null : patch.email,
        isVerified:
          patch.isVerified === undefined ? existingBitcodeProfile.isVerified ?? null : patch.isVerified,
        walletBinding,
      },
    };
  };

  const hydrateBitcodeProfile = (profile: any) => {
    if (!profile) {
      return null;
    }

    const walletBinding = readBitcodeWalletBindingFromProfile(profile);

    return {
      ...profile,
      company_name: profile?.settings?.bitcodeProfile?.companyName ?? null,
      team_members: profile?.settings?.bitcodeProfile?.teamMembers ?? [],
      email: profile?.settings?.bitcodeProfile?.email ?? null,
      is_verified: profile?.settings?.bitcodeProfile?.isVerified ?? null,
      wallet_address: walletBinding?.address ?? null,
      wallet_provider: walletBinding?.provider ?? null,
      wallet_binding_status: walletBinding?.status ?? null,
      wallet_bound_at: walletBinding?.boundAt ?? null,
      wallet_binding: walletBinding,
    };
  };

  return {
    hydrateBitcodeProfile,
    mergeBitcodeProfileSettings,
    readBitcodeWalletBindingFromProfile,
  };
});

import { GET } from '@/app/api/auxillaries/profile/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  },
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { POST } from '@/app/api/auxillaries/profile/route';

describe('GET /api/auxillaries/profile', () => {
  const mockUser = { id: 'user-1' };

  beforeEach(() => {
    (createClient as jest.Mock).mockReset();
    // Reset only call history, preserve mockReturnThis behavior
    (supabaseAdmin.from as jest.Mock).mockClear();
    (supabaseAdmin.select as jest.Mock).mockClear();
    (supabaseAdmin.eq as jest.Mock).mockClear();
    (supabaseAdmin.maybeSingle as jest.Mock).mockClear();
  });

  it('returns 401 if unauthenticated', async () => {
    const mockSupabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } }) } };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    const request = new Request('http://localhost/api/auxillaries/profile');
    const response = await GET(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Authentication required');
  });

  it('returns profile data on success', async () => {
    const profileData = {
      id: 'user-1',
      username: 'alice',
      settings: {
        bitcodeProfile: {
          email: 'alice@example.com',
          isVerified: true,
          walletBinding: {
            address: 'bc1qbitcodeoperator',
            provider: 'manual',
            status: 'manual',
            boundAt: '2026-04-22T00:00:00.000Z',
          },
        },
      },
    };
    const mockSupabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) } };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (supabaseAdmin.from().select().eq().maybeSingle as jest.Mock).mockResolvedValue({ data: profileData, error: null });
    const request = new Request('http://localhost/api/auxillaries/profile');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(
      expect.objectContaining({
        id: 'user-1',
        username: 'alice',
        email: 'alice@example.com',
        is_verified: true,
        wallet_address: 'bc1qbitcodeoperator',
        wallet_provider: 'manual',
        wallet_binding_status: 'manual',
      }),
    );
    expect(supabaseAdmin.eq).toHaveBeenCalledWith('id', 'user-1');
  });
});

describe('POST /api/auxillaries/profile', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();
  beforeEach(() => {
    (createClient as jest.Mock).mockReset();
    (supabaseAdmin.from as jest.Mock).mockReset();
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
  });

  it('returns 401 if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
    const req = new Request('http://localhost/api/auxillaries/profile', { method: 'POST', body: JSON.stringify({ username: 'bob' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 on invalid JSON', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const badReq: any = { json: async () => { throw new Error('bad'); } };
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it('returns 400 when username missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const req = new Request('http://localhost/api/auxillaries/profile', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Username is required' });
  });

  it('upserts profile on valid input', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockReturnThis(),
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const req = new Request('http://localhost/api/auxillaries/profile', { method: 'POST', body: JSON.stringify({ username: 'bob', bio: 'hello' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ success: true });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('user_profiles');
    expect(builder.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        username: 'bob',
        bio: 'hello',
        settings: expect.objectContaining({
          bitcodeProfile: expect.objectContaining({
            companyName: null,
            teamMembers: [],
            email: null,
            isVerified: null,
            walletBinding: null,
          }),
        }),
      }),
      { onConflict: 'id' },
    );
  });

  it('persists wallet binding inside canonical profile settings', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          username: 'bob',
          settings: {},
        },
        error: null,
      }),
      upsert: jest.fn().mockReturnThis(),
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);

    const req = new Request('http://localhost/api/auxillaries/profile', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        walletAddress: 'bc1qbitcodeoperator',
        walletProvider: 'manual',
      }),
    });
    const res = await POST(req as any);

    expect(res.status).toBe(201);
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          bitcodeProfile: expect.objectContaining({
            walletBinding: expect.objectContaining({
              address: 'bc1qbitcodeoperator',
              provider: 'manual',
              status: 'manual',
            }),
          }),
        }),
      }),
      { onConflict: 'id' },
    );
  });

  it('rejects malformed wallet binding status', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const req = new Request('http://localhost/api/auxillaries/profile', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        walletBindingStatus: 'live',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('walletBindingStatus');
  });

  it('rejects provider-managed wallet signer assertions from the generic profile route', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockReturnThis(),
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);

    const req = new Request('http://localhost/api/auxillaries/profile', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        walletAddress: 'bc1qbitcodeoperator',
        walletProvider: 'metamask',
        walletBindingStatus: 'verified',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Provider-managed wallet signer posture');
    expect(builder.upsert).not.toHaveBeenCalled();
  });

  it('preserves an existing verified wallet signer when profile edits keep the same binding', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          username: 'bob',
          bio: 'before',
          settings: {
            bitcodeProfile: {
              walletBinding: {
                address: 'bc1qverifiedoperator',
                provider: 'metamask',
                status: 'verified',
                boundAt: '2026-04-22T00:00:00.000Z',
                network: 'testnet',
                proofKind: 'bitcoin_message_signature',
                authAddress: 'bc1pverifiedoperator',
                paymentAddress: 'bc1qverifiedoperator',
              },
            },
          },
        },
        error: null,
      }),
      upsert: jest.fn().mockReturnThis(),
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);

    const req = new Request('http://localhost/api/auxillaries/profile', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        bio: 'after',
        walletAddress: 'bc1qverifiedoperator',
        walletProvider: 'metamask',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: 'after',
        settings: expect.objectContaining({
          bitcodeProfile: expect.objectContaining({
            walletBinding: expect.objectContaining({
              address: 'bc1qverifiedoperator',
              provider: 'metamask',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
              network: 'testnet',
              proofKind: 'bitcoin_message_signature',
              authAddress: 'bc1pverifiedoperator',
              paymentAddress: 'bc1qverifiedoperator',
            }),
          }),
        }),
      }),
      { onConflict: 'id' },
    );
  });
});
