-- Local Supabase seed (referenced by config.toml [db.seed]).
--
-- Intentionally minimal. The V48 local QA fixtures are established at runtime,
-- not seeded as SQL, because they depend on services that own their own schema:
--
--   * The wallet identity + auth.users row is minted by GoTrue when the
--     `custom:bitcode-bitcoin` provider completes a sign-in (see
--     scripts/register-local-wallet-oauth.mjs, run after `supabase start`).
--   * The GitHub App connection (user_connections) + repository inventory
--     (vcs_repositories) are written by the live GitHub App install/callback
--     flow against localhost, exactly as in staging.
--
-- Keeping this file present (even if empty of DML) satisfies the config.toml
-- seed reference so `supabase db reset` does not error on a missing path.

select 'bitcode local seed: no-op (runtime fixtures)' as seed_note;
