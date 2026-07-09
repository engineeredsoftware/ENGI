// Fallback = the production-mainnet GitHub App. Non-production environments
// set NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL to their own app (staging-testnet:
// https://github.com/apps/bitcode-github-auxillary-stag-test).
export const BITCODE_GITHUB_APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL?.trim() ||
  'https://github.com/apps/bitcode-github-auxillary';
