/**
 * Implementation Phase - AssetPack Pipeline
 *
 * Deposit Implementation is four sequential agents building the same AssetPack(s):
 *   1. patch-plan — six-field descriptor + metadata
 *   2. patchfile — write one AssetPackPatchArtifact per pack (hybrid create|modify bodies)
 *   3. measurements — measure that patch; attach measurements.absolutes
 *   4. commercial-nl — rich source-safe buyer title + description
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
  mode?: SynthesizeAssetPacksMode,
): void {
  if (mode === 'deposit') {
    agentRegistry.registerAgent(
      'implementation:deposit-implementation-agent-asset-packs-patch-plan',
      () =>
        import(
          '../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-patch-plan'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:deposit-implementation-agent-asset-packs-patchfile',
      () =>
        import(
          '../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-patchfile'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:deposit-implementation-agent-asset-packs-measurements-synthesis',
      () =>
        import(
          '../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-measurements-synthesis'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:deposit-implementation-agent-asset-packs-commercial-nl',
      () =>
        import(
          '../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-commercial-nl'
        ).then((m) => m.default),
    );
    return;
  }
  agentRegistry.registerAgent(
    'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent',
    () =>
      import('../../../read/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent').then(
        (m) => m.default,
      ),
  );
}
