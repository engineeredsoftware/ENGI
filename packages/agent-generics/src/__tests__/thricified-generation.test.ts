// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { createThricifiedGeneration } from '../steps/thricified-generation';

const outputSchema = z.object({ title: z.string(), score: z.number() });

const reasoningPayload = {
  analysis: 'analyzed the deposit read',
  steps: ['inspect candidates', 'rank options'],
  conclusion: 'proceed with synthesis',
  confidence: 0.8,
};
const judgmentPayload = { quality: 0.9, issues: [], suggestions: [], approved: true };
const structuredPayload = { title: 'Asset pack option', score: 42 };

const usagePayload = { totalTokens: 7, inputTokens: 5, outputTokens: 2 };

/**
 * Scripted LLM stub: routes by the generation-specific user-prompt marker so
 * every generation receives a response its parser validates on the first try
 * (no parseResponse retry sleeps).
 */
function makeScriptedLLM(capturedUserPrompts: string[], overrides: { failOn?: string; error?: Error } = {}) {
  return async (llmInput: any) => {
    const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
    capturedUserPrompts.push(user);
    let payload: any;
    let generation: string;
    if (user.includes('Generate structured output for:')) {
      payload = structuredPayload;
      generation = 'structured_output';
    } else if (user.includes('Evaluate the quality and correctness of:') || user.includes('Judge the quality')) {
      payload = judgmentPayload;
      generation = 'judge';
    } else {
      payload = reasoningPayload;
      generation = 'reason';
    }
    if (overrides.failOn && overrides.failOn === generation) {
      throw overrides.error ?? new Error(`scripted failure for ${generation}`);
    }
    return {
      content: JSON.stringify(payload),
      usage: { ...usagePayload },
      metadata: { provider: 'test', model: 'test-model', stopReason: 'end' },
    };
  };
}

/** Build a root that carries registries + agent/step/phase meta the substeps findUp. */
function makeRootAndStep(llm: (input: any) => Promise<any>) {
  const root = new Execution('agent-root') as any;
  root.llms = { getDefaultLLM: () => llm, getDefaultConfig: () => ({ maxTokens: 4000 }) };
  root.tools = { getTool: () => undefined };
  root.agents = {};
  root.store('agent', 'name', 'thricified-test-agent');
  root.store('step', 'name', 'plan');
  root.store('phase', 'current', 'discovery');
  root.store('ptrr', 'failsafe', 'prepare_concise_context');
  const step = new StepExecution('plan', root);
  return { root, step };
}

function collectNodes(node: any, out: any[] = []): any[] {
  out.push(node);
  for (const child of node?.children?.values?.() || []) collectNodes(child, out);
  return out;
}

function generationNodes(root: any): Map<string, any> {
  const map = new Map<string, any>();
  for (const node of collectNodes(root)) {
    const gen = node?.get?.('ptrr', 'generation');
    if (gen) map.set(gen, node);
  }
  return map;
}

afterEach(() => {
  delete process.env.BITCODE_DEBUG_ONLY_GENERATIONS;
});

describe('createThricifiedGeneration sequencing and payload threading', () => {
  it('runs exactly three LLM calls in Reason -> Judge -> StructuredOutput order', async () => {
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thricified = createThricifiedGeneration(outputSchema);

    await thricified({ read: 'Fit this repository.' }, step);

    expect(userPrompts).toHaveLength(3);
    expect(userPrompts[0]).toContain('Apply logical reasoning to solve:');
    expect(userPrompts[1]).toContain('Evaluate the quality and correctness of:');
    expect(userPrompts[2]).toContain('Generate structured output for:');
  });

  it('threads Reason output into Judge, and Reason + Judge outputs into StructuredOutput', async () => {
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thricified = createThricifiedGeneration(outputSchema);

    await thricified({ read: 'Fit this repository.' }, step);

    // Judge evaluates the original input PLUS the reasoning Reason produced.
    expect(userPrompts[1]).toContain('"read": "Fit this repository."');
    expect(userPrompts[1]).toContain('"conclusion": "proceed with synthesis"');
    // Judge runs before any structured output exists (advisory judge).
    expect(userPrompts[1]).not.toContain('"title"');

    // StructuredOutput sees the input, the reasoning AND the judgment.
    expect(userPrompts[2]).toContain('"read": "Fit this repository."');
    expect(userPrompts[2]).toContain('"conclusion": "proceed with synthesis"');
    expect(userPrompts[2]).toContain('"approved": true');
  });

  it('returns { ...input, reasoning, judgment, output } with output parsed against the schema', async () => {
    const { step } = makeRootAndStep(makeScriptedLLM([]));
    const thricified = createThricifiedGeneration(outputSchema);

    const result = await thricified({ read: 'Fit this repository.' }, step);

    expect(result.read).toBe('Fit this repository.');
    expect(result.reasoning).toEqual(reasoningPayload);
    expect(result.judgment).toEqual(judgmentPayload);
    expect(result.output).toEqual(structuredPayload);
    expect(() => outputSchema.parse(result.output)).not.toThrow();
  });

  it('BITCODE_DEBUG_ONLY_GENERATIONS runs only the named generation', async () => {
    process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'judge';
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thricified = createThricifiedGeneration(outputSchema);

    const result = await thricified({ read: 'anything' }, step);

    expect(userPrompts).toHaveLength(1);
    expect(userPrompts[0]).toContain('Evaluate the quality and correctness of:');
    expect(result.judgment).toEqual(judgmentPayload);
    expect(result.reasoning).toBeUndefined();
    expect(result.output).toBeUndefined();
  });

  it('an unmatched BITCODE_DEBUG_ONLY_GENERATIONS filter falls back to running all three', async () => {
    process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'bogus-generation';
    const userPrompts: string[] = [];
    const { step } = makeRootAndStep(makeScriptedLLM(userPrompts));
    const thricified = createThricifiedGeneration(outputSchema);

    const result = await thricified({ read: 'anything' }, step);

    expect(userPrompts).toHaveLength(3);
    expect(result.output).toEqual(structuredPayload);
  });
});

