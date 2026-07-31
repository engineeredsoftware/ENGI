/**
 * Implementation Phase - AssetPack Pipeline
 *
 * Deposit and read Implementation are four sequential agents building the same AssetPack(s):
 *   1. patch-plan — six-field descriptor + metadata
 *   2. patchfile — write one AssetPackPatchArtifact per pack (hybrid create|modify bodies)
 *   3. measurements — measure that patch; deposit: absolutes; read: absolutes + needinesses
 *   4. commercial-nl — rich source-safe buyer title + description
 *
 * Product packages are separate (deposit/ vs read/) but the sequential shape is twin.
 * Callers always pass mode 'deposit' | 'read'. There is no residual single-agent path.
 */

import { factoryExecutionPipelineSDIVFExecutionPhaseRunner, type AgentStep, type ExecutionPipelineSDIVFExecutionPhaseRunnerConfig } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

function createImplementationSequence(_assetPackWrittenAssetType: string): AgentStep[] {
  // Product deposit/read phase files own the four-agent sequences.
  // This residual runner is not used by product SDIVF.
  return [];
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
  agentRegistry: any,
  mode?: SynthesizeAssetPacksMode,
): void {
  registerImplementationAgents(agentRegistry, mode);
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

  // Read: four-agent twin of deposit (Need + needinesses product deltas live in agents).
  if (mode === 'read') {
    agentRegistry.registerAgent(
      'implementation:read-implementation-agent-asset-packs-patch-plan',
      () =>
        import(
          '../../../read/src/agents/implementation/read-implementation-agent-asset-packs-patch-plan'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:read-implementation-agent-asset-packs-patchfile',
      () =>
        import(
          '../../../read/src/agents/implementation/read-implementation-agent-asset-packs-patchfile'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:read-implementation-agent-asset-packs-measurements-synthesis',
      () =>
        import(
          '../../../read/src/agents/implementation/read-implementation-agent-asset-packs-measurements-synthesis'
        ).then((m) => m.default),
    );
    agentRegistry.registerAgent(
      'implementation:read-implementation-agent-asset-packs-commercial-nl',
      () =>
        import(
          '../../../read/src/agents/implementation/read-implementation-agent-asset-packs-commercial-nl'
        ).then((m) => m.default),
    );
    return;
  }

  // No mode / unknown: product SDIVF always registers via deposit|read phases.
}
