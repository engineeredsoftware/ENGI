/**
 * Bitcode MCP Server Type System
 *
 * Comprehensive type definitions for the Model Context Protocol server
 * that exposes one Bitcode Exchange interface surface.
 */

import { z } from 'zod';

export type PipelinePhase =
  | 'setup'
  | 'discovery'
  | 'implementation'
  | 'validation'
  | 'finish';
export type PipelineSubType = string;
export type ShippableSubType = string;
export type InterfaceIngressSurface =
  | 'bitcode_mcp'
  | 'third_party_mcp'
  | 'rest_api'
  | 'terminal'
  | 'conversation';

// Supported pipeline names exposed via MCP (align with supported pipelines only)
export const PipelineNameValues = ['asset-pack'] as const;
export type PipelineName = typeof PipelineNameValues[number];

// ============================================================================
// Core MCP Server Types
// ============================================================================

/**
 * Authentication context for MCP requests
 */
export interface MCPAuthContext {
  userId: string;
  organizationId?: string;
  organizationRole?: 'viewer' | 'member' | 'admin' | 'owner';
  permissions: {
    pipelines: {
      create: boolean;
      read: boolean;
      cancel: boolean;
      retry: boolean;
    };
    organization: {
      manageMembers: boolean;
      viewAnalytics: boolean;
      manageBtdHoldings: boolean;
    };
    resources: {
      read: boolean;
      export: boolean;
    };
  };
  email?: string;
  fullName?: string;
  apiKeyId?: string;
  apiKeyName?: string;
  scopes?: string[];
  organizationName?: string;
  organizationSlug?: string;
  organizationPermissions?: Record<string, any>;
  walletId?: string;
  btdReadAccess?: Array<{
    assetPackId: string;
    walletId: string;
    decision: 'owner_read' | 'licensed_read' | 'denied';
    reason: string;
    accessPolicyHash: string;
  }>;
  interfaceAuthority?: Array<{
    interfaceSurface: 'mcp';
    action: string;
    decision: 'allowed' | 'denied';
    reason: string;
    authorityRoot: string;
    sourceVisibility: string;
  }>;
  btdBalance: number;
  mcpCredentials: Record<string, any>;
}

/**
 * Repository/provider connection context supplied as pipeline input.
 */
export const RepositoryContextSchema = z.object({
  owner: z.string().optional().describe('Repository owner (user or organization) - not needed for local repos'),
  name: z.string().describe('Repository name or local directory name'),
  branch: z.string().optional().default('main').describe('Git branch to work on'),
  path: z.string().optional().describe('Local file system path (e.g., /Users/garrettmaring/Developer/Bitcode)'),
  url: z.string().optional().describe('Optional canonical repository URL or local file URI'),
  connectionId: z.number().optional().describe('GitHub App installation ID'),
  provider: z.enum(['github', 'gitlab', 'bitbucket', 'local']).optional().default('github')
    .describe('Repository provider - use "local" for local directories'),
  metadata: z.record(z.any()).optional().describe('Optional repository metadata admitted through app/MCP ingress')
}).refine((data) => {
  // For local provider, path is required and owner is not needed
  if (data.provider === 'local') {
    return !!data.path;
  }
  // For remote providers, owner is required
  return !!data.owner;
}, {
  message: "Local repositories require 'path', remote repositories require 'owner'"
});

export type RepositoryContext = z.infer<typeof RepositoryContextSchema>;

/**
 * Attachment context supplied as pipeline input.
 */
export const AttachmentSchema = z.object({
  type: z.enum(['image', 'document', 'audio', 'video', 'url', 'figma', 'file'])
    .describe('Type of attachment for specialized processing'),
  content: z.string().describe('Attachment content (URL, file path, or encoded data)'),
  metadata: z.record(z.any()).optional().describe('Additional metadata for processing')
});

export type Attachment = z.infer<typeof AttachmentSchema>;

/**
 * Connection-style input context for an execution.
 * Distinguishes provider/repository ingress from output artifacts.
 */
export interface PipelineConnectionInput {
  kind: 'repository_connection';
  provider: string;
  connectionId?: number;
  owner?: string;
  name?: string;
  branch?: string;
  path?: string;
}

export const PipelineConnectionInputSchema = z.object({
  kind: z.literal('repository_connection'),
  provider: z.string().describe('Connected repository provider'),
  connectionId: z.number().optional().describe('Provider connection identifier'),
  owner: z.string().optional().describe('Repository owner for remote providers'),
  name: z.string().optional().describe('Repository name or local directory name'),
  branch: z.string().optional().describe('Repository branch'),
  path: z.string().optional().describe('Local repository path when applicable'),
});

/**
 * Inbound interface context for pipeline execution.
 * Attachments and connections are inputs, not outputs.
 */
export interface PipelineInputContext {
  ingress: InterfaceIngressSurface;
  repository?: RepositoryContext;
  attachments?: Attachment[];
  connections?: PipelineConnectionInput[];
  mcpConfig?: Record<string, any>;
}

/**
 * Canonical output meaning for AssetPack/Shippable results.
 */
export interface AssetPackResult {
  kind: 'asset_pack';
  type: string;
  url?: string;
  content?: string;
  metadata?: any;
}

/**
 * Pipeline execution status
 */
export enum PipelineStatus {
  PENDING = 'pending',
  RUNNING = 'running', 
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Pipeline execution result
 */
export interface PipelineExecutionResult {
  pipelineId: string;
  status: PipelineStatus;
  pipeline: PipelineName;
  subtype?: PipelineSubType;
  task: string;
  repository: RepositoryContext;
  interfaceSurface?: InterfaceIngressSurface;
  inputContext?: PipelineInputContext;
  
