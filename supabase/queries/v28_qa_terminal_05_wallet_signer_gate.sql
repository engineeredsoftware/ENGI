-- Saved query name: v28_qa_terminal_05_wallet_signer_gate
-- Purpose: run before "Submit deposit to Bitcode" when the product Deposit
-- button reports wallet signing/settlement readiness. V28 staging accepts a
-- provider-backed pending Bitcoin message signature as live signer readiness,
-- while unsigned provider-session posture remains blocked.

WITH recent_wallet_users AS (
  SELECT
    u.id AS user_id,
    u.email,
    u.raw_app_meta_data ->> 'provider' AS auth_provider,
    u.raw_user_meta_data ->> 'sub' AS bitcoin_subject,
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
    p.settings #>> '{bitcodeProfile,walletBinding,provider}' AS profile_wallet_provider,
    p.settings #>> '{bitcodeProfile,walletBinding,status}' AS profile_wallet_status,
    p.settings #>> '{bitcodeProfile,walletBinding,network}' AS profile_wallet_network,
    p.settings #>> '{bitcodeProfile,walletBinding,address}' AS profile_wallet_address,
    p.settings #>> '{bitcodeProfile,walletBinding,authAddress}' AS profile_auth_address,
    p.settings #>> '{bitcodeProfile,walletBinding,paymentAddress}' AS profile_payment_address,
    p.updated_at AS profile_updated_at
  FROM public.user_profiles p
),
wallet_connections AS (
  SELECT DISTINCT ON (c.user_id)
    c.user_id,
    c.provider,
    c.is_active,
    coalesce(c.connection_data ->> 'verification_state', c.connection_data ->> 'status') AS verification_state,
    coalesce(c.connection_data ->> 'proof_kind', c.connection_data ->> 'proofKind') AS proof_kind,
    coalesce(c.connection_data ->> 'address', c.connection_data ->> 'wallet_address') AS connection_address,
    c.connection_data ->> 'network' AS connection_network,
    coalesce(c.connection_data ->> 'authAddress', c.connection_data ->> 'auth_address') AS connection_auth_address,
    coalesce(c.connection_data ->> 'paymentAddress', c.connection_data ->> 'payment_address') AS connection_payment_address,
    coalesce(c.connection_data ->> 'addressType', c.connection_data ->> 'address_type') AS address_type,
    nullif(trim(coalesce(c.connection_data ->> 'message', '')), '') IS NOT NULL AS has_wallet_message,
    nullif(trim(coalesce(c.connection_data ->> 'signature', '')), '') IS NOT NULL AS has_wallet_signature,
    c.updated_at AS wallet_connection_updated_at
  FROM public.user_connections c
  WHERE c.provider IN ('bitcoin-wallet', 'unisat', 'leather', 'okx-bitcoin', 'xverse', 'manual-bitcoin')
  ORDER BY c.user_id, c.is_active DESC, c.updated_at DESC NULLS LAST
)
SELECT
  u.user_id,
  u.email,
  u.auth_provider,
  u.bitcoin_subject,
  w.provider AS wallet_provider,
  w.is_active AS wallet_active,
  w.verification_state,
  w.proof_kind,
  w.connection_network,
  w.connection_address,
  w.connection_auth_address,
  w.connection_payment_address,
  w.address_type,
  w.has_wallet_message,
  w.has_wallet_signature,
  p.profile_wallet_status,
  p.profile_wallet_network,
  p.profile_wallet_address,
  p.profile_auth_address,
  p.profile_payment_address,
  CASE
    WHEN w.user_id IS NULL THEN 'blocker:missing_wallet_connection'
    WHEN w.is_active IS DISTINCT FROM true THEN 'blocker:wallet_connection_inactive'
    WHEN w.verification_state = 'verified' THEN 'wallet_signer_verified'
    WHEN w.verification_state = 'pending'
      AND w.proof_kind = 'bitcoin_message_signature'
      AND w.has_wallet_message
      AND w.has_wallet_signature
      THEN 'wallet_signer_pending_signed_proof_accepted_for_v28_staging'
    WHEN w.verification_state = 'pending'
      THEN 'blocker:wallet_pending_without_signed_bitcoin_message_proof'
    ELSE 'blocker:wallet_connection_not_settlement_ready'
  END AS terminal_deposit_signer_gate_state,
  u.auth_created_at,
  u.last_sign_in_at,
  p.profile_updated_at,
  w.wallet_connection_updated_at
FROM recent_wallet_users u
LEFT JOIN profile_wallets p ON p.user_id = u.user_id
LEFT JOIN wallet_connections w ON w.user_id = u.user_id
ORDER BY u.auth_created_at DESC;
