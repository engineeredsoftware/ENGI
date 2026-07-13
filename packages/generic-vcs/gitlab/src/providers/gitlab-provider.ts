/**
 * GitLab Provider - Production-ready GitLab integration
 * 
 * Implements the VCS abstraction for GitLab using their REST API v4.
 * Supports self-hosted instances and GitLab.com.
 * 
 * @doc-code
 * type: provider
 * category: vcs
 * pattern: provider-implementation
 */

import {
  VCSProvider,
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
  VCSConfig,
  VCSError,
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
} from '@bitcode/vcs-generics';
import { log } from '@bitcode/logger';

/**
 * GitLab API response interfaces
 */
interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description?: string;
  visibility: 'private' | 'internal' | 'public';
  default_branch: string;
  web_url: string;
  http_url_to_repo: string;
  ssh_url_to_repo: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
  };
  created_at: string;
  last_activity_at: string;
  archived: boolean;
  forked_from_project?: any;
  forks_count: number;
  star_count: number;
  statistics?: {
    repository_size: number;
  };
}

interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: 'opened' | 'closed' | 'locked' | 'merged';
  source_branch: string;
  target_branch: string;
  author: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at?: string;
  merged_by?: {
    id: number;
    username: string;
  };
  web_url: string;
  changes_count?: string;
}

/**
 * GitLab VCS Provider
 */
export default class GitLabProvider extends VCSProvider {
  readonly type = 'gitlab' as const;
  private apiUrl: string;

  constructor(config: VCSConfig) {
    super(config);
    this.apiUrl = this.instanceUrl ? `${this.instanceUrl}/api/v4` : 'https://gitlab.com/api/v4';
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    auth: VCSAuth,
    method: string,
    path: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new VCSError(
        error.message || `GitLab API error: ${response.status}`,
        'API_ERROR',
        response.status,
        'gitlab'
      );
    }

