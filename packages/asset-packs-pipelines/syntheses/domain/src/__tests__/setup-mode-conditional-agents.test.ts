// @ts-nocheck
/**
 * Setup phase conditional runtime registry (V48 Gate 3, F22/F28).
 *
 * Under the DEPOSIT lens, Setup punts the read-lens agents to no-LLM
 * passthroughs registered on the phase execution's own registry (shadowing the
 * pipeline-level registrations):
 *   - setup:ReadFitsFindingSynthesisSetupPlanAgent  (F22 — plans Finding Fits
 *     from an accepted Read-Need; deposit-irrelevant)
 *   - setup:asset-pack-danger-wall-agent            (F28 — the read risk
 *     admission; a deposit has no Read to admit)
 * and swaps the comprehension key to the deposit input-comprehension agent
 * (Obfuscations). Under the READ lens the real agents keep running.
 *
 * The real agent modules are jest-mocked so the pin is exact: in deposit mode
 * the read setup-plan/danger-wall agents are NEVER invoked (zero LLM rows for
 * them), while their keys still complete as passthroughs.
 */
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

jest.mock('../agents/setup/asset-pack-clone-vcs-repository-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), cloned: true })),
}));
jest.mock('../../../read/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), plan: 'read setup plan' })),
}));
jest.mock('../../../read/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), readComprehension: true })),
}));
jest.mock('../agents/setup/asset-pack-danger-wall-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), admission: 'read risk admission ran' })),
}));
jest.mock('../../../deposit/src/agents/setup/deposit-input-comprehension-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), depositComprehension: true })),
}));
jest.mock('../agents/setup/asset-pack-initialize-mcps-tools-agent', () => ({
  __esModule: true,
  default: jest.fn(async (input: any) => ({ ...(input ?? {}), mcps: true })),
}));

import { ExecutionPipeline } from '@bitcode/pipelines-generics';
import { assetPackSetupPhaseExecutor } from '../phases/setup';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';

import cloneAgent from '../agents/setup/asset-pack-clone-vcs-repository-agent';
import readSetupPlanAgent from '../../../read/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent';
import readComprehensionAgent from '../../../read/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent';
import readDangerWallAgent from '../agents/setup/asset-pack-danger-wall-agent';
import depositInputComprehensionAgent from '../../../deposit/src/agents/setup/deposit-input-comprehension-agent';
import initializeMcpsToolsAgent from '../agents/setup/asset-pack-initialize-mcps-tools-agent';

const cloneMock = cloneAgent as jest.Mock;
const readSetupPlanMock = readSetupPlanAgent as jest.Mock;
const readComprehensionMock = readComprehensionAgent as jest.Mock;
const readDangerWallMock = readDangerWallAgent as jest.Mock;
const depositComprehensionMock = depositInputComprehensionAgent as jest.Mock;
const mcpsMock = initializeMcpsToolsAgent as jest.Mock;

/**
 * Mirror the pipeline-level Setup registrations (preprocess.ts) on a fresh
 * root, then hand back the isolated seq-N phase child the SDIVF composition
 * would run Setup on. The mode lives on the SHARED root (F20).
 */
function setupHarness(mode: 'deposit' | 'read', rootId: string) {
  const root = new ExecutionPipeline(rootId);
  storeSynthesizeAssetPacksMode(root, mode);
  root.agents.registerAgent('setup:asset-pack-clone-vcs-repository-agent', cloneAgent);
  root.agents.registerAgent('setup:ReadFitsFindingSynthesisSetupPlanAgent', readSetupPlanAgent);
  root.agents.registerAgent('setup:ReadFitsFindingSynthesisReadComprehensionAgent', readComprehensionAgent);
  root.agents.registerAgent('setup:asset-pack-danger-wall-agent', readDangerWallAgent);
  root.agents.registerAgent('setup:asset-pack-initialize-mcps-tools-agent', initializeMcpsToolsAgent);
  const phaseExec = root.child('seq-1');
  return { root, phaseExec };
}

