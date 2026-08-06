// @ts-nocheck
/**
 * CORE — FailsafeGenerationSequence structure and hard failure propagation.
 *
 * Teaches: prepare (seq-0) → chunk (seq-1) → stitch (seq-2); a rejecting LLM
 * fails the whole sequence cleanly (no hang / silent retry).
 *
 * Detailed failsafe call counts and debug filters: failsafe-generation-sequence
 * and edges as applicable.
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../../execution';
import { createFailsafeGenerationSequence } from '../../steps/failsafe-sequence';

const outputSchema = z.object({ title: z.string(), score: z.number() });

const reasoningPayload = { analysis: 'a', reasoningItems: ['s'], conclusion: 'c', confidence: 0.9 };
const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
const structuredPayload = { title: 'Asset pack option', score: 42 };

function scriptedContent(llmInput: any): string {
  const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
  let payload: any = reasoningPayload;
  if (user.includes('Generate structured output for:')) {
    // PCC's SELECTION structured call renders the key-selection schema shape.
    payload = user.includes('"selectedKeys": string[]') ? { selectedKeys: [] } : structuredPayload;
  }
  else if (user.includes('Evaluate the quality and correctness of:') || user.includes('Judge the quality')) payload = judgmentPayload;
  return JSON.stringify(payload);
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

describe('CORE: FailsafeGenerationSequence composition order', () => {
  it('hosts prepare under seq-0, chunk under seq-1, and stitch under seq-2', async () => {
    const llm = async (input: any) => ({
      content: scriptedContent(input),
      usage: { totalTokens: 5 },
      metadata: { provider: 'test', model: 'test-model' },
    });
    const { root, step } = makeRootAndStep(llm);
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    await sequence({ read: 'Fit this repository.' }, step);

    const nodes = collectNodes(root);
    const hostOf = (failsafeId: string) =>
      nodes.find(n => n?.children?.has?.(failsafeId));

    // The sequential combinator hosts each failsafe on its own seq-N child,
    // in the canonical prepare -> chunk -> stitch order.
    expect(String(hostOf('failsafe:prepare_concise_context')?.id)).toMatch(/\/seq-0$/);
    expect(String(hostOf('failsafe:chunk_then_sum')?.id)).toMatch(/\/seq-1$/);
    expect(String(hostOf('failsafe:stitch_until_complete')?.id)).toMatch(/\/seq-2$/);
  });
});

describe('CORE: FailsafeGenerationSequence failure propagation', () => {
  it('surfaces an LLM timeout from the first call — one invocation, no silent retry', async () => {
    const counter = { calls: 0 };
    const llm = async () => {
      counter.calls++;
      throw new Error('LLM call timed out after 90000ms');
    };
    const { step } = makeRootAndStep(llm);
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    await expect(sequence({ read: 'Fit this repository.' }, step)).rejects.toThrow(
      'timed out after 90000ms'
    );
    // The failsafe sequence itself performs NO automatic re-invocation after a
    // rejection; bounded retry lives only in the PTRR Retry step wrapper.
    expect(counter.calls).toBe(1);
  });

  it('propagates a mid-sequence rejection (first chunk-stage call) without re-running earlier failsafes', async () => {
    const counter = { calls: 0 };
    const llm = async (input: any) => {
      counter.calls++;
      if (counter.calls === 4) {
        // Prepare consumed calls 1-3 (its SELECTION thinkings pass); call 4
        // is the first TASK generation of ChunkThenSum.
        throw new Error('LLM call timed out after 90000ms');
      }
      return {
        content: scriptedContent(input),
        usage: { totalTokens: 5 },
        metadata: { provider: 'test', model: 'test-model' },
      };
    };
    const { step } = makeRootAndStep(llm);
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    await expect(sequence({ read: 'Fit this repository.' }, step)).rejects.toThrow(
      'timed out after 90000ms'
    );
    expect(counter.calls).toBe(4);
  });

  it('rejects instead of returning a partial envelope when the LLM fails', async () => {
    const llm = async () => { throw new Error('provider unavailable'); };
    const { step } = makeRootAndStep(llm);
    const sequence = createFailsafeGenerationSequence({ outputSchema });

    let resolved: any = 'did-not-resolve';
    try {
      resolved = await sequence({ read: 'Fit this repository.' }, step);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(String((err as Error).message)).toBe('provider unavailable');
    }
    // No {context, output, finalOutput} envelope must escape a failed run.
    expect(resolved).toBe('did-not-resolve');
  });
});
