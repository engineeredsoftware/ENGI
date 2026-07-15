"use strict";
/**
 * Bitcode MCP Server Type System
 *
 * Comprehensive type definitions for the Model Context Protocol server
 * that exposes one Bitcode Exchange interface surface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceSynthesisConfigSchema = exports.PipelineHistoryFilterSchema = exports.AssetPackPipelineToolSchema = exports.BasePipelineToolSchema = exports.PipelineStatus = exports.PipelineConnectionInputSchema = exports.AttachmentSchema = exports.RepositoryContextSchema = exports.PipelineNameValues = void 0;
const zod_1 = require("zod");
// Supported pipeline names exposed via MCP (align with supported pipelines only)
exports.PipelineNameValues = ['asset-pack'];
/**
 * Repository/provider connection context supplied as pipeline input.
 */
exports.RepositoryContextSchema = zod_1.z.object({
    owner: zod_1.z.string().optional().describe('Repository owner (user or organization) - not needed for local repos'),
    name: zod_1.z.string().describe('Repository name or local directory name'),
    branch: zod_1.z.string().optional().default('main').describe('Git branch to work on'),
    path: zod_1.z.string().optional().describe('Local file system path (e.g., /Users/garrettmaring/Developer/Bitcode)'),
    url: zod_1.z.string().optional().describe('Optional canonical repository URL or local file URI'),
    connectionId: zod_1.z.number().optional().describe('GitHub App installation ID'),
    provider: zod_1.z.enum(['github', 'gitlab', 'bitbucket', 'local']).optional().default('github')
        .describe('Repository provider - use "local" for local directories'),
    metadata: zod_1.z.record(zod_1.z.any()).optional().describe('Optional repository metadata admitted through app/MCP ingress')
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
/**
 * Attachment context supplied as pipeline input.
 */
exports.AttachmentSchema = zod_1.z.object({
    type: zod_1.z.enum(['image', 'document', 'audio', 'video', 'url', 'figma', 'file'])
        .describe('Type of attachment for specialized processing'),
    content: zod_1.z.string().describe('Attachment content (URL, file path, or encoded data)'),
    metadata: zod_1.z.record(zod_1.z.any()).optional().describe('Additional metadata for processing')
});
exports.PipelineConnectionInputSchema = zod_1.z.object({
    kind: zod_1.z.literal('repository_connection'),
    provider: zod_1.z.string().describe('Connected repository provider'),
    connectionId: zod_1.z.number().optional().describe('Provider connection identifier'),
    owner: zod_1.z.string().optional().describe('Repository owner for remote providers'),
    name: zod_1.z.string().optional().describe('Repository name or local directory name'),
    branch: zod_1.z.string().optional().describe('Repository branch'),
    path: zod_1.z.string().optional().describe('Local repository path when applicable')
  });
/**
 * Pipeline execution status
 */
var PipelineStatus;
(function (PipelineStatus) {
    PipelineStatus["PENDING"] = "pending";
    PipelineStatus["RUNNING"] = "running";
    PipelineStatus["COMPLETED"] = "completed";
    PipelineStatus["FAILED"] = "failed";
    PipelineStatus["CANCELLED"] = "cancelled";
})(PipelineStatus || (exports.PipelineStatus = PipelineStatus = {}));
// ============================================================================
// MCP Tool Schemas
// ============================================================================
/**
 * Base schema for all pipeline creation tools
 */
exports.BasePipelineToolSchema = zod_1.z.object({
    task: zod_1.z.string().min(10).describe('Detailed task description (minimum 10 characters)'),
    repository: exports.RepositoryContextSchema,
    attachments: zod_1.z.array(exports.AttachmentSchema).optional().default([])
        .describe('Optional attachments for multimodal processing'),
    connections: zod_1.z.array(exports.PipelineConnectionInputSchema).optional().default([])
        .describe('Optional repository/provider connections admitted as ingress/input context'),
    mcpConfig: zod_1.z.record(zod_1.z.any()).optional().default({})
        .describe('MCP provider configuration for external integrations'),
    streaming: zod_1.z.boolean().optional().default(true)
        .describe('Enable real-time streaming of pipeline execution'),
    organizationId: zod_1.z.string().optional().describe('Organization context for team operations'),
    modelPreferences: zod_1.z.object({
        model: zod_1.z.string().optional(),
        temperature: zod_1.z.number().min(0).max(2).optional(),
        maxTokens: zod_1.z.number().positive().optional()
    }).optional().describe('AI model preferences for pipeline execution')
});
/**
 * AssetPack pipeline tool schema with Shippable subtype specialization.
 */
exports.AssetPackPipelineToolSchema = exports.BasePipelineToolSchema.extend({
    subtype: zod_1.z.enum([
        'pull_request', 'pr_review', 'issue', 'comment', 'blog_post',
        'diagram', 'api_spec', 'frontend_scaffolder', 'scope_analysis',
        'implementation_plan', 'refactor_proposal'
    ]).describe('Specific Shippable subtype or AssetPack written-asset focus'),
    // AssetPack/Finish delivery options.
    options: zod_1.z.object({
        createPR: zod_1.z.boolean().optional().default(true).describe('Create GitHub pull request'),
        runTests: zod_1.z.boolean().optional().default(true).describe('Run automated tests'),
        generateDocs: zod_1.z.boolean().optional().default(true).describe('Generate documentation'),
        securityCheck: zod_1.z.boolean().optional().default(true).describe('Run security analysis')
    }).optional().default({})
});
// (AI Document pipeline tool schema omitted; only AssetPack is exposed via MCP)
// (Measure pipeline tool schemas are not exposed via MCP)
// ============================================================================
// MCP Resource Schemas  
// ============================================================================
/**
 * Pipeline history filter schema
 */
exports.PipelineHistoryFilterSchema = zod_1.z.object({
    pipeline: zod_1.z.enum(exports.PipelineNameValues).optional().describe('Filter by pipeline type'),
    subtype: zod_1.z.string().optional().describe('Filter by pipeline subtype'),
    status: zod_1.z.nativeEnum(PipelineStatus).optional().describe('Filter by execution status'),
    dateRange: zod_1.z.object({
        start: zod_1.z.string().datetime(),
        end: zod_1.z.string().datetime()
    }).optional().describe('Filter by date range'),
    repository: zod_1.z.object({
        owner: zod_1.z.string(),
        name: zod_1.z.string()
    }).optional().describe('Filter by repository'),
    tags: zod_1.z.array(zod_1.z.string()).optional().describe('Filter by custom tags'),
    userId: zod_1.z.string().optional().describe('Filter by user (admin only)'),
    organizationId: zod_1.z.string().optional().describe('Filter by organization')
});
/**
 * Intelligence synthesis configuration schema
 */
exports.IntelligenceSynthesisConfigSchema = zod_1.z.object({
    scope: zod_1.z.enum(['repository', 'team', 'organization', 'all']).default('all')
        .describe('Scope of intelligence synthesis'),
    timeframe: zod_1.z.enum(['7d', '30d', '90d', 'all']).default('30d')
        .describe('Time range for analysis'),
    includeMetrics: zod_1.z.boolean().default(true).describe('Include quantitative metrics'),
    includeRecommendations: zod_1.z.boolean().default(true).describe('Include AI recommendations'),
    includeTrends: zod_1.z.boolean().default(true).describe('Include trend analysis'),
    outputFormat: zod_1.z.enum(['json', 'markdown', 'html']).default('json')
        .describe('Output format for synthesis')
});
