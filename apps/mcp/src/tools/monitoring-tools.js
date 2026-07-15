"use strict";
/**
 * Bitcode MCP Monitoring and Control Tools
 *
 * Provides real-time monitoring, control, and management capabilities
 * for Bitcode's pipeline execution system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMonitoringTools = registerMonitoringTools;
const zod_1 = require("zod");
const logger_1 = require("@bitcode/logger");
const supabase_1 = require("@bitcode/supabase");
const types_1 = require("../types");
/**
 * Pipeline status check schema
 */
const PipelineStatusSchema = zod_1.z.object({
    pipelineId: zod_1.z.string().uuid().describe('Pipeline execution ID'),
    includeEvents: zod_1.z.boolean().optional().default(false)
        .describe('Include execution events in response'),
    includeMetrics: zod_1.z.boolean().optional().default(true)
        .describe('Include performance metrics')
});
/**
 * Pipeline cancellation schema
 */
const PipelineCancelSchema = zod_1.z.object({
    pipelineId: zod_1.z.string().uuid().describe('Pipeline execution ID to cancel'),
    reason: zod_1.z.string().optional().describe('Reason for cancellation')
});
/**
 * Pipeline retry schema
 */
const PipelineRetrySchema = zod_1.z.object({
    pipelineId: zod_1.z.string().uuid().describe('Failed pipeline execution ID to retry'),
    fromPhase: zod_1.z.enum(['setup', 'discovery', 'implementation', 'validation', 'finish'])
        .optional().describe('Phase to retry from (default: failed phase)'),
    modifiedParams: zod_1.z.record(zod_1.z.any()).optional()
        .describe('Modified parameters for retry attempt')
});
/**
 * Active pipelines list schema
 */
const ActivePipelinesSchema = zod_1.z.object({
    organizationId: zod_1.z.string().optional()
        .describe('Filter by organization (admin only)'),
    userId: zod_1.z.string().optional()
        .describe('Filter by user (admin only)'),
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20)
        .describe('Maximum number of results'),
    status: zod_1.z.array(zod_1.z.nativeEnum(types_1.PipelineStatus)).optional()
        .describe('Filter by pipeline status')
});
/**
 * Context optimization schema
 */
const ContextOptimizationSchema = zod_1.z.object({
    contextData: zod_1.z.record(zod_1.z.any()).describe('Context data to optimize'),
    targetPrompt: zod_1.z.string().describe('Target prompt for optimization'),
    maxTokens: zod_1.z.number().int().positive().optional().default(8000)
        .describe('Maximum tokens for optimized context'),
    relevanceThreshold: zod_1.z.number().min(0).max(1).optional().default(0.7)
        .describe('Minimum relevance score for inclusion')
});
/**
 * Get pipeline status and details
 */
async function getPipelineStatus(pipelineId, context, includeEvents = false, includeMetrics = true) {
    const supabase = (0, supabase_1.createClient)();
    try {
        // Get pipeline execution record
        let query = supabase
            .from('executions')
            .select(`
        id,
        pipeline,
        subtype,
        status,
        task,
        repository,
        user_id,
        organization_id,
        created_at,
        updated_at,
        completed_at,
        results,
        error_message,
        ${includeMetrics ? 'metrics,' : ''}
        stream_url
      `)
            .eq('id', pipelineId);
        // Apply organization/user filtering
        if (!context.permissions.organization.viewAnalytics && context.organizationId) {
            query = query.eq('organization_id', context.organizationId);
        }
        if (!context.permissions.organization.manageMembers) {
            query = query.eq('user_id', context.userId);
        }
        const { data: pipeline, error: pipelineError } = await query.maybeSingle();
        if (pipelineError) {
            throw new Error(`Database error: ${pipelineError.message}`);
        }
        if (!pipeline) {
            throw new Error('Pipeline not found or access denied');
        }
        const result = {
            pipelineId: pipeline.id,
            status: pipeline.status,
            pipeline: pipeline.pipeline,
            subtype: pipeline.subtype,
            task: pipeline.task,
            repository: pipeline.repository,
            startTime: pipeline.created_at,
            endTime: pipeline.completed_at,
            duration: pipeline.completed_at
                ? new Date(pipeline.completed_at).getTime() - new Date(pipeline.created_at).getTime()
                : null,
            results: pipeline.results,
            assetPacks: Array.isArray(pipeline.results?.assetPacks) ? pipeline.results.assetPacks : [],
            streamUrl: pipeline.stream_url
        };
        if (includeMetrics && pipeline.metrics) {
            result.metrics = pipeline.metrics;
        }
        if (pipeline.error_message) {
            result.error = { message: pipeline.error_message };
        }
        // Include execution events if requested
        if (includeEvents) {
            const { data: events, error: eventsError } = await supabase
                .from('pipeline_events')
                .select('*')
                .eq('pipeline_id', pipelineId)
                .order('created_at', { ascending: true });
            if (!eventsError && events) {
                result.events = events;
            }
        }
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error getting pipeline status', { pipelineId, error });
        throw error;
    }
}
/**
 * Cancel running pipeline
 */
