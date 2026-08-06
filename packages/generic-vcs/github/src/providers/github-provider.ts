/**
 * GitHubProvider — generic-vcs base over vcs-generics primitives.
 *
 * Hierarchy: AbstractVCSProvider / VCSProvider → GitHubProvider
 *
 * @doc-code
 * type: provider
 * category: vcs
 * pattern: provider-implementation
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import {
  VCSProvider,
  type AbstractVCSProvider,
  type VCSAuth,
  type VCSUser,
  type VCSRepository,
  type VCSBranch,
  type VCSPullRequest,
  type VCSFile,
  type VCSCommit,
  type VCSIssue,
  type VCSComment,
  type VCSWebhook,
  type VCSTreeItem,
  type VCSConfig,
  VCSError,
  type ListReposOptions,
  type ListPROptions,
  type ListIssuesOptions,
  type CreateRepoData,
  type CreatePRData,
  type UpdatePRData,
  type FileUpdateData,
  type FileDeleteData,
  type CreateWebhookData,
  type CreateIssueData,
} from '@bitcode/vcs-generics';
import { log } from '@bitcode/logger';

type GitHubPullRequestData = {
  id: number;
  number: number;
  title: string;
  body?: string | null;
  state: string;
  head: { ref: string };
  base: { ref: string };
  user?: {
    id: number;
    login: string;
    avatar_url?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  merged_at?: string | null;
  html_url: string;
};

/**
 * GitHub VCS Provider — conforms to AbstractVCSProvider via VCSProvider base.
 */
export default class GitHubProvider extends VCSProvider implements AbstractVCSProvider {
  readonly type = 'github' as const;
  private octokitCache = new Map<string, Octokit>();

  private mapPullRequest(pr: GitHubPullRequestData): VCSPullRequest {
    return {
      id: pr.id.toString(),
      number: pr.number,
      title: pr.title,
      description: pr.body || undefined,
      state: pr.state === 'open' ? 'open' : pr.merged_at ? 'merged' : 'closed',
      sourceBranch: pr.head.ref,
      targetBranch: pr.base.ref,
      author: {
        id: pr.user?.id.toString() || '',
        username: pr.user?.login || '',
        avatarUrl: pr.user?.avatar_url || undefined,
      },
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
      url: pr.html_url,
    };
  }

  private isExistingPullRequestError(error: unknown): boolean {
    const err = error as { status?: number; response?: { status?: number }; message?: string };
    const status = err.status || err.response?.status;
    const message = err.message?.toLowerCase() || '';

    return status === 422 && message.includes('pull request') && message.includes('already exists');
  }

