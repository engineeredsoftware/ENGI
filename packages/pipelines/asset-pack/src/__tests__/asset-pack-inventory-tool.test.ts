// @ts-nocheck
/**
 * AssetPackInventoryTool — the formal source-inventory ExecutionTool of the
 * SynthesizeAssetPacks pipeline (V48 Gate 3, tools/executions domain).
 *
 * Pins that the tool is the fail-closed protected-IP boundary: execute()
 * applies the exclusions to paths AND samples (an excluded file is never
 * measured, sampled, or carried forward) and reports honest exclusion counts;
 * and that, when bound to an execution, the standard ExecutionTool tracking
 * child records the invocation outcome.
 */
import { Execution } from '@bitcode/execution-generics';
import { AssetPackInventoryTool } from '../asset-packs-synthesis-pipeline';

const PATHS = [
  'src/auth/login.ts',
  'src/auth/secret-sauce.ts',
  'src/billing/invoice.ts',
  'README.md',
];

const SAMPLES = [
  { path: 'src/auth/login.ts', excerpt: 'export function login() {}' },
  { path: 'src/auth/secret-sauce.ts', excerpt: 'export const PROPRIETARY = true;' },
  { path: 'src/billing/invoice.ts', excerpt: 'export function invoice() {}' },
];

describe('AssetPackInventoryTool.execute — protected-IP exclusions (fail-closed)', () => {
  it('filters excluded paths and samples and reports honest counts', async () => {
    const tool = new AssetPackInventoryTool();

    const inventory = await tool.execute({
      paths: PATHS,
      samples: SAMPLES,
      exclusions: ['src/auth/secret-sauce.ts'],
    });

    expect(inventory.paths).toEqual([
      'src/auth/login.ts',
      'src/billing/invoice.ts',
      'README.md',
    ]);
    expect(inventory.samples.map((sample) => sample.path)).toEqual([
      'src/auth/login.ts',
      'src/billing/invoice.ts',
    ]);
    expect(inventory.totalPathCount).toBe(4);
    expect(inventory.excludedPathCount).toBe(1);
    // The excluded excerpt is gone entirely.
    expect(JSON.stringify(inventory)).not.toContain('PROPRIETARY');
  });

  it('honors glob-style exclusions across whole directories', async () => {
    const tool = new AssetPackInventoryTool();

    const inventory = await tool.execute({
      paths: PATHS,
      samples: SAMPLES,
      exclusions: ['src/auth/*'],
    });

    expect(inventory.paths).toEqual(['src/billing/invoice.ts', 'README.md']);
    expect(inventory.samples.map((sample) => sample.path)).toEqual(['src/billing/invoice.ts']);
    expect(inventory.excludedPathCount).toBe(2);
  });

  it('passes the inventory through untouched when there are no exclusions', async () => {
    const tool = new AssetPackInventoryTool();

    const inventory = await tool.execute({ paths: PATHS, samples: SAMPLES, exclusions: [] });

    expect(inventory.paths).toEqual(PATHS);
    expect(inventory.samples).toEqual(SAMPLES);
    expect(inventory.totalPathCount).toBe(4);
    expect(inventory.excludedPathCount).toBe(0);
  });

  it('records the standard ExecutionTool tracking child when bound to an execution', async () => {
    const execution = new Execution('agent:measure-deposit');
    const tool = new AssetPackInventoryTool().bindExecution(execution);

    const inventory = await tool.execute({
      paths: PATHS,
      samples: SAMPLES,
      exclusions: ['src/auth/secret-sauce.ts'],
    });
    expect(inventory.excludedPathCount).toBe(1);

    const toolExec = Array.from(execution.children.values()).find((child) =>
      child.id.endsWith('tool:AssetPackInventoryTool'),
    );
    expect(toolExec).toBeDefined();
    expect(toolExec.get('tool', 'name')).toBe('AssetPackInventoryTool');
    expect(toolExec.get('tool', 'status')).toBe('success');
    // The tracked result is the FILTERED inventory (never the raw request).
    expect(toolExec.get('tool', 'result').paths).not.toContain('src/auth/secret-sauce.ts');
  });
});
