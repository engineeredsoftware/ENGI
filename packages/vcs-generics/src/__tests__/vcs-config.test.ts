import {
  getVCSConfig,
  getProviderScopes,
  mapWebhookEvents,
  VCS_VERSION,
  VCS_FEATURES
} from '..';

describe('@bitcode/vcs configuration helpers', () => {
  beforeEach(() => {
    process.env.GITHUB_CLIENT_ID = 'gh-client';
    process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
    process.env.GITHUB_REDIRECT_URI = 'https://app.test/github';
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_PRIVATE_KEY = 'private-key';
    process.env.GITHUB_WEBHOOK_SECRET = 'secret';
  });

  afterEach(() => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GITHUB_REDIRECT_URI;
    delete process.env.GITHUB_APP_CLIENT_ID;
    delete process.env.GITHUB_APP_CLIENT_SECRET;
    delete process.env.GITHUB_APP_REDIRECT_URI;
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_PRIVATE_KEY;
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  it('constructs GitHub config from environment variables', () => {
    const cfg = getVCSConfig('github');

    expect(cfg.provider).toBe('github');
    expect(cfg.clientId).toBe('gh-client');
    expect((cfg as any).appId).toBe('12345');
    expect((cfg as any).privateKey).toBe('private-key');
  });

  it('prefers GitHub App OAuth client aliases when present', () => {
    process.env.GITHUB_APP_CLIENT_ID = 'app-client';
    process.env.GITHUB_APP_CLIENT_SECRET = 'app-secret';
    process.env.GITHUB_APP_REDIRECT_URI = 'https://app.test/github/callback';

    const cfg = getVCSConfig('github');

    expect(cfg.clientId).toBe('app-client');
    expect(cfg.clientSecret).toBe('app-secret');
    expect(cfg.redirectUri).toBe('https://app.test/github/callback');
  });

  it('returns provider-specific OAuth scopes', () => {
    expect(getProviderScopes('github')).toContain('repo');
    expect(getProviderScopes('gitlab')).toContain('read_repository');
    expect(getProviderScopes('bitbucket')).toContain('repository');
    expect(getProviderScopes('bitbucket')).not.toContain('unknown');
    expect(getProviderScopes('github').length).toBeGreaterThan(0);
  });

  it('maps webhook events without mutation', () => {
    const events = { action: 'push' };
    expect(mapWebhookEvents('github', events)).toBe(events);
  });

  it('exposes version and feature metadata', () => {
    expect(VCS_VERSION).toMatch(/^1\./);
    expect(VCS_FEATURES.CACHE_ENABLED).toBe(true);
  });
});
