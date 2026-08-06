// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { Tool } from '@bitcode/tools-generics';
import { AgentExecution } from '../../execution/AgentExecution';

class ParentPipelineTool extends Tool {
  name = 'pipeline-tool';
  use = jest.fn(async () => ({ available: true }));
}

describe('AgentToolsRegistry parent tool lookup', () => {
  it('resolves tools exposed by a parent pipeline registry', async () => {
    const tool = new ParentPipelineTool();
    const parent = new Execution('pipeline-parent') as any;
    parent.tools = {
      getTool: jest.fn((key: string) => (key === 'bitcode.asset-pack.verification' ? tool : undefined)),
      getUsableTools: jest.fn(() => ({ 'bitcode.asset-pack.verification': tool })),
    };
    const agentExecution = new AgentExecution('agent:test', parent);

    const resolved = agentExecution.tools.getTool('bitcode.asset-pack.verification') as ParentPipelineTool;

    expect(resolved).toBe(tool);
    expect(agentExecution.tools.getUsableTools()).toMatchObject({
      'bitcode.asset-pack.verification': tool,
    });
    await expect(resolved.execute({ check: 'risk-admission' })).resolves.toEqual({ available: true });
    expect(tool.use).toHaveBeenCalledWith({ check: 'risk-admission' });
  });
});
