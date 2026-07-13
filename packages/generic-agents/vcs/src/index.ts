
/**
 * Retained reference-only VCS automation layer for V26 fifth-gate reform.
 * This module can support VCS agents and pipeline bring-up, but it
 * is not the Bitcode owner of repository scope, Exchange state, or settlement.
 */
import { 
  factoryAgent, 
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { log } from '@bitcode/logger';
export { SYSTEM_PROMPT_VCS } from './prompts/system-prompt-vcs';
export { VCS_PLAN_PROMPT } from './prompts/plan-prompt-vcs';
export { VCS_TRY_PROMPT } from './prompts/try-prompt-vcs';
export { VCS_REFINE_PROMPT } from './prompts/refine-prompt-vcs';
export { VCS_RETRY_PROMPT } from './prompts/retry-prompt-vcs';

// ==================== SCHEMAS ====================

/**
 * Input schema for VCS operations
 */
const VCSInputSchema = z.object({
  operation: z.enum(['create-branch', 'create-pr', 'merge-pr', 'create-commit', 'sync-repo', 'get-status']).describe('VCS operation to perform'),
  provider: z.enum(['github', 'gitlab', 'bitbucket']).describe('VCS provider'),
  repository: z.object({
    owner: z.string(),
    name: z.string()
  }).describe('Repository information'),
  branch: z.string().optional().describe('Target branch name'),
  title: z.string().optional().describe('Title for PR or commit'),
  description: z.string().optional().describe('Description for PR or commit'),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    action: z.enum(['create', 'update', 'delete']).default('update')
  })).optional().describe('Files to modify'),
  baseBranch: z.string().default('main').describe('Base branch for operations')
});

/**
 * VCS operation result schema
 */
const VCSResultSchema = z.object({
  operation: z.string().describe('Completed operation'),
  success: z.boolean().describe('Operation success status'),
  result: z.object({
    url: z.string().optional(),
    id: z.string().optional(),
    sha: z.string().optional(),
    branch: z.string().optional(),
    status: z.string()
  }).describe('Operation result details'),
  metadata: z.object({
    provider: z.string(),
    repository: z.string(),
    timestamp: z.string(),
    author: z.string().optional()
  }).describe('Operation metadata'),
  changes: z.object({
    filesModified: z.number(),
    linesAdded: z.number(),
    linesDeleted: z.number()
  }).optional().describe('Change statistics'),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  processingTime: z.number().describe('Processing time in milliseconds')
});

export type VCSInput = z.infer<typeof VCSInputSchema>;
export type VCSResult = z.infer<typeof VCSResultSchema>;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Mock VCS API integration (would integrate with actual provider APIs)
 */
