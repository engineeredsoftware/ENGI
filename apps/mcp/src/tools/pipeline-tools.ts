/**
 * Bitcode MCP Pipeline Tools - ORM Integration
 * 
 * Uses the ORM-based pipeline execution adapter.
 * Exposes Bitcode's pipeline system through MCP tools.
 * 
 * @doc-code
 * type: tools
 * category: pipelines
 * pattern: orm-integration
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  buildBtdInterfaceAuthorizationPolicy,
  getBtdMcpToolContract,
} from '@bitcode/btd';
import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';

// Import the ORM-based pipeline execution adapter
import { 
  queuePipelineJob, 
  monitorPipelineExecution, 
  cancelPipelineExecution,
  getPipelineMetrics,
  buildPipelineInputContext,
  type PipelineJobOptions,
  type PipelineExecutionResult
} from '../pipeline-execution/adapter';

// Import types
import type { MCPAuthContext } from '../types';
import { AssetPackPipelineToolSchema, type PipelineName } from '../types';

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
 * Estimate the measured BTD content amount expected for pipeline execution.
 */
async function estimatePipelineMeasuredBtd(
  pipeline: PipelineName,
  task: string,
  attachments: any[] = []
): Promise<number> {
  // Base measured-BTD estimation based on pipeline type and complexity.
  const baseCosts = { 'asset-pack': 100 } as const;

  let measuredBtdEstimate = (baseCosts as Record<string, number>)[pipeline] || 100;

  // Adjust for task complexity (rough heuristic)
  const taskLength = task.length;
  if (taskLength > 1000) measuredBtdEstimate *= 1.5;
  if (taskLength > 2000) measuredBtdEstimate *= 2;

  // Adjust for attachments
  measuredBtdEstimate += attachments.length * 25;

  // Add tolerance so read surfaces have a conservative expected content amount.
  return Math.ceil(measuredBtdEstimate * 1.2);
}

function normalizeAssetPacks(result: any): any[] {
  if (!result || typeof result !== 'object') {
    return [];
  }

  if (Array.isArray(result.assetPacks)) {
    return result.assetPacks;
  }

  return [];
}

function sameOptionalString(left?: string, right?: string): boolean {
  return left === undefined || right === undefined || left === right;
}

function sameOptionalNumber(left?: number, right?: number): boolean {
  return left === undefined || right === undefined || left === right;
}

function hasProviderCredential(context: MCPAuthContext, provider: string): boolean {
  const credentials = context.mcpCredentials?.[provider];

  if (!credentials) {
    return false;
  }

  if (typeof credentials !== 'object') {
    return true;
  }

  return Object.keys(credentials).length > 0;
}

function repositoryConnectionMatchesRepository(
  repository: Record<string, any>,
  connection: Record<string, any>
): boolean {
  const provider = repository.provider || 'github';

  if (connection.kind !== 'repository_connection' || connection.provider !== provider) {
    return false;
  }

  if (!sameOptionalNumber(repository.connectionId, connection.connectionId)) {
    return false;
  }

  if (!sameOptionalString(repository.branch, connection.branch)) {
    return false;
  }

  if (!sameOptionalString(repository.path, connection.path)) {
    return false;
  }

  if (provider === 'local') {
    return connection.path === repository.path &&
      (connection.name === undefined || connection.name === repository.name);
  }

  if (!sameOptionalString(repository.owner, connection.owner)) {
    return false;
  }

  if (!sameOptionalString(repository.name, connection.name)) {
    return false;
  }

  const anchoredByConnectionId = typeof repository.connectionId === 'number' &&
    typeof connection.connectionId === 'number' &&
    repository.connectionId === connection.connectionId;
  const anchoredByCoordinates = connection.owner === repository.owner &&
    connection.name === repository.name;

  return anchoredByConnectionId || anchoredByCoordinates;
}

function buildRepositoryAnchor(repository: Record<string, any>): string {
  const provider = String(repository.provider || 'github');
  const branch = repository.branch ? `@${repository.branch}` : '';

  if (provider === 'local') {
    return `${provider}:${repository.path || repository.name}${branch}`;
  }

  return `${provider}:${repository.owner}/${repository.name}${branch}`;
}

