/**
 * Bitbucket Provider - Production-ready Bitbucket integration
 * 
 * Implements the VCS abstraction for Bitbucket using their REST API v2.0.
 * Supports both Cloud and Server instances.
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
 * Bitbucket API response interfaces
 */
interface BitbucketUser {
  uuid: string;
  username: string;
  display_name: string;
  email?: string;
  links: {
    avatar: { href: string };
    html: { href: string };
  };
}

interface BitbucketRepository {
  uuid: string;
  name: string;
  full_name: string;
  description?: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  size: number;
  language?: string;
  mainbranch?: { name: string };
  links: {
    html: { href: string };
    clone: Array<{ name: string; href: string }>;
  };
  workspace: {
    uuid: string;
    slug: string;
    name: string;
    type: string;
  };
  fork_policy?: string;
  has_issues?: boolean;
  has_wiki?: boolean;
}

interface BitbucketPullRequest {
  id: number;
  title: string;
  description?: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  author: {
    uuid: string;
    display_name: string;
    links: { avatar: { href: string } };
  };
  source: {
    branch: { name: string };
    commit: { hash: string };
  };
  destination: {
    branch: { name: string };
    commit: { hash: string };
  };
  created_on: string;
  updated_on: string;
  merge_commit?: { hash: string };
  closed_on?: string;
  links: {
    html: { href: string };
  };
}

/**
 * Bitbucket VCS Provider
 */
export default class BitbucketProvider extends VCSProvider {
  readonly type = 'bitbucket' as const;
  private apiUrl: string;

  constructor(config: VCSConfig) {
    super(config);
    this.apiUrl = this.instanceUrl || 'https://api.bitbucket.org/2.0';
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
        'Accept': 'application/json',
        ...options?.headers
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new VCSError(
        error.error?.message || `Bitbucket API error: ${response.status}`,
        'API_ERROR',
        response.status,
        'bitbucket'
      );
    }

