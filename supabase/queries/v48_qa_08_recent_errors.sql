-- Saved query name: v48_qa_08_recent_errors
-- Purpose: triage view — failed executions and recent error_logs for the
-- QA user (last 24h). Source-safe: truncated messages only.
-- Run: whenever a flow misbehaves or a row in v48_qa_06 shows has_error.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  'execution_error' AS kind,
  e.id::text AS ref,
  e.type AS detail_type,
  e.created_at,
  left(e.error::text, 500) AS message
FROM public.executions e
WHERE e.user_id IN (SELECT id FROM qa_user)
  AND e.error IS NOT NULL
  AND e.created_at > now() - interval '24 hours'

UNION ALL

SELECT
  'error_log' AS kind,
  l.id::text AS ref,
  l.error_type AS detail_type,
  l.created_at,
  left(l.error_message, 500) AS message
FROM public.error_logs l
WHERE l.created_at > now() - interval '24 hours'

ORDER BY created_at DESC
LIMIT 25;
