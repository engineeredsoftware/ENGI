"use strict";
/**
 * Pipeline Execution Adapter - ORM Integration
 *
 * Updated to use ORM models for all database operations.
 * Manages pipeline execution lifecycle with AssetPack-first accounting.
 *
 * @doc-code
 * type: adapter
 * category: pipelines
 * pattern: orm-integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPipelineInputContext = buildPipelineInputContext;
exports.queuePipelineJob = queuePipelineJob;
exports.monitorPipelineExecution = monitorPipelineExecution;
exports.cancelPipelineExecution = cancelPipelineExecution;
exports.getPipelineMetrics = getPipelineMetrics;
const uuid_1 = require("uuid");
const supabase_1 = require("@bitcode/supabase");
const logger_1 = require("@bitcode/logger");
const observability_1 = require("@bitcode/observability");
const orm_1 = require("@bitcode/orm");
const asset_pack_1 = __importDefault(require("@bitcode/pipelines/asset-pack"));
const pipelines_generics_1 = require("@bitcode/pipelines-generics");
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function sameConnection(left, right) {
    return (left.kind === right.kind &&
        left.provider === right.provider &&
        left.connectionId === right.connectionId &&
        left.owner === right.owner &&
        left.name === right.name &&
        left.branch === right.branch &&
        left.path === right.path);
}
function buildPipelineInputContext(ingress, config) {
    const repository = asRecord(config.repository);
    const attachments = Array.isArray(config.attachments)
        ? config.attachments
        : [];
    const explicitConnections = Array.isArray(config.connections)
        ? config.connections.filter((connection) => {
            const record = asRecord(connection);
            return record?.kind === 'repository_connection' && typeof record?.provider === 'string';
        })
        : [];
    const repositoryConnection = repository
        ? [{
                kind: 'repository_connection',
                provider: repository.provider || 'github',
                connectionId: repository.connectionId,
                owner: repository.owner,
                name: repository.name,
                branch: repository.branch,
                path: repository.path
  }]
        : [];
    const connections = [...explicitConnections];
    for (const connection of repositoryConnection) {
        if (!connections.some((existing) => sameConnection(existing, connection))) {
            connections.push(connection);
        }
    }
    return {
        ingress,
        repository: repository || undefined,
        attachments,
        connections,
        mcpConfig: asRecord(config.mcpConfig) || {}
  };
}
function normalizeAssetPacks(result) {
    const record = asRecord(result);
    const raw = Array.isArray(record?.assetPacks) ? record?.assetPacks : [];
    return raw.map((item) => {
        const pack = asRecord(item) || {};
        return {
            kind: 'asset_pack',
            type: typeof pack.type === 'string' ? pack.type : 'artifact',
            url: typeof pack.url === 'string' ? pack.url : undefined,
            content: typeof pack.content === 'string' ? pack.content : undefined,
            metadata: asRecord(pack.metadata) || pack.metadata
  };
    });
}
function enrichPipelineResult(result, ingress, inputContext) {
    const record = asRecord(result) || { value: result };
    const assetPacks = normalizeAssetPacks(record);
    return {
        ...record,
        interfaceSurface: ingress,
        inputContext,
        assetPacks,
        metadata: {
            ...(asRecord(record.metadata) || {}),
            outputMeaning: 'asset_packs'
  }
  };
}
/**
 * Queue a pipeline job for execution
 */
async function queuePipelineJob(options) {
    const span = observability_1.observability.startSpan('queue_pipeline_job', {
        pipeline: options.pipeline,
        userId: options.userId,
        organizationId: options.organizationId
    });
    try {
        const supabase = (0, supabase_1.createClient)();
        const runs = new orm_1.PipelineExecutionsModel(supabase);
        const assetPackEvidenceId = (0, uuid_1.v4)();
        // Create run record
        const run = await runs.create({
            deliverable_id: assetPackEvidenceId,
            user_id: options.userId,
            status: 'pending',
            metadata: {
                pipeline: options.pipeline,
                task: options.task,
                config: options.config,
                userId: options.userId,
                organizationId: options.organizationId,
                apiKeyId: options.apiKeyId,
                measuredBtdEstimate: options.measuredBtdEstimate,
                priority: options.priority || 'normal',
                ...options.metadata
            }
        });
        // Queue for async execution
        queueAsyncExecution(run.id, options);
        logger_1.logger.info('Pipeline job queued', {
            runId: run.id,
            assetPackEvidenceId,
            pipeline: options.pipeline,
            userId: options.userId
        });
        return { runId: run.id, assetPackEvidenceId };
    }
    catch (error) {
        span.recordException(error);
        throw error;
    }
    finally {
        span.end();
    }
}
/**
 * Queue async execution (would integrate with job queue in production)
 */
async function queueAsyncExecution(runId, options) {
    // In production, this would push to a job queue (BullMQ, etc.)
    // For now, execute directly with a small delay
    setTimeout(async () => {
        try {
            await executePipelineJob(runId, options);
        }
        catch (error) {
            logger_1.logger.error('Pipeline execution failed', { runId, error });
        }
    }, 100);
}
/**
 * Execute a pipeline job
 */
