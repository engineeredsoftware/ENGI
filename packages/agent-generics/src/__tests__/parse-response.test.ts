// @ts-nocheck
/**
 * Pins the @bitcode/parsing seam the thricified generations depend on
 * (factoryReason/factoryJudge/factoryStructuredOutput all funnel raw LLM
 * content through parseResponse). packages/parsing has no jest harness of its
 * own; this suite runs under agent-generics' moduleNameMapper which resolves
 * @bitcode/parsing to ../parsing/src/parsing.ts.
 */
import { z } from 'zod';
import { parseResponse, extractAllJsonObjects } from '@bitcode/parsing';

const schema = z.object({ title: z.string(), score: z.number() });
const callerFallback = () => ({ title: 'CALLER-FALLBACK', score: -1 });

afterEach(() => {
  jest.useRealTimers();
});

describe('parseResponse candidate selection', () => {
  it('returns the schema-valid object among multiple embedded JSON objects on the first attempt', async () => {
    const response = [
      'Echoing your input {"query": "find assets", "mode": "deposit"} first.',
      'Final answer:',
      '{"title": "Pack", "score": 2}',
    ].join('\n');

    const result = await parseResponse(response, schema, callerFallback);

    expect(result).toEqual({ title: 'Pack', score: 2 });
  });

  it('never throws on a near-miss candidate and returns a schema-valid result without _metadata', async () => {
    // NOTE (bug, reported not pinned): the deepMergeDefaults coerce path and
    // inferSchemaRequiredKeys both read `_def.shape` as a plain object, but
    // zod 3 stores it as a lazy function — so the merge/key-coverage machinery
    // is dead code and the near-miss content ("Only Title") is silently lost
    // to the fallback chain. We pin only the stable contract here.
    jest.useFakeTimers();
    const response = 'Partial result: {"title": "Only Title", "unexpected": true}';

    const promise = parseResponse(response, schema, callerFallback);
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(() => schema.parse(result)).not.toThrow();
    expect(result._metadata).toBeUndefined();
  });

  it('never lets a zero-required-key-coverage candidate become the answer', async () => {
    jest.useFakeTimers();
    const response = 'Here is something unrelated {"unrelated": 1} with no answer.';

    const promise = parseResponse(response, schema, callerFallback);
    await jest.runAllTimersAsync();
    const result = await promise;

    // The unrelated object is never returned; the result is schema-valid.
    expect(result.unrelated).toBeUndefined();
    expect(() => schema.parse(result)).not.toThrow();
  });
});

describe('parseResponse retry + fallback ordering', () => {
  it('re-parses the same response with bounded 1s/2s sleeps, then falls back without throwing', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const response = 'I have no JSON for you at all, sorry.';

    const promise = parseResponse(response, schema, callerFallback);
    await jest.runAllTimersAsync();
    const result = await promise;

    // Deterministic input, deterministic outcome: a schema-valid fallback.
    expect(() => schema.parse(result)).not.toThrow();
    // Bounded retries: exactly the two escalating sleeps (1s then 2s).
    const delays = setTimeoutSpy.mock.calls.map(c => c[1]).filter(d => d === 1000 || d === 2000);
    expect(delays).toEqual([1000, 2000]);
    setTimeoutSpy.mockRestore();
  });

  it('a strict schema rejects the _metadata-injected generic fallback and falls through to the caller fallback', async () => {
    jest.useFakeTimers();
    const strictSchema = z.object({ title: z.string(), score: z.number() }).strict();
    const response = 'Still no JSON, apologies.';

    const promise = parseResponse(response, strictSchema, callerFallback);
    await jest.runAllTimersAsync();
    const result = await promise;

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

  it('returns the trimmed raw response when no JSON object is present', async () => {
    expect(extractAllJsonObjects('  plain prose only  ')).toEqual(['plain prose only']);
  });
});
