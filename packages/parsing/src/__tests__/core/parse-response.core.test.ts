/**
 * CORE — @bitcode/parsing happy path: candidate selection and extract helpers.
 *
 * Edges (strict schema, zero-coverage, sleep ban, fence de-dupe): edges/.
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

describe('CORE: parseResponse candidate selection', () => {
  it('returns the schema-valid object among multiple embedded JSON objects', async () => {
    const response = [
      'Echoing your input {"query": "find assets", "mode": "deposit"} first.',
      'Final answer:',
      '{"title": "Pack", "score": 2}',
    ].join('\n');

    const result = await parseResponse(response, schema, callerFallback);

    expect(result).toEqual({ title: 'Pack', score: 2 });
  });

  it('parses a non-JSON response into a schema-shaped generic fallback', async () => {
    const result = await parseResponse('Still no JSON, apologies.', schema, callerFallback);

    expect(result).toEqual({ title: '', score: 0 });
    expect(result._metadata).toBeUndefined();
  });
});

describe('CORE: extractJsonFromResponse / extractAllJsonObjects', () => {
  it('extracts a balanced JSON object from surrounding prose', () => {
    const deep = '{"a": {"b": {"c": 1}}}';
    expect(extractJsonFromResponse(`Sure! ${deep}`)).toBe(deep);
    expect(JSON.parse(extractJsonFromResponse(`Sure! ${deep}`))).toEqual({
      a: { b: { c: 1 } },
    });
  });

  it('collects fenced and inline objects without throwing', () => {
    const response = [
      '```json',
      '{"title": "Fenced", "score": 1}',
      '```',
      'inline: {"title": "Inline", "score": 2}',
    ].join('\n');
    const candidates = extractAllJsonObjects(response);
    expect(candidates.some((c) => c.includes('Fenced'))).toBe(true);
    expect(candidates.some((c) => c.includes('Inline'))).toBe(true);
  });
});
