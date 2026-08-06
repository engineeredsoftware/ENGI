// @ts-nocheck
/**
 * Pins the step-schema law: STEP outputs validate against STEP schemas, not
 * the full agent schema. factoryPTRRAgent resolves per-step schemas —
 * Plan defaults to the canonical PlanStepOutputSchema (forcing the agent
 * schema onto Plan made every run's plan step fail validation and burn
 * stitch repairs); Try/Refine/Retry default to the agent's outputSchema and
 * every step accepts an explicit override.
 */
import { z } from 'zod';

jest.mock('../../steps/factories', () => {
  const step = (type: string) => jest.fn(() => Object.assign(async (input: any) => input, { type }));
  return {
    factoryPlanStep: step('plan'),
    factoryTryStep: step('try'),
    factoryRefineStep: step('refine'),
    factoryRetryStep: step('retry'),
  };
});
jest.mock('@bitcode/agent-generics/steps/factories', () => {
  const step = (type: string) => jest.fn(() => Object.assign(async (input: any) => input, { type }));
  return {
    factoryPlanStep: step('plan'),
    factoryTryStep: step('try'),
    factoryRefineStep: step('refine'),
    factoryRetryStep: step('retry'),
  };
});

import { factoryPTRRAgent } from '@bitcode/generic-agents-ptrr';
import { factoryPlanStep, factoryTryStep, factoryRefineStep, factoryRetryStep } from '../../steps/factories';
import { PlanStepOutputSchema } from '../../steps/step-schemas';

const AgentOutputSchema = z.object({ options: z.array(z.object({ title: z.string() })) });

function promptRegistry(name: string) {
  return {
    getAllPaths: () => [`${name}/identity`],
    get: (path: string) => ({ path, text: `${name} prompt` }),
  };
}

function carrier() {
  return {
    prompt: promptRegistry('system'),
    stepPrompts: {
      plan: () => promptRegistry('plan'),
      try: () => promptRegistry('try'),
      refine: () => promptRegistry('refine'),
      retry: () => promptRegistry('retry'),
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PTRR per-step output schemas', () => {
  it('Plan validates against the canonical plan-step schema; Try/Refine/Retry against the agent schema', () => {
    factoryPTRRAgent({
      name: 'step-schema-defaults',
      outputSchema: AgentOutputSchema,
      enforceLLM: false,
      ...carrier(),
    });

    expect(factoryPlanStep).toHaveBeenCalledTimes(1);
    expect(factoryPlanStep.mock.calls[0][0]).toBe(PlanStepOutputSchema);
    expect(factoryTryStep.mock.calls[0][0]).toBe(AgentOutputSchema);
    expect(factoryRefineStep.mock.calls[0][0]).toBe(AgentOutputSchema);
    expect(factoryRetryStep.mock.calls[0][0]).toBe(AgentOutputSchema);
  });

  it('every step accepts an explicit outputSchema override', () => {
    const planOverride = z.object({ plan: z.string() });
    const tryOverride = z.object({ draft: z.string() });
    const refineOverride = z.object({ refined: z.string() });
    const retryOverride = z.object({ recovered: z.string() });

    factoryPTRRAgent({
      name: 'step-schema-overrides',
      outputSchema: AgentOutputSchema,
      enforceLLM: false,
      plan: { outputSchema: planOverride },
      try: { outputSchema: tryOverride },
      refine: { outputSchema: refineOverride },
      retry: { outputSchema: retryOverride },
      ...carrier(),
    });

    expect(factoryPlanStep.mock.calls[0][0]).toBe(planOverride);
    expect(factoryTryStep.mock.calls[0][0]).toBe(tryOverride);
    // Refine override with no useTools is identity after omit.
    expect(factoryRefineStep.mock.calls[0][0]).toBe(refineOverride);
    expect(factoryRetryStep.mock.calls[0][0]).toBe(retryOverride);
  });

  it('Refine SO schema omits useTools when agent schema includes it', () => {
    const AgentWithTools = z.object({
      success: z.boolean(),
      useTools: z.array(z.object({ name: z.string(), input: z.any() })).optional(),
    });

    factoryPTRRAgent({
      name: 'refine-no-use-tools',
      outputSchema: AgentWithTools,
      enforceLLM: false,
      ...carrier(),
    });

    expect(factoryTryStep.mock.calls[0][0]).toBe(AgentWithTools);
    expect(factoryRetryStep.mock.calls[0][0]).toBe(AgentWithTools);
    const refineSchema = factoryRefineStep.mock.calls[0][0];
    expect(refineSchema).not.toBe(AgentWithTools);
    const shape =
      typeof refineSchema._def?.shape === 'function'
        ? refineSchema._def.shape()
        : refineSchema.shape;
    expect(shape.useTools).toBeUndefined();
    expect(shape.success).toBeDefined();
  });

  it('the canonical plan-step schema is small, universally satisfiable, and hint-described', () => {
    expect(
      PlanStepOutputSchema.safeParse({ approach: 'measure then synthesize', steps: ['inventory', 'draft'] }).success,
    ).toBe(true);
    expect(
      PlanStepOutputSchema.safeParse({
        approach: 'a',
        steps: [],
        considerations: ['source safety'],
      }).success,
    ).toBe(true);
    // The full agent output must NOT be required of the plan step.
    expect(PlanStepOutputSchema.safeParse({ options: [] }).success).toBe(false);
    // The structured-output hint renders from the description.
    expect(PlanStepOutputSchema.description).toContain('"approach"');
    expect(PlanStepOutputSchema.description).toContain('"steps"');
  });
});
