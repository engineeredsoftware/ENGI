
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { log } from '@bitcode/logger';
import { trace } from '@bitcode/observability';

function instrumentModel(provider: string, modelName: string, base: any) {
  // Avoid double instrumentation
  if (base.__instrumented) return base;
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;
      // Wrap function so that its execution is traced once.
      return async function instrumentedModelMethod(this: unknown, ...args: any[]) {
        const spanName = `llm:${provider}:${modelName}:${String(prop)}`;
        const activeThis = this ?? target;
        return trace(spanName, () => orig.apply(activeThis, args));
      };
    },
  };
  const proxy = new Proxy(base, handler);
  proxy.__instrumented = true;
  return proxy;
}

export interface ModelConfig {
  provider: 'anthropic' | 'google' | 'openai' | 'mistral' | 'meta' | 'cohere';
  model: string;
  contextWindow: number;
  
  // Separate token costs
  inputTokenCost: number;      // Cost per input token
  outputTokenCost: number;     // Cost per output token
  
  // Separate token limits
  maxInputTokens?: number;     // Optional input limit (usually = contextWindow)
  maxOutputTokens: number;     // Output generation limit
}

// MEGA TOGGLE: Set to 'anthropic', 'google', or 'openai' to force all requests to use that provider
// Null => use MODEL_CONFIGS[0]
export const FORCE_MODEL_PROVIDER: 'anthropic' | 'google' | 'openai' | null = null;

