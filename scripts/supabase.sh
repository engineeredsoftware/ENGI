#!/usr/bin/env bash

# Supabase CLI wrapper with env preparation
# Usage examples:
#   scripts/supabase.sh db:reset
#   scripts/supabase.sh db:push
#   scripts/supabase.sh db:dump --schema-only
#   scripts/supabase.sh start
#   scripts/supabase.sh stop
#   scripts/supabase.sh env:print

set -euo pipefail

HERE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE_DIR/.." && pwd)"
SUPABASE_DIR="$REPO_ROOT/supabase"

load_env() {
  # Robust dotenv loader: only export known-safe keys, ignore malformed lines
  local files=(
    "$REPO_ROOT/.env.local"
    "$REPO_ROOT/.env"
    "$REPO_ROOT/apps/uapi/.env.local"
    "$REPO_ROOT/apps/uapi/.env"
  )
  local allow_re='^(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY|SUPABASE_JWT_SECRET|SUPABASE_AUTH_GOOGLE_CLIENT_ID|SUPABASE_AUTH_GOOGLE_CLIENT_SECRET|SUPABASE_AUTH_GITHUB_CLIENT_ID|SUPABASE_AUTH_GITHUB_CLIENT_SECRET)='
  for f in "${files[@]}"; do
    [[ -f "$f" ]] || continue
    while IFS= read -r line || [[ -n "$line" ]]; do
      # Trim leading/trailing whitespace
      line="${line#${line%%[![:space:]]*}}"; line="${line%${line##*[![:space:]]}}"
      [[ -z "$line" ]] && continue
      [[ "$line" == \#* ]] && continue
      # Match KEY=VALUE (optionally with 'export ' prefix)
      if [[ "$line" =~ ^([[:space:]]*export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        local key="${BASH_REMATCH[2]}"
        local val="${BASH_REMATCH[3]}"
        # Only allow known-safe keys for Supabase CLI
        if [[ "$key" =~ ${allow_re%*=} ]]; then
          # Strip surrounding quotes from value
          if [[ "$val" =~ ^\".*\"$ ]]; then
            val="${val:1:${#val}-2}"
          elif [[ "$val" =~ ^\'.*\'$ ]]; then
            val="${val:1:${#val}-2}"
          fi
          export "$key"="$val"
        fi
      fi
    done < "$f"
  done

  # Map common synonyms if SUPABASE_AUTH_* variables are missing
  if [[ -z "${SUPABASE_AUTH_GITHUB_CLIENT_ID:-}" ]]; then
    if [[ -n "${GITHUB_APP_CLIENT_ID:-}" ]]; then export SUPABASE_AUTH_GITHUB_CLIENT_ID="$GITHUB_APP_CLIENT_ID"; fi
    if [[ -n "${GITHUB_OAUTH_CLIENT_ID:-}" && -z "${SUPABASE_AUTH_GITHUB_CLIENT_ID:-}" ]]; then export SUPABASE_AUTH_GITHUB_CLIENT_ID="$GITHUB_OAUTH_CLIENT_ID"; fi
  fi
  if [[ -z "${SUPABASE_AUTH_GITHUB_CLIENT_SECRET:-}" ]]; then
    if [[ -n "${GITHUB_APP_CLIENT_SECRET:-}" ]]; then export SUPABASE_AUTH_GITHUB_CLIENT_SECRET="$GITHUB_APP_CLIENT_SECRET"; fi
    if [[ -n "${GITHUB_OAUTH_CLIENT_SECRET:-}" && -z "${SUPABASE_AUTH_GITHUB_CLIENT_SECRET:-}" ]]; then export SUPABASE_AUTH_GITHUB_CLIENT_SECRET="$GITHUB_OAUTH_CLIENT_SECRET"; fi
  fi
  if [[ -z "${SUPABASE_AUTH_GOOGLE_CLIENT_ID:-}" ]]; then
    if [[ -n "${GOOGLE_CLIENT_ID:-}" ]]; then export SUPABASE_AUTH_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"; fi
    if [[ -n "${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-}" && -z "${SUPABASE_AUTH_GOOGLE_CLIENT_ID:-}" ]]; then export SUPABASE_AUTH_GOOGLE_CLIENT_ID="$NEXT_PUBLIC_GOOGLE_CLIENT_ID"; fi
  fi
  if [[ -z "${SUPABASE_AUTH_GOOGLE_CLIENT_SECRET:-}" ]]; then
    if [[ -n "${GOOGLE_CLIENT_SECRET:-}" ]]; then export SUPABASE_AUTH_GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"; fi
    if [[ -n "${NEXT_PUBLIC_GOOGLE_CLIENT_SECRET:-}" && -z "${SUPABASE_AUTH_GOOGLE_CLIENT_SECRET:-}" ]]; then export SUPABASE_AUTH_GOOGLE_CLIENT_SECRET="$NEXT_PUBLIC_GOOGLE_CLIENT_SECRET"; fi
  fi
}

ensure_supabase_dir() {
  if [[ ! -d "$SUPABASE_DIR" ]]; then
    echo "[supabase.sh] Error: supabase directory not found at $SUPABASE_DIR" >&2
    exit 1
  fi
}

run_supabase() {
  if ! command -v supabase >/dev/null 2>&1; then
    echo "[supabase.sh] Error: supabase CLI not found. Install from https://supabase.com/docs/guides/cli" >&2
    exit 1
  fi
  ( cd "$SUPABASE_DIR" && supabase "$@" )
}

cmd="${1:-}"
shift || true

case "$cmd" in
  ""|-h|--help|help)
    cat << EOF
Supabase wrapper (loads repo env and runs supabase CLI in ./supabase)

Commands:
  db:reset              → supabase db reset
  db:push               → supabase db push
  db:dump [args...]     → supabase db dump [args]
  start                 → supabase start
  stop                  → supabase stop
  env:print             → print key env variables seen by this wrapper
  gen:types             → pnpm -C packages/orm run generate-types
  codegen:db            → pnpm -C packages/orm run codegen:db

Pass through:
  Any other arguments will be passed directly to the supabase CLI.
EOF
    ;;

  env:print)
    load_env
    echo "REPO_ROOT=$REPO_ROOT"
    echo "SUPABASE_URL=${SUPABASE_URL:-}"
    echo "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-}"
    echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:+[set]}"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:+[set]}"
    echo "SUPABASE_AUTH_GOOGLE_CLIENT_ID=${SUPABASE_AUTH_GOOGLE_CLIENT_ID:+[set]}"
    echo "SUPABASE_AUTH_GOOGLE_CLIENT_SECRET=${SUPABASE_AUTH_GOOGLE_CLIENT_SECRET:+[set]}"
    echo "SUPABASE_AUTH_GITHUB_CLIENT_ID=${SUPABASE_AUTH_GITHUB_CLIENT_ID:+[set]}"
    echo "SUPABASE_AUTH_GITHUB_CLIENT_SECRET=${SUPABASE_AUTH_GITHUB_CLIENT_SECRET:+[set]}"
    ;;

  env:debug)
    # Verbose diagnostics: which files exist and which keys are set
    echo "[supabase.sh] Candidate env files:"
    for f in "$REPO_ROOT/.env.local" "$REPO_ROOT/.env" "$REPO_ROOT/apps/uapi/.env.local" "$REPO_ROOT/apps/uapi/.env"; do
      if [[ -f "$f" ]]; then echo "  [found]  $f"; else echo "  [missing] $f"; fi
    done
    load_env
    echo "[supabase.sh] Effective env keys:"
    printf "  %-36s %s\n" SUPABASE_URL "${SUPABASE_URL:-}"
    printf "  %-36s %s\n" NEXT_PUBLIC_SUPABASE_URL "${NEXT_PUBLIC_SUPABASE_URL:-}"
    printf "  %-36s %s\n" SUPABASE_SERVICE_ROLE_KEY "${SUPABASE_SERVICE_ROLE_KEY:+[set]}"
    printf "  %-36s %s\n" SUPABASE_ANON_KEY "${SUPABASE_ANON_KEY:+[set]}"
    printf "  %-36s %s\n" NEXT_PUBLIC_SUPABASE_ANON_KEY "${NEXT_PUBLIC_SUPABASE_ANON_KEY:+[set]}"
    printf "  %-36s %s\n" SUPABASE_JWT_SECRET "${SUPABASE_JWT_SECRET:+[set]}"
    printf "  %-36s %s\n" SUPABASE_AUTH_GOOGLE_CLIENT_ID "${SUPABASE_AUTH_GOOGLE_CLIENT_ID:+[set]}"
    printf "  %-36s %s\n" SUPABASE_AUTH_GOOGLE_CLIENT_SECRET "${SUPABASE_AUTH_GOOGLE_CLIENT_SECRET:+[set]}"
    printf "  %-36s %s\n" SUPABASE_AUTH_GITHUB_CLIENT_ID "${SUPABASE_AUTH_GITHUB_CLIENT_ID:+[set]}"
    printf "  %-36s %s\n" SUPABASE_AUTH_GITHUB_CLIENT_SECRET "${SUPABASE_AUTH_GITHUB_CLIENT_SECRET:+[set]}"
    ;;

  db:reset)
    load_env; ensure_supabase_dir; run_supabase db reset "$@" ;;
  db:push)
    load_env; ensure_supabase_dir; run_supabase db push "$@" ;;
  db:dump)
    load_env; ensure_supabase_dir; run_supabase db dump "$@" ;;
  start)
    load_env; ensure_supabase_dir; run_supabase start "$@" ;;
  stop)
    load_env; ensure_supabase_dir; run_supabase stop "$@" ;;

  gen:types)
    load_env; ( cd "$REPO_ROOT" && pnpm -C packages/orm run generate-types ) ;;
  codegen:db)
    load_env; ( cd "$REPO_ROOT" && pnpm -C packages/orm run codegen:db ) ;;

  *)
    # Pass-through to supabase CLI with env loaded
    load_env; ensure_supabase_dir; run_supabase "$cmd" "$@" ;;
esac