describe('assetPackSetupPhaseExecutor conditional registry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cloneMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), cloned: true }));
    readSetupPlanMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), plan: 'read setup plan' }));
    readComprehensionMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), readComprehension: true }));
    readDangerWallMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), admission: 'read risk admission ran' }));
    depositComprehensionMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), depositComprehension: true }));
    mcpsMock.mockImplementation(async (input: any) => ({ ...(input ?? {}), mcps: true }));
  });

  it('deposit: punts setup-plan + danger-wall to passthroughs and comprehends deposit input', async () => {
    const { phaseExec } = setupHarness('deposit', 'pipeline:setup-conditional-deposit');
    const input = { repository: { fullName: 'octo/repo-x' }, obfuscations: { rules: [] } };

    const result = await assetPackSetupPhaseExecutor(input, phaseExec);

    // Pure sequence-and-save: the executor forwards the input unchanged.
    expect(result).toBe(input);

    // The shared setup agents still run…
    expect(cloneMock).toHaveBeenCalledTimes(1);
    expect(mcpsMock).toHaveBeenCalledTimes(1);
    // …the comprehension key resolves the DEPOSIT input-comprehension agent…
    expect(depositComprehensionMock).toHaveBeenCalledTimes(1);
    expect(readComprehensionMock).not.toHaveBeenCalled();
    // …and the read-lens setup-plan / danger-wall agents are NEVER invoked
    // (no LLM work for the punted keys — F22 / F28).
    expect(readSetupPlanMock).not.toHaveBeenCalled();
    expect(readDangerWallMock).not.toHaveBeenCalled();

    // The punted keys still COMPLETE (as passthroughs) in the phase's agent
    // rows — the sequence shape is stable across modes.
    expect(phaseExec.get('agent:setup:ReadFitsFindingSynthesisSetupPlanAgent', 'complete'))
      .toMatchObject({ status: 'completed', phase: 'setup' });
    expect(phaseExec.get('agent:setup:asset-pack-danger-wall-agent', 'complete'))
      .toMatchObject({ status: 'completed', phase: 'setup' });

    // A passthrough cannot short-circuit: no admission block was recorded.
    expect(phaseExec.get('pipeline/short-circuit', 'signal')).toBeUndefined();
    expect(phaseExec.get('phase/setup', 'shortCircuited')).toBeUndefined();
    expect(phaseExec.get('phase/setup', 'completed')).toBeDefined();
  });

  it('read: the real setup-plan, read-comprehension, and danger-wall agents all run', async () => {
    const { phaseExec } = setupHarness('read', 'pipeline:setup-conditional-read');
    const input = { read: 'Determine whether the deposited repository satisfies Read/Fit QA.' };

    const result = await assetPackSetupPhaseExecutor(input, phaseExec);

    expect(result).toBe(input);
    expect(cloneMock).toHaveBeenCalledTimes(1);
    expect(readSetupPlanMock).toHaveBeenCalledTimes(1);
    expect(readComprehensionMock).toHaveBeenCalledTimes(1);
    expect(readDangerWallMock).toHaveBeenCalledTimes(1);
    expect(mcpsMock).toHaveBeenCalledTimes(1);
    // The deposit comprehension override never engages under the read lens.
    expect(depositComprehensionMock).not.toHaveBeenCalled();
  });

  it('read: a danger-wall SHORT_CIRCUIT fails the pipeline CLOSED (terminal error, not swallowed)', async () => {
    const { phaseExec } = setupHarness('read', 'pipeline:setup-danger-wall-block');
    readDangerWallMock.mockImplementation(async () => ({
      result: { blocked: true },
      signal: {
        type: 'SHORT_CIRCUIT',
        reason: 'Bitcode risk admission blocked setup: unsafe to synthesize.',
        refundType: 'full',
        confidence: 0.95,
        metadata: { phase: 'setup', agent: 'bitcode-read-risk-admission', severity: 'high' },
      },
    }));

    await expect(assetPackSetupPhaseExecutor({ read: 'blocked read' }, phaseExec)).rejects.toThrow(
      /Setup phase short-circuited \(fail closed\).*unsafe to synthesize/,
    );

    // The short-circuit evidence is stored (the phase runner recorded it) …
    expect(phaseExec.get('phase/setup', 'shortCircuited')).toBe(true);
    expect(phaseExec.get('pipeline/short-circuit', 'signal')).toMatchObject({
      type: 'SHORT_CIRCUIT',
    });
    // … and the terminal error state is recorded for the run surfaces.
    expect(phaseExec.get('pipeline', 'terminalError')).toMatchObject({
      phase: 'setup',
      shortCircuited: true,
      reason: expect.stringContaining('unsafe to synthesize'),
    });
    // Fail closed means the sequence stopped at the wall: MCPs init never ran.
    expect(mcpsMock).not.toHaveBeenCalled();
  });

  it('deposit registrations shadow only the phase subtree — the root registry keeps the read agents', async () => {
    const { root, phaseExec } = setupHarness('deposit', 'pipeline:setup-conditional-shadow');

    await assetPackSetupPhaseExecutor({}, phaseExec);

    // The deposit passthroughs were registered on the PHASE child, not the
    // shared root: the pipeline-level read registrations are untouched.
    expect(root.agents.get('setup:asset-pack-danger-wall-agent')).toBe(readDangerWallAgent);
    expect(root.agents.get('setup:ReadFitsFindingSynthesisSetupPlanAgent')).toBe(readSetupPlanAgent);
    // While the phase child's local registry resolves the passthrough (a
    // different function than the read danger wall).
    const local = phaseExec.agents.get('setup:asset-pack-danger-wall-agent');
    expect(typeof local).toBe('function');
    expect(local).not.toBe(readDangerWallAgent);
  });
});
