-- Saved query name: v48_qa_03_user_connections_token_safe
-- Purpose: confirm wallet and GitHub connections without exposing tokens.
-- This projection NEVER selects access_token/refresh_token/connection_data
-- wholesale — safe to paste into QA threads.
-- Run after: wallet binding write (expect provider leather/xverse/... row,
-- auth_source bitcoin_wallet_oauth_identity) or GitHub App install callback
-- (expect provider github row, auth_source github_app_installation).

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  c.user_id,
  c.provider,
  c.is_active,
  c.connection_data ->> 'auth_source' AS auth_source,
  c.connection_data ->> 'wallet_address' AS wallet_address,
  c.connection_data ->> 'network' AS wallet_network,
  c.connection_data ->> 'verification_state' AS verification_state,
  c.connection_data ->> 'account_login' AS github_account,
  c.connection_data ->> 'installation_id' AS github_installation_id,
  c.connection_data ->> 'repository_selection' AS github_repository_selection,
  c.connection_data ->> 'installation_token_expires_at' AS github_token_expires_at,
  c.updated_at
FROM public.user_connections c
WHERE c.user_id IN (SELECT id FROM qa_user)
ORDER BY c.provider;
