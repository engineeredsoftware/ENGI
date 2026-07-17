// @ts-nocheck
/**
 * Pins: CS task Thinkings user wire is prepared-only (selectedKeys +
 * selectedContext), not the pre-PCC step envelope. Sequential chunk path
 * carries priorChunkCompletions into the next slice.
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { createFailsafeGenerationSequence } from '../steps/failsafe-sequence';
import {
  factoryChunkThenSum,
  factoryPrepareConciseContext,
  factoryReason,
  isPreparedTaskInput,
  buildPreparedTaskLlmPayload,
} from '../generations/llm-bound-factories';

function makeRootAndStep(llm?: (input: any) => Promise<any>) {
  const root = new Execution('agent-root') as any;
  root.llms = {
    getDefaultLLM: () =>
      llm ??
      (async () => {
        throw new Error('LLM must not be called');
      }),
    getDefaultConfig: () => ({ maxTokens: 4000 }),
  };
  root.tools = { getTool: () => undefined };
  root.agents = {};
  const step = new StepExecution('plan', root);
  return { root, step };
}

describe('isPreparedTaskInput / buildPreparedTaskLlmPayload', () => {
  it('detects post-PCC bag and builds lean reason payload', () => {
    const input = {
      read: 'should not appear on wire',
      depositoryAssets: [{ huge: true }],
      selectedKeys: ['#host:sourceRevision'],
      selectedContext: { '#host:sourceRevision': { branch: 'main' } },
    };
    expect(isPreparedTaskInput(input)).toBe(true);
    expect(buildPreparedTaskLlmPayload(input, 'reason')).toEqual({
      selectedKeys: ['#host:sourceRevision'],
      selectedContext: { '#host:sourceRevision': { branch: 'main' } },
    });
    expect(buildPreparedTaskLlmPayload(input, 'measure')).toEqual({
      selectedKeys: ['#host:sourceRevision'],
      selectedContext: { '#host:sourceRevision': { branch: 'main' } },
    });
    expect(buildPreparedTaskLlmPayload(input, 'chunk_base')).toEqual({
      selectedKeys: ['#host:sourceRevision'],
    });
  });

  it('does not treat PCC selection or stitch/sum as prepared task', () => {
    expect(
      isPreparedTaskInput({
        preparation: 'x',
        pipeline_execution_keys: {},
        selectedContext: {},
      })
    ).toBe(false);
    expect(isPreparedTaskInput({ partialOutput: {}, selectedContext: {} })).toBe(false);
    expect(isPreparedTaskInput({ chunkResults: [], selectedContext: {} })).toBe(false);
    expect(isPreparedTaskInput({ read: 'no selectedContext key' })).toBe(false);
  });

  it('empty selectedContext still prepared (no envelope fail-soft)', () => {
    expect(isPreparedTaskInput({ selectedContext: {}, selectedKeys: [] })).toBe(true);
    expect(buildPreparedTaskLlmPayload({ selectedContext: {} }, 'reason')).toEqual({
      selectedKeys: [],
      selectedContext: {},
    });
  });
});

describe('CS reason user is prepared-only after PCC', () => {
  it('LLM user omits pre-PCC envelope keys not in selectedContext', async () => {
    const userPrompts: string[] = [];
    const llm = async (llmInput: any) => {
      const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
      userPrompts.push(user);
      let payload: any = {
        analysis: 'a',
        reasoningItems: ['s'],
        conclusion: 'c',
        confidence: 0.9,
      };
      if (
        user.includes('Emit ONLY { "selectedKeys"') ||
        user.includes('Structured output input:') ||
        (user.includes('"selectedKeys": string[]') && user.includes('PrepareConciseContext'))
      ) {
        payload = { selectedKeys: ['agent-root#repository:owner'] };
      } else if (
        user.includes('Judge ONLY the prior PrepareConciseContext') ||
        user.includes('Evaluate the quality') ||
        user.includes('Judge the prior task')
      ) {
        payload = { quality: 0.9, issues: [], suggestions: [], approved: true };
      } else if (
        user.includes('Generate structured output for the step schema') ||
        user.includes('Generate structured output for:')
      ) {
        payload = { plan: 'clone' };
      }
      return {
        content: JSON.stringify(payload),
        usage: { totalTokens: 5 },
        metadata: { provider: 'test', model: 'test-model' },
      };
    };
    const { root, step } = makeRootAndStep(llm);
    root.store('repository', 'owner', 'acme');
    root.store('repository', 'name', 'widget');

    const schema = z.object({ plan: z.string() });
    const sequence = createFailsafeGenerationSequence({ outputSchema: schema });
    await sequence(
      {
        read: 'Deposit measured options',
        depositoryAssets: [{ id: 'bulk-marker-should-not-be-on-cs-user' }],
        host: { secretEnvelope: 'nope' },
      },
      step
    );

    // CS task reason user (not PCC): prepared only.
    const csReason = userPrompts.find(
      (u) =>
        u.includes('Task input (prepared):') ||
        (u.includes('prepared context only') && u.includes('selectedContext'))
    );
    expect(csReason).toBeDefined();
    expect(csReason).toContain('selectedContext');
    expect(csReason).toContain('acme');
    expect(csReason).not.toContain('bulk-marker-should-not-be-on-cs-user');
    expect(csReason).not.toContain('secretEnvelope');
    expect(csReason).not.toContain('depositoryAssets');
  }, 15000);
});

describe('sequential chunk carries prior completions', () => {
  it('each later chunk receives priorChunkCompletions; then sum gets all', async () => {
    process.env.BITCODE_LLM_MAX_REQUEST_TOKENS = '50';

    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      if (input.chunkResults) {
        return { ...input, summed: true, output: { merged: input.chunkResults } };
      }
      const key = Object.keys(input.selectedContext || {})[0];
      return { ...input, output: { processedChunk: key } };
    };
    const { root, step } = makeRootAndStep();
    const selectedContext = {
      'agent-root#source:one': 'A'.repeat(600),
      'agent-root#source:two': 'B'.repeat(600),
      'agent-root#source:three': 'C'.repeat(600),
    };

    // Default: sequential with priors (parallel not set).
    await factoryChunkThenSum([gen])(
      { read: 'big task', selectedKeys: Object.keys(selectedContext), selectedContext },
      step
    );

    const chunkInputs = seen.filter((i) => i.chunk);
    expect(chunkInputs).toHaveLength(3);

    // Lean base: no pre-PCC envelope on chunk executor input.
    for (const c of chunkInputs) {
      expect(c.read).toBeUndefined();
      expect(Object.keys(c.selectedContext)).toHaveLength(1);
    }

    // First chunk has no priors; subsequent carry prior completions.
    expect(chunkInputs[0].priorChunkCompletions).toBeUndefined();
    expect(chunkInputs[1].priorChunkCompletions).toEqual([
      { processedChunk: 'agent-root#source:one' },
    ]);
    expect(chunkInputs[2].priorChunkCompletions).toEqual([
      { processedChunk: 'agent-root#source:one' },
      { processedChunk: 'agent-root#source:two' },
    ]);

    const sumInput = seen.find((i) => i.chunkResults);
    expect(sumInput.chunkResults).toEqual([
      { processedChunk: 'agent-root#source:one' },
      { processedChunk: 'agent-root#source:two' },
      { processedChunk: 'agent-root#source:three' },
    ]);

    const nodes: any[] = [];
    (function walk(n: any) {
      nodes.push(n);
      for (const c of n?.children?.values?.() || []) walk(c);
    })(root);
    const chunkNode = nodes.find((n) => String(n.id).includes('failsafe:chunk_then_sum'));
    expect(chunkNode.get('chunking', 'mode')).toBe('sequential_with_priors');
  });
});

afterEach(() => {
  delete process.env.BITCODE_LLM_MAX_REQUEST_TOKENS;
});
