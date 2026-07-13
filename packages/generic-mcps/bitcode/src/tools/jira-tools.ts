/**
 * Bitcode MCP Jira Tools
 * 
 * Exposes Jira project management and issue tracking capabilities through MCP tools,
 * providing comprehensive project coordination and team collaboration workflows.
 */

import { z } from 'zod';
import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';

// Import Jira tools
import {
  jiraListProjectsTool,
  jiraGetProjectTool,
  jiraSearchIssuesTool,
  jiraGetIssueTool,
  jiraCreateIssueTool,
  jiraUpdateIssueTool,
  jiraTransitionIssueTool,
  jiraAssignIssueTool,
  jiraAddCommentTool,
  jiraGetCommentsTool,
  jiraSearchUsersTool,
  jiraGetIssueTypesTool,
  jiraGetPrioritiesTool,
  jiraCreateIssueLinkTool,
  jiraGetWorklogsTool,
  jiraAddWorklogTool,
  jiraBulkUpdateIssuesTool,
} from '@bitcode/jira-tools';

// Import types
import type { MCPAuthContext } from '../types';

/**
 * MCP Tool interface
 */
interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  execute?: (args: any, context: MCPAuthContext) => Promise<any>;
}

/**
 * Execute Jira tool with authentication context
 */
async function executeJiraTool(
  toolName: string,
  tool: any,
  args: any,
  context: MCPAuthContext
): Promise<any> {
  const startTime = Date.now();
  
  try {
    logger.info(`Executing Jira tool: ${toolName}`, {
      userId: context.userId,
      args: Object.keys(args)
    });

    // Ensure user context is provided
    const toolArgs = {
      ...args,
      context: {
        user_id: context.userId,
        ...args.context
      }
    };

    // Execute the tool
    const result = await tool.execute(toolArgs);
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      logger.info(`Jira tool executed successfully: ${toolName}`, {
        userId: context.userId,
        executionTime,
        resultKeys: result.data ? Object.keys(result.data) : []
      });

      observability.recordEvent('jira_tool_executed', {
        toolName,
        userId: context.userId,
        success: true,
        executionTime
      });
    } else {
      logger.warn(`Jira tool execution failed: ${toolName}`, {
        userId: context.userId,
        executionTime,
        error: result.error
      });

      observability.recordEvent('jira_tool_executed', {
        toolName,
        userId: context.userId,
        success: false,
        executionTime,
        error: result.error
      });
    }

    return result;
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error';
    
    logger.error(`Jira tool execution error: ${toolName}`, {
      userId: context.userId,
      executionTime,
      error: errorMessage
    });

    observability.recordEvent('jira_tool_executed', {
      toolName,
      userId: context.userId,
      success: false,
      executionTime,
      error: errorMessage
    });

    return {
      success: false,
      error: errorMessage,
      executionTime
    };
  }
}

/**
 * Register all Jira MCP tools
 */
