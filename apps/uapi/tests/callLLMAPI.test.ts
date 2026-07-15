/**
 * Test dry-run behavior of callLLMAPI in apps/uapi/lib/digest/digest.ts
 */
import { configureDryRun } from '@bitcode/dryrun';

describe.skip('callLLMAPI dry-run mode', () => {
  beforeAll(() => {
    // Enable dry run and mock responses
    process.env.DRY_RUN_MODE = 'true';
    process.env.DRY_RUN_LLM_RESPONSE_JSON = '{"x":1,"_metadata":{"dryRun":true}}';
    configureDryRun({ mockResponses: true });
  });

  it('returns the default response JSON without making an actual LLM call', async () => {
    // Import inside test to pick up env and config
    const { callLLMAPI } = await import('@bitcode/generic-agents-digesting');
    const result = await callLLMAPI('any prompt', 5);
    expect(result).toEqual({ x: 1, _metadata: { dryRun: true } });
  });
});