  /**
   * Get Octokit instance for auth
   */
  private getOctokit(auth: VCSAuth): Octokit {
    const cacheKey = auth.accessToken;
    
    if (this.octokitCache.has(cacheKey)) {
      return this.octokitCache.get(cacheKey)!;
    }

    const octokit = new Octokit({
      auth: auth.accessToken,
      baseUrl: this.instanceUrl || 'https://api.github.com'
    });

    this.octokitCache.set(cacheKey, octokit);
    return octokit;
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const scope = scopes?.join(' ') || 'repo user';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      state
    });

    const baseUrl = this.instanceUrl || 'https://github.com';
    return `${baseUrl}/login/oauth/authorize?${params}`;
  }

  /**
   * Exchange code for token
   */
  async exchangeCodeForToken(code: string): Promise<VCSAuth> {
    return this.executeWithResilience(async () => {
      const body: Record<string, string> = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      };
      if (this.redirectUri) {
        body.redirect_uri = this.redirectUri;
      }

      const response = await fetch(`${this.instanceUrl || 'https://github.com'}/login/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        throw new VCSError(data.error_description || data.error, 'AUTH_ERROR');
      }

      return {
        accessToken: data.access_token,
        tokenType: data.token_type,
        scope: data.scope
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
        const octokit = this.getOctokit(auth);
        if (auth.accessToken.startsWith('ghs_')) {
          await octokit.request('GET /installation/repositories', { per_page: 1 });
          return true;
        }

        // Classic (ghp_) and fine-grained (github_pat_) personal tokens.
        // Fine-grained tokens often lack "Read user" profile scope — fall
        // back to a repository list probe so PAT connect still works.
        try {
          await octokit.users.getAuthenticated();
          return true;
        } catch {
          await octokit.repos.listForAuthenticatedUser({ per_page: 1 });
          return true;
        }
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
      const octokit = this.getOctokit(auth);
      try {
        const { data } = await octokit.users.getAuthenticated();

        return {
          id: data.id.toString(),
          username: data.login,
          displayName: data.name || undefined,
          email: data.email || undefined,
          avatarUrl: data.avatar_url,
          url: data.html_url
        };
      } catch {
        // Fine-grained PAT without profile scope: derive identity from a repo.
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
          per_page: 1,
          affiliation: 'owner,collaborator,organization_member',
        });
        const owner = repos[0]?.owner;
        if (!owner?.login) {
          throw new VCSError(
            'GitHub token is valid for repositories but cannot resolve a user profile. Grant Account → Read access to profile, or use a classic PAT with the `read:user` scope.',
            'AUTH_ERROR',
          );
        }
        return {
          id: String(owner.id),
          username: owner.login,
          displayName: owner.login,
          avatarUrl: owner.avatar_url,
          url: owner.html_url,
        };
      }
    }, {
      operationName: 'getCurrentUser'
    });
  }

  /**
   * Get user by username
   */
  async getUser(auth: VCSAuth, username: string): Promise<VCSUser> {
    return this.executeWithResilience(async () => {
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.users.getByUsername({ username });

      return {
        id: data.id.toString(),
        username: data.login,
        displayName: data.name || undefined,
        email: data.email || undefined,
        avatarUrl: data.avatar_url,
        url: data.html_url
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
      log('GitHubProvider.listRepositories starting', 'debug', {
        hasAuth: !!auth,
        hasAccessToken: !!auth?.accessToken,
        tokenLength: auth?.accessToken?.length,
        tokenPrefix: auth?.accessToken?.substring(0, 10)
      });
      
      const octokit = this.getOctokit(auth);
      
      // Check if this is an installation token (starts with 'ghs_') or user token (starts with 'ghu_')
      const isInstallationToken = auth.accessToken.startsWith('ghs_');
      
      log('GitHubProvider.listRepositories token type detected', 'debug', { 
        isInstallationToken,
        tokenPrefix: auth.accessToken.substring(0, 4)
      });

      let data;
      try {
        if (isInstallationToken) {
          // For installation tokens, we read to use the installation endpoints
          // First, get the installation repositories
          log('GitHubProvider.listRepositories using installation endpoint', 'debug');
          
          const response = await octokit.request('GET /installation/repositories', {
            per_page: options?.perPage || 100,
            page: options?.page || 1
          });
          
          data = response.data.repositories;
          log('GitHubProvider.listRepositories installation repos fetched', 'info', { 
            repoCount: data.length,
            totalCount: response.data.total_count,
            repositorySelection: response.data.repository_selection || 'unknown',
            firstFewRepos: data.slice(0, 3).map(r => ({
              id: r.id,
              name: r.name,
              full_name: r.full_name,
              private: r.private
            }))
          });
        } else {
          // For user tokens, use the authenticated user endpoint
          log('GitHubProvider.listRepositories using user endpoint', 'debug');
          
          const params = {
            ...this.buildPaginationParams(options),
            visibility: options?.visibility as 'all' | 'public' | 'private' | undefined,
            affiliation: options?.affiliation,
            type: options?.type as 'all' | 'owner' | 'member' | undefined,
            sort: options?.sort as 'created' | 'updated' | 'pushed' | 'full_name' | undefined,
            direction: options?.direction as 'asc' | 'desc' | undefined
          };
          
          const response = await octokit.repos.listForAuthenticatedUser(params);
          data = response.data;
          log('GitHubProvider.listRepositories user repos fetched', 'debug', { 
            repoCount: data.length 
          });
        }
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        
        // Provide helpful error messages for common issues
        let helpfulMessage = '';
        if (errorMessage.includes('Resource not accessible by integration')) {
          helpfulMessage = isInstallationToken 
            ? 'Installation token cannot access this endpoint. Ensure the app has the correct permissions and is installed on the repositories.'
            : 'User token cannot access this resource. User may read to authorize the app.';
        } else if (errorMessage.includes('Bad credentials')) {
          helpfulMessage = 'Token is invalid or expired. May read to regenerate the installation token.';
        } else if (errorMessage.includes('Not Found')) {
          helpfulMessage = 'Installation may have been removed or suspended.';
        }
        
        log('GitHubProvider.listRepositories API call failed', 'error', { 
          error: apiError,
          errorMessage,
          errorStack: apiError instanceof Error ? apiError.stack : undefined,
          isInstallationToken,
          tokenPrefix: auth.accessToken.substring(0, 10),
          helpfulMessage,
          httpStatus: (apiError as any)?.status || (apiError as any)?.response?.status
        });
        throw apiError;
      }

      return data.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || undefined,
        private: repo.private,
        defaultBranch: repo.default_branch,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url || undefined,
        owner: {
          id: repo.owner.id.toString(),
          username: repo.owner.login,
          type: repo.owner.type.toLowerCase() as 'user' | 'organization'
        },
        createdAt: repo.created_at ? new Date(repo.created_at) : undefined,
        updatedAt: repo.updated_at ? new Date(repo.updated_at) : undefined,
        language: repo.language || undefined,
        topics: repo.topics || undefined,
        archived: repo.archived || undefined,
        fork: repo.fork,
        forksCount: repo.forks_count,
        starsCount: repo.stargazers_count,
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.get({ owner, repo });

      return {
        id: data.id.toString(),
        name: data.name,
        fullName: data.full_name,
        description: data.description || undefined,
        private: data.private,
        defaultBranch: data.default_branch,
        url: data.html_url,
        cloneUrl: data.clone_url,
        sshUrl: data.ssh_url || undefined,
        owner: {
          id: data.owner.id.toString(),
          username: data.owner.login,
          type: data.owner.type.toLowerCase() as 'user' | 'organization'
        },
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        language: data.language || undefined,
        topics: data.topics || undefined,
        archived: data.archived || undefined,
        fork: data.fork,
        forksCount: data.forks_count,
        starsCount: data.stargazers_count,
        size: data.size
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
      const octokit = this.getOctokit(auth);
      
      const params = {
        name: data.name,
        description: data.description,
        private: data.private,
        auto_init: data.autoInit,
        gitignore_template: data.gitignoreTemplate,
        license_template: data.licenseTemplate
      };

      const response = owner
        ? await octokit.repos.createInOrg({ org: owner, ...params })
        : await octokit.repos.createForAuthenticatedUser(params);

      const repo = response.data;

      return {
        id: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || undefined,
        private: repo.private,
        defaultBranch: repo.default_branch,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url || undefined,
        owner: {
          id: repo.owner.id.toString(),
          username: repo.owner.login,
          type: repo.owner.type.toLowerCase() as 'user' | 'organization'
        },
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at)
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100
      });

      return data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          message: '', // Will be filled if needed
          author: {
            name: '',
            email: '',
            date: new Date()
          }
        },
        protected: branch.protected,
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.getBranch({ owner, repo, branch });

      return {
        name: data.name,
        commit: {
          sha: data.commit.sha,
          message: data.commit.commit.message,
          author: {
            name: data.commit.commit.author?.name || '',
            email: data.commit.commit.author?.email || '',
            date: new Date(data.commit.commit.author?.date || Date.now())
          }
        },
        protected: data.protected
      };
    }, {
      operationName: 'getBranch'
    });
  }

  /**
   * Create branch
   */
  async createBranch(
    auth: VCSAuth,
    owner: string,
    repo: string,
    branch: string,
    from: string
  ): Promise<VCSBranch> {
    return this.executeWithResilience(async () => {
      const octokit = this.getOctokit(auth);
      const ref = branch.startsWith('refs/heads/') ? branch : `refs/heads/${branch}`;
      const branchName = ref.replace(/^refs\/heads\//, '');

      try {
        await octokit.git.createRef({
          owner,
          repo,
          ref,
          sha: from,
        });
      } catch (error) {
        const status = (error as { status?: number })?.status;
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (status !== 422 && !message.includes('reference already exists')) {
          throw error;
        }
      }

      return this.getBranch(auth, owner, repo, branchName);
    }, {
      operationName: 'createBranch',
      timeout: this.timeouts.write
    });
  }

  /**
   * List commits
   */
  async listCommits(
    auth: VCSAuth, 
    owner: string, 
    repo: string, 
    options?: { branch?: string; since?: Date; until?: Date; perPage?: number }
  ): Promise<VCSCommit[]> {
    return this.executeWithResilience(async () => {
      const octokit = this.getOctokit(auth);
      
      const params: any = {
        owner,
        repo,
        sha: options?.branch,
        since: options?.since?.toISOString(),
        until: options?.until?.toISOString(),
        per_page: options?.perPage || 100
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      const { data } = await octokit.repos.listCommits(params);
      
      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author?.name || commit.author?.login || 'Unknown',
          email: commit.commit.author?.email || '',
          date: new Date(commit.commit.author?.date || Date.now())
        },
        url: commit.html_url,
        parents: commit.parents.map(p => p.sha)
      }));
    }, {
      operationName: 'listCommits'
    });
  }

  /**
   * Get single commit
   */
  async getCommit(auth: VCSAuth, owner: string, repo: string, sha: string): Promise<VCSCommit> {
    return this.executeWithResilience(async () => {
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });
      
      return {
        sha: data.sha,
        message: data.commit.message,
        author: {
          name: data.commit.author?.name || data.author?.login || 'Unknown',
          email: data.commit.author?.email || '',
          date: new Date(data.commit.author?.date || Date.now())
        },
        url: data.html_url,
        parents: data.parents.map(p => p.sha),
        stats: {
          additions: data.stats?.additions || 0,
          deletions: data.stats?.deletions || 0,
          total: data.stats?.total || 0
        },
        files: data.files?.map(f => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch
        }))
      };
    }, {
      operationName: 'getCommit'
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
      const octokit = this.getOctokit(auth);
      let pr: GitHubPullRequestData | undefined;

      try {
        const response = await octokit.pulls.create({
          owner,
          repo,
          title: data.title,
          body: data.description,
          head: data.sourceBranch,
          base: data.targetBranch,
          draft: data.draft,
        });
        pr = response.data;
      } catch (error) {
        if (!this.isExistingPullRequestError(error)) {
          throw error;
        }

        const sourceBranch = data.sourceBranch.includes(':')
          ? data.sourceBranch.split(':').pop()!
          : data.sourceBranch;
        const head = data.sourceBranch.includes(':') ? data.sourceBranch : `${owner}:${sourceBranch}`;
        const { data: existingPullRequests } = await octokit.pulls.list({
          owner,
          repo,
          state: 'open',
          head,
          base: data.targetBranch,
          per_page: 10,
        });
        pr = existingPullRequests.find(existing =>
          existing.head.ref === sourceBranch &&
          existing.base.ref === data.targetBranch
        );

        if (!pr) {
          throw error;
        }
      }

      if (!pr) {
        throw new VCSError('GitHub pull request creation did not return a pull request', 'OPERATION_FAILED');
      }

      return this.mapPullRequest(pr);
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: options?.state as 'open' | 'closed' | 'all' || 'open',
        head: options?.head,
        base: options?.base,
        sort: options?.sort as 'created' | 'updated' | 'popularity' | 'long-running',
        direction: options?.direction as 'asc' | 'desc',
        ...this.buildPaginationParams(options)
      });

      return data.map(pr => this.mapPullRequest(pr));
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
      const octokit = this.getOctokit(auth);
      const { data: pr } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: number
      });

      return {
        id: pr.id.toString(),
        number: pr.number,
        title: pr.title,
        description: pr.body || undefined,
        state: pr.state === 'open' ? 'open' : pr.merged_at ? 'merged' : 'closed',
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        author: {
          id: pr.user?.id.toString() || '',
          username: pr.user?.login || '',
          avatarUrl: pr.user?.avatar_url
        },
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at),
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
        changes: {
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files
        },
        url: pr.html_url
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
      const octokit = this.getOctokit(auth);
      const { data: pr } = await octokit.pulls.update({
        owner,
        repo,
        pull_number: number,
        title: data.title,
        body: data.description,
        state: data.state as 'open' | 'closed' | undefined,
        base: data.targetBranch
      });

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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data) || data.type !== 'file') {
        throw new VCSError('Path is not a file', 'NOT_FILE');
      }

      return {
        path: data.path,
        content: data.content || '',
        encoding: data.encoding as 'base64' | 'utf-8',
        size: data.size,
        sha: data.sha,
        url: data.html_url || undefined,
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
      const octokit = this.getOctokit(auth);
      
      // Get current file SHA if updating
      let sha = data.sha;
      if (!sha) {
        try {
          const current = await this.getFileContent(auth, owner, repo, path, data.branch);
          sha = current.sha;
        } catch {
          // File doesn't exist, will create
        }
      }

      const { data: result } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: data.message,
        content: Buffer.from(data.content).toString('base64'),
        sha,
        branch: data.branch,
        author: data.author
      });

      return {
        path: result.content!.path!,
        content: data.content,
        encoding: 'utf-8',
        size: result.content!.size!,
        sha: result.content!.sha!,
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
      const octokit = this.getOctokit(auth);
      
      await octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message: data.message,
        sha: data.sha,
        branch: data.branch,
        author: data.author
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: path || '',
        ref
      });

      if (!Array.isArray(data)) {
        return [{
          path: data.path,
          type: data.type === 'file' ? 'blob' : 'tree',
          sha: data.sha,
          size: data.size
        }];
      }

      return data.map(item => ({
        path: item.path,
        type: item.type === 'file' ? 'blob' : 'tree',
        sha: item.sha,
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.createWebhook({
        owner,
        repo,
        config: {
          url: config.url,
          content_type: config.contentType || 'json',
          secret: config.secret
        },
        events: config.events as any[],
        active: config.active
      });

      return {
        id: data.id.toString(),
        url: data.config.url!,
        events: data.events,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.repos.listWebhooks({
        owner,
        repo,
        per_page: 100
      });

      return data.map(hook => ({
        id: hook.id.toString(),
        url: hook.config.url || '',
        events: hook.events,
        active: hook.active,
        createdAt: new Date(hook.created_at),
        updatedAt: new Date(hook.updated_at)
      }));
    }, {
      operationName: 'listWebhooks'
    });
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(auth: VCSAuth, owner: string, repo: string, id: string): Promise<void> {
    return this.executeWithResilience(async () => {
      const octokit = this.getOctokit(auth);
      await octokit.repos.deleteWebhook({
        owner,
        repo,
        hook_id: parseInt(id)
      });
    }, {
      operationName: 'deleteWebhook',
      timeout: this.timeouts.write
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
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
      const octokit = this.getOctokit(auth);
      const { data: issue } = await octokit.issues.create({
        owner,
        repo,
        title: data.title,
        body: data.body,
        labels: data.labels,
        assignees: data.assignees,
        milestone: data.milestone
      });

      return {
        id: issue.id.toString(),
        number: issue.number,
        title: issue.title,
        body: issue.body || undefined,
        state: issue.state as 'open' | 'closed',
        author: {
          id: issue.user?.id.toString() || '',
          username: issue.user?.login || '',
          avatarUrl: issue.user?.avatar_url
        },
        assignees: issue.assignees?.map(a => ({
          id: a.id.toString(),
          username: a.login,
          avatarUrl: a.avatar_url
        })),
        labels: issue.labels.map(l => typeof l === 'string' ? l : l.name || ''),
        createdAt: new Date(issue.created_at),
        updatedAt: new Date(issue.updated_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
        url: issue.html_url
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
      const octokit = this.getOctokit(auth);
      const { data } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: options?.state as 'open' | 'closed' | 'all',
        labels: options?.labels?.join(','),
        assignee: options?.assignee,
        creator: options?.creator,
        ...this.buildPaginationParams(options)
      });

      // Filter out pull requests
      return data
        .filter(issue => !issue.pull_request)
        .map(issue => ({
          id: issue.id.toString(),
          number: issue.number,
          title: issue.title,
          body: issue.body || undefined,
          state: issue.state as 'open' | 'closed',
          author: {
            id: issue.user?.id.toString() || '',
            username: issue.user?.login || '',
            avatarUrl: issue.user?.avatar_url
          },
          assignees: issue.assignees?.map(a => ({
            id: a.id.toString(),
            username: a.login,
            avatarUrl: a.avatar_url
          })),
          labels: issue.labels.map(l => typeof l === 'string' ? l : l.name || ''),
          createdAt: new Date(issue.created_at),
          updatedAt: new Date(issue.updated_at),
          closedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
          url: issue.html_url
        }));
    }, {
      operationName: 'listIssues'
    });
  }
}
