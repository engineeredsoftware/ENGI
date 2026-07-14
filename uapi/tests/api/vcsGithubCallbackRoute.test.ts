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
        login: 'engineeredsoftware',
        type: 'Organization',
        html_url: 'https://github.com/engineeredsoftware',
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
          name: 'ENGI',
          full_name: 'engineeredsoftware/ENGI',
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
        providerUsername: 'engineeredsoftware',
        metadata: expect.objectContaining({
          auth_source: 'github_app_installation',
          installation_id: 131722518,
          setup_action: 'install',
          setup_state: 'qa-state',
          target_id: '991',
          target_type: 'Organization',
          account_login: 'engineeredsoftware',
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
});
