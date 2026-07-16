import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

import {
  buildSynthesisPromptLayers,
  sumLlmTokensFromExecutionTree,
} from '../asset-packs-synthesis-pipeline';
import { measurementCatalogForLens, type SynthesizeAssetPacksMode } from '../asset-packs-synthesis';

// Satisfy the ExecutionPrompt root requirements exactly as AgentExecution does
// at runtime (generic_system + specific_execution set to a blank PromptPart).
const BLANK = ' ' as PromptPart;

/**
 * Gate 3 chunk F — sanity-check that the synthesis PromptParts compose
 * correctly through the real registry build-up: each layer registers under a
 * valid ExecutionPrompt path and the hierarchical formatter renders every
 * layer's instruction content into the system prompt, lens-correctly.
 */
describe('AssetPacksSynthesis formal prompt build-up (Gate 3 chunk F)', () => {
  function render(lens: SynthesizeAssetPacksMode): string {
    const prompt = new ExecutionPrompt();
    prompt.set('generic_system', BLANK);
    prompt.set('specific_execution', BLANK);
    const catalog = measurementCatalogForLens(lens);
    for (const { path, part } of buildSynthesisPromptLayers(
      lens,
      catalog,
      ['capability-slice', 'implementation-pattern'],
      4,
    )) {
      prompt.setSpecificExecution(path, part);
    }
    return prompt.format(hierarchicalFormatter);
  }

  it('registers six hierarchical layers under valid execution-prompt paths', () => {
    const layers = buildSynthesisPromptLayers(
      'deposit',
      measurementCatalogForLens('deposit'),
      ['capability-slice'],
      4,
    );
    expect(layers.map((layer) => layer.path)).toEqual([
      'pipeline:asset-packs-synthesis:identity',
      'pipeline:asset-packs-synthesis:source-safety',
      'phase:deposit:role',
      'agent:measure:catalog',
      'agent:measure:rules',
      'step:candidate:shape',
    ]);
    // Every part is non-empty and accepted by the ExecutionPrompt path hierarchy.
    const prompt = new ExecutionPrompt();
    for (const { path, part } of layers) {
      expect(part.trim().length).toBeGreaterThan(0);
      expect(() => prompt.setSpecificExecution(path, part)).not.toThrow();
    }
  });

  it('composes every deposit layer into the formatted system prompt', () => {
    const rendered = render('deposit');
    expect(rendered).toContain('single Bitcode synthesis and measurement pipeline'); // identity
    expect(rendered).toContain('Source-safety law'); // source-safety
    expect(rendered).toContain('Product pipeline: synthesize-deposits'); // product pipeline role
    expect(rendered).toContain('source-coverage'); // agent catalog
    expect(rendered).toContain('demand-alignment');
    expect(rendered).toContain('DISTINCT candidates'); // agent rules
    expect(rendered).toContain('"options"'); // step candidate-shape contract
    expect(rendered).toContain('capability-slice'); // allowed kinds threaded into rules
  });

  it('carries product-pipeline role and measurement catalog (deposit vs read are separate)', () => {
    const deposit = render('deposit');
    const read = render('read');
    expect(deposit).toContain('Product pipeline: synthesize-deposits');
    expect(read).toContain('Product pipeline: synthesize-reads');
    // Read catalog adds the Need-relative measurement; deposit uses demand-alignment.
    expect(read).toContain('need-fit');
    expect(deposit).not.toContain('need-fit');
    expect(deposit).toContain('demand-alignment');
  });
});

describe('sumLlmTokensFromExecutionTree', () => {
  function node(usage: Record<string, number> | null, children: any[] = []) {
    const map = new Map<string, any>();
    for (let i = 0; i < children.length; i += 1) map.set(`c${i}`, children[i]);
    return {
      get: (namespace: string, key: string) =>
        namespace === 'llm' && key === 'usage' ? usage : undefined,
      children: map,
    };
  }

  it('sums nested Map children (SDIVF PTRR trees), not only array children', () => {
    const root = node({ promptTokens: 10, completionTokens: 5 }, [
      node({ promptTokens: 20, completionTokens: 8 }, [
        node({ totalTokens: 100 }),
      ]),
      node({ prompt_tokens: 3, completion_tokens: 2 }),
    ]);
    // 15 + 28 + 100 + 5 = 148
    expect(sumLlmTokensFromExecutionTree(root)).toBe(148);
  });

  it('returns null when no usage is present anywhere', () => {
    expect(sumLlmTokensFromExecutionTree(node(null, [node(null)]))).toBeNull();
  });
});
