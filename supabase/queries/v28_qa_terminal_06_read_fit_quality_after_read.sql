-- Saved query name: v28_qa_terminal_06_read_fit_quality_after_read
-- Purpose: run after accepting a Read and recording Fit posture. It verifies
-- the critical Read/Fit sequence is bound to the latest deposited
-- repository revision and flags mock/frontier leakage or missing proof posture.

CREATE OR REPLACE FUNCTION pg_temp.v28_qa_terminal_read_fit_quality_after_read()
RETURNS TABLE(section text, rows jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  IF to_regclass('public.executions') IS NULL THEN
    RETURN QUERY
      SELECT
        'critical_read_sequence'::text,
        jsonb_build_array(
          jsonb_build_object(
            'missing_table', 'public.executions',
            'impact', 'product Deposit, Read, and Fit activity cannot be QAed until execution history is persisted.'
          )
        );
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH latest_user AS (
        SELECT user_id
        FROM public.user_connections
        WHERE provider = 'github' AND is_active = true
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 1
      ),
      activity AS (
        SELECT
          e.id::text,
          e.user_id::text,
          e.type,
          e.status,
          e.created_at,
          e.context ->> 'source' AS source,
          e.context ->> 'workbench' AS workbench,
	          CASE
	            WHEN e.context ->> 'source' = 'terminal-deposit-composer'
	              OR (e.context ->> 'source' = 'terminal-deposit-read-workbench' AND e.context ->> 'workbench' = 'deposit')
	              OR e.output ? 'deposit'
	              OR e.output ? 'deposit_asset'
	              OR e.output ? 'asset'
	            THEN 'deposit'
            WHEN e.context ->> 'source' = 'terminal-read-scenario-panel'
              OR e.type IN ('agentic-execution:read-measurement', 'pipeline:measure')
              OR e.output ? 'readMeasurement'
            THEN 'read'
            WHEN e.type IN ('agentic-execution:proof-refresh', 'pipeline:proof-refresh')
              OR (e.context ->> 'source' = 'terminal-deposit-read-workbench' AND e.context ->> 'workbench' = 'fit')
              OR e.output ? 'fit'
	            THEN 'fit'
	            ELSE 'other'
	          END AS activity_class,
	          CASE
	            WHEN e.context ->> 'source' = 'terminal-deposit-composer'
	              OR e.output ? 'deposit_asset'
	              OR e.output ? 'asset'
	              OR nullif(e.context ->> 'candidateAssetId', '') IS NOT NULL
	            THEN 'submission'
	            WHEN e.context ->> 'source' = 'terminal-deposit-read-workbench'
	              AND e.context ->> 'workbench' = 'deposit'
	            THEN 'posture'
	            ELSE NULL
	          END AS deposit_kind,
          coalesce(
            e.context ->> 'repositoryFullName',
            e.context ->> 'repositoryAnchor',
            CASE
              WHEN coalesce(e.output #>> '{repo_snapshot,org}', e.output #>> '{asset_pack_completion,repoSnapshot,org}') IS NOT NULL
                AND coalesce(e.output #>> '{repo_snapshot,repo}', e.output #>> '{asset_pack_completion,repoSnapshot,repo}') IS NOT NULL
              THEN
                coalesce(e.output #>> '{repo_snapshot,org}', e.output #>> '{asset_pack_completion,repoSnapshot,org}')
                || '/'
                || coalesce(e.output #>> '{repo_snapshot,repo}', e.output #>> '{asset_pack_completion,repoSnapshot,repo}')
              ELSE NULL
            END,
            e.output #>> '{asset,metadata,sourceRepo}',
            e.output #>> '{asset,githubBoundary,sourceRepo}',
            e.output #>> '{asset,addressingSurface,repo}',
            e.output #>> '{readMeasurement,scenario,repo}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,readMeasurement,scenario,repo}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitWorkbench,deposit,selectedEntries,0,label}'
          ) AS repository_full_name,
          coalesce(
            e.context ->> 'sourceBranch',
            e.output #>> '{repo_snapshot,branch}',
            e.output #>> '{asset_pack_completion,repoSnapshot,branch}',
            e.output #>> '{asset,addressingSurface,ref}',
            e.output #>> '{asset,repo_snapshot,branch}'
          ) AS source_branch,
          coalesce(
            e.context ->> 'sourceCommit',
            e.output #>> '{repo_snapshot,commit}',
            e.output #>> '{asset_pack_completion,repoSnapshot,commit}',
            e.output #>> '{asset,addressingSurface,commit}',
            e.output #>> '{asset,repo_snapshot,commit}'
          ) AS source_commit,
          coalesce(
            e.output #>> '{readMeasurement,parserKind}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,readMeasurement,parserKind}'
          ) AS parser_kind,
          nullif(coalesce(
            e.output #>> '{readMeasurement,closureCriteriaCount}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,readMeasurement,closureCriteriaCount}'
          ), '')::integer AS closure_criteria_count,
          nullif(coalesce(
            e.output #>> '{readMeasurement,targetKindCount}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,readMeasurement,targetKindCount}'
          ), '')::integer AS target_kind_count,
	          coalesce(
	            e.output #>> '{deposit_asset,assetId}',
	            e.output #>> '{deposit_asset_id}',
	            e.output #>> '{asset,assetId}',
	            e.context ->> 'candidateAssetId',
	            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitWorkbench,deposit,selectedEntries,0,id}'
          ) AS candidate_asset_id,
          coalesce(
            e.output #>> '{fit,summary}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitWorkbench,fit,summary}',
            e.output #>> '{assetPackCompletion,bitcodeActivityState,fitWorkbench,fit,summary}'
          ) AS fit_summary,
          coalesce(
            e.output #>> '{fit,resultState}',
            e.output #>> '{fitResult,resultState}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitResult,resultState}',
            e.output #>> '{assetPackCompletion,bitcodeActivityState,fitResult,resultState}'
          ) AS fit_result_state,
          coalesce(
            e.output #> '{fit,resultReasons}',
            e.output #> '{fitResult,resultReasons}',
            e.output #> '{asset_pack_completion,bitcodeActivityState,fitResult,resultReasons}',
            e.output #> '{assetPackCompletion,bitcodeActivityState,fitResult,resultReasons}'
          ) AS fit_result_reasons,
          coalesce(
            e.output #>> '{depositorySearch,embeddingPolicy,model}',
            e.output #>> '{fitResult,embeddingPolicy,model}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitResult,embeddingPolicy,model}',
            e.output #>> '{assetPackCompletion,bitcodeActivityState,fitResult,embeddingPolicy,model}'
          ) AS fit_embedding_model,
          nullif(coalesce(
            e.output #>> '{depositorySearch,embeddingPolicy,dimensions}',
            e.output #>> '{fitResult,embeddingPolicy,dimensions}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitResult,embeddingPolicy,dimensions}',
            e.output #>> '{assetPackCompletion,bitcodeActivityState,fitResult,embeddingPolicy,dimensions}'
          ), '')::integer AS fit_embedding_dimensions,
          coalesce(
            e.output #>> '{depositorySearch,embeddingPolicy,vectorStore,rpc}',
            e.output #>> '{fitResult,embeddingPolicy,vectorStore,rpc}',
            e.output #>> '{asset_pack_completion,bitcodeActivityState,fitResult,embeddingPolicy,vectorStore,rpc}',
            e.output #>> '{assetPackCompletion,bitcodeActivityState,fitResult,embeddingPolicy,vectorStore,rpc}'
          ) AS fit_vector_rpc,
          (
            e.output ? 'readMeasurement'
            OR e.output #> '{asset_pack_completion,bitcodeActivityState,readMeasurement}' IS NOT NULL
            OR e.output #> '{asset_pack_completion,bitcodeActivityState,readReview}' IS NOT NULL
          ) AS has_read_measurement,
          (
            e.output ? 'fit'
            OR e.output #> '{asset_pack_completion,bitcodeActivityState,fitWorkbench}' IS NOT NULL
          ) AS has_fit_posture,
	          (
	            e.output #> '{deposit_asset,attestations}' IS NOT NULL
	            OR e.output #> '{deposit_asset,signingSurface}' IS NOT NULL
	            OR e.output #> '{deposit_asset,identitySurface}' IS NOT NULL
	            OR e.output #> '{deposit_asset,githubBoundary}' IS NOT NULL
	            OR e.output #> '{deposit_asset,githubAppAuthSurface}' IS NOT NULL
	            OR
	            e.output #> '{asset,attestations}' IS NOT NULL
	            OR e.output #> '{asset,signingSurface}' IS NOT NULL
	            OR e.context ->> 'walletAuthorizationSigned' = 'true'
	          ) AS has_wallet_or_attestation_proof,
	          (
	            e.output #> '{deposit_asset,assetMeasurement}' IS NOT NULL
	            OR e.output #> '{deposit_asset,contentUnits}' IS NOT NULL
	            OR e.output #> '{deposit_asset,measurementProvenance}' IS NOT NULL
	            OR
	            e.output #> '{asset,assetMeasurement}' IS NOT NULL
	            OR e.output #> '{asset,contentUnits}' IS NOT NULL
	            OR e.output #> '{asset,measurementProvenance}' IS NOT NULL
	          ) AS has_asset_measurement_evidence,
	          (
	            coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor', '') LIKE 'frontier/%'
	            OR coalesce(e.output #>> '{repo_snapshot,org}', e.output #>> '{asset_pack_completion,repoSnapshot,org}', '') = 'frontier'
	            OR coalesce(e.output #>> '{readMeasurement,scenario,repo}', '') LIKE 'frontier/%'
	            OR coalesce(e.output #>> '{asset_pack_completion,bitcodeActivityState,readMeasurement,scenario,repo}', '') LIKE 'frontier/%'
	            OR coalesce(e.output #>> '{deposit_asset,githubBoundary,sourceRepo}', e.output #>> '{asset,githubBoundary,sourceRepo}', '') LIKE 'frontier/%'
	          ) AS frontier_reference_detected,
	          (
	            lower(coalesce(e.context ->> 'provider', '')) IN ('mock', 'demo')
	            OR lower(coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor', '')) LIKE 'mock/%'
	            OR lower(coalesce(e.output #>> '{deposit_asset,githubBoundary,sourceProvider}', e.output #>> '{asset,githubBoundary,sourceProvider}', '')) IN ('mock', 'demo')
	          ) AS mock_reference_detected,
          jsonb_build_object(
            'summary', coalesce(e.output ->> 'summary', e.output #>> '{asset_pack_completion,summary}'),
            'repo_snapshot', coalesce(e.output -> 'repo_snapshot', e.output #> '{asset_pack_completion,repoSnapshot}'),
	            'read_measurement', coalesce(e.output -> 'readMeasurement', e.output #> '{asset_pack_completion,bitcodeActivityState,readMeasurement}'),
	            'fit', coalesce(e.output -> 'fit', e.output #> '{asset_pack_completion,bitcodeActivityState,fitWorkbench,fit}'),
	            'deposit_asset_id', coalesce(e.output #>> '{deposit_asset,assetId}', e.output #>> '{deposit_asset_id}', e.output #>> '{asset,assetId}', e.context ->> 'candidateAssetId')
	          ) AS evidence_summary
        FROM public.executions e
        JOIN latest_user u ON u.user_id = e.user_id
        WHERE
          e.created_at > now() - interval '48 hours'
          AND e.type IN (
            'agentic-execution:asset-pack',
            'agentic-execution:read-measurement',
            'agentic-execution:proof-refresh',
            'pipeline:measure',
            'pipeline:proof-refresh'
          )
      ),
	      latest_read AS (
	        SELECT *
	        FROM activity
	        WHERE activity_class = 'read'
	        ORDER BY created_at DESC
	        LIMIT 1
	      ),
	      latest_fit AS (
	        SELECT *
	        FROM activity
	        WHERE activity_class = 'fit'
	        ORDER BY created_at DESC
	        LIMIT 1
	      ),
	      latest_deposit_submission AS (
	        SELECT *
	        FROM activity
	        WHERE activity_class = 'deposit' AND deposit_kind = 'submission'
	        ORDER BY created_at DESC
	        LIMIT 1
	      ),
	      latest_deposit_posture AS (
	        SELECT *
	        FROM activity
	        WHERE activity_class = 'deposit' AND deposit_kind = 'posture'
	        ORDER BY created_at DESC
	        LIMIT 1
	      ),
	      latest AS (
	        SELECT
	          coalesce(
	            (SELECT to_jsonb(latest_deposit_submission) FROM latest_deposit_submission),
	            (SELECT to_jsonb(latest_deposit_posture) FROM latest_deposit_posture)
	          ) AS deposit,
	          (SELECT to_jsonb(latest_deposit_submission) FROM latest_deposit_submission) AS deposit_submission,
	          (SELECT to_jsonb(latest_deposit_posture) FROM latest_deposit_posture) AS deposit_posture,
	          (SELECT to_jsonb(latest_read) FROM latest_read) AS read,
	          (SELECT to_jsonb(latest_fit) FROM latest_fit) AS fit,
	          EXISTS (SELECT 1 FROM activity WHERE frontier_reference_detected) AS any_frontier_reference,
	          EXISTS (SELECT 1 FROM activity WHERE mock_reference_detected) AS any_mock_reference,
	          EXISTS (
	            SELECT 1
	            FROM activity d
	            JOIN latest_read r ON true
	            WHERE d.activity_class = 'deposit'
	              AND d.deposit_kind = 'submission'
	              AND d.repository_full_name = r.repository_full_name
	              AND coalesce(d.source_branch, '') = coalesce(r.source_branch, '')
	              AND coalesce(d.source_commit, '') = coalesce(r.source_commit, '')
	          ) AS has_deposit_submission_for_read_revision
	      ),
	      critical_summary AS (
	        SELECT
	          deposit ->> 'id' AS latest_deposit_id,
	          deposit_submission ->> 'id' AS latest_deposit_submission_id,
	          deposit_posture ->> 'id' AS latest_deposit_posture_id,
	          read ->> 'id' AS latest_read_id,
          fit ->> 'id' AS latest_fit_id,
          deposit ->> 'repository_full_name' AS deposit_repository,
          read ->> 'repository_full_name' AS read_repository,
          fit ->> 'repository_full_name' AS fit_repository,
          coalesce(read ->> 'repository_full_name', fit ->> 'repository_full_name', deposit ->> 'repository_full_name') AS observed_repository,
          coalesce(read ->> 'source_branch', fit ->> 'source_branch', deposit ->> 'source_branch') AS observed_branch,
          coalesce(read ->> 'source_commit', fit ->> 'source_commit', deposit ->> 'source_commit') AS observed_commit,
          read ->> 'parser_kind' AS read_parser_kind,
          nullif(read ->> 'closure_criteria_count', '')::integer AS read_closure_criteria_count,
          nullif(read ->> 'target_kind_count', '')::integer AS read_target_kind_count,
          (deposit ->> 'created_at')::timestamptz AS deposit_created_at,
	          (read ->> 'created_at')::timestamptz AS read_created_at,
	          (fit ->> 'created_at')::timestamptz AS fit_created_at,
	          has_deposit_submission_for_read_revision,
	          CASE
	            WHEN deposit IS NULL THEN 'blocker:deposit_activity_missing'
	            WHEN read IS NULL THEN 'blocker:read_activity_missing'
	            WHEN NOT has_deposit_submission_for_read_revision THEN 'blocker:deposit_submission_missing_for_read_revision'
	            WHEN fit IS NULL THEN 'blocker:fit_activity_missing'
            WHEN any_frontier_reference THEN 'blocker:frontier_repository_leakage'
            WHEN coalesce(read ->> 'repository_full_name', fit ->> 'repository_full_name', deposit ->> 'repository_full_name') <> (deposit ->> 'repository_full_name')
              THEN 'blocker:read_not_bound_to_deposited_repository'
            WHEN coalesce(read ->> 'parser_kind', '') IN ('', 'pending')
              OR coalesce(nullif(read ->> 'closure_criteria_count', '')::integer, 0) = 0
              OR coalesce(nullif(read ->> 'target_kind_count', '')::integer, 0) = 0
              THEN 'blocker:read_measurement_incomplete'
            WHEN nullif(coalesce(read ->> 'source_branch', fit ->> 'source_branch', deposit ->> 'source_branch'), '') IS NULL
              THEN 'blocker:source_branch_missing'
            WHEN nullif(coalesce(read ->> 'source_commit', fit ->> 'source_commit', deposit ->> 'source_commit'), '') IS NULL
              THEN 'blocker:source_commit_missing'
            WHEN ((deposit ->> 'created_at')::timestamptz > (read ->> 'created_at')::timestamptz)
              THEN 'blocker:read_recorded_before_deposit'
            WHEN ((read ->> 'created_at')::timestamptz > (fit ->> 'created_at')::timestamptz)
              THEN 'blocker:fit_recorded_before_read'
            WHEN (fit ->> 'has_fit_posture') <> 'true'
              THEN 'blocker:fit_posture_missing'
            WHEN coalesce(fit ->> 'fit_result_state', '') NOT IN ('worthy_fit', 'no_worthy_fit', 'blocked_readiness')
              THEN 'blocker:fit_result_state_missing'
            ELSE 'critical_read_fit_sequence_ready_for_result_review'
          END AS critical_read_gate_state,
          CASE
            WHEN any_frontier_reference THEN 'blocker:frontier_reference_detected'
            WHEN any_mock_reference THEN 'warning:mock_reference_detected_review_context'
            ELSE 'no_frontier_or_mock_leakage_detected'
          END AS mock_frontier_state,
	          CASE
	            WHEN NOT has_deposit_submission_for_read_revision THEN 'blocker:deposit_submission_proof_not_available_for_read_revision'
	            WHEN (deposit_submission ->> 'has_wallet_or_attestation_proof') = 'true' THEN 'deposit_has_wallet_or_attestation_proof'
	            ELSE 'warning:deposit_wallet_or_attestation_proof_not_visible_in_execution_row'
	          END AS deposit_proof_state,
	          CASE
	            WHEN NOT has_deposit_submission_for_read_revision THEN 'blocker:deposit_submission_measurement_not_available_for_read_revision'
	            WHEN (deposit_submission ->> 'has_asset_measurement_evidence') = 'true' THEN 'deposit_has_asset_measurement_evidence'
	            ELSE 'warning:deposit_measurement_evidence_not_visible_in_execution_row'
          END AS deposit_measurement_state,
          fit ->> 'fit_summary' AS latest_fit_summary,
          fit ->> 'fit_result_state' AS latest_fit_result_state,
          fit -> 'fit_result_reasons' AS latest_fit_result_reasons,
          fit ->> 'fit_embedding_model' AS latest_fit_embedding_model,
          nullif(fit ->> 'fit_embedding_dimensions', '')::integer AS latest_fit_embedding_dimensions,
          fit ->> 'fit_vector_rpc' AS latest_fit_vector_rpc
        FROM latest
      )
      SELECT
        'critical_read_sequence'::text,
        jsonb_build_array(to_jsonb(critical_summary))
      FROM critical_summary
      UNION ALL
      SELECT
        'read_fit_activity_recent'::text,
        coalesce(jsonb_agg(to_jsonb(activity) ORDER BY created_at DESC), '[]'::jsonb)
      FROM activity
      WHERE activity_class IN ('deposit', 'read', 'fit')
      UNION ALL
      SELECT
        'read_fit_quality_gate'::text,
        jsonb_build_array(
          jsonb_build_object(
            'review_expectation', 'A Read against the current deposited Bitcode data-space must return a proof-bearing AssetPack fit, explicit no-worthy-fit evidence, or blocked-readiness until real pipeline execution evidence exists.',
            'required_positive_controls', jsonb_build_array(
              'repository_full_name matches the latest deposited repository',
              'source_branch present',
              'source_commit present',
              'deposit recorded before read',
              'read recorded before fit',
              'fit result state is worthy_fit, no_worthy_fit, or blocked_readiness'
            ),
            'required_negative_controls', jsonb_build_array(
              'unrelated Read returns no-worthy-fit',
              'broad Read requests clarification or fails closed',
              'frontier/mock repository references are blockers in staging-testnet'
            ),
            'observed_gate_state', critical_read_gate_state,
            'observed_repository', observed_repository,
            'observed_branch', observed_branch,
            'observed_commit', observed_commit,
            'read_parser_kind', read_parser_kind,
            'read_closure_criteria_count', read_closure_criteria_count,
            'read_target_kind_count', read_target_kind_count,
            'latest_fit_summary', latest_fit_summary,
            'latest_fit_result_state', latest_fit_result_state,
            'latest_fit_result_reasons', latest_fit_result_reasons,
            'latest_fit_embedding_model', latest_fit_embedding_model,
            'latest_fit_embedding_dimensions', latest_fit_embedding_dimensions,
            'latest_fit_vector_rpc', latest_fit_vector_rpc
          )
        )
      FROM critical_summary;
    $query$;
  END IF;
END;
$$;

SELECT * FROM pg_temp.v28_qa_terminal_read_fit_quality_after_read();
