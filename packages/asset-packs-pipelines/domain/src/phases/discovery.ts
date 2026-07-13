/**
 * Discovery Phase - AssetPack Pipeline
 * 
 * Second phase that deeply understands requirements and plans approach:
 * 1. Comprehends all attachments (including Figma extraction)
 * 2. Filters and selects relevant files (parallel)
 * 3. Understands requirements with type awareness
 * 4. Researches approach and performs language analysis (parallel)
 * 5. Plans implementation strategy
 * 6. Assesses complexity for validation phase
 */

import { createPhaseRunner, PhaseConfig } from '@bitcode/pipelines-generics';
import { registerDiscoveryAgents as registerCanonicalDiscoveryAgents } from '../agents/discovery-agents';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

/**
 * Discovery phase configuration with parallel execution groups
 */
const discoveryPhaseConfig: PhaseConfig = {
  phaseName: 'discovery',
  sequence: [
    { agent: 'discovery:gather-context' },
    { agent: 'discovery:understand-requirements' },
    { agent: 'discovery:research-approach' },
    { agent: 'discovery:plan-implementation' },
    { agent: 'discovery:assess-complexity' }
  ],
  allowShortCircuit: false
};

/**
 * Create the discovery phase runner
 */
export const runDiscoveryPhase = createPhaseRunner(discoveryPhaseConfig);

/**
 * Discovery phase agent registration
 * Called after setup phase to register discovery agents
 */
export function registerDiscoveryAgents(
  agentRegistry: any,
  // mode drives conditional runtime registration; deposit-mode discovery explores
  // the depositor repository through three lenses (codebase / depository / model).
  // Read = default (the canonical 5-agent discovery sequence).
  mode?: SynthesizeAssetPacksMode,
): void {
  if (mode === 'deposit') {
    agentRegistry.registerAgent('discovery:codebase-comprehension', () =>
      import('../agents/discovery/deposit-codebase-comprehension-agent').then(m => m.default),
    );
    agentRegistry.registerAgent('discovery:depository-search', () =>
      import('../agents/discovery/deposit-depository-search-agent').then(m => m.default),
    );
    agentRegistry.registerAgent('discovery:inherent-regurgitation', () =>
      import('../agents/discovery/deposit-inherent-regurgitation-agent').then(m => m.default),
    );
    return;
  }
  registerCanonicalDiscoveryAgents(agentRegistry);
}
