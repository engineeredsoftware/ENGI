// @ts-nocheck
import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import { AgentExecution } from '../execution';
import { factoryPlanStep } from '../steps/factories';
import { factoryStitchUntilComplete } from '../substeps/factories';

describe('PTRR step prompt formatting', () => {
  it('formats registry-backed step prompts instead of rendering Prompt objects', async () => {
    process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'prepare';
    process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'reason';

    const prompt = new Prompt();
    prompt.set('objective', 'Use source-bound evidence only.' as any);
    prompt.set('constraint', 'Do not invent repository facts.' as any);

    const execution = new AgentExecution('agent:test') as any;
    execution.store('agent', 'name', 'test-agent');

    const systemPrompts: string[] = [];
    Object.defineProperty(execution, 'llms', {
      configurable: true,
      value: {
        getDefaultConfig: () => ({ maxTokens: 4000 }),
        getDefaultLLM: () => async (input: any) => {
          const systemPrompt = input.messages?.[0]?.content || '';
          const promptBody = input.messages?.map((message: any) => message.content).join('\n') || '';
          systemPrompts.push(systemPrompt);

          return {
            content: JSON.stringify({
              analysis: 'The prompt was formatted.',
              steps: ['read prompt parts'],
              conclusion: 'Continue.',
              confidence: 1,
            }),
            usage: {},
            metadata: {},
          };
        },
      },
    });

    const plan = factoryPlanStep(z.object({ ok: z.boolean() }), { prompt });
    try {
      await plan({ read: 'Fit the deposited repository.' }, execution);

      expect(systemPrompts.join('\n')).toContain('Use source-bound evidence only.');
      expect(systemPrompts.join('\n')).not.toContain('[object Object]');
    } finally {
      delete process.env.BITCODE_DEBUG_ONLY_FAILSAFES;
      delete process.env.BITCODE_DEBUG_ONLY_GENERATIONS;
    }
  });

  it('renders function-backed Zod object schema keys in structured output prompts', async () => {
    // The TASK generation (which renders the step's output schema) runs under
    // the chunk failsafe; prepare runs only the key-SELECTION generation.
    process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'chunk';
    process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'structured_output';

    const execution = new AgentExecution('agent:test') as any;
    execution.store('agent', 'name', 'test-agent');

    const prompts: string[] = [];
    Object.defineProperty(execution, 'llms', {
      configurable: true,
      value: {
        getDefaultConfig: () => ({ maxTokens: 4000 }),
        getDefaultLLM: () => async (input: any) => {
          const promptBody = input.messages?.map((message: any) => message.content).join('\n') || '';
          prompts.push(promptBody);

          return {
            content: JSON.stringify({
              read: { expressed_read: 'Fit the deposited repository.' },
              written_asset_types: ['read-satisfaction-asset-pack'],
            }),
            usage: {},
            metadata: {},
          };
        },
      },
    });

    const plan = factoryPlanStep(
      z.object({
        read: z.object({ expressed_read: z.string() }),
        written_asset_types: z.array(z.string()).default([]),
      })
    );
    try {
      await plan({ read: 'Fit the deposited repository.' }, execution);

      const rendered = prompts.join('\n');
      expect(rendered).toContain('"read"');
      expect(rendered).toContain('"written_asset_types"');
      expect(rendered).not.toContain('Output must match schema: {\n}');
    } finally {
      delete process.env.BITCODE_DEBUG_ONLY_FAILSAFES;
      delete process.env.BITCODE_DEBUG_ONLY_GENERATIONS;
    }
  });

  it('preserves original task context when stitch retries an incomplete partial output', async () => {
    const execution = new AgentExecution('agent:test') as any;
    const seenInputs: any[] = [];
    const stitch = factoryStitchUntilComplete(
      [
        async (input: any) => {
          seenInputs.push(input);
          return {
            output: {
              read: {
                expressed_read: input.context.read,
              },
            },
          };
        },
      ],
      z.object({
        read: z.object({ expressed_read: z.string() }),
      })
    );

    const result = await stitch(
      {
        read: 'Fit the deposited repository.',
        sourceRevision: {
          repositoryFullName: 'octocat/Spoon-Knife',
          branch: 'main',
          commit: '07de275b3d97679321f1f596c16e48105d81d51b',
        },
        output: {},
      },
      execution
    );

    expect(seenInputs[0].context).toMatchObject({
      read: 'Fit the deposited repository.',
      sourceRevision: {
        repositoryFullName: 'octocat/Spoon-Knife',
        branch: 'main',
        commit: '07de275b3d97679321f1f596c16e48105d81d51b',
      },
    });
    expect(result.finalOutput.read.expressed_read).toBe('Fit the deposited repository.');
  });
});
