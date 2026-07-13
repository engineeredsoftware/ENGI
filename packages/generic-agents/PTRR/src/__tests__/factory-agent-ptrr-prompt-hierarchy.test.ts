// @ts-nocheck
import { z } from 'zod';

jest.mock('@bitcode/agent-generics/steps/factories', () => {
  const step = (type) => jest.fn(() => Object.assign(async (input) => input, { type }));
  return {
    factoryPlanStep: step('plan'),
    factoryTryStep: step('try'),
    factoryRefineStep: step('refine'),
    factoryRetryStep: step('retry'),
  };
});
jest.mock('@bitcode/agent-generics/steps/step-schemas', () => {
  const { z } = require('zod');
  return {
    PlanStepOutputSchema: z.object({
      approach: z.string(),
      steps: z.array(z.string()),
      considerations: z.array(z.string()).optional(),
    }),
  };
});
jest.mock('@bitcode/agent-generics/types', () => ({
  AgentVariationStep: { PLAN: 'plan', TRY: 'try', REFINE: 'refine', RETRY: 'retry' },
}));
jest.mock('@bitcode/agent-generics/execution', () => ({
  AgentExecution: class {
    constructor() {}
    store() {}
    prompt = { setSpecificExecution() {} };
    llms = { ensureDefaultConfigured() {} };
    tools = { ensureTools() {}, restrictTo() {} };
  },
}));

import { factoryPTRRAgent } from '../ptrr-factory';

const OutputSchema = z.object({ ok: z.boolean() });
function promptRegistry(name) {
  return {
    getAllPaths: () => [`${name}/identity`],
    get: (path) => ({ path, text: `${name} prompt` }),
  };
}
function stepPromptRegistry() {
  return {
    plan: () => promptRegistry('plan'),
    try: () => promptRegistry('try'),
    refine: () => promptRegistry('refine'),
    retry: () => promptRegistry('retry'),
  };
}

describe('factoryPTRRAgent Bitcode prompt hierarchy', () => {
  it('requires a Registry-backed agent prompt carrier and all PTRR step Prompt registries', () => {
    expect(() =>
      factoryPTRRAgent({ name: 'missing-prompt-carrier', outputSchema: OutputSchema } as any)
    ).toThrow(/requires a Bitcode Registry-backed prompt carrier/u);

    expect(() =>
      factoryPTRRAgent({
        name: 'partial-step-prompts',
        outputSchema: OutputSchema,
        prompt: promptRegistry('system'),
        stepPrompts: { plan: () => promptRegistry('plan') } as any,
      })
    ).toThrow(/missing try, refine, retry/u);
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
      prompts: { system: promptRegistry('system'), ...stepPromptRegistry() },
      enforceLLM: false,
    });
    expect(agent.name).toBe('compact-carrier');
    expect(agent.steps).toHaveLength(4);
  });
});
