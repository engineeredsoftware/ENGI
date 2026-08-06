/**
 * VCS Provider Interface - Abstract interface for version control system providers
 * 
 * Defines the contract that all VCS providers (GitHub, GitLab, Bitbucket) must implement.
 * Provides a unified interface for:
 * - Authentication and authorization
 * - Repository, branch, and file operations
 * - Pull requests and code reviews
 * - Issues and comments
 * - Webhooks and integrations
 * 
 * @doc-primitive
 * type: interface
 * category: vcs
 * pattern: provider-abstraction
 */

import {
  VCSProviderType,
  VCSAuth,
  VCSUser,
  VCSRepository,
  VCSBranch,
  VCSPullRequest,
  VCSFile,
  VCSCommit,
  VCSIssue,
  VCSComment,
  VCSWebhook,
  VCSTreeItem,
  ListReposOptions,
  ListPROptions,
  ListIssuesOptions,
  CreateRepoData,
  CreatePRData,
  UpdatePRData,
  FileUpdateData,
  FileDeleteData,
  CreateWebhookData,
  CreateIssueData
} from './types';

/**
 * Abstract interface for VCS providers
 * All VCS providers (GitHub, GitLab, Bitbucket) must implement this interface
 */
export interface AbstractVCSProvider {
  readonly type: VCSProviderType;
  
  // Authentication
  getAuthorizationUrl(state: string, scopes?: string[]): string;
  exchangeCodeForToken(code: string): Promise<VCSAuth>;
  refreshAccessToken?(refreshToken: string): Promise<VCSAuth>;
  validateToken(auth: VCSAuth): Promise<boolean>;
  revokeToken?(auth: VCSAuth): Promise<void>;
  
  // User operations
  getCurrentUser(auth: VCSAuth): Promise<VCSUser>;
  getUser(auth: VCSAuth, username: string): Promise<VCSUser>;
  
  // Repository operations
  listRepositories(auth: VCSAuth, options?: ListReposOptions): Promise<VCSRepository[]>;
  getRepository(auth: VCSAuth, owner: string, repo: string): Promise<VCSRepository>;
  createRepository(auth: VCSAuth, data: CreateRepoData, owner?: string): Promise<VCSRepository>;
  deleteRepository?(auth: VCSAuth, owner: string, repo: string): Promise<void>;
  forkRepository?(auth: VCSAuth, owner: string, repo: string): Promise<VCSRepository>;
  
  // Branch operations
  listBranches(auth: VCSAuth, owner: string, repo: string): Promise<VCSBranch[]>;
  getBranch(auth: VCSAuth, owner: string, repo: string, branch: string): Promise<VCSBranch>;
  createBranch?(auth: VCSAuth, owner: string, repo: string, branch: string, from: string): Promise<VCSBranch>;
  deleteBranch?(auth: VCSAuth, owner: string, repo: string, branch: string): Promise<void>;
  
  // Pull Request operations
  createPullRequest(auth: VCSAuth, owner: string, repo: string, data: CreatePRData): Promise<VCSPullRequest>;
  listPullRequests(auth: VCSAuth, owner: string, repo: string, options?: ListPROptions): Promise<VCSPullRequest[]>;
  getPullRequest(auth: VCSAuth, owner: string, repo: string, number: number): Promise<VCSPullRequest>;
  updatePullRequest(auth: VCSAuth, owner: string, repo: string, number: number, data: UpdatePRData): Promise<VCSPullRequest>;
  mergePullRequest?(auth: VCSAuth, owner: string, repo: string, number: number, mergeMethod?: string): Promise<void>;
  listPullRequestComments?(auth: VCSAuth, owner: string, repo: string, number: number): Promise<VCSComment[]>;
  createPullRequestComment?(auth: VCSAuth, owner: string, repo: string, number: number, body: string): Promise<VCSComment>;
  
  // File operations
  getFileContent(auth: VCSAuth, owner: string, repo: string, path: string, ref?: string): Promise<VCSFile>;
  createOrUpdateFile(auth: VCSAuth, owner: string, repo: string, path: string, data: FileUpdateData): Promise<VCSFile>;
  deleteFile(auth: VCSAuth, owner: string, repo: string, path: string, data: FileDeleteData): Promise<void>;
  listFiles?(auth: VCSAuth, owner: string, repo: string, path?: string, ref?: string): Promise<VCSTreeItem[]>;
  
  // Commit operations
  getCommit?(auth: VCSAuth, owner: string, repo: string, sha: string): Promise<VCSCommit>;
  listCommits?(auth: VCSAuth, owner: string, repo: string, options?: { branch?: string; since?: Date; until?: Date; }): Promise<VCSCommit[]>;
  compareCommits?(auth: VCSAuth, owner: string, repo: string, base: string, head: string): Promise<{
    commits: VCSCommit[];
    files: VCSFile[];
    ahead: number;
    behind: number;
  }>;
  
  // Issue operations (optional, not all VCS have issues)
  createIssue?(auth: VCSAuth, owner: string, repo: string, data: CreateIssueData): Promise<VCSIssue>;
  listIssues?(auth: VCSAuth, owner: string, repo: string, options?: ListIssuesOptions): Promise<VCSIssue[]>;
  getIssue?(auth: VCSAuth, owner: string, repo: string, number: number): Promise<VCSIssue>;
  updateIssue?(auth: VCSAuth, owner: string, repo: string, number: number, data: Partial<CreateIssueData>): Promise<VCSIssue>;
  listIssueComments?(auth: VCSAuth, owner: string, repo: string, number: number): Promise<VCSComment[]>;
  createIssueComment?(auth: VCSAuth, owner: string, repo: string, number: number, body: string): Promise<VCSComment>;
  
  // Webhook operations
  createWebhook(auth: VCSAuth, owner: string, repo: string, config: CreateWebhookData): Promise<VCSWebhook>;
  listWebhooks(auth: VCSAuth, owner: string, repo: string): Promise<VCSWebhook[]>;
  getWebhook?(auth: VCSAuth, owner: string, repo: string, id: string): Promise<VCSWebhook>;
  updateWebhook?(auth: VCSAuth, owner: string, repo: string, id: string, config: Partial<CreateWebhookData>): Promise<VCSWebhook>;
  deleteWebhook(auth: VCSAuth, owner: string, repo: string, id: string): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
  
  // Raw API access (for provider-specific features)
  rawRequest?<T = unknown>(auth: VCSAuth, method: string, path: string, data?: unknown): Promise<T>;
}