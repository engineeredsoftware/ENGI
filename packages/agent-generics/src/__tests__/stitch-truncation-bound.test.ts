// @ts-nocheck
/**
 * Pins for factoryStitchUntilComplete's truncation-driven loop:
 * - completion predicate: schema-valid output short-circuits everything
 * - truncation heuristic threshold at maxOutputTokens*3 chars (config 4000
 *   -> 12000) measured on the .output field when present
 * - iteration BOUND: a generation that always returns truncated output
 *   terminates after exactly maxStitches (5) attempts with a clean throw —
 *   it must never hang
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { factoryStitchUntilComplete } from '../generations/llm-bound-factories';

const TRUNCATION_THRESHOLD = 4000 * 3; // maxTokens 4000 * rough chars-per-token 3

function makeRootAndStep() {
  const root = new Execution('agent-root') as any;
  root.llms = {
    getDefaultLLM: () => async () => { throw new Error('LLM must not be called'); },
    getDefaultConfig: () => ({ maxTokens: 4000 }),
  };
  root.tools = { getTool: () => undefined };
  root.agents = {};
  const step = new StepExecution('plan', root);
  return { root, step };
}

function collectNodes(node: any, out: any[] = []): any[] {
  out.push(node);
  for (const child of node?.children?.values?.() || []) collectNodes(child, out);
  return out;
}

describe('StitchUntilComplete truncation heuristic (no schema)', () => {
  it('returns the envelope immediately for output below the threshold', async () => {
    let calls = 0;
    const gen = async (input: any) => { calls++; return input; };
    const { step } = makeRootAndStep();

    const shortOutput = 'a'.repeat(TRUNCATION_THRESHOLD - 1);
    const stitch = factoryStitchUntilComplete([gen]);
    const result = await stitch({ output: shortOutput }, step);

    expect(calls).toBe(0);
    expect(Object.keys(result).sort()).toEqual(['context', 'finalOutput', 'output']);
    expect(result.finalOutput).toBe(shortOutput);
    expect(result.finalOutput).toBe(result.output);
  });

  it('stitches once when the generation completes a truncated output, then terminates', async () => {
    let calls = 0;
    const gen = async () => { calls++; return { output: 'done' }; };
    const { root, step } = makeRootAndStep();

    const stitch = factoryStitchUntilComplete([gen]);
    const result = await stitch({ output: 'a'.repeat(TRUNCATION_THRESHOLD) }, step);

    expect(calls).toBe(1);
    expect(result.finalOutput).toBe('done');

    const nodes = collectNodes(root);
    const stitchNode = nodes.find(n => String(n.id).includes('failsafe:stitch_until_complete'));
    expect(stitchNode.get('stitching', 'count')).toBe(1);
    expect(stitchNode.get('stitching', 'error')).toBeUndefined();
  });

  it('a generation that ALWAYS returns truncated output terminates at the 5-stitch bound with a clean throw', async () => {
    let calls = 0;
    const gen = async () => {
      calls++;
      // Emulates an LLM that echoes to max_tokens on every stitch attempt.
      return { output: 'a'.repeat(TRUNCATION_THRESHOLD) };
    };
    const { root, step } = makeRootAndStep();

    const stitch = factoryStitchUntilComplete([gen]);
    await expect(stitch({ output: 'a'.repeat(TRUNCATION_THRESHOLD) }, step)).rejects.toThrow(
      /exceeded maximum stitch attempts \(5\)/,
    );
    // Hard bound: exactly maxStitches generation passes, then termination.
    expect(calls).toBe(5);

    const nodes = collectNodes(root);
    const stitchNode = nodes.find(n => String(n.id).includes('failsafe:stitch_until_complete'));
    expect(stitchNode.get('stitching', 'count')).toBe(5);
    expect(String(stitchNode.get('stitching', 'error'))).toContain('exceeded maximum stitch attempts');
    // Truncation path (no schema) keeps the stock guidance, not a fake schema error.
    expect(String(stitchNode.get('stitching', 'error'))).toMatch(/truncated|maxTokens/i);
  });
});

describe('StitchUntilComplete completion predicate (with schema)', () => {
  const schema = z.object({ title: z.string() });

  it('schema-valid output completes with zero stitches even when it is large', async () => {
    let calls = 0;
    const gen = async (input: any) => { calls++; return input; };
    const { step } = makeRootAndStep();

    // Valid-by-schema wins over the size heuristic: completion is decided by
    // the schema parse at the top of the loop before truncation is consulted.
    const bigValid = { title: 'x'.repeat(TRUNCATION_THRESHOLD + 100) };
    const stitch = factoryStitchUntilComplete([gen], schema);
    const result = await stitch({ output: bigValid }, step);

    expect(calls).toBe(0);
    expect(result.finalOutput).toEqual(bigValid);
  });

  it('stitch generations receive {context, partialOutput, instruction} with partialOutput unwrapped from .output', async () => {
    const stitchInputs: any[] = [];
    const gen = async (input: any) => {
      stitchInputs.push(input);
      return { output: { title: 'repaired' } };
    };
    const { step } = makeRootAndStep();

    const stitch = factoryStitchUntilComplete([gen], schema);
    const result = await stitch({ read: 'task', output: { wrong: true } }, step);

    expect(stitchInputs).toHaveLength(1);
    expect(Object.keys(stitchInputs[0]).sort()).toEqual(['context', 'instruction', 'partialOutput']);
    expect(stitchInputs[0].partialOutput).toEqual({ wrong: true });
    expect(stitchInputs[0].instruction).toContain('failed schema validation');
    expect(result.finalOutput).toEqual({ title: 'repaired' });
  });

  it('surfaces last validation.error in the exceeded-stitch throw (not only maxTokens stock text)', async () => {
    let calls = 0;
    const gen = async () => {
      calls++;
      // Schema never satisfied — options Required style gap.
      return { output: { wrong: true } };
    };
    const optionsSchema = z.object({ options: z.array(z.object({ title: z.string() })).min(1) });
    const { root, step } = makeRootAndStep();
    const stitch = factoryStitchUntilComplete([gen], optionsSchema);
    let thrown: Error | null = null;
    try {
      await stitch({ output: {} }, step);
    } catch (e) {
      thrown = e as Error;
    }
    expect(thrown).toBeTruthy();
    expect(String(thrown?.message)).toMatch(/exceeded maximum stitch attempts \(5\)/);
    expect(String(thrown?.message)).toMatch(/Last validation\.error/);
    expect(String(thrown?.message)).toMatch(/options|Required|invalid/i);
    expect(String(thrown?.message)).not.toMatch(/Consider increasing maxTokens/);
    expect(calls).toBe(5);

    const nodes = collectNodes(root);
    const stitchNode = nodes.find((n) => String(n.id).includes('failsafe:stitch_until_complete'));
    expect(stitchNode.get('stitching', 'count')).toBe(5);
    expect(String(stitchNode.get('validation', 'error') || '')).toMatch(/options|Required|invalid/i);
    expect(String(stitchNode.get('stitching', 'error') || '')).toMatch(/Last validation\.error/);
  });
});
