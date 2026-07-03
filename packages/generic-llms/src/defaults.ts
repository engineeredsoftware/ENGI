export type BitcodeLLMEnvironment = Record<string, string | undefined>;

export function resolveDefaultLLMProvider(env: BitcodeLLMEnvironment = process.env): string {
  const configured = normalizeEnvValue(env.BITCODE_LLM_PROVIDER);
  if (configured) return configured.toLowerCase();

  if (normalizeEnvValue(env.OPENAI_API_KEY)) return 'openai';
  if (normalizeEnvValue(env.ANTHROPIC_API_KEY)) return 'anthropic';
  if (
    normalizeEnvValue(env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    normalizeEnvValue(env.GEMINI_API_KEY) ||
    normalizeEnvValue(env.GOOGLE_API_KEY)
  ) {
    return 'google';
  }

  return 'openai';
}

export function resolveDefaultLLMModel(
  provider = resolveDefaultLLMProvider(),
  env: BitcodeLLMEnvironment = process.env
): string {
  const configured = normalizeEnvValue(env.BITCODE_LLM_MODEL);
  if (configured) return configured;

  switch (provider.toLowerCase()) {
    case 'google':
      return 'gemini-2.5-flash';
    case 'anthropic':
      return 'claude-haiku-4-5';
    case 'openai':
    default:
      return 'gpt-4.1-mini';
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
