"use strict";
/**
 * Bitcode MCP Pipeline Resources - ORM Integration
 *
 * Updated to use ORM models for all database operations.
 * Provides read-only access to pipeline execution data through MCP resources.
 *
 * @doc-code
 * type: resources
 * category: pipelines
 * pattern: orm-integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPipelineResources = registerPipelineResources;
const logger_1 = require("@bitcode/logger");
const supabase_1 = require("@bitcode/supabase");
const orm_1 = require("@bitcode/orm");
function getTimestamp(value) {
    return value ? new Date(value).getTime() : 0;
}
function isWithinRange(value, start, end) {
    if (!value) {
        return false;
    }
    const timestamp = new Date(value).getTime();
    return timestamp >= start.getTime() && timestamp <= end.getTime();
}
/**
 * Extract run ID from URI
 */
function extractRunId(uri) {
    const match = uri.match(/\/pipelines\/([a-f0-9-]{36})/);
    return match?.[1] || null;
}
/**
 * Parse query parameters from URI
 */
function parseQueryParams(uri) {
    const url = new URL(uri, 'http://localhost');
    const params = {};
    for (const [key, value] of url.searchParams) {
        // Handle array parameters
        if (key.endsWith('[]')) {
            const arrayKey = key.slice(0, -2);
            params[arrayKey] = params[arrayKey] || [];
            params[arrayKey].push(value);
        }
        // Handle boolean parameters
        else if (value === 'true' || value === 'false') {
            params[key] = value === 'true';
        }
        // Handle numeric parameters
        else if (!isNaN(Number(value))) {
            params[key] = Number(value);
        }
        // String parameters
        else {
            params[key] = value;
        }
    }
    return params;
}
/**
 * Get pipeline execution details using ORM
 */
async function getPipelineDetails(runId, context) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    const events = new orm_1.ExecutionEventsModel(supabase);
    const assetPackEvidenceStorage = new orm_1.AssetPackEvidenceModel(supabase);
    try {
        // Get run details
        const run = await runs.getById(runId);
        if (!run) {
            throw new Error('Pipeline run not found');
        }
        // Check access permissions
        const metadata = run.metadata;
        const hasAccess = context.organizationRole === 'admin' ||
            context.organizationRole === 'owner' ||
            metadata?.userId === context.userId ||
            (context.organizationId && metadata?.organizationId === context.organizationId);
        if (!hasAccess) {
            throw new Error('Access denied');
        }
        // Get run events
        const runEvents = await events.getByRunId(runId);
        // Read physical storage evidence when this AssetPack run still carries a retained storage id.
        let assetPackEvidence;
        if (run.deliverable_id) {
            assetPackEvidence = await assetPackEvidenceStorage.getById(run.deliverable_id);
        }
        const result = {
            pipeline: {
                id: run.id,
                assetPackEvidenceId: run.deliverable_id,
                type: metadata?.pipeline || 'asset-pack',
                subtype: metadata?.subtype,
                status: run.status,
                task: metadata?.task,
                repository: metadata?.repository,
                startTime: run.started_at,
                endTime: run.completed_at,
                duration: run.execution_time_ms,
                results: run.result,
                assetPackEvidence: assetPackEvidence ? {
                    id: assetPackEvidence.id,
                    name: assetPackEvidence.name,
                    description: assetPackEvidence.description,
                    status: assetPackEvidence.status
                } : null,
                metrics: metadata?.metrics || {},
                error: run.error_message
            },
            events: runEvents.map(event => ({
                id: event.id,
                type: event.event_type,
                timestamp: event.created_at,
                data: event.event_data
            })),
            metadata: {
                userId: metadata?.userId,
                organizationId: metadata?.organizationId,
                apiKeyId: metadata?.apiKeyId,
                priority: metadata?.priority || 'normal',
                createdAt: run.created_at,
                lastUpdated: run.updated_at
            }
        };
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error getting pipeline details', { runId, error });
        throw error;
    }
}
/**
 * Get pipeline history with filtering using ORM
 */
async function getPipelineHistory(context, filters = {}) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    try {
        // Get runs with filters
        const limit = Math.min(filters.limit || 50, 100);
        const offset = filters.offset || 0;
        let allRuns = await runs.getAll();
        // Apply filters
        if (filters.status) {
            allRuns = allRuns.filter(r => r.status === filters.status);
        }
        if (filters.pipeline) {
            allRuns = allRuns.filter(r => r.metadata?.pipeline === filters.pipeline);
        }
        if (filters.subtype) {
            allRuns = allRuns.filter(r => r.metadata?.subtype === filters.subtype);
        }
        if (filters.dateRange?.start && filters.dateRange?.end) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            allRuns = allRuns.filter((run) => isWithinRange(run.created_at, startDate, endDate));
        }
        // Apply access control
        allRuns = allRuns.filter(r => {
            const metadata = r.metadata;
            return context.organizationRole === 'admin' ||
                context.organizationRole === 'owner' ||
                metadata?.userId === context.userId ||
                (context.organizationId && metadata?.organizationId === context.organizationId);
        });
        // Sort by creation date descending
        allRuns.sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at));
        // Apply pagination
        const paginatedRuns = allRuns.slice(offset, offset + limit);
        const result = {
            pipelines: paginatedRuns.map(r => {
                const metadata = r.metadata;
                return {
                    id: r.id,
                    assetPackEvidenceId: r.deliverable_id,
                    pipeline: metadata?.pipeline || 'asset-pack',
                    subtype: metadata?.subtype,
                    status: r.status,
                    task: metadata?.task ? (metadata.task.length > 200 ? metadata.task.substring(0, 200) + '...' : metadata.task) : '',
                    repository: metadata?.repository,
                    startTime: r.started_at,
                    endTime: r.completed_at,
                    duration: r.execution_time_ms,
                    measuredBtd: metadata?.measuredBtd || 0,
                    confidence: metadata?.confidence || 0,
                    hasError: !!r.error_message
                };
            }),
            pagination: {
                total: allRuns.length,
                limit,
                offset,
                hasMore: allRuns.length > offset + limit
            },
            filters,
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: context.userId
            }
        };
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error getting pipeline history', { filters, error });
        throw error;
    }
}
/**
 * Get active pipelines using ORM
 */
