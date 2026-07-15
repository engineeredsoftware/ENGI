/**
 * @jest-environment node
 */

describe('/api/vcs routes (mock mode)', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO = 'demo';
  });

  afterAll(() => {
    process.env = envBackup;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  function readHeader(response: any, name: string) {
    if (typeof response.headers?.get === 'function') {
      return response.headers.get(name);
    }

    const headerEntries = Object.entries(response.headers || {});
    const match = headerEntries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return match?.[1] as string | undefined;
  }

  it('returns a deterministic GitHub connection payload for the orbitals connects pane', async () => {
    const { GET } = await import('@/app/api/vcs/[provider]/connection/route');
    const request = new Request('https://example.com/api/vcs/github/connection');

    const response = await GET(request as any, { params: { provider: 'github' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.connected).toBe(true);
    expect(payload.valid).toBe(true);
    expect(payload.provider).toBe('github');
    expect(payload.username).toBe('bitcode');
    expect(payload.metadata.account).toBe('bitcode');
    expect(payload.providerReadiness).toEqual(expect.objectContaining({
      provider: 'github',
      providerName: 'GitHub',
      tokenPresenceClass: expect.any(String),
      scopesClass: expect.any(String),
      providerReadinessRoot: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
    expect(JSON.stringify(payload.providerReadiness)).not.toContain('mock-token');
  });

  it('returns deterministic mock repositories for the terminal-owned GitHub carrier', async () => {
    const { GET } = await import('@/app/api/vcs/[provider]/repositories/route');
    const request = new Request('https://example.com/api/vcs/github/repositories');

    const response = await GET(request as any, { params: { provider: 'github' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.repositories)).toBe(true);
    expect(payload.repositories.length).toBeGreaterThan(0);
    expect(payload.inventorySource).toBe('mock_repository_inventory');
    expect(payload.repositories[0].fullName).toBe('bitcode/bitcode');
  });

  it('accepts PAT connect requests in mock mode without falling through to former HTML routes', async () => {
    const { POST } = await import('@/app/api/vcs/[provider]/connect-token/route');
    const request = new Request('https://example.com/api/vcs/github/connect-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'mock-token',
      }),
    });

    const response = await POST(request as any, { params: { provider: 'github' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.provider).toBe('github');
    expect(payload.connection.connected).toBe(true);
  });

  it('handles GitHub callback URLs in mock mode without falling through to HTML routes', async () => {
    const { GET } = await import('@/app/api/vcs/[provider]/callback/route');
    const request = new Request(
      'https://example.com/api/vcs/github/callback?installation_id=123&setup_action=install',
    );

    const response = await GET(request as any, { params: { provider: 'github' } } as any);

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(readHeader(response, 'location')).toContain('/packs?auxillary-open-to=externals');
    expect(readHeader(response, 'location')).toContain('vcsConnection=mock_connected');
  });
});