export const MODEL_CONFIGS: ModelConfig[] = [
  // OpenAI Models
  {
    provider: 'openai',
    model: 'o3-mini',                // Fast & cheap
    contextWindow: 128000,
    inputTokenCost: 0.000000015,     // $0.015 per 1M input tokens
    outputTokenCost: 0.00000006,     // $0.06 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo',          // Fast & cheap
    contextWindow: 4096,
    inputTokenCost: 0.0000015,       // $1.50 per 1M input tokens
    outputTokenCost: 0.000002,       // $2.00 per 1M output tokens
    maxInputTokens: 4096,
    maxOutputTokens: 4096
  },
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo-16k',      // Middle-ground
    contextWindow: 16384,
    inputTokenCost: 0.000003,        // $3.00 per 1M input tokens
    outputTokenCost: 0.000004,       // $4.00 per 1M output tokens
    maxInputTokens: 16384,
    maxOutputTokens: 4096
  },
  {
    provider: 'openai',
    model: 'gpt-4-turbo-128k',       // Best for retrieval (needle-in-haystack)
    contextWindow: 128000,
    inputTokenCost: 0.00001,         // $10.00 per 1M input tokens
    outputTokenCost: 0.00003,        // $30.00 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'openai',
    model: 'gpt-4',                  // Slow & expensive
    contextWindow: 8192,
    inputTokenCost: 0.00003,         // $30.00 per 1M input tokens
    outputTokenCost: 0.00006,        // $60.00 per 1M output tokens
    maxInputTokens: 8192,
    maxOutputTokens: 4096
  },
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo-instruct', // Best for structured output
    contextWindow: 8000,
    inputTokenCost: 0.00002,         // $20.00 per 1M input tokens
    outputTokenCost: 0.00002,        // $20.00 per 1M output tokens
    maxInputTokens: 8000,
    maxOutputTokens: 4096
  },

  // Anthropic Models
  {
    provider: 'anthropic',
    model: 'claude-3-haiku',         // Fast & cheap
    contextWindow: 100000,
    inputTokenCost: 0.0000008,       // $0.80 per 1M input tokens
    outputTokenCost: 0.000004,       // $4.00 per 1M output tokens
    maxInputTokens: 100000,
    maxOutputTokens: 4096
  },
  {
    provider: 'anthropic',
    model: 'claude-3-sonnet',        // Middle-ground
    contextWindow: 200000,
    inputTokenCost: 0.000003,        // $3.00 per 1M input tokens
    outputTokenCost: 0.000015,       // $15.00 per 1M output tokens
    maxInputTokens: 200000,
    maxOutputTokens: 4096
  },
  {
    provider: 'anthropic',
    model: 'claude-3-opus',          // Slow & expensive
    contextWindow: 200000,
    inputTokenCost: 0.000015,        // $15.00 per 1M input tokens
    outputTokenCost: 0.000075,       // $75.00 per 1M output tokens
    maxInputTokens: 200000,
    maxOutputTokens: 4096
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',      // Best multimodal
    contextWindow: 200000,
    inputTokenCost: 0.000003,        // $3.00 per 1M input tokens
    outputTokenCost: 0.000015,       // $15.00 per 1M output tokens
    maxInputTokens: 200000,
    maxOutputTokens: 8192
  },
  {
    provider: 'anthropic',
    model: 'claude-2',               // Best for retrieval
    contextWindow: 100000,
    inputTokenCost: 0.000008,        // $8.00 per 1M input tokens
    outputTokenCost: 0.000024,       // $24.00 per 1M output tokens
    maxInputTokens: 100000,
    maxOutputTokens: 4096
  },
  {
    provider: 'anthropic',
    model: 'claude-instant-1.2',     // Best for structured output
    contextWindow: 100000,
    inputTokenCost: 0.0000008,       // $0.80 per 1M input tokens
    outputTokenCost: 0.000024,       // $2.40 per 1M output tokens
    maxInputTokens: 100000,
    maxOutputTokens: 4096
  },

  // Google Models
  {
    provider: 'google',
    model: 'gemini-2.0-flash-lite',  // Fast & cheap
    contextWindow: 1000000,
    inputTokenCost: 0.0000001,       // $0.10 per 1M input tokens
    outputTokenCost: 0.0000004,      // $0.40 per 1M output tokens
    maxInputTokens: 1000000,
    maxOutputTokens: 8192
  },
  {
    provider: 'google',
    model: 'gemini-2.0-flash',       // Middle-ground
    contextWindow: 1048576,
    inputTokenCost: 0.0000001,       // $0.10 per 1M input tokens
    outputTokenCost: 0.0000004,      // $0.40 per 1M output tokens
    maxInputTokens: 1048576,
    maxOutputTokens: 8192
  },
  {
    provider: 'google',
    model: 'gemini-2.5-pro',         // Slow & expensive
    contextWindow: 200000,
    inputTokenCost: 0.00000125,      // $1.25 per 1M input tokens
    outputTokenCost: 0.00001,        // $10.00 per 1M output tokens
    maxInputTokens: 200000,
    maxOutputTokens: 8192
  },
  {
    provider: 'google',
    model: 'gemini-2.5-flash',       // Best multimodal & Best for retrieval
    contextWindow: 1000000,
    inputTokenCost: 0.0000003,       // $0.30 per 1M input tokens
    outputTokenCost: 0.0000025,      // $2.50 per 1M output tokens
    maxInputTokens: 1000000,
    maxOutputTokens: 8192
  },
  {
    provider: 'google',
    model: 'palm-2-codechat',        // Best for structured output
    contextWindow: 16000,
    inputTokenCost: 0.00000005,      // $0.05 per 1M input tokens
    outputTokenCost: 0.0000002,      // $0.20 per 1M output tokens
    maxInputTokens: 16000,
    maxOutputTokens: 8192
  },
  {
    provider: 'google',
    model: 'palm-2-chat-bison',      // Retired
    contextWindow: 4000,
    inputTokenCost: 0.000001,        // $1.00 per 1M input tokens
    outputTokenCost: 0.000001,       // $1.00 per 1M output tokens
    maxInputTokens: 4000,
    maxOutputTokens: 1024
  },

  // Mistral Models
  {
    provider: 'mistral',
    model: 'mistral-7b-instruct',    // Fast & cheap
    contextWindow: 32768,
    inputTokenCost: 0.0000002,       // $0.20 per 1M input tokens
    outputTokenCost: 0.0000002,      // $0.20 per 1M output tokens
    maxInputTokens: 32768,
    maxOutputTokens: 8192
  },
  {
    provider: 'mistral',
    model: 'mixtral-8x7b',           // Middle-ground
    contextWindow: 32768,
    inputTokenCost: 0.0000007,       // $0.70 per 1M input tokens
    outputTokenCost: 0.0000007,      // $0.70 per 1M output tokens
    maxInputTokens: 32768,
    maxOutputTokens: 8192
  },
  {
    provider: 'mistral',
    model: 'mistral-large',          // Slow & expensive
    contextWindow: 32768,
    inputTokenCost: 0.000008,        // $8.00 per 1M input tokens
    outputTokenCost: 0.000024,       // $24.00 per 1M output tokens
    maxInputTokens: 32768,
    maxOutputTokens: 8192
  },
  {
    provider: 'mistral',
    model: 'pixtral-12b',            // Best multimodal
    contextWindow: 128000,
    inputTokenCost: 0.000000015,     // $0.015 per 1M input tokens
    outputTokenCost: 0.000000015,    // $0.015 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 8192
  },
  {
    provider: 'mistral',
    model: 'mistral-7b-32k',         // Best for retrieval
    contextWindow: 32768,
    inputTokenCost: 0.0000002,       // $0.20 per 1M input tokens
    outputTokenCost: 0.0000002,      // $0.20 per 1M output tokens
    maxInputTokens: 32768,
    maxOutputTokens: 8192
  },
  {
    provider: 'mistral',
    model: 'codestral-22b',          // Best for structured output
    contextWindow: 32768,
    inputTokenCost: 0.000001,        // $1.00 per 1M input tokens
    outputTokenCost: 0.000003,       // $3.00 per 1M output tokens
    maxInputTokens: 32768,
    maxOutputTokens: 8192
  },

  // Meta Models (Self-hosted, $0 API costs)
  {
    provider: 'meta',
    model: 'llama-2-7b-chat',        // Fast & cheap
    contextWindow: 4096,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 4096,
    maxOutputTokens: 4096
  },
  {
    provider: 'meta',
    model: 'llama-2-13b-chat',       // Middle-ground
    contextWindow: 4096,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 4096,
    maxOutputTokens: 4096
  },
  {
    provider: 'meta',
    model: 'llama-2-70b-chat',       // Slow & expensive (compute-wise)
    contextWindow: 4096,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 4096,
    maxOutputTokens: 4096
  },
  {
    provider: 'meta',
    model: 'llama-2-70b-chat',       // Best multimodal (same as above for now)
    contextWindow: 4096,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 4096,
    maxOutputTokens: 4096
  },
  {
    provider: 'meta',
    model: 'code-llama-34b',         // Best for retrieval & structured output
    contextWindow: 100000,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 100000,
    maxOutputTokens: 8192
  },
  {
    provider: 'meta',
    model: 'code-llama-13b',         // Alternative structured output
    contextWindow: 16000,
    inputTokenCost: 0,               // Open source - self hosted
    outputTokenCost: 0,              // Open source - self hosted
    maxInputTokens: 16000,
    maxOutputTokens: 8192
  },

  // Cohere Models
  {
    provider: 'cohere',
    model: 'command-r7b',            // Fast & cheap
    contextWindow: 128000,
    inputTokenCost: 0.0000000375,    // $0.0375 per 1M input tokens
    outputTokenCost: 0.00000015,     // $0.15 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'cohere',
    model: 'command-r',              // Middle-ground
    contextWindow: 128000,
    inputTokenCost: 0.00000015,      // $0.15 per 1M input tokens
    outputTokenCost: 0.0000006,      // $0.60 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'cohere',
    model: 'command-r-plus',         // Slow & expensive
    contextWindow: 128000,
    inputTokenCost: 0.0000025,       // $2.50 per 1M input tokens
    outputTokenCost: 0.00001,        // $10.00 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'cohere',
    model: 'command-a',              // Best multimodal
    contextWindow: 100000,
    inputTokenCost: 0.0000025,       // $2.50 per 1M input tokens
    outputTokenCost: 0.00001,        // $10.00 per 1M output tokens
    maxInputTokens: 100000,
    maxOutputTokens: 4096
  },
  {
    provider: 'cohere',
    model: 'command-r',              // Best for retrieval (same as middle-ground)
    contextWindow: 128000,
    inputTokenCost: 0.00000015,      // $0.15 per 1M input tokens
    outputTokenCost: 0.0000006,      // $0.60 per 1M output tokens
    maxInputTokens: 128000,
    maxOutputTokens: 4096
  },
  {
    provider: 'cohere',
    model: 'command-light',          // Best for structured output (retired)
    contextWindow: 4000,
    inputTokenCost: 0.0000003,       // $0.30 per 1M input tokens
    outputTokenCost: 0.0000006,      // $0.60 per 1M output tokens
    maxInputTokens: 4000,
    maxOutputTokens: 4096
  }
];

