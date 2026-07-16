// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { Tool } from '@bitcode/tools-generics';
import { ExecutionPipelineToolRegistry } from '../execution/ExecutionPipelineToolRegistry';

class PlainTool extends Tool {
  name = 'plain-tool';
  use = jest.fn(async () => ({ ok: true }));
}

describe('ExecutionPipelineToolRegistry', () => {
  it('returns base Tool instances that do not implement execution binding', async () => {
    const execution = new Execution('pipeline:test');
    const registry = new ExecutionPipelineToolRegistry(execution);
    const tool = new PlainTool();

    registry.registerTool('plain-tool', tool as any);

    const resolved = registry.getTool('plain-tool') as PlainTool;
    expect(resolved).toBe(tool);
    await expect(resolved.execute({ input: true })).resolves.toEqual({ ok: true });
    expect(tool.use).toHaveBeenCalledWith({ input: true });
  });
});
