import { LLMProvider, LLMConfig, LLMInput, LLMOutput } from '@bitcode/llm-generics';

// Minimal type definitions for OpenAI API
interface OpenAIRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  response_format?: { type: 'text' | 'json_object' };
  seed?: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export const openAIProvider: LLMProvider = {
  name: 'openai',
  
  createLLM(config: LLMConfig) {
    return async (input: LLMInput): Promise<LLMOutput> => {
      const finalConfig = { ...config, ...input.config };
      
      const request: OpenAIRequest = {
        model: finalConfig.model || 'gpt-4.1-mini',
        messages: input.messages,
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        top_p: finalConfig.topP,
        frequency_penalty: finalConfig.frequencyPenalty,
        presence_penalty: finalConfig.presencePenalty,
        stop: finalConfig.stopSequences,
        response_format: finalConfig.responseFormat === 'json' 
          ? { type: 'json_object' } 
          : undefined,
        seed: finalConfig.seed
      };

      // Try real OpenAI client first
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const OpenAI = require('openai');
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const sys = (input.messages || []).filter(m => m.role === 'system').map(m => ({ role: 'system', content: m.content }));
        const nonSys = (input.messages || []).filter(m => m.role !== 'system');
        const messages = [...sys, ...nonSys];
        const resp: OpenAIResponse = await client.chat.completions.create({
          model: request.model,
          messages: messages as any,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          top_p: request.top_p,
          frequency_penalty: request.frequency_penalty,
          presence_penalty: request.presence_penalty,
          stop: request.stop,
          response_format: request.response_format,
          seed: request.seed,
        });
        const finish = resp.choices[0]?.finish_reason;
        const stopReason = finish === 'length' ? 'length' : (finish === 'stop' ? 'stop' : (finish || 'unknown'));
        return {
          content: resp.choices[0]?.message?.content || '',
          usage: {
            inputTokens: resp.usage?.prompt_tokens || 0,
            outputTokens: resp.usage?.completion_tokens || 0,
            totalTokens: resp.usage?.total_tokens || 0,
          },
          metadata: { model: resp.model, finishReason: finish, stopReason }
        };
      } catch (err) {
        const allowMock = process?.env?.BITCODE_LLM_ALLOW_MOCK === '1' || process?.env?.NODE_ENV === 'test';
        if (!allowMock) {
          const hint = 'Provide OPENAI_API_KEY and install the OpenAI SDK, or set BITCODE_LLM_ALLOW_MOCK=1 to permit mock.';
          const e = err instanceof Error ? err : new Error(String(err));
          (e as any).provider = 'openai';
          (e as any).model = request.model;
          throw new Error(`${e.message || 'OpenAI provider unavailable'}. ${hint}`);
        }
        // Structured mock for explicitly allowed contexts
        const last = input.messages?.[input.messages.length - 1]?.content ?? '';
        const content = `OpenAI (mock) response to: ${last}`;
        return {
          content,
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
          metadata: { model: request.model, mocked: true }
        };
      }
    };
  },

  validateConfig(config: LLMConfig): boolean {
    const validModels = ['gpt-4.1-mini', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    if (config.model && !validModels.includes(config.model)) {
      return false;
    }
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      return false;
    }
    return true;
  },

  getDefaultConfig(): Partial<LLMConfig> {
    return {
      model: 'gpt-4.1-mini',
      temperature: 0.7,
      maxTokens: 4096
    };
  }
};
