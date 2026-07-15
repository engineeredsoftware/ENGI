import { POST } from '@/app/api/auxillaries/connections/github/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/app/octokit', () => ({
  app: {
    getInstallationOctokit: jest.fn(),
  },
}));

import { createClient } from '@bitcode/supabase/ssr/server';

  describe('POST /api/auxillaries/connections/github', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn() });
  });

  it('returns 401 if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
    const req = new Request('http://localhost/api/auxillaries/connections/github', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 on invalid JSON', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const badReq = { url: 'http://example.com', json: async () => { throw new Error('bad'); } } as Request;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it('returns success on valid input', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };
    const mockedCreateClient = createClient as jest.Mock;
    (mockedCreateClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue(builder) });
    const data = { token: 'abc', installationId: 123 };
    const req = new Request('http://localhost/api/auxillaries/connections/github', { method: 'POST', body: JSON.stringify(data) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
    expect(builder.upsert).toHaveBeenCalledWith(expect.objectContaining({ provider: 'github', connection_data: data }), { onConflict: ['user_id', 'provider'] });
  });
  describe('GET /api/auxillaries/connections/github', () => {
    const { GET } = require('@/app/api/auxillaries/connections/github/route');
    const mockUser = { id: 'user-1' };
    const mockGetUser = jest.fn();
    const mockFrom: any = {
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    };
    // Ensure chainable behaviour
    (mockFrom.select as jest.Mock).mockReturnValue(mockFrom);
    (mockFrom.eq as jest.Mock).mockReturnValue(mockFrom);
    beforeEach(() => {
      jest.resetAllMocks();
      const chain: any = {};
      chain.select = jest.fn(() => chain);
      chain.eq = jest.fn(() => chain);
      chain.maybeSingle = mockFrom.maybeSingle;
      chain.single = mockFrom.single;
      (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn(() => chain) });


    });
    it('returns 401 if unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
      const req = new Request('http://localhost/api/auxillaries/connections/github', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });
    it('returns 404 if no connection record', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockFrom.maybeSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const req = new Request('http://localhost/api/auxillaries/connections/github', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toMatchObject({ success: false, error: expect.stringContaining('No GitHub connection') });
    });
    it('returns repositories and organizations on success', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      const connectionData = {
        installationId: '123',
        code: 'abc',
        access_token: 'ghs_secret',
        refresh_token: 'refresh-secret',
      };
      mockFrom.maybeSingle.mockResolvedValue({ data: { connection_data: connectionData }, error: null });
      // Mock Octokit installation
      const fakeRepos = [
        { full_name: 'org1/repoA', owner: { type: 'Organization', login: 'org1' } },
        { full_name: 'user1/repoB', owner: { type: 'User', login: 'user1' } }
      ];
      const mockOctokit = {
        rest: { apps: { listReposAccessibleToInstallation: jest.fn() } },
        paginate: jest.fn().mockResolvedValue(fakeRepos)
      };
      const { app } = require('@/app/octokit');
      app.getInstallationOctokit = jest.fn().mockResolvedValue(mockOctokit);
      const req = new Request('http://localhost/api/auxillaries/connections/github', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.connectionData).toEqual({ installationId: '123', code: 'abc' });
      expect(body.connectionData.access_token).toBeUndefined();
      expect(body.connectionData.refresh_token).toBeUndefined();
      expect(Array.isArray(body.repositories)).toBe(true);
      expect(body.repositories).toEqual(fakeRepos);
      expect(body.organizations).toEqual(['org1']);
      expect(app.getInstallationOctokit).toHaveBeenCalledWith(123);
    });
  });
});
