// Integration-like test for executeAgentSteps with a dummy agent and context
import '@/tests/setupTests';

import { z } from 'zod';
import { getProcessRootFields } from '@bitcode/generic-executions';
jest.mock('@bitcode/generic-executions', () => ({ getProcessRootFields: jest.fn() }));
import { executeAgentSteps } from '@bitcode/steps/runner';

// Stub structuredLLMCall to avoid real LLM calls
jest.mock('@bitcode/steps/sub', () => ({
  structuredLLMCall: jest.fn(async () => ({ a: 'ok', success: true })),
}));

// Minimal agent PGRI config: each step returns no tool plans and expects a result matching schema
const baseStepConfig = {
  contextfulToolingPromptFn: async () => ({
    prompt: 'prompt',
    previousStepsToolsPlansResults: [],
    nextStepsToolsPlans: [],
    _metadata: {}
  }),
  finalResultSchema: z.object({ a: z.string(), success: z.boolean() }),
  chunkPrompt: () => [],
  sumPrompt: () => [],
  fitPrompt: () => [],
  checkPrompt: () => [],
  stitchPrompt: () => [],
};

// Dummy agent that stitches through 4 PGRI steps
const dummyAgent = {
  name: 'dummy',
  description: 'Dummy agent for testing',
  pgriConfig: {
    plan: baseStepConfig,
    generate: baseStepConfig,
    refine: baseStepConfig,
    intensify: baseStepConfig,
  },
  systemPrompt: () => 'system prompt',
};

describe('executeAgentSteps', () => {
  let fakeCtx: any;
  beforeEach(() => {
    jest.clearAllMocks();
    // Fake global context with spies
    fakeCtx = {
      dataStream: {},
      recordAgentStart: jest.fn(() => ({ id: 'exec1' })),
      recordAgentStep: jest.fn(),
      recordAgentComplete: jest.fn(),
      execution: { phases: { setup: {}, discovery: { name: 'discovery', agents: [] }, implementation: { name: 'implementation', agents: [] }, validation: { name: 'validation', agents: [] }, finish: { name: 'finish', agents: [] } } },
      getCurrentIteration: jest.fn(() => ({ phases: { discovery: {}, implementation: {}, validation: {} }, llmCalls: [], correlationId: 'cid' })),
      fileTracker: { /* not used in this test */ }
    };
    (getProcessRootFields as jest.Mock).mockReturnValue(fakeCtx);
  });

  it('runs all PGRI steps and records context', async () => {
    const specialContext = { correlationId: 'cid', phase: 'test' };
    const result = await executeAgentSteps(dummyAgent as any, specialContext, { });
    // Should return the structuredLLMCall result as final output
    expect(result).toMatchObject({ a: 'ok', success: true });
    // recordAgentStart called once
    expect(fakeCtx.recordAgentStart).toHaveBeenCalledWith('test', 'dummy', 'Dummy agent for testing');
    // recordAgentStep should be called at least for each step (plan, generate, refine, intensify)
    expect(fakeCtx.recordAgentStep.mock.calls.length).toBeGreaterThanOrEqual(4);
    // recordAgentComplete called with agent execution and success true
    expect(fakeCtx.recordAgentComplete).toHaveBeenCalledWith({ id: 'exec1' }, true, expect.objectContaining({ a: 'ok', success: true }));
  });
});
