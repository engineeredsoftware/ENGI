/**
 * Centralized, shared provider+model catalog and pricing.
 *
 * Single source of truth for:
 * - Supported providers/models and metadata
 * - USD pricing per 1M tokens (input/output) and token limits
 * - Mapping utilities between friendly IDs and API model IDs
 */

// Provider identifiers used across the app
export type ProviderId = 'openai' | 'google' | 'anthropic';

export interface ModelSpec {
  // Canonical friendly name (Provider-Model-Variation_Version)
  id: string;
  // Provider-specific API model identifier used when calling the provider
  apiId: string;
  // Pricing per 1M tokens (USD)
  inputPriceUSDPerMTok?: number;
  outputPriceUSDPerMTok?: number;
  // Limits (tokens)
  inputLimit?: number;
  outputLimit?: number;
  // Notes/metadata for display
  notes?: string;
}

export interface ProviderModels {
  provider: ProviderId;
  models: ModelSpec[];
}

// Supported providers and models with pricing and token limits
export const SUPPORTED_LLM_MODELS: ProviderModels[] = [
  {
    provider: 'openai',
    models: [
      {
        id: 'OpenAI-GPT-5-Standard_2025-08',
        apiId: 'gpt-5',
        inputPriceUSDPerMTok: 1.25,
        outputPriceUSDPerMTok: 10.0,
        inputLimit: 272_000,
        outputLimit: 128_000,
        notes: 'Total context 400k; “max output tokens” 128k.',
      },
      {
        id: 'OpenAI-GPT-5-Mini_2025-08',
        apiId: 'gpt-5-mini',
        inputPriceUSDPerMTok: 0.25,
        outputPriceUSDPerMTok: 2.0,
        inputLimit: 272_000,
        outputLimit: 128_000,
        notes: 'Same family context behavior as above.',
      },
    ],
  },
  {
    provider: 'google',
    models: [
      {
        id: 'Google-Gemini-Pro_2.5',
        apiId: 'gemini-2.5-pro',
        inputPriceUSDPerMTok: 1.25, // lower tier †
        outputPriceUSDPerMTok: 10.0, // lower tier †
        inputLimit: 1_048_576,
        outputLimit: 65_535,
        notes: 'Two price tiers depending on prompt size; 1M input window.',
      },
      {
        id: 'Google-Gemini-Flash_2.5',
        apiId: 'gemini-2.5-flash',
        inputPriceUSDPerMTok: 0.35, // lower tier †
        outputPriceUSDPerMTok: 1.40, // lower tier †
        inputLimit: 1_048_576,
        outputLimit: 65_535,
        notes: 'Fast/cheap 2.5 variant; long context supported.',
      },
      {
        id: 'Google-Gemini-Flash-Lite_2.5',
        apiId: 'gemini-2.5-flash-lite',
        inputPriceUSDPerMTok: 0.05, // lower tier †
        outputPriceUSDPerMTok: 0.20, // lower tier †
        inputLimit: 1_048_576,
        notes: '1M input limit; max output not explicitly listed.',
      },
    ],
  },
  {
    provider: 'anthropic',
    models: [
      {
        id: 'Anthropic-Claude-Opus_4.1',
        apiId: 'opus-4.1',
        inputPriceUSDPerMTok: 15.0,
        outputPriceUSDPerMTok: 75.0,
        inputLimit: 200_000,
        outputLimit: 32_000,
        notes: 'Newest Opus with 200k context.',
      },
      {
        id: 'Anthropic-Claude-Sonnet_4',
        apiId: 'sonnet-4',
        inputPriceUSDPerMTok: 3.0, // ≤200k ‡
        outputPriceUSDPerMTok: 15.0, // ≤200k ‡
        inputLimit: 1_000_000,
        outputLimit: 64_000,
        notes: '1M context in public beta; tiered pricing >200k tokens.',
      },
    ],
  },
];

// Helpers
export const PROVIDERS: ProviderId[] = SUPPORTED_LLM_MODELS.map((p) => p.provider);

export function getModelsForProvider(provider: ProviderId): ModelSpec[] {
  return SUPPORTED_LLM_MODELS.find((p) => p.provider === provider)?.models ?? [];
}

export function getModelByApiId(provider: ProviderId, apiId: string): ModelSpec | undefined {
  return getModelsForProvider(provider).find((m) => m.apiId === apiId);
}

// Mapping utilities between friendly IDs and API IDs
export function getApiIdFromFriendlyId(friendlyId: string): { provider: ProviderId; apiId: string } | undefined {
  for (const p of SUPPORTED_LLM_MODELS) {
    const match = p.models.find((m) => m.id === friendlyId);
    if (match) return { provider: p.provider, apiId: match.apiId };
  }
  return undefined;
}

export function getFriendlyIdFromApiId(provider: ProviderId, apiId: string): string | undefined {
  return getModelByApiId(provider, apiId)?.id;
}

// USD pricing lookup helpers for BTC fee and model-cost estimation
export function getUsdPricingForApiModel(apiModel: string): { input: number; output: number } | undefined {
  for (const p of SUPPORTED_LLM_MODELS) {
    const found = p.models.find((m) => m.apiId === apiModel);
    if (found && found.inputPriceUSDPerMTok !== undefined && found.outputPriceUSDPerMTok !== undefined) {
      return { input: found.inputPriceUSDPerMTok, output: found.outputPriceUSDPerMTok };
    }
  }
  return undefined;
}

// Defaults for app usage (override via env in apps as needed)
export const DEFAULT_PROVIDER: ProviderId = (process.env.BITCODE_LLM_PROVIDER as ProviderId) || 'google';
export const DEFAULT_MODEL_API: string = process.env.BITCODE_LLM_MODEL || 'gemini-2.5-flash';