async function executeVCSOperation(
  operation: string,
  provider: string,
  repository: { owner: string; name: string },
  options: {
    branch?: string;
    title?: string;
    description?: string;
    files?: Array<{ path: string; content: string; action: string }>;
    baseBranch?: string;
  }
): Promise<{
  url?: string;
  id?: string;
  sha?: string;
  branch?: string;
  status: string;
}> {
  // Mock implementation - would integrate with actual VCS provider APIs
  log(`Executing ${operation} on ${provider}`, 'info', {
    repository: `${repository.owner}/${repository.name}`,
    branch: options.branch
  });
  
  const mockResults = {
    'create-branch': {
      branch: options.branch || 'feature-branch',
      sha: 'abc123def456',
      status: 'created'
    },
    'create-pr': {
      url: `https://${provider}.com/${repository.owner}/${repository.name}/pull/123`,
      id: '123',
      status: 'open'
    },
    'merge-pr': {
      sha: 'merged123abc',
      status: 'merged'
    },
    'create-commit': {
      sha: 'commit789xyz',
      status: 'committed'
    },
    'sync-repo': {
      status: 'synced'
    },
    'get-status': {
      status: 'up-to-date'
    }
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return mockResults[operation as keyof typeof mockResults] || { status: 'completed' };
}

/**
 * Calculate change statistics from file modifications
 */
function calculateChangeStats(files: Array<{ path: string; content: string; action: string }> = []): {
  filesModified: number;
  linesAdded: number;
  linesDeleted: number;
} {
  return {
    filesModified: files.length,
    linesAdded: files.reduce((sum, file) => {
      if (file.action === 'create' || file.action === 'update') {
        return sum + file.content.split('\n').length;
      }
      return sum;
    }, 0),
    linesDeleted: files.reduce((sum, file) => {
      if (file.action === 'delete') {
        return sum + file.content.split('\n').length;
      }
      return sum;
    }, 0)
  };
}

/**
 * Validate repository access and permissions
 */
async function validateRepositoryAccess(
  provider: string,
  repository: { owner: string; name: string }
): Promise<{ hasAccess: boolean; permissions: string[] }> {
  // Mock validation - would check actual permissions
  return {
    hasAccess: true,
    permissions: ['read', 'write', 'admin']
  };
}

// ==================== PTRR STEP IMPLEMENTATIONS ====================

/**
 * PLAN: Validate operation parameters and prepare execution strategy
 */
async function planVCSOperation(input: VCSInput): Promise<{
  validatedInput: VCSInput;
  strategy: string;
  requiredPermissions: string[];
  estimatedTime: number;
}> {
  log('Planning VCS operation', 'info', {
    operation: input.operation,
    provider: input.provider,
    repository: `${input.repository.owner}/${input.repository.name}`
  });
  
  try {
    const repository = {
      owner: input.repository.owner ?? '',
      name: input.repository.name ?? '',
    };

    // Validate repository access
    const access = await validateRepositoryAccess(input.provider, repository);
    
    if (!access.hasAccess) {
      throw new Error(`No access to repository ${repository.owner}/${repository.name}`);
    }
    
    // Determine execution strategy
    const strategies = {
      'create-branch': 'Create new branch from base branch with validation',
      'create-pr': 'Create pull request with file changes and metadata',
      'merge-pr': 'Merge pull request with conflict resolution',
      'create-commit': 'Create commit with file modifications',
      'sync-repo': 'Synchronize repository with upstream changes',
      'get-status': 'Retrieve current repository status and metadata'
    };
    
    const strategy = strategies[input.operation] || 'Generic VCS operation execution';
    
    // Determine required permissions
    const permissionMap = {
      'create-branch': ['write'],
      'create-pr': ['write'],
      'merge-pr': ['write', 'admin'],
      'create-commit': ['write'],
      'sync-repo': ['write'],
      'get-status': ['read']
    };
    
    const requiredPermissions = permissionMap[input.operation] || ['read'];
    
    // Estimate execution time
    const timeEstimates = {
      'create-branch': 2000,
      'create-pr': 5000,
      'merge-pr': 8000,
      'create-commit': 3000,
      'sync-repo': 10000,
      'get-status': 1000
    };
    
    const estimatedTime = timeEstimates[input.operation] || 3000;
    
    return {
      validatedInput: input,
      strategy,
      requiredPermissions,
      estimatedTime
    };
    
  } catch (error) {
    log('VCS operation planning failed', 'error', { error });
    throw error;
  }
}

/**
 * TRY: Execute the VCS operation with provider API
 */
async function tryVCSOperation(
  planResult: { validatedInput: VCSInput; strategy: string; requiredPermissions: string[]; estimatedTime: number },
  input: VCSInput
): Promise<VCSResult> {
  log('Executing VCS operation', 'info', {
    operation: input.operation,
    strategy: planResult.strategy,
    estimatedTime: planResult.estimatedTime
  });
  
  const startTime = Date.now();
  
  try {
    const repository = {
      owner: input.repository.owner ?? '',
      name: input.repository.name ?? '',
    };
    const files = input.files?.map((file) => ({
      path: file.path ?? '',
      content: file.content ?? '',
      action: file.action ?? 'update',
    }));

    // Execute the VCS operation
    const operationResult = await executeVCSOperation(
      input.operation,
      input.provider,
      repository,
      {
        branch: input.branch,
        title: input.title,
        description: input.description,
        files,
        baseBranch: input.baseBranch
      }
    );
    
    // Calculate change statistics if files were modified
    const changes = files ? calculateChangeStats(files) : undefined;
    
    const processingTime = Date.now() - startTime;
    
    const result = {
      operation: input.operation,
      success: true,
      result: operationResult,
      metadata: {
        provider: input.provider,
        repository: `${repository.owner}/${repository.name}`,
        timestamp: new Date().toISOString(),
        author: 'system' // Would be actual user in real implementation
      },
      changes,
      processingTime
    };
    
    log('VCS operation completed', 'info', {
      operation: input.operation,
      success: true,
      processingTime,
      resultStatus: operationResult.status
    });
    
    return result;
    
  } catch (error) {
    log('VCS operation execution failed', 'error', { error });
    throw error;
  }
}

/**
 * REFINE: Validate operation results and handle any issues
 */
async function refineVCSResult(
  vcsResult: VCSResult
): Promise<VCSResult> {
  log('Refining VCS operation result', 'info', {
    operation: vcsResult.operation,
    success: vcsResult.success,
    status: vcsResult.result.status
  });
  
  try {
    // Validate result consistency
    const validationIssues: string[] = [];
    
    // Check for common issues based on operation type
    if (vcsResult.operation === 'create-pr' && !vcsResult.result.url) {
      validationIssues.push('Pull request created but URL not available');
    }
    
    if (vcsResult.operation === 'create-commit' && !vcsResult.result.sha) {
      validationIssues.push('Commit created but SHA not available');
    }
    
    if (vcsResult.changes && vcsResult.changes.filesModified === 0 && ['create-commit', 'create-pr'].includes(vcsResult.operation)) {
      validationIssues.push('No files were modified in operation');
    }
    
    // Enhance result with validation status
    const refinedResult = {
      ...vcsResult,
      result: {
        ...vcsResult.result,
        validated: validationIssues.length === 0,
        issues: validationIssues
      }
    };
    
    log('VCS result refined', 'info', {
      operation: vcsResult.operation,
      validated: validationIssues.length === 0,
      issuesFound: validationIssues.length
    });
    
    return refinedResult;
    
  } catch (error) {
    log('VCS result refinement failed', 'error', { error });
    throw error;
  }
}

/**
 * RETRY: Finalize VCS operation with comprehensive status
 */
async function retryVCSFinalization(
  refinedResult: VCSResult,
  input: VCSInput
): Promise<VCSResult> {
  log('Finalizing VCS operation', 'info', {
    operation: refinedResult.operation,
    success: refinedResult.success
  });
  
  try {
    // Add final operation summary
    const summary = {
      operation: refinedResult.operation,
      provider: refinedResult.metadata.provider,
      repository: refinedResult.metadata.repository,
      success: refinedResult.success,
      completedAt: new Date().toISOString(),
      processingTime: refinedResult.processingTime
    };
    
    // Add operation-specific insights
    const insights: string[] = [];
    
    if (refinedResult.operation === 'create-pr' && refinedResult.result.url) {
      insights.push(`Pull request created successfully: ${refinedResult.result.url}`);
    }
    
    if (refinedResult.changes) {
      insights.push(`Modified ${refinedResult.changes.filesModified} files (+${refinedResult.changes.linesAdded} -${refinedResult.changes.linesDeleted} lines)`);
    }
    
    if (refinedResult.processingTime > 10000) {
      insights.push('Operation took longer than expected - consider optimizing');
    } else {
      insights.push('Operation completed efficiently');
    }
    
    // Final result with summary and insights
    const finalResult = {
      ...refinedResult,
      metadata: {
        ...refinedResult.metadata,
        summary,
        insights
      }
    };
    
    log('VCS operation finalized', 'info', {
      operation: finalResult.operation,
      success: finalResult.success,
      insights: insights.length
    });
    
    return finalResult;
    
  } catch (error) {
    log('VCS operation finalization failed', 'error', { error });
    throw error;
  }
}

// ==================== PROMPTS ====================

export const vcsPrompt = new AgentPrompt({
  name: 'vcs' as PromptPart,
  identity: 'Version control specialist' as PromptPart
});

export const vcsStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze requirements' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute operation' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance results' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete processing' as PromptPart })
};

