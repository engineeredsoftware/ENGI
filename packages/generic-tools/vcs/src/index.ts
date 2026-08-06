/**
 * VCS-based tools using the unified VCS abstraction layer
 * 
 * These tools provide git operations through the VCS provider pattern,
 * supporting GitHub, GitLab, and Bitbucket with consistent interfaces.
 */

import { Tool } from '@bitcode/tools-generics';
import { z } from 'zod';
import { VCSProviderFactory, VCSConnections, type VCSAuth, type VCSConfig, type VCSProviderType } from '@bitcode/vcs-generics';
import { supabaseAdmin } from '@bitcode/supabase';
// Utility functions for retry and timeout logic
const withTimeout = async <T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn().then(resolve).catch(reject).finally(() => clearTimeout(timeout));
  });
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  options: { maxAttempts: number; delayMs: number; shouldRetry?: (error: Error) => boolean }
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === options.maxAttempts) {
        break;
      }

      if (options.shouldRetry && !options.shouldRetry(lastError)) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, options.delayMs));
    }
  }

  throw lastError!;
};
import {
  LIST_REPOSITORIES_DOC_CODE_TOOL_PROMPT,
  CREATE_PULL_REQUEST_DOC_CODE_TOOL_PROMPT,
  CREATE_OR_UPDATE_FILE_DOC_CODE_TOOL_PROMPT,
  CREATE_ISSUE_DOC_CODE_TOOL_PROMPT,
  CREATE_COMMENT_DOC_CODE_TOOL_PROMPT,
  LIST_BRANCHES_DOC_CODE_TOOL_PROMPT,
  GET_FILE_CONTENT_DOC_CODE_TOOL_PROMPT
} from './prompts';
type VcsInputBase = {
  provider?: VCSProviderType;
  connectionId?: string;
  userId?: string;
};

type ResolvedConnectionContext = {
  auth: VCSAuth;
  instanceUrl?: string;
};

async function createConnectionManager() {
  return new VCSConnections(supabaseAdmin);
}

async function resolveConnectionContext(input: VcsInputBase): Promise<ResolvedConnectionContext> {
  if (!input.provider) {
    throw new Error('VCS provider is required');
  }

  const environmentAuth = resolveEnvironmentAuth(input.provider);
  if (environmentAuth) {
    return { auth: environmentAuth };
  }

  const connectionManager = await createConnectionManager();
  let auth: VCSAuth | null = null;
  let instanceUrl: string | undefined;

  if (input.connectionId) {
    auth = await connectionManager.getAuthFromConnection(input.connectionId);
  }

  if (input.userId) {
    const connection = await connectionManager.getConnection(input.userId, input.provider);
    if (connection) {
      instanceUrl = connection.connectionData?.instance_url as string | undefined;
      auth ??= await connectionManager.getAuthFromConnection(connection.id);
    }
  }

  if (!auth) {
    throw new Error(`No ${input.provider} connection found`);
  }

  return { auth, instanceUrl };
}

function resolveEnvironmentAuth(provider: VCSProviderType): VCSAuth | null {
  if (process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK !== '1') return null;
  if (provider !== 'github') return null;

  const accessToken =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GH_TOKEN;

  return accessToken ? { provider, accessToken } : null;
}

function buildProviderConfig(
  provider: VCSProviderType,
  instanceUrl?: string,
): VCSConfig {
  const envPrefix = provider.toUpperCase();
  return {
    provider,
    clientId: process.env[`${envPrefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`] || '',
    redirectUri: process.env[`${envPrefix}_REDIRECT_URI`] || '',
    instanceUrl,
  };
}

async function createProvider(provider: VCSProviderType, instanceUrl?: string) {
  return VCSProviderFactory.create(buildProviderConfig(provider, instanceUrl));
}

/**
 * Base schema for VCS operations
 */
const vcsBaseSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket']).describe('VCS provider'),
  connectionId: z.string().optional().describe('VCS connection ID'),
  userId: z.string().optional().describe('User ID (used if connectionId not provided)'),
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name')
});

