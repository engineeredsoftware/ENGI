import { LLMProvider, LLMConfig, LLMInput, LLMOutput } from '@bitcode/llm-generics';

// Google provider implemented against the Vercel AI SDK when available.
// Falls back to a lightweight mock if the SDK isn't present (e.g. tests).

interface GoogleRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_output_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
}

interface GoogleResponse {
  candidates: Array<{
    content: { parts: Array<{ text?: string }> };
  }>;
  usage?: {
    prompt_tokens?: number;
    candidates_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

export const googleProvider: LLMProvider = {
  name: 'google',

  createLLM(config: LLMConfig) {
    return async (input: LLMInput): Promise<LLMOutput> => {
      const finalConfig = { ...config, ...input.config };
      const modelId = finalConfig.model || 'gemini-2.5-flash';

      // Try to use Vercel AI SDK providers if available in the host app
      try {
        // Dynamic requires so this package doesn't read to depend on AI SDK itself.
        // Resolution will succeed when the host app (e.g. uapi) declares deps.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { generateText } = require('ai');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { google } = require('@ai-sdk/google');

        // Build a flat prompt from messages (system + user + assistant)
        const sys = (input.messages || []).filter(m => m.role === 'system').map(m => m.content).join('\n\n');
        const user = (input.messages || []).filter(m => m.role === 'user').map(m => m.content).join('\n\n');
        const assistant = (input.messages || []).filter(m => m.role === 'assistant').map(m => m.content).join('\n\n');
        const combined = [sys && `(system)\n${sys}`, user, assistant && `(assistant)\n${assistant}`]
          .filter(Boolean)
          .join('\n\n');

        const { text, usage, response } = await generateText({
          model: google(modelId),
          // Prefer AI SDK's system field when available
          system: sys || undefined,
          prompt: sys ? user : combined,
          maxTokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          topP: finalConfig.topP,
          stopSequences: finalConfig.stopSequences,
        });

        // Map usage (provider-dependent; fall back to 0s if missing)
        const inputTokens = (usage && (usage as any).promptTokens) || 0;
        const outputTokens = (usage && (usage as any).completionTokens) || 0;
        const totalTokens = (usage && (usage as any).totalTokens) || (inputTokens + outputTokens);

        const stopReason = (response as any)?.finishReason || (response as any)?.finish_reason || 'unknown';
        return {
          content: String(text ?? ''),
          usage: { inputTokens, outputTokens, totalTokens },
          metadata: { model: modelId, provider: 'google', providerResponse: response, stopReason },
        };
      } catch (err) {
        // Controlled fallback policy: only allow mock in explicit dev/test contexts
        const allowMock = process?.env?.BITCODE_LLM_ALLOW_MOCK === '1' || process?.env?.NODE_ENV === 'test';
        if (!allowMock) {
          const hint = 'Install \"ai\" and \"@ai-sdk/google\" in the host app or set BITCODE_LLM_ALLOW_MOCK=1 to permit mock.';
          const message = `Google LLM provider unavailable (missing AI SDK bindings). ${hint}`;
          const e = err instanceof Error ? err : new Error(String(err));
          (e as any).provider = 'google';
          (e as any).model = modelId;
          throw e.name === 'Error' ? new Error(message) : e;
        }
        // Lightweight mock for tests/dev when explicitly allowed
        const last = input.messages?.[input.messages.length - 1]?.content ?? '';
        const echoed = `Gemini (mock) response to: ${last}`;
        return {
          content: echoed,
          usage: { inputTokens: 80, outputTokens: 40, totalTokens: 120 },
          metadata: { model: modelId, provider: 'google', mocked: true, stopReason: 'unknown' },
        };
      }
    };
  },

  validateConfig(config: LLMConfig): boolean {
    // Keep this permissive; concrete validation can be expanded as needed.
    const validModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash-lite',
    ];
    if (config.model && !validModels.includes(config.model)) return false;
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) return false;
    return true;
  },

  getDefaultConfig(): Partial<LLMConfig> {
    return {
      model: 'gemini-2.5-flash',
      temperature: 0.6,
      maxTokens: 2048,
    };
  },
};
