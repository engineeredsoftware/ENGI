/**
 * Single Bitcode GitHub App — one registration for every environment
 * (local, preview, staging, production). Operators install/uninstall this
 * same app on any GitHub account; credentials (`GITHUB_APP_ID`,
 * `GITHUB_PRIVATE_KEY`, client id/secret) must match this app on all deploys.
 *
 * Public install URL (canonical, only):
 * https://github.com/apps/bitcode-github-auxiliary
 *
 * Optional `NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL` may only restate that same app.
 * Any other github.com/apps/* slug (including historical dual-app / misspelled
 * names) is rewritten to the canonical link so product UI never surfaces a
 * stale install path.
 */

export const BITCODE_GITHUB_APP_SLUG = 'bitcode-github-auxiliary' as const;

export const BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL =
  `https://github.com/apps/${BITCODE_GITHUB_APP_SLUG}` as const;

/**
 * Historical dual-app / misspelled install slugs that must never be linked.
 * Law: only `bitcode-github-auxiliary` is the Bitcode GitHub App.
 */
export const BITCODE_GITHUB_APP_STALE_SLUGS = Object.freeze([
  'bitcode-github-auxillary',
  'bitcode-github-auxillary-stag-test',
  'bitcode-github-app-auxillary',
  'bitcode-github-app-auxiliary',
  'bitcode-github-auxiliary-stag-test',
] as const);

function slugFromGithubAppsUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (!/github\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    // /apps/<slug>
    if (parts.length >= 2 && parts[0].toLowerCase() === 'apps') {
      return parts[1].toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve the public install URL. Always returns the single canonical app
 * install link. Env overrides that restate that slug normalize to the same
 * URL; any other /apps/* slug (including known dual-app history) is treated
 * as stale and rewritten.
 */
export function resolveBitcodeGithubAppPublicUrl(
  envValue: string | null | undefined = process.env.NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL,
): string {
  const raw = typeof envValue === 'string' ? envValue.trim() : '';
  if (!raw) return BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL;

  const slug = slugFromGithubAppsUrl(raw);
  // Only the single SSOT slug is legal; everything else (including known
  // dual-app history in BITCODE_GITHUB_APP_STALE_SLUGS) collapses to canonical.
  if (slug === BITCODE_GITHUB_APP_SLUG) {
    return BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL;
  }
  return BITCODE_GITHUB_APP_CANONICAL_PUBLIC_URL;
}

export const BITCODE_GITHUB_APP_PUBLIC_URL = resolveBitcodeGithubAppPublicUrl();
