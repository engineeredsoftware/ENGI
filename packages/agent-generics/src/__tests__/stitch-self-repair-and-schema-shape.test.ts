// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { factoryStitchUntilComplete, factoryStructuredOutput } from '../substeps/factories';

describe('StitchUntilComplete self-repair instruction', () => {
  it('tells the model exactly what failed schema validation instead of only "continue"', async () => {
    const schema = z.object({ value: z.string(), confidence: z.number() });
    const stitchInputs: any[] = [];
    const gen = async (input: any) => {
      stitchInputs.push(input);
      return { value: 'x', confidence: 0.9 };
    };
    const stitch = factoryStitchUntilComplete([gen], schema);
    const result = await stitch({ value: 'x' }, new Execution('root'));

    expect(stitchInputs).toHaveLength(1);
    expect(stitchInputs[0].instruction).toContain('failed schema validation');
    expect(stitchInputs[0].instruction).toContain('confidence');
    expect(result.finalOutput).toEqual({ value: 'x', confidence: 0.9 });
  });
});

describe('structured output schema shape rendering', () => {
  it('renders every nested field — required fields beyond the sixth must reach the model', async () => {
    // Mirrors the deposit candidateSetSchema shape whose 7th..9th fields
    // (confidence, patch, needinessSignal) were hidden by the truncated hint.
    const candidate = z.object({
      kind: z.string(),
      title: z.string(),
      summary: z.string(),
      coveredSourcePaths: z.array(z.string()),
      measurements: z.record(z.string(), z.number()),
      measurementRationale: z.string(),
      confidence: z.number(),
      patch: z.object({ fileChanges: z.array(z.object({ path: z.string(), op: z.enum(['create', 'modify', 'delete']) })), patchSummary: z.string() }),
      needinessSignal: z.object({ demand: z.number(), saturation: z.number(), rationale: z.string() }).optional(),
    });
    const schema = z.object({ options: z.array(candidate) });

    let capturedUserPrompt = '';
    const exec = new Execution('root') as any;
    exec.llms = {
      getDefaultLLM: () => async (llmInput: any) => {
        const user = (llmInput.messages || []).find((m: any) => m.role === 'user');
        capturedUserPrompt = user?.content ?? '';
        return {
          content: JSON.stringify({ options: [] }),
          usage: { totalTokens: 5 },
          metadata: { provider: 'test', model: 'test-model' },
        };
      },
    };

    const structured = factoryStructuredOutput(schema);
    await structured({ context: 'synthesize' }, exec);

    for (const field of ['kind', 'title', 'summary', 'coveredSourcePaths', 'measurements', 'measurementRationale', 'confidence', 'patch', 'needinessSignal']) {
      expect(capturedUserPrompt).toContain(`"${field}"`);
    }
  });
});
