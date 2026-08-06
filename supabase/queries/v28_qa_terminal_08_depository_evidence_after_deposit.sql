-- Saved query name: v28_qa_terminal_08_depository_evidence_after_deposit
-- Purpose: run after submitting a product deposit. It verifies the deposited
-- source evidence spine that Gate 9 requires before later Read/Fit gates can
-- search, synthesize, settle, or deliver from deposited supply.

CREATE OR REPLACE FUNCTION pg_temp.v28_qa_terminal_depository_evidence_after_deposit()
RETURNS TABLE(section text, rows jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  IF to_regclass('public.executions') IS NULL THEN
    RETURN QUERY
      SELECT
        'gate9_depository_evidence'::text,
        jsonb_build_array(
          jsonb_build_object(
            'missing_table', 'public.executions',
            'impact', 'product depository evidence cannot be read back until execution history exists.'
          )
        );
    RETURN;
  END IF;

  RETURN QUERY EXECUTE $query$
    WITH latest_user AS (
      SELECT user_id
      FROM public.user_connections
      WHERE provider = 'github' AND is_active = true
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
    ),
    latest_deposits AS (
      SELECT
        e.id::text,
        e.created_at,
        e.status,
        coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor') AS repository_full_name,
        e.context ->> 'sourceBranch' AS source_branch,
        e.context ->> 'sourceCommit' AS source_commit,
        coalesce(e.output #>> '{asset,assetId}', e.context ->> 'candidateAssetId') AS candidate_asset_id,
        coalesce(e.context ->> 'depositProofRoot', e.output #>> '{depositoryEvidence,proofRoot}') AS proof_root,
        coalesce(e.context ->> 'depositMeasurementRoot', e.output #>> '{depositoryEvidence,measurementRoot}') AS measurement_root,
        coalesce(
          e.context ->> 'depositReconciliationReadbackRoot',
          e.output #>> '{depositoryEvidence,reconciliationReadbackRoot}'
        ) AS reconciliation_readback_root,
        coalesce(
          e.context ->> 'depositorySearchDocumentRoot',
          e.output #>> '{depositoryEvidence,depositorySearchDocumentRoot}'
        ) AS depository_search_document_root,
        coalesce(e.context ->> 'lexicalDocumentRoot', e.output #>> '{depositoryEvidence,lexicalDocumentRoot}') AS lexical_document_root,
        coalesce(e.context ->> 'vectorDocumentRoot', e.output #>> '{depositoryEvidence,vectorDocumentRoot}') AS vector_document_root,
        coalesce(e.context ->> 'depositorWalletId', e.output #>> '{depositoryEvidence,depositorBoundary,walletId}') AS depositor_wallet_id,
        coalesce(e.context ->> 'depositoryIndexState', e.output #>> '{depositoryEvidence,indexState,vector}') AS vector_index_state,
        coalesce(e.output #>> '{depositoryEvidence,searchDocuments,vector,embeddingPolicy,model}', 'text-embedding-3-small') AS embedding_model,
        nullif(coalesce(e.output #>> '{depositoryEvidence,searchDocuments,vector,embeddingPolicy,dimensions}', '1536'), '')::integer AS embedding_dimensions,
        coalesce(e.output #>> '{depositoryEvidence,searchDocuments,vector,embeddingPolicy,vectorStore,rpc}', 'match_deliverable_vectors') AS vector_rpc,
        (to_jsonb(e)::text LIKE '%frontier/%') AS frontier_reference_detected,
        (to_jsonb(e)::text LIKE '%mock/%') AS mock_reference_detected
      FROM public.executions e
      JOIN latest_user u ON u.user_id = e.user_id
      WHERE e.context ->> 'source' = 'terminal-deposit-composer'
      ORDER BY e.created_at DESC
      LIMIT 10
    ),
    evaluated AS (
      SELECT
        *,
        (
          repository_full_name IS NOT NULL
          AND source_branch IS NOT NULL
          AND source_commit IS NOT NULL
          AND candidate_asset_id IS NOT NULL
          AND proof_root LIKE 'sha256:%'
          AND measurement_root LIKE 'sha256:%'
          AND reconciliation_readback_root LIKE 'sha256:%'
          AND depository_search_document_root LIKE 'sha256:%'
          AND lexical_document_root LIKE 'sha256:%'
          AND vector_document_root LIKE 'sha256:%'
          AND depositor_wallet_id IS NOT NULL
          AND embedding_model = 'text-embedding-3-small'
          AND embedding_dimensions = 1536
          AND vector_rpc = 'match_deliverable_vectors'
          AND NOT frontier_reference_detected
          AND NOT mock_reference_detected
        ) AS gate9_ready
      FROM latest_deposits
    )
    SELECT
      'gate9_depository_evidence'::text,
      coalesce(jsonb_agg(to_jsonb(evaluated) ORDER BY created_at DESC), '[]'::jsonb)
    FROM evaluated;
  $query$;
END;
$$;

SELECT * FROM pg_temp.v28_qa_terminal_depository_evidence_after_deposit();
