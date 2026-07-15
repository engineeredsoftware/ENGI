"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPipelineTools = registerPipelineTools;
const logger_1 = require("@bitcode/logger");
const observability_1 = require("@bitcode/observability");
// Import the ORM-based pipeline execution adapter
const adapter_1 = require("../pipeline-execution/adapter");
const types_1 = require("../types");
/**
 * Estimate the measured BTD content amount expected for pipeline execution.
 */
async function estimatePipelineMeasuredBtd(pipeline, task, attachments = []) {
    // Base measured-BTD estimation based on pipeline type and complexity.
    const baseCosts = { 'asset-pack': 100 };
    let measuredBtdEstimate = baseCosts[pipeline] || 100;
    // Adjust for task complexity (rough heuristic)
    const taskLength = task.length;
    if (taskLength > 1000)
        measuredBtdEstimate *= 1.5;
    if (taskLength > 2000)
        measuredBtdEstimate *= 2;
    // Adjust for attachments
    measuredBtdEstimate += attachments.length * 25;
    // Add buffer for safety
    return Math.ceil(measuredBtdEstimate * 1.2);
}
function normalizeAssetPacks(result) {
    if (!result || typeof result !== 'object') {
        return [];
    }
    if (Array.isArray(result.assetPacks)) {
        return result.assetPacks;
    }
    return [];
}
function sameOptionalString(left, right) {
    return left === undefined || right === undefined || left === right;
}
function sameOptionalNumber(left, right) {
    return left === undefined || right === undefined || left === right;
}
function hasProviderCredential(context, provider) {
    const credentials = context.mcpCredentials?.[provider];
    if (!credentials) {
        return false;
    }
    if (typeof credentials !== 'object') {
        return true;
    }
    return Object.keys(credentials).length > 0;
}
function repositoryConnectionMatchesRepository(repository, connection) {
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
function buildRepositoryAnchor(repository) {
    const provider = String(repository.provider || 'github');
    const branch = repository.branch ? `@${repository.branch}` : '';
    if (provider === 'local') {
        return `${provider}:${repository.path || repository.name}${branch}`;
    }
    return `${provider}:${repository.owner}/${repository.name}${branch}`;
}
function assertPipelineWriteAdmission(params, context, interfaceSurface) {
    if (!context.permissions.pipelines.create) {
        throw new Error('Bitcode MCP write admission requires pipelines.create permission before any pipeline job can be queued.');
    }
    const repository = params.repository;
    const provider = repository?.provider || 'github';
    const repositoryConnections = Array.isArray(params.connections)
        ? params.connections.filter((connection) => Boolean(connection) &&
            typeof connection === 'object' &&
            connection.kind === 'repository_connection')
        : [];
    const matchingConnection = repositoryConnections.find((connection) => repositoryConnectionMatchesRepository(repository, connection));
    if (repositoryConnections.length > 0 && !matchingConnection) {
        logger_1.logger.warn('Rejected incoherent Bitcode MCP repository/provider ingress', {
            interfaceSurface,
            userId: context.userId,
            organizationId: context.organizationId,
            repository,
            repositoryConnections
  });
        throw new Error('Bitcode MCP write admission rejected the repository/provider ingress because no supplied repository_connection matches the requested repository anchor.');
    }
    if (provider !== 'local' && !matchingConnection && !hasProviderCredential(context, provider)) {
        logger_1.logger.warn('Rejected Bitcode MCP pipeline write without provider-bound ingress', {
            interfaceSurface,
            userId: context.userId,
            organizationId: context.organizationId,
            provider,
            repository
  });
        throw new Error('Bitcode MCP write admission requires a repository-scoped provider binding. Supply a matching repository_connection or authenticate the repository provider in MCP credentials.');
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
        repositoryAnchor: buildRepositoryAnchor(repository),
        attachmentCount: Array.isArray(params.attachments) ? params.attachments.length : 0,
        connectionCount: repositoryConnections.length,
        outputMeaning: 'asset_packs'
  };
}
/**
 * Execute pipeline with comprehensive error handling and monitoring
 */
async function executePipelineWithMonitoring(params, context, pipelineType) {
    const startTime = Date.now();
    const interfaceSurface = 'bitcode_mcp';
    const inputContext = (0, adapter_1.buildPipelineInputContext)(interfaceSurface, {
        repository: params.repository,
        attachments: params.attachments,
        connections: params.connections,
        mcpConfig: params.mcpConfig
  });
    const writeAdmission = assertPipelineWriteAdmission(params, context, interfaceSurface);
    const measuredBtdEstimate = await estimatePipelineMeasuredBtd(pipelineType, params.task, params.attachments);
    logger_1.logger.info('Starting pipeline execution', {
        pipeline: pipelineType,
        userId: context.userId,
        organizationId: context.organizationId,
        measuredBtdEstimate,
        task: params.task.substring(0, 100) + '...'
    });
    try {
        // Prepare job options
        const jobOptions = {
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
                writeAdmission
  }
        };
        // Queue the pipeline job using ORM-based adapter
        const { runId, assetPackEvidenceId } = await (0, adapter_1.queuePipelineJob)(jobOptions);
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
        const executionResult = await (0, adapter_1.monitorPipelineExecution)(runId);
        const duration = Date.now() - startTime;
        // Record successful execution
        observability_1.observability.recordMetric('pipeline_execution', {
            pipeline: pipelineType,
            subtype: params.subtype,
            duration,
            measuredBtd: executionResult.measuredBtd || measuredBtdEstimate,
            btdSemantics: 'non_fungible_asset_pack_share_read_right',
            success: executionResult.status === 'completed',
            userId: context.userId,
            organizationId: context.organizationId
        });
        logger_1.logger.info('Pipeline execution completed', {
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
    }
    catch (error) {
        const duration = Date.now() - startTime;
        // Record failed execution
        observability_1.observability.recordMetric('pipeline_execution', {
            pipeline: pipelineType,
            subtype: params.subtype,
            duration,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            userId: context.userId,
            organizationId: context.organizationId
        });
        logger_1.logger.error('Pipeline execution failed', {
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
function registerPipelineTools() {
    return [
        // AssetPack pipeline tool.
        {
            name: 'bitcode://pipelines/asset-pack/create',
            description: `Create and execute a Bitcode asset-pack pipeline for complete software engineering reads.

This is Bitcode's most powerful pipeline, capable of:
• Feature implementation with written assets and optional pull request delivery
• Comprehensive code reviews with detailed suggestions
• Bug fixes with root cause analysis and testing
• Technical documentation and blog posts
• Architecture diagrams and API specifications
• Frontend scaffolding for React/Vue/Angular
• Project scope analysis and implementation planning
• Code refactoring proposals with impact analysis

Supports multimodal inputs including Figma designs, documents, images, audio, and video.
Real-time streaming provides live updates during read measurement, asset synthesis, validation, Finish, and connected-interface delivery readiness.

Admitted subtypes:
• pull_request - Complete feature implementation with PR
• pr_review - Comprehensive code review with suggestions
• issue - Bug analysis and fixes with testing
• comment - Code explanation and documentation
• blog_post - Technical writing and documentation
• diagram - Architecture and flow diagrams
• api_spec - OpenAPI specification generation
• frontend_scaffolder - Component scaffolding
• scope_analysis - Project complexity analysis
• implementation_plan - Detailed technical planning
• refactor_proposal - Code improvement recommendations`,
            inputSchema: types_1.AssetPackPipelineToolSchema,
            execute: async (args, context) => {
                return executePipelineWithMonitoring(args, context, 'asset-pack');
            }
        }
    ];
}