function flattenMcpOrganizationPermissionGrants(context: MCPAuthContext): string[] {
  const grants = [...(context.scopes ?? [])];
  const organizationPermissions = context.organizationPermissions ?? {};
  for (const [resource, permissions] of Object.entries(organizationPermissions)) {
    if (!Array.isArray(permissions)) continue;
    for (const permission of permissions) {
      if (typeof permission === 'string' && permission.trim()) {
        grants.push(`${resource}:${permission.trim()}`);
      }
    }
  }
  return Array.from(new Set(grants));
}

function assertPipelineWriteAdmission(
  params: any,
  context: MCPAuthContext,
  interfaceSurface: 'bitcode_mcp'
): Record<string, any> {
  const issuedAt = new Date().toISOString();
  const interfaceAuthorizationPolicy = buildBtdInterfaceAuthorizationPolicy({
    policyId: 'mcp-pipeline-create-request-finding-fits',
    interfaceSurface: 'mcp',
    action: 'request_finding_fits',
    authIssuer: {
      issuerKind: 'api_key',
      issuerId: context.userId,
      issuedAt,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      issuerRoot: `mcp-authenticated-principal:${context.userId}`,
    },
    actorId: context.userId,
    organizationId: context.organizationId ?? null,
    teamId: context.organizationId ?? null,
    memberId: context.userId,
    organizationRole: context.organizationRole ?? null,
    organizationPermissionGrants: flattenMcpOrganizationPermissionGrants(context),
    protectedSource: {
      disclosureState: 'source_safe_preview',
      settlementState: 'not_required',
    },
    confirmed: true,
    at: issuedAt,
  });

  if (interfaceAuthorizationPolicy.decision !== 'allowed') {
    throw new Error(
      `Bitcode MCP write admission denied by interface authorization policy: ${interfaceAuthorizationPolicy.denialCodes.join(', ')}.`
    );
  }

  if (!context.permissions.pipelines.create) {
    throw new Error(
      'Bitcode MCP write admission requires pipelines.create permission before any pipeline job can be queued.'
    );
  }

  const repository = params.repository;
  const provider = repository?.provider || 'github';
  const repositoryConnections = Array.isArray(params.connections)
    ? params.connections.filter((connection: unknown) =>
        Boolean(connection) &&
        typeof connection === 'object' &&
        (connection as Record<string, any>).kind === 'repository_connection',
      )
    : [];
  const matchingConnection = repositoryConnections.find((connection: unknown) =>
    repositoryConnectionMatchesRepository(
      repository as Record<string, any>,
      connection as Record<string, any>,
    ),
  );

  if (repositoryConnections.length > 0 && !matchingConnection) {
    logger.warn('Rejected incoherent Bitcode MCP repository/provider ingress', {
      interfaceSurface,
      userId: context.userId,
      organizationId: context.organizationId,
      repository,
      repositoryConnections,
    });
    throw new Error(
      'Bitcode MCP write admission rejected the repository/provider ingress because no supplied repository_connection matches the requested repository anchor.'
    );
  }

  if (provider !== 'local' && !matchingConnection && !hasProviderCredential(context, provider)) {
    logger.warn('Rejected Bitcode MCP pipeline write without provider-bound ingress', {
      interfaceSurface,
      userId: context.userId,
      organizationId: context.organizationId,
      provider,
      repository,
    });
    throw new Error(
      'Bitcode MCP write admission requires a repository-scoped provider binding. Supply a matching repository_connection or authenticate the repository provider in MCP credentials.'
    );
  }

  const ingressBasis = matchingConnection
    ? 'matching_repository_connection'
    : provider === 'local'
      ? 'local_repository_anchor'
      : 'provider_credential';

  return {
    admitted: true,
    interfaceSurface,
    permission: 'pipelines.create',
    ingressBasis,
    repositoryProvider: provider,
    repositoryAnchor: buildRepositoryAnchor(repository as Record<string, any>),
    attachmentCount: Array.isArray(params.attachments) ? params.attachments.length : 0,
    connectionCount: repositoryConnections.length,
    outputMeaning: 'asset_packs',
    interfaceAuthorizationPolicy: {
      policyId: interfaceAuthorizationPolicy.policyId,
      decision: interfaceAuthorizationPolicy.decision,
      denialCodes: interfaceAuthorizationPolicy.denialCodes,
      policyRoot: interfaceAuthorizationPolicy.proofRoots.policyRoot,
      sourceVisibility: interfaceAuthorizationPolicy.sourceVisibility,
    },
  };
}

/**
 * Execute pipeline with comprehensive error handling and monitoring
 */
