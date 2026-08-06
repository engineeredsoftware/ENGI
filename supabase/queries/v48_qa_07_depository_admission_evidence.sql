-- Saved query name: v48_qa_07_depository_admission_evidence
-- Purpose: depository admission readback after a deposit approval —
-- proof/measurement/search-document roots and index state for the QA
-- user's deposit executions. Source-safe: roots and states only.
-- Run after: approving a deposit option (Depository admission).
-- Expect: sha256-prefixed proof_root/measurement_root/search_document_root,
-- vector_index_state ready, candidate asset id + title populated.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  e.id::text,
  e.created_at,
  e.status,
  coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor') AS repository,
  coalesce(e.output #>> '{asset,assetId}', e.context ->> 'candidateAssetId') AS candidate_asset_id,
  e.output #>> '{asset,title}' AS asset_title,
  coalesce(e.context ->> 'depositProofRoot', e.output #>> '{depositoryEvidence,proofRoot}') AS proof_root,
  coalesce(e.context ->> 'depositMeasurementRoot', e.output #>> '{depositoryEvidence,measurementRoot}') AS measurement_root,
  coalesce(
    e.context ->> 'depositorySearchDocumentRoot',
    e.output #>> '{depositoryEvidence,depositorySearchDocumentRoot}'
  ) AS search_document_root,
  e.output #>> '{depositoryEvidence,indexState,vector}' AS vector_index_state,
  e.output #>> '{depositoryEvidence,indexState,lexical}' AS lexical_index_state
FROM public.executions e
WHERE e.user_id IN (SELECT id FROM qa_user)
  AND (
    e.context ->> 'source' = 'terminal-deposit-composer'
    OR e.output ? 'depositoryEvidence'
    OR e.output ? 'asset'
  )
ORDER BY e.created_at DESC
LIMIT 8;
