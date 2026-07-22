// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { factoryToolsExecution } from '../../generations/llm-bound-factories';

describe('factoryToolsExecution telemetry', () => {
  it('stores tool result events with summarized input and output', async () => {
    const tool = {
      execute: jest.fn(async () => ({ selectedCandidateIds: ['asset-1'] })),
    };
    const execution = new Execution('agent:test') as any;
    execution.tools = {
      getTool: jest.fn((key: string) => (key === 'bitcode.asset-pack.verification' ? tool : undefined)),
    };

    const out = await factoryToolsExecution()(
      {
        output: {
          useTools: [
            {
              name: 'bitcode.asset-pack.verification',
              input: { repositoryFullName: 'octocat/Spoon-Knife' },
              reason: 'verify source-bound candidate evidence',
            },
          ],
        },
      },
      execution,
    );

    expect(out.usedTools).toHaveLength(1);
    expect(tool.execute).toHaveBeenCalledWith({
      repositoryFullName: 'octocat/Spoon-Knife',
    });

    const toolsExecution = execution.children.get('tools:execution');
    expect(toolsExecution?.get('tools', 'result')).toMatchObject({
      tool: 'bitcode.asset-pack.verification',
      ok: true,
      input: {
        type: 'object',
        keys: ['repositoryFullName'],
      },
      output: {
        type: 'object',
        keys: ['selectedCandidateIds'],
      },
    });
  });

  it('stores missing-tool result events for readback and database telemetry', async () => {
    const execution = new Execution('agent:test') as any;
    execution.tools = {
      getTool: jest.fn(() => undefined),
    };

    const out = await factoryToolsExecution()(
      {
        output: {
          useTools: [
            {
              name: 'missing-tool',
              input: { check: 'registry' },
              reason: 'prove missing registry path is visible',
            },
          ],
        },
      },
      execution,
    );

    expect(out.usedTools).toEqual([
      {
        tool: 'missing-tool',
        error: 'Tool not found: missing-tool',
      },
    ]);
    const toolsExecution = execution.children.get('tools:execution');
    expect(toolsExecution?.get('tools', 'result')).toMatchObject({
      tool: 'missing-tool',
      ok: false,
      input: {
        type: 'object',
        keys: ['check'],
      },
      error: 'Tool not found: missing-tool',
    });
  });
});
