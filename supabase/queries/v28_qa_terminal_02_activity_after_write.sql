-- Saved query name: v28_qa_terminal_02_activity_after_write
-- Purpose: run after each product Deposit/Read/Fit/branch action. It reports
-- recent product activity rows, runtime rows, and errors. Optional runtime
-- tables are reported as missing instead of making the whole query fail.

CREATE OR REPLACE FUNCTION pg_temp.v28_qa_terminal_activity_after_write()
RETURNS TABLE(section text, rows jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  IF to_regclass('public.executions') IS NULL THEN
    RETURN QUERY
      SELECT
        'executions_recent'::text,
        jsonb_build_array(
          jsonb_build_object(
            'missing_table', 'public.executions',
            'impact', 'product activity history and record buttons cannot persist readback rows.'
          )
        );
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          user_id::text,
          type,
          status,
          created_at,
          started_at,
          completed_at,
          jsonb_build_object(
            'summary', coalesce(output ->> 'summary', output #>> '{asset_pack_completion,summary}'),
            'repo_snapshot', coalesce(output -> 'repo_snapshot', output #> '{asset_pack_completion,repoSnapshot}'),
            'bitcode_activity_state', output #> '{asset_pack_completion,bitcodeActivityState}',
            'deposit', output -> 'deposit',
            'deposit_asset', output -> 'asset',
            'deposit_asset_id', coalesce(output #>> '{asset,assetId}', context ->> 'candidateAssetId'),
            'deposit_asset_title', output #>> '{asset,title}',
            'read_measurement', output -> 'readMeasurement',
            'fit', output -> 'fit',
            'repository_anchor', output -> 'repositoryAnchor'
          ) AS output_summary,
          jsonb_build_object(
            'source', context ->> 'source',
            'surface', context ->> 'surface',
            'workbench', context ->> 'workbench',
            'repositoryFullName', coalesce(context ->> 'repositoryFullName', context ->> 'repositoryAnchor'),
            'repositoryAnchor', context ->> 'repositoryAnchor',
            'sourceBranch', context ->> 'sourceBranch',
            'sourceCommit', context ->> 'sourceCommit',
            'walletAuthorizationSigned', context ->> 'walletAuthorizationSigned',
            'candidateAssetId', context ->> 'candidateAssetId',
            'scenarioLabel', context ->> 'scenarioLabel',
            'provider', context ->> 'provider'
          ) AS context_summary,
          error,
          total_tokens,
          total_cost,
          duration_ms
        FROM public.executions
        WHERE
          created_at > now() - interval '24 hours'
          OR type IN (
            'agentic-execution:asset-pack',
            'agentic-execution:read-measurement',
            'agentic-execution:proof-refresh'
          )
        ORDER BY created_at DESC
        LIMIT 30
      )
      SELECT
        'executions_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;

  IF to_regclass('public.execution_events') IS NULL THEN
    RETURN QUERY
      SELECT
        'execution_events_recent'::text,
        jsonb_build_array(
          jsonb_build_object(
            'missing_table', 'public.execution_events',
            'impact', 'Selected product runs cannot show step/event replay from this table.'
          )
        );
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          run_id::text,
          event_type,
          agent_name,
          phase,
          event_data,
          created_at
        FROM public.execution_events
        ORDER BY created_at DESC
        LIMIT 30
      )
      SELECT
        'execution_events_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;

  IF to_regclass('public.pipeline_runs') IS NULL THEN
    RETURN QUERY
      SELECT
        'pipeline_runs_recent'::text,
        jsonb_build_array(jsonb_build_object('missing_table', 'public.pipeline_runs'));
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          user_id::text,
          pipeline_type,
          pipeline_name,
          pipeline_version,
          status,
          created_at,
          updated_at,
          started_at,
          completed_at,
          execution_id::text,
          correlation_id::text,
          error_data,
          jsonb_build_object(
            'metadata_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(metadata, '{}'::jsonb)) AS keys(key)
            ),
            'input_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(input, '{}'::jsonb)) AS keys(key)
            ),
            'output_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(output, '{}'::jsonb)) AS keys(key)
            ),
            'artifact_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(artifacts, '{}'::jsonb)) AS keys(key)
            ),
            'validation_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(validation, '{}'::jsonb)) AS keys(key)
            ),
            'metrics', metrics
          ) AS runtime_summary
        FROM public.pipeline_runs
        ORDER BY created_at DESC
        LIMIT 20
      )
      SELECT
        'pipeline_runs_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;

  IF to_regclass('public.deliverable_pipeline_runs') IS NULL THEN
    RETURN QUERY
      SELECT
        'deliverable_pipeline_runs_recent'::text,
        jsonb_build_array(jsonb_build_object('missing_table', 'public.deliverable_pipeline_runs'));
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          user_id::text,
          status,
          pipeline_type,
          created_at,
          updated_at,
          started_at,
          completed_at,
          pipeline_run_id::text,
          error_data,
          total_tokens,
          total_cost,
          duration_ms,
          jsonb_build_object(
            'item_count', jsonb_array_length(coalesce(items, '[]'::jsonb)),
            'context_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(context, '{}'::jsonb)) AS keys(key)
            ),
            'input_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(input_data, '{}'::jsonb)) AS keys(key)
            ),
            'output_keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(output_data, '{}'::jsonb)) AS keys(key)
            ),
            'summary', coalesce(output_data ->> 'summary', output_data #>> '{asset_pack_completion,summary}')
          ) AS runtime_summary
        FROM public.deliverable_pipeline_runs
        ORDER BY created_at DESC
        LIMIT 20
      )
      SELECT
        'deliverable_pipeline_runs_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;

  IF to_regclass('public.stream_logs') IS NULL THEN
    RETURN QUERY
      SELECT
        'stream_logs_recent'::text,
        jsonb_build_array(jsonb_build_object('missing_table', 'public.stream_logs'));
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          stream_id,
          user_id::text,
          log_type,
          jsonb_build_object(
            'keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(log_data, '{}'::jsonb)) AS keys(key)
            ),
            'event', log_data ->> 'event',
            'message', log_data ->> 'message',
            'status', log_data ->> 'status'
          ) AS log_summary,
          created_at
        FROM public.stream_logs
        ORDER BY created_at DESC
        LIMIT 30
      )
      SELECT
        'stream_logs_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;

  IF to_regclass('public.error_logs') IS NULL THEN
    RETURN QUERY
      SELECT
        'error_logs_recent'::text,
        jsonb_build_array(jsonb_build_object('missing_table', 'public.error_logs'));
  ELSE
    RETURN QUERY EXECUTE $query$
      WITH recent AS (
        SELECT
          id::text,
          user_id::text,
          error_type,
          error_message,
          jsonb_build_object(
            'keys', (
              SELECT coalesce(jsonb_agg(key ORDER BY key), '[]'::jsonb)
              FROM jsonb_object_keys(coalesce(context, '{}'::jsonb)) AS keys(key)
            ),
            'url', context ->> 'url',
            'route', context ->> 'route',
            'status', context ->> 'status'
          ) AS context_summary,
          created_at
        FROM public.error_logs
        WHERE created_at > now() - interval '24 hours'
        ORDER BY created_at DESC
        LIMIT 30
      )
      SELECT
        'error_logs_recent'::text,
        coalesce(jsonb_agg(to_jsonb(recent) ORDER BY created_at DESC), '[]'::jsonb)
      FROM recent;
    $query$;
  END IF;
END;
$$;

SELECT *
FROM pg_temp.v28_qa_terminal_activity_after_write();
