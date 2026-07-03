import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { GitHubService } from '@bitcode/api/src/vcs/github-service';
import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { createStreamingExecution, emitPhaseTransition } from '@bitcode/pipelines-generics';
import {
  applyExclusionsToInventory,
  normalizeProtectedIpExclusions,
  validateDepositSynthesisOptions,
  type AssetPacksSynthesisResult,
  type AssetPacksSynthesisSourceInventory,
} from '@bitcode/pipeline-asset-pack/asset-packs-synthesis';
import { synthesizeAssetPacksPipeline } from '@bitcode/pipeline-asset-pack';
import { buildRealDepositAssetPackOptionSynthesis } from '@bitcode/pipeline-asset-pack/deposit-option-real-synthesis';
import { isAssetPackRealInferenceEnabled } from '@bitcode/pipeline-asset-pack/runtime-inference-policy';
import {
  provisionDepositSourceInventory,
  resolveDepositPipelineHost,
  runDepositInBoxHarness,
  selectDepositHostKind,
} from '@/lib/deposit-source-provisioning';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';
import { sweepOrphanedExecutions } from '@/lib/execution-orphan-sweep';

export const runtime = 'nodejs';
export const maxDuration = 300;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SynthesizeOptionsBody = {
  runId?: unknown;
  repositoryFullName?: unknown;
  sourceBranch?: unknown;
  sourceCommit?: unknown;
  obfuscations?: unknown;
  protectedIpExclusions?: unknown;
  demandContext?: unknown;
  depositoryDemandSignals?: unknown;
  readingDemandSignals?: unknown;
  existingDepositorySignals?: unknown;
};

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

