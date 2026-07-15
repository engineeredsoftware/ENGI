-- Saved query name: v28_qa_terminal_01_prerequisites_wallet_github_repo
-- Purpose: confirm the live staging user has Supabase Auth, wallet binding,
-- GitHub installation, and repository inventory before product Deposit/Read QA.

WITH recent_wallet_users AS (
  SELECT
    u.id AS user_id,
    u.email,
    u.raw_app_meta_data ->> 'provider' AS auth_provider,
    u.raw_user_meta_data ->> 'sub' AS bitcoin_subject,
    u.raw_user_meta_data ->> 'preferred_username' AS preferred_username,
    u.created_at AS auth_created_at,
    u.last_sign_in_at
  FROM auth.users u
  WHERE
    u.raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
    OR u.raw_user_meta_data ->> 'sub' LIKE 'bitcoin:%'
  ORDER BY u.created_at DESC
  LIMIT 10
),
profile_wallets AS (
  SELECT
    p.id AS user_id,
    p.username,
    p.role,
    p.settings #>> '{bitcodeProfile,walletBinding,provider}' AS wallet_provider,
    p.settings #>> '{bitcodeProfile,walletBinding,status}' AS wallet_status,
    p.settings #>> '{bitcodeProfile,walletBinding,network}' AS wallet_network,
    p.settings #>> '{bitcodeProfile,walletBinding,address}' AS wallet_address,
    p.settings #>> '{bitcodeProfile,walletBinding,authAddress}' AS auth_address,
    p.settings #>> '{bitcodeProfile,walletBinding,paymentAddress}' AS payment_address,
    p.updated_at AS profile_updated_at
  FROM public.user_profiles p
),
wallet_connections AS (
  SELECT
    c.user_id,
    c.provider AS wallet_connection_provider,
    c.is_active AS wallet_active,
    coalesce(c.connection_data ->> 'address', c.connection_data ->> 'wallet_address') AS wallet_connection_address,
    c.connection_data ->> 'network' AS wallet_connection_network,
    coalesce(c.connection_data ->> 'authAddress', c.connection_data ->> 'auth_address') AS wallet_connection_auth_address,
    coalesce(c.connection_data ->> 'paymentAddress', c.connection_data ->> 'payment_address') AS wallet_connection_payment_address,
    coalesce(c.connection_data ->> 'verification_state', c.connection_data ->> 'status') AS wallet_verification_state,
    c.updated_at AS wallet_connection_updated_at
  FROM public.user_connections c
  WHERE c.provider IN ('bitcoin-wallet', 'unisat', 'leather', 'okx-bitcoin', 'xverse', 'manual-bitcoin')
),
github_connections AS (
  SELECT
    c.user_id,
    c.is_active AS github_active,
    coalesce(
      c.connection_data ->> 'installation_id',
      c.connection_data ->> 'installationId',
      c.connection_data ->> 'connectionId',
      c.connection_data ->> 'provider_user_id'
    ) AS github_installation_id,
    coalesce(c.connection_data ->> 'account_login', c.connection_data ->> 'provider_username') AS github_account,
    c.connection_data ->> 'repository_selection' AS repository_selection,
    c.connection_data ->> 'token_expires_at' AS token_expires_at,
    c.updated_at AS github_connection_updated_at
  FROM public.user_connections c
  WHERE c.provider = 'github'
),
repo_ranked AS (
  SELECT
    r.user_id,
    r.provider,
    r.provider_repo_id,
    r.repo_full_name,
    r.repo_default_branch,
    r.repo_private,
    r.repo_language,
    r.repo_updated_at,
    r.updated_at,
    row_number() OVER (PARTITION BY r.user_id ORDER BY r.repo_full_name) AS repo_rank
  FROM public.vcs_repositories r
  WHERE r.provider = 'github'
),
repo_inventory AS (
  SELECT
    r.user_id,
    count(*)::bigint AS github_repository_count,
    max(r.updated_at) AS repository_inventory_updated_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'repo_full_name', r.repo_full_name,
          'provider_repo_id', r.provider_repo_id,
          'default_branch', r.repo_default_branch,
          'private', r.repo_private,
          'language', r.repo_language,
          'repo_updated_at', r.repo_updated_at
        )
        ORDER BY r.repo_full_name
      ) FILTER (WHERE r.repo_rank <= 12),
      '[]'::jsonb
    ) AS sample_repositories
  FROM repo_ranked r
  GROUP BY r.user_id
)
SELECT
  u.user_id,
  u.email,
  u.auth_provider,
  u.bitcoin_subject,
  u.preferred_username,
  p.username,
  p.role,
  p.wallet_provider,
  p.wallet_status,
  p.wallet_network,
  p.wallet_address,
  p.auth_address,
  p.payment_address,
  w.wallet_connection_provider,
  w.wallet_active,
  w.wallet_connection_address,
  w.wallet_connection_network,
  w.wallet_connection_auth_address,
  w.wallet_connection_payment_address,
  w.wallet_verification_state,
  g.github_active,
  g.github_installation_id,
  g.github_account,
  g.repository_selection,
  g.token_expires_at,
  CASE
    WHEN g.token_expires_at IS NULL THEN null
    WHEN g.token_expires_at::timestamptz <= now() THEN 'warning:github_installation_token_expired'
    WHEN g.token_expires_at::timestamptz <= now() + interval '10 minutes' THEN 'warning:github_installation_token_expires_soon'
    ELSE 'github_installation_token_fresh'
  END AS github_token_freshness,
  coalesce(r.github_repository_count, 0) AS github_repository_count,
  CASE
    WHEN coalesce(r.github_repository_count, 0) > 0 THEN 'github_repository_inventory_available'
    ELSE 'github_repository_inventory_missing'
  END AS github_repository_inventory_state,
  CASE
    WHEN p.user_id IS NULL THEN 'blocker:missing_user_profile'
    WHEN nullif(trim(coalesce(p.wallet_address, '')), '') IS NULL THEN 'blocker:missing_profile_wallet_binding'
    WHEN w.user_id IS NULL THEN 'blocker:missing_wallet_connection'
    WHEN g.user_id IS NULL THEN 'blocker:missing_github_connection'
    WHEN coalesce(r.github_repository_count, 0) = 0 THEN 'blocker:missing_vcs_repository_inventory'
    ELSE 'ready_for_terminal_deposit_read'
  END AS terminal_prerequisite_state,
  CASE
    WHEN p.wallet_network IS NULL AND w.wallet_connection_network IS NOT NULL THEN 'warning:profile_wallet_network_missing'
    WHEN p.wallet_network IS NOT NULL
      AND w.wallet_connection_network IS NOT NULL
      AND p.wallet_network IS DISTINCT FROM w.wallet_connection_network THEN 'warning:wallet_network_drift'
    ELSE 'wallet_network_aligned'
  END AS wallet_network_projection_state,
  CASE
    WHEN p.auth_address IS NULL AND w.wallet_connection_auth_address IS NOT NULL THEN 'warning:profile_auth_address_missing'
    WHEN p.payment_address IS NULL AND w.wallet_connection_payment_address IS NOT NULL THEN 'warning:profile_payment_address_missing'
    ELSE 'wallet_address_projection_acceptable'
  END AS wallet_address_projection_state,
  u.auth_created_at,
  u.last_sign_in_at,
  p.profile_updated_at,
  w.wallet_connection_updated_at,
  g.github_connection_updated_at,
  r.repository_inventory_updated_at,
  r.sample_repositories
FROM recent_wallet_users u
LEFT JOIN profile_wallets p ON p.user_id = u.user_id
LEFT JOIN wallet_connections w ON w.user_id = u.user_id
LEFT JOIN github_connections g ON g.user_id = u.user_id
LEFT JOIN repo_inventory r ON r.user_id = u.user_id
ORDER BY u.auth_created_at DESC;
