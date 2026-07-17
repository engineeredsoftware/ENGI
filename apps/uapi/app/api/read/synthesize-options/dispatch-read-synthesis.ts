/**
 * Background read option synthesis (deposit dispatch twin).
 * Provisions Host when possible, runs ExecutionPipelineSDIVFSynthesizeReadAssetPacks,
 * persists selection envelope onto executions.output.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { Execution } from '@bitcode/execution-generics';
import { runExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain';

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
  const exec = new Execution(`pipeline:read:${input.runId}`);
  storeCrossPhaseArtifact(exec, 'host', 'runId', input.runId);
  storeCrossPhaseArtifact(exec, 'pipeline', 'runId', input.runId);
  storeCrossPhaseArtifact(exec, 'pipeline', 'productPipeline', 'synthesize-reads-asset-packs-pipeline');
  storeCrossPhaseArtifact(exec, 'read', 'relevantPaths', input.relevantPaths || []);
  storeCrossPhaseArtifact(exec, 'read', 'irrelevantPaths', input.irrelevantPaths || []);
  // Deposit steering keys so shared discovery filters can reuse exclusion law.
  storeCrossPhaseArtifact(exec, 'deposit', 'permissibleSources', input.relevantPaths || []);
  storeCrossPhaseArtifact(exec, 'deposit', 'impermissibleSources', input.irrelevantPaths || []);

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
    // Optional Host provision (same path as deposit when available).
    try {
      const { provisionDepositCheckout } = await import('@/lib/deposit-source-provisioning');
      const provisioned = await provisionDepositCheckout({
        repositoryFullName: input.repositoryFullName,
        sourceBranch: input.sourceBranch,
        sourceCommit: input.sourceCommit || undefined,
        userId: input.userId,
      } as any);
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
    } catch {
      // Host optional in constrained environments; pipeline may still run with empty catalog.
    }

    const result = await runExecutionPipelineSDIVFSynthesizeReadAssetPacks(pipelineInput, exec);
    const selectionEnvelope =
      exec.get?.('finish', 'selectionEnvelope') ||
      (result as any)?.selectionEnvelope ||
      null;
    const options =
      exec.get?.('implementation', 'options') ||
      (result as any)?.options ||
      selectionEnvelope?.options ||
      [];

    await admin
      .from('executions')
      .update({
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
      })
      .eq('id', input.runId)
      .eq('user_id', input.userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from('executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: { message },
      })
      .eq('id', input.runId)
      .eq('user_id', input.userId);
  }
}
