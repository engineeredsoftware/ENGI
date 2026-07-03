// @ts-nocheck
/**
 * Pins the @bitcode/parsing seam the thinkings generations depend on
 * (factoryReason/factoryJudge/factoryStructuredOutput all funnel raw LLM
 * content through parseResponse). packages/parsing has no jest harness of its
 * own; this suite runs under agent-generics' moduleNameMapper which resolves
 * @bitcode/parsing to ../parsing/src/parsing.ts.
 */
import { z } from 'zod';
import { parseResponse, extractAllJsonObjects, extractJsonFromResponse } from '@bitcode/parsing';

const schema = z.object({ title: z.string(), score: z.number() });
const callerFallback = () => ({ title: 'CALLER-FALLBACK', score: -1 });

describe('parseResponse candidate selection', () => {
  it('returns the schema-valid object among multiple embedded JSON objects', async () => {
    const response = [
      'Echoing your input {"query": "find assets", "mode": "deposit"} first.',
      'Final answer:',
      '{"title": "Pack", "score": 2}',
    ].join('\n');

    const result = await parseResponse(response, schema, callerFallback);

    expect(result).toEqual({ title: 'Pack', score: 2 });
  });

  it('parses a schema-valid object nested deeper than the old 3-level regex limit', async () => {
    const deepSchema = z.object({
      title: z.string(),
      tree: z.object({ a: z.object({ b: z.object({ c: z.object({ d: z.number() }) }) }) }),
    });
    // 5 levels of brace nesting: the old fixed regex could not match this
    // object at all, so it fell through to the fallback chain.
    const response = 'Result: {"title": "Deep", "tree": {"a": {"b": {"c": {"d": 7}}}}} done.';

    const result = await parseResponse(response, deepSchema, () => ({
      title: 'CALLER-FALLBACK',
      tree: { a: { b: { c: { d: -1 } } } },
    }));

    expect(result).toEqual({ title: 'Deep', tree: { a: { b: { c: { d: 7 } } } } });
  });

  it('never throws on a near-miss candidate and returns a schema-valid result without _metadata', async () => {
    const response = 'Partial result: {"title": "Only Title", "unexpected": true}';

    const result = await parseResponse(response, schema, callerFallback);

    expect(() => schema.parse(result)).not.toThrow();
    expect(result._metadata).toBeUndefined();
  });

  it('never lets a zero-required-key-coverage candidate become the answer', async () => {
    const response = 'Here is something unrelated {"unrelated": 1} with no answer.';

    const result = await parseResponse(response, schema, callerFallback);

    // The unrelated object is never returned; the result is schema-valid.
    expect(result.unrelated).toBeUndefined();
    expect(() => schema.parse(result)).not.toThrow();
  });
});

describe('parseResponse single-pass + fallback ordering', () => {
  it('parses in a single deterministic pass — no re-parse sleeps on the immutable input', async () => {
    // The old implementation re-parsed the SAME string with escalating
    // 1s/2s sleeps (~3s dead latency per malformed generation). Removed:
    // deterministic input, deterministic outcome, zero timers.
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const response = 'I have no JSON for you at all, sorry.';

    const result = await parseResponse(response, schema, callerFallback);

    expect(() => schema.parse(result)).not.toThrow();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it('a non-strict schema receives the generic schema-shaped fallback (zod-3 lazy shape resolved)', async () => {
    // `_def.shape` is a lazy function in zod 3; the generic fallback now
    // resolves it, so required keys are defaulted instead of falling all the
    // way to the caller fallback (and _metadata is stripped by schema.parse).
    const result = await parseResponse('Still no JSON, apologies.', schema, callerFallback);

    expect(result).toEqual({ title: '', score: 0 });
    expect(result._metadata).toBeUndefined();
  });

  it('a strict schema rejects the _metadata-injected generic fallback and falls through to the caller fallback', async () => {
    const strictSchema = z.object({ title: z.string(), score: z.number() }).strict();

    const result = await parseResponse('Still no JSON, apologies.', strictSchema, callerFallback);

    expect(result).toEqual({ title: 'CALLER-FALLBACK', score: -1 });
  });
});

describe('extractAllJsonObjects', () => {
  it('collects code-fence content and balanced-brace objects, de-duplicated', async () => {
    const response = [
      '```json',
      '{"title": "Fenced", "score": 1}',
      '```',
      'inline: {"title": "Inline", "score": 2} and again {"title": "Inline", "score": 2}',
    ].join('\n');

    const candidates = extractAllJsonObjects(response);

    expect(candidates).toContain('{"title": "Fenced", "score": 1}');
    expect(candidates).toContain('{"title": "Inline", "score": 2}');
    const inlineCount = candidates.filter(c => c === '{"title": "Inline", "score": 2}').length;
    expect(inlineCount).toBe(1);
  });

  it('extracts objects nested beyond 3 levels as one balanced span', async () => {
    const deep = '{"l1": {"l2": {"l3": {"l4": {"l5": true}}}}}';
    const candidates = extractAllJsonObjects(`prefix ${deep} suffix`);

    expect(candidates).toContain(deep);
    expect(() => JSON.parse(candidates[0])).not.toThrow();
  });

  it('does not split on braces inside string literals', async () => {
    const tricky = '{"note": "closing } and opening { inside", "n": {"deep": "also }"}}';
    const candidates = extractAllJsonObjects(`text ${tricky} tail`);

    expect(candidates).toContain(tricky);
  });

  it('returns the trimmed raw response when no JSON object is present', async () => {
    expect(extractAllJsonObjects('  plain prose only  ')).toEqual(['plain prose only']);
  });
});

describe('extractJsonFromResponse', () => {
  it('returns a deeply nested object verbatim (no 3-level regex ceiling)', () => {
    const deep = '{"a": {"b": {"c": {"d": {"e": {"f": 1}}}}}}';
    expect(extractJsonFromResponse(`Sure! ${deep}`)).toBe(deep);
    expect(JSON.parse(extractJsonFromResponse(`Sure! ${deep}`))).toEqual({ a: { b: { c: { d: { e: { f: 1 } } } } } });
  });

  it('skips invalid balanced spans and returns the first valid JSON object', () => {
    const response = 'bad: {broken: yes} good: {"ok": {"deep": {"deeper": {"deepest": 4}}}}';
    expect(extractJsonFromResponse(response)).toBe('{"ok": {"deep": {"deeper": {"deepest": 4}}}}');
  });
});
