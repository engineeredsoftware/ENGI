// @ts-nocheck
/**
 * Cross-registry tool lookup: pipeline ExecutionPipelineToolRegistry
 * must be visible from StepExecution AgentToolsRegistry after restrictTo.
 */
import { Execution } from '@bitcode/execution-generics';
import { Tool } from '@bitcode/tools-generics';
import { AgentExecution, StepExecution, applyStepToolSurface } from '../execution';
import { factoryToolsExecution } from '../generations/llm-bound-factories';

class CloneTool extends Tool {
  name = 'asset-pack-clone-vcs-repository-tool';
  use = jest.fn(async (input: any) => ({ ok: true, input }));
}

/** Minimal stand-in for ExecutionPipelineToolRegistry (same surface). */
class FakePipelineTools {
  private map = new Map<string, any>();
  constructor(public execution: any) {}
  registerTool(key: string, tool: any) { this.map.set(key, tool); }
  get(key: string) { return this.map.get(key); }
  getTool(key: string) { return this.map.get(key); }
  getPaths() { return [...this.map.keys()]; }
  getUsableTools() {
    const o: any = {};
    for (const k of this.map.keys()) o[k] = this.map.get(k);
    return o;
  }
}

describe('cross-registry tool hierarchy', () => {
  it('step getTool finds pipeline-registered tool under restrictTo', () => {
    const pipeline = new Execution('pipeline') as any;
    pipeline.tools = new FakePipelineTools(pipeline);
    const clone = new CloneTool();
    pipeline.tools.registerTool('asset-pack-clone-vcs-repository-tool', clone);

    const agent = new AgentExecution('agent:clone', pipeline);
    const tryStep = new StepExecution('try', agent);
    applyStepToolSurface(tryStep, ['asset-pack-clone-vcs-repository-tool']);

    expect(tryStep.tools.getTool('asset-pack-clone-vcs-repository-tool')).toBeTruthy();
    expect(Object.keys(tryStep.tools.getUsableTools())).toEqual([
      'asset-pack-clone-vcs-repository-tool',
    ]);
  });

  it('tools postprocess on sequential child still finds tool', async () => {
    const pipeline = new Execution('pipeline') as any;
    pipeline.tools = new FakePipelineTools(pipeline);
    const clone = new CloneTool();
    pipeline.tools.registerTool('asset-pack-clone-vcs-repository-tool', clone);

    const agent = new AgentExecution('agent:clone', pipeline);
    const tryStep = new StepExecution('try', agent);
    applyStepToolSurface(tryStep, ['asset-pack-clone-vcs-repository-tool']);

    // Mimic sequential(core, tools) → tools runs on child seq-1
    const seq1 = tryStep.child('seq-1');
    const toolsExec = factoryToolsExecution();
    const out = await toolsExec(
      {
        output: {
          useTools: [
            {
              name: 'asset-pack-clone-vcs-repository-tool',
              input: { owner: 'a', name: 'b' },
            },
          ],
        },
      },
      seq1 as any,
    );
    expect(out.usedTools?.[0]?.error).toBeUndefined();
    expect(out.usedTools?.[0]?.tool).toBe('asset-pack-clone-vcs-repository-tool');
    expect(clone.use).toHaveBeenCalled();
  });
});
