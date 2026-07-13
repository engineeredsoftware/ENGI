/**
 * Setup Phase - Declarative PhaseRunner (Executor pattern)
 *
 * Pure “sequence and save”: agents run, the stack stores execution state.
 * Returns the original input unchanged; downstream phases read from stores.
 */

import { Executor } from '@bitcode/execution-generics';
import { createPhaseRunner, type PhaseConfig } from '@bitcode/pipelines-generics';
import { synthesizeAssetPacksModeFromExecution } from '../synthesize-asset-packs';

const setupPhaseConfig: PhaseConfig = {
  phaseName: 'setup',
  sequence: [
    { agent: 'setup:asset-pack-clone-vcs-repository-agent' },
    { agent: 'setup:ReadFitsFindingSynthesisSetupPlanAgent' },
    { agent: 'setup:parallel-context-bootstrap', parallel: [
      { agent: 'setup:ReadFitsFindingSynthesisReadComprehensionAgent' },
      // Optional when available:
      // { agent: 'setup:asset-pack-initialize-lsp-agent' }
    ]},
    { agent: 'setup:asset-pack-danger-wall-agent' },
    // Initialize MCPs tools once during setup
    { agent: 'setup:asset-pack-initialize-mcps-tools-agent' }
  ],
  allowShortCircuit: true
};

const runSetupPhase = createPhaseRunner(setupPhaseConfig);

export const assetPackSetupPhaseExecutor: Executor<any, any> = async (input, execution) => {
  // Conditional runtime registry: the deposit lens comprehends the depositor's
  // Obfuscations via the deposit input-comprehension agent (registered under the
  // comprehension key); read keeps its Need-comprehension agent.
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  if (mode === 'deposit') {
    try {
      const depositComprehend = (await import('../agents/setup/deposit-input-comprehension-agent')).default as any;
      (execution as any).agents?.registerAgent?.(
        'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
        depositComprehend,
      );
    } catch {}
    // The Setup plan agent plans Finding Fits from an accepted Read-Need — read
    // work, deposit-irrelevant. Punt it under the deposit lens with a passthrough
    // (no LLM call, no telemetry row). Read keeps it for now; the read fits-finding
    // planning moves to the read-lens Discovery phase in the subsequent (read) gate.
    (execution as any).agents?.registerAgent?.(
      'setup:ReadFitsFindingSynthesisSetupPlanAgent',
      async (passthroughInput: any) => passthroughInput,
    );
    // The danger wall is the Bitcode READ risk-admission (readSafeToMeasure /
    // assetPackSafeToSynthesize / deliveryMechanismSafeToAttempt, proof- and
    // delivery-boundary gates) — read-lens admission with no deposit semantics. On a
    // deposit it has no Read to admit, so it flails to safe:false/high and the
    // short-circuit wrapper would block synthesis outright. Punt it under the deposit
    // lens with the same no-LLM passthrough; the depositor's source-safety is already
    // enforced by the streaming source-safe filter + obfuscation comprehension. The
    // deposit-lens admission is a later-gate split (…ForDepositor/…ForReader).
    (execution as any).agents?.registerAgent?.(
      'setup:asset-pack-danger-wall-agent',
      async (passthroughInput: any) => passthroughInput,
    );
  }
  const phaseResult = await runSetupPhase(input, execution);
  // A Setup short-circuit is the danger wall (read-lens risk admission)
  // BLOCKING the run: synthesis is not safe to attempt. That must FAIL the
  // pipeline closed — a terminal error, not a swallowed PhaseResult that lets
  // Discovery/Implementation run anyway. (Deposit mode punts the danger wall
  // to a passthrough above, so a deposit setup never short-circuits here.)
  if (phaseResult && phaseResult.shortCircuited) {
    const reason = phaseResult.shortCircuitReason || 'setup admission blocked the pipeline';
    try {
      (execution as any).store?.('pipeline', 'terminalError', {
        phase: 'setup',
        shortCircuited: true,
        reason,
      });
    } catch {}
    throw new Error(`Setup phase short-circuited (fail closed): ${reason}`);
  }
  // PhaseRunner returns PhaseResult; pipeline expects input forward. Use stores for state.
  return input;
};

/**
 * Setup phase agent registration
 * Called at pipeline initialization to register all setup agents
 */
export function registerSetupAgents(agentRegistry: any): void {
  // Import and register all setup phase agents
  // First sequence, clone
  agentRegistry.registerAgent(
    'setup:asset-pack-clone-vcs-repository-agent',
    () => import('../agents/setup/asset-pack-clone-vcs-repository-agent').then(m => m.default)
  );

  // Second sequence, init lsp and comprehend read
  agentRegistry.registerAgent(
    'setup:asset-pack-initialize-lsp-agent',
    () => import('../agents/setup/asset-pack-initialize-lsp-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:ReadFitsFindingSynthesisSetupPlanAgent',
    () => import('../agents/setup/read-fits-finding-synthesis-setup-plan-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
    () => import('../agents/setup/read-fits-finding-synthesis-read-comprehension-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:asset-pack-comprehend-read-definition-agent',
    () => import('../agents/setup/read-fits-finding-synthesis-read-comprehension-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:asset-pack-danger-wall-agent',
    () => import('../agents/setup/asset-pack-danger-wall-agent').then(m => m.default)
  );

  // Initialize MCPs tools
  agentRegistry.registerAgent(
    'setup:asset-pack-initialize-mcps-tools-agent',
    () => import('../agents/setup/asset-pack-initialize-mcps-tools-agent').then(m => m.default)
  );
}