  // Execution metadata
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // Results and outputs
  results?: any;
  assetPacks?: AssetPackResult[];
  
  // Performance metrics
  metrics: {
    measuredBtd: number;
    tokensProcessed: number;
    confidence: number;
    phases: Record<PipelinePhase, {
      duration: number;
      success: boolean;
      confidence: number;
    }>;
  };
  
  // Error information
  error?: {
    message: string;
    phase?: PipelinePhase;
    agent?: string;
    step?: string;
    recovery?: boolean;
  };
  
  // Streaming support
  streamUrl?: string;
}

/**
 * Real-time pipeline event for streaming
 */
export interface PipelineStreamEvent {
  type:
    | 'phase'
    | 'agent'
    | 'step'
    | 'tool'
    | 'completion'
    | 'error'
    | 'phase_start'
    | 'phase_complete'
    | 'agent_start'
    | 'agent_complete'
    | 'step_start'
    | 'step_complete'
    | 'tool_execution'
    | 'progress_update'
    | 'cancellation';
  timestamp: string;
  pipelineId: string;
  
  // Context information
  phase?: PipelinePhase;
  agent?: string;
  step?: string;
  tool?: string;
  
  // Event data
  data: {
    progress: number;        // 0-100
    message: string;
    metadata?: any;
    tokensUsed?: number;
    confidence?: number;
    error?: {
      message: string;
      recoverable: boolean;
    };
  };
}

// ============================================================================
// MCP Tool Schemas
// ============================================================================

/**
 * Base schema for all pipeline creation tools
 */
export const BasePipelineToolSchema = z.object({
  task: z.string().min(10).describe('Detailed task description (minimum 10 characters)'),
  repository: RepositoryContextSchema,
  attachments: z.array(AttachmentSchema).optional().default([])
    .describe('Optional attachments for multimodal processing'),
  connections: z.array(PipelineConnectionInputSchema).optional().default([])
    .describe('Optional repository/provider connections admitted as ingress/input context'),
  mcpConfig: z.record(z.any()).optional().default({})
    .describe('MCP provider configuration for external integrations'),
  streaming: z.boolean().optional().default(true)
    .describe('Enable real-time streaming of pipeline execution'),
  organizationId: z.string().optional().describe('Organization context for team operations'),
  modelPreferences: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional()
  }).optional().describe('AI model preferences for pipeline execution')
});

/**
 * AssetPack pipeline tool schema with Shippable subtype specialization.
 */
export const AssetPackPipelineToolSchema = BasePipelineToolSchema.extend({
  subtype: z.enum([
    'pull_request', 'pr_review', 'issue', 'comment', 'blog_post', 
    'diagram', 'api_spec', 'frontend_scaffolder', 'scope_analysis',
    'implementation_plan', 'refactor_proposal'
  ] as const).describe('Specific Shippable subtype or AssetPack written-asset focus'),
  
  // AssetPack/Finish delivery options.
  options: z.object({
    createPR: z.boolean().optional().default(true).describe('Create GitHub pull request'),
    runTests: z.boolean().optional().default(true).describe('Run automated tests'),
    generateDocs: z.boolean().optional().default(true).describe('Generate documentation'),
    securityCheck: z.boolean().optional().default(true).describe('Run security analysis')
  }).optional().default({})
});

// (Evidence Document pipeline tool schema omitted; only AssetPack is exposed via MCP)

// (Measure pipeline tool schemas are not exposed via MCP)

// ============================================================================
// MCP Resource Schemas  
// ============================================================================

/**
 * Pipeline history filter schema
 */
export const PipelineHistoryFilterSchema = z.object({
  pipeline: z.enum(PipelineNameValues).optional().describe('Filter by pipeline type'),
  subtype: z.string().optional().describe('Filter by pipeline subtype'),
  status: z.nativeEnum(PipelineStatus).optional().describe('Filter by execution status'),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional().describe('Filter by date range'),
  repository: z.object({
    owner: z.string(),
    name: z.string()
  }).optional().describe('Filter by repository'),
  tags: z.array(z.string()).optional().describe('Filter by custom tags'),
  userId: z.string().optional().describe('Filter by user (admin only)'),
  organizationId: z.string().optional().describe('Filter by organization')
});

/**
 * Intelligence synthesis configuration schema
 */
export const IntelligenceSynthesisConfigSchema = z.object({
  scope: z.enum(['repository', 'team', 'organization', 'all']).default('all')
    .describe('Scope of intelligence synthesis'),
  timeframe: z.enum(['7d', '30d', '90d', 'all']).default('30d')
    .describe('Time range for analysis'),
  includeMetrics: z.boolean().default(true).describe('Include quantitative metrics'),
  includeRecommendations: z.boolean().default(true).describe('Include AI recommendations'),
  includeTrends: z.boolean().default(true).describe('Include trend analysis'),
  outputFormat: z.enum(['json', 'markdown', 'html']).default('json')
    .describe('Output format for synthesis')
});

// ============================================================================
// MCP Prompt Template Types
// ============================================================================

/**
 * Prompt template configuration
 */
export interface PromptTemplate {
  name: string;
  description: string;
  category: 'development' | 'analysis' | 'planning' | 'review' | 'documentation';
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required?: boolean;
    default?: any;
  }>;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | ((params: Record<string, any>) => string);
  }>;
  tools?: string[];
  examples?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
}
