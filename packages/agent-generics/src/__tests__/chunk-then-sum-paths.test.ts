// @ts-nocheck
/**
 * Pins for the ChunkThenSum INPUT-failsafe contract:
 * - TRIGGER = the COMPOSED REQUEST (hierarchical system prompt + serialized
 *   task input INCLUDING the PCC-selected values) exceeds the request-token
 *   budget (BITCODE_LLM_MAX_REQUEST_TOKENS / llms config maxRequestTokens)
 * - non-triggering: exactly ONE task generation pass, no chunk/sum passes
 * - triggering: the SELECTED CONTEXT VALUES are chunked — each chunk call
 *   receives the task input + ONLY its chunk (never the full accumulated
 *   input) — then ONE summing pass over the chunk results
 * - oversized but unsplittable (no selected values): fail-soft single pass
 * - full failsafe sequence stays BOUNDED: 3 (selection) + 3*(chunkCount+1)
 *   (task) + 0 (stitch) LLM calls
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { createFailsafeGenerationSequence } from '../steps/failsafe-sequence';
import { factoryChunkThenSum, factoryPrepareConciseContext } from '../generations/llm-bound-factories';

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

afterEach(() => {
  delete process.env.BITCODE_LLM_MAX_REQUEST_TOKENS;
});

describe('factoryChunkThenSum non-triggering path (request fits)', () => {
  it('runs each generation exactly once with the selected context intact and no sum pass', async () => {
    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      return { ...input, genRan: true };
    };
    const { root, step } = makeRootAndStep();

    const selectedContext = { 'agent-root#read:description': 'small selected value' };
    const chunkThenSum = factoryChunkThenSum([gen]);
    const result = await chunkThenSum({ read: 'small task', selectedContext }, step);

    // Exactly ONE task generation: no chunk markers, no chunkResults pass.
    expect(seen).toHaveLength(1);
    expect(seen[0].chunk).toBeUndefined();
    expect(seen[0].chunkResults).toBeUndefined();
    // The single pass consumes the task input INCLUDING the selected values.
    expect(seen[0].read).toBe('small task');
    expect(seen[0].selectedContext).toEqual(selectedContext);

    // Input keys thread through; processedResult mirrors the final gen result.
    expect(result.read).toBe('small task');
    expect(result.genRan).toBe(true);
    expect(result.processedResult).toEqual(expect.objectContaining({ genRan: true }));

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(false);
    // The trigger measurement is recorded.
    const measurement = chunkNode.get('chunking', 'measurement');
    expect(measurement.composedRequestChars).toBeGreaterThan(0);
    expect(measurement.requestBudgetChars).toBe(150000 * 4); // conservative default
  });
});

describe('factoryChunkThenSum triggering path (composed request exceeds the budget)', () => {
  it('chunks ONLY the selected values: N chunk passes (each with just its chunk) + 1 sum pass', async () => {
    // 50-token budget => 200-char request budget; per-chunk floor is 1000
    // chars, so three ~600-char values pack one-per-chunk.
    process.env.BITCODE_LLM_MAX_REQUEST_TOKENS = '50';

    const selectedContext = {
      'agent-root#source:one': 'A'.repeat(600),
      'agent-root#source:two': 'B'.repeat(600),
      'agent-root#source:three': 'C'.repeat(600),
    };

    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      if (input.chunkResults) return { ...input, summed: true };
      return { ...input, output: { processedChunk: Object.keys(input.selectedContext)[0] } };
    };
    const { root, step } = makeRootAndStep();

    const chunkThenSum = factoryChunkThenSum([gen], { parallel: true });
    const result = await chunkThenSum({ read: 'big task', selectedContext }, step);

    // Bounded accounting: one pass per chunk plus exactly one sum pass.
    expect(seen).toHaveLength(4);

    const chunkInputs = seen.filter(i => i.chunk);
    expect(chunkInputs).toHaveLength(3);
    for (const chunkInput of chunkInputs) {
      // Each chunk call gets the task input + ONLY its chunk.
      expect(chunkInput.read).toBe('big task');
      expect(Object.keys(chunkInput.selectedContext)).toHaveLength(1);
      expect(chunkInput.chunk.count).toBe(3);
      expect(chunkInput.chunkResults).toBeUndefined();
    }
    // The chunks partition the selected values (order preserved).
    expect(chunkInputs.map(i => Object.keys(i.selectedContext)[0])).toEqual([
      'agent-root#source:one',
      'agent-root#source:two',
      'agent-root#source:three',
    ]);

    // ONE summing pass over the chunk results; the sum input carries the task
    // input WITHOUT the full selected context (it was consumed by the chunks).
    const sumInput = seen.find(i => i.chunkResults);
    expect(sumInput.read).toBe('big task');
    expect(sumInput.selectedContext).toBeUndefined();
    expect(sumInput.chunkResults.map((r: any) => r.processedChunk)).toEqual([
      'agent-root#source:one',
      'agent-root#source:two',
      'agent-root#source:three',
    ]);

    expect(result.summed).toBe(true);
    expect(result.processedResult).toEqual(expect.objectContaining({ summed: true }));

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(true);
  });

  it('an oversized request with NO selected values runs the fail-soft single pass', async () => {
    process.env.BITCODE_LLM_MAX_REQUEST_TOKENS = '10';

    let genCalls = 0;
    const gen = async (input: any) => {
      genCalls++;
      return { ...input, genRan: true };
    };
    const { root, step } = makeRootAndStep();

    const result = await factoryChunkThenSum([gen])(
      { read: 'X'.repeat(500), selectedContext: {} },
      step
    );

    expect(genCalls).toBe(1);
    expect(result.processedResult).toBeDefined();

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(false);
  });
});

describe('empty input terminates on the single path', () => {
  it('PCC over an empty selection feeds chunk-then-sum exactly one pass', async () => {
    const { root, step } = makeRootAndStep();

    const selection = async () => ({ output: { selectedKeys: [] } });
    const prepared = await factoryPrepareConciseContext(selection)({}, step);
    expect(prepared.selectedContext).toEqual({});

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

describe('large selected context chunks with a bounded LLM call count', () => {
  const outputSchema = z.object({ title: z.string(), score: z.number() });
  const reasoningPayload = { analysis: 'a', steps: ['s'], conclusion: 'c', confidence: 0.9 };
  const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
  const structuredPayload = { title: 'Asset pack option', score: 42 };
  const selectionPayload = {
    selectedKeys: [
      'agent-root#repository:doc',
      'agent-root#source:blob',
      'agent-root#read:description',
    ],
  };

  it('performs exactly 3 (selection) + 3*(chunkCount+1) (task) + 0 (stitch) calls', async () => {
    // 500-token budget => 2000-char request budget. Three 20k-char selected
    // values can never share the 1000-char-floor chunks: chunkCount = 3.
    process.env.BITCODE_LLM_MAX_REQUEST_TOKENS = '500';

    const counter = { calls: 0 };
    const llm = async (llmInput: any) => {
      counter.calls++;
      const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
      let payload: any = reasoningPayload;
      if (user.includes('Generate structured output for:')) {
        // The SELECTION structured call renders the key-selection schema
        // shape; task structured calls render the step's output schema.
        payload = user.includes('"selectedKeys": string[]') ? selectionPayload : structuredPayload;
      } else if (user.includes('Evaluate the quality and correctness of:') || user.includes('Judge the quality')) {
        payload = judgmentPayload;
      }
      return {
        content: JSON.stringify(payload),
        usage: { totalTokens: 5 },
        metadata: { provider: 'test', model: 'test-model' },
      };
    };
    const { root, step } = makeRootAndStep(llm);

    root.store('repository', 'doc', 'R'.repeat(20000));
    root.store('source', 'blob', 'S'.repeat(20000));
    root.store('read', 'description', 'D'.repeat(20000));

    const sequence = createFailsafeGenerationSequence({ outputSchema });
    const result = await sequence({ read: 'Fit this repository.' }, step);

    const nodes = collectNodes(root);
    const chunkNode = nodes.find(n => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'required')).toBe(true);

    // Selection runs one Thinkings (3 calls); the task runs one Thinkings per
    // chunk plus the sum pass (3*(chunkCount+1)); a schema-valid output means
    // stitch adds zero calls. Bounded, never unbounded.
    const chunkCount = 3;
    expect(counter.calls).toBe(3 + 3 * (chunkCount + 1));

    // The sequence still collapses into the canonical envelope.
    expect(Object.keys(result).sort()).toEqual(['context', 'finalOutput', 'output']);
    expect(result.finalOutput).toEqual(structuredPayload);
  }, 30000);
});
