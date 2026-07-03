// @ts-nocheck
/**
 * Pins for factoryChunkThenSum termination + call accounting:
 * - single prepared context: one generation pass, no sum pass, no currentContext
 * - N prepared contexts (parallel): exactly N chunk passes + 1 sum pass,
 *   chunkResults preserved in preparedContexts order
 * - empty agent input / empty root context: prepare yields one context and
 *   chunk-then-sum terminates on the single path
 * - large multi-namespace root context: prepare chunks it, and the full
 *   failsafe sequence performs a BOUNDED 3 + 3*(chunkCount+1) LLM calls
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { prepareConciseContext } from '@bitcode/context';
import { StepExecution } from '../execution';
import { createFailsafeGenerationSequence } from '../steps/failsafe-sequence';
import { factoryChunkThenSum, factoryPrepareConciseContext } from '../substeps/factories';

function makeRootAndStep(llm?: (input: any) => Promise<any>) {
  const root = new Execution('agent-root') as any;
  root.llms = {
    getDefaultLLM: () => llm ?? (async () => { throw new Error('LLM must not be called'); }),
    getDefaultConfig: () => ({ maxTokens: 4000 }),
  };
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

describe('factoryChunkThenSum single-context path', () => {
  it('runs each generation exactly once with no currentContext, no sum pass, and threads input keys', async () => {
    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      return { ...input, genRan: true };
    };
    const { root, step } = makeRootAndStep();

    const chunkThenSum = factoryChunkThenSum([gen]);
    const result = await chunkThenSum(
      { read: 'small task', preparedContexts: [{ context: { a: 1 } }] },
      step
    );

    expect(seen).toHaveLength(1);
    expect(seen[0].currentContext).toBeUndefined();
    expect(seen[0].chunkResults).toBeUndefined();

    // Input keys thread through; processedResult mirrors the final gen result.
    expect(result.read).toBe('small task');
    expect(result.genRan).toBe(true);
    expect(result.processedResult).toEqual(expect.objectContaining({ genRan: true }));

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(false);
  });
});

describe('factoryChunkThenSum multi-chunk (parallel) path', () => {
  it('runs exactly N chunk passes + 1 sum pass and preserves chunkResults order', async () => {
    const parts = ['one', 'two', 'three', 'four', 'five'];
    const preparedContexts = parts.map(part => ({ context: { part } }));

    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      if (input.chunkResults) return { ...input, summed: true };
      return { ...input, processedChunk: input.currentContext.context.part };
    };
    const { root, step } = makeRootAndStep();

    const chunkThenSum = factoryChunkThenSum([gen], { parallel: true });
    const result = await chunkThenSum({ read: 'big input', preparedContexts }, step);

    // Bounded accounting: one pass per prepared context plus one sum pass.
    expect(seen).toHaveLength(parts.length + 1);

    const chunkInputs = seen.filter(i => i.currentContext);
    expect(chunkInputs).toHaveLength(parts.length);
    // Every chunk pass received its own prepared context.
    expect(chunkInputs.map(i => i.currentContext.context.part).sort()).toEqual([...parts].sort());

    // parallel() (Promise.all) preserves the preparedContexts order in results.
    const sumInput = seen.find(i => i.chunkResults);
    expect(sumInput.chunkResults.map((r: any) => r.processedChunk)).toEqual(parts);

    expect(result.summed).toBe(true);
    expect(result.processedResult).toEqual(expect.objectContaining({ summed: true }));

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(true);
  });
});

describe('empty input terminates on the single path', () => {
  it('prepare over an empty root yields one prepared context and chunk-then-sum runs once', async () => {
    const { root, step } = makeRootAndStep();

    const passthrough = async (input: any) => input;
    const prepared = await factoryPrepareConciseContext([passthrough])({}, step);
    expect(prepared.preparedContexts).toHaveLength(1);

    let genCalls = 0;
    const gen = async (input: any) => {
      genCalls++;
      return { ...input, genRan: true };
    };
    const result = await factoryChunkThenSum([gen])(prepared, step);

    expect(genCalls).toBe(1);
    expect(result.processedResult).toBeDefined();

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(false);
  });
});

describe('large multi-namespace context chunks with a bounded LLM call count', () => {
  const outputSchema = z.object({ title: z.string(), score: z.number() });
  const reasoningPayload = { analysis: 'a', steps: ['s'], conclusion: 'c', confidence: 0.9 };
  const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
  const structuredPayload = { title: 'Asset pack option', score: 42 };

  it('performs exactly 3 (prepare) + 3*(chunkCount+1) (chunk) + 0 (stitch) calls', async () => {
    const counter = { calls: 0 };
    const llm = async (llmInput: any) => {
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
    const { root, step } = makeRootAndStep(llm);

    // Three sizeable root namespaces (~20k chars each) exceed the 32k chunk
    // threshold at tokenLimit=4000, forcing a multi-chunk prepared context.
    root.store('repository', 'doc', 'R'.repeat(20000));
    root.store('source', 'blob', 'S'.repeat(20000));
    root.store('read', 'description', 'D'.repeat(20000));

    const sequence = createFailsafeGenerationSequence({ outputSchema });
    const result = await sequence({ read: 'Fit this repository.' }, step);

    const nodes = collectNodes(root);
    const prepareNode = nodes.find(n => String(n.id).includes('failsafe:prepare_concise_context'));
    const fullContext = prepareNode.get('context', 'full');
    const { chunkCount, chunked } = prepareConciseContext(fullContext, { tokenLimit: 4000 });

    expect(chunked).toBe(true);
    expect(chunkCount).toBeGreaterThan(1);

    // Prepare runs one thinkings pass (3 calls); chunk runs one per chunk
    // plus the sum pass (3*(chunkCount+1)); a schema-valid output means
    // stitch adds zero calls. Bounded, never unbounded.
    expect(counter.calls).toBe(3 + 3 * (chunkCount + 1));

    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(true);

    // The sequence still collapses into the canonical envelope.
    expect(Object.keys(result).sort()).toEqual(['context', 'finalOutput', 'output']);
    expect(result.finalOutput).toEqual(structuredPayload);
  });
});
