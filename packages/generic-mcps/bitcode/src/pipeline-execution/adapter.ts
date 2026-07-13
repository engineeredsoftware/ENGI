/**
 * Pipeline Execution Adapter - ORM Integration
 * 
 * Updated to use ORM models for all database operations.
 * Manages pipeline execution lifecycle with measured BTD posture and BTC-fee
 * separation. `$BTD` is never reserved or deducted by this adapter.
 * 
 * @doc-code
 * type: adapter
 * category: pipelines
 * pattern: orm-integration
 */

import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@bitcode/supabase';
import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';
import {
  PipelineExecutionsModel,
  ExecutionEventsModel
} from '@bitcode/orm';
import assetPackPipeline from '@bitcode/pipelines/asset-pack';
import {
  PipelineExecution,
  inferPipelineExecutionLineage
} from '@bitcode/pipelines-generics';
import type {
  AssetPackResult,
  Attachment,
  InterfaceIngressSurface,
  PipelineConnectionInput,
  PipelineInputContext,
  PipelineName,
  RepositoryContext
} from '../types';

export interface PipelineJobOptions {
  pipeline: PipelineName;
  task: string;
  config: Record<string, any>;
  userId: string;
  organizationId?: string;
  apiKeyId?: string;
  measuredBtdEstimate: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface PipelineExecutionResult {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  measuredBtd?: number;
  events?: Array<{
    type: string;
    data: any;
    timestamp: Date;
  }>;
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null;
}

function sameConnection(
  left: PipelineConnectionInput,
  right: PipelineConnectionInput
): boolean {
  return (
    left.kind === right.kind &&
    left.provider === right.provider &&
    left.connectionId === right.connectionId &&
    left.owner === right.owner &&
    left.name === right.name &&
    left.branch === right.branch &&
    left.path === right.path
  );
}

export function buildPipelineInputContext(
  ingress: InterfaceIngressSurface,
  config: Record<string, any>
): PipelineInputContext {
  const repository = asRecord(config.repository) as RepositoryContext | null;
  const attachments = Array.isArray(config.attachments)
    ? (config.attachments as Attachment[])
    : [];
  const explicitConnections = Array.isArray(config.connections)
    ? (config.connections as PipelineConnectionInput[]).filter((connection) => {
        const record = asRecord(connection);
        return record?.kind === 'repository_connection' && typeof record?.provider === 'string';
      })
    : [];
  const repositoryConnection = repository
    ? [{
        kind: 'repository_connection' as const,
        provider: repository.provider || 'github',
        connectionId: repository.connectionId,
        owner: repository.owner,
        name: repository.name,
        branch: repository.branch,
        path: repository.path,
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
    mcpConfig: asRecord(config.mcpConfig) || {},
  };
}

function normalizeAssetPacks(result: unknown): AssetPackResult[] {
  const record = asRecord(result);
  const raw = Array.isArray(record?.assetPacks) ? record?.assetPacks : [];

  return raw.map((item) => {
    const pack = asRecord(item) || {};
    return {
      kind: 'asset_pack' as const,
      type: typeof pack.type === 'string' ? pack.type : 'artifact',
      url: typeof pack.url === 'string' ? pack.url : undefined,
      content: typeof pack.content === 'string' ? pack.content : undefined,
      metadata: asRecord(pack.metadata) || pack.metadata,
    };
  });
}

function enrichPipelineResult(
  result: unknown,
  ingress: InterfaceIngressSurface,
  inputContext: PipelineInputContext
): Record<string, any> {
  const record = asRecord(result) || { value: result };
  const assetPacks = normalizeAssetPacks(record);

  return {
    ...record,
    interfaceSurface: ingress,
    inputContext,
    assetPacks,
    metadata: {
      ...(asRecord(record.metadata) || {}),
      outputMeaning: 'asset_packs',
    },
  };
}

/**
 * Queue a pipeline job for execution
 */
export async function queuePipelineJob(
  options: PipelineJobOptions
): Promise<{ runId: string; assetPackEvidenceId?: string }> {
  const span = observability.startSpan('queue_pipeline_job', {
    pipeline: options.pipeline,
    userId: options.userId,
    organizationId: options.organizationId
  });

  try {
    const supabase = createClient();
    const runs = new PipelineExecutionsModel(supabase);

    const assetPackEvidenceId = uuidv4();

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

    logger.info('Pipeline job queued', {
      runId: run.id,
      assetPackEvidenceId,
      pipeline: options.pipeline,
      userId: options.userId
    });

    return { runId: run.id, assetPackEvidenceId };
  } catch (error) {
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Queue async execution (would integrate with job queue in production)
 */
async function queueAsyncExecution(runId: string, options: PipelineJobOptions) {
  // In production, this would push to a job queue (BullMQ, etc.)
  // For now, execute directly with a small delay
  setTimeout(async () => {
    try {
      await executePipelineJob(runId, options);
    } catch (error) {
      logger.error('Pipeline execution failed', { runId, error });
    }
  }, 100);
}

/**
 * Execute a pipeline job
 */
async function executePipelineJob(
  runId: string,
  options: PipelineJobOptions
): Promise<void> {
  const span = observability.startSpan('execute_pipeline_job', {
    runId,
    pipeline: options.pipeline
  });

  const supabase = createClient();
  const runs = new PipelineExecutionsModel(supabase);
  const events = new ExecutionEventsModel(supabase);

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
    let result: any;
    let measuredBtd = options.measuredBtdEstimate;

    switch (options.pipeline) {
      case 'asset-pack': {
        const inputContext = buildPipelineInputContext('bitcode_mcp', options.config);
        const execution = new PipelineExecution(
          runId,
          undefined,
          inferPipelineExecutionLineage('asset-pack')
        );
        execution.store('interface', 'ingress', {
          surface: 'bitcode_mcp',
          interfaceKind: 'bitcode_exchange_interface',
          pipeline: 'asset-pack',
        } as any);
        execution.store('inputs', 'context', inputContext as any);
        result = await assetPackPipeline({
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
        feeAsset: 'BTC',
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

    logger.info('Pipeline execution completed', {
      runId,
      pipeline: options.pipeline,
      measuredBtd
    });
  } catch (error) {
    span.recordException(error as Error);

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

    // There is no `$BTD` refund path: BTC fees and non-fungible BTD holdings
    // are accounted by wallet/settlement surfaces, not by pipeline mutation.
    logger.error('Pipeline execution failed', {
      runId,
      pipeline: options.pipeline,
      error
    });

    throw error;
  } finally {
    span.end();
  }
}

/**
 * Monitor pipeline execution status
 */
export async function monitorPipelineExecution(
  runId: string
): Promise<PipelineExecutionResult> {
  const supabase = createClient();
  const runs = new PipelineExecutionsModel(supabase);
  const events = new ExecutionEventsModel(supabase);

  const run = await runs.getById(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  const runEvents = await events.getByRunId(runId);

  return {
    runId: run.id,
    status: (run.status as PipelineExecutionResult['status']) || 'queued',
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
export async function cancelPipelineExecution(
  runId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  const runs = new PipelineExecutionsModel(supabase);
  const events = new ExecutionEventsModel(supabase);

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
export async function getPipelineMetrics(
  organizationId: string,
  pipeline?: PipelineName,
  days: number = 30
): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDurationMs: number;
  totalMeasuredBtd: number;
  successRate: number;
}> {
  const supabase = createClient();
  
  // This would be a custom query on the runs table
  // For now, return mock data
  return {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    averageDurationMs: 0,
    totalMeasuredBtd: 0,
    successRate: 0
  };
}
