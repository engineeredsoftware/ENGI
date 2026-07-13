/**
 * JIRA MCP TOOLS - EVOLVED TOOLS AND PROMPTS PRIMITIVES ARCHITECTURE
 * 
 * This module provides production-grade Jira MCP tools built on the evolved tools architecture
 * with proper Tool objects from the 'ai' package and sophisticated prompt primitives integration.
 * Under V26 fifth-gate reform it is an admitted ingress/reference integration,
 * not a Bitcode Exchange state owner or primary product surface.
 * 
 * Key Features:
 * ✅ Proper Tool objects using Tool class from '@bitcode/tools-generics'
 * ✅ Comprehensive parameter schemas with Zod validation
 * ✅ Production-grade error handling and authentication
 * ✅ Support for both OAuth and API token authentication
 * ✅ Complete Jira REST API coverage for project and issue management
 * ✅ Performance monitoring and metrics collection
 * ✅ Type-safe tool definitions with comprehensive metadata
 */

import { z } from 'zod';
import { Tool } from '@bitcode/tools-generics';
import { log } from '@bitcode/logger';
import {
  JiraConnections,
  JiraClient,
  type JiraConnection,
  JiraCreateIssueSchema,
  JiraUpdateIssueSchema,
  JiraTransitionIssueSchema,
  JiraAddCommentSchema,
  JiraSearchSchema,
  JiraProjectKeySchema,
  JiraIssueKeySchema,
  JiraJQLSchema,
  JiraAddWorklogSchema,
  JiraUpdateWorklogSchema,
  JiraBulkUpdateSchema,
} from '@bitcode/externals-jira';

// ==================== AUTHENTICATION AND CLIENT HELPERS ====================

/**
 * Tool context for user authentication
 */
interface JiraToolContext {
  user_id: string;
  connection?: JiraConnection;
}

/**
 * Tool result wrapper
 */
interface JiraToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}

/**
 * Wrapper for executing Jira operations with authentication and error handling
 */
async function withJiraClient<T>(
  context: JiraToolContext,
  operation: (client: JiraClient) => Promise<JiraToolResult<T>>,
  operationName: string
): Promise<JiraToolResult<T>> {
  const startTime = Date.now();
  
  try {
    let connection: JiraConnection | null | undefined = context.connection;
    
    if (!connection) {
      connection = await JiraConnections.validateConnection(context.user_id);
      if (!connection) {
        return {
          success: false,
          error: 'No valid Jira connection found. Please connect your Jira account first.',
          executionTime: Date.now() - startTime
        };
      }
    }
    
    const client = new JiraClient(connection);
    
    log(`[JiraTools] Executing ${operationName}`, 'info', {
      user_id: context.user_id,
      auth_type: connection.auth_type,
      base_url: connection.base_url
    });
    
    const result = await operation(client);
    result.executionTime = Date.now() - startTime;
    
    log(`[JiraTools] ${operationName} completed`, 'info', {
      user_id: context.user_id,
      success: result.success,
      executionTime: result.executionTime
    });
    
    return result;
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error.message || `Failed to ${operationName.toLowerCase()}`;
    
    log(`[JiraTools] ${operationName} failed`, 'error', {
      user_id: context.user_id,
      error: errorMessage,
      executionTime
    });
    
    return {
      success: false,
      error: errorMessage,
      executionTime
    };
  }
}

// ==================== PARAMETER SCHEMAS ====================

const JiraContextSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  connection: z.any().optional()
});

const JiraAccountIdSchema = z.string().min(1, 'Account ID is required');
const JiraCommentIdSchema = z.string().min(1, 'Comment ID is required');
const JiraTransitionIdSchema = z.string().min(1, 'Transition ID is required');

// ==================== PROJECT MANAGEMENT TOOLS ====================

/**
 * List all projects accessible to the user - primitive function
 */
