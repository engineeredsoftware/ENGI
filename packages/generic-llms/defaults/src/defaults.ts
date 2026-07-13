export type BitcodeLLMEnvironment = Record<string, string | undefined>;

export function resolveDefaultLLMProvider(env: BitcodeLLMEnvironment = process.env): string {
  const configured = normalizeEnvValue(env.BITCODE_LLM_PROVIDER);
  if (configured) return configured.toLowerCase();

  // Product default: Anthropic Claude when its key is present.
  if (normalizeEnvValue(env.ANTHROPIC_API_KEY)) return 'anthropic';
  if (normalizeEnvValue(env.XAI_API_KEY) || normalizeEnvValue(env.GROK_API_KEY)) {
    return 'xai';
  }
  if (normalizeEnvValue(env.OPENAI_API_KEY)) return 'openai';
  if (
    normalizeEnvValue(env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    normalizeEnvValue(env.GEMINI_API_KEY) ||
    normalizeEnvValue(env.GOOGLE_API_KEY)
  ) {
    return 'google';
  }

  // Ultimate default without keys / overrides: Anthropic Claude.
  return 'anthropic';
}

export function resolveDefaultLLMModel(
  provider = resolveDefaultLLMProvider(),
  env: BitcodeLLMEnvironment = process.env
): string {
  const configured = normalizeEnvValue(env.BITCODE_LLM_MODEL);
  if (configured) return configured;

  switch (provider.toLowerCase()) {
    case 'xai':
    case 'grok':
      return 'grok-build-0.1';
    case 'google':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4.1-mini';
    case 'anthropic':
    default:
      // Product default: Claude Haiku 4.5 (overridable via BITCODE_LLM_MODEL).
      return 'claude-haiku-4-5';
  }
}

export function resolveDefaultLLMConfig(env: BitcodeLLMEnvironment = process.env): {
  provider: string;
  model: string;
} {
  const provider = resolveDefaultLLMProvider(env);
  return {
    provider,
    model: resolveDefaultLLMModel(provider, env),
  };
}

function normalizeEnvValue(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
