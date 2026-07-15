// @ts-nocheck
/**
 * AgentExecution default-LLM env resolution + AgentLLMsRegistry call tracking
 * (V48 Gate 3 — tools/executions domain).
 *
 * Inference is NON-configurable (F26-A): determinism comes from the boundary
 * LLM seam, so @bitcode/generic-llms is mocked here with recording providers
 * while the REAL env-resolution defaults (resolveDefaultLLMConfig) stay live.
 *
 * Pins:
 * - AgentExecution honors BITCODE_LLM_PROVIDER + BITCODE_LLM_MODEL: the '*'
 *   global config carries the env model and the env provider is the default.
 * - Provider fallback: no BITCODE_LLM_PROVIDER + OPENAI_API_KEY → openai with
 *   its default model.
 * - getDefaultLLM's tracking wrapper stores the llm-namespace telemetry keys
 *   (content-bearing keys are withheld downstream by sourceSafeStreamEvent —
 *   pinned in pipelines-generics' streaming tests).
 * - BITCODE_LLM_CALL_TIMEOUT_MS bounds every call (reject + failed status);
 *   0 disables the bound.
 */
const mockLLMCalls: Array<{ provider: string; config: any }> = [];

jest.mock('@bitcode/generic-llms', () => {
  const { LLMRegistry } = jest.requireActual('@bitcode/llm-generics');
  const defaults = jest.requireActual('@bitcode/generic-llms/defaults');
  return {
    resolveDefaultLLMConfig: defaults.resolveDefaultLLMConfig,
    resolveDefaultLLMModel: defaults.resolveDefaultLLMModel,
    resolveDefaultLLMProvider: defaults.resolveDefaultLLMProvider,
    factoryLLMRegistryWithProviders: () => {
      const registry = new LLMRegistry();
      for (const name of ['openai', 'anthropic', 'google']) {
        registry.registerProvider({
          name,
          createLLM: (config: any) => async () => {
            mockLLMCalls.push({ provider: name, config });
            return {
              content: `stubbed:${name}:${config.model ?? 'unconfigured'}`,
              usage: { inputTokens: 3, outputTokens: 4, totalTokens: 7 },
            };
          },
        });
      }
      return registry;
    },
  };
});

import { Execution } from '@bitcode/execution-generics';
import { AgentExecution } from '../execution/AgentExecution';
import { AgentLLMsRegistry } from '../execution/AgentLLMsRegistry';

const ENV_KEYS = [
  'BITCODE_LLM_PROVIDER',
  'BITCODE_LLM_MODEL',
  'BITCODE_LLM_CALL_TIMEOUT_MS',
  'OPENAI_API_KEY',
  // Provider-key precedence is anthropic → google → openai (generic-llms defaults).
  // Snapshot and clear these so host-shell keys cannot make fallback tests flake.
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
];
let envSnapshot: Record<string, string | undefined>;

beforeEach(() => {
  envSnapshot = {};
  for (const key of ENV_KEYS) envSnapshot[key] = process.env[key];
  mockLLMCalls.length = 0;
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (envSnapshot[key] === undefined) delete process.env[key];
    else process.env[key] = envSnapshot[key];
  }
});

function findLlmChild(execution: Execution, suffix: string): Execution | undefined {
  return Array.from(execution.children.values()).find((child) => child.id.endsWith(suffix));
}

describe('AgentExecution — default-LLM env resolution (BITCODE_LLM_*)', () => {
  it('honors BITCODE_LLM_PROVIDER + BITCODE_LLM_MODEL for getDefaultLLM', async () => {
    process.env.BITCODE_LLM_PROVIDER = 'anthropic';
    process.env.BITCODE_LLM_MODEL = 'claude-env-pin';
    delete process.env.BITCODE_LLM_CALL_TIMEOUT_MS;

    const agentExec = new AgentExecution('agent:env-honored');
    const llm = agentExec.llms.getDefaultLLM();
    const output = await llm({ messages: [{ role: 'user', content: 'hi' }] });

    expect(mockLLMCalls).toHaveLength(1);
    expect(mockLLMCalls[0].provider).toBe('anthropic');
    expect(mockLLMCalls[0].config.model).toBe('claude-env-pin');
    expect(output.content).toBe('stubbed:anthropic:claude-env-pin');

    // The agent-level presence config for Bitcode boundary enforcement.
    expect(agentExec.llms.get('default')).toEqual({ model: 'claude-env-pin' });
    expect(agentExec.llms.ensureDefaultConfigured()).toBe(true);
  });

  it('falls back to the API-key-derived provider and its default model when BITCODE_LLM_* are unset', async () => {
    delete process.env.BITCODE_LLM_PROVIDER;
    delete process.env.BITCODE_LLM_MODEL;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.OPENAI_API_KEY = 'test-key-openai';

    const agentExec = new AgentExecution('agent:env-fallback');
    await agentExec.llms.getDefaultLLM()({ messages: [{ role: 'user', content: 'hi' }] });

    expect(mockLLMCalls).toHaveLength(1);
    expect(mockLLMCalls[0].provider).toBe('openai');
    expect(mockLLMCalls[0].config.model).toBe('gpt-4.1-mini');
  });

  it('child AgentExecutions resolve the same env default through their own registries', async () => {
    process.env.BITCODE_LLM_PROVIDER = 'google';
    process.env.BITCODE_LLM_MODEL = 'gemini-env-pin';

    const parent = new AgentExecution('agent:parent');
    const child = parent.child('step:try');
    await child.llms.getDefaultLLM()({ messages: [{ role: 'user', content: 'hi' }] });

    expect(mockLLMCalls[mockLLMCalls.length - 1]).toMatchObject({
      provider: 'google',
      config: { model: 'gemini-env-pin' },
    });
  });
});

