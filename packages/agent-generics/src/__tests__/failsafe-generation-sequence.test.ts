// @ts-nocheck
/**
 * Pins for createFailsafeGenerationSequence — the Failsafes sequence is
 * selection (PCC) -> task (CS, xchunks when triggered) -> repair-only (SC):
 * - PCC always runs ONE selection Thinkings (key-selection schema, keys only)
 * - CS runs ONE task Thinkings when the composed request fits
 * - SC adds ZERO generations when the task output is schema-complete
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { createFailsafeGenerationSequence } from '../steps/failsafe-sequence';
import { factoryChunkThenSum, factoryStitchUntilComplete } from '../substeps/factories';

const outputSchema = z.object({ title: z.string(), score: z.number() });

const reasoningPayload = { analysis: 'a', steps: ['s'], conclusion: 'c', confidence: 0.9 };
const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
const structuredPayload = { title: 'Asset pack option', score: 42 };
const selectionPayload = { selectedKeys: [] };

function makeScriptedLLM(counter: { calls: number }) {
  return async (llmInput: any) => {
    counter.calls++;
    const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
    let payload: any = reasoningPayload;
    if (user.includes('Generate structured output for:')) {
      // Selection structured calls render the key-selection schema shape.
      payload = user.includes('"selectedKeys": string[]') ? selectionPayload : structuredPayload;
    }
    else if (user.includes('Evaluate the quality and correctness of:') || user.includes('Judge the quality')) payload = judgmentPayload;
    return {
      content: JSON.stringify(payload),
      usage: { totalTokens: 5 },
      metadata: { provider: 'test', model: 'test-model' },
    };
  };
}

function makeRootAndStep(llm: (input: any) => Promise<any>) {
  const root = new Execution('agent-root') as any;
  root.llms = { getDefaultLLM: () => llm, getDefaultConfig: () => ({ maxTokens: 4000 }) };
  root.tools = { getTool: () => undefined };
  root.agents = {};
  const step = new StepExecution('plan', root);
  return { root, step };
}

function collectNodes(node: any, out: any[] = []): any[] {
  out.push(node);
  for (const child of node?.children?.values?.() || []) collectNodes(child, out);
  return out;
}

afterEach(() => {
  delete process.env.BITCODE_DEBUG_ONLY_FAILSAFES;
  delete process.env.BITCODE_DEBUG_ONLY_GENERATIONS;
});

describe('createFailsafeGenerationSequence composition', () => {
  it('runs selection -> task -> repair-only and returns the {context, output, finalOutput} envelope', async () => {
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    const result = await sequence({ read: 'Fit this repository.' }, step);

    // PCC runs ONE selection Thinkings (3 calls) and CS runs ONE task
    // Thinkings (3 calls); a schema-valid output means stitch adds zero.
    // The failsafes no longer wrap three identical task generations.
    expect(counter.calls).toBe(6);

    // The envelope consumers unwrap via finalOutput ?? output (F26-A contract).
    expect(Object.keys(result).sort()).toEqual(['context', 'finalOutput', 'output']);
    expect(result.finalOutput).toEqual(structuredPayload);
    expect(result.output).toEqual(structuredPayload);
    expect(result.finalOutput ?? result.output).toEqual(structuredPayload);
    expect(() => outputSchema.parse(result.finalOutput)).not.toThrow();
  });

  it('stores ptrr:failsafe on each failsafe execution AND its hosting seq child', async () => {
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    await sequence({ read: 'Fit this repository.' }, step);

    const nodes = collectNodes(root);
    for (const failsafe of ['prepare_concise_context', 'chunk_then_sum', 'stitch_until_complete']) {
      const failsafeNodes = nodes.filter(n => n.get?.('ptrr', 'failsafe') === failsafe);
      // One FailsafeExecution node + the sequential seq-N child it runs under.
      expect(failsafeNodes.length).toBeGreaterThanOrEqual(2);
      expect(failsafeNodes.some(n => String(n.id).includes(`failsafe:${failsafe}`))).toBe(true);
      expect(failsafeNodes.some(n => /seq-\d+$/.test(String(n.id)))).toBe(true);
    }
  });

  it('stores chunking:required=false for fitting requests and stitching:count=0 for valid output', async () => {
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    await sequence({ read: 'Fit this repository.' }, step);

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(false);
    const stitchNode = nodes.find(n => String(n.id).includes('failsafe:stitch_until_complete'));
    expect(stitchNode.get('stitching', 'count')).toBe(0);
  });

  it("BITCODE_DEBUG_ONLY_FAILSAFES='prepare' runs exactly the selection failsafe", async () => {
    process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'prepare';
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    const result = await sequence({ read: 'Fit this repository.' }, step);

    expect(counter.calls).toBe(3); // the single selection thinkings pass
    // PCC's contribution: the selected keys + read-in values, no task attempt.
    expect(result.read).toBe('Fit this repository.');
    expect(result.selectedKeys).toEqual([]);
    expect(result.selectedContext).toEqual({});
    expect(result.output).toBeUndefined(); // PCC never attempts the task
    expect(result.finalOutput).toBeUndefined(); // stitch (envelope builder) skipped

    const nodes = collectNodes(root);
    expect(nodes.some(n => String(n.id).includes('failsafe:prepare_concise_context'))).toBe(true);
    expect(nodes.some(n => String(n.id).includes('failsafe:chunk_then_sum'))).toBe(false);
    expect(nodes.some(n => String(n.id).includes('failsafe:stitch_until_complete'))).toBe(false);
  });
});

describe('factoryChunkThenSum chunked path', () => {
  it('runs the generations once per chunk plus a sum pass, threading chunkResults', async () => {
    process.env.BITCODE_LLM_MAX_REQUEST_TOKENS = '50';
    try {
      const seen: any[] = [];
      const gen = async (input: any) => {
        seen.push(input);
        if (input.chunkResults) return { ...input, summed: true };
        return { ...input, processedChunk: Object.keys(input.selectedContext)[0] };
      };
      const { root, step } = makeRootAndStep(async () => { throw new Error('LLM must not be called'); });

      const selectedContext = {
        one: 'A'.repeat(700),
        two: 'B'.repeat(700),
      };
      const chunkThenSum = factoryChunkThenSum([gen], { parallel: true });
      const result = await chunkThenSum({ read: 'big input', selectedContext }, step);

      // Two chunk passes (each with only its chunk) + one sum pass.
      expect(seen).toHaveLength(3);
      const chunkInputs = seen.filter(i => i.chunk);
      expect(chunkInputs.map(i => Object.keys(i.selectedContext)[0]).sort()).toEqual(['one', 'two']);
      const sumInput = seen.find(i => i.chunkResults);
      expect(sumInput.chunkResults).toHaveLength(2);
      expect(sumInput.chunkResults.map((r: any) => r.processedChunk).sort()).toEqual(['one', 'two']);

      expect(result.summed).toBe(true);
      expect(result.processedResult).toEqual(expect.objectContaining({ summed: true }));

      const nodes = collectNodes(root);
      const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
      expect(chunkNode.get('chunking', 'required')).toBe(true);
    } finally {
      delete process.env.BITCODE_LLM_MAX_REQUEST_TOKENS;
    }
  });
});

describe('factoryStitchUntilComplete stores', () => {
  it('stores validation:error and stitching:count when a stitch repairs an invalid output', async () => {
    const stitchInputs: any[] = [];
    const gen = async (input: any) => {
      stitchInputs.push(input);
      return { title: 'repaired', score: 1 };
    };
    const { root, step } = makeRootAndStep(async () => { throw new Error('LLM must not be called'); });

    const stitch = factoryStitchUntilComplete([gen], outputSchema);
    const result = await stitch({ title: 'missing score' }, step);

    expect(result.finalOutput).toEqual({ title: 'repaired', score: 1 });
    expect(stitchInputs).toHaveLength(1);
    // Stitch generations receive {context, partialOutput, instruction}.
    expect(Object.keys(stitchInputs[0]).sort()).toEqual(['context', 'instruction', 'partialOutput']);
    expect(stitchInputs[0].partialOutput).toEqual({ title: 'missing score' });

    const nodes = collectNodes(root);
    const stitchNode = nodes.find(n => String(n.id).includes('failsafe:stitch_until_complete'));
    expect(stitchNode.get('stitching', 'count')).toBe(1);
    expect(String(stitchNode.get('validation', 'error'))).toContain('score');
    expect(stitchNode.get('stitching', 'error')).toBeUndefined();
  });
});
