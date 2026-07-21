// @ts-nocheck
import { z } from 'zod';
import { factoryPTRRAgent } from '@bitcode/generic-agents-ptrr';

const OutputSchema = z.object({
  ok: z.boolean()
});

function promptRegistry(name: string) {
  return {
    getAllPaths: () => [`${name}/identity`],
    get: (path: string) => ({ path, text: `${name} prompt` })
  };
}

function stepPromptRegistry() {
  return {
    plan: () => promptRegistry('plan'),
    try: () => promptRegistry('try'),
    refine: () => promptRegistry('refine'),
    retry: () => promptRegistry('retry')
  };
}

describe('factoryPTRRAgent Bitcode prompt hierarchy', () => {
  it('requires a Registry-backed agent prompt carrier and all PTRR step Prompt registries', () => {
    expect(() =>
      factoryPTRRAgent({
        name: 'missing-prompt-carrier',
        outputSchema: OutputSchema
      } as any)
    ).toThrow(/requires a Bitcode Registry-backed prompt carrier/u);

    expect(() =>
      factoryPTRRAgent({
        name: 'partial-step-prompts',
        outputSchema: OutputSchema,
        prompt: promptRegistry('system'),
        stepPrompts: {
          plan: () => promptRegistry('plan')
        } as any
      })
    ).toThrow(/missing try, retry, refine/u);
  });

  it('accepts primary prompt + stepPrompts carrier', () => {
    const agent = factoryPTRRAgent({
      name: 'primary-carrier',
      outputSchema: OutputSchema,
      prompt: promptRegistry('system'),
      stepPrompts: stepPromptRegistry(),
      enforceLLM: false,
    });
    expect(agent.name).toBe('primary-carrier');
    expect(agent.steps).toHaveLength(4);
  });

  it('accepts compact prompts.system + plan/try/refine/retry carrier', () => {
    const agent = factoryPTRRAgent({
      name: 'compact-carrier',
      outputSchema: OutputSchema,
      prompts: {
        system: promptRegistry('system'),
        ...stepPromptRegistry()
      },
      enforceLLM: false,
    });
    expect(agent.name).toBe('compact-carrier');
    expect(agent.steps).toHaveLength(4);
  });
});
