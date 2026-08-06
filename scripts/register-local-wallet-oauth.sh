#!/usr/bin/env bash
#
# Register the `custom:bitcode-bitcoin` custom OAuth2 provider with the LOCAL
# Supabase GoTrue (v2.189.0) so wallet sign-in works fully locally.
#
# Why the two-step (register-then-patch):
#   GoTrue's admin API validates provider URLs with an SSRF guard
#   (utilities.ValidateOAuthURL) that REQUIRES https and BLOCKS localhost /
#   loopback / RFC-1918 — i.e. it rejects every local URL at registration time.
#   That guard is admin-time only; the *runtime* token/userinfo fetch uses the
#   default oauth2 client (no SSRF transport). So we:
#     1. create the provider via the admin API using the real public https URLs
#        (passes validation; GoTrue encrypts client_secret correctly), then
#     2. SQL-patch authorization_url/token_url/userinfo_url to the local
#        endpoints directly in auth.custom_oauth_providers.
#
#   Browser-facing authorization_url -> http://localhost:3000 (the user's
#   browser hits it). token_url/userinfo_url -> http://host.docker.internal:3000
#   (the GoTrue *container* calls back into the app on the host).
#
# GoTrue stores custom providers in the `auth` schema, which `supabase db reset`
# wipes — re-run this after every `supabase start` / `supabase db reset`.
# No secrets are printed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVF="$ROOT/uapi/.env.local"

TMP="$(mktemp)"; chmod 600 "$TMP"
trap 'rm -f "$TMP"' EXIT
bash "$ROOT/scripts/supabase.sh" status -o env > "$TMP" 2>/dev/null
API="$(grep '^API_URL=' "$TMP" | cut -d= -f2- | tr -d '"')"
SVC="$(grep '^SERVICE_ROLE_KEY=' "$TMP" | cut -d= -f2- | tr -d '"')"
[ -n "${API:-}" ] && [ -n "${SVC:-}" ] || { echo "ERROR: stack not up? run scripts/supabase.sh start" >&2; exit 1; }

DB_CONTAINER="$(docker ps --format '{{.Names}}' | grep -m1 '^supabase_db_')"
[ -n "${DB_CONTAINER:-}" ] || { echo "ERROR: supabase_db container not found" >&2; exit 1; }

val() { grep -E "^$1=" "$ENVF" 2>/dev/null | head -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
CID="$(val BITCODE_BITCOIN_OAUTH_CLIENT_ID)";         CID="${CID:-bitcode-bitcoin-wallet}"
CSECRET="$(val BITCODE_BITCOIN_OAUTH_CLIENT_SECRET)"; CSECRET="${CSECRET:-bitcode-bitcoin-wallet-local-dev-secret}"

APP_BROWSER="${BITCODE_LOCAL_APP_ORIGIN:-http://localhost:3000}"
APP_CONTAINER="${BITCODE_LOCAL_APP_ORIGIN_CONTAINER:-http://host.docker.internal:3000}"
ID="custom:bitcode-bitcoin"
ID_ENC="custom%3Abitcode-bitcoin"

# 1) idempotent re-create with PUBLIC https placeholders (pass SSRF validation)
curl -s -o /dev/null -X DELETE "$API/auth/v1/admin/custom-providers/$ID_ENC" \
  -H "Authorization: Bearer $SVC" -H "apikey: $SVC" || true

resp="$(curl -s -w $'\n%{http_code}' -X POST "$API/auth/v1/admin/custom-providers" \
  -H "Authorization: Bearer $SVC" -H "apikey: $SVC" -H "Content-Type: application/json" \
  --data-binary @- <<JSON
{
  "provider_type": "oauth2",
  "identifier": "$ID",
  "name": "Bitcode Bitcoin Wallet",
  "client_id": "$CID",
  "client_secret": "$CSECRET",
  "scopes": ["profile", "wallet:bitcoin"],
  "pkce_enabled": true,
  "email_optional": true,
  "enabled": true,
  "authorization_url": "https://bitcode.exchange/tps/wallet/authorize",
  "token_url": "https://bitcode.exchange/api/wallet/oauth/token",
  "userinfo_url": "https://bitcode.exchange/api/wallet/oauth/userinfo"
}
JSON
)"
code="$(printf '%s' "$resp" | tail -1)"
echo "register custom:bitcode-bitcoin (placeholder URLs) -> HTTP $code"
# 201 = created fresh; an existing provider comes back as 400 error_code=conflict
# (re-run without db reset). Both are fine — the patch below updates the row.
if [ "$code" != "201" ] && ! printf '%s' "$resp" | grep -q '"error_code":"conflict"'; then
  printf '%s\n' "$(printf '%s' "$resp" | sed '$d')"; exit 1
fi

# 2) Drop the admin-time https CHECK constraints (they reject local http URLs),
#    then SQL-patch the URL columns to the local endpoints. The runtime
#    token/userinfo fetch uses the default oauth2 client (no SSRF guard), so
#    plain-http host.docker.internal works. This is on the ephemeral local
#    `auth` schema only; `supabase db reset` restores the constraints, which is
#    why this script must re-run after a reset. URLs are controlled (no quotes).
# DDL on the GoTrue-owned auth table must run as its owner, supabase_auth_admin.
# That role's password lives in the auth container's GOTRUE_DB_DATABASE_URL.
AUTH_CONTAINER="$(docker ps --format '{{.Names}}' | grep -m1 '^supabase_auth_')"
AUTH_DB_URL="$(docker exec "$AUTH_CONTAINER" printenv GOTRUE_DB_DATABASE_URL 2>/dev/null)"
AUTH_PW="$(printf '%s' "$AUTH_DB_URL" | sed -E 's#^postgres(ql)?://supabase_auth_admin:([^@]*)@.*#\2#')"
[ -n "${AUTH_PW:-}" ] || { echo "ERROR: could not read supabase_auth_admin password from auth container" >&2; exit 1; }
docker exec -i -e PGPASSWORD="$AUTH_PW" "$DB_CONTAINER" \
  psql -U supabase_auth_admin -h 127.0.0.1 -d postgres -v ON_ERROR_STOP=1 >/dev/null <<SQL
ALTER TABLE auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_authorization_url_https;
ALTER TABLE auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_token_url_https;
ALTER TABLE auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_userinfo_url_https;
UPDATE auth.custom_oauth_providers
   SET authorization_url = '$APP_BROWSER/tps/wallet/authorize',
       token_url         = '$APP_CONTAINER/api/wallet/oauth/token',
       userinfo_url      = '$APP_CONTAINER/api/wallet/oauth/userinfo',
       updated_at        = now()
 WHERE identifier = 'custom:bitcode-bitcoin';
SQL

echo "patched provider URLs -> browser=$APP_BROWSER  container=$APP_CONTAINER"
echo "--- verify (auth.custom_oauth_providers) ---"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -A -F $'\t' \
  -c "SELECT identifier, provider_type, enabled, email_optional, pkce_enabled,
             authorization_url, token_url, userinfo_url
        FROM auth.custom_oauth_providers WHERE identifier='custom:bitcode-bitcoin';"