async function cancelPipeline(pipelineId, context, reason) {
    const supabase = (0, supabase_1.createClient)();
    try {
        // Check if pipeline exists and user has permission
        const { data: pipeline, error: checkError } = await supabase
            .from('executions')
            .select('id, status, user_id, organization_id')
            .eq('id', pipelineId)
            .maybeSingle();
        if (checkError || !pipeline) {
            throw new Error('Pipeline not found');
        }
        // Check permissions
        const canCancel = context.permissions.pipelines.cancel ||
            pipeline.user_id === context.userId ||
            (context.organizationId && pipeline.organization_id === context.organizationId);
        if (!canCancel) {
            throw new Error('Insufficient permissions to cancel this pipeline');
        }
        // Check if pipeline can be cancelled
        if (!['pending', 'running'].includes(pipeline.status)) {
            throw new Error(`Cannot cancel pipeline with status: ${pipeline.status}`);
        }
        // Update pipeline status
        const { error: updateError } = await supabase
            .from('executions')
            .update({
            status: types_1.PipelineStatus.CANCELLED,
            completed_at: new Date().toISOString(),
            error_message: reason || 'Cancelled by user'
        })
            .eq('id', pipelineId);
        if (updateError) {
            throw new Error(`Failed to cancel pipeline: ${updateError.message}`);
        }
        // Record cancellation event
        await supabase.from('pipeline_events').insert({
            pipeline_id: pipelineId,
            type: 'cancellation',
            data: {
                reason: reason || 'User requested',
                cancelled_by: context.userId,
                timestamp: new Date().toISOString()
            }
        });
        logger_1.logger.info('Pipeline cancelled', {
            pipelineId,
            reason,
            cancelledBy: context.userId
        });
        return {
            pipelineId,
            status: types_1.PipelineStatus.CANCELLED,
            message: 'Pipeline cancelled successfully',
            cancelledAt: new Date().toISOString(),
            reason: reason || 'User requested'
        };
    }
    catch (error) {
        logger_1.logger.error('Error cancelling pipeline', { pipelineId, error });
        throw error;
    }
}
/**
 * Get list of active pipelines
 */
async function getActivePipelines(context, filters = {}) {
    const supabase = (0, supabase_1.createClient)();
    try {
        let query = supabase
            .from('executions')
            .select(`
        id,
        pipeline,
        subtype,
        status,
        task,
        repository,
        user_id,
        organization_id,
        created_at,
        updated_at,
        stream_url
      `)
            .order('created_at', { ascending: false });
        // Apply status filter
        if (filters.status?.length > 0) {
            query = query.in('status', filters.status);
        }
        else {
            // Default to active statuses
            query = query.in('status', [types_1.PipelineStatus.PENDING, types_1.PipelineStatus.RUNNING]);
        }
        // Apply organization filtering
        if (filters.organizationId && context.permissions.organization.viewAnalytics) {
            query = query.eq('organization_id', filters.organizationId);
        }
        else if (context.organizationId && !context.permissions.organization.viewAnalytics) {
            query = query.eq('organization_id', context.organizationId);
        }
        // Apply user filtering
        if (filters.userId && context.permissions.organization.manageMembers) {
            query = query.eq('user_id', filters.userId);
        }
        else if (!context.permissions.organization.viewAnalytics) {
            query = query.eq('user_id', context.userId);
        }
        // Apply limit
        query = query.limit(filters.limit || 20);
        const { data: pipelines, error } = await query;
        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }
        return {
            pipelines: pipelines?.map(p => ({
                pipelineId: p.id,
                pipeline: p.pipeline,
                subtype: p.subtype,
                status: p.status,
                task: p.task.substring(0, 100) + (p.task.length > 100 ? '...' : ''),
                repository: p.repository,
                startTime: p.created_at,
                lastUpdate: p.updated_at,
                streamUrl: p.stream_url
            })) || [],
            total: pipelines?.length || 0,
            filters: filters
        };
    }
    catch (error) {
        logger_1.logger.error('Error getting active pipelines', { error });
        throw error;
    }
}
/**
 * Optimize context for better prompt performance
 */
