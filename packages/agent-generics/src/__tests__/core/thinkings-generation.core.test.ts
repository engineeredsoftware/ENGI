/**
 * CORE — ThinkingsGeneration default contract.
 *
 * Teaches: createThinkingsGeneration runs Reason → Judge → StructuredOutput,
 * threads payloads between them, and returns
 * `{ ...input, reasoning, judgment, output }` with `output` schema-valid.
 *
 * Edge cases (debug env skip Judge/SO, LLM failure mid-sequence, store shape
 * minutiae) live in edges/thinkings-generation.edges.test.ts.
 */
// @ts-nocheck
import { createThinkingsGeneration } from '../../steps/thinkings-generation';
import {
  generationNodes,
  judgmentPayload,
  makeRootAndStep,
  makeScriptedLLM,
  reasoningPayload,
  structuredPayload,
  thinkingsOutputSchema,
  usagePayload,
} from '../support/thinkings-test-support';

describe('CORE: ThinkingsGeneration (Reason → Judge → StructuredOutput)', () => {
  it('invokes exactly three LLM generations in Reason → Judge → StructuredOutput order', async () => {
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thinkings = createThinkingsGeneration(thinkingsOutputSchema);

    await thinkings({ read: 'Fit this repository.' }, step);

    expect(userPrompts).toHaveLength(3);
    expect(userPrompts[0]).toContain('Apply logical reasoning to solve:');
    expect(userPrompts[1]).toContain('Evaluate the quality and correctness of:');
    expect(userPrompts[2]).toContain('Generate structured output for:');
  });

  it('threads Reason into Judge, then Reason + Judge into StructuredOutput', async () => {
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thinkings = createThinkingsGeneration(thinkingsOutputSchema);

    await thinkings({ read: 'Fit this repository.' }, step);

    // Judge sees original input + reasoning; not yet the final structured title.
    expect(userPrompts[1]).toContain('"read": "Fit this repository."');
    expect(userPrompts[1]).toContain('"conclusion": "proceed with synthesis"');
    expect(userPrompts[1]).not.toContain('"title"');

    // StructuredOutput sees input, reasoning, and judgment.
    expect(userPrompts[2]).toContain('"read": "Fit this repository."');
    expect(userPrompts[2]).toContain('"conclusion": "proceed with synthesis"');
    expect(userPrompts[2]).toContain('"approved": true');
  });

  it('returns the standard Thinkings envelope with schema-valid output', async () => {
    const { step } = makeRootAndStep(makeScriptedLLM([]));
    const thinkings = createThinkingsGeneration(thinkingsOutputSchema);

    const result = await thinkings({ read: 'Fit this repository.' }, step);

    expect(result.read).toBe('Fit this repository.');
    expect(result.reasoning).toEqual(reasoningPayload);
    expect(result.judgment).toEqual(judgmentPayload);
    expect(result.output).toEqual(structuredPayload);
    expect(() => thinkingsOutputSchema.parse(result.output)).not.toThrow();
  });

  it('records one generation node per Thinkings substep with ptrr:generation set', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    await createThinkingsGeneration(thinkingsOutputSchema)(
      { read: 'Fit this repository.' },
      step,
    );

    const nodes = generationNodes(root);
    expect([...nodes.keys()].sort()).toEqual(['judge', 'reason', 'structured_output']);
    for (const [gen, node] of nodes) {
      expect(node.get('ptrr', 'generation')).toBe(gen);
      expect(typeof node.get('timing', 'duration')).toBe('number');
      expect(node.get('llm', 'usage')).toEqual(usagePayload);
    }
  });
});
