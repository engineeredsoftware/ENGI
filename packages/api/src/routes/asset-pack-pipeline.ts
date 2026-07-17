/**
 * AssetPack pipeline API route handlers (canonical handlers for /api/executions synthesis).
 *
 * Runs deposit/read **SDIVF synthesis**. Buyer-repo PR shipping is **not**
 * Finish — it is settle-asset-pack-pipeline after BTC/BTD rights.
 * product law is Bitcode Protocol
 * (Deposit/Read SDIVF → settle → ship-asset-pack-patch-pr).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { traceRoute } from '@bitcode/observability';
import { log, reinitLoggerFile } from '@bitcode/logger';
import { VCSService } from '@bitcode/vcs-generics';
import { createAdminClient, type Database } from '@bitcode/orm';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PROVIDER, DEFAULT_MODEL_API, getUsdPricingForApiModel } from '@bitcode/generic-llms-models';
import { BITCODE_FEE_ASSET, BTD_ASSET_SEMANTICS } from '@bitcode/btd';
import { Execution, ExecutionStreamAdapter, NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH } from '@bitcode/execution-generics';
import {
  ExecutionPipeline,
  inferExecutionPipelineLineage
} from '@bitcode/pipelines-generics';
import { runExecutionPipelineSDIVFSynthesizeAssetPacks } from '@bitcode/asset-packs-pipelines-domain';
import { factoryLLMRegistryWithProviders } from '@bitcode/generic-llms';
import { sendServerEvent } from '@bitcode/external-telemetry-google';
import { BitcodeError, reportError } from '@bitcode/errors';
import { sendEmail } from '@bitcode/notifications';
import { createPipelineCompletionMessage, findOrCreateConversationForPipeline } from '../conversations';
import { createJsonResponse, createErrorResponse, createAuthErrorResponse } from '@bitcode/api/responses';
import { buildSemanticCompletionResult } from './asset-pack-semantic-payload';
import * as crypto from 'crypto';
import { Streamer } from '../streams';

// Initialize ORM client with admin access for API routes
const orm = createAdminClient();

// Lazily initialize admin Supabase client and VCS service to avoid
// import-time crashes when env vars are not yet configured (e.g., dev).
let _adminSupabase: ReturnType<typeof createSupabaseClient<Database>> | null = null;
let _vcsService: VCSService | null = null;

function getAdminSupabase() {
  if (_adminSupabase) return _adminSupabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new BitcodeError('Supabase admin env missing', {
      code: 'SUPABASE_ENV_MISSING',
      status: 500,
      userMessage: 'Server configuration incomplete',
    });
  }
  _adminSupabase = createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminSupabase;
}

function getVCSService() {
  if (_vcsService) return _vcsService;
  const supa = getAdminSupabase();
  _vcsService = new VCSService({
    supabaseClient: supa,
    cache: { ttl: 5 * 60 * 1000, enabled: true },
    resilience: {
      retry: { attempts: 3, backoff: 'exponential' },
      circuitBreaker: { threshold: 5, timeout: 60000 },
    },
  });
  return _vcsService;
}

type ModelUsageStat = {
  provider: string;
  model: string;
  callCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number | null;
};

type GenerationMetricsRow = {
  model_provider?: string | null;
  model_name?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  cost?: number | null;
  latency_ms?: number | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function aggregateLLMMetrics(runId: string): Promise<{
  averageLatencyMs: number | null;
  modelUsage: ModelUsageStat[];
}> {
  try {
    const supa = getAdminSupabase();
    const { data: rawRows, error } = await ((supa as any)
      .from('generations'))
      .select('model_provider, model_name, input_tokens, output_tokens, total_tokens, cost, latency_ms')
      .eq('execution_id', runId);
    const rows = Array.isArray(rawRows) ? (rawRows as GenerationMetricsRow[]) : [];
    if (error || !rows || rows.length === 0) {
      return { averageLatencyMs: null, modelUsage: [] };
    }

    const byModel = new Map<string, ModelUsageStat & { _totalLatency: number }>();
    let latencyAccumulator = 0;
    let latencyCount = 0;

    for (const row of rows) {
      const provider = row.model_provider || 'unknown';
      const model = row.model_name || 'unknown';
      const key = `${provider}||${model}`;
      if (!byModel.has(key)) {
        byModel.set(key, {
          provider,
          model,
          callCount: 0,
          totalTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalCostUsd: 0,
          averageLatencyMs: null,
          _totalLatency: 0
        });
      }
      const stat = byModel.get(key)!;
      stat.callCount += 1;
      stat.totalTokens += Number(row.total_tokens ?? 0);
      stat.inputTokens += Number(row.input_tokens ?? 0);
      stat.outputTokens += Number(row.output_tokens ?? 0);
      stat.totalCostUsd += Number(row.cost ?? 0);
      const latency = row.latency_ms;
      if (typeof latency === 'number' && Number.isFinite(latency)) {
        stat._totalLatency += latency;
        latencyAccumulator += latency;
        latencyCount += 1;
      }
    }

    const modelUsage: ModelUsageStat[] = Array.from(byModel.values()).map((stat) => {
      const avgLatency = stat._totalLatency && stat.callCount ? stat._totalLatency / stat.callCount : null;
      return {
        provider: stat.provider,
        model: stat.model,
        callCount: stat.callCount,
        totalTokens: stat.totalTokens,
        inputTokens: stat.inputTokens,
        outputTokens: stat.outputTokens,
        totalCostUsd: Number(stat.totalCostUsd.toFixed(4)),
        averageLatencyMs: avgLatency !== null ? Math.round(avgLatency) : null
      };
    }).sort((a, b) => b.totalTokens - a.totalTokens);

    const averageLatencyMs = latencyCount ? Math.round(latencyAccumulator / latencyCount) : null;

    return { averageLatencyMs, modelUsage };
  } catch {
    return { averageLatencyMs: null, modelUsage: [] };
  }
}

/**
 * GET /api/executions
 * 
 * List GitHub resources based on query parameters:
 * - ?action=installations - Get GitHub installations
 * - ?owner=X - List repositories for owner
 * - ?owner=X&repo=Y - Get repository info and branches
 * - ?owner=X&repo=Y&branch=Z - List commits
 * - ?action=issues&owner=X&repo=Y - List issues and PRs
 * - ?action=files&owner=X&repo=Y&path=Z - List files
 */
