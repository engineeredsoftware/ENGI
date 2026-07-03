// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { createFailsafeGenerationSequence } from '../steps/failsafe-sequence';
import { factoryChunkThenSum, factoryStitchUntilComplete } from '../substeps/factories';

const outputSchema = z.object({ title: z.string(), score: z.number() });

const reasoningPayload = { analysis: 'a', steps: ['s'], conclusion: 'c', confidence: 0.9 };
const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
const structuredPayload = { title: 'Asset pack option', score: 42 };

function makeScriptedLLM(counter: { calls: number }) {
  return async (llmInput: any) => {
    counter.calls++;
    const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
    let payload: any = reasoningPayload;
    if (user.includes('Generate structured output for:')) payload = structuredPayload;
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
  it('runs prepare -> chunk -> stitch and returns the {context, output, finalOutput} envelope', async () => {
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    const result = await sequence({ read: 'Fit this repository.' }, step);

    // Prepare + chunk each run one full thricified pass (3 calls each); a
    // schema-valid output means stitch breaks immediately with no LLM calls.
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

  it('stores chunking:required=false for small contexts and stitching:count=0 for valid output', async () => {
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

  it("BITCODE_DEBUG_ONLY_FAILSAFES='prepare' runs exactly one failsafe", async () => {
    process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'prepare';
    const counter = { calls: 0 };
    const { root, step } = makeRootAndStep(makeScriptedLLM(counter));
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    const result = await sequence({ read: 'Fit this repository.' }, step);

    expect(counter.calls).toBe(3); // a single thricified pass
    expect(result.preparedContexts).toBeDefined(); // prepare's contribution
    expect(result.output).toEqual(structuredPayload);
    expect(result.finalOutput).toBeUndefined(); // stitch (envelope builder) skipped

    const nodes = collectNodes(root);
    expect(nodes.some(n => String(n.id).includes('failsafe:prepare_concise_context'))).toBe(true);
    expect(nodes.some(n => String(n.id).includes('failsafe:chunk_then_sum'))).toBe(false);
    expect(nodes.some(n => String(n.id).includes('failsafe:stitch_until_complete'))).toBe(false);
  });
});

describe('factoryChunkThenSum chunked path', () => {
  it('runs the generations once per prepared context plus a sum pass, threading chunkResults', async () => {
    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      if (input.chunkResults) return { ...input, summed: true };
      return { ...input, processedChunk: input.currentContext.context.part };
    };
    const { root, step } = makeRootAndStep(async () => { throw new Error('LLM must not be called'); });

    const preparedContexts = [
      { context: { part: 'one' } },
      { context: { part: 'two' } },
    ];
    const chunkThenSum = factoryChunkThenSum([gen], { parallel: true });
    const result = await chunkThenSum({ read: 'big input', preparedContexts }, step);

    // Two chunk passes (each with its own currentContext) + one sum pass.
    expect(seen).toHaveLength(3);
    const chunkInputs = seen.filter(i => i.currentContext);
    expect(chunkInputs.map(i => i.currentContext.context.part).sort()).toEqual(['one', 'two']);
    const sumInput = seen.find(i => i.chunkResults);
    expect(sumInput.chunkResults).toHaveLength(2);
    expect(sumInput.chunkResults.map((r: any) => r.processedChunk).sort()).toEqual(['one', 'two']);

    expect(result.summed).toBe(true);
    expect(result.processedResult).toEqual(expect.objectContaining({ summed: true }));

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(true);
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
