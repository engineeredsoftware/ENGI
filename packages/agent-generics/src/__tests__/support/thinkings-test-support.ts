/**
 * Shared fixtures for ThinkingsGeneration core and edges tests.
 * Keeps dual-file suites DRY without inventing a third test category.
 */
// @ts-nocheck
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../../execution';

export const thinkingsOutputSchema = z.object({ title: z.string(), score: z.number() });

export const reasoningPayload = {
  analysis: 'analyzed the deposit read',
  reasoningItems: ['inspect candidates', 'rank options'],
  conclusion: 'proceed with synthesis',
  confidence: 0.8,
};
export const judgmentPayload = {
  quality: 0.9,
  issues: [],
  suggestions: [],
  approved: true,
};
export const structuredPayload = { title: 'Asset pack option', score: 42 };
export const usagePayload = { totalTokens: 7, inputTokens: 5, outputTokens: 2 };

/**
 * Scripted LLM: routes by generation user-prompt markers so each Thinkings
 * substep validates on first parse (no parseResponse retry sleeps).
 */
export function makeScriptedLLM(
  capturedUserPrompts: string[],
  overrides: { failOn?: string; error?: Error } = {},
) {
  return async (llmInput: any) => {
    const user =
      (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
    capturedUserPrompts.push(user);
    let payload: any;
    let generation: string;
    if (user.includes('Generate structured output for:')) {
      payload = structuredPayload;
      generation = 'structured_output';
    } else if (
      user.includes('Evaluate the quality and correctness of:') ||
      user.includes('Judge the quality')
    ) {
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

/** Root + plan step with registries and PTRR ancestry meta for findUp. */
export function makeRootAndStep(llm: (input: any) => Promise<any>) {
  const root = new Execution('agent-root') as any;
  root.llms = {
    getDefaultLLM: () => llm,
    getDefaultConfig: () => ({ maxTokens: 4000 }),
  };
  root.tools = { getTool: () => undefined };
  root.agents = {};
  root.store('agent', 'name', 'thinkings-test-agent');
  root.store('step', 'name', 'plan');
  root.store('phase', 'current', 'discovery');
  root.store('ptrr', 'failsafe', 'prepare_concise_context');
  const step = new StepExecution('plan', root);
  return { root, step };
}

export function collectNodes(node: any, out: any[] = []): any[] {
  out.push(node);
  for (const child of node?.children?.values?.() || []) collectNodes(child, out);
  return out;
}

export function generationNodes(root: any): Map<string, any> {
  const map = new Map<string, any>();
  for (const node of collectNodes(root)) {
    const gen = node?.get?.('ptrr', 'generation');
    if (gen) map.set(gen, node);
  }
  return map;
}
