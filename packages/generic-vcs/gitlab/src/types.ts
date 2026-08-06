import { z } from 'zod';

/**
 * GitLab Authentication Configuration
 */
export interface GitLabAuthConfig {
  accessToken: string;
  instanceUrl?: string;
}

/**
 * GitLab OAuth Data from token exchange
 */
export interface GitLabOAuthData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope: string;
}

/**
 * GitLab User
 */
export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  web_url: string;
  state: string;
  created_at: string;
}

/**
 * GitLab Connection stored in database
 */
export interface GitLabConnection {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  gitlab_user_id: number;
  username: string;
  name: string;
  email: string;
  avatar_url?: string;
  web_url: string;
  gitlab_instance_url: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

/**
 * GitLab Project
 */
export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  description?: string;
  default_branch: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  readme_url?: string;
  avatar_url?: string;
  forks_count: number;
  star_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  visibility: 'private' | 'internal' | 'public';
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  archived: boolean;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id?: number;
    avatar_url?: string;
    web_url: string;
  };
}

/**
 * GitLab Branch
 */
export interface GitLabBranch {
  name: string;
  merged: boolean;
  protected: boolean;
  default: boolean;
  developers_can_push: boolean;
  developers_can_merge: boolean;
  can_push: boolean;
  web_url: string;
  commit: {
    id: string;
    short_id: string;
    created_at: string;
    parent_ids: string[];
    title: string;
    message: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
    web_url: string;
  };
}

/**
 * GitLab Merge Request
 */
export interface GitLabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description?: string;
  state: 'opened' | 'closed' | 'locked' | 'merged';
  created_at: string;
  updated_at: string;
  merged_by?: GitLabUser;
  merged_at?: string;
  closed_by?: GitLabUser;
  closed_at?: string;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  author: GitLabUser;
  assignees: GitLabUser[];
  assignee?: GitLabUser;
  reviewers: GitLabUser[];
  source_project_id: number;
  target_project_id: number;
  labels: string[];
  draft: boolean;
  work_in_progress: boolean;
  milestone?: {
    id: number;
    title: string;
    description?: string;
    state: string;
    created_at: string;
    updated_at: string;
    group_id?: number;
    project_id?: number;
    web_url: string;
  };
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  detailed_merge_status: string;
  sha: string;
  merge_commit_sha?: string;
  squash_commit_sha?: string;
  discussion_locked?: boolean;
  should_remove_source_branch?: boolean;
  force_remove_source_branch?: boolean;
  reference: string;
  references: {
    short: string;
    relative: string;
    full: string;
  };
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate?: string;
    human_total_time_spent?: string;
  };
  squash: boolean;
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
}

/**
 * GitLab Issue
 */
export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description?: string;
  state: 'opened' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  closed_by?: GitLabUser;
  labels: string[];
  milestone?: {
    id: number;
    title: string;
    description?: string;
    state: string;
    created_at: string;
    updated_at: string;
    group_id?: number;
    project_id?: number;
    web_url: string;
  };
  assignees: GitLabUser[];
  assignee?: GitLabUser;
  type: 'issue' | 'incident' | 'test_case';
  author: GitLabUser;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  due_date?: string;
  confidential: boolean;
  discussion_locked: boolean;
  issue_type: string;
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate?: string;
    human_total_time_spent?: string;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  blocking_issues_count: number;
  has_tasks: boolean;
  _links: {
    self: string;
    notes: string;
    award_emoji: string;
    project: string;
    closed_as_duplicate_of?: string;
  };
  references: {
    short: string;
    relative: string;
    full: string;
  };
  severity: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  subscribed: boolean;
  moved_to_id?: number;
  service_desk_reply_to?: string;
}

/**
 * GitLab Commit
 */
export interface GitLabCommit {
  id: string;
  short_id: string;
  created_at: string;
  parent_ids: string[];
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  trailers: Record<string, string>;
  web_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  status?: 'running' | 'pending' | 'success' | 'failed' | 'canceled' | 'skipped' | 'manual';
  project_id?: number;
  last_pipeline?: {
    id: number;
    iid: number;
    project_id: number;
    sha: string;
    ref: string;
    status: string;
    source: string;
    created_at: string;
    updated_at: string;
    web_url: string;
  };
}

/**
 * GitLab File
 */
export interface GitLabFile {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  content_sha256: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
  execute_filemode?: boolean;
}

/**
 * GitLab Tree Item
 */
export interface GitLabTreeItem {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}

/**
 * GitLab API Error
 */
export interface GitLabApiError extends Error {
  status?: number;
  response?: any;
}

// Zod schemas for validation
export const GitLabAuthConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  instanceUrl: z.string().url().optional()
});

export const GitLabOAuthDataSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  token_type: z.string(),
  scope: z.string()
});