export const GET = traceRoute('/executions', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();
  try { if (process.env.BITCODE_LOG_TO_FILE === '1') reinitLoggerFile(requestId, { prefix: 'asset-pack-route-get' }); } catch {}
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const branch = searchParams.get('branch');
  const path = searchParams.get('path');

  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      log('[asset-pack-route] Authentication failed', 'warn', { requestId });
      return createAuthErrorResponse();
    }

    // Get user's GitHub installation id via unified helper
    const installationId = await orm.userConnections.getInstallationIdForUser(user.id, 'github');
    if (!installationId) {
      // Debug-only: log the shape (keys) of connection_data to detect schema drift
      try {
        const conn = await orm.userConnections.getByUserAndProvider(user.id, 'github');
        const keys = conn?.connection_data ? Object.keys(conn.connection_data) : [];
        log('[asset-pack-route GET] connection_data shape (missing installationId)', 'debug', { requestId, keys });
      } catch {}
      // Return 200 with empty data for graceful handling
      // Frontend will handle the missing connection state
      if (action === 'installations') {
        return createJsonResponse({ accounts: [] });
      }
      if (action === 'issues') {
        return createJsonResponse({ issues: [] });
      }
      if (action === 'files') {
        return createJsonResponse({ files: [] });
      }
      return createJsonResponse({
        error: 'github_not_connected',
        message: 'GitHub account not connected',
        requiresAuth: true
      }, 200);
    }

    const connectionId = installationId;

    // Handle different query types
    if (action === 'installations') {
      // Return the current user's installation info
      // Optionally pull login from the connection record for display.
      const connection = await orm.userConnections.getByUserAndProvider(user.id, 'github');
      const connectionData = asRecord(connection?.connection_data);
      return createJsonResponse({
        accounts: [{
          id: connectionId,
          login: typeof connectionData?.login === 'string' ? connectionData.login : 'unknown',
          type: 'User'
        }]
      });
    }

    if (owner && !repo) {
      try {
        const repositories = await getVCSService().listRepositories(user.id, { perPage: 100 });
        return createJsonResponse({ repositories });
      } catch (error: any) {
        log('[asset-pack-route] Repository list error', 'error', { requestId, owner, error: error.message });
        
        if (error.status === 403 || error.message?.includes('rate limit')) {
          return createJsonResponse({
            error: 'rate_limit_exceeded',
            message: 'GitHub API rate limit exceeded',
            description: 'Please wait a few minutes before trying again.',
            retryAfter: error.headers?.['retry-after'] || 60
          }, 429);
        }
        
        return createJsonResponse({
          error: 'repositories_fetch_failed',
          message: 'Failed to fetch repositories',
          description: 'Unable to retrieve your repositories. Please check your GitHub connection.',
          retryable: true
        }, 500);
      }
    }

    if (action === 'issues' && owner && repo) {
      try {
        // Get both issues and PRs
        const [issues, pullRequests] = await Promise.all([
          getVCSService().listIssues(connectionId, owner, repo, { state: 'open' }),
          getVCSService().listPullRequests(connectionId, owner, repo, { state: 'open' })
        ]);
        
        // Combine and format with null safety
        const formattedIssues = [
          ...(issues || []).map((item: any) => ({
            id: item.number,
            title: item.title,
            isPR: false,
            url: item.url
          })),
          ...(pullRequests || []).map((item: any) => ({
            id: item.number,
            title: item.title,
            isPR: true,
            url: item.url
          }))
        ];
        
        return createJsonResponse({ issues: formattedIssues });
      } catch (error: any) {
        log('[asset-pack-route] Issues fetch error', 'error', { requestId, owner, repo, error: error.message });
        
        // Check if it's a permissions error
        if (error.status === 404 || error.message?.includes('Not Found')) {
          return createJsonResponse({
            error: 'repository_not_accessible',
            message: 'Repository not found or not accessible',
            description: 'Please ensure the Bitcode GitHub App has access to this repository.',
            action: 'check_permissions',
            repository: `${owner}/${repo}`
          }, 404);
        }
        
        if (error.status === 403 || error.message?.includes('rate limit')) {
          return createJsonResponse({
            error: 'rate_limit_exceeded',
            message: 'GitHub API rate limit exceeded',
            description: 'Please wait a few minutes before trying again.',
            retryAfter: error.headers?.['retry-after'] || 60
          }, 429);
        }
        
        return createJsonResponse({
          error: 'issues_fetch_failed',
          message: 'Failed to fetch issues and pull requests',
          description: 'An unexpected error occurred. Please try again.',
          retryable: true
        }, 500);
      }
    }

    if (action === 'files' && owner && repo) {
      try {
        const content = await getVCSService().getRepositoryContent(
          connectionId, 
          owner, 
          repo, 
          path || ''
        );
        const files = content.map(item => ({
          path: item.path,
          type: item.type,
          sha: item.sha,
        }));
        
        return createJsonResponse({ files });
      } catch (error: any) {
        log('[asset-pack-route] Files fetch error', 'error', { requestId, owner, repo, path, error: error.message });
        
        if (error.status === 404) {
          return createJsonResponse({
            error: 'path_not_found',
            message: 'Path not found',
            description: `The path "${path || '/'}" does not exist in this repository.`,
            repository: `${owner}/${repo}`,
            path: path || '/'
          }, 404);
        }
        
        if (error.status === 403 || error.message?.includes('rate limit')) {
          return createJsonResponse({
            error: 'rate_limit_exceeded',
            message: 'GitHub API rate limit exceeded',
            description: 'Please wait a few minutes before trying again.',
            retryAfter: error.headers?.['retry-after'] || 60
          }, 429);
        }
        
        return createJsonResponse({
          error: 'files_fetch_failed',
          message: 'Failed to fetch repository contents',
          description: 'Unable to retrieve the repository contents. Please try again.',
          retryable: true
        }, 500);
      }
    }

    if (owner && repo && !branch) {
      try {
        const [repoInfo, branches] = await Promise.all([
          getVCSService().getRepository(connectionId, owner, repo),
          getVCSService().listBranches(connectionId, owner, repo)
        ]);
        return createJsonResponse({ repoInfo, branches });
      } catch (error: any) {
        log('[asset-pack-route] Repository info fetch error', 'error', { requestId, owner, repo, error: error.message });
        
        if (error.status === 404) {
          return createJsonResponse({
            error: 'repository_not_found',
            message: 'Repository not found',
            description: `The repository ${owner}/${repo} was not found or is not accessible.`,
            repository: `${owner}/${repo}`,
            action: 'check_permissions'
          }, 404);
        }
        
        if (error.status === 403 || error.message?.includes('rate limit')) {
          return createJsonResponse({
            error: 'rate_limit_exceeded',
            message: 'GitHub API rate limit exceeded',
            description: 'Please wait a few minutes before trying again.',
            retryAfter: error.headers?.['retry-after'] || 60
          }, 429);
        }
        
        return createJsonResponse({
          error: 'repository_info_failed',
          message: 'Failed to fetch repository information',
          description: 'Unable to retrieve repository details. Please try again.',
          retryable: true
        }, 500);
      }
    }

    if (owner && repo && branch) {
      try {
        const commits = await getVCSService().listCommits(connectionId, owner, repo, { branch });
        return createJsonResponse({ commits });
      } catch (error: any) {
        log('[asset-pack-route] Commits fetch error', 'error', { requestId, owner, repo, branch, error: error.message });
        
        if (error.status === 404) {
          return createJsonResponse({
            error: 'branch_not_found',
            message: 'Branch not found',
            description: `The branch "${branch}" was not found in repository ${owner}/${repo}.`,
            repository: `${owner}/${repo}`,
            branch
          }, 404);
        }
        
        if (error.status === 403 || error.message?.includes('rate limit')) {
          return createJsonResponse({
            error: 'rate_limit_exceeded',
            message: 'GitHub API rate limit exceeded',
            description: 'Please wait a few minutes before trying again.',
            retryAfter: error.headers?.['retry-after'] || 60
          }, 429);
        }
        
        return createJsonResponse({
          error: 'commits_fetch_failed',
          message: 'Failed to fetch commits',
          description: 'Unable to retrieve commit history. Please try again.',
          retryable: true
        }, 500);
      }
    }

    return createJsonResponse({ error: 'Missing required parameters' }, 400);

  } catch (error) {
    log('[asset-pack-route] Error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});

/**
 * POST /api/executions
 * 
 * Create and execute an AssetPack SDIVF pipeline run.
 * 
 * Flow:
 * 1. Parse request (JSON or multipart with file uploads)
 * 2. Save uploaded files using saveArtifact
 * 3. Validate user auth, repository readiness, and BTC fee posture
 * 4. Create pipeline execution in database
 * 5. Initialize SSE stream for real-time updates
 * 6. Store context in Execution (VCS, attachments, OTF instructions)
 * 7. Execute SDIVF pipeline (Setup -> Discovery -> Implementation -> Validation -> Finish)
 * 8. Stream events to client and persist to database
 * 9. Handle completion or failure without mutating non-fungible BTD holdings.
 * Returns streaming response with pipeline events.
 */
export const POST = traceRoute('/executions', async (request: NextRequest) => {
  const correlationId = crypto.randomUUID();
  const startTime = Date.now();
  // Initialize request-scoped log file
  try { if (process.env.BITCODE_LOG_TO_FILE === '1') reinitLoggerFile(correlationId, { prefix: 'asset-pack-route-request' }); } catch {}
  
  log('[asset-pack-route] POST request received', 'info', {
    correlationId,
    contentType: request.headers.get('content-type'),
    userAgent: request.headers.get('user-agent')
  });

  try {
    // Authenticate user FIRST before any operations
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      log('[asset-pack-route] Authentication failed', 'warn', { correlationId, error: authError });
      return createAuthErrorResponse();
    }
    
    log('[asset-pack-route] User authenticated', 'debug', { correlationId, userId: user.id });

    // Parse request body - support both JSON and multipart
    // CRITICAL: Multipart is used when files are attached
    // Files are saved to artifact storage and paths added to attachments
    let body: any = {};
    let uploadedFiles: Array<{ id: string; path: string; name: string; size: number }> = [];
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data with file uploads
      log('[asset-pack-route] Processing multipart form data', 'debug', { correlationId });
      const formData = await request.formData();
      
      // Extract JSON fields
      const jsonData = formData.get('data');
      if (jsonData && typeof jsonData === 'string') {
        body = JSON.parse(jsonData);
      }
      
      // Process uploaded files
      const { saveArtifact } = await import('@bitcode/generic-artifacts-compose');
      for (const [key, value] of Array.from((formData as any).entries()) as Array<[string, any]>) {
        if (key.startsWith('file_') && value instanceof File) {
          log('[asset-pack-route] Processing uploaded file', 'debug', {
            correlationId,
            fileName: value.name,
            fileSize: value.size,
            mimeType: value.type
          });
          
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Save file using saveArtifact
          const artifactInfo = await saveArtifact(
            buffer,
            `${correlationId}-${value.name}`,
            value.type || 'application/octet-stream'
          );
          
          uploadedFiles.push({
            id: crypto.randomUUID(),
            path: artifactInfo.url,
            name: value.name,
            size: value.size
          });
          
          log('[asset-pack-route] File saved', 'debug', {
            correlationId,
            fileName: value.name,
            savedUrl: artifactInfo.url
          });
        }
      }
    } else {
      // Traditional JSON body
      body = await request.json();
    }
    
    // Merge uploaded files into attachments
    if (uploadedFiles.length > 0) {
      body.attachments = [
        ...(body.attachments || []),
        ...uploadedFiles.map(file => ({
          id: file.id,
          type: 'file',
          content: file.path,
          metadata: {
            name: file.name,
            size: file.size
          }
        }))
      ];
    }
    
    const {
      definition_of_read: raw_definition_of_read,
      repoOwner,
      repoName,
      repoBranch,
      repoCommit,
      issueNumber,
      attachments,
      modelProvider = DEFAULT_PROVIDER,
      modelId = DEFAULT_MODEL_API,
      iterationCount = 3,
      conversationId,
      templateId,
      templateText,
      templateCategory,
      isTemplateCustom = false,
      entryPoint = 'gui',
      inputSource = 'manual',
      enhanceWithContext = false,
      enhanceWithHistory = false,
      // otyInstructions = [], // GA-2 feature - OTF instructions
      userAgent,
      referrer,
      sessionId
    } = body;

    const legacyDefinitionOfReadKey = ['definition_of_', 'ne', 'ed'].join('');
    const rawDefinitionOfRead =
      raw_definition_of_read ?? body?.[legacyDefinitionOfReadKey];
    const definition_of_read =
      typeof rawDefinitionOfRead === 'string' ? rawDefinitionOfRead : '';

    const computerUseReadMeasurementEnabled =
      process.env.BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT === 'true';
    // Validate inputs
    log('[asset-pack-route] Validating inputs', 'debug', {
      correlationId,
      hasDefinitionOfRead: !!definition_of_read,
      hasRepo: !!repoOwner && !!repoName,
      hasBranch: !!repoBranch,
      attachmentCount: attachments?.length || 0,
      templateId,
      enhanceWithContext,
      enhanceWithHistory
    });
    
    if (!definition_of_read.trim()) {
      log('[asset-pack-route] Validation failed: missing definition of read', 'warn', { correlationId });
      throw new BitcodeError('Definition of Read is required', {
        code: 'MISSING_DEFINITION_OF_READ',
        status: 400,
        userMessage: 'Please provide a Definition of Read'
      });
    }

    if (!repoOwner?.trim() || !repoName?.trim()) {
      log('[asset-pack-route] Validation failed: missing repo info', 'warn', { correlationId });
      throw new BitcodeError('Repository owner and name are required', {
        code: 'MISSING_REPO_INFO',
        status: 400,
        userMessage: 'Please select a repository'
      });
    }

    // Calculate BTC fee-basis using USD model pricing relative to the default model.
    const baseFeeUsd = parseInt(process.env.ASSET_PACK_BASE_FEE_USD || process.env.ASSET_PACK_BASE_COST || '100', 10);
    const chosen = getUsdPricingForApiModel(modelId);
    const baseline = getUsdPricingForApiModel(DEFAULT_MODEL_API) || chosen;
    const chosenTotal = (chosen?.input ?? 1) + (chosen?.output ?? 1);
    const baselineTotal = (baseline?.input ?? 1) + (baseline?.output ?? 1);
    const multiplier = baselineTotal > 0 ? (chosenTotal / baselineTotal) : 1;
    const btcFeeUsdEquivalent = Math.round(baseFeeUsd * multiplier);
    
    log('[asset-pack-route] BTC fee basis calculated', 'debug', {
      correlationId,
      baseFeeUsd,
      multiplier,
      feeAsset: BITCODE_FEE_ASSET,
      btcFeeUsdEquivalent,
      modelProvider,
      modelId
    });

    // Create canonical AssetPack pipeline execution.
    log('[asset-pack-route] Creating pipeline execution in database', 'debug', { correlationId, userId: user.id });
    const nowIso = new Date().toISOString();
    const execRow = await orm.pipelineExecutions.create({
      id: correlationId,
      user_id: user.id,
      type: 'agentic-execution:asset-pack',
      status: 'running',
      guide: 'SDIVF',
      input: {
        definitionOfRead: definition_of_read,
        repoOwner,
        repoName,
        repoBranch,
        repoCommit,
        issueNumber,
        attachments
      } as any,
      output: null,
      config: { provider: modelProvider, modelId } as any,
      metadata: {
        repository: `${repoOwner}/${repoName}`,
        definitionOfRead: definition_of_read
      } as any,
      started_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso
    } as any);

    const runId = execRow.id;
    // Switch log file to run-scoped file for pipeline execution
    try { if (process.env.BITCODE_LOG_TO_FILE === '1') reinitLoggerFile(runId, { prefix: 'asset-pack-route-run' }); } catch {}

    const routeSemanticAssetPack = {
      read: definition_of_read,
      deliveryTarget: 'pr' as const,
    };
    let assetPackCompletion: any = undefined;

    // Send telemetry
    log('[asset-pack-route] Sending creation telemetry', 'debug', { correlationId, runId });
    await sendServerEvent('asset_pack_run_created', {
      run_id: runId,
      user_id: user.id,
      correlation_id: correlationId,
      repo_owner: repoOwner,
      repo_name: repoName,
      model_provider: modelProvider,
      model_id: modelId,
      fee_asset: BITCODE_FEE_ASSET,
      btc_fee_usd_equivalent: btcFeeUsdEquivalent,
      btd_semantics: BTD_ASSET_SEMANTICS,
      iteration_count: iterationCount,
      semantic_event_type: 'asset_pack_run_created',
      semantic_kind: 'asset-pack-written-asset',
      read: definition_of_read,
      asset_pack: routeSemanticAssetPack,
      delivery_target: routeSemanticAssetPack.deliveryTarget,
    });

    // Notifications and emails are gated for V26; skip unless explicitly enabled
    if (process.env.BITCODE_ENABLE_NOTIFICATIONS === 'true') {
      await orm.notifications.create({
        user_id: user.id,
        type: 'pipeline_execution_started',
        title: `Bitcode Asset-Pack Run Started`,
        message: `Your Bitcode asset-pack run (${runId}) has started.`,
        data: {
          runId,
          semanticEventType: 'asset_pack_run_started',
          semanticKind: 'asset-pack-written-asset',
          read: definition_of_read,
          assetPack: routeSemanticAssetPack,
        }
      });

      try {
        const origin = new URL(request.url).origin;
        await sendEmail({
          to: user.email || '',
          subject: `Your Bitcode asset-pack run #${runId} has started`,
          template: 'asset_pack_started',
          vars: {
            name: user.user_metadata?.full_name || '',
            Name: definition_of_read.trim().slice(0, 120) || 'AssetPack run',
            Description: `${repoOwner}/${repoName}@${repoBranch}`,
            MeasuredBtdEstimate: 'pending read measurement',
            BtcFeeHold: `$${btcFeeUsdEquivalent} BTC fee basis`,
            runId,
            runUrl: `${origin}/runs/${runId}`,
            BitcodeURL: `${origin}/runs/${runId}`,
            origin,
            year: new Date().getFullYear()
          }
        });
      } catch (e) {
        log('[asset-pack-route] Email send failed', 'error', { error: e });
      }
    }

    // Check for long-runner queue mode
    if (process.env.LONG_RUNNER_QUEUE === 'true') {
      log('[asset-pack-route] Queueing job for background processing', 'info', { correlationId, runId });
      // Queue job for background processing
      await orm.executionEvents.create({
        execution_id: runId,
        event_type: 'status',
        event_data: {
          type: 'status',
          progress: 'queued',
          message: 'Job queued for processing',
          correlationId,
          runId,
          timestamp: new Date().toISOString()
        } as any
      } as any);

      return createJsonResponse({ runId, status: 'queued' }, 202);
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    let streamClosed = false;
    let execution: Execution | undefined;
    // Streamer that forwards execution events to the SSE writer
    const streamer = new Streamer({ streamId: runId, userId: user.id });
    streamer.subscribe(async (event) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      } catch {}
    });

    // Execute pipeline in background
    (async () => {
      try {
        log('[asset-pack-route] Pipeline execution starting', 'info', {
          correlationId,
          runId,
          definitionOfRead: definition_of_read.substring(0, 100),
          repo: `${repoOwner}/${repoName}`,
          branch: repoBranch,
          modelProvider,
          modelId,
          iterationCount,
          attachmentCount: attachments?.length || 0
        });

        // Write initial status
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'status',
          status: 'initializing',
          message: 'Pipeline starting...',
          runId,
          correlationId
        })}\n\n`));

        // Get connection for VCS
        log('[asset-pack-route] Fetching GitHub connection', 'debug', { correlationId, userId: user.id });
        const installationId = await orm.userConnections.getInstallationIdForUser(user.id, 'github');
        if (!installationId) {
          // Debug-only: log the shape (keys) of connection_data to detect schema drift
          try {
            const conn = await orm.userConnections.getByUserAndProvider(user.id, 'github');
            const keys = conn?.connection_data ? Object.keys(conn.connection_data) : [];
            log('[asset-pack-route POST] connection_data shape (missing installationId)', 'warn', { correlationId, keys });
          } catch {}
          log('[asset-pack-route] GitHub installation not found', 'error', { correlationId, userId: user.id });
          // Send error event to stream before closing
          const errorEvent = {
            type: 'error',
            error: 'GitHub installation not found. Please install the GitHub app first.',
            correlationId
          };
          
          await writer.write(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          await orm.executionEvents.create({
            execution_id: runId,
            event_type: errorEvent.type || 'error',
            event_data: { ...errorEvent, runId } as any
          } as any);
          
          try {
            await writer.close();
            streamClosed = true;
          } catch {}
          try { streamer.complete(); ExecutionStreamAdapter.unregisterStreamer(runId); } catch {}
          return;
        }
        log('[asset-pack-route] GitHub connection found', 'debug', { correlationId, installationId });

        // Create execution context
        log('[asset-pack-route] Creating execution context', 'debug', { correlationId, runId });
        // Use ExecutionPipeline to ensure prompts/tools/llms/agents registries are available.
        execution = new ExecutionPipeline(
          runId,
          undefined,
          inferExecutionPipelineLineage('asset-pack')
        );
        // Bridge execution store events to stream
        try { ExecutionStreamAdapter.registerStreamer(runId, streamer); } catch {}

        // Defensive LLM registry guard: ensure a default LLM is configured
        try {
          const hasDefault = (execution as any).llms?.ensureDefaultConfigured?.({ throw: false });
          if (!hasDefault) {
            const reg = factoryLLMRegistryWithProviders();
            const provider = (process.env.BITCODE_LLM_PROVIDER || 'anthropic').toLowerCase();
            const model = process.env.BITCODE_LLM_MODEL || 'claude-haiku-4-5';
            if (typeof (reg as any).setDefaultProvider === 'function') {
              (reg as any).setDefaultProvider(provider);
            }
            reg.configure('*', { model });
            (execution as any).llms?.setLLMRegistry?.(reg);
            // Also register a concrete default at this node for clarity
            (execution as any).llms?.registerLLMConfig?.('default', { model });
          }
        } catch {}
        
        // Store stream writer in execution for agents to use
        execution.store('execution', 'dataStream', {
          writeData: async (data: string) => {
            await writer.write(encoder.encode(`data: ${data}\n\n`));
            
            // Also persist to database
            try {
              const eventData = JSON.parse(data);
              // Log phase transitions and important events
              if (eventData.type === 'phase' || eventData.type === 'agent') {
                log(`[asset-pack-route] ${eventData.type} event`, 'debug', {
                  correlationId,
                  phase: eventData.phase,
                  agent: eventData.agent,
                  status: eventData.status
                });
              }
              await orm.executionEvents.create({
                execution_id: runId,
                event_type: eventData.type || 'status',
                event_data: { ...eventData, runId } as any
              } as any);
            } catch (parseError) {
              log('[asset-pack-route] Failed to parse event data', 'warn', { correlationId, data });
            }
          }
        } as any);
        
        // Store context information
        // NOTE: Execution context is namespaced key-value storage
        // Available to all agents during pipeline execution
        execution.store('execution', 'correlationId', correlationId);
        execution.store('execution', 'id', runId);
        execution.store('repository', 'connectionId', installationId);
        execution.store('repository', 'owner', repoOwner);
        execution.store('repository', 'name', repoName);
        execution.store('repository', 'branch', repoBranch);
        execution.store('repository', 'commit', repoCommit);
        execution.store('read', 'definition', definition_of_read);
        execution.store('read-definition', 'description', definition_of_read);
        execution.store('config', 'computerUseReadMeasurementEnabled', computerUseReadMeasurementEnabled);
        execution.store('config', 'iterationCount', iterationCount);
        execution.store('attachments', 'list', attachments);
        
        // Build pipeline input with attachments
        // IMPORTANT: attachments field was missing before - now properly passed to pipeline
        // This allows agents to access user-provided files, URLs, and issues
        const pipelineInput = {
          definitionOfRead: definition_of_read,
          read: definition_of_read,
          repository: {
            url: `https://github.com/${repoOwner}/${repoName}`,
            branch: repoBranch
          },
          requirements: {
            documentationRequired: true,
            securityScanRequired: true,
            lintingRequired: true,
            typeCheckRequired: true
          },
          deliveryTarget: 'pr' as const,
          metadata: {
            priority: 'medium' as const,
            requesterId: user.id
          },
          // Pass attachments to pipeline
          attachments: attachments || [],
        };

        // ROUTE PIPELINE EXECUTION: store the Bitcode-owned asset-pack run snapshot.
        try {
          const preprocessing = {
            selectedPipeline: 'asset-pack',
            computerUseReadMeasurement: {
              enabled: computerUseReadMeasurementEnabled,
              featureFlag: 'BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT',
              scope: 'internal-read-measurement',
              v26Status: 'basic-reform-only-full-capability-deferred',
            },
            read: definition_of_read,
            deliveryTarget: 'pr',
            semanticKind: 'asset-pack-written-asset' as const,
            assetPack: {
              read: definition_of_read,
              deliveryTarget: 'pr',
            },
          };
          execution.store('route/preprocessed', 'assetPackWrittenAsset', preprocessing);
        } catch {}

        // Execute pipeline directly. BTC fee settlement and non-fungible BTD
        // share/read-right minting are separate wallet/Packs/Exchange flows.
        log('[asset-pack-route] Starting pipeline execution', 'info', {
          correlationId,
          phases: ['setup', 'discovery', 'implementation', 'validation', 'finish'],
          maxIterations: iterationCount
        });
        
        const pipelineStartTime = Date.now();

        const result = await runExecutionPipelineSDIVFSynthesizeAssetPacks(pipelineInput, execution!);
        
        const pipelineDuration = Date.now() - pipelineStartTime;
        log('[asset-pack-route] Pipeline execution completed', 'info', {
          correlationId,
          duration: pipelineDuration,
          success: true,
          // PR open is settle-only; synthesis success is not gated on prUrl.
          settledPrUrl: result?.shippable?.prUrl || result?.deliveryMechanism?.prUrl || null,
        });

        // Send completion
        const totalDuration = Date.now() - startTime;
        log('[asset-pack-route] Sending completion event', 'debug', {
          correlationId,
          totalDuration,
          prUrl: result?.shippable?.prUrl || result?.deliveryMechanism?.prUrl
        });
        
        // Telemetry: summarize file changes from editing history
        let fileChanges: { created: string[]; modified: string[]; deleted: string[] } | undefined;
        try {
          const { FILE_EDITOR_HISTORY } = await import('@bitcode/file-editing');
          const ops = FILE_EDITOR_HISTORY() || [];
          const created = new Set<string>();
          const modified = new Set<string>();
          const deleted = new Set<string>();
          for (const op of ops) {
            if (op.command === 'create') created.add(op.path);
            else if (op.command === 'delete') deleted.add(op.path);
            else if (op.command === 'replace' || op.command === 'str_replace' || op.command === 'patch') modified.add(op.path);
          }
          fileChanges = {
            created: Array.from(created),
            modified: Array.from(modified),
            deleted: Array.from(deleted),
          };
        } catch {}

        // Update run status - serialize execution data
        const executionData: any = {
          namespaces: execution.getNamespaces(),
          data: {}
        };
        
        // Store all execution data by namespace
        for (const namespace of execution.getNamespaces()) {
          const namespaceData = execution.getAll(namespace);
          if (namespaceData) {
            executionData.data[namespace] = Object.fromEntries(namespaceData.entries());
          }
        }
        // Enrich AssetPack completion with token, BTC fee-basis, and measured
        // non-fungible BTD aggregates before merging into execution output.
        let preprocessedSnapshot: any = undefined;
        try {
          preprocessedSnapshot =
            (execution as any).get?.('route/preprocessed', 'assetPackWrittenAsset') ||
            undefined;
          const writtenAssets =
            (execution as any).get?.('finish/asset_pack_completion', 'writtenAssets') ||
            (execution as any).get?.('finish/asset_pack_completion', 'assetPackSynthesisArtifacts') ||
            undefined;
          const assetPackSynthesisArtifacts =
            (execution as any).get?.('finish/asset_pack_completion', 'assetPackSynthesisArtifacts') ||
            (execution as any).get?.('implementation', 'assetPackSynthesisArtifacts') ||
            writtenAssets ||
            undefined;
          // Synthesis completion path: never project settleDelivery / settle PR.
          // Buyer-repo settle surfaces come only from settle-asset-pack-pipeline runs.
          const deliveryMechanism =
            (execution as any).get?.('finish/asset_pack_completion', 'deliveryMechanism') ||
            undefined;
          const settleDelivery = undefined;
          const read =
            (execution as any).get?.('finish/asset_pack_completion', 'read') ||
            (execution as any).get?.('pipeline', 'expressedRead') ||
            preprocessedSnapshot?.read ||
            undefined;
          const writtenAssetType =
            (execution as any).get?.('finish/asset_pack_completion', 'writtenAssetType') ||
            (execution as any).get?.('pipeline', 'writtenAssetType') ||
            preprocessedSnapshot?.writtenAssetType ||
            undefined;

          assetPackCompletion = {
            summary: (execution as any).get?.('finish/asset_pack_completion', 'summary'),
            processingStats: (execution as any).get?.('finish/asset_pack_completion', 'processingStats'),
            repoSnapshot: (execution as any).get?.('finish/asset_pack_completion', 'repoSnapshot'),
            assetPackSynthesisArtifacts,
            writtenAssets,
            settleDelivery,
            deliveryMechanism,
            read,
            writtenAssetType,
            assetPack:
              preprocessedSnapshot?.assetPack ||
              (read || writtenAssetType || preprocessedSnapshot?.deliveryTarget
                ? {
                    ...(read ? { read } : {}),
                    ...(writtenAssetType ? { writtenAssetType } : {}),
                    ...(preprocessedSnapshot?.deliveryTarget
                      ? { deliveryTarget: preprocessedSnapshot.deliveryTarget }
                      : {}),
                  }
                : undefined),
          };
          if (
            !assetPackCompletion?.summary &&
            !assetPackCompletion?.assetPackSynthesisArtifacts?.summary &&
            !assetPackCompletion?.writtenAssets?.summary &&
            !assetPackCompletion?.settleDelivery?.summary &&
            !assetPackCompletion?.deliveryMechanism?.summary
          ) assetPackCompletion = undefined;
        } catch {}

        // Aggregate token usage, BTC fee posture, and measured BTD amount if possible.
        if (assetPackCompletion) {
          if (!assetPackCompletion.processingStats) assetPackCompletion.processingStats = {};
          if (!assetPackCompletion.summary && assetPackCompletion.writtenAssets?.summary) {
            assetPackCompletion.summary = assetPackCompletion.writtenAssets.summary;
          }
          if (!assetPackCompletion.summary && assetPackCompletion.assetPackSynthesisArtifacts?.summary) {
            assetPackCompletion.summary = assetPackCompletion.assetPackSynthesisArtifacts.summary;
          }
          if (!assetPackCompletion.summary && assetPackCompletion.deliveryMechanism?.summary) {
            assetPackCompletion.summary = assetPackCompletion.deliveryMechanism.summary;
          }
          // Do not prefer settleDelivery.summary for synthesis completion —
          // settle is a separate pipeline; summary lives on finish/summary + artifacts.
          try {
            const supa = getAdminSupabase();
            const { data: tokenRows, error: tokenErr } = await (supa as any)
              .from('token_costs')
              .select('input_tokens, output_tokens, total_tokens, usd_cost')
              .eq('execution_id', runId);
            if (!tokenErr && tokenRows && tokenRows.length) {
              const tokens = tokenRows.reduce((acc: any, r: any) => {
                acc.input += r.input_tokens || 0;
                acc.output += r.output_tokens || 0;
                acc.total += r.total_tokens || 0;
                acc.usd += r.usd_cost || 0;
                return acc;
              }, { input: 0, output: 0, total: 0, usd: 0 });
              const measuredBtd = Math.max(1, Math.ceil(tokens.total / 1000));
              assetPackCompletion.processingStats.tokens = { input: tokens.input, output: tokens.output, total: tokens.total };
              assetPackCompletion.processingStats.measuredBtd = measuredBtd;
              assetPackCompletion.processingStats.btdSemantics = BTD_ASSET_SEMANTICS;
              assetPackCompletion.processingStats.feeAsset = BITCODE_FEE_ASSET;
              assetPackCompletion.processingStats.btcFeesPaid = null;
              assetPackCompletion.processingStats.btcFeeUsdEquivalent = Number(tokens.usd.toFixed(2));
            }
          } catch {}

          try {
            const { averageLatencyMs, modelUsage } = await aggregateLLMMetrics(runId);
            if (averageLatencyMs !== null) {
              assetPackCompletion.processingStats.averageLatencyMs = averageLatencyMs;
            }
            if (modelUsage.length) {
              assetPackCompletion.processingStats.modelUsage = modelUsage;
            }
          } catch {}
        }

        // Attach postprocessed result for unified read, enriched with ReadyToFinish
        let postprocessed: any = undefined;
        const assetPackRequestSnapshot = preprocessedSnapshot;
        const writtenAssetType =
          (execution as any).get?.('pipeline', 'writtenAssetType') ||
          assetPackRequestSnapshot?.writtenAssetType ||
          undefined;
        try {
          postprocessed = (execution as any).get?.('postprocessed', 'result');
          // Enrich with ReadyToFinish decision if available
          try {
            const approved = (execution as any).get?.(NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH, 'approved');
            const assessment = (execution as any).get?.(NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH, 'assessment');
            const confidence = (execution as any).get?.(NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH, 'confidence');
            if (typeof approved !== 'undefined' && postprocessed && typeof postprocessed === 'object') {
              postprocessed = {
                ...postprocessed,
                validationReady: {
                  approved: !!approved,
                  assessment: assessment || null,
                  confidence: typeof confidence === 'number' ? confidence : null
                }
              };
            }
          } catch {}
        } catch {}

        // Build client-facing result only after semantic asset-pack-completion mirrors
        // have been extracted so the streamed completion payload can carry the
        // same Bitcode-owned meaning as persisted reread.
        const semanticCompletion = buildSemanticCompletionResult({
          result,
          assetPackCompletion,
          fileChanges: fileChanges as any,
        });
        const clientResult: any = semanticCompletion.clientResult;
        fileChanges = (semanticCompletion.fileChanges as any) || fileChanges;

        const completionEvent = {
          type: 'completion',
          result: clientResult,
          duration: totalDuration,
          correlationId,
          fileChanges
        };

        await writer.write(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
        await orm.executionEvents.create({
          execution_id: runId,
          event_type: completionEvent.type,
          event_data: { ...completionEvent, runId } as any
        } as any);

        const completionMetadata: Record<string, any> = {
          ...(executionData?.namespaces ? { namespaces: executionData.namespaces } : {}),
          ...(executionData?.data ? { data: executionData.data } : {}),
          repository: `${repoOwner}/${repoName}`,
          definitionOfRead: definition_of_read,
          durationMs: Date.now() - startTime,
          guide: 'SDIVF',
          shippableWrittenAssetType: assetPackCompletion?.writtenAssetType || writtenAssetType,
          writtenAssetType: assetPackCompletion?.writtenAssetType || writtenAssetType,
          read: assetPackCompletion?.read || preprocessedSnapshot?.read || definition_of_read,
          assetPack: assetPackCompletion?.assetPack || preprocessedSnapshot?.assetPack || null,
          assetPackSynthesisArtifacts: assetPackCompletion?.assetPackSynthesisArtifacts || null,
          settleDelivery: assetPackCompletion?.settleDelivery || null,
          semanticKind:
            assetPackCompletion?.assetPackSynthesisArtifacts ||
            assetPackCompletion?.writtenAssets ||
            assetPackCompletion?.settleDelivery ||
            assetPackCompletion?.deliveryMechanism ||
            assetPackCompletion?.assetPack
              ? 'asset-pack-written-asset'
              : null,
        };

        await orm.pipelineExecutions.update(runId, {
          status: 'completed',
          output: { ...(result as any),
            ...(preprocessedSnapshot ? { preprocessed: preprocessedSnapshot } : {}),
            ...(assetPackCompletion ? { asset_pack_completion: assetPackCompletion } : {}),
            ...(postprocessed ? { postprocessed } : {})
          } as any,
          metadata: completionMetadata as any,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);

        // Completion notifications/emails gated by flag
        if (process.env.BITCODE_ENABLE_NOTIFICATIONS === 'true') {
          const completionAssetPack =
            assetPackCompletion?.assetPack ||
            preprocessedSnapshot?.assetPack ||
            routeSemanticAssetPack;
          const completionRead =
            assetPackCompletion?.read ||
            preprocessedSnapshot?.read ||
            definition_of_read;
          const completionWrittenAssetType =
            assetPackCompletion?.writtenAssetType ||
            preprocessedSnapshot?.writtenAssetType ||
            writtenAssetType ||
            null;
          const completionWrittenAssets =
            assetPackCompletion?.writtenAssets ||
            assetPackCompletion?.assetPackSynthesisArtifacts ||
            null;
          const completionDelivery =
            assetPackCompletion?.deliveryMechanism ||
            assetPackCompletion?.settleDelivery ||
            null;
          const completionFileChanges = completionWrittenAssets?.fileChanges || null;
          const completionFilesChanged = Array.isArray(completionFileChanges?.paths)
            ? completionFileChanges.paths.length
            : typeof completionFileChanges?.edited === 'number' ||
                typeof completionFileChanges?.created === 'number' ||
                typeof completionFileChanges?.deleted === 'number'
              ? (completionFileChanges.edited || 0) +
                (completionFileChanges.created || 0) +
                (completionFileChanges.deleted || 0)
              : 'pending';
          const completionMeasuredBtd =
            typeof assetPackCompletion?.processingStats?.measuredBtd === 'number'
              ? assetPackCompletion.processingStats.measuredBtd
              : 'pending final measurement';
          const completionSummary =
            assetPackCompletion?.summary ||
            completionWrittenAssets?.summary ||
            `${completionWrittenAssetType || 'AssetPack'} completed for ${repoOwner}/${repoName}`;
          const completionDeliveryMechanism =
            completionDelivery?.pullRequest?.url || completionAssetPack?.deliveryTarget === 'pr'
              ? 'Pull request'
              : 'AssetPack record';

          await orm.notifications.create({
            user_id: user.id,
            type: 'pipeline_execution_completed',
            title: `Bitcode Asset-Pack Run Completed`,
            message: `Your Bitcode asset-pack run (${runId}) has completed.`,
            data: {
              runId,
              semanticEventType: 'asset_pack_run_completed',
              semanticKind: 'asset-pack-written-asset',
              read: completionRead,
              writtenAssetType: completionWrittenAssetType,
              assetPack: completionAssetPack,
            }
          });

          const origin = new URL(request.url).origin;
          await sendEmail({
            to: user.email || '',
            subject: `Your Bitcode asset-pack run #${runId} is complete`,
            template: 'asset_pack_complete',
            vars: {
              name: user.user_metadata?.full_name || '',
              Name: String(completionRead || 'AssetPack run').slice(0, 120),
              Description: completionSummary,
              MeasuredBtd: completionMeasuredBtd,
              FilesChanged: completionFilesChanged,
              DeliveryMechanism: completionDeliveryMechanism,
              runId,
              runUrl: `${origin}/packs?transactionId=${encodeURIComponent(runId)}`,
              BitcodeURL: `${origin}/packs?transactionId=${encodeURIComponent(runId)}`,
              origin,
              year: new Date().getFullYear()
            }
          });
        }

        // Send completion telemetry
        await sendServerEvent('asset_pack_run_completed', {
          run_id: runId,
          user_id: user.id,
          duration_ms: Date.now() - startTime,
          success: true,
          semantic_event_type: 'asset_pack_run_completed',
          semantic_kind: 'asset-pack-written-asset',
          read: assetPackCompletion?.read || preprocessedSnapshot?.read || definition_of_read,
          written_asset_type:
            assetPackCompletion?.writtenAssetType ||
            preprocessedSnapshot?.writtenAssetType ||
            writtenAssetType ||
            null,
          asset_pack:
            assetPackCompletion?.assetPack ||
            preprocessedSnapshot?.assetPack ||
            routeSemanticAssetPack,
        });

      } catch (error) {
        const reportedError = reportError(error);
        const currentPhase = (execution?.get('pipeline', 'currentPhase') as string) || 'unknown';
        
        log('[asset-pack-route] Pipeline execution failed', 'error', {
          correlationId,
          runId,
          phase: currentPhase,
          error: reportedError.message,
          errorCode: reportedError.code,
          stack: reportedError.stack,
          duration: Date.now() - startTime
        });
        
        // Send error event
        const errorEvent = {
          type: 'error',
          error: reportedError.message,
          correlationId,
          phase: currentPhase
        };
        
        await writer.write(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        await orm.executionEvents.create({
          execution_id: runId,
          event_type: errorEvent.type || 'error',
          event_data: { ...errorEvent, runId } as any
        } as any);

        // Update run status
        log('[asset-pack-route] Updating run status to failed', 'debug', { correlationId });
        await orm.pipelineExecutions.update(runId, {
          status: 'failed',
          error: JSON.stringify({ message: reportedError.message, stack: reportedError.stack, phase: currentPhase }),
          updated_at: new Date().toISOString()
        } as any);
        // If a pipeline_runs metadata table is present in the environment, best-effort update
        try {
          const pipelineRunsMetadata = (orm as any).pipelineRuns;
          await pipelineRunsMetadata?.update?.(runId, {
            status: 'failed',
            metadata: {
              correlationId,
              repoOwner,
              repoName,
              repoBranch,
              attachmentsCount: attachments?.length || 0,
              failed_at: new Date().toISOString()
            } as any
          } as any);
        } catch {}

        // There is no `$BTD` refund path here: `$BTD` is a non-fungible
        // AssetPack share/read-right, while fees settle through BTC surfaces.

        // Send failure telemetry
        await sendServerEvent('asset_pack_run_failed', {
          run_id: runId,
          user_id: user.id,
          duration_ms: Date.now() - startTime,
          error_code: reportedError.code,
          error_message: reportedError.message,
          semantic_event_type: 'asset_pack_run_failed',
          semantic_kind: 'asset-pack-written-asset',
          read: assetPackCompletion?.read || definition_of_read,
          written_asset_type: assetPackCompletion?.writtenAssetType || null,
          asset_pack: assetPackCompletion?.assetPack || routeSemanticAssetPack,
        });

      } finally {
        log('[asset-pack-route] Closing stream writer', 'debug', { correlationId, runId });
        if (!streamClosed) {
          try { await writer.close(); streamClosed = true; } catch {}
        }
        try { streamer.complete(); ExecutionStreamAdapter.unregisterStreamer(runId); } catch {}
      }
    })();

    // Return streaming response
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    const reportedError = reportError(error);
    log('[asset-pack-route] Error', 'error', { correlationId, error: reportedError });
    return createErrorResponse(reportedError);
  }
});