// ==================== AGENT IMPLEMENTATION ====================

/**
 * Comprehensive VCS Agent using full PTRR cycle
 */
export const vcsComprehensiveAgent = factoryPTRRAgent<any, any>({
  name: 'comprehensive-vcs',
  description: 'Complete VCS operation with validation and status tracking',
  prompt: vcsPrompt,
  stepPrompts: {
    plan: () => vcsStepPrompts.plan,
    try: () => vcsStepPrompts.try,
    refine: () => vcsStepPrompts.refine,
    retry: () => vcsStepPrompts.retry
  },
  outputSchema: VCSResultSchema as any,
  plan: { chunkThreshold: 500 },
  try: { chunkThreshold: 1500, enableParallelChunks: false },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1, backoff: 1000 }
});

/**
 * Quick VCS Agent for simple operations
 */
export const vcsQuickAgent = factoryAgentWithSingleStep<VCSInput, VCSResult>({
  name: 'quick-vcs',
  description: 'Fast VCS operation for simple tasks',
  execute: async (input, execution) => {
    // Simple VCS operation without full PTRR
    const plan = await planVCSOperation(input);
    const result = await tryVCSOperation(plan, input);
    
    // Return basic result format
    return {
      ...result,
      metadata: {
        ...result.metadata,
        summary: {
          operation: result.operation,
          success: result.success,
          mode: 'quick'
        },
        insights: ['Quick VCS operation completed - use comprehensive mode for detailed validation']
      }
    };
  }
});

/**
 * VCS Agent - registry-friendly canonical default.
 * Direct callers can choose vcsComprehensiveAgent or vcsQuickAgent when they
 * read a specific execution profile.
 */
export const vcsAgent = vcsComprehensiveAgent;

/**
 * Helper to select appropriate VCS agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectVCSAgent(input: VCSInput): string {
  // Use comprehensive VCS for complex operations or when files are involved
  const needsComprehensive = ['merge-pr', 'sync-repo'].includes(input.operation) ||
                            (input.files && input.files.length > 0) ||
                            input.operation === 'create-pr';
  
  return needsComprehensive ? 'vcs:comprehensive' : 'vcs:quick';
}
