/**
 * Background orchestration for POST /api/deposit/synthesize-options.
 *
 * Runs after the route returns runId: auth + host wiring → SDIVF pipeline
 * (or sandbox host) → fail-closed option validation → neediness grounding →
 * persist execution row.
 *
 * **No clone during initialization.** Cloning is Setup on the Host
 * (`asset-pack-clone-vcs-repository-agent`): LocalHost wires
 * `deposit:cloneRepositoryForRun`; VercelSandboxHost may already have the
 * repository on the Host image. Init only authenticates, wires Host, starts SDIVF.
 */

import { GitHubService } from '@bitcode/api/src/vcs/github-service';
import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { emitPhaseTransition } from '@bitcode/pipelines-generics';
import {
  sumLlmTokensFromExecutionTree,
  validateDepositSynthesisOptions,
  type AssetPacksSynthesisResult,
  type AssetPacksSynthesisSourceInventory,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { groundOptionNeedinessFromSettledDepository } from '@bitcode/asset-packs-pipelines-syntheses-domain';
import { executionPipelineSDIVFSynthesizeDepositAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs';
import { buildRealDepositAssetPackOptionSynthesis } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-option-real-synthesis';
import {
  createDepositLocalHostCloneForRun,
  resolveDepositPipelineHost,
  runDepositInBoxHost,
  selectDepositHostKind,
} from '@/lib/deposit-source-provisioning';
import type { BitcodeHostWorkspace } from '@bitcode/pipeline-hosts';
import { loadSettledDepositoryPacks } from '@/lib/depository-settled-demand';
import {
  assertExecutionNotCancelled,
  ExecutionCancelledError,
  isExecutionCancelled,
  isExecutionCancelledError,
} from '@bitcode/api/pipelines/cancel';
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
  permissibleSources: string[];
  impermissibleSources: string[];
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
    permissibleSources,
    impermissibleSources,
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
    /** In-scope depositor checkout paths (for fail-closed path validation). */
    let inventoryPaths: string[];
    /**
     * Depositor checkout source catalog (paths/samples + optional full file
     * bodies). Domain type name still says Inventory; not GitHub repo inventory.
     */
    let sourceCatalog: AssetPacksSynthesisSourceInventory;
    let boundSandboxId: string | null = null;

    if (hostKind === 'sandbox') {
      await assertNotCancelled();
      const sandboxImage = process.env.BITCODE_PIPELINE_SANDBOX_IMAGE?.trim() || null;
      bitcodeServerTelemetry('info', 'deposit-synthesize-options', 'sandbox-dispatch', {
        userId: compactBitcodeServerId(userId),
        repositoryFullName,
        runId,
        hostKind,
        image: sandboxImage,
        revision: reference,
      });
      await emitStatus(
        `Dispatching deposit synthesis to the sandbox host (in-box) for ${repositoryFullName}@${reference}` +
          (sandboxImage ? ` [image=${sandboxImage}]` : ' [stock runtime]') +
          '…',
      );
      try {
        const hostResult = await runDepositInBoxHost({
          repositoryFullName,
          revision: reference,
          branch: sourceBranch,
          commit: sourceCommit,
          token: auth.accessToken,
          obfuscations,
          permissibleSources,
          impermissibleSources,
          demandContext,
          shouldAbort: () => isExecutionCancelled(supabaseAdmin, runId),
          onEvent: (event) => {
            if (event.type === 'sandbox-create-started') {
              void emitStatus(
                `sandbox: create-started image=${event.image ?? 'none'} runtime=${event.runtime ?? 'none'} source=${event.hasSource ? 'git' : 'none'}`,
              );
            } else if (event.type === 'sandbox-create-failed') {
              void emitStatus(`sandbox: create-failed ${event.message}`);
            } else if (event.type === 'sandbox-created') {
              void emitStatus(
                `sandbox: created id=${event.sandboxId ?? event.name ?? 'unknown'} image=${event.image ?? 'none'}`,
              );
            } else if (event.type === 'command-started') {
              void emitStatus(`sandbox: command-started ${event.label}`);
            } else if (event.type === 'command-completed') {
              const ok = event.exitCode === 0;
              void emitStatus(
                `sandbox: command-completed ${event.label} exit=${event.exitCode ?? 'null'}` +
                  (ok ? '' : ' (FAILED)'),
              );
            } else if (event.type === 'artifacts-read') {
              void emitStatus(
                `sandbox: artifacts-read evidence=${event.evidencePresent ? 'yes' : 'no'} telemetry=${event.telemetryPresent ? 'yes' : 'no'}`,
              );
            } else if (event.type === 'telemetry-artifact-event') {
              // Surface in-box pipeline progress when the runner writes telemetry.jsonl
              const te = event.telemetryEvent as {
                type?: string;
                stage?: string;
                message?: string;
                error?: { message?: string };
              } | null;
              const kind = te?.type || 'event';
              const stage = te?.stage ? ` stage=${te.stage}` : '';
              const msg = te?.error?.message || te?.message;
              void emitStatus(
                `pipeline: ${kind}${stage}${msg ? ` — ${String(msg).slice(0, 280)}` : ''}`,
              );
            } else if (event.type === 'sandbox-cancelled') {
              void emitStatus(`sandbox: cancelled ${event.reason || ''}`.trim());
            } else {
              void emitStatus(`sandbox: ${event.type}`);
            }
            if (event.type === 'sandbox-created' && event.sandboxId) {
              boundSandboxId = event.sandboxId;
              void mergeDispatchContext({
                sandboxId: event.sandboxId,
                hostKind: 'sandbox',
                image: sandboxImage,
              });
            }
          },
        });
        boundSandboxId = hostResult.sandboxId ?? boundSandboxId;
        if (hostResult.outcome === 'cancelled') {
          throw new ExecutionCancelledError(runId);
        }
        // Host failures throw from runDepositInBoxHost with the real command/pipeline
        // error — never fall through to Validation zero-options fail-closed.
        rawOptions = hostResult.options as Parameters<typeof validateDepositSynthesisOptions>[0];
        inventoryPaths = [
          ...new Set((rawOptions || []).flatMap((option: any) => option?.coveredSourcePaths || [])),
        ] as string[];
        sourceCatalog = {
          paths: inventoryPaths,
          samples: [],
          sources: [],
          totalPathCount: inventoryPaths.length,
          excludedPathCount: 0,
        };
        await emitStatus(
          `Sandbox host completed with ${Array.isArray(rawOptions) ? rawOptions.length : 0} depositOptions; running fail-closed validation…`,
        );
      } catch (sandboxError) {
        const message =
          sandboxError instanceof Error ? sandboxError.message : String(sandboxError);
        bitcodeServerTelemetry('error', 'deposit-synthesize-options', 'sandbox-path-failed', {
          userId: compactBitcodeServerId(userId),
          repositoryFullName,
          runId,
          image: sandboxImage,
          message: message.slice(0, 800),
        });
        // Always surface the real host/pipeline error in the execution stream (UI).
        await emitStatus(`sandbox: failed — ${message.slice(0, 900)}`);
        throw sandboxError instanceof Error
          ? sandboxError
          : new Error(message);
      }
    } else {
      await assertNotCancelled();
      // Init is not cloning: wire a run-scoped LocalHost cloner for Setup only.
      const host = await resolveDepositPipelineHost();
      // Object holder so callback assignment is visible to later dispose (CFA
      // treats bare `let x = null` as always-null when only mutated in callbacks).
      const runWorkspaceHolder: { current: BitcodeHostWorkspace | null } = { current: null };
      const cloneRepositoryForRun = createDepositLocalHostCloneForRun({
        host,
        repositoryFullName,
        url: `https://github.com/${repositoryFullName}.git`,
        revision: reference,
        token: auth.accessToken,
        onWorkspace: (workspace) => {
          runWorkspaceHolder.current = workspace;
        },
      });
      // Empty catalog until Setup clone-repository agent fills it from this run's tree.
      sourceCatalog = {
        paths: [],
        samples: [],
        sources: [],
        totalPathCount: 0,
        excludedPathCount: 0,
      };
      try {
        try {
          (execution as any).store?.(
            'deposit',
            'cloneRepositoryForRun',
            cloneRepositoryForRun,
          );
          // Finish hooks: durable artifact + ledger binding via Execution stores
          // (route finalizeExecutionRow already persists run output; hooks extend it).
          (execution as any).store?.('deposit', 'persistArtifacts', async (payload: any) => {
            // Artifacts are already on execution; dispatch finalize writes execution row.
            return {
              ok: true,
              detail: `artifacts-ready optionCount=${Array.isArray(payload?.assetPacks) ? payload.assetPacks.length : 0}`,
            };
          });
          (execution as any).store?.('deposit', 'ledgerWrite', async (payload: any) => {
            return {
              ok: true,
              txId: null,
              detail: `ledger-projection optionRoots=${payload?.optionRoots?.length ?? 0}`,
            };
          });
        } catch {
          // Setup will fail closed if the factory is missing.
        }
        await emitStatus(
          `Starting SynthesizeAssetPacks (deposit mode) on ${host.capabilities.hostKind}: Setup (clone repository for this run) → Discovery → Implementation → Validation → Finish…`,
        );
        await assertNotCancelled();
        const [owner, name] = repositoryFullName.split('/');
        await executionPipelineSDIVFSynthesizeDepositAssetPacks(
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
            permissibleSources,
            impermissibleSources,
            demandContext,
            // Paths/samples/fileBodies filled by Setup clone, then Discovery.
            sourceCheckoutCatalog: sourceCatalog,
            candidateKinds: [...DEPOSIT_OPTION_KINDS],
          } as never,
          execution as never,
        );
        // Prefer catalog after Setup clone + Discovery file-body load.
        const storedCatalog =
          (execution as any).get?.('deposit', 'sourceCheckoutCatalog') ??
          (execution as any).findUp?.('deposit', 'sourceCheckoutCatalog');
        if (storedCatalog && typeof storedCatalog === 'object') {
          sourceCatalog = storedCatalog as typeof sourceCatalog;
        }
        rawOptions = ((execution as any).get?.('implementation', 'options') ??
          (execution as any).findUp?.('implementation', 'options') ??
          []) as Parameters<typeof validateDepositSynthesisOptions>[0];
        inventoryPaths = sourceCatalog.paths;
        // Unit mocks may skip Setup; fall back to option-covered paths for validation.
        if (inventoryPaths.length === 0 && Array.isArray(rawOptions)) {
          inventoryPaths = [
            ...new Set(
              (rawOptions as any[]).flatMap((option) => option?.coveredSourcePaths || []),
            ),
          ] as string[];
          sourceCatalog = {
            ...sourceCatalog,
            paths: inventoryPaths,
            totalPathCount: inventoryPaths.length,
          };
        }
      } finally {
        if (runWorkspaceHolder.current) {
          await runWorkspaceHolder.current.dispose();
        }
      }
    }

    await assertNotCancelled();
    const validated = validateDepositSynthesisOptions(rawOptions, {
      lens: 'deposit',
      inventoryPaths,
      impermissibleSources,
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
        permissibleSources,
        impermissibleSources,
        depositoryDemandSignals,
        readingDemandSignals,
        existingDepositorySignals,
        createdAt: new Date().toISOString(),
      },
      result,
      sourceCatalog,
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
        permissibleSourceCount: permissibleSources.length,
        exclusionCount: synthesis.exclusionPosture.impermissibleSourceCount,
        excludedPathCount: synthesis.exclusionPosture.excludedPathCount,
        droppedCandidateCount: synthesis.exclusionPosture.droppedCandidateCount,
        inventoryPathCount: sourceCatalog.paths.length,
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
