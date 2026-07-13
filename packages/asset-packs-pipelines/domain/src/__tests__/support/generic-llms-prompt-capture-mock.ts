/**
 * Boundary LLM mock WITH prompt capture for AssetPack prompt-contract tests
 * (F26-A companion to ./generic-llms-mock.ts).
 *
 * Identical boundary seam (mock `@bitcode/generic-llms` so every agent's
 * `execution.llms.getDefaultLLM()` resolves to a canned deterministic LLM), but
 * additionally records every LLM call's system + user message so tests can
 * assert on the FULL hierarchical system prompt exactly as
 * buildHierarchicalPrompt composed it for the wire.
 *
 * Usage (at the TOP of a test file, before importing the agent under test):
 *
 *   jest.mock('@bitcode/generic-llms', () =>
 *     require('./support/generic-llms-prompt-capture-mock').makeGenericLLMsMock());
 *   import {
 *     setBoundaryLLMOutput,
 *     resetBoundaryLLMOutput,
 *     getCapturedLLMCalls,
 *     resetCapturedLLMCalls,
 *   } from './support/generic-llms-prompt-capture-mock';
 */

export interface CapturedLLMCall {
  system: string;
  user: string;
}

const REASON_JUDGE_SAFE_DEFAULTS = {
  analysis: 'Boundary-mock reasoning.',
  steps: ['Boundary-mock step.'],
  conclusion: 'Boundary-mock conclusion.',
  confidence: 0.9,
  quality: 0.9,
  issues: [],
  suggestions: [],
  approved: true,
};

// The canned response is emitted as a ```json code block. The boundary parser's
// balanced-brace extraction only handles three levels of raw-JSON nesting, but
// code-block candidates are extracted whole at any depth — fencing keeps deeply
// nested structured outputs (e.g. options[].patch.fileChanges[]) parseable for
// every generation kind without slow parse-retry backoff loops.
const fence = (json: string): string => '```json\n' + json + '\n```';

const holder: { content: string; calls: CapturedLLMCall[] } = {
  content: fence(JSON.stringify(REASON_JUDGE_SAFE_DEFAULTS)),
  calls: [],
};

/**
 * Set the structured output the boundary LLM returns for the agent under test.
 * Reason/judge-safe defaults are merged underneath so the same response parses
 * for every generation kind (reason -> judge -> structured_output).
 */
export function setBoundaryLLMOutput(structuredOutput: Record<string, unknown>): void {
  holder.content = fence(JSON.stringify({ ...REASON_JUDGE_SAFE_DEFAULTS, ...structuredOutput }));
}

/** Reset the boundary output to the bare reason/judge-safe defaults. */
export function resetBoundaryLLMOutput(): void {
  holder.content = fence(JSON.stringify(REASON_JUDGE_SAFE_DEFAULTS));
}

/** Every LLM call captured since the last reset, in call order. */
export function getCapturedLLMCalls(): CapturedLLMCall[] {
  return holder.calls.slice();
}

/** Clear the captured call log (call between agents/tests). */
export function resetCapturedLLMCalls(): void {
  holder.calls.length = 0;
}

/** The mock module shape for `jest.mock('@bitcode/generic-llms', ...)`. */
export function makeGenericLLMsMock() {
  const cannedLLM = async (input: any) => {
    const messages = Array.isArray(input?.messages) ? input.messages : [];
    const system = messages
      .filter((m: any) => m?.role === 'system')
      .map((m: any) => String(m?.content ?? ''))
      .join('\n');
    const user = messages
      .filter((m: any) => m?.role === 'user')
      .map((m: any) => String(m?.content ?? ''))
      .join('\n');
    holder.calls.push({ system, user });

    return {
      content: holder.content,
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      metadata: { provider: 'mock', model: 'mock', stopReason: 'stop' },
    };
  };
  const registry = {
    setDefaultProvider() {},
    configure() {},
    registerProvider() {},
    getDefaultConfig() {
      return { model: 'mock', maxTokens: 4096 };
    },
    getLLM() {
      return cannedLLM;
    },
  };
  return {
    resolveDefaultLLMConfig: () => ({ provider: 'mock', model: 'mock' }),
    resolveDefaultLLMModel: () => 'mock',
    resolveDefaultLLMProvider: () => 'mock',
    factoryLLMRegistryWithProviders: () => registry,
    openAIProvider: {},
    anthropicProvider: {},
    googleProvider: {},
  };
}