async function _jiraListProjects({ context, includeArchived = false, recent = false }: {
  context: JiraToolContext;
  includeArchived?: boolean;
  recent?: boolean;
}) {
    return withJiraClient(
      context,
      async (client) => {
        try {
          const projects = await client.listProjects();
          
          let filteredProjects = projects;
          if (!includeArchived) {
            filteredProjects = projects.filter(p => !p.isPrivate); // Filter out archived/private
          }
          
          if (recent) {
            // Sort by last issue update time if available
            filteredProjects.sort((a, b) => {
              const aTime = a.insight?.lastIssueUpdateTime || '0';
              const bTime = b.insight?.lastIssueUpdateTime || '0';
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
          }
          
          return {
            success: true,
            data: {
              projects: filteredProjects,
              summary: {
                totalProjects: filteredProjects.length,
                projectTypes: [...new Set(filteredProjects.map(p => p.projectTypeKey))],
                hasInsights: filteredProjects.some(p => p.insight)
              }
            }
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message
          };
        }
      },
      'listProjects'
    );
  }

/**
 * List all projects accessible to the user
 */
class JiraListProjectsTool extends Tool<typeof _jiraListProjects> {
  use = _jiraListProjects;
}

export const jiraListProjectsTool = new JiraListProjectsTool();

/**
 * Get detailed information about a specific project - primitive function
 */
async function _jiraGetProject({ context, projectKey, includeComponents = true, includeVersions = true }: {
  context: JiraToolContext;
  projectKey: string;
  includeComponents?: boolean;
  includeVersions?: boolean;
}) {
    return withJiraClient(
      context,
      async (client) => {
        try {
          const project = await client.getProject(projectKey);
          
          const additionalData: any = {};
          
          if (includeComponents) {
            try {
              additionalData.components = await client.getProjectComponents(projectKey);
            } catch (error: any) {
              log('[JiraTools] Failed to get components', 'warn', { projectKey, error: error.message });
            }
          }
          
          if (includeVersions) {
            try {
              additionalData.versions = await client.getProjectVersions(projectKey);
            } catch (error: any) {
              log('[JiraTools] Failed to get versions', 'warn', { projectKey, error: error.message });
            }
          }
          
          return {
            success: true,
            data: {
              project,
              ...additionalData,
              summary: {
                totalComponents: additionalData.components?.length || 0,
                totalVersions: additionalData.versions?.length || 0,
                releasedVersions: additionalData.versions?.filter((v: any) => v.released).length || 0
              }
            }
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message
          };
        }
      },
      'getProject'
    );
  }

/**
 * Get detailed information about a specific project
 */
class JiraGetProjectTool extends Tool<typeof _jiraGetProject> {
  use = _jiraGetProject;
}

export const jiraGetProjectTool = new JiraGetProjectTool();

// ==================== ISSUE SEARCH AND RETRIEVAL TOOLS ====================

/**
 * Search for issues using JQL (Jira Query Language) - primitive function
 */
async function _jiraSearchIssues({ context, jql, startAt, maxResults, fields, expand, includeChangelog, includeComments }: {
  context: JiraToolContext;
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
  includeChangelog?: boolean;
  includeComments?: boolean;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const expandFields = expand || [];
        if (includeChangelog) expandFields.push('changelog');
        if (includeComments) expandFields.push('comments');
        
        const results = await client.searchIssues(jql, startAt, maxResults, fields, expandFields);
        
        return {
          success: true,
          data: {
            ...results,
            searchCriteria: {
              jql,
              startAt,
              maxResults,
              fields,
              expand: expandFields
            },
            summary: {
              totalResults: results.total,
              currentPage: Math.floor(results.startAt / results.maxResults) + 1,
              totalPages: Math.ceil(results.total / results.maxResults),
              hasMoreResults: results.startAt + results.maxResults < results.total
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'searchIssues'
  );
}

/**
 * Search for issues using JQL (Jira Query Language)
 */
class JiraSearchIssuesTool extends Tool<typeof _jiraSearchIssues> {
  use = _jiraSearchIssues;
}

export const jiraSearchIssuesTool = new JiraSearchIssuesTool();

/**
 * Get detailed information about a specific issue - primitive function
 */
async function _jiraGetIssue({ context, issueKey, includeChangelog, includeComments, includeAttachments }: {
  context: JiraToolContext;
  issueKey: string;
  includeChangelog?: boolean;
  includeComments?: boolean;
  includeAttachments?: boolean;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const expandFields = [];
        if (includeChangelog) expandFields.push('changelog');
        if (includeComments) expandFields.push('comments');
        
        const issue = await client.getIssue(issueKey, undefined, expandFields);
        
        const additionalData: any = {};
        
        if (includeAttachments && issue.fields.attachment?.length > 0) {
          additionalData.attachments = issue.fields.attachment;
        }
        
        return {
          success: true,
          data: {
            issue,
            ...additionalData,
            summary: {
              issueType: issue.fields.issuetype.name,
              status: issue.fields.status.name,
              priority: issue.fields.priority?.name || 'None',
              assignee: issue.fields.assignee?.displayName || 'Unassigned',
              hasComments: !!issue.fields.comment?.total,
              hasAttachments: !!issue.fields.attachment?.length,
              hasSubtasks: !!issue.fields.subtasks?.length
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'getIssue'
  );
}

/**
 * Get detailed information about a specific issue
 */
class JiraGetIssueTool extends Tool<typeof _jiraGetIssue> {
  use = _jiraGetIssue;
}

export const jiraGetIssueTool = new JiraGetIssueTool();

// ==================== ISSUE CREATION AND MODIFICATION TOOLS ====================

/**
 * Create a new issue in Jira - primitive function
 */
async function _jiraCreateIssue({ context, projectKey, issueType, summary, description, assigneeAccountId, priority, labels, components, parentKey, dueDate }: {
  context: JiraToolContext;
  projectKey: string;
  issueType: string;
  summary: string;
  description?: string;
  assigneeAccountId?: string;
  priority?: string;
  labels?: string[];
  components?: string[];
  parentKey?: string;
  dueDate?: string;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const issueData: any = {
          fields: {
            project: { key: projectKey },
            issuetype: { name: issueType },
            summary
          }
        };
        
        if (description) issueData.fields.description = description;
        if (assigneeAccountId) issueData.fields.assignee = { accountId: assigneeAccountId };
        if (priority) issueData.fields.priority = { name: priority };
        if (labels?.length) issueData.fields.labels = labels;
        if (components?.length) issueData.fields.components = components.map(c => ({ name: c }));
        if (parentKey) issueData.fields.parent = { key: parentKey };
        if (dueDate) issueData.fields.duedate = dueDate;
        
        const newIssue = await client.createIssue(issueData);
        
        return {
          success: true,
          data: {
            issue: newIssue,
            summary: {
              issueKey: newIssue.key,
              issueType: newIssue.fields.issuetype.name,
              status: newIssue.fields.status.name,
              assignee: newIssue.fields.assignee?.displayName || 'Unassigned'
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'createIssue'
  );
}

/**
 * Create a new issue in Jira
 */
class JiraCreateIssueTool extends Tool<typeof _jiraCreateIssue> {
  use = _jiraCreateIssue;
}

export const jiraCreateIssueTool = new JiraCreateIssueTool();

/**
 * Update an existing issue - primitive function
 */
async function _jiraUpdateIssue({ context, issueKey, summary, description, assigneeAccountId, priority, labels, components }: {
  context: JiraToolContext;
  issueKey: string;
  summary?: string;
  description?: string;
  assigneeAccountId?: string;
  priority?: string;
  labels?: string[];
  components?: string[];
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const updateData: any = { fields: {} };
        
        if (summary) updateData.fields.summary = summary;
        if (description) updateData.fields.description = description;
        if (assigneeAccountId !== undefined) {
          updateData.fields.assignee = assigneeAccountId ? { accountId: assigneeAccountId } : null;
        }
        if (priority) updateData.fields.priority = { name: priority };
        if (labels) updateData.fields.labels = labels;
        if (components) updateData.fields.components = components.map(c => ({ name: c }));
        
        await client.updateIssue(issueKey, updateData);
        
        // Fetch updated issue to return current state
        const updatedIssue = await client.getIssue(issueKey);
        
        return {
          success: true,
          data: {
            issue: updatedIssue,
            summary: {
              issueKey: updatedIssue.key,
              status: updatedIssue.fields.status.name,
              assignee: updatedIssue.fields.assignee?.displayName || 'Unassigned'
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'updateIssue'
  );
}

/**
 * Update an existing issue
 */
class JiraUpdateIssueTool extends Tool<typeof _jiraUpdateIssue> {
  use = _jiraUpdateIssue;
}

export const jiraUpdateIssueTool = new JiraUpdateIssueTool();

/**
 * Transition an issue to a new status - primitive function
 */
async function _jiraTransitionIssue({ context, issueKey, statusName, comment, resolution, assigneeAccountId }: {
  context: JiraToolContext;
  issueKey: string;
  statusName: string;
  comment?: string;
  resolution?: string;
  assigneeAccountId?: string;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        // Get available transitions
        const transitions = await client.getIssueTransitions(issueKey);
        
        // Find the transition that leads to the desired status
        const transition = transitions.find(t => 
          t.to.name.toLowerCase() === statusName.toLowerCase()
        );
        
        if (!transition) {
          const availableStatuses = transitions.map(t => t.to.name).join(', ');
          throw new Error(`No transition found to status "${statusName}". Available transitions: ${availableStatuses}`);
        }
        
        // Prepare transition fields
        const fields: any = {};
        if (resolution) fields.resolution = { name: resolution };
        if (assigneeAccountId) fields.assignee = { accountId: assigneeAccountId };
        
        await client.transitionIssue(issueKey, transition.id, comment, Object.keys(fields).length > 0 ? fields : undefined);
        
        // Fetch updated issue to return current state
        const updatedIssue = await client.getIssue(issueKey);
        
        return {
          success: true,
          data: {
            issue: updatedIssue,
            transition: {
              id: transition.id,
              name: transition.name,
              fromStatus: transition.to.name,
              toStatus: statusName
            },
            summary: {
              issueKey: updatedIssue.key,
              newStatus: updatedIssue.fields.status.name,
              assignee: updatedIssue.fields.assignee?.displayName || 'Unassigned'
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'transitionIssue'
  );
}

/**
 * Transition an issue to a new status
 */
class JiraTransitionIssueTool extends Tool<typeof _jiraTransitionIssue> {
  use = _jiraTransitionIssue;
}

export const jiraTransitionIssueTool = new JiraTransitionIssueTool();

/**
 * Assign an issue to a user - primitive function
 */
async function _jiraAssignIssue({ context, issueKey, accountId }: {
  context: JiraToolContext;
  issueKey: string;
  accountId: string | null;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        await client.assignIssue(issueKey, accountId);
        
        // Fetch updated issue to return current state
        const updatedIssue = await client.getIssue(issueKey);
        
        return {
          success: true,
          data: {
            issue: updatedIssue,
            summary: {
              issueKey: updatedIssue.key,
              assignee: updatedIssue.fields.assignee?.displayName || 'Unassigned',
              assigneeAccountId: updatedIssue.fields.assignee?.accountId || null
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'assignIssue'
  );
}

/**
 * Assign an issue to a user
 */
class JiraAssignIssueTool extends Tool<typeof _jiraAssignIssue> {
  use = _jiraAssignIssue;
}

export const jiraAssignIssueTool = new JiraAssignIssueTool();

// ==================== COMMENT MANAGEMENT TOOLS ====================

/**
 * Add a comment to an issue - primitive function
 */
async function _jiraAddComment({ context, issueKey, body, visibility }: {
  context: JiraToolContext;
  issueKey: string;
  body: string;
  visibility?: any;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const comment = await client.addComment(issueKey, body, visibility);
        
        return {
          success: true,
          data: {
            comment,
            summary: {
              issueKey,
              commentId: comment.id,
              author: comment.author.displayName,
              created: comment.created
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'addComment'
  );
}

/**
 * Add a comment to an issue
 */
class JiraAddCommentTool extends Tool<typeof _jiraAddComment> {
  use = _jiraAddComment;
}

export const jiraAddCommentTool = new JiraAddCommentTool();

/**
 * Get comments for an issue - primitive function
 */
async function _jiraGetComments({ context, issueKey }: {
  context: JiraToolContext;
  issueKey: string;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const comments = await client.getIssueComments(issueKey);
        
        return {
          success: true,
          data: {
            comments,
            summary: {
              issueKey,
              totalComments: comments.length,
              authors: [...new Set(comments.map(c => c.author.displayName))],
              latestComment: comments.length > 0 ? comments[comments.length - 1] : null
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'getComments'
  );
}

/**
 * Get comments for an issue
 */
class JiraGetCommentsTool extends Tool<typeof _jiraGetComments> {
  use = _jiraGetComments;
}

export const jiraGetCommentsTool = new JiraGetCommentsTool();

// ==================== USER AND METADATA TOOLS ====================

/**
 * Search for users in the Jira instance - primitive function
 */
async function _jiraSearchUsers({ context, query, maxResults = 20 }: {
  context: JiraToolContext;
  query: string;
  maxResults?: number;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const users = await client.searchUsers(query);
        const limitedUsers = users.slice(0, maxResults);
        
        return {
          success: true,
          data: {
            users: limitedUsers,
            summary: {
              totalFound: users.length,
              returned: limitedUsers.length,
              query,
              activeUsers: limitedUsers.filter(u => u.active).length
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'searchUsers'
  );
}

/**
 * Search for users in the Jira instance
 */
class JiraSearchUsersTool extends Tool<typeof _jiraSearchUsers> {
  use = _jiraSearchUsers;
}

export const jiraSearchUsersTool = new JiraSearchUsersTool();

/**
 * Get issue types available in the instance - primitive function
 */
async function _jiraGetIssueTypes({ context }: {
  context: JiraToolContext;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const issueTypes = await client.getIssueTypes();
        
        return {
          success: true,
          data: {
            issueTypes,
            summary: {
              totalTypes: issueTypes.length,
              subtaskTypes: issueTypes.filter(t => t.subtask).length,
              standardTypes: issueTypes.filter(t => !t.subtask).length
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'getIssueTypes'
  );
}

/**
 * Get issue types available in the instance
 */
class JiraGetIssueTypesTool extends Tool<typeof _jiraGetIssueTypes> {
  use = _jiraGetIssueTypes;
}

export const jiraGetIssueTypesTool = new JiraGetIssueTypesTool();

/**
 * Get priorities available in the instance - primitive function
 */
async function _jiraGetPriorities({ context }: {
  context: JiraToolContext;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const priorities = await client.getPriorities();
        
        return {
          success: true,
          data: {
            priorities,
            summary: {
              totalPriorities: priorities.length,
              priorityNames: priorities.map(p => p.name)
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'getPriorities'
  );
}

/**
 * Get priorities available in the instance
 */
class JiraGetPrioritiesTool extends Tool<typeof _jiraGetPriorities> {
  use = _jiraGetPriorities;
}

export const jiraGetPrioritiesTool = new JiraGetPrioritiesTool();

// ==================== ISSUE LINKING TOOLS ====================

/**
 * Create a link between two issues - primitive function
 */
async function _jiraCreateIssueLink({ context, outwardIssue, inwardIssue, linkType, comment }: {
  context: JiraToolContext;
  outwardIssue: string;
  inwardIssue: string;
  linkType: string;
  comment?: string;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        await client.createIssueLink(outwardIssue, inwardIssue, linkType, comment);
        
        return {
          success: true,
          data: {
            link: {
              outwardIssue,
              inwardIssue,
              linkType,
              comment
            },
            summary: {
              relationship: `${outwardIssue} ${linkType} ${inwardIssue}`,
              hasComment: !!comment
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'createIssueLink'
  );
}

/**
 * Create a link between two issues
 */
class JiraCreateIssueLinkTool extends Tool<typeof _jiraCreateIssueLink> {
  use = _jiraCreateIssueLink;
}

export const jiraCreateIssueLinkTool = new JiraCreateIssueLinkTool();

// ==================== WORKLOG MANAGEMENT TOOLS ====================

/**
 * Get worklogs for a specific issue - primitive function
 */
async function _jiraGetWorklogs({ context, issueKey }: {
  context: JiraToolContext;
  issueKey: string;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const worklogs = await client.getIssueWorklogs(issueKey);
        
        return {
          success: true,
          data: {
            worklogs,
            summary: {
              issueKey,
              totalWorklogs: worklogs.length,
              totalTimeSpent: worklogs.reduce((total, log) => total + (log.timeSpentSeconds || 0), 0),
              authors: [...new Set(worklogs.map(w => w.author.displayName))],
              dateRange: worklogs.length > 0 ? {
                earliest: worklogs.reduce((min, w) => w.started < min ? w.started : min, worklogs[0].started),
                latest: worklogs.reduce((max, w) => w.started > max ? w.started : max, worklogs[0].started)
              } : null
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'getWorklogs'
  );
}

/**
 * Get worklogs for a specific issue
 */
class JiraGetWorklogsTool extends Tool<typeof _jiraGetWorklogs> {
  use = _jiraGetWorklogs;
}

export const jiraGetWorklogsTool = new JiraGetWorklogsTool();

/**
 * Add a worklog to an issue - primitive function
 */
async function _jiraAddWorklog({ context, issueKey, comment, started, timeSpent, visibility }: {
  context: JiraToolContext;
  issueKey: string;
  comment?: string;
  started?: string;
  timeSpent: string;
  visibility?: any;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const worklog = await client.addWorklog(
          issueKey,
          timeSpent,
          started ?? new Date().toISOString(),
          comment,
          visibility
        );
        
        return {
          success: true,
          data: {
            worklog,
            summary: {
              issueKey,
              worklogId: worklog.id,
              timeSpent,
              author: worklog.author.displayName,
              started: worklog.started
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'addWorklog'
  );
}

/**
 * Add a worklog to an issue
 */
class JiraAddWorklogTool extends Tool<typeof _jiraAddWorklog> {
  use = _jiraAddWorklog;
}

export const jiraAddWorklogTool = new JiraAddWorklogTool();

/**
 * Bulk update multiple issues - primitive function
 */
async function _jiraBulkUpdateIssues({ context, updates }: {
  context: JiraToolContext;
  updates: Array<{
    issueKey: string;
    fields: Record<string, any>;
  }>;
}) {
  return withJiraClient(
    context,
    async (client) => {
      try {
        const result = await client.bulkUpdateIssues(updates);
        
        return {
          success: true,
          data: {
            ...result,
            summary: {
              totalIssues: updates.length,
              successRate: ((result.success / updates.length) * 100).toFixed(1) + '%',
              processedAt: new Date().toISOString()
            }
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    'bulkUpdateIssues'
  );
}

/**
 * Bulk update multiple issues
 */
class JiraBulkUpdateIssuesTool extends Tool<typeof _jiraBulkUpdateIssues> {
  use = _jiraBulkUpdateIssues;
}

export const jiraBulkUpdateIssuesTool = new JiraBulkUpdateIssuesTool();

// ==================== TYPE EXPORTS ====================

export type JiraListProjectsToolFn = typeof jiraListProjectsTool;
export type JiraGetProjectToolFn = typeof jiraGetProjectTool;
export type JiraSearchIssuesToolFn = typeof jiraSearchIssuesTool;
export type JiraGetIssueToolFn = typeof jiraGetIssueTool;
export type JiraCreateIssueToolFn = typeof jiraCreateIssueTool;
export type JiraUpdateIssueToolFn = typeof jiraUpdateIssueTool;
export type JiraTransitionIssueToolFn = typeof jiraTransitionIssueTool;
export type JiraAssignIssueToolFn = typeof jiraAssignIssueTool;
export type JiraAddCommentToolFn = typeof jiraAddCommentTool;
export type JiraGetCommentsToolFn = typeof jiraGetCommentsTool;
export type JiraSearchUsersToolFn = typeof jiraSearchUsersTool;
export type JiraGetIssueTypesToolFn = typeof jiraGetIssueTypesTool;
export type JiraGetPrioritiesToolFn = typeof jiraGetPrioritiesTool;
export type JiraCreateIssueLinkToolFn = typeof jiraCreateIssueLinkTool;
export type JiraGetWorklogsToolFn = typeof jiraGetWorklogsTool;
export type JiraAddWorklogToolFn = typeof jiraAddWorklogTool;
export type JiraBulkUpdateIssuesToolFn = typeof jiraBulkUpdateIssuesTool;
