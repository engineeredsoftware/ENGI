import { log } from '@bitcode/logger';
import type {
  GitLabAuthConfig,
  GitLabProject,
  GitLabBranch,
  GitLabMergeRequest,
  GitLabIssue,
  GitLabCommit,
  GitLabFile,
  GitLabTreeItem,
  GitLabUser,
  GitLabApiError
} from './types';

export class GitLabClient {
  private config: GitLabAuthConfig;
  private baseUrl: string;

  constructor(config: GitLabAuthConfig) {
    this.config = config;
    this.baseUrl = config.instanceUrl || 'https://gitlab.com';
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v4${endpoint}`;
    const headers = this.getAuthHeaders();

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting
      if (response.status === 429 && retryCount < 3) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(method, endpoint, data, retryCount + 1);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        const error: GitLabApiError = new Error(`GitLab API error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        try {
          error.response = JSON.parse(errorText);
        } catch {
          error.response = errorText;
        }
        
        // Retry on server errors
        if (response.status >= 500 && retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(method, endpoint, data, retryCount + 1);
        }
        
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error) {
      if (error instanceof TypeError && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(method, endpoint, data, retryCount + 1);
      }
      
      if (error instanceof Error && !(error as GitLabApiError).status) {
        const apiError: GitLabApiError = new Error(`Network error: ${error.message}`);
        apiError.response = error;
        throw apiError;
      }
      throw error;
    }
  }

  private async getAllPages<T>(endpoint: string, extractItems: (data: any) => T[]): Promise<T[]> {
    let allItems: T[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await this.makeRequest<any>('GET', `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}&per_page=${perPage}`);
      
      if (Array.isArray(response)) {
        const items = extractItems(response);
        allItems = allItems.concat(items);
        
        if (items.length < perPage) {
          break;
        }
      } else {
        const items = extractItems(response);
        allItems = allItems.concat(items);
        break;
      }
      
      page++;
    }

    return allItems;
  }

  // User operations
  async getCurrentUser(): Promise<GitLabUser> {
    return this.makeRequest<GitLabUser>('GET', '/user');
  }

  async getUser(userId: number): Promise<GitLabUser> {
    return this.makeRequest<GitLabUser>('GET', `/users/${userId}`);
  }

  // Project operations
  async listProjects(options: {
    visibility?: 'private' | 'internal' | 'public';
    owned?: boolean;
    membership?: boolean;
    starred?: boolean;
    simple?: boolean;
    search?: string;
    order_by?: 'id' | 'name' | 'path' | 'created_at' | 'updated_at' | 'last_activity_at';
    sort?: 'asc' | 'desc';
  } = {}): Promise<GitLabProject[]> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, value.toString());
      }
    });
    
    const endpoint = `/projects${params.toString() ? `?${params.toString()}` : ''}`;
    return this.getAllPages(endpoint, (data) => data);
  }

  async getProject(projectId: number | string): Promise<GitLabProject> {
    return this.makeRequest<GitLabProject>('GET', `/projects/${encodeURIComponent(projectId)}`);
  }

  async createProject(data: {
    name: string;
    path?: string;
    namespace_id?: number;
    description?: string;
    visibility?: 'private' | 'internal' | 'public';
    default_branch?: string;
    issues_enabled?: boolean;
    merge_requests_enabled?: boolean;
    wiki_enabled?: boolean;
    jobs_enabled?: boolean;
    snippets_enabled?: boolean;
    container_registry_enabled?: boolean;
    shared_runners_enabled?: boolean;
    public_jobs?: boolean;
    only_allow_merge_if_pipeline_succeeds?: boolean;
    only_allow_merge_if_all_discussions_are_resolved?: boolean;
    merge_method?: 'merge' | 'rebase_merge' | 'ff';
    remove_source_branch_after_merge?: boolean;
    lfs_enabled?: boolean;
    request_access_enabled?: boolean;
    tag_list?: string[];
    printing_merge_request_link_enabled?: boolean;
    build_git_strategy?: 'fetch' | 'clone';
    build_timeout?: number;
    auto_cancel_pending_pipelines?: 'disabled' | 'enabled';
    build_coverage_regex?: string;
    ci_config_path?: string;
    auto_devops_enabled?: boolean;
    auto_devops_deploy_strategy?: 'continuous' | 'manual' | 'timed_incremental';
    autoclose_referenced_issues?: boolean;
  }): Promise<GitLabProject> {
    return this.makeRequest<GitLabProject>('POST', '/projects', data);
  }

  // Branch operations
  async listBranches(projectId: number | string, search?: string): Promise<GitLabBranch[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.getAllPages(
      `/projects/${encodeURIComponent(projectId)}/repository/branches${params}`,
      (data) => data
    );
  }

  async getBranch(projectId: number | string, branchName: string): Promise<GitLabBranch> {
    return this.makeRequest<GitLabBranch>('GET', `/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branchName)}`);
  }

  async createBranch(projectId: number | string, branchName: string, ref: string): Promise<GitLabBranch> {
    return this.makeRequest<GitLabBranch>('POST', `/projects/${encodeURIComponent(projectId)}/repository/branches`, {
      branch: branchName,
      ref
    });
  }

  async deleteBranch(projectId: number | string, branchName: string): Promise<void> {
    return this.makeRequest<void>('DELETE', `/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branchName)}`);
  }

  // File operations
  async getFile(
    projectId: number | string,
    filePath: string,
    ref = 'main'
  ): Promise<GitLabFile> {
    return this.makeRequest<GitLabFile>('GET', `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}?ref=${ref}`);
  }

  async createFile(
    projectId: number | string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch = 'main',
    encoding = 'text'
  ): Promise<GitLabFile> {
    return this.makeRequest<GitLabFile>('POST', `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}`, {
      branch,
      content,
      commit_message: commitMessage,
      encoding
    });
  }

  async updateFile(
    projectId: number | string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch = 'main',
    encoding = 'text'
  ): Promise<GitLabFile> {
    return this.makeRequest<GitLabFile>('PUT', `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}`, {
      branch,
      content,
      commit_message: commitMessage,
      encoding
    });
  }

  async deleteFile(
    projectId: number | string,
    filePath: string,
    commitMessage: string,
    branch = 'main'
  ): Promise<void> {
    return this.makeRequest<void>('DELETE', `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}`, {
      branch,
      commit_message: commitMessage
    });
  }

  // Tree operations
  async getTree(
    projectId: number | string,
    path = '',
    ref = 'main',
    recursive = false
  ): Promise<GitLabTreeItem[]> {
    const params = new URLSearchParams({
      ref,
      recursive: recursive.toString()
    });
    if (path) {
      params.set('path', path);
    }
    
    return this.makeRequest<GitLabTreeItem[]>('GET', `/projects/${encodeURIComponent(projectId)}/repository/tree?${params.toString()}`);
  }

  // Commit operations
  async listCommits(
    projectId: number | string,
    ref?: string,
    path?: string,
    since?: string,
    until?: string
  ): Promise<GitLabCommit[]> {
    const params = new URLSearchParams();
    if (ref) params.set('ref_name', ref);
    if (path) params.set('path', path);
    if (since) params.set('since', since);
    if (until) params.set('until', until);
    
    const endpoint = `/projects/${encodeURIComponent(projectId)}/repository/commits${params.toString() ? `?${params.toString()}` : ''}`;
    return this.getAllPages(endpoint, (data) => data);
  }

  async getCommit(projectId: number | string, sha: string): Promise<GitLabCommit> {
    return this.makeRequest<GitLabCommit>('GET', `/projects/${encodeURIComponent(projectId)}/repository/commits/${sha}`);
  }

  // Merge Request operations
  async listMergeRequests(
    projectId: number | string,
    state: 'opened' | 'closed' | 'locked' | 'merged' = 'opened',
    options: {
      target_branch?: string;
      source_branch?: string;
      labels?: string;
      author_id?: number;
      assignee_id?: number;
      reviewer_id?: number;
      search?: string;
      order_by?: 'created_at' | 'updated_at';
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<GitLabMergeRequest[]> {
    const params = new URLSearchParams({ state });
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, value.toString());
      }
    });
    
    const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests?${params.toString()}`;
    return this.getAllPages(endpoint, (data) => data);
  }

  async getMergeRequest(projectId: number | string, mergeRequestIid: number): Promise<GitLabMergeRequest> {
    return this.makeRequest<GitLabMergeRequest>('GET', `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}`);
  }

  async createMergeRequest(
    projectId: number | string,
    data: {
      source_branch: string;
      target_branch: string;
      title: string;
      description?: string;
      assignee_id?: number;
      assignee_ids?: number[];
      reviewer_ids?: number[];
      target_project_id?: number;
      labels?: string;
      milestone_id?: number;
      remove_source_branch?: boolean;
      allow_collaboration?: boolean;
      allow_maintainer_to_push?: boolean;
      squash?: boolean;
    }
  ): Promise<GitLabMergeRequest> {
    return this.makeRequest<GitLabMergeRequest>('POST', `/projects/${encodeURIComponent(projectId)}/merge_requests`, data);
  }

  async updateMergeRequest(
    projectId: number | string,
    mergeRequestIid: number,
    data: {
      title?: string;
      description?: string;
      target_branch?: string;
      assignee_id?: number;
      assignee_ids?: number[];
      reviewer_ids?: number[];
      labels?: string;
      milestone_id?: number;
      state_event?: 'close' | 'reopen';
      remove_source_branch?: boolean;
      squash?: boolean;
      discussion_locked?: boolean;
    }
  ): Promise<GitLabMergeRequest> {
    return this.makeRequest<GitLabMergeRequest>('PUT', `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}`, data);
  }

  async mergeMergeRequest(
    projectId: number | string,
    mergeRequestIid: number,
    options: {
      merge_commit_message?: string;
      squash_commit_message?: string;
      should_remove_source_branch?: boolean;
      merge_when_pipeline_succeeds?: boolean;
      sha?: string;
      squash?: boolean;
    } = {}
  ): Promise<GitLabMergeRequest> {
    return this.makeRequest<GitLabMergeRequest>('PUT', `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/merge`, options);
  }

  // Issue operations
  async listIssues(
    projectId: number | string,
    options: {
      state?: 'opened' | 'closed';
      labels?: string;
      milestone?: string;
      assignee_id?: number;
      author_id?: number;
      search?: string;
      order_by?: 'created_at' | 'updated_at';
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<GitLabIssue[]> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, value.toString());
      }
    });
    
    const endpoint = `/projects/${encodeURIComponent(projectId)}/issues${params.toString() ? `?${params.toString()}` : ''}`;
    return this.getAllPages(endpoint, (data) => data);
  }

  async getIssue(projectId: number | string, issueIid: number): Promise<GitLabIssue> {
    return this.makeRequest<GitLabIssue>('GET', `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`);
  }

  async createIssue(
    projectId: number | string,
    data: {
      title: string;
      description?: string;
      assignee_ids?: number[];
      milestone_id?: number;
      labels?: string;
      created_at?: string;
      due_date?: string;
      merge_request_to_resolve_discussions_of?: number;
      discussion_to_resolve?: string;
      weight?: number;
      epic_id?: number;
      epic_iid?: number;
      issue_type?: 'issue' | 'incident' | 'test_case';
    }
  ): Promise<GitLabIssue> {
    return this.makeRequest<GitLabIssue>('POST', `/projects/${encodeURIComponent(projectId)}/issues`, data);
  }

  async updateIssue(
    projectId: number | string,
    issueIid: number,
    data: {
      title?: string;
      description?: string;
      assignee_ids?: number[];
      milestone_id?: number;
      labels?: string;
      state_event?: 'close' | 'reopen';
      updated_at?: string;
      due_date?: string;
      weight?: number;
      discussion_locked?: boolean;
      epic_id?: number;
      epic_iid?: number;
      issue_type?: 'issue' | 'incident' | 'test_case';
    }
  ): Promise<GitLabIssue> {
    return this.makeRequest<GitLabIssue>('PUT', `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`, data);
  }

  async deleteIssue(projectId: number | string, issueIid: number): Promise<void> {
    return this.makeRequest<void>('DELETE', `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`);
  }
}