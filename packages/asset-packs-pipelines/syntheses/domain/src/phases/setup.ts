/**
 * Setup Phase - Declarative PhaseRunner (Executor pattern)
 *
 * Pure “sequence and save”: agents run, the stack stores execution state.
 * Returns the original input unchanged; downstream phases read from stores.
 */

import { Executor } from '@bitcode/execution-generics';
import { factoryExecutionPipelineSDIVFExecutionPhaseRunner, type ExecutionPipelineSDIVFExecutionPhaseRunnerConfig } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { synthesizeAssetPacksModeFromExecution } from '../synthesize-asset-packs';

const setupPhaseConfig: ExecutionPipelineSDIVFExecutionPhaseRunnerConfig = {
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

const runSetupPhase = factoryExecutionPipelineSDIVFExecutionPhaseRunner(setupPhaseConfig);

export const assetPackSetupPhaseExecutor: Executor<any, any> = async (input, execution) => {
  // Product-conditional registry: deposit comprehends obfuscations via deposit
  // input-comprehension (registered under the shared setup comprehension key);
  // read keeps Need-comprehension. Registry ids `ReadFitsFinding*` are historical
  // aliases (STAB-4 residual) — not dual-pipeline mode.
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  if (mode === 'deposit') {
    try {
      const depositComprehend = (await import('../../../deposit/src/agents/setup/deposit-input-comprehension-agent')).default as any;
      (execution as any).agents?.registerAgent?.(
        'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
        depositComprehend,
      );
    } catch {}
    // Setup plan agent is read-Need fits planning — irrelevant for deposit.
    // Passthrough (no LLM). Read product keeps the real agent under the same
    // historical registry key.
    (execution as any).agents?.registerAgent?.(
      'setup:ReadFitsFindingSynthesisSetupPlanAgent',
      async (passthroughInput: any) => passthroughInput,
    );
    // Danger wall is read risk-admission. On deposit it has no Need to admit;
    // passthrough so deposit is not short-circuited. Depositor source-safety is
    // enforced by streaming filter + obfuscation comprehension.
    (execution as any).agents?.registerAgent?.(
      'setup:asset-pack-danger-wall-agent',
      async (passthroughInput: any) => passthroughInput,
    );
  }
  const phaseResult = await runSetupPhase(input, execution);
  // Setup short-circuit = danger wall blocking the run: fail closed.
  // (Deposit product punts danger wall to passthrough above.)
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
    () => import('../../../read/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
    () => import('../../../read/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent').then(m => m.default)
  );
  agentRegistry.registerAgent(
    'setup:asset-pack-comprehend-read-definition-agent',
    () => import('../../../read/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent').then(m => m.default)
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
