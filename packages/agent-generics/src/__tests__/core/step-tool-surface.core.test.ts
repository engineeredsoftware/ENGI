// @ts-nocheck
/**
 * Step-scoped tool surfaces: Plan/Refine default empty; Try/Retry use catalog.
 */
import { Execution } from '@bitcode/execution-generics';
import { Tool } from '@bitcode/tools-generics';
import { AgentExecution, StepExecution, applyStepToolSurface } from '../../execution';

class CloneTool extends Tool {
  name = 'asset-pack-clone-vcs-repository-tool';
  use = jest.fn(async () => ({ ok: true }));
}

describe('step tool surface (restrictTo on StepExecution)', () => {
  it('Plan allowlist [] hides agent catalog tools from getUsableTools', () => {
    const root = new Execution('pipeline') as any;
    const agent = new AgentExecution('agent:clone', root);
    const clone = new CloneTool();
    agent.tools.registerTool('asset-pack-clone-vcs-repository-tool', clone as any);

    const plan = new StepExecution('plan', agent);
    applyStepToolSurface(plan, []);

    expect(plan.tools.getUsableTools()).toEqual({});
    expect(plan.tools.getTool('asset-pack-clone-vcs-repository-tool')).toBeUndefined();
    // Agent catalog still intact for later steps
    expect(agent.tools.getTool('asset-pack-clone-vcs-repository-tool')).toBeTruthy();
  });

  it('Try allowlist resolves parent-registered tools', () => {
    const root = new Execution('pipeline') as any;
    const agent = new AgentExecution('agent:clone', root);
    const clone = new CloneTool();
    agent.tools.registerTool('asset-pack-clone-vcs-repository-tool', clone as any);

    const tryStep = new StepExecution('try', agent);
    applyStepToolSurface(tryStep, ['asset-pack-clone-vcs-repository-tool']);

    const usable = tryStep.tools.getUsableTools();
    expect(Object.keys(usable)).toEqual(['asset-pack-clone-vcs-repository-tool']);
    expect(tryStep.tools.getTool('asset-pack-clone-vcs-repository-tool')).toBeTruthy();
  });
});
