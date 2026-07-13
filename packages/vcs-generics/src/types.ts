/**
 * VCS Types - Unified type definitions for version control system operations
 * 
 * Provides comprehensive type definitions for:
 * - Authentication and configuration
 * - Repository, branch, and file operations
 * - Pull requests and issues
 * - Webhooks and comments
 * - Provider-agnostic abstractions
 * 
 * @doc-package
 * version: 1.0.0
 * pattern: type-definitions
 */

import { z } from 'zod';

// VCS Provider Types
export type VCSProviderType = 'github' | 'gitlab' | 'bitbucket';

// Authentication Types
export interface VCSAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
  provider?: VCSProviderType;
  connectionId?: string;
}

export interface VCSConfig {
  provider: VCSProviderType;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  instanceUrl?: string; // For self-hosted instances
  appId?: string; // For GitHub Apps
  privateKey?: string; // For GitHub Apps
  webhookSecret?: string;
}

// User Types
export interface VCSUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  url?: string;
}

// Repository Types
export interface VCSRepository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  url: string;
  cloneUrl: string;
  sshUrl?: string;
  owner: {
    id: string;
    username: string;
    type: 'user' | 'organization' | 'workspace';
  };
  createdAt?: Date;
  updatedAt?: Date;
  language?: string;
  topics?: string[];
  archived?: boolean;
  fork?: boolean;
  forksCount?: number;
  starsCount?: number;
  size?: number; // in KB
}

// Branch Types
export interface VCSBranch {
  name: string;
  commit: {
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
      date: Date;
    };
  };
  protected: boolean;
  default?: boolean;
}

// Pull Request Types
export interface VCSPullRequest {
  id: string;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed' | 'merged';
  sourceBranch: string;
  targetBranch: string;
  author: VCSUser;
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  mergedBy?: VCSUser;
  reviewers?: VCSUser[];
  approvals?: number;
  changes?: {
    additions: number;
    deletions: number;
    changedFiles: number;
  };
  url: string;
}

// File Types
export interface VCSFile {
  path: string;
  content: string;
  encoding: 'base64' | 'utf-8';
  size: number;
  sha: string;
  url?: string;
  type: 'file' | 'directory' | 'symlink';
}

// Commit Types
export interface VCSCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: Date;
  };
  committer?: {
    name: string;
    email: string;
    date: Date;
  };
  parents: string[];
  url?: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// Issue Types
export interface VCSIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  author: VCSUser;
  assignees?: VCSUser[];
  labels?: string[];
  milestone?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: VCSUser;
  url: string;
}

// Comment Types
export interface VCSComment {
  id: string;
  body: string;
  author: VCSUser;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

// Webhook Types
export interface VCSWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tree/Directory Types
export interface VCSTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

// Connection Types
export interface VCSConnection {
  id: string;
  userId: string;
  provider: VCSProviderType;
  instanceUrl?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  providerUserId: string;
  providerUsername: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Operation Options
export interface ListOptions {
  page?: number;
  perPage?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
}

export interface ListReposOptions extends ListOptions {
  visibility?: 'all' | 'public' | 'private';
  affiliation?: string;
  type?: 'all' | 'owner' | 'member';
}

export interface ListPROptions extends ListOptions {
  state?: 'open' | 'closed' | 'all';
  head?: string;
  base?: string;
  author?: string;
}

export interface ListIssuesOptions extends ListOptions {
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
  assignee?: string;
  creator?: string;
  milestone?: string;
}

// Create/Update Types
export interface CreateRepoData {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

export interface CreatePRData {
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
  draft?: boolean;
}

export interface UpdatePRData {
  title?: string;
  description?: string;
  state?: 'open' | 'closed';
  targetBranch?: string;
}

export interface FileUpdateData {
  content: string;
  message: string;
  branch?: string;
  sha?: string; // Required for updates
  encoding?: 'base64' | 'utf-8';
  author?: {
    name: string;
    email: string;
  };
}

export interface FileDeleteData {
  message: string;
  branch?: string;
  sha: string;
  author?: {
    name: string;
    email: string;
  };
}

export interface CreateWebhookData {
  url: string;
  events: string[];
  active?: boolean;
  secret?: string;
  contentType?: 'json' | 'form';
}

export interface CreateIssueData {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

// Error Types
export class VCSError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public provider?: VCSProviderType
  ) {
    super(message);
    this.name = 'VCSError';
  }
}

// Zod Schemas for validation
export const VCSProviderTypeSchema = z.enum(['github', 'gitlab', 'bitbucket']);

export const VCSAuthSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  tokenType: z.string().optional(),
  scope: z.string().optional()
});

export const VCSConfigSchema = z.object({
  provider: VCSProviderTypeSchema,
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  instanceUrl: z.string().optional(),
  appId: z.string().optional(),
  privateKey: z.string().optional(),
  webhookSecret: z.string().optional()
});

export const VCSConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: VCSProviderTypeSchema,
  instanceUrl: z.string().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.date().optional(),
  providerUserId: z.string(),
  providerUsername: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});