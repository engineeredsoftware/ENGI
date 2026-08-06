import { z } from 'zod';
import { generateDefaultResponse } from '@bitcode/dryrun';

describe.skip('generateDefaultResponse', () => {
  it('returns default values for a simple object schema', () => {
    const schema = z.object({
      foo: z.string(),
      bar: z.number().optional(),
      baz: z.boolean(),
      arr: z.array(z.string()),
      nested: z.object({ x: z.number(), y: z.enum(['a', 'b']) }),
    });
    const response = generateDefaultResponse(schema);
    // Strings default to some placeholder string
    expect(typeof response.foo).toBe('string');
    // bar (optional number) defaults to a number (0)
    // Optional number defaults to 0
    expect(response.bar).toBe(0);
    // Boolean defaults to true
    expect(response.baz).toBe(true);
    // Array defaults to empty array
    expect(Array.isArray(response.arr)).toBe(true);
    expect(response.arr).toHaveLength(0);
    // Nested object default values
    expect(typeof response.nested).toBe('object');
    expect(response.nested.x).toBe(0);
    expect(response.nested.y).toBe('a');
    // Success field should be true
    expect(response.success).toBe(true);
  });
});