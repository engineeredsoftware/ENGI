// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { factoryReason } from '../../generations/llm-bound-factories';

function findStored(execution: any, namespace: string, key: string): any {
  const value = execution?.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of execution?.children?.values?.() || []) {
    const childValue = findStored(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}

describe('LLM parsed output telemetry', () => {
  it('stores parsed/cast generation output for downstream pipeline streaming', async () => {
    const execution = new Execution('agent-root') as any;
    execution.llms = {
      getDefaultLLM: () => async () => ({
        content: JSON.stringify({
          analysis: 'Source-bound fit reasoning.',
          reasoningItems: ['rank candidates', 'verify proof'],
          conclusion: 'Candidate can proceed to review.',
          confidence: 0.91,
        }),
        usage: { totalTokens: 12 },
        metadata: { provider: 'test', model: 'gpt-test' },
      }),
    };

    const reason = factoryReason<{ read: string }>();
    const result = await reason({ read: 'Fit this repository.' }, execution);
    const parsedTelemetry = findStored(execution, 'llm', 'parsedOutput');

    expect(result.reasoning.conclusion).toBe('Candidate can proceed to review.');
    expect(parsedTelemetry.parsed.reasoning.analysis).toBe('Source-bound fit reasoning.');
    expect(parsedTelemetry.provider).toBe('test');
    expect(parsedTelemetry.model).toBe('gpt-test');
  });
});