/**
 * DELETE /api/executions/:runId
 * 
 * Cancel a running AssetPack pipeline mounted behind the retained route path.
 */
export const DELETE = traceRoute('/executions', async (request: NextRequest) => {
  const correlationId = crypto.randomUUID();
  
  try {
    // Get runId from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const runId = pathParts[pathParts.length - 1];
    
    if (!runId || runId === 'executions') {
      return createJsonResponse({
        error: 'Run ID is required',
        message: 'Please provide a run ID to cancel'
      }, 400);
    }
    
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      log('[asset-pack-route] Authentication failed for cancel', 'warn', { correlationId });
      return createAuthErrorResponse();
    }
    
    // Update run status to cancelled
    await orm.pipelineExecutions.update(runId, {
      status: 'cancelled',
      completed_at: new Date().toISOString()
    } as any);
        // If a pipeline_runs metadata table is present in the environment, best-effort update
        try {
          const pipelineRunsMetadata = (orm as any).pipelineRuns;
          await pipelineRunsMetadata?.update?.(runId, {
            status: 'cancelled',
            metadata: {
              correlationId,
          cancelled_at: new Date().toISOString()
        } as any
      } as any);
    } catch {}
    
    // Cancellation notifications gated by flag
    if (process.env.BITCODE_ENABLE_NOTIFICATIONS === 'true') {
      await orm.notifications.create({
        user_id: user.id,
        type: 'pipeline_execution_cancelled',
        title: `Bitcode Asset-Pack Run Cancelled`,
        message: `Your Bitcode asset-pack run (${runId}) has been cancelled.`,
        data: {
          runId,
          semanticEventType: 'asset_pack_run_cancelled',
          semanticKind: 'asset-pack-written-asset',
        }
      });
    }
    
    // Log cancellation event
    await sendServerEvent('asset_pack_run_cancelled', {
      run_id: runId,
      user_id: user.id,
      correlation_id: correlationId,
      semantic_event_type: 'asset_pack_run_cancelled',
      semantic_kind: 'asset-pack-written-asset',
    });
    
    return createJsonResponse({
      success: true,
      message: 'Pipeline cancelled successfully',
      runId
    });
    
  } catch (error) {
    const reportedError = reportError(error);
    log('[asset-pack-route] Cancel error', 'error', { correlationId, error: reportedError });
    return createErrorResponse(reportedError);
  }
});
