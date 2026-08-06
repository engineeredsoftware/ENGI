/**
 * @jest-environment node
 */

import {
  classifyGitHubInstallError,
  buildGitHubInstallDiagnostic,
  extractGitHubHttpStatus,
  readInstallUrlSlug,
} from '@/lib/github-install-diagnostics';
import {
  resolveBitcodeCookieDomain,
  resolveCanonicalAppOrigin,
  shouldUseSecureCookies,
  buildBitcodeCookieOptions,
} from '@/lib/bitcode-request-host';

describe('classifyGitHubInstallError', () => {
  it('classifies missing credentials', () => {
    expect(
      classifyGitHubInstallError('anything', { hasAppId: false, hasPrivateKey: true }),
    ).toBe('credentials');
    expect(classifyGitHubInstallError('github_app_not_configured')).toBe('credentials');
    expect(classifyGitHubInstallError('GITHUB_PRIVATE_KEY must be an RSA private key PEM')).toBe(
      'credentials',
    );
  });

  it('classifies 404/401 as app_mismatch when credentials are present', () => {
    expect(
      classifyGitHubInstallError('Failed to generate installation token: 404 Not Found', {
        hasAppId: true,
        hasPrivateKey: true,
      }),
    ).toBe('app_mismatch');
    expect(
      classifyGitHubInstallError('Failed to get installation: 401 Bad credentials', {
        hasAppId: true,
        hasPrivateKey: true,
      }),
    ).toBe('app_mismatch');
  });

  it('classifies session_required', () => {
    expect(classifyGitHubInstallError('session_required')).toBe('session');
  });
});

describe('extractGitHubHttpStatus', () => {
  it('reads status codes from error text', () => {
    expect(extractGitHubHttpStatus('Failed: 404 {"message":"Not Found"}')).toBe(404);
    expect(extractGitHubHttpStatus('no status here')).toBeNull();
  });
});

describe('buildGitHubInstallDiagnostic', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('emits source-safe fields without secrets', () => {
    process.env.GITHUB_APP_ID = '4224019';
    process.env.GITHUB_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----';
    process.env.NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL =
      'https://github.com/apps/bitcode-github-auxiliary';

    const diagnostic = buildGitHubInstallDiagnostic({
      event: 'installation-callback-failed',
      installationId: 99,
      host: 'bitcode.exchange',
      message: 'Failed to get installation: 404 Not Found',
      hasSession: true,
    });

    expect(diagnostic.configuredAppId).toBe('4224019');
    expect(diagnostic.hasPrivateKey).toBe(true);
    expect(diagnostic.installUrlSlug).toBe('bitcode-github-auxiliary');
    expect(diagnostic.errorClass).toBe('app_mismatch');
    expect(diagnostic.githubStatus).toBe(404);
    expect(JSON.stringify(diagnostic)).not.toMatch(/BEGIN RSA|PRIVATE KEY|token/i);
  });

  it('defaults install slug from code constant', () => {
    delete process.env.NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL;
    expect(readInstallUrlSlug()).toBe('bitcode-github-auxiliary');
  });
});

describe('bitcode-request-host', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('shares cookie domain across apex and www', () => {
    expect(resolveBitcodeCookieDomain('bitcode.exchange')).toBe('.bitcode.exchange');
    expect(resolveBitcodeCookieDomain('www.bitcode.exchange')).toBe('.bitcode.exchange');
    expect(resolveBitcodeCookieDomain('localhost')).toBeUndefined();
    expect(resolveBitcodeCookieDomain('bitcode-git-preview.vercel.app')).toBeUndefined();
  });

  it('prefers NEXT_PUBLIC_APP_URL for canonical origin', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.bitcode.exchange';
    const origin = resolveCanonicalAppOrigin(
      new Request('https://bitcode.exchange/tps/github/callback?installation_id=1'),
    );
    expect(origin).toBe('https://www.bitcode.exchange');
  });

  it('falls back to request origin when APP_URL unset', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const origin = resolveCanonicalAppOrigin(
      new Request('https://bitcode.exchange/tps/github/callback'),
    );
    expect(origin).toBe('https://bitcode.exchange');
  });

  it('marks bitcode.exchange cookies secure', () => {
    expect(shouldUseSecureCookies('bitcode.exchange')).toBe(true);
    const options = buildBitcodeCookieOptions(
      new Request('https://www.bitcode.exchange/tps/github/callback'),
      { maxAge: 900 },
    );
    expect(options.domain).toBe('.bitcode.exchange');
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.maxAge).toBe(900);
  });
});
