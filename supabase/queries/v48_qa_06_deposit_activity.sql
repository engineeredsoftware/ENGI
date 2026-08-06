-- Saved query name: v48_qa_06_deposit_activity
-- Purpose: recent execution activity for the QA user during Track 2
-- depositing — synthesis requests, measurement runs, deposit admissions.
-- Source-safe: selects summary/context keys only, never raw outputs,
-- prompts, or provider payloads.
-- Run after: each /deposit action (connect repo, request AssetPack
-- synthesis, approve, deposit).
-- Expect: a new row per action with status progressing to completed;
-- repository/branch matching the connected source; has_error false.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  e.id::text,
  e.type,
  e.status,
  e.created_at,
  e.completed_at,
  e.context ->> 'source' AS source,
  coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor') AS repository,
  e.context ->> 'sourceBranch' AS source_branch,
  coalesce(e.output #>> '{asset,assetId}', e.context ->> 'candidateAssetId') AS candidate_asset_id,
  coalesce(e.output ->> 'summary', e.output #>> '{asset_pack_completion,summary}') AS summary,
  (e.error IS NOT NULL) AS has_error,
  e.total_tokens,
  e.duration_ms
FROM public.executions e
WHERE e.user_id IN (SELECT id FROM qa_user)
ORDER BY e.created_at DESC
LIMIT 12;