async function getActivePipelines(context) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    try {
        // Get all runs and filter for active ones
        let allRuns = await runs.getAll();
        // Filter for pending and running
        const activeRuns = allRuns.filter(r => r.status === 'pending' || r.status === 'running');
        // Apply access control
        const accessibleRuns = activeRuns.filter(r => {
            const metadata = r.metadata;
            return context.organizationRole === 'admin' ||
                context.organizationRole === 'owner' ||
                metadata?.userId === context.userId ||
                (context.organizationId && metadata?.organizationId === context.organizationId);
        });
        // Sort by creation date descending
        accessibleRuns.sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at));
        // Limit to 50 most recent
        const limitedRuns = accessibleRuns.slice(0, 50);
        return {
            activePipelines: limitedRuns.map(r => {
                const metadata = r.metadata;
                return {
                    id: r.id,
                    assetPackEvidenceId: r.deliverable_id,
                    pipeline: metadata?.pipeline || 'asset-pack',
                    subtype: metadata?.subtype,
                    status: r.status,
                    task: metadata?.task ? (metadata.task.length > 100 ? metadata.task.substring(0, 100) + '...' : metadata.task) : '',
                    repository: metadata?.repository,
                    startTime: r.started_at,
                    progress: calculateProgress(r.status, metadata)
                };
            }),
            summary: {
                total: limitedRuns.length,
                pending: limitedRuns.filter(r => r.status === 'pending').length,
                running: limitedRuns.filter(r => r.status === 'running').length
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                refreshRate: '30s' // Suggested refresh rate for real-time monitoring
            }
        };
    }
    catch (error) {
        logger_1.logger.error('Error getting active pipelines', { error });
        throw error;
    }
}
/**
 * Calculate pipeline progress based on status and metadata
 */
function calculateProgress(status, metadata) {
    switch (status) {
        case 'pending':
            return 0;
        case 'running':
            // Estimate progress based on completed phases
            const phases = metadata?.phases || {};
            const totalPhases = 5; // setup, discovery, implementation, validation, finish
            const completedPhases = Object.keys(phases).filter((phase) => phases[phase]?.completed).length;
            return Math.min((completedPhases / totalPhases) * 80, 80); // Max 80% for running
        case 'completed':
            return 100;
        case 'failed':
        case 'cancelled':
            return -1; // Negative indicates error state
        default:
            return 0;
    }
}
/**
 * Get pipeline events stream using ORM
 */
async function getPipelineEvents(runId, context) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    const events = new orm_1.ExecutionEventsModel(supabase);
    try {
        // Verify access to run
        const run = await runs.getById(runId);
        if (!run) {
            throw new Error('Pipeline run not found');
        }
        // Check access permissions
        const metadata = run.metadata;
        const hasAccess = context.organizationRole === 'admin' ||
            context.organizationRole === 'owner' ||
            metadata?.userId === context.userId ||
            (context.organizationId && metadata?.organizationId === context.organizationId);
        if (!hasAccess) {
            throw new Error('Access denied');
        }
        // Get events
        const runEvents = await events.getByRunId(runId);
        return {
            runId,
            events: runEvents.map(event => ({
                id: event.id,
                type: event.event_type,
                timestamp: event.created_at,
                data: event.event_data
            })),
            summary: {
                totalEvents: runEvents.length,
                eventTypes: [...new Set(runEvents.map(e => e.event_type))],
                timeSpan: runEvents.length > 0 ? {
                    start: runEvents[0].created_at,
                    end: runEvents[runEvents.length - 1].created_at
                } : null
            }
        };
    }
    catch (error) {
        logger_1.logger.error('Error getting pipeline events', { runId, error });
        throw error;
    }
}
/**
 * Register pipeline resources
 */
function registerPipelineResources() {
    return [
        {
            uri: 'bitcode://resources/pipelines/active',
            name: 'Active Pipelines',
            description: 'Real-time list of currently running and pending pipeline executions',
            mimeType: 'application/json',
            read: async (uri, context) => {
                return getActivePipelines(context);
            }
        },
        {
            uri: 'bitcode://resources/pipelines/history',
            name: 'Pipeline History',
            description: 'Historical pipeline execution data with filtering and pagination',
            mimeType: 'application/json',
            read: async (uri, context) => {
                const filters = parseQueryParams(uri);
                return getPipelineHistory(context, filters);
            }
        },
        {
            uri: 'bitcode://resources/pipelines/{id}',
            name: 'Pipeline Details',
            description: 'Comprehensive details about a specific pipeline execution',
            mimeType: 'application/json',
            read: async (uri, context) => {
                const runId = extractRunId(uri);
                if (!runId) {
                    throw new Error('Invalid pipeline ID in URI');
                }
                return getPipelineDetails(runId, context);
            }
        },
        {
            uri: 'bitcode://resources/pipelines/{id}/events',
            name: 'Pipeline Events',
            description: 'Real-time execution events and logs for a specific pipeline',
            mimeType: 'application/json',
            read: async (uri, context) => {
                const runId = extractRunId(uri);
                if (!runId) {
                    throw new Error('Invalid pipeline ID in URI');
                }
                return getPipelineEvents(runId, context);
            }
        }
    ];
}
