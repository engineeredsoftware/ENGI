/**
 * Core happy-path for pure PrepareConciseContext helpers owned by this package
 * (types + chunk/estimate/prepare — no LLM / AgentExecution coupling).
 */
import {
  chunkContext,
  createContextSelectors,
  estimateSerializedSize,
  prepareConciseContext,
} from '../../prepared-context';

describe('estimateSerializedSize / createContextSelectors', () => {
  it('estimates JSON size and builds selectors from maps and records', () => {
    expect(estimateSerializedSize({ a: 1 })).toBeGreaterThan(0);
    expect(estimateSerializedSize(undefined as unknown as object)).toBe(0);

    const selectors = createContextSelectors(
      [
        { namespace: 'repo', data: { owner: 'acme', name: 'bitcode' } },
        { namespace: 'cfg', data: new Map([['n', 3]]) },
      ],
      [{ namespace: 'extra', key: 'flag', value: true }],
    );

    expect(selectors.map((s) => `${s.namespace}:${s.key}`).sort()).toEqual([
      'cfg:n',
      'extra:flag',
      'repo:name',
      'repo:owner',
    ]);
    expect(selectors.every((s) => s.sizeEstimate >= 0)).toBe(true);
  });
});

describe('chunkContext / prepareConciseContext', () => {
  it('returns a single prepared context when under the token budget', () => {
    const context = { files: ['a.ts'], constraints: ['no-network'], note: 'small' };
    const result = prepareConciseContext(context, { tokenLimit: 50_000 });

    expect(result.chunked).toBe(false);
    expect(result.chunkCount).toBe(1);
    expect(result.preparedContexts).toHaveLength(1);
    expect(result.preparedContexts[0].files).toEqual(['a.ts']);
    expect(result.preparedContexts[0].constraints).toEqual(['no-network']);
    expect(result.preparedContexts[0].metadata?.chunkId).toBe('1');
    expect(result.contextSize).toBe(estimateSerializedSize(context));
  });

  it('chunks when serialized size exceeds the derived chunk size', () => {
    // Force tiny chunks: tokenLimit * 4 * 2 must stay above the min floor (1000)
    // is not used when we pass a huge payload relative to a small budget.
    const big = 'x'.repeat(4000);
    const context = { a: big, b: big, c: big };
    const chunks = chunkContext(context, { tokenLimit: 50, approxCharsPerToken: 1 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);

    const prepared = prepareConciseContext(context, { tokenLimit: 50, approxCharsPerToken: 1 });
    expect(prepared.chunked).toBe(true);
    expect(prepared.chunkCount).toBe(prepared.preparedContexts.length);
    expect(prepared.chunkCount).toBeGreaterThan(1);
  });
});
