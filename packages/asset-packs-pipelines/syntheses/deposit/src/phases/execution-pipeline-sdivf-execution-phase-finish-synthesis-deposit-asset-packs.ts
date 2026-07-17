/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Finish → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential } from '@bitcode/execution-generics';
import type { AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type ValidationOutput = AssetPackOutput;

/** ExecutionPipelineSDIVFExecutionPhase Finish specialization for deposit synthesis. */
export const executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ValidationOutput,
  AssetPackOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'finish:store-artifacts',
      () => import('../agents/finish/deposit-store-artifacts-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:ledgerize',
      () =>
        import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/finish/deposit-ledgerize-agent').then(
          (m) => m.default,
        ),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:finish-synthesize-asset-packs-for-deposit-run',
      () =>
        import('../agents/finish/deposit-finish-synthesize-run-agent').then((m) => m.default),
    );
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:store-artifacts'),
    createAgentExecutor('finish:ledgerize'),
    createAgentExecutor('finish:finish-synthesize-asset-packs-for-deposit-run'),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ValidationOutput,
  AssetPackOutput
>;
