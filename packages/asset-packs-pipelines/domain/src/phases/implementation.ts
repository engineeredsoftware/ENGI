/**
 * Implementation Phase - AssetPack Pipeline
 *
 * The live implementation orchestration now lives in `phases/index.ts`.
 * This helper exposes the same canonical Read-to-AssetPack synthesis sequence
 * for direct phase-runner imports.
 */

import { factoryExecutionPipelineSDIVFExecutionPhaseRunner, type AgentStep, type ExecutionPipelineSDIVFExecutionPhaseRunnerConfig } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

function createImplementationSequence(_assetPackWrittenAssetType: string): AgentStep[] {
  return [{ agent: 'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent' }];
}

export function createImplementationPhaseConfig(assetPackWrittenAssetType: string): ExecutionPipelineSDIVFExecutionPhaseRunnerConfig {
  return {
    phaseName: 'implementation',
    sequence: createImplementationSequence(assetPackWrittenAssetType),
    allowShortCircuit: false
  };
}

export function runImplementationPhase(assetPackWrittenAssetType: string) {
  return factoryExecutionPipelineSDIVFExecutionPhaseRunner(createImplementationPhaseConfig(assetPackWrittenAssetType));
}

export function registerImplementationAgentsForType(
  _assetPackWrittenAssetType: string,
  agentRegistry: any
): void {
  registerImplementationAgents(agentRegistry);
}

export function registerImplementationAgents(
  agentRegistry: any,
  // Conditional runtime registry: deposit registers under a deposit-named key;
  // read keeps the historical ReadFitsFindingSynthesis implementation key.
  mode?: SynthesizeAssetPacksMode,
): void {
  if (mode === 'deposit') {
    agentRegistry.registerAgent('implementation:deposit-asset-pack-synthesis', () =>
      import('../agents/implementation/deposit-asset-pack-synthesis-agent').then(m => m.default),
    );
    return;
  }
  agentRegistry.registerAgent(
    'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent',
    () =>
      import('../agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent').then(
        (m) => m.default,
      ),
  );
}
