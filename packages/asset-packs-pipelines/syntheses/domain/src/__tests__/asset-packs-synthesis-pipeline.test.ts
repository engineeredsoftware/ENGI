import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

import {
  buildSynthesisPromptLayers,
  sumLlmTokensFromExecutionTree,
} from '../asset-packs-synthesis-pipeline';
import { synthesisPolicyCatalogForMode } from '../asset-packs-synthesis';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

// Satisfy the ExecutionPrompt root requirements exactly as AgentExecution does
// at runtime (generic_system + specific_execution set to a blank PromptPart).
const BLANK = ' ' as PromptPart;

/**
 * Gate 3 chunk F — synthesis PromptParts compose through registry build-up.
 * Policy layers are steering only; LLM must not invent absolute volumes.
 */
describe('AssetPacksSynthesis formal prompt build-up (Gate 3 chunk F)', () => {
  function render(mode: SynthesizeAssetPacksMode): string {
    const prompt = new ExecutionPrompt();
    prompt.set('generic_system', BLANK);
    prompt.set('specific_execution', BLANK);
    const catalog = synthesisPolicyCatalogForMode(mode);
    for (const { path, part } of buildSynthesisPromptLayers(
      mode,
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
      synthesisPolicyCatalogForMode('deposit'),
      ['capability-slice'],
      4,
    );
    expect(layers.map((layer) => layer.path)).toEqual([
      'pipeline:asset-packs-synthesis:identity',
      'pipeline:asset-packs-synthesis:source-safety',
      'phase:deposit:role',
      'agent:synthesis:policy',
      'agent:synthesis:rules',
      'step:candidate:shape',
    ]);
    const prompt = new ExecutionPrompt();
    for (const { path, part } of layers) {
      expect(part.trim().length).toBeGreaterThan(0);
      expect(() => prompt.setSpecificExecution(path, part)).not.toThrow();
    }
  });

  it('composes every deposit layer into the formatted system prompt', () => {
    const rendered = render('deposit');
    expect(rendered).toMatch(/synthesis pipeline/i);
    expect(rendered).toContain('Source-safety law');
    expect(rendered).toContain('Product pipeline: synthesize-deposits');
    expect(rendered).toContain('Synthesis policy');
    expect(rendered).toMatch(/do NOT invent absolute/i);
    expect(rendered).toContain('DISTINCT candidates');
    expect(rendered).toContain('"options"');
    expect(rendered).toContain('capability-slice');
    expect(rendered).toContain('synthesisRationale');
    expect(rendered).not.toMatch(/measurements is an object with EXACTLY these keys/i);
  });

  it('carries product-pipeline role and policy (deposit vs read are separate)', () => {
    const deposit = render('deposit');
    const read = render('read');
    expect(deposit).toContain('Product pipeline: synthesize-deposits');
    expect(read).toContain('Product pipeline: synthesize-reads');
    expect(read).toContain('Need fit');
    expect(deposit).not.toContain('Need fit');
    expect(deposit).toContain('Demand alignment');
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
