#!/usr/bin/env bash
# Bring up the STAGING-TESTNET environment (Supabase project mwugicjpxmrtctvjghjg
# + Vercel testnet.bitcode.exchange). Idempotent; run pieces via flags.
#
# Prerequisites (interactive, once):
#   supabase login                # or export SUPABASE_ACCESS_TOKEN
#   vercel login                  # then `vercel link` in repo root if unlinked
#
# Secrets file (NOT committed): scripts/.env.staging-testnet
#   copy scripts/.env.staging-testnet.example and fill values.
#
# Usage:
#   scripts/bringup-staging-testnet.sh migrate       # link + push all migrations
#   scripts/bringup-staging-testnet.sh vercel-env    # push env vars to the Vercel custom environment
#   scripts/bringup-staging-testnet.sh verify        # read-only checks (auth authorize probe, bucket)
#   scripts/bringup-staging-testnet.sh all

set -euo pipefail

PROJECT_REF="mwugicjpxmrtctvjghjg"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
SECRETS_FILE="$(dirname "$0")/.env.staging-testnet"
# Vercel custom environment the testnet.bitcode.exchange domain is attached to.
VERCEL_TARGET="${VERCEL_TARGET:-staginglocal-testnet}"

require_secrets() {
  if [[ ! -f "$SECRETS_FILE" ]]; then
    echo "Missing $SECRETS_FILE — copy scripts/.env.staging-testnet.example and fill it." >&2
    exit 1
  fi
  # shellcheck disable=SC1090
  set -a; source "$SECRETS_FILE"; set +a
}

do_migrate() {
  require_secrets
  : "${STAGING_TESTNET_DB_PASSWORD:?fill STAGING_TESTNET_DB_PASSWORD in $SECRETS_FILE}"
  supabase link --project-ref "$PROJECT_REF" --password "$STAGING_TESTNET_DB_PASSWORD"
  supabase db push --password "$STAGING_TESTNET_DB_PASSWORD"
  echo "Migrations pushed to $PROJECT_REF (includes asset-pack-artifacts bucket + RLS)."
}

do_vercel_env() {
  require_secrets
  push_var() {
    local name="$1" value="$2"
    if [[ -z "$value" || "$value" == *"<"* ]]; then
      echo "SKIP $name (value not filled)"
      return
    fi
    # Remove existing value for the target first so re-runs update cleanly.
    vercel env rm "$name" "$VERCEL_TARGET" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$VERCEL_TARGET"
    echo "SET  $name -> $VERCEL_TARGET"
  }

  push_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
  push_var SUPABASE_URL "$SUPABASE_URL"
  push_var NEXT_PUBLIC_SUPABASE_ANON_KEY "${STAGING_TESTNET_ANON_KEY:-}"
  push_var SUPABASE_ANON_KEY "${STAGING_TESTNET_ANON_KEY:-}"
  push_var SUPABASE_PUBLISHABLE_KEY "${STAGING_TESTNET_PUBLISHABLE_KEY:-${STAGING_TESTNET_ANON_KEY:-}}"
  push_var NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "${STAGING_TESTNET_PUBLISHABLE_KEY:-${STAGING_TESTNET_ANON_KEY:-}}"
  push_var SUPABASE_SERVICE_ROLE_KEY "${STAGING_TESTNET_SERVICE_ROLE_KEY:-}"
  push_var SUPABASE_SECRET_KEY "${STAGING_TESTNET_SECRET_KEY:-${STAGING_TESTNET_SERVICE_ROLE_KEY:-}}"
  push_var SUPABASE_JWT_SECRET "${STAGING_TESTNET_JWT_SECRET:-}"
  push_var BITCODE_BITCOIN_OAUTH_CLIENT_SECRET "${STAGING_TESTNET_WALLET_OAUTH_SECRET:-}"
  push_var BITCODE_BITCOIN_OAUTH_SUPABASE_CALLBACK_URL "${SUPABASE_URL}/auth/v1/callback"
  push_var NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK "testnet4"
  push_var GITHUB_APP_ID "${STAGING_TESTNET_GITHUB_APP_ID:-}"
  push_var GITHUB_APP_CLIENT_ID "${STAGING_TESTNET_GITHUB_APP_CLIENT_ID:-}"
  push_var GITHUB_APP_CLIENT_SECRET "${STAGING_TESTNET_GITHUB_APP_CLIENT_SECRET:-}"
  push_var GITHUB_WEBHOOK_SECRET "${STAGING_TESTNET_GITHUB_WEBHOOK_SECRET:-}"
  # Public install link — the code fallback names the PRODUCTION app
  # (bitcode-github-auxillary), so staging must point its surfaces at the
  # stag-test app explicitly.
  push_var NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL \
    "${STAGING_TESTNET_GITHUB_APP_PUBLIC_URL:-https://github.com/apps/bitcode-github-auxillary-stag-test}"
  if [[ -n "${STAGING_TESTNET_GITHUB_PRIVATE_KEY_PATH:-}" && -f "${STAGING_TESTNET_GITHUB_PRIVATE_KEY_PATH}" ]]; then
    push_var GITHUB_PRIVATE_KEY "$(cat "${STAGING_TESTNET_GITHUB_PRIVATE_KEY_PATH}")"
  else
    echo "SKIP GITHUB_PRIVATE_KEY (STAGING_TESTNET_GITHUB_PRIVATE_KEY_PATH unset or file missing)"
  fi
  echo "Done. Redeploy the $VERCEL_TARGET environment to pick up the new values."
}

do_verify() {
  echo "== GoTrue custom-provider authorize probe (expects 302) =="
  curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
    "${SUPABASE_URL}/auth/v1/authorize?provider=custom:bitcode-bitcoin&redirect_to=${SUPABASE_URL}/auth/v1/callback" || true
  echo "== Storage bucket =="
  if [[ -n "${STAGING_TESTNET_SERVICE_ROLE_KEY:-}" ]]; then
    curl -sS "${SUPABASE_URL}/storage/v1/bucket/asset-pack-artifacts" \
      -H "apikey: ${STAGING_TESTNET_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${STAGING_TESTNET_SERVICE_ROLE_KEY}" | head -c 400; echo
  else
    echo "SKIP bucket probe (fill STAGING_TESTNET_SERVICE_ROLE_KEY and re-run)"
  fi
}

case "${1:-all}" in
  migrate) do_migrate ;;
  vercel-env) do_vercel_env ;;
  verify) require_secrets || true; do_verify ;;
  all) do_migrate; do_vercel_env; do_verify ;;
  *) echo "Usage: $0 [migrate|vercel-env|verify|all]" >&2; exit 1 ;;
esac
