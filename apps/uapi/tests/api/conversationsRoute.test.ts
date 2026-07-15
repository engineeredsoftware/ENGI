/**
 * @jest-environment node
 */

describe('/api/conversations GET (mock mode)', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO = 'demo';
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns a paged conversation payload for the fullscreen conversations overlay', async () => {
    const { GET } = await import('@/app/api/conversations/route');
    const request = new Request('https://example.com/api/conversations?limit=2&search=Bitcode');

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.data.length).toBeGreaterThan(0);
    expect(typeof payload.hasMore).toBe('boolean');
    expect(payload).toHaveProperty('nextCursor');
    expect(payload.data[0]).toHaveProperty('title');
  });
});