    return response.json();
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const scope = scopes?.join(' ') || 'api read_user read_repository write_repository';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
      scope
    });

    const baseUrl = this.instanceUrl || 'https://gitlab.com';
    return `${baseUrl}/oauth/authorize?${params}`;
  }

  /**
   * Exchange code for token
   */
  async exchangeCodeForToken(code: string): Promise<VCSAuth> {
    return this.executeWithResilience(async () => {
      const response = await fetch(`${this.instanceUrl || 'https://gitlab.com'}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new VCSError(data.error_description || data.error || 'Token exchange failed', 'AUTH_ERROR');
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
      };
    }, {
      operationName: 'exchangeCodeForToken',
      timeout: this.timeouts.auth
    });
  }

  /**
   * Validate token
   */
  async validateToken(auth: VCSAuth): Promise<boolean> {
    return this.executeWithResilience(async () => {
      try {
        await this.makeRequest(auth, 'GET', '/user');
        return true;
      } catch {
        return false;
      }
    }, {
      operationName: 'validateToken',
      timeout: this.timeouts.auth,
      retryable: false
    });
  }

  /**
   * Get current user
   */
  async getCurrentUser(auth: VCSAuth): Promise<VCSUser> {
    return this.executeWithResilience(async () => {
      const user: any = await this.makeRequest(auth, 'GET', '/user');

      return {
        id: user.id.toString(),
        username: user.username,
        displayName: user.name || undefined,
        email: user.email || undefined,
        avatarUrl: user.avatar_url,
        url: user.web_url
      };
    }, {
      operationName: 'getCurrentUser'
    });
  }

  /**
   * Get user by username
   */
  async getUser(auth: VCSAuth, username: string): Promise<VCSUser> {
    return this.executeWithResilience(async () => {
      const users: any[] = await this.makeRequest(auth, 'GET', `/users?username=${username}`);
      
      if (users.length === 0) {
        throw new VCSError('User not found', 'NOT_FOUND');
      }

      const user = users[0];
      return {
        id: user.id.toString(),
        username: user.username,
        displayName: user.name || undefined,
        email: user.email || undefined,
        avatarUrl: user.avatar_url,
        url: user.web_url
      };
    }, {
      operationName: 'getUser'
    });
  }

  /**
   * List repositories
   */
  async listRepositories(auth: VCSAuth, options?: ListReposOptions): Promise<VCSRepository[]> {
    return this.executeWithResilience(async () => {
      const params = new URLSearchParams({
        page: (options?.page || 1).toString(),
        per_page: (options?.perPage || 20).toString(),
        visibility: options?.visibility || 'all',
        order_by: options?.sort || 'created_at',
        sort: options?.direction || 'desc'
      });

      const projects: GitLabProject[] = await this.makeRequest(
        auth,
        'GET',
        `/projects?${params}`
      );

      return projects.map(project => ({
        id: project.id.toString(),
        name: project.name,
        fullName: project.path_with_namespace,
        description: project.description || undefined,
        private: project.visibility === 'private',
        defaultBranch: project.default_branch,
        url: project.web_url,
        cloneUrl: project.http_url_to_repo,
        sshUrl: project.ssh_url_to_repo,
        owner: {
          id: project.namespace.id.toString(),
          username: project.namespace.path,
          type: project.namespace.kind === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.last_activity_at),
        archived: project.archived,
        fork: !!project.forked_from_project,
        forksCount: project.forks_count,
        starsCount: project.star_count,
        size: project.statistics?.repository_size
      }));
    }, {
      operationName: 'listRepositories'
    });
  }

  /**
   * Get repository
   */
  async getRepository(auth: VCSAuth, owner: string, repo: string): Promise<VCSRepository> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const project: GitLabProject = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}`
      );

      return {
        id: project.id.toString(),
        name: project.name,
        fullName: project.path_with_namespace,
        description: project.description || undefined,
        private: project.visibility === 'private',
        defaultBranch: project.default_branch,
        url: project.web_url,
        cloneUrl: project.http_url_to_repo,
        sshUrl: project.ssh_url_to_repo,
        owner: {
          id: project.namespace.id.toString(),
          username: project.namespace.path,
          type: project.namespace.kind === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.last_activity_at),
        archived: project.archived,
        fork: !!project.forked_from_project,
        forksCount: project.forks_count,
        starsCount: project.star_count,
        size: project.statistics?.repository_size
      };
    }, {
      operationName: 'getRepository'
    });
  }

  /**
   * Create repository
   */
  async createRepository(auth: VCSAuth, data: CreateRepoData, owner?: string): Promise<VCSRepository> {
    return this.executeWithResilience(async () => {
      const body: any = {
        name: data.name,
        description: data.description,
        visibility: data.private ? 'private' : 'public',
        initialize_with_readme: data.autoInit
      };

      if (owner) {
        // Get namespace ID for the owner
        const namespaces: any[] = await this.makeRequest(auth, 'GET', `/namespaces?search=${owner}`);
        if (namespaces.length > 0) {
          body.namespace_id = namespaces[0].id;
        }
      }

      const project: GitLabProject = await this.makeRequest(
        auth,
        'POST',
        '/projects',
        body
      );

      return {
        id: project.id.toString(),
        name: project.name,
        fullName: project.path_with_namespace,
        description: project.description || undefined,
        private: project.visibility === 'private',
        defaultBranch: project.default_branch,
        url: project.web_url,
        cloneUrl: project.http_url_to_repo,
        sshUrl: project.ssh_url_to_repo,
        owner: {
          id: project.namespace.id.toString(),
          username: project.namespace.path,
          type: project.namespace.kind === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.last_activity_at)
      };
    }, {
      operationName: 'createRepository',
      timeout: this.timeouts.write
    });
  }

  /**
   * List branches
   */
  async listBranches(auth: VCSAuth, owner: string, repo: string): Promise<VCSBranch[]> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const branches: any[] = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/repository/branches`
      );

      return branches.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.id,
          message: branch.commit.message,
          author: {
            name: branch.commit.author_name,
            email: branch.commit.author_email,
            date: new Date(branch.commit.authored_date)
          }
        },
        protected: branch.protected,
        default: branch.default
      }));
    }, {
      operationName: 'listBranches'
    });
  }

  /**
   * Get branch
   */
  async getBranch(auth: VCSAuth, owner: string, repo: string, branch: string): Promise<VCSBranch> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const branchName = encodeURIComponent(branch);
      const data: any = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/repository/branches/${branchName}`
      );

      return {
        name: data.name,
        commit: {
          sha: data.commit.id,
          message: data.commit.message,
          author: {
            name: data.commit.author_name,
            email: data.commit.author_email,
            date: new Date(data.commit.authored_date)
          }
        },
        protected: data.protected,
        default: data.default
      };
    }, {
      operationName: 'getBranch'
    });
  }

  /**
   * Create pull request (merge request in GitLab)
   */
  async createPullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    data: CreatePRData
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const mr: GitLabMergeRequest = await this.makeRequest(
        auth,
        'POST',
        `/projects/${projectPath}/merge_requests`,
        {
          source_branch: data.sourceBranch,
          target_branch: data.targetBranch,
          title: data.title,
          description: data.description,
          draft: data.draft
        }
      );

      return {
        id: mr.id.toString(),
        number: mr.iid,
        title: mr.title,
        description: mr.description || undefined,
        state: mr.state === 'opened' ? 'open' : mr.state === 'merged' ? 'merged' : 'closed',
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        author: {
          id: mr.author.id.toString(),
          username: mr.author.username,
          displayName: mr.author.name,
          avatarUrl: mr.author.avatar_url
        },
        createdAt: new Date(mr.created_at),
        updatedAt: new Date(mr.updated_at),
        mergedAt: mr.merged_at ? new Date(mr.merged_at) : undefined,
        url: mr.web_url
      };
    }, {
      operationName: 'createPullRequest',
      timeout: this.timeouts.write
    });
  }

  /**
   * List pull requests (merge requests)
   */
  async listPullRequests(
    auth: VCSAuth,
    owner: string,
    repo: string,
    options?: ListPROptions
  ): Promise<VCSPullRequest[]> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const params = new URLSearchParams({
        state: options?.state || 'opened',
        page: (options?.page || 1).toString(),
        per_page: (options?.perPage || 20).toString(),
        order_by: options?.sort || 'created_at',
        sort: options?.direction || 'desc'
      });

      if (options?.author) {
        params.append('author_username', options.author);
      }

      const mrs: GitLabMergeRequest[] = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/merge_requests?${params}`
      );

      return mrs.map(mr => ({
        id: mr.id.toString(),
        number: mr.iid,
        title: mr.title,
        description: mr.description || undefined,
        state: mr.state === 'opened' ? 'open' : mr.state === 'merged' ? 'merged' : 'closed',
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        author: {
          id: mr.author.id.toString(),
          username: mr.author.username,
          displayName: mr.author.name,
          avatarUrl: mr.author.avatar_url
        },
        createdAt: new Date(mr.created_at),
        updatedAt: new Date(mr.updated_at),
        mergedAt: mr.merged_at ? new Date(mr.merged_at) : undefined,
        url: mr.web_url
      }));
    }, {
      operationName: 'listPullRequests'
    });
  }

  /**
   * Get pull request (merge request)
   */
  async getPullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    number: number
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const mr: GitLabMergeRequest = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/merge_requests/${number}`
      );

      // Get detailed changes info
      const changes: any = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/merge_requests/${number}/changes`
      );

      return {
        id: mr.id.toString(),
        number: mr.iid,
        title: mr.title,
        description: mr.description || undefined,
        state: mr.state === 'opened' ? 'open' : mr.state === 'merged' ? 'merged' : 'closed',
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        author: {
          id: mr.author.id.toString(),
          username: mr.author.username,
          displayName: mr.author.name,
          avatarUrl: mr.author.avatar_url
        },
        createdAt: new Date(mr.created_at),
        updatedAt: new Date(mr.updated_at),
        mergedAt: mr.merged_at ? new Date(mr.merged_at) : undefined,
        changes: {
          additions: changes.changes?.reduce((sum: number, c: any) => sum + (c.added_lines || 0), 0) || 0,
          deletions: changes.changes?.reduce((sum: number, c: any) => sum + (c.removed_lines || 0), 0) || 0,
          changedFiles: changes.changes?.length || 0
        },
        url: mr.web_url
      };
    }, {
      operationName: 'getPullRequest'
    });
  }

  /**
   * Update pull request (merge request)
   */
  async updatePullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    number: number,
    data: UpdatePRData
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const body: any = {};

      if (data.title) body.title = data.title;
      if (data.description) body.description = data.description;
      if (data.state) {
        body.state_event = data.state === 'closed' ? 'close' : 'reopen';
      }
      if (data.targetBranch) body.target_branch = data.targetBranch;

      await this.makeRequest(
        auth,
        'PUT',
        `/projects/${projectPath}/merge_requests/${number}`,
        body
      );

      return this.getPullRequest(auth, owner, repo, number);
    }, {
      operationName: 'updatePullRequest',
      timeout: this.timeouts.write
    });
  }

  /**
   * Get file content
   */
  async getFileContent(
    auth: VCSAuth,
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<VCSFile> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const filePath = encodeURIComponent(path);
      const params = ref ? `?ref=${encodeURIComponent(ref)}` : '';
      
      const file: any = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/repository/files/${filePath}${params}`
      );

      return {
        path: file.file_path,
        content: file.content,
        encoding: file.encoding as 'base64' | 'utf-8',
        size: file.size,
        sha: file.blob_id,
        type: 'file'
      };
    }, {
      operationName: 'getFileContent'
    });
  }

  /**
   * Create or update file
   */
  async createOrUpdateFile(
    auth: VCSAuth,
    owner: string,
    repo: string,
    path: string,
    data: FileUpdateData
  ): Promise<VCSFile> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const filePath = encodeURIComponent(path);
      
      // Check if file exists
      let exists = false;
      try {
        await this.getFileContent(auth, owner, repo, path, data.branch);
        exists = true;
      } catch {
        // File doesn't exist
      }

      const method = exists ? 'PUT' : 'POST';
      const body = {
        branch: data.branch || 'main',
        content: data.content,
        commit_message: data.message,
        encoding: data.encoding || 'text',
        author_email: data.author?.email,
        author_name: data.author?.name
      };

      const result: any = await this.makeRequest(
        auth,
        method,
        `/projects/${projectPath}/repository/files/${filePath}`,
        body
      );

      return {
        path: result.file_path,
        content: data.content,
        encoding: 'utf-8',
        size: data.content.length,
        sha: result.blob_id,
        type: 'file'
      };
    }, {
      operationName: 'createOrUpdateFile',
      timeout: this.timeouts.write
    });
  }

  /**
   * Delete file
   */
  async deleteFile(
    auth: VCSAuth,
    owner: string,
    repo: string,
    path: string,
    data: FileDeleteData
  ): Promise<void> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const filePath = encodeURIComponent(path);
      
      await this.makeRequest(
        auth,
        'DELETE',
        `/projects/${projectPath}/repository/files/${filePath}`,
        {
          branch: data.branch || 'main',
          commit_message: data.message,
          author_email: data.author?.email,
          author_name: data.author?.name
        }
      );
    }, {
      operationName: 'deleteFile',
      timeout: this.timeouts.write
    });
  }

  /**
   * List files
   */
  async listFiles(
    auth: VCSAuth,
    owner: string,
    repo: string,
    path?: string,
    ref?: string
  ): Promise<VCSTreeItem[]> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const params = new URLSearchParams();
      if (path) params.append('path', path);
      if (ref) params.append('ref', ref);
      
      const tree: any[] = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/repository/tree?${params}`
      );

      return tree.map(item => ({
        path: item.path,
        type: item.type === 'blob' ? 'blob' : 'tree',
        sha: item.id,
        size: item.size
      }));
    }, {
      operationName: 'listFiles'
    });
  }

  /**
   * Create webhook
   */
  async createWebhook(
    auth: VCSAuth,
    owner: string,
    repo: string,
    config: CreateWebhookData
  ): Promise<VCSWebhook> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      
      // Map generic events to GitLab events
      const gitlabEvents: Record<string, boolean> = {};
      config.events.forEach(event => {
        switch (event) {
          case 'push':
            gitlabEvents.push_events = true;
            break;
          case 'pull_request':
            gitlabEvents.merge_requests_events = true;
            break;
          case 'issues':
            gitlabEvents.issues_events = true;
            break;
          default:
            gitlabEvents[`${event}_events`] = true;
        }
      });

      const hook: any = await this.makeRequest(
        auth,
        'POST',
        `/projects/${projectPath}/hooks`,
        {
          url: config.url,
          token: config.secret,
          enable_ssl_verification: true,
          ...gitlabEvents
        }
      );

      return {
        id: hook.id.toString(),
        url: hook.url,
        events: config.events,
        active: true,
        createdAt: new Date(hook.created_at)
      };
    }, {
      operationName: 'createWebhook',
      timeout: this.timeouts.write
    });
  }

  /**
   * List webhooks
   */
  async listWebhooks(auth: VCSAuth, owner: string, repo: string): Promise<VCSWebhook[]> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const hooks: any[] = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/hooks`
      );

      return hooks.map(hook => {
        const events: string[] = [];
        if (hook.push_events) events.push('push');
        if (hook.merge_requests_events) events.push('pull_request');
        if (hook.issues_events) events.push('issues');
        if (hook.tag_push_events) events.push('create');
        if (hook.wiki_page_events) events.push('wiki');

        return {
          id: hook.id.toString(),
          url: hook.url,
          events,
          active: true,
          createdAt: new Date(hook.created_at)
        };
      });
    }, {
      operationName: 'listWebhooks'
    });
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(auth: VCSAuth, owner: string, repo: string, id: string): Promise<void> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      await this.makeRequest(
        auth,
        'DELETE',
        `/projects/${projectPath}/hooks/${id}`
      );
    }, {
      operationName: 'deleteWebhook',
      timeout: this.timeouts.write
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // GitLab uses a simple token comparison
    return signature === secret;
  }

  /**
   * Create issue
   */
  async createIssue(
    auth: VCSAuth,
    owner: string,
    repo: string,
    data: CreateIssueData
  ): Promise<VCSIssue> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const issue: any = await this.makeRequest(
        auth,
        'POST',
        `/projects/${projectPath}/issues`,
        {
          title: data.title,
          description: data.body,
          labels: data.labels?.join(','),
          assignee_ids: data.assignees // Note: needs user IDs, not usernames
        }
      );

      return {
        id: issue.id.toString(),
        number: issue.iid,
        title: issue.title,
        body: issue.description || undefined,
        state: issue.state === 'opened' ? 'open' : 'closed',
        author: {
          id: issue.author.id.toString(),
          username: issue.author.username,
          displayName: issue.author.name,
          avatarUrl: issue.author.avatar_url
        },
        assignees: issue.assignees?.map((a: any) => ({
          id: a.id.toString(),
          username: a.username,
          displayName: a.name,
          avatarUrl: a.avatar_url
        })),
        labels: issue.labels || [],
        createdAt: new Date(issue.created_at),
        updatedAt: new Date(issue.updated_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
        url: issue.web_url
      };
    }, {
      operationName: 'createIssue',
      timeout: this.timeouts.write
    });
  }

  /**
   * List issues
   */
  async listIssues(
    auth: VCSAuth,
    owner: string,
    repo: string,
    options?: ListIssuesOptions
  ): Promise<VCSIssue[]> {
    return this.executeWithResilience(async () => {
      const projectPath = encodeURIComponent(`${owner}/${repo}`);
      const params = new URLSearchParams({
        state: options?.state || 'opened',
        page: (options?.page || 1).toString(),
        per_page: (options?.perPage || 20).toString(),
        order_by: 'created_at',
        sort: options?.direction || 'desc'
      });

      if (options?.labels) {
        params.append('labels', options.labels.join(','));
      }
      if (options?.assignee) {
        params.append('assignee_username', options.assignee);
      }
      if (options?.creator) {
        params.append('author_username', options.creator);
      }

      const issues: any[] = await this.makeRequest(
        auth,
        'GET',
        `/projects/${projectPath}/issues?${params}`
      );

      return issues.map(issue => ({
        id: issue.id.toString(),
        number: issue.iid,
        title: issue.title,
        body: issue.description || undefined,
        state: issue.state === 'opened' ? 'open' : 'closed',
        author: {
          id: issue.author.id.toString(),
          username: issue.author.username,
          displayName: issue.author.name,
          avatarUrl: issue.author.avatar_url
        },
        assignees: issue.assignees?.map((a: any) => ({
          id: a.id.toString(),
          username: a.username,
          displayName: a.name,
          avatarUrl: a.avatar_url
        })),
        labels: issue.labels || [],
        createdAt: new Date(issue.created_at),
        updatedAt: new Date(issue.updated_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
        url: issue.web_url
      }));
    }, {
      operationName: 'listIssues'
    });
  }
}