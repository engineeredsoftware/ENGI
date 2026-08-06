/**
 * EDGES — parseResponse corners: deep nesting, strict schemas, coverage, timers.
 */
// @ts-nocheck
import { z } from 'zod';
import {
  parseResponse,
  extractAllJsonObjects,
  extractJsonFromResponse,
} from '@bitcode/parsing';

const schema = z.object({ title: z.string(), score: z.number() });
const callerFallback = () => ({ title: 'CALLER-FALLBACK', score: -1 });

describe('EDGES: parseResponse deep nesting and near-misses', () => {
  it('parses objects nested deeper than the old 3-level regex limit', async () => {
    const deepSchema = z.object({
      title: z.string(),
      tree: z.object({
        a: z.object({ b: z.object({ c: z.object({ d: z.number() }) }) }),
      }),
    });
    const response =
      'Result: {"title": "Deep", "tree": {"a": {"b": {"c": {"d": 7}}}}} done.';

    const result = await parseResponse(response, deepSchema, () => ({
      title: 'CALLER-FALLBACK',
      tree: { a: { b: { c: { d: -1 } } } },
    }));

    expect(result).toEqual({
      title: 'Deep',
      tree: { a: { b: { c: { d: 7 } } } },
    });
  });

  it('never throws on a near-miss candidate and returns schema-valid result', async () => {
    const response = 'Partial result: {"title": "Only Title", "unexpected": true}';
    const result = await parseResponse(response, schema, callerFallback);
    expect(() => schema.parse(result)).not.toThrow();
    expect(result._metadata).toBeUndefined();
  });

  it('never lets a zero-required-key-coverage candidate become the answer', async () => {
    const response = 'Here is something unrelated {"unrelated": 1} with no answer.';
    const result = await parseResponse(response, schema, callerFallback);
    expect(result.unrelated).toBeUndefined();
    expect(() => schema.parse(result)).not.toThrow();
  });
});

describe('EDGES: parseResponse fallbacks and timers', () => {
  it('parses in a single pass — no setTimeout on immutable non-JSON input', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const result = await parseResponse(
      'I have no JSON for you at all, sorry.',
      schema,
      callerFallback,
    );
    expect(() => schema.parse(result)).not.toThrow();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it('strict schema falls through to caller fallback when generic inject fails', async () => {
    const strictSchema = z.object({ title: z.string(), score: z.number() }).strict();
    const result = await parseResponse(
      'Still no JSON, apologies.',
      strictSchema,
      callerFallback,
    );
    expect(result).toEqual({ title: 'CALLER-FALLBACK', score: -1 });
  });
});

describe('EDGES: extractAllJsonObjects / extractJsonFromResponse', () => {
  it('de-duplicates identical inline objects', () => {
    const response =
      'inline: {"title": "Inline", "score": 2} and again {"title": "Inline", "score": 2}';
    const candidates = extractAllJsonObjects(response);
    const inlineCount = candidates.filter(
      (c) => c === '{"title": "Inline", "score": 2}',
    ).length;
    expect(inlineCount).toBe(1);
  });

  it('extracts objects nested beyond 3 levels as one balanced span', () => {
    const deep = '{"l1": {"l2": {"l3": {"l4": {"l5": true}}}}}';
    const candidates = extractAllJsonObjects(`prefix ${deep} suffix`);
    expect(candidates).toContain(deep);
    expect(() => JSON.parse(candidates[0])).not.toThrow();
  });

  it('does not split on braces inside string literals', () => {
    const tricky =
      '{"note": "closing } and opening { inside", "n": {"deep": "also }"}}';
    const candidates = extractAllJsonObjects(`text ${tricky} tail`);
    expect(candidates).toContain(tricky);
  });

  it('returns the trimmed raw response when no JSON object is present', () => {
    expect(extractAllJsonObjects('  plain prose only  ')).toEqual([
      'plain prose only',
    ]);
  });

  it('returns a deeply nested object verbatim (no 3-level ceiling)', () => {
    const deep = '{"a": {"b": {"c": {"d": {"e": {"f": 1}}}}}}';
    expect(extractJsonFromResponse(`Sure! ${deep}`)).toBe(deep);
  });

  it('skips invalid balanced spans and returns the first valid JSON object', () => {
    const response =
      'bad: {broken: yes} good: {"ok": {"deep": {"deeper": {"deepest": 4}}}}';
    expect(extractJsonFromResponse(response)).toBe(
      '{"ok": {"deep": {"deeper": {"deepest": 4}}}}',
    );
  });
});
