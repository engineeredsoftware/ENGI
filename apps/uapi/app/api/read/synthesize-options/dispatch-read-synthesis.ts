/**
 * Background read option synthesis (deposit dispatch twin).
 * Provisions Host when possible, runs ExecutionPipelineSDIVFSynthesizeReadAssetPacks,
 * persists selection envelope onto executions.output.
 *
 * Cooperative cancel: polls executions.status between stages (same law as deposit).
 * POST /api/executions/[runId]/cancel marks the row; this worker stops and does not
 * overwrite cancelled → completed/failed.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { Execution, ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { runExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain';
import {
  assertExecutionNotCancelled,
  ExecutionCancelledError,
  isExecutionCancelled,
  isExecutionCancelledError,
} from '@bitcode/api/pipelines/cancel';

export type ReadSynthesisDispatchInput = {
  runId: string;
  userId: string;
  repositoryFullName: string;
  sourceBranch: string;
  sourceCommit: string | null;
  need: string;
  /** Deposit permissibleSources twin. */
  relevantPaths?: string[];
  /** Deposit impermissibleSources twin. */
  irrelevantPaths?: string[];
};

export async function runReadOptionSynthesis(input: ReadSynthesisDispatchInput): Promise<void> {
  const admin = supabaseAdmin;
  const { runId, userId } = input;
  const exec = new Execution(`pipeline:read:${runId}`);
  storeCrossPhaseArtifact(exec, 'host', 'runId', runId);
  storeCrossPhaseArtifact(exec, 'pipeline', 'runId', runId);
  storeCrossPhaseArtifact(exec, 'pipeline', 'productPipeline', 'synthesize-reads-asset-packs-pipeline');
  storeCrossPhaseArtifact(exec, 'read', 'relevantPaths', input.relevantPaths || []);
  storeCrossPhaseArtifact(exec, 'read', 'irrelevantPaths', input.irrelevantPaths || []);
  // Deposit steering keys so shared discovery filters can reuse exclusion law.
  storeCrossPhaseArtifact(exec, 'deposit', 'permissibleSources', input.relevantPaths || []);
  storeCrossPhaseArtifact(exec, 'deposit', 'impermissibleSources', input.irrelevantPaths || []);

  const assertNotCancelled = () => assertExecutionNotCancelled(admin, runId);

  const emitStatus = (message: string, extra: Record<string, unknown> = {}) => {
    try {
      ExecutionStreamAdapter.emitEvent(runId, 'status' as never, { message, ...extra });
    } catch {
      /* streaming optional */
    }
  };

  /**
   * Persist terminal rows only while still `running` so a concurrent cancel
   * is not overwritten to completed/failed.
   */
  const finalizeIfStillRunning = async (row: Record<string, unknown>) => {
    if (await isExecutionCancelled(admin, runId)) return false;
    const { error } = await admin
      .from('executions')
      .update({
        ...row,
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)
      .eq('user_id', userId)
      .eq('status', 'running');
    return !error;
  };

  const [owner, name] = input.repositoryFullName.split('/');
  const pipelineInput = {
    mode: 'read',
    synthesizeMode: 'read',
    need: input.need,
    repositoryFullName: input.repositoryFullName,
    sourceBranch: input.sourceBranch,
    sourceCommit: input.sourceCommit,
    relevantPaths: input.relevantPaths || [],
    irrelevantPaths: input.irrelevantPaths || [],
    permissibleSources: input.relevantPaths || [],
    impermissibleSources: input.irrelevantPaths || [],
    repository: {
      owner,
      name,
      fullName: input.repositoryFullName,
      branch: input.sourceBranch,
      commit: input.sourceCommit,
    },
  };

  try {
    await assertNotCancelled();
    emitStatus(`Read option synthesis started for ${input.repositoryFullName}.`);

    // Optional Host provision (same path as deposit when available).
    try {
      await assertNotCancelled();
      const { provisionDepositCheckout } = await import('@/lib/deposit-source-provisioning');
      const provisioned = await provisionDepositCheckout({
        repositoryFullName: input.repositoryFullName,
        sourceBranch: input.sourceBranch,
        sourceCommit: input.sourceCommit || undefined,
        userId: input.userId,
      } as any);
      await assertNotCancelled();
      if (provisioned?.sourceCatalog) {
        (pipelineInput as any).sourceCheckoutCatalog = provisioned.sourceCatalog;
        (pipelineInput as any).inventory = provisioned.sourceCatalog;
      }
      if (provisioned?.workspace?.workspacePath) {
        storeCrossPhaseArtifact(
          exec,
          'repository',
          'workspacePath',
          provisioned.workspace.workspacePath,
        );
      }
    } catch (provisionErr) {
      if (isExecutionCancelledError(provisionErr)) throw provisionErr;
      // Host optional in constrained environments; pipeline may still run with empty catalog.
    }

    await assertNotCancelled();
    emitStatus('Running synthesize-reads-asset-packs pipeline…');

    const result = await runExecutionPipelineSDIVFSynthesizeReadAssetPacks(pipelineInput, exec);

    await assertNotCancelled();

    const selectionEnvelope =
      exec.get?.('finish', 'selectionEnvelope') ||
      (result as any)?.selectionEnvelope ||
      null;
    const options =
      exec.get?.('implementation', 'options') ||
      (result as any)?.options ||
      selectionEnvelope?.options ||
      [];

    await finalizeIfStillRunning({
      status: 'completed',
      completed_at: new Date().toISOString(),
      output: {
        productPipeline: 'synthesize-reads-asset-packs-pipeline',
        selectionEnvelope,
        optionCount: Array.isArray(options) ? options.length : 0,
        options,
        success: true,
      },
      context: {
        source: 'read-synthesize-options',
        route: '/reads',
        pipelineCore: 'synthesize-reads-asset-packs-pipeline',
        synthesisMode: 'read',
        repositoryFullName: input.repositoryFullName,
        optionCount: Array.isArray(options) ? options.length : 0,
      },
    });
    emitStatus(
      `Read option synthesis completed with ${Array.isArray(options) ? options.length : 0} options.`,
    );
  } catch (err) {
    if (isExecutionCancelledError(err) || (await isExecutionCancelled(admin, runId))) {
      emitStatus('Run cancelled — read synthesis stopped cooperatively.');
      // Row is already cancelled by cancelUserExecution; do not overwrite.
      return;
    }

    const message = err instanceof Error ? err.message : String(err);
    emitStatus(`Read option synthesis failed: ${message.slice(0, 280)}`);
    await finalizeIfStillRunning({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: { message },
      output: {
        summary: message,
      },
      context: {
        source: 'read-synthesize-options',
        route: '/reads',
        pipelineCore: 'synthesize-reads-asset-packs-pipeline',
        synthesisMode: 'read',
        repositoryFullName: input.repositoryFullName,
        failureMessage: message,
      },
    });
  } finally {
    try {
      ExecutionStreamAdapter.unregisterStreamer?.(runId);
    } catch {
      /* optional */
    }
  }
}
