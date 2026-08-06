-- Saved query name: v48_qa_01_auth_user_identity
-- Purpose: confirm the wallet sign-up/sign-in minted a real Supabase session
-- and the custom:bitcode-bitcoin identity carries the Bitcoin subject.
-- Run after: Connect Wallet sign-up or sign-in (Track 1).
-- Expect: last_sign_in_at populated within seconds of created_at;
-- bitcoin_subject like bitcoin:<network>:<address>; email null (wallet-first).

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.raw_app_meta_data ->> 'provider' AS auth_provider,
  i.provider AS identity_provider,
  i.identity_data ->> 'sub' AS bitcoin_subject,
  i.identity_data ->> 'name' AS wallet_label,
  i.identity_data ->> 'preferred_username' AS preferred_username,
  i.created_at AS identity_created_at
FROM auth.users u
LEFT JOIN auth.identities i
  ON i.user_id = u.id
 AND i.provider = 'custom:bitcode-bitcoin'
WHERE u.id IN (SELECT id FROM qa_user);