async function executePipelineWithMonitoring(
  params: any,
  context: MCPAuthContext,
  pipelineType: PipelineName
): Promise<any> {
  const startTime = Date.now();
  const interfaceSurface = 'bitcode_mcp' as const;
  const inputContext = buildPipelineInputContext(interfaceSurface, {
    repository: params.repository,
    attachments: params.attachments,
    connections: params.connections,
    mcpConfig: params.mcpConfig,
  });

  const writeAdmission = assertPipelineWriteAdmission(params, context, interfaceSurface);

  // Estimate measured BTD without using it as admission spend.
  const measuredBtdEstimate = await estimatePipelineMeasuredBtd(
    pipelineType,
    params.task,
    params.attachments
  );

  logger.info('Starting pipeline execution', {
    pipeline: pipelineType,
    userId: context.userId,
    organizationId: context.organizationId,
    measuredBtdEstimate,
    task: params.task.substring(0, 100) + '...'
  });

  try {
    // Prepare job options
    const jobOptions: PipelineJobOptions = {
      pipeline: pipelineType,
      task: params.task,
      config: {
        ...params,
        subtype: params.subtype,
        repository: params.repository,
        attachments: params.attachments,
        connections: params.connections,
        streaming: params.streaming
      },
      userId: context.userId,
      organizationId: context.organizationId,
      apiKeyId: context.apiKeyId,
      measuredBtdEstimate,
      priority: params.priority || 'normal',
      metadata: {
        source: 'mcp',
        mcpToolName: `bitcode://pipelines/${pipelineType}/create`,
        interfaceSurface,
        outputMeaning: 'asset_packs',
        writeAdmission,
      }
    };

    // Queue the pipeline job using ORM-based adapter
    const { runId, assetPackEvidenceId } = await queuePipelineJob(jobOptions);
    
    // If streaming is enabled, return immediately with run details
    if (params.streaming) {
      return {
        runId,
        assetPackEvidenceId,
        status: 'queued',
        interfaceSurface,
        inputContext,
        writeAdmission,
        outputMeaning: 'asset_packs',
        message: 'Pipeline job queued for execution. Monitor using the runId.',
        streaming: true,
        monitoringUrl: `/api/pipelines/runs/${runId}`
      };
    }
    
    // Otherwise, wait for completion
    const executionResult = await monitorPipelineExecution(runId);
    
    const duration = Date.now() - startTime;
    
    // Record successful execution
    observability.recordMetric('pipeline_execution', {
      pipeline: pipelineType,
      subtype: params.subtype,
      duration,
      measuredBtd: executionResult.measuredBtd || measuredBtdEstimate,
      success: executionResult.status === 'completed',
      userId: context.userId,
      organizationId: context.organizationId
    });

    logger.info('Pipeline execution completed', {
      runId,
      pipeline: pipelineType,
      duration,
      status: executionResult.status,
      measuredBtd: executionResult.measuredBtd
    });

    const assetPacks = normalizeAssetPacks(executionResult.result);

    return {
      runId,
      assetPackEvidenceId,
      status: executionResult.status,
      interfaceSurface,
      inputContext,
      writeAdmission,
      outputMeaning: 'asset_packs',
      result: executionResult.result,
      assetPacks,
      error: executionResult.error,
      measuredBtd: executionResult.measuredBtd,
      startedAt: executionResult.startedAt,
      completedAt: executionResult.completedAt,
      events: executionResult.events
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    // Record failed execution
    observability.recordMetric('pipeline_execution', {
      pipeline: pipelineType,
      subtype: params.subtype,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      userId: context.userId,
      organizationId: context.organizationId
    });

    logger.error('Pipeline execution failed', {
      pipeline: pipelineType,
      error: error instanceof Error ? error.message : String(error),
      duration
    });

    throw error;
  }
}

/**
 * Register all pipeline tools
 */
export function registerPipelineTools(): MCPTool[] {
  const assetPackCreateContract = getBtdMcpToolContract('bitcode://pipelines/asset-pack/create');

  return [
    // AssetPack pipeline tool.
    {
      name: assetPackCreateContract.toolId,
      description: assetPackCreateContract.description,

      inputSchema: AssetPackPipelineToolSchema,
      
      execute: async (args: z.infer<typeof AssetPackPipelineToolSchema>, context: MCPAuthContext) => {
        return executePipelineWithMonitoring(
          args,
          context,
          'asset-pack'
        );
      }
    }
  ];
}
