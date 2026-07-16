/**
 * @jest-environment node
 */

const mockSaveConnection = jest.fn();
const mockGetInstallation = jest.fn();
const mockGenerateInstallationToken = jest.fn();

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/generic-vcs-github', () => ({
  createGitHubAppAuth: jest.fn(() => ({
    getInstallation: mockGetInstallation,
    generateInstallationToken: mockGenerateInstallationToken,
  })),
}));

jest.mock('@bitcode/vcs-generics', () => ({
  VCSConnections: jest.fn().mockImplementation(() => ({
    saveConnection: mockSaveConnection,
  })),
  VCSProviderFactory: {
    createFromEnvironment: jest.fn(),
  },
  getProviderScopes: jest.fn(() => ['repo']),
}));

import { createClient } from '@bitcode/supabase/ssr/server';

function readHeader(response: any, name: string) {
  if (typeof response.headers?.get === 'function') {
    return response.headers.get(name);
  }

  const headerEntries = Object.entries(response.headers || {});
  const match = headerEntries.find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1] as string | undefined;
}

describe('GitHub App callback handling', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'false';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'false';

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    });

    mockGetInstallation.mockResolvedValue({
      id: 131722518,
      app_id: 244206,
      app_slug: 'engi-software-agents',
      target_type: 'Organization',
      repository_selection: 'all',
      account: {
        id: 991,
        login: 'octocat',
        type: 'Organization',
        html_url: 'https://github.com/octocat',
      },
    });

    mockGenerateInstallationToken.mockResolvedValue({
      token: 'ghs_installation_token',
      expiresAt: new Date('2026-05-12T18:00:00.000Z'),
      permissions: { contents: 'read', metadata: 'read' },
      repositorySelection: 'all',
      repositories: [
        {
          id: 1,
          name: 'Spoon-Knife',
          full_name: 'octocat/Spoon-Knife',
          private: false,
        },
      ],
    });
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('collects GitHub App installation callback fields and persists the user connection', async () => {
    const { GET } = await import('@/app/tps/github/app-install/route');
    const request = new Request(
      'https://bitcode.exchange/tps/github/app-install?installation_id=131722518&setup_action=install&state=qa-state&target_id=991&target_type=Organization',
    );

    const response = await GET(request as any);
    const location = readHeader(response, 'location') || '';

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(location).toContain('/packs?auxillary-open-to=externals');
    expect(location).toContain('vcsConnection=installation_connected');
    expect(location).toContain('installation_id=131722518');
    expect(mockGetInstallation).toHaveBeenCalledWith(131722518);
    expect(mockGenerateInstallationToken).toHaveBeenCalledWith(131722518);
    expect(mockSaveConnection).toHaveBeenCalledWith(
      'user-1',
      'github',
      expect.objectContaining({
        accessToken: 'ghs_installation_token',
        providerUserId: '131722518',
        providerUsername: 'octocat',
        metadata: expect.objectContaining({
          auth_source: 'github_app_installation',
          installation_id: 131722518,
          setup_action: 'install',
          setup_state: 'qa-state',
          target_id: '991',
          target_type: 'Organization',
          account_login: 'octocat',
          app_slug: 'engi-software-agents',
          repository_selection: 'all',
          installation_token_expires_at: '2026-05-12T18:00:00.000Z',
        }),
      }),
    );
  });

  it('keeps the retained GitHub callback URL as a query-preserving redirect', async () => {
    const { GET } = await import('@/app/github/callback/route');
    const request = new Request('https://bitcode.exchange/github/callback?code=abc&state=state-1');

    const response = GET(request as any);

    expect(response.status).toBe(308);
    expect(readHeader(response, 'location')).toBe(
      'https://bitcode.exchange/tps/github/callback?code=abc&state=state-1',
    );
  });

  it('stages installation when no Bitcode session is present', async () => {
    (createClient as jest.Mock).mockResolvedValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    const { GET } = await import('@/app/tps/github/app-install/route');
    const staged = await GET(
      new Request(
        'https://bitcode.exchange/tps/github/app-install?installation_id=131722518&setup_action=install',
      ) as any,
    );
    const stagedLocation = readHeader(staged, 'location') || '';
    expect(stagedLocation).toContain('vcsConnection=installation_staged');
    expect(stagedLocation).toContain('vcsSession=required');
    expect(mockSaveConnection).not.toHaveBeenCalled();
  });

  it('classifies installation API 404 as app_mismatch on the redirect', async () => {
    mockGetInstallation.mockRejectedValueOnce(
      new Error('Failed to get installation: 404 {"message":"Not Found"}'),
    );

    const { GET } = await import('@/app/tps/github/app-install/route');
    const response = await GET(
      new Request(
        'https://bitcode.exchange/tps/github/app-install?installation_id=999&setup_action=install',
      ) as any,
    );
    const location = readHeader(response, 'location') || '';
    expect(location).toContain('vcsConnection=failed');
    expect(location).toContain('vcsErrorClass=app_mismatch');
    expect(location).toContain('installation_id=999');
  });

  it('redirects install outcomes to NEXT_PUBLIC_APP_URL origin when set', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.bitcode.exchange';

    const { GET } = await import('@/app/tps/github/app-install/route');
    const response = await GET(
      new Request(
        'https://bitcode.exchange/tps/github/app-install?installation_id=131722518&setup_action=install',
      ) as any,
    );
    const location = readHeader(response, 'location') || '';
    expect(location.startsWith('https://www.bitcode.exchange/packs?')).toBe(true);
    expect(location).toContain('vcsConnection=installation_connected');
  });

  it('parses staged pending cookie with numeric installation_id and percent-encoding', async () => {
    const { parsePendingInstallationCookieValue } = await import(
      '@/app/tps/github/_callback-handler'
    );

    // Production stage path: JSON.stringify writes installation_id as a number.
    const plain = JSON.stringify({
      installation_id: 146662656,
      setup_action: 'install',
      state: null,
      account: {
        login: 'advancedengineeredsoftware',
        id: '84343342',
        type: 'Organization',
        html_url: 'https://github.com/advancedengineeredsoftware',
      },
      captured_at: '2026-07-15T03:53:14.351Z',
    });
    expect(parsePendingInstallationCookieValue(plain)?.installation_id).toBe(146662656);

    // DevTools / some proxies leave the Cookie header percent-encoded.
    const encoded =
      '%7B%22installation_id%22%3A146662656%2C%22setup_action%22%3A%22install%22%2C%22state%22%3Anull%2C%22account%22%3A%7B%22login%22%3A%22advancedengineeredsoftware%22%2C%22id%22%3A%2284343342%22%2C%22type%22%3A%22Organization%22%2C%22html_url%22%3A%22https%3A%2F%2Fgithub.com%2Fadvancedengineeredsoftware%22%7D%2C%22captured_at%22%3A%222026-07-15T03%3A53%3A14.351Z%22%7D';
    const fromEncoded = parsePendingInstallationCookieValue(encoded);
    expect(fromEncoded?.installation_id).toBe(146662656);
    expect(fromEncoded?.setup_action).toBe('install');
    expect(fromEncoded?.account?.login).toBe('advancedengineeredsoftware');

    // String form still accepted (query-style / hand-edited cookies).
    expect(
      parsePendingInstallationCookieValue(
        JSON.stringify({ installation_id: '131722518', setup_action: 'install' }),
      )?.installation_id,
    ).toBe(131722518);
  });

  it('claims staged install from Cookie header when cookies() store is empty', async () => {
    const cookieBody = JSON.stringify({
      installation_id: 146662656,
      setup_action: 'install',
      state: null,
      account: { login: 'advancedengineeredsoftware' },
      captured_at: '2026-07-15T03:53:14.351Z',
    });

    const { claimPendingGitHubInstallation } = await import(
      '@/app/tps/github/_callback-handler'
    );
    const request = new Request('https://www.bitcode.exchange/api/vcs/github/connection', {
      headers: {
        cookie: `bitcode_github_installation_pending=${encodeURIComponent(cookieBody)}`,
      },
    });

    const result = await claimPendingGitHubInstallation(request as any);
    // Account login comes from getInstallation (mock), not only the staged cookie.
    expect(result.claimed).toBe(true);
    expect(result.installationId).toBe(146662656);
    expect(result.account).toBe('octocat');
    expect(mockGetInstallation).toHaveBeenCalledWith(146662656);
    expect(mockGenerateInstallationToken).toHaveBeenCalledWith(146662656);
    expect(mockSaveConnection).toHaveBeenCalledWith(
      'user-1',
      'github',
      expect.objectContaining({
        accessToken: 'ghs_installation_token',
        providerUserId: '146662656',
        metadata: expect.objectContaining({
          auth_source: 'github_app_installation',
          installation_id: 146662656,
        }),
      }),
    );
  });
});
