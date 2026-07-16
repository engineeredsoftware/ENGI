// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { factoryStitchUntilComplete, factoryReason, factoryStructuredOutput } from '../generations/llm-bound-factories';

const schema = z.object({ value: z.string() });

describe('StitchUntilComplete final attempt', () => {
  it('returns a schema-valid final stitch instead of discarding it as exceeded', async () => {
    let calls = 0;
    const gen = async () => {
      calls++;
      return calls >= 5 ? { value: 'complete' } : { partial: true };
    };
    const stitch = factoryStitchUntilComplete([gen], schema);
    const result = await stitch({ partial: true }, new Execution('root'));

    expect(calls).toBe(5);
    expect(result.finalOutput).toEqual({ value: 'complete' });
  });

  it('still fails closed when every stitch attempt stays invalid', async () => {
    let calls = 0;
    const gen = async () => {
      calls++;
      return { partial: true };
    };
    const stitch = factoryStitchUntilComplete([gen], schema);

    await expect(stitch({ partial: true }, new Execution('root'))).rejects.toThrow(
      /exceeded maximum stitch attempts/
    );
    expect(calls).toBe(5);
  });

  it('returns valid input without any stitch generation', async () => {
    let calls = 0;
    const gen = async () => {
      calls++;
      return { value: 'stitched' };
    };
    const stitch = factoryStitchUntilComplete([gen], schema);
    const result = await stitch({ value: 'already complete' }, new Execution('root'));

    expect(calls).toBe(0);
    expect(result.finalOutput).toEqual({ value: 'already complete' });
  });
});

describe('debug stop escapes the substep', () => {
  const llms = (content: any) => ({
    getDefaultLLM: () => async () => ({
      content: typeof content === 'string' ? content : JSON.stringify(content),
      usage: { totalTokens: 5 },
      metadata: { provider: 'test', model: 'test-model' },
    }),
  });

  const nestedDebugPathExecution = () => {
    const root = new Execution('agent-root');
    const nested = root.child('plan').child('failsafe:prepare_concise_context').child('gen-0');
    (nested as any).llms = llms({
      analysis: 'a',
      steps: ['s'],
      conclusion: 'c',
      confidence: 0.9,
    });
    return nested;
  };

  afterEach(() => {
    delete process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON;
    delete process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT;
  });

  it('BITCODE_DEBUG_STOP_AFTER_FIRST_REASON stops after the first reason generation', async () => {
    process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_REASON = '1';
    const reason = factoryReason();

    await expect(reason({ read: 'anything' }, nestedDebugPathExecution())).rejects.toThrow(
      '__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__'
    );
  });

  it('BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT stops on the first structured output (gen-0 pathing)', async () => {
    process.env.BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT = '1';
    const root = new Execution('agent-root');
    const nested = root.child('plan').child('failsafe:prepare_concise_context').child('gen-0');
    (nested as any).llms = llms({ value: 'ok' });
    const structured = factoryStructuredOutput(schema);

    await expect(structured({ context: 'anything' }, nested)).rejects.toThrow(
      '__BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT__'
    );
  });
});
