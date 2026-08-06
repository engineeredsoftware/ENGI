-- Saved query name: v48_qa_05_track1_readiness_rollup
-- Purpose: one-row Track 1 identity summary — session, identity, profile,
-- wallet binding, GitHub installation, repository count.
-- Run: anytime; the quick "where does Track 1 stand" check.
-- Expect (Track 1 complete): session_minted true, wallet binding populated
-- (payment_address fills after the signed-in reconnect; proof_kind is
-- provider_session for identity-derived binds and bitcoin_message_signature
-- after reconnect), github_installation_id present, repository_count > 0.
-- Note: the wallet connection's auth_source is bitcoin_wallet_oauth_identity
-- for identity-derived binds and bitcoin_wallet_provider after the signed-in
-- panel reconnect — the join accepts both.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  u.id AS auth_user_id,
  (u.last_sign_in_at IS NOT NULL) AS session_minted,
  i.identity_data ->> 'sub' AS bitcoin_subject,
  p.username,
  p.settings #>> '{bitcodeProfile,walletBinding,address}' AS wallet_address,
  p.settings #>> '{bitcodeProfile,walletBinding,paymentAddress}' AS payment_address,
  p.settings #>> '{bitcodeProfile,walletBinding,proofKind}' AS wallet_proof_kind,
  p.settings #>> '{bitcodeProfile,walletBinding,status}' AS wallet_status,
  wallet.provider AS wallet_connection_provider,
  wallet.connection_data ->> 'auth_source' AS wallet_auth_source,
  wallet.is_active AS wallet_active,
  github.connection_data ->> 'installation_id' AS github_installation_id,
  github.connection_data ->> 'account_login' AS github_account,
  github.is_active AS github_active,
  (SELECT COUNT(*) FROM public.vcs_repositories r WHERE r.user_id = u.id) AS repository_count
FROM auth.users u
LEFT JOIN auth.identities i
  ON i.user_id = u.id AND i.provider = 'custom:bitcode-bitcoin'
LEFT JOIN public.user_profiles p
  ON p.id = u.id
LEFT JOIN public.user_connections wallet
  ON wallet.user_id = u.id
 AND wallet.connection_data ->> 'auth_source' IN ('bitcoin_wallet_oauth_identity', 'bitcoin_wallet_provider')
LEFT JOIN public.user_connections github
  ON github.user_id = u.id AND github.provider = 'github'
WHERE u.id IN (SELECT id FROM qa_user);
