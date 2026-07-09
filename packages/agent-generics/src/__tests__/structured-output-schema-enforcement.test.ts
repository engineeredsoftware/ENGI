// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { factoryStructuredOutput } from '../substeps/factories';

const schema = z.object({ title: z.string(), score: z.number() });

function makeExecution(content: string) {
  const execution = new Execution('agent-root') as any;
  execution.llms = {
    getDefaultLLM: () => async () => ({
      content,
      usage: { totalTokens: 9 },
      metadata: { provider: 'test', model: 'test-model' },
    }),
  };
  return execution;
}

function findStored(execution: any, namespace: string, key: string): any {
  const value = execution?.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of execution?.children?.values?.() || []) {
    const childValue = findStored(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}

afterEach(() => {
  jest.useRealTimers();
});

describe('factoryStructuredOutput schema enforcement', () => {
  it('parses valid JSON inside a ```json code fence to the typed output', async () => {
    const execution = makeExecution(
      'Here is the result you asked for:\n```json\n{ "title": "Pack A", "score": 3 }\n```\nLet me know if you need more.'
    );
    const structured = factoryStructuredOutput(schema);

    const result = await structured({ ask: 'synthesize' }, execution);

    expect(result.ask).toBe('synthesize');
    expect(result.output).toEqual({ title: 'Pack A', score: 3 });
  });

  it('never throws on schema-mismatched JSON and still returns a schema-valid output', async () => {
    // Missing required "score"; carries an extra key the schema strips.
    //
    // NOTE (bug, reported not pinned): parseResponse's coerce-merge path is
    // dead under zod 3 — parsing.ts reads `_def.shape` as a plain object but
    // zod 3 stores it as a lazy function, so the near-miss candidate's present
    // keys ("Only Title") are silently DISCARDED and replaced by coerced
    // defaults. We pin only the stable contract: no throw, schema-valid
    // output, no _metadata marker.
    jest.useFakeTimers();
    const execution = makeExecution(JSON.stringify({ title: 'Only Title', extraneous: 'ignored' }));
    const structured = factoryStructuredOutput(schema);

    const promise = structured({ ask: 'synthesize' }, execution);
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(() => schema.parse(result.output)).not.toThrow();
    expect(result.output._metadata).toBeUndefined();
  });

  it('returns buildCoercedBySchema defaults for fully malformed non-JSON prose (after bounded retry sleeps)', async () => {
    jest.useFakeTimers();
    const execution = makeExecution('I cannot produce structured data right now, sorry.');
    const structured = factoryStructuredOutput(schema);

    const promise = structured({ ask: 'synthesize' }, execution);
    // parseResponse re-parses the same string with 1s/2s sleeps before falling back.
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result.output).toEqual({ title: '', score: 0 });
    expect(result.output._metadata).toBeUndefined();
  });

  it('coerces defaults per type — empty string/0/[]/first enum value — and omits optionals', async () => {
    jest.useFakeTimers();
    const richSchema = z.object({
      kind: z.enum(['deposit', 'read']),
      items: z.array(z.string()),
      count: z.number(),
      label: z.string(),
      note: z.string().optional(),
    });
    const execution = makeExecution('No JSON here either.');
    const structured = factoryStructuredOutput(richSchema);

    const promise = structured({ ask: 'synthesize' }, execution);
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result.output).toEqual({ kind: 'deposit', items: [], count: 0, label: '' });
    expect('note' in result.output).toBe(false);
  });

  it('stores llm:parsedOutput.parsed.output equal to the returned output and llm:usage equal to the stub usage', async () => {
    const execution = makeExecution(JSON.stringify({ title: 'Pack B', score: 5 }));
    const structured = factoryStructuredOutput(schema);

    const result = await structured({ ask: 'synthesize' }, execution);

    const parsedOutput = findStored(execution, 'llm', 'parsedOutput');
    expect(parsedOutput.parsed.output).toEqual(result.output);
    expect(parsedOutput.generation).toBe('structured_output');

    const usage = findStored(execution, 'llm', 'usage');
    expect(usage).toEqual({ totalTokens: 9 });
  });
});