function readSignals(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (entry && typeof entry === 'object' && !Array.isArray(entry) ? (entry as Record<string, unknown>) : null))
    .filter((entry): entry is Record<string, unknown> => entry !== null)
    .map((entry) => ({
      id: readString(entry.id),
      label: readString(entry.label),
      summary: readString(entry.summary),
      weight: typeof entry.weight === 'number' ? entry.weight : null,
    }));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: 'A Bitcode session is required for deposit option synthesis.', code: 'deposit_session_required' },
      { status: 401 },
    );
  }

  if (!isAssetPackRealInferenceEnabled()) {
    return NextResponse.json(
      {
        error:
          'Real deposit option synthesis requires BITCODE_ASSET_PACK_REAL_INFERENCE so options carry real measurements.',
        code: 'real_inference_required',
      },
      { status: 422 },
    );
  }

  let body: SynthesizeOptionsBody;
  try {
    body = (await request.json()) as SynthesizeOptionsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const repositoryFullName = readString(body.repositoryFullName);
  if (!repositoryFullName || !/^[\w.-]+\/[\w.-]+$/.test(repositoryFullName)) {
    return NextResponse.json({ error: 'repositoryFullName (owner/repo) is required.' }, { status: 400 });
  }
  const requestedRunId = readString(body.runId);
  const runId = requestedRunId && UUID_PATTERN.test(requestedRunId) ? requestedRunId : randomUUID();

  // Fire-and-forget: finalize runs orphaned by server restarts/crashed hosts
  // (rows stuck `running` with no stream activity) so they read as
  // `interrupted` instead of running forever.
  void sweepOrphanedExecutions(supabaseAdmin).catch(() => {});
  const sourceBranch = readString(body.sourceBranch);
  const sourceCommit = readString(body.sourceCommit);
  const obfuscations = readString(body.obfuscations);
  const protectedIpExclusions = normalizeProtectedIpExclusions(readStringList(body.protectedIpExclusions));
  const demandContext = readStringList(body.demandContext);

  const { data: ownedRepository, error: repositoryError } = await supabaseAdmin
    .from('vcs_repositories')
    .select('repo_full_name')
    .eq('user_id', user.id)
    .eq('repo_full_name', repositoryFullName)
    .maybeSingle();
  if (repositoryError) {
    return NextResponse.json({ error: repositoryError.message }, { status: 500 });
  }
  if (!ownedRepository) {
    return NextResponse.json(
      { error: 'Repository is not in the connected GitHub inventory for this account.', code: 'repository_not_connected' },
      { status: 403 },
    );
  }

  const { data: githubConnection, error: connectionError } = await supabaseAdmin
    .from('user_connections')
    .select('connection_data')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .eq('is_active', true)
    .maybeSingle();
  if (connectionError || !githubConnection?.connection_data) {
    return NextResponse.json(
      { error: 'An active GitHub connection is required for deposit option synthesis.', code: 'github_connection_required' },
      { status: 422 },
    );
  }

  // Streaming execution: a running executions row plus live execution_events
  // the /deposit accordion log tails. Only source-safe telemetry streams
  // (phase/agent/stage/provider/model/usage); prompt and response content is
  // withheld by the synthesis bridge.
  const execution = createStreamingExecution({
    runId,
    userId: user.id,
    supabase: supabaseAdmin,
    streamToDatabase: true,
    structuredToDatabase: false,
  });
  const emitStatus = (message: string, extra: Record<string, unknown> = {}) =>
    ExecutionStreamAdapter.emitEvent(execution.id, 'status' as never, { message, ...extra });

  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  const finalizeExecutionRow = async (row: Record<string, unknown>) => {
    const { error: rowError } = await supabaseAdmin.from('executions').upsert(
      {
        id: runId,
        user_id: user.id,
        type: 'agentic-execution:asset-pack',
        created_at: startedAtIso,
        started_at: startedAtIso,
        updated_at: new Date().toISOString(),
        ...row,
      },
      { onConflict: 'id' },
    );
    if (rowError) {
      bitcodeServerTelemetry('warn', 'deposit-synthesize-options', 'execution-write-failed', {
        userId: compactBitcodeServerId(user.id),
        message: rowError.message,
      });
    }
  };

  // F26-B: the synthesis runs the full formal hierarchy (many LLM calls), so it
  // must NOT be bound to this request's maxDuration. Dispatch it as a background
  // run (the local in-process harness host) and return the runId immediately; the
  // client tails source-safe telemetry and, on the completion event, reads the
  // persisted synthesis from the execution row output. Prod durability is the
  // Vercel Sandbox host (pipeline-hosts). The F25 per-call LLM timeout remains the
  // safety bound within the run.
  const runSynthesis = async () => {
   try {
    await emitPhaseTransition(execution as never, 'deposit-option-synthesis', 'start', {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
    });
    await emitStatus(`AssetPacksSynthesis (deposit lens) started for ${repositoryFullName}.`);

    const auth = await GitHubService.getValidAuth(
      githubConnection.connection_data as never,
      user.id,
      supabaseAdmin,
    );
    const reference = sourceCommit || sourceBranch || 'HEAD';
    const DEPOSIT_OPTION_KINDS = ['capability-slice', 'implementation-pattern', 'proof-operations-slice'];
    // The synthesis runs WITHIN the configured Host. InlineHost runs it in this box
    // (provision the full checkout + run the pipeline in-process). SandboxHost runs it
    // IN the box (#25): the harness dispatches the deposit pipeline into the sandbox,
    // which clones + runs over its local checkout; the options come back in evidence.
    const hostKind = selectDepositHostKind();
    let rawOptions: Parameters<typeof validateDepositSynthesisOptions>[0];
    let inventoryPaths: string[];
    // The inventory the option projection + persistence reference. Real for inline;
    // for the sandbox path the box held the inventory, so a minimal shape is rebuilt
    // from the returned options (exclusions were already enforced in-box).
    let inventory: AssetPacksSynthesisSourceInventory;

    if (hostKind === 'sandbox') {
      await emitStatus(
        `Dispatching deposit synthesis to the sandbox host (in-box) for ${repositoryFullName}@${reference}…`,
      );
      rawOptions = (await runDepositInBoxHarness({
        repositoryFullName,
        revision: reference,
        branch: sourceBranch,
        commit: sourceCommit,
        token: auth.accessToken,
        obfuscations,
        protectedIpExclusions,
        demandContext,
        onEvent: (event) => {
          void emitStatus(`sandbox: ${event.type}`);
        },
      })) as Parameters<typeof validateDepositSynthesisOptions>[0];
      // The in-box run validated covered paths against the real inventory; the route's
      // re-validation enforces exclusions over the options' own covered paths.
      inventoryPaths = [
        ...new Set((rawOptions || []).flatMap((option: any) => option?.coveredSourcePaths || [])),
      ] as string[];
      inventory = {
        paths: inventoryPaths,
        samples: [],
        sources: [],
        totalPathCount: inventoryPaths.length,
        excludedPathCount: 0,
      };
    } else {
      const host = await resolveDepositPipelineHost();
      await emitStatus(
        `Provisioning ${repositoryFullName}@${reference} on the ${host.capabilities.hostKind} host…`,
      );
      const provisioned = await provisionDepositSourceInventory({
        host,
        repositoryFullName,
        url: `https://github.com/${repositoryFullName}.git`,
        revision: reference,
        token: auth.accessToken,
      });
      inventory = applyExclusionsToInventory(provisioned, protectedIpExclusions);
      await emitStatus(
        `Checkout ready: ${inventory.paths.length} files (${inventory.excludedPathCount} withheld by ${protectedIpExclusions.length} protected-IP exclusions; full source measured, ${inventory.samples.length} prompt excerpts).`,
      );
      await emitStatus(
        'Running SynthesizeAssetPacks (deposit mode): Setup → Discovery → Implementation → Validation → Finish…',
      );
      const [owner, name] = repositoryFullName.split('/');
      await synthesizeAssetPacksPipeline(
        {
          mode: 'deposit',
          synthesizeMode: 'deposit',
          repositoryFullName,
          sourceBranch,
          sourceCommit,
          repository: {
            owner,
            name,
            repo: name,
            branch: sourceBranch,
            commit: sourceCommit,
            fullName: repositoryFullName,
            url: `https://github.com/${repositoryFullName}`,
          },
          obfuscations,
          protectedIpExclusions,
          demandContext,
          inventory,
          candidateKinds: DEPOSIT_OPTION_KINDS,
        } as never,
        execution as never,
      );
      rawOptions = ((execution as any).get?.('implementation', 'options') ??
        (execution as any).findUp?.('implementation', 'options') ??
        []) as Parameters<typeof validateDepositSynthesisOptions>[0];
      inventoryPaths = inventory.paths;
    }

    const validated = validateDepositSynthesisOptions(rawOptions, {
      lens: 'deposit',
      inventoryPaths,
      protectedIpExclusions,
      candidateKinds: DEPOSIT_OPTION_KINDS,
    });
    const result: AssetPacksSynthesisResult = {
      lens: 'deposit',
      candidates: validated.candidates,
      droppedCandidateCount: validated.droppedCandidateCount,
      exclusionViolations: validated.exclusionViolations,
      inference: { provider: null, model: null, totalTokens: null, durationMs: Date.now() - startedAt },
    };
    await emitStatus(
      `Validated candidates fail-closed: ${result.candidates.length} admissible, ${result.droppedCandidateCount} dropped.`,
    );

    const { synthesis, reviewProjections } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        obfuscations,
        protectedIpExclusions,
        depositoryDemandSignals: readSignals(body.depositoryDemandSignals),
        readingDemandSignals: readSignals(body.readingDemandSignals),
        existingDepositorySignals: readSignals(body.existingDepositorySignals),
        createdAt: new Date().toISOString(),
      },
      result,
      inventory,
    );

    const durationMs = Date.now() - startedAt;
    await emitStatus(
      `Synthesized ${synthesis.optionCount} measured AssetPack options (${result.inference.totalTokens ?? 'n/a'} tokens, ${(durationMs / 1000).toFixed(1)}s).`,
    );
    await emitPhaseTransition(execution as never, 'deposit-option-synthesis', 'complete', {
      optionCount: synthesis.optionCount,
    });

    // Persist the synthesis BEFORE the completion event so the client's
    // completion-triggered history fetch always finds it (the reviewProjections
    // ride along on the output now that the route no longer returns them inline).
    await finalizeExecutionRow({
      status: 'completed',
      completed_at: new Date().toISOString(),
      context: {
        source: 'deposit-option-synthesis',
        workbench: 'deposit-option-synthesis',
        route: '/deposit',
        pipelineCore: 'AssetPacksSynthesis',
        synthesisMode: synthesis.synthesisMode,
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        optionCount: synthesis.optionCount,
        synthesisRoot: synthesis.roots.synthesisRoot,
        exclusionCount: synthesis.exclusionPosture.protectedIpExclusionCount,
        excludedPathCount: synthesis.exclusionPosture.excludedPathCount,
        droppedCandidateCount: synthesis.exclusionPosture.droppedCandidateCount,
        inventoryPathCount: inventory.paths.length,
        inferenceProvider: result.inference.provider,
        inferenceModel: result.inference.model,
      },
      output: {
        summary: `Synthesized ${synthesis.optionCount} measured AssetPack options for ${repositoryFullName} via AssetPacksSynthesis (deposit lens).`,
        depositOptionSynthesis: synthesis,
        reviewProjections,
        inference: { ...result.inference, durationMs },
        exclusionViolations: result.exclusionViolations,
      },
      items: [],
      total_tokens: result.inference.totalTokens,
      duration_ms: durationMs,
    });

    await ExecutionStreamAdapter.emitEvent(execution.id, 'completion' as never, {
      message: `AssetPacksSynthesis completed with ${synthesis.optionCount} measured options.`,
      runId,
    });

    bitcodeServerTelemetry('info', 'deposit-synthesize-options', 'synthesized', {
      userId: compactBitcodeServerId(user.id),
      repositoryFullName,
      runId,
      optionCount: synthesis.optionCount,
      droppedCandidateCount: synthesis.exclusionPosture.droppedCandidateCount,
      totalTokens: result.inference.totalTokens,
      durationMs,
    });
   } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await ExecutionStreamAdapter.emitEvent(execution.id, 'error' as never, { message, runId });
    } catch {}
    await finalizeExecutionRow({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: { message },
      context: {
        source: 'deposit-option-synthesis',
        route: '/deposit',
        pipelineCore: 'AssetPacksSynthesis',
        repositoryFullName,
        sourceBranch,
        sourceCommit,
      },
      duration_ms: Date.now() - startedAt,
    });
    bitcodeServerTelemetry('warn', 'deposit-synthesize-options', 'failed', {
      userId: compactBitcodeServerId(user.id),
      repositoryFullName,
      runId,
      message,
    });
   } finally {
    ExecutionStreamAdapter.unregisterStreamer(execution.id);
   }
  };

  void runSynthesis();
  return NextResponse.json({ ok: true, executionId: runId, runId, status: 'dispatched' });
}
