import GitHubProvider from '../providers/github-provider';

const octokitInstances: Array<{
  options: any;
  users: { getAuthenticated: jest.Mock };
  pulls: { create: jest.Mock; list: jest.Mock };
}> = [];
const mockPullsCreate = jest.fn();
const mockPullsList = jest.fn();

const pullRequestFixture = {
  id: 101,
  number: 7,
  title: 'Deliver AssetPack',
  body: 'AssetPack delivery',
  state: 'open',
  head: { ref: 'bitcode/asset-pack-run' },
  base: { ref: 'main' },
  user: { id: 42, login: 'monalisa', avatar_url: 'https://avatars.example.com/u/42' },
  created_at: '2026-05-18T00:00:00.000Z',
  updated_at: '2026-05-18T00:01:00.000Z',
  merged_at: null,
  html_url: 'https://github.com/engineeredsoftware/ENGI/pull/7'
};

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation((options: any) => {
      const instance = {
        users: {
          getAuthenticated: jest.fn().mockResolvedValue({
            data: {
              id: 42,
              login: 'monalisa',
              name: 'Mona Lisa',
              email: 'mona@example.com',
              avatar_url: 'https://avatars.example.com/u/42',
              html_url: 'https://github.com/monalisa'
            }
          })
        },
        pulls: {
          create: mockPullsCreate,
          list: mockPullsList
        }
      };
      octokitInstances.push({ options, users: instance.users, pulls: instance.pulls });
      return instance;
    })
  };
});

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn()
}));

jest.mock('@octokit/webhooks-methods', () => ({
  verify: jest.fn().mockResolvedValue(true)
}));

const baseConfig = {
  provider: 'github' as const,
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'https://app.test/oauth/callback'
};

describe('GitHubProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    octokitInstances.length = 0;
    mockPullsCreate.mockResolvedValue({ data: pullRequestFixture });
    mockPullsList.mockResolvedValue({ data: [pullRequestFixture] });
  });

  it('builds authorization URLs with scopes and state', () => {
    const provider = new GitHubProvider(baseConfig);
    const url = provider.getAuthorizationUrl('state-123', ['repo', 'user:email']);

    expect(url).toContain('client_id=client-id');
    expect(url).toContain('scope=repo+user%3Aemail');
    expect(url).toContain('state=state-123');
  });

  it('caches Octokit clients per access token during validation', async () => {
    const provider = new GitHubProvider(baseConfig);

    const result = await provider.validateToken({ accessToken: 'ghu_token' });
    expect(result).toBe(true);
    expect(octokitInstances).toHaveLength(1);
    expect(octokitInstances[0]?.options).toMatchObject({
      auth: 'ghu_token',
      baseUrl: 'https://api.github.com'
    });

    await provider.validateToken({ accessToken: 'ghu_token' });
    expect(octokitInstances).toHaveLength(1);

    await provider.validateToken({ accessToken: 'ghs_installation_token' });
    expect(octokitInstances).toHaveLength(2);
  });

  it('returns the existing pull request when create is retried for the same branch', async () => {
    const provider = new GitHubProvider(baseConfig);

    const existingPrError = Object.assign(
      new Error(
        'Validation Failed: {"resource":"PullRequest","code":"custom","message":"A pull request already exists for engineeredsoftware:bitcode/asset-pack-run."}'
      ),
      { status: 422 }
    );

    mockPullsCreate.mockRejectedValueOnce(existingPrError);

    const result = await provider.createPullRequest(
      { accessToken: 'ghu_token' },
      'engineeredsoftware',
      'ENGI',
      {
        title: 'Deliver AssetPack',
        description: 'AssetPack delivery',
        sourceBranch: 'bitcode/asset-pack-run',
        targetBranch: 'main',
        draft: true
      }
    );

    expect(result).toMatchObject({
      number: 7,
      url: 'https://github.com/engineeredsoftware/ENGI/pull/7',
      sourceBranch: 'bitcode/asset-pack-run',
      targetBranch: 'main'
    });
    expect(mockPullsList).toHaveBeenCalledWith({
      owner: 'engineeredsoftware',
      repo: 'ENGI',
      state: 'open',
      head: 'engineeredsoftware:bitcode/asset-pack-run',
      base: 'main',
      per_page: 10
    });
  });
});
