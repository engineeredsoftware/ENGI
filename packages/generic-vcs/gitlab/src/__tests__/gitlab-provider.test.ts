import GitLabProvider from '../providers/gitlab-provider';

const baseConfig = {
  provider: 'gitlab' as const,
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'https://app.test/oauth/gitlab',
  instanceUrl: 'https://gitlab.example.com'
};

describe('GitLabProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('builds authorization URLs with scopes and state', () => {
    const provider = new GitLabProvider(baseConfig);
    const url = provider.getAuthorizationUrl('nonce-1', ['api', 'write_repository']);

    expect(url).toContain('https://gitlab.example.com/oauth/authorize');
    expect(url).toContain('client_id=client-id');
    expect(url).toContain('scope=api+write_repository');
    expect(url).toContain('state=nonce-1');
  });

  it('performs authenticated requests when validating tokens', async () => {
    const provider = new GitLabProvider(baseConfig);

    ((global as any).fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 1 }),
      status: 200
    });

    const result = await provider.validateToken({ accessToken: 'gitlab-token' });

    expect(result).toBe(true);
    expect((global as any).fetch).toHaveBeenCalledWith(
      'https://gitlab.example.com/api/v4/user',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer gitlab-token'
        })
      })
    );
  });
});
