/**
 * EDGES — ThinkingsGeneration corners and operator/debug modes.
 *
 * Core sequence and envelope: core/thinkings-generation.core.test.ts.
 */
// @ts-nocheck
import { createThinkingsGeneration } from '../../steps/thinkings-generation';
import {
  generationNodes,
  makeRootAndStep,
  makeScriptedLLM,
  reasoningPayload,
  structuredPayload,
  thinkingsOutputSchema,
  usagePayload,
} from '../support/thinkings-test-support';

afterEach(() => {
  delete process.env.BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT;
});

describe('EDGES: ThinkingsGeneration debug env and failure paths', () => {
  it('BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT: one Reason call with dual envelope', async () => {
    process.env.BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT = '1';
    const dualPayload = { ...reasoningPayload, output: structuredPayload };
    const userPrompts: string[] = [];
    const llm = async (llmInput: any) => {
      const user =
        (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
      userPrompts.push(user);
      return {
        content: JSON.stringify(dualPayload),
        usage: { ...usagePayload },
        metadata: { provider: 'test', model: 'test-model', stopReason: 'end' },
      };
    };
    const { step } = makeRootAndStep(llm);
    const result = await createThinkingsGeneration(thinkingsOutputSchema)(
      { read: 'Fit this repository.' },
      step,
    );

    expect(userPrompts).toHaveLength(1);
    expect(userPrompts[0]).toMatch(/Reason only|NO Judge|NO StructuredOutput/i);
    expect(result.reasoning).toMatchObject({
      analysis: reasoningPayload.analysis,
      conclusion: reasoningPayload.conclusion,
    });
    expect(result.output).toEqual(structuredPayload);
    expect(result.judgment).toEqual(
      expect.objectContaining({
        approved: true,
        quality: reasoningPayload.confidence,
      }),
    );
    expect(() => thinkingsOutputSchema.parse(result.output)).not.toThrow();
  });

  // Removed stale BITCODE_DEBUG_ONLY_GENERATIONS cases: that filter is no longer
  // part of createThinkingsGeneration (skip-Judge/SO env is the operator path).

  it('Judge LLM rejection propagates; StructuredOutput never runs; Reason keeps llm stores', async () => {
    const boom = new Error('provider exploded');
    const userPrompts: string[] = [];
    const { root, step } = makeRootAndStep(
      makeScriptedLLM(userPrompts, { failOn: 'judge', error: boom }),
    );
    const thinkings = createThinkingsGeneration(thinkingsOutputSchema);

    await expect(thinkings({ read: 'anything' }, step)).rejects.toThrow(
      'provider exploded',
    );

    expect(userPrompts).toHaveLength(2);
    const nodes = generationNodes(root);
    expect(nodes.has('structured_output')).toBe(false);

    const reasonNode = nodes.get('reason');
    expect(reasonNode.get('llm', 'output').content).toBe(
      JSON.stringify(reasoningPayload),
    );
    expect(reasonNode.get('llm', 'usage')).toEqual(usagePayload);

    // Pin: failed Judge has no llm:* stores (input/prompt only after success).
    const judgeNode = nodes.get('judge');
    expect(judgeNode).toBeDefined();
    expect(judgeNode.hasNamespace('llm')).toBe(false);
  });

  it('llm:output on Reason is source-safe content + ancestry meta only', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    await createThinkingsGeneration(thinkingsOutputSchema)(
      { read: 'Fit this repository.' },
      step,
    );

    const reasonNode = generationNodes(root).get('reason');
    expect(reasonNode.get('llm', 'output')).toEqual({
      content: JSON.stringify(reasoningPayload),
      phase: 'discovery',
      agent: 'thinkings-test-agent',
      step: 'plan',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
      provider: 'test',
      model: 'test-model',
    });
  });
});
