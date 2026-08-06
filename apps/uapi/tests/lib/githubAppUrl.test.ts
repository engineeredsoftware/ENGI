/**
 * Single GitHub App public URL SSOT — stale dual-app links rewrite.
 */
import {
  BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL,
  BITCODE_GITHUB_APP_SLUG,
  BITCODE_GITHUB_APP_STALE_SLUGS,
  resolveBitcodeGithubAppPublicUrl,
} from '@/lib/github-app-url';

describe('github-app-url', () => {
  it('defaults to the single canonical app install URL', () => {
    expect(resolveBitcodeGithubAppPublicUrl(undefined)).toBe(
      BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL,
    );
    expect(resolveBitcodeGithubAppPublicUrl('')).toBe(
      BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL,
    );
    expect(BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL).toBe(
      `https://github.com/apps/${BITCODE_GITHUB_APP_SLUG}`,
    );
    expect(BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL).toBe(
      'https://github.com/apps/bitcode-github-auxiliary',
    );
  });

  it('rewrites known stale dual-app and misspelled install URLs', () => {
    expect(BITCODE_GITHUB_APP_STALE_SLUGS.length).toBeGreaterThan(0);
    for (const slug of BITCODE_GITHUB_APP_STALE_SLUGS) {
      expect(
        resolveBitcodeGithubAppPublicUrl(`https://github.com/apps/${slug}`),
      ).toBe('https://github.com/apps/bitcode-github-auxiliary');
    }
  });

  it('normalizes a correct override to the canonical URL', () => {
    expect(
      resolveBitcodeGithubAppPublicUrl(
        'https://github.com/apps/bitcode-github-auxiliary/',
      ),
    ).toBe('https://github.com/apps/bitcode-github-auxiliary');
  });
});
