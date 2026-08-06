/**
 * ExternalAttachment — base Attachment for Externals-auxillary connections.
 *
 * Aligns with the Externals product area: GitHub (VCS provider), and eventually
 * Jira, Notion, Linear, Figma, and other sources that attach data from outside.
 *
 * Former name: IntegrationAttachment / category `integration`.
 */

import type { BaseAttachment } from '@bitcode/attachment-generics';

/** External connection providers (Extensibles via Externals auxillary). */
export type ExternalProvider =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'notion'
  | 'figma'
  | 'jira'
  | 'linear'
  | string;

/**
 * External attachment sub-types.
 * Includes github_repo / settlement targets used by conversations product.
 */
export type ExternalAttachmentType =
  | 'github_repo'
  | 'gitlab_repo'
  | 'bitbucket_repo'
  | 'settlement_target'
  | 'notion_page'
  | 'figma_artboard'
  | 'jira_ticket'
  | 'linear_issue'
  | 'issue'
  | 'pull_request'
  | string;

/**
 * ExternalAttachment — third-party / connected source payload.
 * `connection_id` references the user's Externals connection when known.
 */
export interface ExternalAttachment extends BaseAttachment {
  category: 'external';
  provider: ExternalProvider;
  type: ExternalAttachmentType;
  /** Reference to user's Externals connection (when linked). */
  connection_id?: string;

  // Optional provider-shaped payloads (product fills as needed)
  repository?: {
    owner: string;
    name: string;
    full_name: string;
  };
  notion?: {
    page_id: string;
    workspace_id: string;
    workspace_name?: string;
    database_id?: string;
    parent_page?: string;
    properties?: Record<string, unknown>;
    last_edited_by?: string;
    last_edited_at?: string;
  };
  figma?: {
    file_key: string;
    node_id?: string;
    project_id?: string;
    team_id?: string;
    version?: string;
    thumbnail_url?: string;
    editor_type?: 'figma' | 'figjam';
  };
  jira?: {
    issue_key: string;
    project_key: string;
    issue_type: string;
    status: string;
    priority?: string;
    assignee?: string;
    reporter?: string;
  };
  linear?: {
    issue_id: string;
    team_id: string;
    project_id?: string;
    state: string;
    priority?: number;
    assignee?: string;
  };
  issue?: {
    number: number;
    state: 'open' | 'closed';
    author: string;
    labels?: string[];
    assignees?: string[];
  };
  pull_request?: {
    number: number;
    state: 'open' | 'closed' | 'merged';
    source_branch: string;
    target_branch: string;
    author: string;
    reviewers?: string[];
    approved?: boolean;
  };
}

export function isExternalAttachment(attachment: {
  category: string;
}): attachment is ExternalAttachment {
  return attachment.category === 'external';
}

export function validateExternalProvider(provider: string): boolean {
  return typeof provider === 'string' && provider.trim().length > 0;
}
