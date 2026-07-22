// @ts-nocheck
jest.mock('../../steps/failsafe-sequence', () => ({
  createFailsafeGenerationSequence: () => async (input: any) => input,
}));

import { factoryTryStep } from '../../steps/factories';
import { Execution } from '@bitcode/execution-generics';

describe('Tools execute as Step postprocess once', () => {
  it('runs tools after Try core generation when requested', async () => {
    // Spy on dynamic require factoryToolsExecution used in Try/Retry postprocess
    const generationFactories = require('../../generations/llm-bound-factories');
    const spy = jest.spyOn(generationFactories, 'factoryToolsExecution').mockImplementation(() => {
      return async (input: any) => ({ ...input, usedTools: ['ok'] });
    });

    // Plan does not execute tools; Try does.
    const step = factoryTryStep<any, any>({ parse: (x: any) => x } as any);
    const exec = new Execution('agent-root');

    const out = await step({ output: { useTools: [{ name: 't', input: {} }] } }, exec as any);
    expect(spy).toHaveBeenCalled();
    expect(out.usedTools).toBeDefined();

    spy.mockRestore();
  });

  it('runs tools when useTools is only on reasoning (SO omitted)', async () => {
    const generationFactories = require('../../generations/llm-bound-factories');
    const spy = jest.spyOn(generationFactories, 'factoryToolsExecution').mockImplementation(() => {
      return async (input: any) => ({ ...input, usedTools: [{ tool: 'from-reason' }] });
    });

    const step = factoryTryStep<any, any>({ parse: (x: any) => x } as any);
    const exec = new Execution('agent-root');

    const out = await step(
      {
        output: { success: false },
        reasoning: {
          analysis: 'need clone',
          reasoningItems: [],
          conclusion: 'run tool',
          confidence: 0.9,
          useTools: [{ name: 'asset-pack-clone-vcs-repository-tool', input: { owner: 'o', name: 'n' } }],
        },
      },
      exec as any,
    );
    expect(spy).toHaveBeenCalled();
    expect(out.usedTools).toEqual([{ tool: 'from-reason' }]);

    spy.mockRestore();
  });
});
