/**
 * Background orchestration for POST /api/deposit/synthesize-options.
 *
 * Runs after the route returns runId: provision/host dispatch → SDIVF pipeline
 * (or sandbox host) → fail-closed option validation → neediness grounding →
 * persist execution row. Keeps route POST thin (auth + dispatch only).
 */

import { GitHubService } from '@bitcode/api/src/vcs/github-service';
import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { emitPhaseTransition } from '@bitcode/pipelines-generics';
import {
  applyInventoryScope,
  sumLlmTokensFromExecutionTree,
  validateDepositSynthesisOptions,
  type AssetPacksSynthesisResult,
  type AssetPacksSynthesisSourceInventory,
} from '@bitcode/pipeline-asset-pack/asset-packs-synthesis';
import { groundOptionNeedinessFromSettledDepository } from '@bitcode/pipeline-asset-pack';
import { synthesizeDepositsSDIVFPipeline } from '@bitcode/asset-packs-pipelines-synthesize-deposits';
import { buildRealDepositAssetPackOptionSynthesis } from '@bitcode/pipeline-asset-pack/deposit-option-real-synthesis';
import {
  provisionDepositSourceInventory,
  resolveDepositPipelineHost,
  runDepositInBoxHost,
  selectDepositHostKind,
} from '@/lib/deposit-source-provisioning';
import { loadSettledDepositoryPacks } from '@/lib/depository-settled-demand';
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

const DEPOSIT_OPTION_KINDS = [
  'capability-slice',
  'implementation-pattern',
  'proof-operations-slice',
] as const;

export type DepositSynthesisDispatchInput = {
  runId: string;
  userId: string;
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  obfuscations: string | null;
  forcedInclusions: string[];
  forcedExclusions: string[];
  demandContext: string[];
  depositoryDemandSignals: Array<Record<string, unknown>>;
  readingDemandSignals: Array<Record<string, unknown>>;
  existingDepositorySignals: Array<Record<string, unknown>>;
  githubConnectionData: unknown;
  supabaseAdmin: any;
  execution: { id: string; get?: Function; findUp?: Function };
  startedAt: number;
  startedAtIso: string;
};

/**
 * Full deposit option synthesis background run. Always unregisters the streamer
 * in finally. Cooperative cancel polls executions.status between stages.
 */
export async function runDepositOptionSynthesis(
  input: DepositSynthesisDispatchInput,
): Promise<void> {
  const {
    runId,
    userId,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    obfuscations,
    forcedInclusions,
    forcedExclusions,
    demandContext,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
    githubConnectionData,
    supabaseAdmin,
    execution,
    startedAt,
    startedAtIso,
  } = input;

  const emitStatus = (message: string, extra: Record<string, unknown> = {}) =>
    ExecutionStreamAdapter.emitEvent(execution.id, 'status' as never, { message, ...extra });

  const finalizeExecutionRow = async (row: Record<string, unknown>) => {
    const { error: rowError } = await supabaseAdmin.from('executions').upsert(
      {
        id: runId,
        user_id: userId,
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
        userId: compactBitcodeServerId(userId),
        message: rowError.message,
      });
    }
  };

  const assertNotCancelled = () => assertExecutionNotCancelled(supabaseAdmin, runId);
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
      githubConnectionData as never,
      userId,
      supabaseAdmin,
    );
    const reference = sourceCommit || sourceBranch || 'HEAD';
    const hostKind = selectDepositHostKind();
    let rawOptions: Parameters<typeof validateDepositSynthesisOptions>[0];
    let inventoryPaths: string[];
    let inventory: AssetPacksSynthesisSourceInventory;
    let boundSandboxId: string | null = null;

    if (hostKind === 'sandbox') {
      await assertNotCancelled();
      await emitStatus(
        `Dispatching deposit synthesis to the sandbox host (in-box) for ${repositoryFullName}@${reference}…`,
      );
      const hostResult = await runDepositInBoxHost({
        repositoryFullName,
        revision: reference,
        branch: sourceBranch,
        commit: sourceCommit,
        token: auth.accessToken,
        obfuscations,
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
      boundSandboxId = hostResult.sandboxId ?? boundSandboxId;
      if (hostResult.outcome === 'cancelled') {
        throw new ExecutionCancelledError(runId);
      }
      rawOptions = hostResult.options as Parameters<typeof validateDepositSynthesisOptions>[0];
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
      await synthesizeDepositsSDIVFPipeline(
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
          candidateKinds: [...DEPOSIT_OPTION_KINDS],
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
      candidateKinds: [...DEPOSIT_OPTION_KINDS],
    });
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

    const { synthesis: rawSynthesis, reviewProjections } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        obfuscations,
        forcedInclusions,
        forcedExclusions,
        depositoryDemandSignals,
        readingDemandSignals,
        existingDepositorySignals,
        createdAt: new Date().toISOString(),
      },
      result,
      inventory,
    );

    const settledPacks = await loadSettledDepositoryPacks(80);
    const groundedOptions = groundOptionNeedinessFromSettledDepository(
      rawSynthesis.options,
      settledPacks,
    );
    const synthesis = {
      ...rawSynthesis,
      options: groundedOptions,
    };

    const durationMs = Date.now() - startedAt;
    await emitStatus(
      `Synthesized ${synthesis.optionCount} measured AssetPack options (${result.inference.totalTokens ?? 'n/a'} tokens, ${(durationMs / 1000).toFixed(1)}s).`,
    );
    await emitPhaseTransition(execution as never, 'deposit-option-synthesis', 'complete', {
      optionCount: synthesis.optionCount,
    });

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
      userId: compactBitcodeServerId(userId),
      repositoryFullName,
      runId,
      optionCount: synthesis.optionCount,
      droppedCandidateCount: synthesis.exclusionPosture.droppedCandidateCount,
      totalTokens: result.inference.totalTokens,
      durationMs,
    });
  } catch (error) {
    if (isExecutionCancelledError(error) || (await isExecutionCancelled(supabaseAdmin, runId))) {
      try {
        await emitStatus('Run cancelled — synthesis stopped cooperatively.');
      } catch {}
      bitcodeServerTelemetry('info', 'deposit-synthesize-options', 'cancelled', {
        userId: compactBitcodeServerId(userId),
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
      if (!(await isExecutionCancelled(supabaseAdmin, runId))) {
        await finalizeExecutionRow({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: { message, name: error instanceof Error ? error.name : 'Error' },
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
        userId: compactBitcodeServerId(userId),
        repositoryFullName,
        runId,
        message,
      });
    }
  } finally {
    ExecutionStreamAdapter.unregisterStreamer(execution.id);
  }
}