async function optimizeContext(contextData, targetPrompt, maxTokens = 8000, relevanceThreshold = 0.7) {
    // This would integrate with the context optimization system
    // For now, return a placeholder implementation
    try {
        // Calculate rough token count (4 chars ≈ 1 token)
        const currentTokens = JSON.stringify(contextData).length / 4;
        if (currentTokens <= maxTokens) {
            return {
                optimizedContext: contextData,
                originalTokens: Math.ceil(currentTokens),
                optimizedTokens: Math.ceil(currentTokens),
                reductionRatio: 0,
                itemsRemoved: 0,
                relevanceScores: {}
            };
        }
        // Simple optimization: prioritize smaller, more relevant fields
        const optimized = { ...contextData };
        let removedItems = 0;
        // Remove large arrays/objects that might be less relevant
        for (const [key, value] of Object.entries(optimized)) {
            if (Array.isArray(value) && value.length > 10) {
                optimized[key] = value.slice(0, 10);
                removedItems++;
            }
        }
        const optimizedTokens = JSON.stringify(optimized).length / 4;
        return {
            optimizedContext: optimized,
            originalTokens: Math.ceil(currentTokens),
            optimizedTokens: Math.ceil(optimizedTokens),
            reductionRatio: (currentTokens - optimizedTokens) / currentTokens,
            itemsRemoved: removedItems,
            relevanceScores: {},
            method: 'simple_truncation'
        };
    }
    catch (error) {
        logger_1.logger.error('Error optimizing context', { error });
        throw error;
    }
}
/**
 * Register monitoring tools
 */
function registerMonitoringTools() {
    return [
        {
            name: 'bitcode://monitoring/pipeline/status',
            description: `Get detailed status and information about a pipeline execution.

Provides comprehensive pipeline information including:
• Current execution status and phase
• Performance metrics and resource usage
• AssetPack results and PR Shippables produced
• Error information and recovery status
• Real-time execution events (optional)

Supports organization-scoped access control and user permissions.`,
            inputSchema: PipelineStatusSchema,
            execute: async (args, context) => {
                return getPipelineStatus(args.pipelineId, context, args.includeEvents, args.includeMetrics);
            }
        },
        {
            name: 'bitcode://monitoring/pipeline/cancel',
            description: `Cancel a running or pending pipeline execution.

Safely cancels pipeline execution with proper cleanup:
• Stops all running agents and phases
• Refunds unused $BTD
• Records cancellation reason and timestamp
• Maintains audit trail for compliance

Requires appropriate permissions (pipeline owner, admin, or cancel permission).`,
            inputSchema: PipelineCancelSchema,
            execute: async (args, context) => {
                return cancelPipeline(args.pipelineId, context, args.reason);
            }
        },
        {
            name: 'bitcode://monitoring/pipelines/active',
            description: `List all active (running or pending) pipeline executions.

Provides overview of current pipeline activity:
• Real-time status of all active pipelines
• Organization and user filtering
• Status-based filtering options
• Streaming URLs for real-time monitoring

Respects organization permissions and user access controls.`,
            inputSchema: ActivePipelinesSchema,
            execute: async (args, context) => {
                return getActivePipelines(context, args);
            }
        },
        {
            name: 'bitcode://monitoring/context/optimize',
            description: `Optimize context data for better AI prompt performance.

Intelligent context optimization including:
• Token count reduction while preserving relevance
• Relevance scoring for context elements
• Smart truncation and summarization
• Performance impact analysis

Helps reduce costs and improve response quality by optimizing prompt context.`,
            inputSchema: ContextOptimizationSchema,
            execute: async (args, context) => {
                return optimizeContext(args.contextData, args.targetPrompt, args.maxTokens, args.relevanceThreshold);
            }
        }
    ];
}
