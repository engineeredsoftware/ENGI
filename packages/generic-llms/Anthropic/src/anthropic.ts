import { LLMProvider, LLMConfig, LLMInput, LLMOutput } from '@bitcode/llm-generics';

interface AnthropicRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
}

interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
  stop_reason: string;
}

export const anthropicProvider: LLMProvider = {
  name: 'anthropic',
  
  createLLM(config: LLMConfig) {
    return async (input: LLMInput): Promise<LLMOutput> => {
      const finalConfig = { ...config, ...input.config };
      
      const request: AnthropicRequest = {
        model: finalConfig.model || 'claude-haiku-4-5',
        messages: input.messages,
        max_tokens: finalConfig.maxTokens || 4096,
        temperature: finalConfig.temperature,
        top_p: finalConfig.topP,
        stop_sequences: finalConfig.stopSequences
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const sys = (input.messages || []).filter(m => m.role === 'system').map(m => m.content).join('\n\n');
        const userMerged = (input.messages || []).filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
        const resp: any = await client.messages.create({
          model: request.model,
          system: sys || undefined,
          messages: [{ role: 'user', content: userMerged }],
          max_tokens: request.max_tokens,
          temperature: request.temperature,
          top_p: request.top_p,
          stop_sequences: request.stop_sequences
        });
        const text = Array.isArray(resp.content) && resp.content[0]?.text ? resp.content[0].text : '';
        const usage = resp.usage || {};
        return {
          content: String(text),
          usage: {
            inputTokens: usage.input_tokens || 0,
            outputTokens: usage.output_tokens || 0,
            totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0)
          },
          metadata: { model: resp.model, stopReason: resp.stop_reason }
        };
      } catch (err) {
        const allowMock = process?.env?.BITCODE_LLM_ALLOW_MOCK === '1' || process?.env?.NODE_ENV === 'test';
        if (!allowMock) {
          const hint = 'Provide ANTHROPIC_API_KEY and install @anthropic-ai/sdk, or set BITCODE_LLM_ALLOW_MOCK=1 to permit mock.';
          const e = err instanceof Error ? err : new Error(String(err));
          (e as any).provider = 'anthropic';
          (e as any).model = request.model;
          throw new Error(`${e.message || 'Anthropic provider unavailable'}. ${hint}`);
        }
        const last = input.messages?.[input.messages.length - 1]?.content ?? '';
        const mockResponse: AnthropicResponse = {
          content: [{ text: `Claude (mock) response to: ${last}` }],
          usage: { input_tokens: 80, output_tokens: 40 },
          model: request.model,
          stop_reason: 'end_turn'
        };
        return {
          content: mockResponse.content[0].text,
          usage: {
            inputTokens: mockResponse.usage.input_tokens,
            outputTokens: mockResponse.usage.output_tokens,
            totalTokens: mockResponse.usage.input_tokens + mockResponse.usage.output_tokens
          },
          metadata: { model: mockResponse.model, stopReason: mockResponse.stop_reason, mocked: true }
        };
      }
    };
  },

  validateConfig(config: LLMConfig): boolean {
    // Model names rotate with releases; validate the family shape rather
    // than pinning a stale allowlist.
    if (config.model && !config.model.toLowerCase().startsWith('claude')) {
      return false;
    }
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 1)) {
      return false;
    }
    return true;
  },

  getDefaultConfig(): Partial<LLMConfig> {
    return {
      model: 'claude-haiku-4-5',
      temperature: 0.7,
      maxTokens: 4096
    };
  }
};