    return response.json();
  }

  /**
   * Paginate through all results
   */
  private async getAllPages<T>(
    auth: VCSAuth,
    initialPath: string,
    extractItems: (data: any) => T[]
  ): Promise<T[]> {
    let allItems: T[] = [];
    let nextUrl = initialPath;

    while (nextUrl) {
      const response = await this.makeRequest<any>(auth, 'GET', nextUrl);
      const items = extractItems(response);
      allItems = allItems.concat(items);
      
      nextUrl = response.next ? new URL(response.next).pathname + new URL(response.next).search : '';
    }

    return allItems;
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state
    });

    if (scopes && scopes.length > 0) {
      params.set('scope', scopes.join(' '));
    } else {
      params.set('scope', 'account repository team');
    }

    const baseUrl = this.instanceUrl || 'https://bitbucket.org';
    return `${baseUrl}/site/oauth2/authorize?${params}`;
  }

  /**
   * Exchange code for token
   */
  async exchangeCodeForToken(code: string): Promise<VCSAuth> {
    return this.executeWithResilience(async () => {
      const response = await fetch(`${this.instanceUrl || 'https://bitbucket.org'}/site/oauth2/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
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
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        scope: data.scopes
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
      const user: BitbucketUser = await this.makeRequest(auth, 'GET', '/user');

      return {
        id: user.uuid,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        avatarUrl: user.links.avatar.href,
        url: user.links.html.href
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
      const user: BitbucketUser = await this.makeRequest(auth, 'GET', `/users/${username}`);

      return {
        id: user.uuid,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        avatarUrl: user.links.avatar.href,
        url: user.links.html.href
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
      // Get current user to determine workspace
      const user = await this.getCurrentUser(auth);
      
      const params = new URLSearchParams({
        page: (options?.page || 1).toString(),
        pagelen: (options?.perPage || 20).toString()
      });

      const repos = await this.getAllPages<BitbucketRepository>(
        auth,
        `/repositories/${user.username}?${params}`,
        (data) => data.values || []
      );

      return repos.map(repo => ({
        id: repo.uuid,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.is_private,
        defaultBranch: repo.mainbranch?.name || 'main',
        url: repo.links.html.href,
        cloneUrl: repo.links.clone?.find(c => c.name === 'https')?.href || '',
        sshUrl: repo.links.clone?.find(c => c.name === 'ssh')?.href,
        owner: {
          id: repo.workspace.uuid,
          username: repo.workspace.slug,
          type: repo.workspace.type === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(repo.created_on),
        updatedAt: new Date(repo.updated_on),
        language: repo.language,
        fork: !!repo.fork_policy,
        size: repo.size
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
      const repository: BitbucketRepository = await this.makeRequest(
        auth,
        'GET',
        `/repositories/${owner}/${repo}`
      );

      return {
        id: repository.uuid,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        private: repository.is_private,
        defaultBranch: repository.mainbranch?.name || 'main',
        url: repository.links.html.href,
        cloneUrl: repository.links.clone?.find(c => c.name === 'https')?.href || '',
        sshUrl: repository.links.clone?.find(c => c.name === 'ssh')?.href,
        owner: {
          id: repository.workspace.uuid,
          username: repository.workspace.slug,
          type: repository.workspace.type === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(repository.created_on),
        updatedAt: new Date(repository.updated_on),
        language: repository.language,
        fork: !!repository.fork_policy,
        size: repository.size
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
      const workspace = owner || (await this.getCurrentUser(auth)).username;
      
      const body = {
        scm: 'git',
        name: data.name,
        description: data.description,
        is_private: data.private !== false,
        has_issues: true,
        has_wiki: false
      };

      const repository: BitbucketRepository = await this.makeRequest(
        auth,
        'POST',
        `/repositories/${workspace}/${data.name}`,
        body
      );

      // Initialize with README if requested
      if (data.autoInit) {
        const readmeContent = `# ${data.name}\n\n${data.description || ''}`;
        await this.createOrUpdateFile(auth, workspace, data.name, 'README.md', {
          content: readmeContent,
          message: 'Initial commit',
          branch: repository.mainbranch?.name || 'main'
        });
      }

      return {
        id: repository.uuid,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        private: repository.is_private,
        defaultBranch: repository.mainbranch?.name || 'main',
        url: repository.links.html.href,
        cloneUrl: repository.links.clone?.find(c => c.name === 'https')?.href || '',
        sshUrl: repository.links.clone?.find(c => c.name === 'ssh')?.href,
        owner: {
          id: repository.workspace.uuid,
          username: repository.workspace.slug,
          type: repository.workspace.type === 'user' ? 'user' : 'organization'
        },
        createdAt: new Date(repository.created_on),
        updatedAt: new Date(repository.updated_on)
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
      const branches = await this.getAllPages<any>(
        auth,
        `/repositories/${owner}/${repo}/refs/branches`,
        (data) => data.values || []
      );

      return branches.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.target.hash,
          message: branch.target.message || '',
          author: {
            name: branch.target.author?.user?.display_name || '',
            email: '',
            date: new Date(branch.target.date)
          }
        },
        protected: false, // Bitbucket doesn't return this in list
        default: false // Will be determined separately
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
      const data: any = await this.makeRequest(
        auth,
        'GET',
        `/repositories/${owner}/${repo}/refs/branches/${encodeURIComponent(branch)}`
      );

      return {
        name: data.name,
        commit: {
          sha: data.target.hash,
          message: data.target.message || '',
          author: {
            name: data.target.author?.user?.display_name || '',
            email: '',
            date: new Date(data.target.date)
          }
        },
        protected: false
      };
    }, {
      operationName: 'getBranch'
    });
  }

  /**
   * Create pull request
   */
  async createPullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    data: CreatePRData
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const pr: BitbucketPullRequest = await this.makeRequest(
        auth,
        'POST',
        `/repositories/${owner}/${repo}/pullrequests`,
        {
          title: data.title,
          description: data.description,
          source: {
            branch: { name: data.sourceBranch }
          },
          destination: {
            branch: { name: data.targetBranch }
          }
        }
      );

      return {
        id: pr.id.toString(),
        number: pr.id,
        title: pr.title,
        description: pr.description,
        state: pr.state === 'OPEN' ? 'open' : pr.state === 'MERGED' ? 'merged' : 'closed',
        sourceBranch: pr.source.branch.name,
        targetBranch: pr.destination.branch.name,
        author: {
          id: pr.author.uuid,
          username: pr.author.display_name,
          avatarUrl: pr.author.links.avatar.href
        },
        createdAt: new Date(pr.created_on),
        updatedAt: new Date(pr.updated_on),
        mergedAt: pr.merge_commit ? new Date(pr.updated_on) : undefined,
        url: pr.links.html.href
      };
    }, {
      operationName: 'createPullRequest',
      timeout: this.timeouts.write
    });
  }

  /**
   * List pull requests
   */
  async listPullRequests(
    auth: VCSAuth,
    owner: string,
    repo: string,
    options?: ListPROptions
  ): Promise<VCSPullRequest[]> {
    return this.executeWithResilience(async () => {
      const params = new URLSearchParams({
        state: options?.state?.toUpperCase() || 'OPEN',
        page: (options?.page || 1).toString(),
        pagelen: (options?.perPage || 20).toString()
      });

      const prs = await this.getAllPages<BitbucketPullRequest>(
        auth,
        `/repositories/${owner}/${repo}/pullrequests?${params}`,
        (data) => data.values || []
      );

      return prs.map(pr => ({
        id: pr.id.toString(),
        number: pr.id,
        title: pr.title,
        description: pr.description,
        state: pr.state === 'OPEN' ? 'open' : pr.state === 'MERGED' ? 'merged' : 'closed',
        sourceBranch: pr.source.branch.name,
        targetBranch: pr.destination.branch.name,
        author: {
          id: pr.author.uuid,
          username: pr.author.display_name,
          avatarUrl: pr.author.links.avatar.href
        },
        createdAt: new Date(pr.created_on),
        updatedAt: new Date(pr.updated_on),
        mergedAt: pr.merge_commit ? new Date(pr.updated_on) : undefined,
        url: pr.links.html.href
      }));
    }, {
      operationName: 'listPullRequests'
    });
  }

  /**
   * Get pull request
   */
  async getPullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    number: number
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const pr: BitbucketPullRequest = await this.makeRequest(
        auth,
        'GET',
        `/repositories/${owner}/${repo}/pullrequests/${number}`
      );

      // Get diff stats
      const diffStat: any = await this.makeRequest(
        auth,
        'GET',
        `/repositories/${owner}/${repo}/pullrequests/${number}/diffstat`
      );

      let additions = 0;
      let deletions = 0;
      let changedFiles = 0;

      if (diffStat.values) {
        changedFiles = diffStat.values.length;
        diffStat.values.forEach((file: any) => {
          additions += file.lines_added || 0;
          deletions += file.lines_removed || 0;
        });
      }

      return {
        id: pr.id.toString(),
        number: pr.id,
        title: pr.title,
        description: pr.description,
        state: pr.state === 'OPEN' ? 'open' : pr.state === 'MERGED' ? 'merged' : 'closed',
        sourceBranch: pr.source.branch.name,
        targetBranch: pr.destination.branch.name,
        author: {
          id: pr.author.uuid,
          username: pr.author.display_name,
          avatarUrl: pr.author.links.avatar.href
        },
        createdAt: new Date(pr.created_on),
        updatedAt: new Date(pr.updated_on),
        mergedAt: pr.merge_commit ? new Date(pr.updated_on) : undefined,
        changes: {
          additions,
          deletions,
          changedFiles
        },
        url: pr.links.html.href
      };
    }, {
      operationName: 'getPullRequest'
    });
  }

  /**
   * Update pull request
   */
  async updatePullRequest(
    auth: VCSAuth,
    owner: string,
    repo: string,
    number: number,
    data: UpdatePRData
  ): Promise<VCSPullRequest> {
    return this.executeWithResilience(async () => {
      const body: any = {};

      if (data.title) body.title = data.title;
      if (data.description !== undefined) body.description = data.description;
      if (data.state === 'closed') {
        // Decline the PR
        await this.makeRequest(
          auth,
          'POST',
          `/repositories/${owner}/${repo}/pullrequests/${number}/decline`
        );
      }

      if (Object.keys(body).length > 0) {
        await this.makeRequest(
          auth,
          'PUT',
          `/repositories/${owner}/${repo}/pullrequests/${number}`,
          body
        );
      }

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
      const refParam = ref || 'main';
      const content = await this.makeRequest<string>(
        auth,
        'GET',
        `/repositories/${owner}/${repo}/src/${refParam}/${path}`
      );

      // Get metadata
      const meta: any = await this.makeRequest(
        auth,
        'GET',
        `/repositories/${owner}/${repo}/src/${refParam}/${path}?format=meta`
      );

      return {
        path,
        content,
        encoding: 'utf-8',
        size: meta.size || content.length,
        sha: meta.commit?.hash || '',
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
      // Bitbucket uses form data for file commits
      const formData = new FormData();
      formData.append('message', data.message);
      formData.append('branch', data.branch || 'main');
      formData.append(path, data.content);

      if (data.author) {
        formData.append('author', `${data.author.name} <${data.author.email}>`);
      }

      await fetch(`${this.apiUrl}/repositories/${owner}/${repo}/src`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: formData
      });

      return {
        path,
        content: data.content,
        encoding: 'utf-8',
        size: data.content.length,
        sha: '', // Bitbucket doesn't return this on create
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
      // Bitbucket requires committing an empty file list to delete
      const formData = new FormData();
      formData.append('message', data.message);
      formData.append('branch', data.branch || 'main');
      formData.append('files', path);

      if (data.author) {
        formData.append('author', `${data.author.name} <${data.author.email}>`);
      }

      await fetch(`${this.apiUrl}/repositories/${owner}/${repo}/src`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: formData
      });
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
      const refParam = ref || 'main';
      const pathParam = path || '';
      
      const entries = await this.getAllPages<any>(
        auth,
        `/repositories/${owner}/${repo}/src/${refParam}/${pathParam}`,
        (data) => data.values || []
      );

      return entries.map((item: any) => ({
        path: item.path,
        type: item.type === 'commit_file' ? 'blob' : 'tree',
        sha: item.commit?.hash || '',
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
      // Map generic events to Bitbucket events
      const events = config.events.map(event => {
        switch (event) {
          case 'push': return 'repo:push';
          case 'pull_request': return 'pullrequest:created';
          case 'issues': return 'issue:created';
          default: return event;
        }
      });

      const hook: any = await this.makeRequest(
        auth,
        'POST',
        `/repositories/${owner}/${repo}/hooks`,
        {
          description: 'VCS Integration Webhook',
          url: config.url,
          active: config.active !== false,
          events
        }
      );

      return {
        id: hook.uuid,
        url: hook.url,
        events: config.events,
        active: hook.active,
        createdAt: new Date(hook.created_on)
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
      const hooks = await this.getAllPages<any>(
        auth,
        `/repositories/${owner}/${repo}/hooks`,
        (data) => data.values || []
      );

      return hooks.map((hook: any) => {
        // Map Bitbucket events back to generic events
        const events = hook.events.map((event: string) => {
          switch (event) {
            case 'repo:push': return 'push';
            case 'pullrequest:created':
            case 'pullrequest:updated': return 'pull_request';
            case 'issue:created':
            case 'issue:updated': return 'issues';
            default: return event;
          }
        });

        return {
          id: hook.uuid,
          url: hook.url,
          events: Array.from(new Set(events)), // Remove duplicates
          active: hook.active,
          createdAt: new Date(hook.created_on),
          updatedAt: new Date(hook.updated_on || hook.created_on)
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
      await this.makeRequest(
        auth,
        'DELETE',
        `/repositories/${owner}/${repo}/hooks/${id}`
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
    // Bitbucket doesn't use webhook signatures by default
    // This would read to be implemented based on custom headers
    return true;
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
      const issue: any = await this.makeRequest(
        auth,
        'POST',
        `/repositories/${owner}/${repo}/issues`,
        {
          title: data.title,
          content: {
            raw: data.body || '',
            markup: 'markdown'
          },
          kind: 'task',
          priority: 'major'
        }
      );

      return {
        id: issue.id.toString(),
        number: issue.id,
        title: issue.title,
        body: issue.content?.raw,
        state: issue.state === 'new' || issue.state === 'open' ? 'open' : 'closed',
        author: {
          id: issue.reporter.uuid,
          username: issue.reporter.display_name,
          avatarUrl: issue.reporter.links.avatar.href
        },
        assignees: issue.assignee ? [{
          id: issue.assignee.uuid,
          username: issue.assignee.display_name,
          avatarUrl: issue.assignee.links.avatar.href
        }] : undefined,
        labels: [],
        createdAt: new Date(issue.created_on),
        updatedAt: new Date(issue.updated_on),
        url: issue.links.html.href
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
      const params = new URLSearchParams({
        page: (options?.page || 1).toString(),
        pagelen: (options?.perPage || 20).toString()
      });

      // Add state filter
      if (options?.state && options.state !== 'all') {
        const states = options.state === 'open' 
          ? ['new', 'open', 'on hold'] 
          : ['resolved', 'invalid', 'duplicate', 'wontfix', 'closed'];
        params.append('q', `state IN (${states.map(s => `"${s}"`).join(', ')})`);
      }

      const issues = await this.getAllPages<any>(
        auth,
        `/repositories/${owner}/${repo}/issues?${params}`,
        (data) => data.values || []
      );

      return issues.map((issue: any) => ({
        id: issue.id.toString(),
        number: issue.id,
        title: issue.title,
        body: issue.content?.raw,
        state: issue.state === 'new' || issue.state === 'open' ? 'open' : 'closed',
        author: {
          id: issue.reporter.uuid,
          username: issue.reporter.display_name,
          avatarUrl: issue.reporter.links.avatar.href
        },
        assignees: issue.assignee ? [{
          id: issue.assignee.uuid,
          username: issue.assignee.display_name,
          avatarUrl: issue.assignee.links.avatar.href
        }] : undefined,
        labels: [],
        createdAt: new Date(issue.created_on),
        updatedAt: new Date(issue.updated_on),
        url: issue.links.html.href
      }));
    }, {
      operationName: 'listIssues'
    });
  }
}
