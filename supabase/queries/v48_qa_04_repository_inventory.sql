-- Saved query name: v48_qa_04_repository_inventory
-- Purpose: confirm the synced repository inventory after GitHub connect.
-- Run after: Externals pane loads post-GitHub-connect (the pane sync writes
-- vcs_repositories) — also rerun after changing the installation's
-- repository selection on GitHub.
-- Expect: total_count matches the GitHub installation scope (pane shows
-- "Connected Repositories (N)"); spot-check names and default branches.

WITH qa_user AS (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data ->> 'provider' = 'custom:bitcode-bitcoin'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  COUNT(*) OVER () AS total_count,
  r.repo_full_name,
  r.repo_private,
  r.repo_language,
  r.repo_default_branch,
  r.updated_at
FROM public.vcs_repositories r
WHERE r.user_id IN (SELECT id FROM qa_user)
ORDER BY r.repo_full_name;
