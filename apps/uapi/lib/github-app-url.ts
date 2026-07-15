/**
 * Single Bitcode GitHub App — one registration for every environment
 * (local, preview, staging, production). Operators install/uninstall this
 * same app on any GitHub account; credentials (`GITHUB_APP_ID`,
 * `GITHUB_PRIVATE_KEY`, client id/secret) must match this app on all deploys.
 *
 * Public install URL:
 * https://github.com/apps/bitcode-github-auxiliary
 *
 * Optional `NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL` override is only for emergency
 * redirects; keep it pointed at the same app slug.
 */
export const BITCODE_GITHUB_APP_SLUG = 'bitcode-github-auxiliary' as const;

export const BITCODE_GITHUB_APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL?.trim() ||
  `https://github.com/apps/${BITCODE_GITHUB_APP_SLUG}`;
