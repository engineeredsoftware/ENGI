import type { LLMProvider, LLMConfig, LLMInput, LLMOutput } from '@bitcode/llm-generics';

/**
 * xAI / Grok provider for Bitcode llm-generics.
 *
 * Uses the official Vercel AI SDK xAI provider (`@ai-sdk/xai` + `ai`), same
 * pattern as `@bitcode/generic-llms-google`. Auth: XAI_API_KEY (preferred) or
 * GROK_API_KEY. Default model: grok-3-mini (overridable via BITCODE_LLM_MODEL).
 *
 * Calls api.x.ai (not OpenAI). Chat Completions via AI SDK language model
 * interface is enough for Bitcode's message-shaped LLMInput.
 */

const DEFAULT_XAI_MODEL = 'grok-3-mini';

function resolveXaiApiKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = env.XAI_API_KEY || env.GROK_API_KEY;
  return typeof key === 'string' && key.trim() ? key.trim() : undefined;
}

function buildMessages(input: LLMInput): {
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
} {
  const systemParts = (input.messages || [])
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .filter(Boolean);
  const messages = (input.messages || [])
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: String(m.content ?? ''),
    }))
    .filter((m) => m.content.length > 0);

  // generateText requires at least one user/assistant message when system is set.
  if (messages.length === 0) {
    messages.push({ role: 'user', content: '(no user content)' });
  }

  return {
    system: systemParts.length ? systemParts.join('\n\n') : undefined,
    messages,
  };
}

export const xaiProvider: LLMProvider = {
  name: 'xai',

  createLLM(config: LLMConfig) {
    return async (input: LLMInput): Promise<LLMOutput> => {
      const finalConfig = { ...config, ...input.config };
      const modelId = finalConfig.model || process.env.BITCODE_LLM_MODEL || DEFAULT_XAI_MODEL;

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { generateText } = require('ai');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createXai } = require('@ai-sdk/xai');

        const apiKey = resolveXaiApiKey();
        if (!apiKey) {
          throw new Error('XAI_API_KEY is not set');
        }

        const xai = createXai({ apiKey });
        const { system, messages } = buildMessages(input);

        const result = await generateText({
          model: xai(modelId),
          system,
          messages,
          maxTokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          topP: finalConfig.topP,
          frequencyPenalty: finalConfig.frequencyPenalty,
          presencePenalty: finalConfig.presencePenalty,
          stopSequences: finalConfig.stopSequences,
          seed: finalConfig.seed,
        });

        const usage = (result && result.usage) || {};
        const inputTokens =
          Number((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) || 0;
        const outputTokens =
          Number((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0) || 0;
        const totalTokens =
          Number((usage as any).totalTokens ?? inputTokens + outputTokens) ||
          inputTokens + outputTokens;

        const finishReason =
          (result as any)?.finishReason ||
          (result as any)?.response?.finishReason ||
          'unknown';
        const stopReason =
          finishReason === 'length'
            ? 'length'
            : finishReason === 'stop'
              ? 'stop'
              : String(finishReason || 'unknown');

        return {
          content: String(result?.text ?? ''),
          usage: { inputTokens, outputTokens, totalTokens },
          metadata: {
            model: modelId,
            provider: 'xai',
            finishReason,
            stopReason,
            via: '@ai-sdk/xai',
          },
        };
      } catch (err) {
        const allowMock =
          process?.env?.BITCODE_LLM_ALLOW_MOCK === '1' ||
          process?.env?.NODE_ENV === 'test';
        if (!allowMock) {
          const hint =
            'Provide XAI_API_KEY (forwarded into the pipeline sandbox), ensure @ai-sdk/xai and ai resolve in the image, or set BITCODE_LLM_ALLOW_MOCK=1 to permit mock.';
          const e = err instanceof Error ? err : new Error(String(err));
          (e as any).provider = 'xai';
          (e as any).model = modelId;
          throw new Error(`${e.message || 'xAI provider unavailable'}. ${hint}`);
        }
        const last = input.messages?.[input.messages.length - 1]?.content ?? '';
        return {
          content: `xAI Grok (mock) response to: ${last}`,
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
          metadata: { model: modelId, provider: 'xai', mocked: true, via: 'mock' },
        };
      }
    };
  },

  validateConfig(config: LLMConfig): boolean {
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      return false;
    }
    if (config.maxTokens !== undefined && config.maxTokens < 1) {
      return false;
    }
    return true;
  },

  getDefaultConfig(): Partial<LLMConfig> {
    return {
      model: DEFAULT_XAI_MODEL,
      temperature: 0.7,
      maxTokens: 4096,
    };
  },
};