// Default model configuration
export const DEFAULT_MODEL_CONFIG: ModelConfig = MODEL_CONFIGS[0];

// Current active model configuration
export let modelConfig = DEFAULT_MODEL_CONFIG;

// Helper function to get the forced model config or fallback to default
export function getModelConfig(currentConfig: ModelConfig): ModelConfig {
  if (FORCE_MODEL_PROVIDER) {
    const forcedConfig = MODEL_CONFIGS.find(config => config.provider === FORCE_MODEL_PROVIDER);
    if (forcedConfig) {
      //log('Using forced model provider', 'info', {
      //provider: FORCE_MODEL_PROVIDER,
      //originalProvider: currentConfig.provider
      //});
      return forcedConfig;
    }
    // If force provider specified but config not found, log warning
    log('Forced provider config not found', 'warn', {
      forcedProvider: FORCE_MODEL_PROVIDER,
      availableProviders: MODEL_CONFIGS.map(c => c.provider)
    });
  }
  return currentConfig;
}

// Helper to get model instance based on config
export function getModelInstance(config: ModelConfig = modelConfig) {
  // Always check FORCE_MODEL_PROVIDER first
  if (FORCE_MODEL_PROVIDER) {
    const forcedConfig = MODEL_CONFIGS.find(c => c.provider === FORCE_MODEL_PROVIDER);
    if (forcedConfig) {
      switch (FORCE_MODEL_PROVIDER) {
        case 'anthropic':
          return instrumentModel('anthropic', forcedConfig.model, anthropic(forcedConfig.model));
        case 'google':
          return instrumentModel('google', forcedConfig.model, google(forcedConfig.model));
        case 'openai':
          return instrumentModel('openai', forcedConfig.model, openai(forcedConfig.model));
      }
    }
  }

  // Fallback to provided config if no force or forced config not found
  const resolvedConfig = getModelConfig(config);
  switch (resolvedConfig.provider) {
    case 'anthropic':
      return instrumentModel('anthropic', resolvedConfig.model, anthropic(resolvedConfig.model));
    case 'google':
      return instrumentModel('google', resolvedConfig.model, google(resolvedConfig.model));
    case 'openai':
      return instrumentModel('openai', resolvedConfig.model, openai(resolvedConfig.model));
    default:
      throw new Error(`Unknown model provider: ${resolvedConfig.provider}`);
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export * from './pricing';
