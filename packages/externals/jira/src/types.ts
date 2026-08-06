import { z } from 'zod';

/**
 * Jira API Authentication Configuration
 */
export interface JiraAuthConfig {
  baseUrl: string;
  email?: string;
  apiToken?: string;
  accessToken?: string;
  cloudId?: string;
}

/**
 * Jira OAuth Data from token exchange
 */
export interface JiraOAuthData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope: string;
  token_type: string;
}

/**
 * Jira User Account Information
 */
export interface JiraUser {
  accountId: string;
  accountType: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  timeZone: string;
  locale: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
}

/**
 * Jira Connection stored in database
 */
export interface JiraConnection {
  id: string;
  user_id: string;
  base_url: string;
  cloud_id?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  email?: string;
  api_token?: string;
  account_id: string;
  display_name: string;
  email_address: string;
  auth_type: 'oauth' | 'api_token';
  created_at: string;
  updated_at: string;
}

/**
 * Jira Project Information
 */
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  lead?: JiraUser;
  description?: string;
  url: string;
  avatarUrls: Record<string, string>;
  projectCategory?: {
    id: string;
    name: string;
    description: string;
  };
  insight?: {
    totalIssueCount: number;
    lastIssueUpdateTime: string;
  };
}

/**
 * Jira Issue Type
 */
export interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  subtask: boolean;
  avatarId?: number;
  hierarchyLevel: number;
}

/**
 * Jira Issue Status
 */
export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  statusCategory: {
    id: number;
    key: string;
    colorName: string;
    name: string;
  };
}

/**
 * Jira Issue Priority
 */
export interface JiraPriority {
  id: string;
  name: string;
  description?: string;
  iconUrl: string;
}

/**
 * Jira Issue Resolution
 */
export interface JiraResolution {
  id: string;
  name: string;
  description: string;
}

/**
 * Jira Issue Fields
 */
export interface JiraIssueFields {
  summary: string;
  description?: any; // ADF (Atlassian Document Format) or string
  issuetype: JiraIssueType;
  project: Pick<JiraProject, 'id' | 'key' | 'name'>;
  priority?: JiraPriority;
  status: JiraStatus;
  resolution?: JiraResolution;
  assignee?: JiraUser;
  reporter?: JiraUser;
  creator?: JiraUser;
  created: string;
  updated: string;
  resolutiondate?: string;
  duedate?: string;
  labels: string[];
  components: JiraComponent[];
  fixVersions: JiraVersion[];
  affectedVersions: JiraVersion[];
  parent?: Pick<JiraIssue, 'id' | 'key' | 'fields'>;
  subtasks: Array<Pick<JiraIssue, 'id' | 'key' | 'fields'>>;
  issuelinks: JiraIssueLink[];
  attachment: JiraAttachment[];
  comment?: {
    comments: JiraComment[];
    maxResults: number;
    total: number;
    startAt: number;
  };
  votes?: {
    votes: number;
    hasVoted: boolean;
  };
  watches?: {
    watchCount: number;
    isWatching: boolean;
  };
  worklog?: {
    worklogs: JiraWorklog[];
    maxResults: number;
    total: number;
    startAt: number;
  };
  timetracking?: {
    originalEstimate?: string;
    remainingEstimate?: string;
    timeSpent?: string;
    originalEstimateSeconds?: number;
    remainingEstimateSeconds?: number;
    timeSpentSeconds?: number;
  };
  [key: string]: any; // Custom fields
}

/**
 * Jira Issue
 */
export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
  expand?: string;
  changelog?: {
    histories: JiraChangelogItem[];
  };
}

/**
 * Jira Comment
 */
export interface JiraComment {
  id: string;
  self: string;
  author: JiraUser;
  body: any; // ADF format
  updateAuthor: JiraUser;
  created: string;
  updated: string;
  visibility?: {
    type: string;
    value: string;
  };
}

/**
 * Jira Attachment
 */
export interface JiraAttachment {
  id: string;
  self: string;
  filename: string;
  author: JiraUser;
  created: string;
  size: number;
  mimeType: string;
  content: string;
  thumbnail?: string;
}

/**
 * Jira Component
 */
export interface JiraComponent {
  id: string;
  name: string;
  description?: string;
  lead?: JiraUser;
  assigneeType: string;
  realAssigneeType: string;
  isAssigneeTypeValid: boolean;
  project: string;
  projectId: number;
}

/**
 * Jira Version (Release)
 */
export interface JiraVersion {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  released: boolean;
  startDate?: string;
  releaseDate?: string;
  overdue?: boolean;
  userStartDate?: string;
  userReleaseDate?: string;
  project: string;
  projectId: number;
}

/**
 * Jira Issue Link
 */