export function registerJiraTools(): MCPTool[] {
  return [
    // Project Management Tools
    {
      name: 'bitcode://jira/projects/list',
      description: `List all accessible Jira projects with metadata and health information.

Provides comprehensive project discovery including:
• Project keys, names, and descriptions
• Project types and configurations
• Component and version information
• Team assignments and permissions
• Project health metrics and insights

Supports filtering by:
• Archived status
• Recent activity
• Project type
• User permissions`,
      inputSchema: z.object({
        includeArchived: z.boolean().optional().default(false).describe('Include archived projects'),
        recent: z.boolean().optional().default(false).describe('Sort by recent activity'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraListProjects', jiraListProjectsTool, args, context)
    },

    {
      name: 'bitcode://jira/projects/get',
      description: `Get detailed information about a specific Jira project.

Retrieves comprehensive project details including:
• Project configuration and metadata
• Components and their assignments
• Versions and release information
• Workflow configurations
• Team members and permissions
• Project health and activity metrics`,
      inputSchema: z.object({
        projectKey: z.string().min(1).describe('Project key (e.g., "PROJ", "DEV")'),
        includeComponents: z.boolean().optional().default(true).describe('Include project components'),
        includeVersions: z.boolean().optional().default(true).describe('Include project versions/releases'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetProject', jiraGetProjectTool, args, context)
    },

    // Issue Search and Retrieval Tools
    {
      name: 'bitcode://jira/issues/search',
      description: `Search for Jira issues using JQL (Jira Query Language).

Powerful issue search supporting:
• Advanced JQL queries with full syntax support
• Field filtering and expansion options
• Pagination for large result sets
• Custom field inclusion and exclusion
• Changelog and comment expansion

Common JQL patterns:
• assignee = currentUser() AND resolution = Unresolved
• project = PROJ AND status = "In Progress"
• priority in (High, Highest) AND status != Done
• created >= -7d ORDER BY updated DESC`,
      inputSchema: z.object({
        jql: z.string().min(1).describe('JQL query string'),
        startAt: z.number().min(0).optional().default(0).describe('Starting index for pagination'),
        maxResults: z.number().min(1).max(1000).optional().default(50).describe('Maximum results to return'),
        fields: z.array(z.string()).optional().describe('Specific fields to include'),
        expand: z.array(z.string()).optional().describe('Additional data to expand'),
        includeChangelog: z.boolean().optional().default(false).describe('Include issue changelog'),
        includeComments: z.boolean().optional().default(false).describe('Include issue comments'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraSearchIssues', jiraSearchIssuesTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/get',
      description: `Get comprehensive information about a specific Jira issue.

Retrieves complete issue details including:
• All fields and custom fields
• Issue history and changelog
• Comments and collaboration
• Attachments and linked issues
• Workflow state and transitions
• Time tracking and estimates`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key (e.g., "PROJ-123")'),
        includeChangelog: z.boolean().optional().default(false).describe('Include issue changelog'),
        includeComments: z.boolean().optional().default(false).describe('Include comments'),
        includeAttachments: z.boolean().optional().default(false).describe('Include attachment details'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetIssue', jiraGetIssueTool, args, context)
    },

    // Issue Creation and Modification Tools
    {
      name: 'bitcode://jira/issues/create',
      description: `Create a new Jira issue with comprehensive field support.

Supports creating all issue types with:
• Required fields (project, issue type, summary)
• Optional fields (description, assignee, priority)
• Labels and components assignment
• Version targeting and due dates
• Parent issue linking for subtasks
• Custom field configuration

Best practices:
• Use clear, action-oriented summaries
• Include comprehensive descriptions with acceptance criteria
• Set appropriate priority based on business impact
• Assign to correct team member or leave unassigned`,
      inputSchema: z.object({
        projectKey: z.string().min(1).describe('Project key where issue will be created'),
        issueType: z.string().min(1).describe('Issue type (Story, Task, Bug, Epic, etc.)'),
        summary: z.string().min(1).describe('Clear, concise issue summary'),
        description: z.string().optional().describe('Detailed issue description'),
        assigneeAccountId: z.string().optional().describe('Account ID of assignee'),
        priority: z.string().optional().describe('Priority level (Highest, High, Medium, Low, Lowest)'),
        labels: z.array(z.string()).optional().describe('Issue labels for categorization'),
        components: z.array(z.string()).optional().describe('Project components'),
        parentKey: z.string().optional().describe('Parent issue key for subtasks'),
        dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraCreateIssue', jiraCreateIssueTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/update',
      description: `Update an existing Jira issue with field modifications.

Supports updating:
• Summary and description content
• Assignee and reporter changes
• Priority and component adjustments
• Label management and categorization
• Custom field modifications
• Due date and timeline updates

Maintains issue history and audit trail for all changes.`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to update'),
        summary: z.string().optional().describe('Updated summary'),
        description: z.string().optional().describe('Updated description'),
        assigneeAccountId: z.string().optional().describe('New assignee account ID (null to unassign)'),
        priority: z.string().optional().describe('New priority level'),
        labels: z.array(z.string()).optional().describe('Updated labels list'),
        components: z.array(z.string()).optional().describe('Updated components list'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraUpdateIssue', jiraUpdateIssueTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/transition',
      description: `Transition a Jira issue to a new status through workflow.

Manages workflow transitions including:
• Status changes through configured workflows
• Required field validation for transitions
• Automatic comment addition with transition
• Resolution setting for completion states
• Assignee changes during transition

Common transitions:
• "To Do" → "In Progress" (start work)
• "In Progress" → "Code Review" (ready for review)
• "Code Review" → "Done" (completed work)
• Any status → "Cancelled" (won't fix/cancelled)`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to transition'),
        statusName: z.string().min(1).describe('Target status name'),
        comment: z.string().optional().describe('Optional comment for transition'),
        resolution: z.string().optional().describe('Resolution (Fixed, Won\'t Fix, Duplicate, etc.)'),
        assigneeAccountId: z.string().optional().describe('Assignee to set during transition'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraTransitionIssue', jiraTransitionIssueTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/assign',
      description: `Assign a Jira issue to a specific user or unassign it.

Assignment management including:
• Direct user assignment by account ID
• Issue unassignment (set to null)
• Assignment validation and permissions
• Automatic notification to assignee
• Assignment history tracking

Best practices:
• Assign based on expertise and availability
• Use unassignment for team pickup
• Consider workload balance across team`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to assign'),
        accountId: z.string().nullable().describe('User account ID (null to unassign)'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraAssignIssue', jiraAssignIssueTool, args, context)
    },

    // Comment Management Tools
    {
      name: 'bitcode://jira/issues/comments/add',
      description: `Add a comment to a Jira issue with optional visibility restrictions.

Comment features:
• Rich text content with formatting support
• Mention users with @username syntax
• Visibility restrictions (public/internal)
• Attachment references and links
• Thread-based conversation support

Comment best practices:
• Provide context and rationale for decisions
• Use @mentions for specific input or notifications
• Include links to related resources
• Use formatting for clarity (lists, code blocks)`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to comment on'),
        body: z.string().min(1).describe('Comment content'),
        visibility: z.object({
          type: z.enum(['group', 'role']),
          value: z.string(),
        }).optional().describe('Visibility restrictions'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraAddComment', jiraAddCommentTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/comments/list',
      description: `Retrieve all comments for a specific Jira issue.

Provides comprehensive comment information:
• Comment content and formatting
• Author details and timestamps
• Edit history and updates
• Visibility settings and restrictions
• Thread relationships and mentions`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to get comments for'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetComments', jiraGetCommentsTool, args, context)
    },

    // User and Metadata Tools
    {
      name: 'bitcode://jira/users/search',
      description: `Search for users in the Jira instance for assignment and collaboration.

User search capabilities:
• Name and email-based search
• Active user filtering
• Role and permission information
• Account ID retrieval for assignments
• Team and group membership details

Use cases:
• Finding users for issue assignment
• Building team notification lists
• Identifying stakeholders and reviewers
• User mention suggestions`,
      inputSchema: z.object({
        query: z.string().min(1).describe('Search term for user names or emails'),
        maxResults: z.number().min(1).max(100).optional().default(20).describe('Maximum users to return'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraSearchUsers', jiraSearchUsersTool, args, context)
    },

    {
      name: 'bitcode://jira/metadata/issue-types',
      description: `Get all available issue types in the Jira instance.

Issue type information:
• Standard types (Story, Task, Bug, Epic)
• Custom issue types and configurations
• Subtask vs standard type classification
• Hierarchy levels and relationships
• Icon and visual identifiers

Essential for:
• Issue creation workflows
• Project configuration
• Workflow design
• Template generation`,
      inputSchema: z.object({}),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetIssueTypes', jiraGetIssueTypesTool, args, context)
    },

    {
      name: 'bitcode://jira/metadata/priorities',
      description: `Get all available priority levels in the Jira instance.

Priority information:
• Priority names and descriptions
• Visual indicators and colors
• Hierarchy and ordering
• Usage guidelines and criteria
• Default priority settings

Used for:
• Issue creation and updates
• Priority-based filtering and sorting
• Escalation workflows
• SLA and urgency management`,
      inputSchema: z.object({}),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetPriorities', jiraGetPrioritiesTool, args, context)
    },

    // Issue Linking Tools
    {
      name: 'bitcode://jira/issues/link',
      description: `Create a link between two Jira issues with specified relationship.

Link types and relationships:
• "Blocks" / "is blocked by" - dependency relationships
• "Relates to" - general associations
• "Duplicates" / "is duplicated by" - duplicate tracking
• "Causes" / "is caused by" - root cause analysis
• Custom link types as configured

Use cases:
• Dependency management
• Epic and story relationships
• Bug tracking and root cause analysis
• Feature breakdown and organization`,
      inputSchema: z.object({
        outwardIssue: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Source issue key'),
        inwardIssue: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Target issue key'),
        linkType: z.string().min(1).describe('Link type (Blocks, Relates, Duplicates, etc.)'),
        comment: z.string().optional().describe('Optional comment for the link'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraCreateIssueLink', jiraCreateIssueLinkTool, args, context)
    },

    // Time Tracking and Worklog Tools
    {
      name: 'bitcode://jira/issues/worklogs/list',
      description: `Retrieve all worklogs for a specific Jira issue.

Provides comprehensive time tracking information:
• Work entries with time spent and dates
• Author details and work descriptions
• Time tracking summaries and totals
• Work pattern analysis and insights
• Historical work activity tracking

Essential for:
• Project time tracking and reporting
• Team productivity analysis
• Billing and time allocation
• Work pattern identification`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to get worklogs for'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraGetWorklogs', jiraGetWorklogsTool, args, context)
    },

    {
      name: 'bitcode://jira/issues/worklogs/add',
      description: `Add a worklog entry to a Jira issue for time tracking.

Time tracking features:
• Flexible time format support (2h 30m, 1d 4h, etc.)
• Work start time specification
• Optional work descriptions and comments
• Visibility restrictions for sensitive time data
• Automatic time calculation and summation

Best practices:
• Log time promptly after work completion
• Include meaningful work descriptions
• Use consistent time formats
• Consider privacy settings for billable time`,
      inputSchema: z.object({
        issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to add worklog to'),
        timeSpent: z.string().min(1).describe('Time spent (e.g., "2h 30m", "1d 4h")'),
        started: z.string().describe('Start time in ISO 8601 format'),
        comment: z.string().optional().describe('Optional work description'),
        visibility: z.object({
          type: z.enum(['group', 'role']),
          value: z.string(),
        }).optional().describe('Visibility restrictions'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraAddWorklog', jiraAddWorklogTool, args, context)
    },

    // Bulk Operations Tools
    {
      name: 'bitcode://jira/issues/bulk-update',
      description: `Update multiple Jira issues in a single batch operation.

Bulk operation capabilities:
• Mass field updates across multiple issues
• Efficient batch processing with rate limiting
• Error handling and partial success reporting
• Progress tracking and operation summaries
• Rollback support for failed operations

Use cases:
• Sprint planning and mass assignments
• Bulk priority or component updates
• Project-wide field standardization
• Migration and cleanup operations

Supports up to 100 issues per batch for optimal performance.`,
      inputSchema: z.object({
        updates: z.array(z.object({
          issueKey: z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/).describe('Issue key to update'),
          fields: z.record(z.any()).describe('Fields to update'),
        })).min(1).max(100).describe('Array of issue updates (max 100)'),
      }),
      execute: async (args: any, context: MCPAuthContext) => 
        executeJiraTool('jiraBulkUpdateIssues', jiraBulkUpdateIssuesTool, args, context)
    },
  ];
}