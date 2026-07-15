/**
 * Test dry-run behavior of structuredLLMCall in apps/uapi/lib/steps/sub.ts
 */
import { configureDryRun } from '@bitcode/dryrun';
import { z } from 'zod';

describe.skip('structuredLLMCall dry-run mode', () => {
  beforeAll(() => {
    process.env.DRY_RUN_MODE = 'true';
    configureDryRun({ mockResponses: true });
  });

  it('returns a default structured response based on schema', async () => {
    const { structuredLLMCall } = await import('@bitcode/steps/sub');
    const schema = z.object({ foo: z.string(), bar: z.number().optional() });
    const result = await structuredLLMCall(
      [{ role: 'user', content: 'prompt' }],
      { schema },
      'test-purpose'
    );
    // Default for foo is '[DRY RUN] Default foo'
    expect(result.foo).toContain('[DRY RUN] Default foo');
    // Default for bar is 0
    expect(result.bar).toBe(0);
    // Metadata should indicate dryRun
    expect((result as any)._metadata).toHaveProperty('dryRun', true);
    expect((result as any)._metadata).toHaveProperty('purpose', 'test-purpose');
  });
});