async function executePipelineJob(runId, options) {
    const span = observability_1.observability.startSpan('execute_pipeline_job', {
        runId,
        pipeline: options.pipeline
    });
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    const events = new orm_1.ExecutionEventsModel(supabase);
    try {
        // Update run status to running
        await runs.update(runId, {
            status: 'running',
            started_at: new Date().toISOString()
        });
        // Record start event
        await events.create({
            run_id: runId,
            event_type: 'pipeline_started',
            event_data: {
                pipeline: options.pipeline,
                task: options.task
            }
        });
        // Execute pipeline based on type
        let result;
        let measuredBtd = options.measuredBtdEstimate;
        switch (options.pipeline) {
            case 'asset-pack': {
                const inputContext = buildPipelineInputContext('bitcode_mcp', options.config);
                const execution = new pipelines_generics_1.PipelineExecution(runId, undefined, (0, pipelines_generics_1.inferPipelineExecutionLineage)('asset-pack'));
                execution.store('interface', 'ingress', {
                    surface: 'bitcode_mcp',
                    interfaceKind: 'bitcode_exchange_interface',
                    pipeline: 'asset-pack'
  });
                execution.store('inputs', 'context', inputContext);
                result = await (0, asset_pack_1.default)({
                    task: options.task,
                    config: options.config,
                    userId: options.userId,
                    organizationId: options.organizationId
                }, execution);
                result = enrichPipelineResult(result, 'bitcode_mcp', inputContext);
                break;
            }
            default:
                throw new Error(`Unsupported pipeline type: ${options.pipeline}`);
        }
        // Calculate measured BTD amount without treating it as spend.
        if (result.tokensUsed) {
            measuredBtd = Math.ceil(result.tokensUsed / 1000);
        }
        // Update run with success
        await runs.update(runId, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            execution_time_ms: Date.now() - new Date(result.startedAt || Date.now()).getTime(),
            result: result.data || result,
            metadata: {
                ...result.metadata,
                measuredBtd,
                measuredBtdEstimate: options.measuredBtdEstimate,
                btdSemantics: 'non_fungible_asset_pack_share_read_right',
                feeAsset: 'BTC'
  }
        });
        // Record completion event
        await events.create({
            run_id: runId,
            event_type: 'pipeline_completed',
            event_data: {
                measuredBtd,
                btdSemantics: 'non_fungible_asset_pack_share_read_right',
                feeAsset: 'BTC',
                executionTimeMs: result.executionTimeMs
            }
        });
        logger_1.logger.info('Pipeline execution completed', {
            runId,
            pipeline: options.pipeline,
            measuredBtd
        });
    }
    catch (error) {
        span.recordException(error);
        // Update run with failure
        await runs.update(runId, {
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        // Record error event
        await events.create({
            run_id: runId,
            event_type: 'pipeline_failed',
            event_data: {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }
        });
        // Failure does not mutate BTD; BTC settlement belongs to wallet surfaces.
        logger_1.logger.error('Pipeline execution failed', {
            runId,
            pipeline: options.pipeline,
            error
        });
        throw error;
    }
    finally {
        span.end();
    }
}
/**
 * Monitor pipeline execution status
 */
async function monitorPipelineExecution(runId) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    const events = new orm_1.ExecutionEventsModel(supabase);
    const run = await runs.getById(runId);
    if (!run) {
        throw new Error(`Run not found: ${runId}`);
    }
    const runEvents = await events.getByRunId(runId);
    return {
        runId: run.id,
        status: run.status || 'queued',
        startedAt: run.started_at ? new Date(run.started_at) : undefined,
        completedAt: run.completed_at ? new Date(run.completed_at) : undefined,
        result: run.result,
        error: run.error_message || undefined,
        measuredBtd: run.metadata?.measuredBtd,
        events: runEvents.map(e => ({
            type: e.event_type,
            data: e.event_data,
            timestamp: new Date(e.created_at || Date.now())
        }))
    };
}
/**
 * Cancel pipeline execution
 */
async function cancelPipelineExecution(runId, userId) {
    const supabase = (0, supabase_1.createClient)();
    const runs = new orm_1.PipelineExecutionsModel(supabase);
    const events = new orm_1.ExecutionEventsModel(supabase);
    const run = await runs.getById(runId);
    if (!run) {
        throw new Error(`Run not found: ${runId}`);
    }
    // Verify user has permission to cancel
    if (run.metadata?.userId !== userId) {
        throw new Error('Unauthorized to cancel this pipeline execution');
    }
    // Can only cancel pending or running pipelines
    if (run.status !== 'pending' && run.status !== 'running') {
        return false;
    }
    // Update status
    await runs.update(runId, {
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error_message: 'Cancelled by user'
    });
    // Record cancellation event
    await events.create({
        run_id: runId,
        event_type: 'pipeline_cancelled',
        event_data: {
            cancelledBy: userId,
            cancelledAt: new Date().toISOString()
        }
    });
    // TODO: Send cancellation signal to actual execution process
    return true;
}
/**
 * Get pipeline execution metrics
 */
async function getPipelineMetrics(organizationId, pipeline, days = 30) {
    const supabase = (0, supabase_1.createClient)();
    // This would be a custom query on the runs table
    // For now, return mock data
    return {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageDurationMs: 0,
        totalCreditsUsed: 0,
        successRate: 0
    };
}
