/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';

describe('/api/auxillaries/connections/github', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns source-safe provider readiness and recovery evidence after connection repair', async () => {
    const selectBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          connection_data: {
        provider: 'github',
        provider_username: 'bitcode-old',
        access_token: 'gho_old_secret',
        accessToken: 'gho_old_camel_secret',
        scopes: ['repo'],
          },
        },
        error: null,
      }),
    };
    const upsertBuilder = {
      upsert: jest.fn().mockResolvedValue({ error: null }),
    };
    const from = jest
      .fn()
      .mockReturnValueOnce(selectBuilder)
      .mockReturnValueOnce(upsertBuilder);

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from,
    });

    const { POST } = await import('@/app/api/auxillaries/connections/github/route');
    const response = await POST(new Request('https://bitcode.exchange/api/auxillaries/connections/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'github',
        provider_username: 'bitcode',
        access_token: 'gho_new_secret',
        accessToken: 'gho_new_camel_secret',
        scopes: ['repo', 'contents:write'],
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.providerReadiness).toEqual(expect.objectContaining({
      provider: 'github',
      providerName: 'GitHub',
      tokenPresenceClass: 'present_source_safe',
      scopesClass: 'repo_read_write',
      repairAction: 'none',
      providerReadinessRoot: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
    expect(payload.recoveryRun).toEqual(expect.objectContaining({
      targetPane: 'externals',
      repairAction: 'reauthorize_provider',
      beforeReadinessRoot: expect.stringMatching(/^[0-9a-f]{64}$/),
      afterReadinessRoot: expect.stringMatching(/^[0-9a-f]{64}$/),
      outcome: 'succeeded',
      recoveryRoot: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
    expect(serialized).not.toContain('gho_old_secret');
    expect(serialized).not.toContain('gho_old_camel_secret');
    expect(serialized).not.toContain('gho_new_secret');
    expect(serialized).not.toContain('gho_new_camel_secret');
    expect(upsertBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        provider: 'github',
        connection_data: expect.objectContaining({
          access_token: 'gho_new_secret',
        }),
      }),
      { onConflict: ['user_id', 'provider'] },
    );
  });
});