/**
 * @doc-code-tool
 * @prompt LIST_REPOSITORIES_DOC_CODE_TOOL_PROMPT
 */
class ListRepositoriesTool extends Tool<any> {
  name = 'vcs_list_repositories';
  description = 'List repositories from a VCS provider with unified interface';
  
  inputSchema = z.object({
    provider: z.enum(['github', 'gitlab', 'bitbucket']).describe('VCS provider'),
    connectionId: z.string().optional().describe('VCS connection ID'),
    userId: z.string().optional().describe('User ID'),
    page: z.number().optional().describe('Page number'),
    perPage: z.number().optional().describe('Items per page'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
    direction: z.enum(['asc', 'desc']).optional()
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    return withTimeout(
      () => vcsProvider.listRepositories(auth, {
        page: input.page,
        perPage: input.perPage,
        sort: input.sort,
        direction: input.direction
      }),
      30000
    );
  };
}

export const listRepositoriesTool = new ListRepositoriesTool();

/**
 * @doc-code-tool
 * @prompt CREATE_PULL_REQUEST_DOC_CODE_TOOL_PROMPT
 */
class CreatePullRequestTool extends Tool<any> {
  name = 'vcs_create_pull_request';
  description = 'Create a pull request through unified VCS interface';
  
  inputSchema = vcsBaseSchema.extend({
    title: z.string().describe('Pull request title'),
    description: z.string().optional().describe('Pull request description'),
    sourceBranch: z.string().describe('Source branch'),
    targetBranch: z.string().describe('Target branch'),
    draft: z.boolean().optional().describe('Create as draft PR')
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    return withRetry(
      () => vcsProvider.createPullRequest(auth, input.owner, input.repo, {
        title: input.title,
        description: input.description,
        sourceBranch: input.sourceBranch,
        targetBranch: input.targetBranch,
        draft: input.draft
      }),
      {
        maxAttempts: 3,
        delayMs: 1000,
        shouldRetry: (error) => {
          const message = error.message.toLowerCase();
          return message.includes('network') || message.includes('timeout');
        }
      }
    );
  };
}

export const createPullRequestTool = new CreatePullRequestTool();

class CreateBranchTool extends Tool<any> {
  name = 'vcs_create_branch';
  description = 'Create a branch in a repository through unified VCS interface';

  inputSchema = vcsBaseSchema.extend({
    branch: z.string().describe('Branch name to create'),
    from: z.string().describe('Base branch or commit SHA for the new branch'),
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    if (!vcsProvider.createBranch) {
      throw new Error(`Branch creation not supported by ${input.provider}`);
    }

    return withRetry(
      () => vcsProvider.createBranch!(auth, input.owner, input.repo, input.branch, input.from),
      {
        maxAttempts: 3,
        delayMs: 1000,
        shouldRetry: (error) => {
          const message = error.message.toLowerCase();
          return message.includes('network') || message.includes('timeout');
        },
      }
    );
  };
}

export const createBranchTool = new CreateBranchTool();

/**
 * @doc-code-tool
 * @prompt CREATE_OR_UPDATE_FILE_DOC_CODE_TOOL_PROMPT
 */
class CreateOrUpdateFileTool extends Tool<any> {
  name = 'vcs_create_or_update_file';
  description = 'Create or update a file in a repository through unified VCS interface';
  
  inputSchema = vcsBaseSchema.extend({
    path: z.string().describe('File path'),
    content: z.string().describe('File content'),
    message: z.string().describe('Commit message'),
    branch: z.string().optional().describe('Target branch'),
    sha: z.string().optional().describe('Current file SHA (for updates)')
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    return withRetry(
      () => vcsProvider.createOrUpdateFile(auth, input.owner, input.repo, input.path, {
        content: input.content,
        message: input.message,
        branch: input.branch,
        sha: input.sha
      }),
      {
        maxAttempts: 3,
        delayMs: 1000
      }
    );
  };
}

export const createOrUpdateFileTool = new CreateOrUpdateFileTool();

/**
 * @doc-code-tool
 * @prompt CREATE_ISSUE_DOC_CODE_TOOL_PROMPT
 */
class CreateIssueTool extends Tool<any> {
  name = 'vcs_create_issue';
  description = 'Create an issue through unified VCS interface';
  
  inputSchema = vcsBaseSchema.extend({
    title: z.string().describe('Issue title'),
    body: z.string().optional().describe('Issue body'),
    labels: z.array(z.string()).optional().describe('Issue labels'),
    assignees: z.array(z.string()).optional().describe('Assignees'),
    milestone: z.string().optional().describe('Milestone')
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    if (!vcsProvider.createIssue) {
      throw new Error(`Issue creation not supported by ${input.provider}`);
    }
    
    return vcsProvider.createIssue(auth, input.owner, input.repo, {
      title: input.title,
      body: input.body,
      labels: input.labels,
      assignees: input.assignees,
      milestone: input.milestone ? Number(input.milestone) : undefined
    });
  };
}

export const createIssueTool = new CreateIssueTool();

/**
 * @doc-code-tool
 * @prompt CREATE_COMMENT_DOC_CODE_TOOL_PROMPT
 */
class CreateCommentTool extends Tool<any> {
  name = 'vcs_create_comment';
  description = 'Create a comment on an issue or pull request through unified VCS interface';
  
  inputSchema = vcsBaseSchema.extend({
    type: z.enum(['issue', 'pr']).describe('Comment target type'),
    number: z.number().describe('Issue or PR number'),
    body: z.string().describe('Comment body')
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);

    if (input.type === 'issue' && vcsProvider.createIssueComment) {
      return vcsProvider.createIssueComment(
        auth,
        input.owner,
        input.repo,
        input.number,
        input.body
      );
    } else if (input.type === 'pr' && vcsProvider.createPullRequestComment) {
      return vcsProvider.createPullRequestComment(
        auth,
        input.owner,
        input.repo,
        input.number,
        input.body
      );
    }
    
    throw new Error(`${input.type} comments not supported by ${input.provider}`);
  };
}

export const createCommentTool = new CreateCommentTool();

/**
 * @doc-code-tool
 * @prompt LIST_BRANCHES_DOC_CODE_TOOL_PROMPT
 */
class ListBranchesTool extends Tool<any> {
  name = 'vcs_list_branches';
  description = 'List branches in a repository through unified VCS interface';
  
  inputSchema = vcsBaseSchema;

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);
    return vcsProvider.listBranches(auth, input.owner, input.repo);
  };
}

export const listBranchesTool = new ListBranchesTool();

/**
 * @doc-code-tool
 * @prompt GET_FILE_CONTENT_DOC_CODE_TOOL_PROMPT
 */
class GetFileContentTool extends Tool<any> {
  name = 'vcs_get_file_content';
  description = 'Get file content from a repository through unified VCS interface';
  
  inputSchema = vcsBaseSchema.extend({
    path: z.string().describe('File path'),
    ref: z.string().optional().describe('Branch, tag, or commit SHA')
  });

  use = async (input: z.infer<typeof this.inputSchema>) => {
    const { auth, instanceUrl } = await resolveConnectionContext(input);
    const vcsProvider = await createProvider(input.provider, instanceUrl);
    const file = await vcsProvider.getFileContent(auth, input.owner, input.repo, input.path, input.ref);
    
    // Decode base64 content if present
    if (file.content && file.encoding === 'base64') {
      return {
        ...file,
        decodedContent: Buffer.from(file.content, 'base64').toString('utf-8'),
      };
    }
    
    return file;
  };
}

export const getFileContentTool = new GetFileContentTool();

/**
 * Export all VCS tools
 */
export const vcsTools = [
  listRepositoriesTool,
  createBranchTool,
  createPullRequestTool,
  createOrUpdateFileTool,
  createIssueTool,
  createCommentTool,
  listBranchesTool,
  getFileContentTool
];