describe('AgentLLMsRegistry — execution tracking wrapper', () => {
  function stubRegistry(llm: any) {
    return { getLLM: () => llm };
  }

  it('stores the llm-namespace telemetry keys on a llm:<key>:<model> child on success', async () => {
    delete process.env.BITCODE_LLM_CALL_TIMEOUT_MS;
    const execution = new Execution('agent:tracking');
    const registry = new AgentLLMsRegistry(
      execution,
      stubRegistry(async () => ({
        content: 'raw model prose',
        usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
        metadata: { finishReason: 'stop' },
      })),
    );

    const input = {
      messages: [{ role: 'user', content: 'prompt body' }],
      config: { model: 'stub-model' },
    };
    const output = await registry.getDefaultLLM()(input);

    // Provider-agnostic stopReason normalization from finishReason.
    expect(output.metadata.stopReason).toBe('stop');

    const llmExec = findLlmChild(execution, 'llm:default:stub-model');
    expect(llmExec).toBeDefined();
    // The exact key set matters: content-bearing keys (messages/config/
    // response) are NOT in the streaming source-safe allowlist and get
    // withheld by sourceSafeStreamEvent; the rest are safe metadata.
    expect(Array.from(llmExec.getAll('llm').keys()).sort()).toEqual(
      ['config', 'configKey', 'duration', 'messages', 'response', 'startTime', 'status', 'usage'].sort(),
    );
    expect(llmExec.get('llm', 'configKey')).toBe('default');
    expect(llmExec.get('llm', 'response')).toBe('raw model prose');
    expect(llmExec.get('llm', 'usage')).toEqual({ inputTokens: 1, outputTokens: 2, totalTokens: 3 });
    expect(llmExec.get('llm', 'status')).toBe('success');
    expect(typeof llmExec.get('llm', 'duration')).toBe('number');
  });

  it('defaults metadata.stopReason to "unknown" when the provider supplies none', async () => {
    delete process.env.BITCODE_LLM_CALL_TIMEOUT_MS;
    const execution = new Execution('agent:stop-reason');
    const registry = new AgentLLMsRegistry(
      execution,
      stubRegistry(async () => ({ content: 'ok' })),
    );

    const output = await registry.getDefaultLLM()({ messages: [], config: { model: 'stub-model' } });

    expect(output.metadata.stopReason).toBe('unknown');
  });

  it('BITCODE_LLM_CALL_TIMEOUT_MS bounds a hung call: rejects and stores failed status', async () => {
    process.env.BITCODE_LLM_CALL_TIMEOUT_MS = '25';
    const execution = new Execution('agent:timeout');
    const registry = new AgentLLMsRegistry(
      execution,
      stubRegistry(() => new Promise(() => {})), // never resolves
    );

    await expect(
      registry.getDefaultLLM()({ messages: [], config: { model: 'stub-model' } }),
    ).rejects.toThrow('LLM call (stub-model) timed out after 25ms');

    const llmExec = findLlmChild(execution, 'llm:default:stub-model');
    expect(llmExec.get('llm', 'status')).toBe('failed');
    expect(llmExec.get('llm', 'error')).toContain('timed out after 25ms');
    expect(typeof llmExec.get('llm', 'duration')).toBe('number');
    expect(llmExec.get('llm', 'response')).toBeUndefined();
  });

  it('BITCODE_LLM_CALL_TIMEOUT_MS=0 disables the bound entirely', async () => {
    process.env.BITCODE_LLM_CALL_TIMEOUT_MS = '0';
    const execution = new Execution('agent:timeout-disabled');
    const registry = new AgentLLMsRegistry(
      execution,
      stubRegistry(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ content: 'slow but fine' }), 60),
          ),
      ),
    );

    const output = await registry.getDefaultLLM()({ messages: [], config: { model: 'stub-model' } });

    expect(output.content).toBe('slow but fine');
    const llmExec = findLlmChild(execution, 'llm:default:stub-model');
    expect(llmExec.get('llm', 'status')).toBe('success');
  });

  it('a provider failure is recorded and rethrown (clean failure for PTRR retry)', async () => {
    delete process.env.BITCODE_LLM_CALL_TIMEOUT_MS;
    const execution = new Execution('agent:provider-failure');
    const registry = new AgentLLMsRegistry(
      execution,
      stubRegistry(async () => {
        throw new Error('provider unavailable');
      }),
    );

    await expect(
      registry.getDefaultLLM()({ messages: [], config: { model: 'stub-model' } }),
    ).rejects.toThrow('provider unavailable');

    const llmExec = findLlmChild(execution, 'llm:default:stub-model');
    expect(llmExec.get('llm', 'status')).toBe('failed');
    expect(llmExec.get('llm', 'error')).toBe('provider unavailable');
  });
});
