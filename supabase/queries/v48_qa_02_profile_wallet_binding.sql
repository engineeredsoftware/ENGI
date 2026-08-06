-- Saved query name: v48_qa_02_profile_wallet_binding
-- Purpose: confirm the identity-derived wallet binding persisted into the
-- profile settings projection (the raw wallet_* columns stay null by design;
-- hydrateBitcodeProfile projects them from settings at read time).
-- Run after: first page load with a session (WalletSessionPersistenceBridge
-- fires on mount) or any wallet connect/persist action.
-- Expect: username wallet_<address-stem>; walletBinding with address,
-- provider, network, status (pending until signature verification ships),
-- proofKind (provider_session for identity-derived binds), boundAt.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  p.id,
  p.username,
  p.settings #>> '{bitcodeProfile,walletBinding,address}' AS wallet_address,
  p.settings #>> '{bitcodeProfile,walletBinding,provider}' AS wallet_provider,
  p.settings #>> '{bitcodeProfile,walletBinding,status}' AS wallet_binding_status,
  p.settings #>> '{bitcodeProfile,walletBinding,network}' AS wallet_network,
  p.settings #>> '{bitcodeProfile,walletBinding,proofKind}' AS wallet_proof_kind,
  p.settings #>> '{bitcodeProfile,walletBinding,boundAt}' AS wallet_bound_at,
  p.settings #>> '{bitcodeProfile,walletBinding,paymentAddress}' AS payment_address,
  p.settings #>> '{bitcodeProfile,walletBinding,authAddress}' AS auth_address,
  p.settings #>> '{bitcodeProfile,email}' AS contact_email,
  p.updated_at
FROM public.user_profiles p
WHERE p.id IN (SELECT id FROM qa_user);
