import BitbucketProvider from '../providers/bitbucket-provider';

const baseConfig = {
  provider: 'bitbucket' as const,
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'https://app.test/oauth/bitbucket',
  workspace: 'test-workspace'
};

describe('BitbucketProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('builds Bitbucket OAuth authorization URLs with scopes and state', () => {
    const provider = new BitbucketProvider(baseConfig);
    const url = provider.getAuthorizationUrl('state-1', ['repository', 'team']);

    expect(url).toContain('https://bitbucket.org/site/oauth2/authorize');
    expect(url).toContain('client_id=client-id');
    expect(url).toContain('scope=repository+team');
    expect(url).toContain('state=state-1');
  });

  it('validates tokens by calling the profile endpoint', async () => {
    const provider = new BitbucketProvider(baseConfig);

    ((global as any).fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ uuid: '{user}' }),
      headers: { get: () => 'application/json' },
      status: 200
    });

    const result = await provider.validateToken({ accessToken: 'token' });

    expect(result).toBe(true);
    expect((global as any).fetch).toHaveBeenCalledWith(
      'https://api.bitbucket.org/2.0/user',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer token' })
      })
    );
  });
});
