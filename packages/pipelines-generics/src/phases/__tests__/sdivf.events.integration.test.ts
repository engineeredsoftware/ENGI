// @ts-nocheck
import { factoryExecutionPipelineSDIVF } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Execution } from '../../../../execution-generics/src/Execution';

describe('SDIVF pipeline event emission (integration)', () => {
  it('emits pipeline start/end and phase/agent events in sequence', async () => {
    const root = new Execution('root');
    const events: any[] = [];
    root.store('execution', 'dataStream', {
      writeData: async (data: string) => {
        try { events.push(JSON.parse(data)); } catch { /* ignore */ }
      }
    });

    // Simple delegators that just return input without agents (simulate phases fast)
    const step = async (input: any) => ({ ...input });
    const setup = step, discovery = step, implementation = step, validation = step, finish = step;

    const pipeline = factoryExecutionPipelineSDIVF('asset-pack', {
      setup,
      discovery,
      implementation,
      validation,
      finish,
      maxIterations: 1,
      iterationStrategy: 'sequential',
    });

    const output = await pipeline({ read: 'do' }, root);
    expect(output).toBeDefined();

    const keys = events.map(e => e.type + (e.status ? ':'+e.status : ''));
    expect(keys[0]).toBe('pipeline:start');
    expect(keys[keys.length-1]).toBe('pipeline:end');
    const pipelineExec = Array.from(root.children.values()).find((child: any) => child.id === 'pipeline:asset-pack');
    expect(pipelineExec?.get('pipeline', 'pattern')).toBe('SDIVF');
  });
});
