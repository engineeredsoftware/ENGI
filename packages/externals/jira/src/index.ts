export * from './types';
export * from './client';
export * from './auth';
export * from './connections';

// Re-export main client and types for convenience
export { JiraClient } from './client';
export { JiraAuth } from './auth';
export { JiraConnections } from './connections';
export type {
  JiraConnection,
  JiraProject,
  JiraIssue,
  JiraCreateIssueRequest,
  JiraUpdateIssueRequest,
  JiraSearchResults,
  JiraUser,
  JiraComment,
  JiraAttachment,
  JiraTransition,
  JiraOAuthData,
} from './types';

/**
 * Helper functions for common Jira operations
 */

import { JiraClient } from './client';
import { JiraConnections } from './connections';
import type { JiraConnection } from './types';

/**
 * Create a new Jira client instance from connection
 */
export function createJiraClient(connection: JiraConnection): JiraClient {
  return new JiraClient(connection);
}

/**
 * Factory function to create authenticated client from user connection
 */
export async function createJiraClientFromUser(userId: string): Promise<JiraClient | null> {
  const connection = await JiraConnections.validateConnection(userId);
  if (!connection) {
    return null;
  }
  
  return new JiraClient(connection);
}

/**
 * Extract issue key from Jira URL
 */
export function extractIssueKeyFromUrl(jiraUrl: string): string | null {
  // Matches patterns like:
  // https://company.atlassian.net/browse/PROJ-123
  // https://company.atlassian.net/jira/software/projects/PROJ/boards/1?selectedIssue=PROJ-123
  const patterns = [
    /\/browse\/([A-Z][A-Z0-9]*-\d+)/,
    /selectedIssue=([A-Z][A-Z0-9]*-\d+)/,
    /([A-Z][A-Z0-9]*-\d+)$/
  ];
  
  for (const pattern of patterns) {
    const match = jiraUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract project key from Jira URL
 */
export function extractProjectKeyFromUrl(jiraUrl: string): string | null {
  // Matches patterns like:
  // https://company.atlassian.net/jira/software/projects/PROJ/boards/1
  // https://company.atlassian.net/browse/PROJ-123 (extracts PROJ)
  const patterns = [
    /\/projects\/([A-Z][A-Z0-9]*)/,
    /\/browse\/([A-Z][A-Z0-9]*)-\d+/
  ];
  
  for (const pattern of patterns) {
    const match = jiraUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Parse Jira base URL from any Jira URL
 */
export function parseJiraBaseUrl(jiraUrl: string): string | null {
  try {
    const url = new URL(jiraUrl);
    // Extract the origin (protocol + host + port)
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Validate Jira issue key format
 */
export function isValidIssueKey(issueKey: string): boolean {
  return /^[A-Z][A-Z0-9]*-\d+$/.test(issueKey);
}

/**
 * Validate Jira project key format
 */
export function isValidProjectKey(projectKey: string): boolean {
  return /^[A-Z][A-Z0-9]*$/.test(projectKey);
}

/**
 * Search for issues using JQL
 */
export async function jiraSearchIssues(
  connection: JiraConnection,
  jql: string,
  maxResults: number = 50
) {
  const client = createJiraClient(connection);
  return client.searchIssues(jql, 0, maxResults);
}

/**
 * Get issue details by key
 */
export async function jiraGetIssue(connection: JiraConnection, issueKey: string) {
  const client = createJiraClient(connection);
  return client.getIssue(issueKey);
}

/**
 * Create a new issue
 */
export async function jiraCreateIssue(
  connection: JiraConnection,
  projectKey: string,
  issueType: string,
  summary: string,
  description?: string,
  assigneeAccountId?: string
) {
  const client = createJiraClient(connection);
  return client.createIssue({
    fields: {
      project: { key: projectKey },
      issuetype: { name: issueType },
      summary,
      ...(description && { description }),
      ...(assigneeAccountId && { assignee: { accountId: assigneeAccountId } })
    }
  });
}

/**
 * Update an issue
 */
export async function jiraUpdateIssue(
  connection: JiraConnection,
  issueKey: string,
  updates: {
    summary?: string;
    description?: string;
    assigneeAccountId?: string;
    priority?: string;
  }
) {
  const client = createJiraClient(connection);
  const fields: any = {};
  
  if (updates.summary) fields.summary = updates.summary;
  if (updates.description) fields.description = updates.description;
  if (updates.assigneeAccountId) fields.assignee = { accountId: updates.assigneeAccountId };
  if (updates.priority) fields.priority = { name: updates.priority };
  
  return client.updateIssue(issueKey, { fields });
}

/**
 * Transition an issue to a new status
 */
export async function jiraTransitionIssue(
  connection: JiraConnection,
  issueKey: string,
  statusName: string,
  comment?: string
) {
  const client = createJiraClient(connection);
  
  // Get available transitions for the issue
  const transitions = await client.getIssueTransitions(issueKey);
  
  // Find the transition that leads to the desired status
  const transition = transitions.find(t => 
    t.to.name.toLowerCase() === statusName.toLowerCase()
  );
  
  if (!transition) {
    throw new Error(`No transition found to status "${statusName}". Available transitions: ${transitions.map(t => t.to.name).join(', ')}`);
  }
  
  return client.transitionIssue(issueKey, transition.id, comment);
}

/**
 * Add a comment to an issue
 */
export async function jiraAddComment(
  connection: JiraConnection,
  issueKey: string,
  comment: string
) {
  const client = createJiraClient(connection);
  return client.addComment(issueKey, comment);
}

/**
 * Get comments for an issue
 */
export async function jiraGetComments(connection: JiraConnection, issueKey: string) {
  const client = createJiraClient(connection);
  return client.getIssueComments(issueKey);
}

/**
 * Assign an issue to a user
 */
export async function jiraAssignIssue(
  connection: JiraConnection,
  issueKey: string,
  accountId: string | null
) {
  const client = createJiraClient(connection);
  return client.assignIssue(issueKey, accountId);
}

/**
 * List projects accessible to the user
 */
export async function jiraListProjects(connection: JiraConnection) {
  const client = createJiraClient(connection);
  return client.listProjects();
}

/**
 * Get project details
 */
export async function jiraGetProject(connection: JiraConnection, projectKey: string) {
  const client = createJiraClient(connection);
  return client.getProject(projectKey);
}

/**
 * Search for users
 */
export async function jiraSearchUsers(connection: JiraConnection, query: string) {
  const client = createJiraClient(connection);
  return client.searchUsers(query);
}

/**
 * Get issue types for the instance
 */
export async function jiraGetIssueTypes(connection: JiraConnection) {
  const client = createJiraClient(connection);
  return client.getIssueTypes();
}

/**
 * Get priorities for the instance
 */
export async function jiraGetPriorities(connection: JiraConnection) {
  const client = createJiraClient(connection);
  return client.getPriorities();
}

/**
 * Create a link between two issues
 */
export async function jiraCreateIssueLink(
  connection: JiraConnection,
  outwardIssue: string,
  inwardIssue: string,
  linkType: string,
  comment?: string
) {
  const client = createJiraClient(connection);
  return client.createIssueLink(outwardIssue, inwardIssue, linkType, comment);
}

/**
 * Common JQL queries for convenience
 */
export const JQL_QUERIES = {
  myOpenIssues: 'assignee = currentUser() AND resolution = Unresolved',
  myRecentIssues: 'assignee = currentUser() ORDER BY updated DESC',
  projectIssues: (projectKey: string) => `project = ${projectKey}`,
  openBugs: (projectKey?: string) => 
    `issuetype = Bug AND resolution = Unresolved${projectKey ? ` AND project = ${projectKey}` : ''}`,
  recentlyUpdated: (days: number = 7) =>
    `updated >= -${days}d ORDER BY updated DESC`,
  highPriorityOpen: 'priority in (Highest, High) AND resolution = Unresolved',
} as const;