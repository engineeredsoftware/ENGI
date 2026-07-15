-- Saved query name: v28_qa_terminal_04_deposit_repository_alignment
-- Purpose: run after the product page loads, and again after "Record deposit
-- selection" or "Record deposit posture". It verifies live GitHub repository
-- inventory is the Deposit source and flags any protocol-demo frontier leakage.

CREATE OR REPLACE FUNCTION pg_temp.v28_qa_terminal_deposit_repository_alignment()
RETURNS TABLE(section text, rows jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    WITH latest_user AS (
      SELECT user_id
      FROM public.user_connections
      WHERE provider = 'github' AND is_active = true
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
    ),
    repository_inventory AS (
      SELECT
        r.user_id::text,
        count(*) AS repository_count,
        count(*) FILTER (WHERE r.repo_full_name LIKE 'engineeredsoftware/%') AS engineeredsoftware_count,
        count(*) FILTER (WHERE r.repo_full_name LIKE 'frontier/%') AS frontier_count,
        jsonb_agg(
          jsonb_build_object(
            'repo_full_name', r.repo_full_name,
            'provider_repo_id', r.provider_repo_id,
            'language', r.repo_language,
            'default_branch', r.repo_default_branch,
            'private', r.repo_private,
            'updated_at', r.updated_at
          )
          ORDER BY r.repo_full_name
        ) FILTER (WHERE r.repo_full_name IS NOT NULL) AS repositories
      FROM public.vcs_repositories r
      JOIN latest_user u ON u.user_id = r.user_id
      GROUP BY r.user_id
    )
    SELECT
      'current_repository_inventory'::text,
      coalesce(jsonb_agg(to_jsonb(repository_inventory)), '[]'::jsonb)
    FROM repository_inventory;

  IF to_regclass('public.executions') IS NULL THEN
    RETURN QUERY
      SELECT
        'terminal_deposit_activity'::text,
        jsonb_build_array(
          jsonb_build_object(
            'missing_table', 'public.executions',
            'impact', 'product Deposit/Read activity cannot persist until the execution-history migration runs.'
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
      terminal_activity AS (
        SELECT
          e.id::text,
          e.user_id::text,
          e.type,
          e.status,
          e.created_at,
          e.context ->> 'source' AS source,
          e.context ->> 'repository' AS context_repository,
          coalesce(e.context ->> 'repositoryFullName', e.context ->> 'repositoryAnchor') AS context_repository_full_name,
          e.context ->> 'sourceBranch' AS source_branch,
          e.context ->> 'sourceCommit' AS source_commit,
          e.context ->> 'walletAuthorizationSigned' AS wallet_authorization_signed,
          coalesce(e.output #>> '{asset,assetId}', e.context ->> 'candidateAssetId') AS candidate_asset_id,
          coalesce(e.output -> 'repo_snapshot', e.output #> '{asset_pack_completion,repoSnapshot}') AS repo_snapshot,
          coalesce(
            e.output #> '{asset_pack_completion,bitcodeActivityState,supplySelection,selectedEntries}',
            e.output #> '{asset_pack_completion,bitcodeActivityState,depositWorkbench,deposit,selectedEntries}',
            '[]'::jsonb
          ) AS selected_entries,
          (to_jsonb(e)::text LIKE '%frontier/%') AS frontier_reference_detected,
          (to_jsonb(e)::text LIKE '%engineeredsoftware/%') AS engineeredsoftware_reference_detected
        FROM public.executions e
        JOIN latest_user u ON u.user_id = e.user_id
        WHERE e.context ->> 'source' IN (
          'terminal-deposit-composer',
          'terminal-supply-selection-panel',
          'terminal-deposit-read-workbench',
          'terminal-repository-context-panel'
        )
        ORDER BY e.created_at DESC
        LIMIT 15
      )
      SELECT
        'terminal_deposit_activity'::text,
        coalesce(jsonb_agg(to_jsonb(terminal_activity) ORDER BY created_at DESC), '[]'::jsonb)
      FROM terminal_activity;
    $query$;
  END IF;
END;
$$;

SELECT * FROM pg_temp.v28_qa_terminal_deposit_repository_alignment();
