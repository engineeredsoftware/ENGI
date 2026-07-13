import { logger } from '@bitcode/logger';
import type {
  JiraConnection,
  JiraProject,
  JiraIssue,
  JiraSearchResults,
  JiraCreateIssueRequest,
  JiraUpdateIssueRequest,
  JiraTransition,
  JiraComment,
  JiraAttachment,
  JiraUser,
  JiraIssueType,
  JiraStatus,
  JiraPriority,
  JiraComponent,
  JiraVersion,
  JiraWorklog,
} from './types';
import { JiraAuth } from './auth';

const DEFAULT_RATE_LIMIT_DELAY = 500; // 500ms between requests (Jira allows ~20 requests per second)

/**
 * Rate limiting helper for Jira API
 */
class RateLimiter {
  private lastRequestTime = 0;
  private delay: number;

  constructor(delay = DEFAULT_RATE_LIMIT_DELAY) {
    this.delay = delay;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delay) {
      const waitTime = this.delay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

/**
 * Jira API Client
 */
export class JiraClient {
  private connection: JiraConnection;
  private rateLimiter: RateLimiter;

  constructor(connection: JiraConnection) {
    this.connection = connection;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Get the base URL for API requests
   */
  private getBaseUrl(): string {
    if (this.connection.auth_type === 'oauth' && this.connection.cloud_id) {
      return `https://api.atlassian.com/ex/jira/${this.connection.cloud_id}`;
    } else {
      return this.connection.base_url;
    }
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.connection.auth_type === 'oauth' && this.connection.access_token) {
      return {
        'Authorization': `Bearer ${this.connection.access_token}`,
      };
    } else if (this.connection.auth_type === 'api_token' && this.connection.email && this.connection.api_token) {
      return {
        'Authorization': JiraAuth.createBasicAuthHeader(this.connection.email, this.connection.api_token),
      };
    } else {
      throw new Error('No valid authentication method configured');
    }
  }

  /**
   * Format Jira-specific error messages with context
   */
  private formatError(error: any, endpoint: string): string {
    if (error.status === 400) {
      if (error.body?.includes('JQL') || endpoint.includes('/search')) {
        return `Invalid JQL query: ${error.body}. Please check syntax and field names.`;
      }
      if (endpoint.includes('/transitions')) {
        return `Invalid transition: ${error.body}. Check workflow configuration and required fields.`;
      }
      return `Bad request: ${error.body || 'Invalid request parameters'}`;
    }
    
    if (error.status === 401) {
      if (this.connection.auth_type === 'oauth') {
        return 'OAuth token expired or invalid. Please re-authenticate with Jira.';
      } else {
        return 'API token authentication failed. Please check your email and API token.';
      }
    }
    
    if (error.status === 403) {
      return `Insufficient permissions for this Jira operation. Please check project permissions and user roles.`;
    }
    
    if (error.status === 404) {
      if (endpoint.includes('/issue/')) {
        return 'Issue not found or you do not have permission to view it.';
      }
      if (endpoint.includes('/project/')) {
        return 'Project not found or you do not have permission to view it.';
      }
      return 'Resource not found or insufficient permissions.';
    }
    
    if (error.status === 429) {
      return 'Jira API rate limit exceeded. Please wait before making more requests.';
    }
    
    return error.message || `Jira API error ${error.status}: ${error.body || 'Unknown error'}`;
  }

  /**
   * Make authenticated request to Jira API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.rateLimiter.throttle();

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const authHeaders = this.getAuthHeaders();
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 429) {
        logger.warn('Jira API rate limit exceeded, waiting 60 seconds');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return this.makeRequest<T>(endpoint, options);
      }

      if (response.status === 401) {
        throw new Error('Jira authentication failed. Please check your credentials.');
      }

      if (!response.ok) {
        const errorBody = await response.text();
        const error = {
          status: response.status,
          body: errorBody
        };
        
        try {
          const errorJson = JSON.parse(errorBody);
          error.body = errorJson.errorMessages?.[0] || errorJson.message || errorBody;
        } catch {
          // Keep the raw error body if JSON parsing fails
        }
        
        throw new Error(this.formatError(error, endpoint));
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T; // For endpoints that return no content (like DELETE)
      }
    } catch (error) {
      logger.error('Jira API request failed', { endpoint, error });
      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<JiraUser> {
    return this.makeRequest<JiraUser>('/rest/api/3/myself');
  }

  /**
   * List all projects visible to the user
   */
  async listProjects(): Promise<JiraProject[]> {
    return this.makeRequest<JiraProject[]>('/rest/api/3/project');
  }

  /**
   * Get project details by key or ID
   */
  async getProject(projectKeyOrId: string): Promise<JiraProject> {
    return this.makeRequest<JiraProject>(`/rest/api/3/project/${projectKeyOrId}`);
  }

  /**
   * Get project components
   */
  async getProjectComponents(projectKeyOrId: string): Promise<JiraComponent[]> {
    return this.makeRequest<JiraComponent[]>(`/rest/api/3/project/${projectKeyOrId}/components`);
  }

  /**
   * Get project versions (releases)
   */
  async getProjectVersions(projectKeyOrId: string): Promise<JiraVersion[]> {
    return this.makeRequest<JiraVersion[]>(`/rest/api/3/project/${projectKeyOrId}/versions`);
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(
    jql: string,
    startAt: number = 0,
    maxResults: number = 50,
    fields?: string[],
    expand?: string[]
  ): Promise<JiraSearchResults> {
    const params = new URLSearchParams({
      jql,
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
    });

    if (fields && fields.length > 0) {
      params.append('fields', fields.join(','));
    }

    if (expand && expand.length > 0) {
      params.append('expand', expand.join(','));
    }

    return this.makeRequest<JiraSearchResults>(`/rest/api/3/search?${params.toString()}`);
  }

  /**
   * Get issue details by key or ID
   */
  async getIssue(issueKeyOrId: string, fields?: string[], expand?: string[]): Promise<JiraIssue> {
    const params = new URLSearchParams();

    if (fields && fields.length > 0) {
      params.append('fields', fields.join(','));
    }

    if (expand && expand.length > 0) {
      params.append('expand', expand.join(','));
    }

    const queryString = params.toString();
    const endpoint = `/rest/api/3/issue/${issueKeyOrId}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<JiraIssue>(endpoint);
  }

  /**
   * Create a new issue
   */
  async createIssue(issueData: JiraCreateIssueRequest): Promise<JiraIssue> {
    const response = await this.makeRequest<{ id: string; key: string; self: string }>(
      '/rest/api/3/issue',
      {
        method: 'POST',
        body: JSON.stringify(issueData),
      }
    );

    // Fetch the full issue details
    return this.getIssue(response.key);
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueKeyOrId: string, updateData: JiraUpdateIssueRequest): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
  }

  /**
   * Delete an issue
   */
  async deleteIssue(issueKeyOrId: string): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get available transitions for an issue
   */
  async getIssueTransitions(issueKeyOrId: string): Promise<JiraTransition[]> {
    const response = await this.makeRequest<{ transitions: JiraTransition[] }>(
      `/rest/api/3/issue/${issueKeyOrId}/transitions`
    );
    return response.transitions;
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(
    issueKeyOrId: string,
    transitionId: string,
    comment?: string,
    fields?: Record<string, any>
  ): Promise<void> {
    const body: any = {
      transition: { id: transitionId },
    };

    if (comment) {
      body.update = {
        comment: [{ add: { body: comment } }],
      };
    }

    if (fields) {
      body.fields = fields;
    }

    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/transitions`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * Assign issue to a user
   */
  async assignIssue(issueKeyOrId: string, accountId: string | null): Promise<void> {
    const body = accountId ? { accountId } : null;
    
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/assignee`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * Get comments for an issue
   */
  async getIssueComments(issueKeyOrId: string): Promise<JiraComment[]> {
    const response = await this.makeRequest<{ comments: JiraComment[] }>(
      `/rest/api/3/issue/${issueKeyOrId}/comment`
    );
    return response.comments;
  }

  /**
   * Add a comment to an issue
   */
  async addComment(
    issueKeyOrId: string,
    body: string,
    visibility?: { type: 'group' | 'role'; value: string }
  ): Promise<JiraComment> {
    const commentData: any = { body };
    
    if (visibility) {
      commentData.visibility = visibility;
    }

    return this.makeRequest<JiraComment>(
      `/rest/api/3/issue/${issueKeyOrId}/comment`,
      {
        method: 'POST',
        body: JSON.stringify(commentData),
      }
    );
  }

  /**
   * Update a comment
   */
  async updateComment(issueKeyOrId: string, commentId: string, body: string): Promise<JiraComment> {
    return this.makeRequest<JiraComment>(
      `/rest/api/3/issue/${issueKeyOrId}/comment/${commentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ body }),
      }
    );
  }

  /**
   * Delete a comment
   */
  async deleteComment(issueKeyOrId: string, commentId: string): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/comment/${commentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get attachments for an issue
   */
  async getIssueAttachments(issueKeyOrId: string): Promise<JiraAttachment[]> {
    const issue = await this.getIssue(issueKeyOrId, ['attachment']);
    return issue.fields.attachment || [];
  }

  /**
   * Add attachment to an issue
   * Note: This requires multipart/form-data and the X-Atlassian-Token header
   */
  async addAttachment(issueKeyOrId: string, file: File | Buffer, filename: string): Promise<JiraAttachment[]> {
    const formData = new FormData();
    
    if (file instanceof Buffer) {
      const blob = new Blob([file]);
      formData.append('file', blob, filename);
    } else {
      formData.append('file', file as Blob, filename);
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/rest/api/3/issue/${issueKeyOrId}/attachments`;
    const authHeaders = this.getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Atlassian-Token': 'no-check',
        ...authHeaders,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to add attachment: ${response.status} ${errorBody}`);
    }

    return response.json();
  }

  /**
   * Download attachment content
   */
  async downloadAttachment(attachment: JiraAttachment): Promise<ArrayBuffer> {
    const authHeaders = this.getAuthHeaders();
    
    const response = await fetch(attachment.content, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Add watcher to an issue
   */
  async addWatcher(issueKeyOrId: string, accountId: string): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/watchers`,
      {
        method: 'POST',
        body: JSON.stringify({ accountId }),
      }
    );
  }

  /**
   * Remove watcher from an issue
   */
  async removeWatcher(issueKeyOrId: string, accountId: string): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/watchers?accountId=${accountId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get all issue types
   */
  async getIssueTypes(): Promise<JiraIssueType[]> {
    return this.makeRequest<JiraIssueType[]>('/rest/api/3/issuetype');
  }

  /**
   * Get all statuses
   */
  async getStatuses(): Promise<JiraStatus[]> {
    return this.makeRequest<JiraStatus[]>('/rest/api/3/status');
  }

  /**
   * Get all priorities
   */
  async getPriorities(): Promise<JiraPriority[]> {
    return this.makeRequest<JiraPriority[]>('/rest/api/3/priority');
  }

  /**
   * Create an issue link between two issues
   */
  async createIssueLink(
    outwardIssue: string,
    inwardIssue: string,
    linkType: string,
    comment?: string
  ): Promise<void> {
    const body: any = {
      outwardIssue: { key: outwardIssue },
      inwardIssue: { key: inwardIssue },
      type: { name: linkType },
    };

    if (comment) {
      body.comment = { body: comment };
    }

    await this.makeRequest<void>(
      '/rest/api/3/issueLink',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * Search for users in the instance
   */
  async searchUsers(query: string): Promise<JiraUser[]> {
    const params = new URLSearchParams({
      query,
      maxResults: '50',
    });

    return this.makeRequest<JiraUser[]>(`/rest/api/3/user/search?${params.toString()}`);
  }

  /**
   * Get user by account ID
   */
  async getUser(accountId: string): Promise<JiraUser> {
    return this.makeRequest<JiraUser>(`/rest/api/3/user?accountId=${accountId}`);
  }

  /**
   * Get worklogs for an issue
   */
  async getIssueWorklogs(issueKeyOrId: string): Promise<JiraWorklog[]> {
    const response = await this.makeRequest<{ worklogs: JiraWorklog[] }>(
      `/rest/api/3/issue/${issueKeyOrId}/worklog`
    );
    return response.worklogs;
  }

  /**
   * Add a worklog to an issue
   */
  async addWorklog(
    issueKeyOrId: string,
    timeSpent: string,
    started: string,
    comment?: string,
    visibility?: { type: 'group' | 'role'; value: string }
  ): Promise<JiraWorklog> {
    const worklogData: any = {
      timeSpent,
      started,
    };
    
    if (comment) {
      worklogData.comment = comment;
    }
    
    if (visibility) {
      worklogData.visibility = visibility;
    }

    return this.makeRequest<JiraWorklog>(
      `/rest/api/3/issue/${issueKeyOrId}/worklog`,
      {
        method: 'POST',
        body: JSON.stringify(worklogData),
      }
    );
  }

  /**
   * Update a worklog
   */
  async updateWorklog(
    issueKeyOrId: string,
    worklogId: string,
    updates: {
      timeSpent?: string;
      started?: string;
      comment?: string;
    }
  ): Promise<JiraWorklog> {
    return this.makeRequest<JiraWorklog>(
      `/rest/api/3/issue/${issueKeyOrId}/worklog/${worklogId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Delete a worklog
   */
  async deleteWorklog(issueKeyOrId: string, worklogId: string): Promise<void> {
    await this.makeRequest<void>(
      `/rest/api/3/issue/${issueKeyOrId}/worklog/${worklogId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Bulk update issues
   */
  async bulkUpdateIssues(
    updates: Array<{
      issueKey: string;
      fields: Record<string, any>;
    }>
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = { success: 0, failed: 0, errors: [] as any[] };
    
    // Process in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (update) => {
          try {
            await this.updateIssue(update.issueKey, { fields: update.fields });
            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push({
              issueKey: update.issueKey,
              error: error.message
            });
          }
        })
      );
      
      // Rate limiting delay between batches
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}
