import { LLMProvider, LLMConfig, LLMInput, LLMOutput } from '@bitcode/llm-generics';

/**
 * xAI / Grok provider — OpenAI-compatible client against https://api.x.ai/v1.
 *
 * Auth: XAI_API_KEY (preferred) or GROK_API_KEY.
 * Default model: grok-4.5 (overridable via BITCODE_LLM_MODEL).
 *
 * Uses chat.completions (OpenAI-compatible surface on xAI). The Responses API
 * is also available on the same base URL; chat is sufficient for Bitcode's
 * message-shaped LLMInput.
 */

const XAI_BASE_URL = 'https://api.x.ai/v1';
const DEFAULT_XAI_MODEL = 'grok-4.5';

function resolveXaiApiKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = env.XAI_API_KEY || env.GROK_API_KEY;
  return typeof key === 'string' && key.trim() ? key.trim() : undefined;
}

export const xaiProvider: LLMProvider = {
  name: 'xai',

  createLLM(config: LLMConfig) {
    return async (input: LLMInput): Promise<LLMOutput> => {
      const finalConfig = { ...config, ...input.config };
      const model = finalConfig.model || DEFAULT_XAI_MODEL;

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const OpenAI = require('openai');
        const apiKey = resolveXaiApiKey();
        if (!apiKey) {
          throw new Error('XAI_API_KEY is not set');
        }
        const client = new OpenAI({
          apiKey,
          baseURL: XAI_BASE_URL,
        });
        const sys = (input.messages || [])
          .filter((m) => m.role === 'system')
          .map((m) => ({ role: 'system' as const, content: m.content }));
        const nonSys = (input.messages || [])
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.content,
          }));
        const messages = [...sys, ...nonSys];
        const resp = await client.chat.completions.create({
          model,
          messages: messages as any,
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.maxTokens,
          top_p: finalConfig.topP,
          frequency_penalty: finalConfig.frequencyPenalty,
          presence_penalty: finalConfig.presencePenalty,
          stop: finalConfig.stopSequences,
          response_format:
            finalConfig.responseFormat === 'json'
              ? { type: 'json_object' }
              : undefined,
          seed: finalConfig.seed,
        });
        const choice = resp.choices?.[0];
        const finish = choice?.finish_reason;
        const stopReason =
          finish === 'length'
            ? 'length'
            : finish === 'stop'
              ? 'stop'
              : finish || 'unknown';
        return {
          content: choice?.message?.content || '',
          usage: {
            inputTokens: resp.usage?.prompt_tokens || 0,
            outputTokens: resp.usage?.completion_tokens || 0,
            totalTokens: resp.usage?.total_tokens || 0,
          },
          metadata: {
            model: resp.model || model,
            provider: 'xai',
            finishReason: finish,
            stopReason,
          },
        };
      } catch (err) {
        const allowMock =
          process?.env?.BITCODE_LLM_ALLOW_MOCK === '1' ||
          process?.env?.NODE_ENV === 'test';
        if (!allowMock) {
          const hint =
            'Provide XAI_API_KEY and ensure the OpenAI SDK can reach https://api.x.ai/v1, or set BITCODE_LLM_ALLOW_MOCK=1 to permit mock.';
          const e = err instanceof Error ? err : new Error(String(err));
          (e as any).provider = 'xai';
          (e as any).model = model;
          throw new Error(`${e.message || 'xAI provider unavailable'}. ${hint}`);
        }
        const last = input.messages?.[input.messages.length - 1]?.content ?? '';
        return {
          content: `xAI Grok (mock) response to: ${last}`,
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
          metadata: { model, provider: 'xai', mocked: true },
        };
      }
    };
  },
};