export interface JiraIssueLink {
  id: string;
  type: {
    id: string;
    name: string;
    inward: string;
    outward: string;
  };
  inwardIssue?: Pick<JiraIssue, 'id' | 'key' | 'fields'>;
  outwardIssue?: Pick<JiraIssue, 'id' | 'key' | 'fields'>;
}

/**
 * Jira Worklog Entry
 */
export interface JiraWorklog {
  id: string;
  self: string;
  author: JiraUser;
  updateAuthor: JiraUser;
  comment?: any; // ADF format
  created: string;
  updated: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  issueId: string;
}

/**
 * Jira Changelog Item
 */
export interface JiraChangelogItem {
  id: string;
  author: JiraUser;
  created: string;
  items: Array<{
    field: string;
    fieldtype: string;
    fieldId?: string;
    from?: string;
    fromString?: string;
    to?: string;
    toString?: string;
  }>;
}

/**
 * Jira Transition
 */
export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  fields?: Record<string, any>;
}

/**
 * Jira Search Results
 */
export interface JiraSearchResults {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
  warningMessages?: string[];
}

/**
 * Jira Accessible Resources (for OAuth)
 */
export interface JiraAccessibleResource {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

/**
 * Jira Create Issue Request
 */
export interface JiraCreateIssueRequest {
  fields: {
    project: { key: string } | { id: string };
    issuetype: { name: string } | { id: string };
    summary: string;
    description?: any; // ADF or string
    assignee?: { accountId: string };
    reporter?: { accountId: string };
    priority?: { name: string } | { id: string };
    labels?: string[];
    components?: Array<{ name: string } | { id: string }>;
    fixVersions?: Array<{ name: string } | { id: string }>;
    parent?: { key: string } | { id: string };
    duedate?: string;
    [key: string]: any; // Custom fields
  };
}

/**
 * Jira Update Issue Request
 */
export interface JiraUpdateIssueRequest {
  fields?: Partial<JiraIssueFields>;
  update?: Record<string, Array<{ set?: any; add?: any; remove?: any; edit?: any }>>;
}

// Zod schemas for validation
export const JiraAuthConfigSchema = z.object({
  baseUrl: z.string().url('Invalid Jira base URL'),
  email: z.string().email().optional(),
  apiToken: z.string().optional(),
  accessToken: z.string().optional(),
  cloudId: z.string().optional(),
}).refine(
  (data) => (data.email && data.apiToken) || data.accessToken,
  {
    message: 'Either email+apiToken or accessToken must be provided',
    path: ['auth'],
  }
);

export const JiraProjectKeySchema = z.string().min(1, 'Project key is required');

export const JiraIssueKeySchema = z.string().regex(
  /^[A-Z][A-Z0-9]*-\d+$/,
  'Invalid Jira issue key format'
);

export const JiraJQLSchema = z.string().min(1, 'JQL query is required');

export const JiraCreateIssueSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  issueType: z.string().min(1, 'Issue type is required'),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().optional(),
  assigneeAccountId: z.string().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  parentKey: z.string().optional(),
  dueDate: z.string().optional(),
});

export const JiraUpdateIssueSchema = z.object({
  summary: z.string().optional(),
  description: z.string().optional(),
  assigneeAccountId: z.string().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
});

export const JiraTransitionIssueSchema = z.object({
  transitionId: z.string().min(1, 'Transition ID is required'),
  comment: z.string().optional(),
  resolution: z.string().optional(),
  fields: z.record(z.any()).optional(),
});

export const JiraAddCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required'),
  visibility: z.object({
    type: z.enum(['group', 'role']),
    value: z.string(),
  }).optional(),
});

export const JiraSearchSchema = z.object({
  jql: JiraJQLSchema,
  startAt: z.number().min(0).optional().default(0),
  maxResults: z.number().min(1).max(1000).optional().default(50),
  fields: z.array(z.string()).optional(),
  expand: z.array(z.string()).optional(),
});

export const JiraAddWorklogSchema = z.object({
  comment: z.string().optional().describe('Optional comment for the worklog'),
  started: z.string().describe('Start time in ISO 8601 format'),
  timeSpent: z.string().describe('Time spent (e.g., "2h 30m", "1d 4h")'),
  visibility: z.object({
    type: z.enum(['group', 'role']),
    value: z.string(),
  }).optional().describe('Visibility restrictions'),
});

export const JiraUpdateWorklogSchema = z.object({
  comment: z.string().optional().describe('Updated comment for the worklog'),
  started: z.string().optional().describe('Updated start time in ISO 8601 format'),
  timeSpent: z.string().optional().describe('Updated time spent'),
});

export const JiraBulkUpdateSchema = z.object({
  issueKeys: z.array(JiraIssueKeySchema).min(1).max(1000).describe('Issue keys to update'),
  operation: z.enum(['update', 'transition', 'assign']).describe('Type of bulk operation'),
  data: z.record(z.any()).describe('Operation-specific data'),
});