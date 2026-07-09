import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { GitHubService } from '@bitcode/api/src/vcs/github-service';
import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { createStreamingExecution, emitPhaseTransition } from '@bitcode/pipelines-generics';
import {
  applyInventoryScope,
  normalizeForcedPathList,
  sumLlmTokensFromExecutionTree,
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
  assertExecutionNotCancelled,
  ExecutionCancelledError,
  isExecutionCancelled,
  isExecutionCancelledError,
} from '@/lib/execution-cancel';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';
import { sweepOrphanedExecutions } from '@/lib/execution-orphan-sweep';

export const runtime = 'nodejs';
// Full-repo deposit synthesis (setup+discovery alone) regularly exceeds 5
// minutes of LLM work. Vercel waitUntil is capped by maxDuration — too-low
// values kill the host mid-pipeline with no catch finalize (UI: stalled
// "Run failed." with empty error event). Keep this high for deposit.
export const maxDuration = 800;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SynthesizeOptionsBody = {
  runId?: unknown;
  repositoryFullName?: unknown;
  sourceBranch?: unknown;
  sourceCommit?: unknown;
  obfuscations?: unknown;
  /** Forced Inclusion roots — when non-empty, inventory is scoped to these paths. */
  forcedInclusions?: unknown;
  forcedExclusions?: unknown;
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
  // `interrupted` instead of running forever. waitUntil (V48-Gate3-F31) keeps
  // this Vercel Function instance alive for the sweep even though the
  // response below doesn't wait on it.
  waitUntil(sweepOrphanedExecutions(supabaseAdmin).catch(() => {}));
  const sourceBranch = readString(body.sourceBranch);
  const sourceCommit = readString(body.sourceCommit);
  const obfuscations = readString(body.obfuscations);
  // Prefer canonical names; accept legacy body keys once for in-flight clients.
  const forcedInclusions = normalizeForcedPathList(
    readStringList(
      body.forcedInclusions ??
        (body as { sourcePathHints?: unknown }).sourcePathHints,
    ),
  );
  const forcedExclusions = normalizeForcedPathList(
    readStringList(
      body.forcedExclusions ??
        (body as { protectedIpExclusions?: unknown }).protectedIpExclusions,
    ),
  );
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

  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();

  // The client may supply the runId (so its log can tail from the first
  // event), which means the id must be guarded BEFORE any write — including
  // the streaming-execution setup below, whose row insert fires at creation:
  // a chosen id colliding with an existing row would otherwise hijack or
  // overwrite another run (the dispatch upsert writes user_id/status/context
  // wholesale), and a duplicate POST of the same id would double-run the
  // pipeline into one row.
  const { data: existingRun } = await supabaseAdmin
    .from('executions')
    .select('id, user_id, status')
    .eq('id', runId)
    .maybeSingle();
  if (existingRun) {
    return NextResponse.json(
      {
        error:
          existingRun.user_id === user.id
            ? 'This run id has already been dispatched.'
            : 'This run id is not available.',
        code: 'run_id_conflict',
      },
      { status: 409 },
    );
  }

  // Master-detail lens identity AT DISPATCH: the streaming-execution insert
  // is a bare running row (type only, context null), which left running rows
  // lens-ambiguous in the pipelines tables until completion. Upsert the
  // synthesis identity + source coordinates first, so a running row is
  // selectable/attachable as a Deposit synthesis run from the first refresh
  // (the streaming setup's duplicate bare insert is swallowed); the
  // completion upsert overwrites this with the full context.
  const { error: dispatchContextError } = await supabaseAdmin.from('executions').upsert(
    {
      id: runId,
      user_id: user.id,
      type: 'agentic-execution:asset-pack',
      status: 'running',
      created_at: startedAtIso,
      started_at: startedAtIso,
      updated_at: new Date().toISOString(),
      context: {
        source: 'deposit-option-synthesis',
        workbench: 'deposit-option-synthesis',
        route: '/deposits',
        pipelineCore: 'AssetPacksSynthesis',
        synthesisMode: 'deposit',
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        // Steering shape only (paths/counts) — never obfuscations prose.
        forcedInclusionCount: forcedInclusions.length,
        forcedExclusionCount: forcedExclusions.length,
        hasObfuscations: Boolean(obfuscations),
      },
    },
    { onConflict: 'id' },
  );
  if (dispatchContextError) {
    bitcodeServerTelemetry('warn', 'deposit-synthesize-options', 'dispatch-context-write-failed', {
      userId: compactBitcodeServerId(user.id),
      message: dispatchContextError.message,
    });
  }

  // Streaming execution: a running executions row plus live execution_events
  // the /deposits accordion log tails. Only source-safe telemetry streams
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

  // V48-Gate3-F26-B: the synthesis runs the full formal hierarchy (many LLM calls), so it
  // must NOT be bound to this request's maxDuration. Dispatch it as a background
  // run (the local in-process harness host) and return the runId immediately; the
  // client tails source-safe telemetry and, on the completion event, reads the
  // persisted synthesis from the execution row output. Prod durability is the
  // Vercel Sandbox host (pipeline-hosts). The F25 per-call LLM timeout remains the
  // safety bound within the run.
  //
  // V48-Gate3-F31: the JSON response below returns (and the request completes)
  // long before this finishes. On Vercel, a Function instance is free to be
  // frozen/recycled once its response is sent — a bare `void runSynthesis()`
  // has no guarantee of surviving past that point, which is exactly how the
  // "crashed serverless boxes" orphaned runs above got orphaned in the first
  // place (see execution-orphan-sweep.ts). waitUntil keeps this invocation
  // alive until the promise settles, so the run either completes or fails
  // (and finalizes its row) instead of being silently killed mid-flight.
  const runSynthesis = async () => {
   // Cooperative cancel: poll executions.status between major stages and inside
   // the sandbox detached poll (shouldAbort). Never overwrite a cancelled row.
   const assertNotCancelled = () =>
     assertExecutionNotCancelled(supabaseAdmin, runId);
   const mergeDispatchContext = async (patch: Record<string, unknown>) => {
     try {
       const { data: existing } = await supabaseAdmin
         .from('executions')
         .select('context')
         .eq('id', runId)
         .maybeSingle();
       const prev =
         existing?.context && typeof existing.context === 'object'
           ? (existing.context as Record<string, unknown>)
           : {};
       await supabaseAdmin
         .from('executions')
         .update({
           context: { ...prev, ...patch },
           updated_at: new Date().toISOString(),
         })
         .eq('id', runId)
         .eq('status', 'running');
     } catch {
       // Best-effort: cancel can still stop by row status alone.
     }
   };

   try {
    await assertNotCancelled();
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
    let boundSandboxId: string | null = null;

    if (hostKind === 'sandbox') {
      await assertNotCancelled();
      await emitStatus(
        `Dispatching deposit synthesis to the sandbox host (in-box) for ${repositoryFullName}@${reference}…`,
      );
      const harnessResult = await runDepositInBoxHarness({
        repositoryFullName,
        revision: reference,
        branch: sourceBranch,
        commit: sourceCommit,
        token: auth.accessToken,
        obfuscations,
        // Sandbox harness currently steers exclusions; Forced Inclusion is
        // enforced on the inline inventory path and re-validated on options.
        forcedExclusions,
        demandContext,
        shouldAbort: () => isExecutionCancelled(supabaseAdmin, runId),
        onEvent: (event) => {
          void emitStatus(`sandbox: ${event.type}`);
          if (event.type === 'sandbox-created' && event.sandboxId) {
            boundSandboxId = event.sandboxId;
            void mergeDispatchContext({
              sandboxId: event.sandboxId,
              hostKind: 'sandbox',
            });
          }
        },
      });
      boundSandboxId = harnessResult.sandboxId ?? boundSandboxId;
      if (harnessResult.outcome === 'cancelled') {
        throw new ExecutionCancelledError(runId);
      }
      rawOptions = harnessResult.options as Parameters<
        typeof validateDepositSynthesisOptions
      >[0];
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
      await assertNotCancelled();
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
      await assertNotCancelled();
      // Forced Inclusion scopes measurement to selected roots; Forced Exclusion
      // removes protected-IP paths fail-closed. Both bound the full sources blob
      // so monorepo checkouts do not materialize multi-hundred-MB inventories
      // into pipeline stores/events (Invalid string length).
      inventory = applyInventoryScope(provisioned, {
        inclusions: forcedInclusions,
        exclusions: forcedExclusions,
      });
      await emitStatus(
        `Checkout ready: ${inventory.paths.length} files (${inventory.excludedPathCount} out of scope — ${forcedInclusions.length} Forced Inclusion root(s), ${forcedExclusions.length} Forced Exclusion(s); full source measured, ${inventory.samples.length} prompt excerpts).`,
      );
      await emitStatus(
        'Running SynthesizeAssetPacks (deposit mode): Setup → Discovery → Implementation → Validation → Finish…',
      );
      await assertNotCancelled();
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
          forcedInclusions,
          forcedExclusions,
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

    await assertNotCancelled();
    const validated = validateDepositSynthesisOptions(rawOptions, {
      lens: 'deposit',
      inventoryPaths,
      forcedExclusions,
      candidateKinds: DEPOSIT_OPTION_KINDS,
    });
    // Roll up usage from the full SDIVF execution tree (Map children + nested PTRR).
    const rolledTokens = sumLlmTokensFromExecutionTree(execution as never);
    const result: AssetPacksSynthesisResult = {
      lens: 'deposit',
      candidates: validated.candidates,
      droppedCandidateCount: validated.droppedCandidateCount,
      exclusionViolations: validated.exclusionViolations,
      inference: {
        provider: null,
        model: null,
        totalTokens: rolledTokens,
        durationMs: Date.now() - startedAt,
      },
    };
    await emitStatus(
      `Validated candidates fail-closed: ${result.candidates.length} admissible, ${result.droppedCandidateCount} dropped.`,
    );
    if (result.candidates.length === 0) {
      const detail =
        result.exclusionViolations.length > 0
          ? result.exclusionViolations.slice(0, 5).join('; ')
          : 'no admissible measured candidates survived Validation absolutes / source-safety checks';
      throw new Error(
        `AssetPacksSynthesis produced zero admissible options (fail-closed): ${detail}`,
      );
    }

    const { synthesis, reviewProjections } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        obfuscations,
        forcedInclusions,
        forcedExclusions,
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
        route: '/deposits',
        pipelineCore: 'AssetPacksSynthesis',
        synthesisMode: synthesis.synthesisMode,
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        optionCount: synthesis.optionCount,
        synthesisRoot: synthesis.roots.synthesisRoot,
        forcedInclusionCount: forcedInclusions.length,
        exclusionCount: synthesis.exclusionPosture.forcedExclusionCount,
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
    if (isExecutionCancelledError(error) || (await isExecutionCancelled(supabaseAdmin, runId))) {
      // Cancel API already wrote status=cancelled; do not overwrite with failed.
      try {
        await emitStatus('Run cancelled — synthesis stopped cooperatively.');
      } catch {}
      bitcodeServerTelemetry('info', 'deposit-synthesize-options', 'cancelled', {
        userId: compactBitcodeServerId(user.id),
        repositoryFullName,
        runId,
      });
    } else {
      const message =
        (error instanceof Error && error.message.trim()) ||
        (typeof error === 'string' && error.trim()) ||
        'Deposit option synthesis failed (no message).';
      try {
        await ExecutionStreamAdapter.emitEvent(execution.id, 'error' as never, {
          message,
          runId,
        });
      } catch {}
      // Only fail if still running (cancel may have raced the catch path).
      if (!(await isExecutionCancelled(supabaseAdmin, runId))) {
        await finalizeExecutionRow({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: { message, name: error instanceof Error ? error.name : 'Error' },
          // Also mirror into output.summary so list/history summary builders
          // surface the failure even when error JSON is dropped by a mapper.
          output: {
            summary: message,
          },
          context: {
            source: 'deposit-option-synthesis',
            route: '/deposits',
            pipelineCore: 'AssetPacksSynthesis',
            repositoryFullName,
            sourceBranch,
            sourceCommit,
            failureMessage: message,
          },
          duration_ms: Date.now() - startedAt,
        });
      }
      bitcodeServerTelemetry('warn', 'deposit-synthesize-options', 'failed', {
        userId: compactBitcodeServerId(user.id),
        repositoryFullName,
        runId,
        message,
      });
    }
   } finally {
    ExecutionStreamAdapter.unregisterStreamer(execution.id);
   }
  };

  waitUntil(runSynthesis());
  return NextResponse.json({ ok: true, executionId: runId, runId, status: 'dispatched' });
}