describe('createThricifiedGeneration execution-state stores', () => {
  it('each generation node stores ptrr:generation, timing:duration and the llm:* key set', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    const thricified = createThricifiedGeneration(outputSchema);

    await thricified({ read: 'Fit this repository.' }, step);

    const nodes = generationNodes(root);
    expect([...nodes.keys()].sort()).toEqual(['judge', 'reason', 'structured_output']);

    for (const [gen, node] of nodes) {
      // Namespaces each generation substep populates.
      expect(node.getNamespaces().sort()).toEqual(['llm', 'ptrr', 'timing']);
      // Exact llm:* key names.
      expect([...node.getAll('llm').keys()].sort()).toEqual(
        ['input', 'model', 'output', 'parsedOutput', 'prompt', 'provider', 'stopReason', 'usage']
      );
      expect(typeof node.get('timing', 'duration')).toBe('number');
      expect(node.get('ptrr', 'generation')).toBe(gen);
      expect(node.get('llm', 'stopReason')).toBe('end');
      expect(node.get('llm', 'provider')).toBe('test');
      expect(node.get('llm', 'model')).toBe('test-model');
    }
  });

  it('llm:output carries only content plus the findUp ancestry meta (source-safe shape)', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    const thricified = createThricifiedGeneration(outputSchema);

    await thricified({ read: 'Fit this repository.' }, step);

    const reasonNode = generationNodes(root).get('reason');
    expect(reasonNode.get('llm', 'output')).toEqual({
      content: JSON.stringify(reasoningPayload),
      phase: 'discovery',
      agent: 'thricified-test-agent',
      step: 'plan',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
      provider: 'test',
      model: 'test-model',
    });
  });

  it('llm:input and llm:parsedOutput carry the same ancestry meta and the parsed object', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    const thricified = createThricifiedGeneration(outputSchema);

    const result = await thricified({ read: 'Fit this repository.' }, step);

    const structuredNode = generationNodes(root).get('structured_output');
    const input = structuredNode.get('llm', 'input');
    expect(input.messages.map((m: any) => m.role)).toEqual(['system', 'user']);
    expect(input.generation).toBe('structured_output');
    expect(input.failsafe).toBe('prepare_concise_context');
    expect(input.phase).toBe('discovery');
    expect(input.agent).toBe('thricified-test-agent');
    expect(input.step).toBe('plan');

    const parsedOutput = structuredNode.get('llm', 'parsedOutput');
    expect(parsedOutput.generation).toBe('structured_output');
    expect(parsedOutput.provider).toBe('test');
    expect(parsedOutput.model).toBe('test-model');
    expect(parsedOutput.parsed.output).toEqual(structuredPayload);
    expect(parsedOutput.parsed.output).toEqual(result.output);

    expect(typeof structuredNode.get('llm', 'prompt')).toBe('string');
    expect(structuredNode.get('llm', 'prompt')).toContain('Generate structured output for:');
  });

  it('stores per-generation llm:usage that sums across the three calls', async () => {
    const { root, step } = makeRootAndStep(makeScriptedLLM([]));
    const thricified = createThricifiedGeneration(outputSchema);

    await thricified({ read: 'Fit this repository.' }, step);

    const nodes = generationNodes(root);
    let total = 0;
    for (const node of nodes.values()) {
      const usage = node.get('llm', 'usage');
      expect(usage).toEqual(usagePayload);
      total += usage.totalTokens;
    }
    expect(total).toBe(3 * usagePayload.totalTokens);
  });
});

describe('createThricifiedGeneration error propagation', () => {
  it('rejects with the original error when the Judge LLM call rejects, keeping Reason stores intact', async () => {
    const boom = new Error('provider exploded');
    const userPrompts: string[] = [];
    const { root, step } = makeRootAndStep(makeScriptedLLM(userPrompts, { failOn: 'judge', error: boom }));
    const thricified = createThricifiedGeneration(outputSchema);

    await expect(thricified({ read: 'anything' }, step)).rejects.toThrow('provider exploded');

    // The structured_output generation never ran.
    expect(userPrompts).toHaveLength(2);
    const nodes = generationNodes(root);
    expect(nodes.has('structured_output')).toBe(false);

    // Reason completed and kept its full store set.
    const reasonNode = nodes.get('reason');
    expect(reasonNode.get('llm', 'output').content).toBe(JSON.stringify(reasoningPayload));
    expect(reasonNode.get('llm', 'usage')).toEqual(usagePayload);

    // The failed Judge generation node exists but recorded no llm:* stores at
    // all — pins the current telemetry gap: llm:input/prompt are only stored
    // after a successful call, so a failed/stalled call has no llm footprint.
    const judgeNode = nodes.get('judge');
    expect(judgeNode).toBeDefined();
    expect(judgeNode.hasNamespace('llm')).toBe(false);
    expect(judgeNode.get('llm', 'output')).toBeUndefined();
    expect(judgeNode.get('llm', 'parsedOutput')).toBeUndefined();
    expect(judgeNode.get('llm', 'usage')).toBeUndefined();
  });
});
