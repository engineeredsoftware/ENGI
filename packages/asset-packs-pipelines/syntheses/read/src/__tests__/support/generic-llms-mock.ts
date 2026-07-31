/**
 * Boundary LLM mock for AssetPack agent tests (F26-A).
 *
 * Inference is non-configurable: agents ALWAYS run the formal PTRR hierarchy and
 * the lowest-level Generation ALWAYS performs real inference. The ONLY sanctioned
 * way to make a test deterministic is to mock the LLM provider at the boundary.
 *
 * AgentExecution builds its LLM registry from `@bitcode/generic-llms`
 * (`factoryLLMRegistryWithProviders` + `resolveDefaultLLMConfig`). Mocking that
 * module therefore replaces the base LLM every agent resolves through
 * `execution.llms.getDefaultLLM()`.
 *
 * Usage (at the TOP of a test file, before importing the agent under test):
 *
 *   jest.mock('@bitcode/generic-llms', () =>
 *     require('./support/generic-llms-mock').makeGenericLLMsMock());
 *   import { setBoundaryLLMOutput } from './support/generic-llms-mock';
 *
 * Then, inside a test: `setBoundaryLLMOutput({ ...agent structured output... })`.
 *
 * A single canned response must survive every generation in the PTRR run
 * (reason -> judge -> structured_output, across plan/try/refine/retry). We merge
 * lenient reason/judge-safe defaults under the caller's structured output so the
 * same JSON parses for all three generation kinds; the agent's (non-strict)
 * output schema strips the reason/judge keys from the final typed result.
 */

const REASON_JUDGE_SAFE_DEFAULTS = {
  analysis: 'Boundary-mock reasoning.',
  reasoningItems: ['Boundary-mock reasoning item.'],
  conclusion: 'Boundary-mock conclusion.',
  confidence: 0.9,
  quality: 0.9,
  issues: [],
  suggestions: [],
  approved: true,
};

// Emit the canned JSON inside a ```json code fence, exactly like a real provider
// response. The fence matters: @bitcode/parsing tries fenced-block extraction
// FIRST (arbitrary nesting), while its bare balanced-brace regex only matches 3
// levels of `{}` nesting — deep structured outputs (e.g. options[].patch.fileChanges[])
// would otherwise never surface as a whole-object candidate.
function asLLMContent(payload: Record<string, unknown>): string {
  return '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
}

const holder: { content: string } = {
  content: asLLMContent(REASON_JUDGE_SAFE_DEFAULTS),
};

type BoundaryLLMCall = { messages: Array<{ role?: string; content?: string }> };

const calls: BoundaryLLMCall[] = [];

/**
 * Every prompt the boundary LLM received (in call order). Lets tests assert
 * WHAT context actually reached generation (e.g. cross-phase store reads that
 * were threaded into the agent input) without touching the non-configurable
 * inference machinery.
 */
export function getBoundaryLLMCalls(): BoundaryLLMCall[] {
  return calls;
}

/** Concatenated content of every message across all boundary LLM calls. */
export function getBoundaryLLMPromptText(): string {
  return calls
    .map((call) => call.messages.map((message) => String(message?.content ?? '')).join('\n'))
    .join('\n');
}

/** Reset the captured boundary LLM calls. */
export function resetBoundaryLLMCalls(): void {
  calls.length = 0;
}

/**
 * Set the structured output the boundary LLM returns for the agent under test.
 * Reason/judge-safe defaults are merged underneath so the same response parses
 * for every generation kind.
 */
export function setBoundaryLLMOutput(structuredOutput: Record<string, unknown>): void {
  holder.content = asLLMContent({ ...REASON_JUDGE_SAFE_DEFAULTS, ...structuredOutput });
}

/** Reset the boundary output to the bare reason/judge-safe defaults. */
export function resetBoundaryLLMOutput(): void {
  holder.content = asLLMContent(REASON_JUDGE_SAFE_DEFAULTS);
}

/** The mock module shape for `jest.mock('@bitcode/generic-llms', ...)`. */
export function makeGenericLLMsMock() {
  const cannedLLM = async (input?: { messages?: Array<{ role?: string; content?: string }> }) => {
    calls.push({ messages: Array.isArray(input?.messages) ? input!.messages! : [] });
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
