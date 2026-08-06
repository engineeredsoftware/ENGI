/**
 * EDGES — pure PrepareConciseContext helpers (no LLM).
 */
import {
  chunkContext,
  createContextSelectors,
  estimateSerializedSize,
  prepareConciseContext,
} from '../../prepared-context';

describe('EDGES: estimateSerializedSize / createContextSelectors', () => {
  it('returns 0 for circular or non-serializable values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(estimateSerializedSize(circular)).toBe(0);
    expect(estimateSerializedSize(undefined as unknown as object)).toBe(0);
  });

  it('skips null/undefined namespace data without throwing', () => {
    const selectors = createContextSelectors([
      { namespace: 'empty', data: null },
      { namespace: 'missing', data: undefined },
      { namespace: 'ok', data: { k: 1 } },
    ]);
    expect(selectors).toEqual([
      expect.objectContaining({ namespace: 'ok', key: 'k' }),
    ]);
  });

  it('handles empty Map and empty extras', () => {
    const selectors = createContextSelectors(
      [{ namespace: 'm', data: new Map() }],
      [],
    );
    expect(selectors).toEqual([]);
  });
});

describe('EDGES: chunkContext bounds', () => {
  it('produces distinct chunk ids when forced to split', () => {
    const big = 'x'.repeat(4000);
    const context = { a: big, b: big, c: big };
    const chunks = chunkContext(context, {
      tokenLimit: 50,
      approxCharsPerToken: 1,
    });
    expect(chunks.length).toBeGreaterThan(1);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  it('prepareConciseContext marks chunked when over budget', () => {
    const big = 'y'.repeat(4000);
    const prepared = prepareConciseContext(
      { a: big, b: big },
      { tokenLimit: 50, approxCharsPerToken: 1 },
    );
    expect(prepared.chunked).toBe(true);
    expect(prepared.chunkCount).toBe(prepared.preparedContexts.length);
    expect(prepared.chunkCount).toBeGreaterThan(1);
  });
});
