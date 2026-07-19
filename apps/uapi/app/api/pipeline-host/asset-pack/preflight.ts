export type PipelineHostPreflightBody = {
  repositoryFullName?: string;
  sourceBranch?: string;
  sourceCommit?: string;
  readId?: string;
  depositId?: string;
};

type PipelineHostRuntimeEnv = Record<string, string | undefined>;

const STAGING_TESTNET_SUPABASE_PROJECT_REF = 'tkpyosihuouusyaxtbau';
const STAGING_TESTNET_SUPABASE_REST_HOST = `${STAGING_TESTNET_SUPABASE_PROJECT_REF}.supabase.co`;

const SUPABASE_ADMIN_CREDENTIAL_KEYS = [
  'SUPABASE_SECRET_KEY',
  'SUPABASE_ADMIN_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function isProductionDeployment(env: PipelineHostRuntimeEnv = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

export function isDeployedRuntime(env: PipelineHostRuntimeEnv = process.env): boolean {
  return env.VERCEL === '1' || env.NODE_ENV === 'production';
}

export function isEnabled(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

export function isPipelineHostRealInferenceRequired(env: PipelineHostRuntimeEnv = process.env): boolean {
  return (
    isDeployedRuntime(env) ||
    isEnabled(env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE)
  );
}

export function isUsableSupabaseUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname;
    return Boolean(host && host !== 'your-project.supabase.co' && !host.includes('<'));
  } catch {
    return false;
  }
}

export function readSupabaseHost(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const host = new URL(value).hostname;
    return host || null;
  } catch {
    return null;
  }
}

export function normalizeSupabaseHost(host: string | null): string | null {
  if (!host) return null;
  return host.startsWith('db.') ? host.slice(3) : host;
}

export function isUsableSecretValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 16 && !value.includes('<');
}

function decodeJwtPayload(value: string | undefined): Record<string, unknown> | null {
  if (!value) return null;
  const [, payload] = value.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

const SUPABASE_SECRET_KEY_PREFIX = ['sb', 'secret', ''].join('_');

function isSupabaseSecretKey(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().startsWith(SUPABASE_SECRET_KEY_PREFIX);
}

export function isSupabaseAdminCredential(value: string | undefined): boolean {
  if (!isUsableSecretValue(value)) return false;
  if (isSupabaseSecretKey(value)) return true;
  const payload = decodeJwtPayload(value);
  return payload?.role === 'service_role';
}

export function listSupabaseAdminCredentials(
  env: PipelineHostRuntimeEnv = process.env,
): Array<{ key: (typeof SUPABASE_ADMIN_CREDENTIAL_KEYS)[number]; value: string }> {
  const seen = new Set<string>();
  const credentials: Array<{ key: (typeof SUPABASE_ADMIN_CREDENTIAL_KEYS)[number]; value: string }> = [];
  for (const key of SUPABASE_ADMIN_CREDENTIAL_KEYS) {
    const value = env[key];
    if (typeof value !== 'string' || !isSupabaseAdminCredential(value) || seen.has(value)) continue;
    seen.add(value);
    credentials.push({ key, value });
  }
  return credentials;
}

export function selectSupabaseAdminCredential(
  env: PipelineHostRuntimeEnv = process.env,
): string | undefined {
  return listSupabaseAdminCredentials(env)[0]?.value;
}

export function readRealInferenceProfile(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}

export function assertDatabaseStreamingEnvironment(
  env: Record<string, string>,
  hostEnv: PipelineHostRuntimeEnv = process.env,
): void {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = selectSupabaseAdminCredential(env);
  if (!isUsableSupabaseUrl(url) || !key) {
    throw new Error(
      'Pipeline host database streaming requires a non-placeholder Supabase URL and admin-capable Supabase key.'
    );
  }

  const restHost = normalizeSupabaseHost(readSupabaseHost(url));
  const dbHost = normalizeSupabaseHost(readSupabaseHost(hostEnv.SUPABASE_DB_URL || hostEnv.DATABASE_URL));
  if (restHost && dbHost && restHost !== dbHost) {
    throw new Error(
      `Pipeline host Supabase REST host must match DB readback host: ${restHost} != ${dbHost}.`
    );
  }
}

export function hasAnyModelProviderCredential(env: Record<string, string>): boolean {
  return Boolean(
    env.XAI_API_KEY ||
      env.GROK_API_KEY ||
      env.OPENAI_API_KEY ||
      env.ANTHROPIC_API_KEY ||
      env.GOOGLE_GENERATIVE_AI_API_KEY ||
      env.GEMINI_API_KEY ||
      env.GOOGLE_API_KEY,
  );
}

export function assertRealInferenceEnvironment(env: Record<string, string>): void {
  if (!isPipelineHostRealInferenceRequired(env)) return;
  if (!isEnabled(env.BITCODE_ASSET_PACK_REAL_INFERENCE)) {
    throw new Error(
      'Staging pipeline host requires BITCODE_ASSET_PACK_REAL_INFERENCE=1 so Read/Fit QA cannot run deterministic bring-up branches.'
    );
  }
  if (!hasAnyModelProviderCredential(env)) {
    throw new Error(
      'Staging pipeline host requires an LLM credential for real AssetPack PTRR inference (XAI_API_KEY preferred; or OPENAI_API_KEY / ANTHROPIC_API_KEY / Google).'
    );
  }
  if (readRealInferenceProfile(env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE) !== 'bounded') {
    throw new Error(
      'The current product host route requires BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded. Full profile runs are scoped to the later async sandbox completion gate where the sandbox pushes finished state to a server-side stream handler.'
    );
  }
  const budgetMs = Number(env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || 240000);
  if (!Number.isFinite(budgetMs) || budgetMs <= 0) {
    throw new Error('BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS must be a positive millisecond budget.');
  }
  // Deposit/pipeline-host routes export maxDuration=800s. Cap host budget so
  // artifact collection + sandbox teardown still fit after the in-box stop
  // (run 8ecbd11a: 600s killed Validation ReadyToFinish with ~200s of wait left).
  if (budgetMs > 720000) {
    throw new Error(
      'BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS must be <= 720000 when real-inference route strictness is required so the caller can still collect artifacts within maxDuration=800s.'
    );
  }
}

export function normalizeModelEnvironment(env: Record<string, string>): void {
  const provider = env.BITCODE_LLM_PROVIDER?.trim().toLowerCase();
  if (provider && !hasModelProviderCredential(provider, env)) {
    delete env.BITCODE_LLM_PROVIDER;
    delete env.BITCODE_LLM_MODEL;
  }

  // Prefer xAI when its key is present (Bitcode deploy default), then Anthropic, then OpenAI.
  if (!env.BITCODE_LLM_PROVIDER && (env.XAI_API_KEY || env.GROK_API_KEY)) {
    env.BITCODE_LLM_PROVIDER = 'xai';
    if (!env.BITCODE_LLM_MODEL) {
      env.BITCODE_LLM_MODEL = 'grok-3-mini';
    }
  } else if (!env.BITCODE_LLM_PROVIDER && env.ANTHROPIC_API_KEY) {
    env.BITCODE_LLM_PROVIDER = 'anthropic';
  } else if (!env.BITCODE_LLM_PROVIDER && env.OPENAI_API_KEY) {
    env.BITCODE_LLM_PROVIDER = 'openai';
  }
}

function hasModelProviderCredential(provider: string, env: Record<string, string>): boolean {
  switch (provider) {
    case 'openai':
      return Boolean(env.OPENAI_API_KEY);
    case 'anthropic':
      return Boolean(env.ANTHROPIC_API_KEY);
    case 'xai':
    case 'grok':
      return Boolean(env.XAI_API_KEY || env.GROK_API_KEY);
    case 'google':
      return Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY);
    default:
      return true;
  }
}

export function summarizeHostPreflight(
  body: PipelineHostPreflightBody,
  env: PipelineHostRuntimeEnv = process.env
): Record<string, unknown> {
  const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseHost = readSupabaseHost(supabaseUrl);
  const supabaseDbHost = readSupabaseHost(env.SUPABASE_DB_URL || env.DATABASE_URL);
  const normalizedSupabaseHost = normalizeSupabaseHost(supabaseHost);
  const normalizedSupabaseDbHost = normalizeSupabaseHost(supabaseDbHost);
  const serviceRole = selectSupabaseAdminCredential(env);
  const budgetMs = Number(env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || 240000);
  const realInferenceProfile = readRealInferenceProfile(
    env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE
  );
  const realInferenceRequired = isPipelineHostRealInferenceRequired(env);
  return {
    repositoryFullName: body.repositoryFullName || null,
    sourceBranch: body.sourceBranch || null,
    sourceCommit: body.sourceCommit || null,
    readId: body.readId || null,
    depositId: body.depositId || null,
    realInferenceEnabled: isEnabled(env.BITCODE_ASSET_PACK_REAL_INFERENCE),
    realInferenceRequired,
    openaiCredentialProvided: isUsableSecretValue(env.OPENAI_API_KEY),
    xaiCredentialProvided: isUsableSecretValue(env.XAI_API_KEY || env.GROK_API_KEY),
    modelCredentialProvided: hasAnyModelProviderCredential(
      Object.fromEntries(
        Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
      ),
    ),
    supabaseUrlProvided: isUsableSupabaseUrl(supabaseUrl),
    supabaseHost,
    supabaseDbHost,
    stagingTestnetProjectRef: STAGING_TESTNET_SUPABASE_PROJECT_REF,
    stagingTestnetSupabaseHostMatched:
      normalizeSupabaseHost(supabaseHost) === STAGING_TESTNET_SUPABASE_REST_HOST,
    supabaseRestDbHostAligned:
      !normalizedSupabaseHost ||
      !normalizedSupabaseDbHost ||
      normalizedSupabaseHost === normalizedSupabaseDbHost,
    supabaseServiceRoleProvided: isSupabaseAdminCredential(serviceRole),
    runtimeBudgetMs: Number.isFinite(budgetMs) ? budgetMs : null,
    realInferenceProfile: realInferenceProfile || (realInferenceRequired ? 'bounded' : null),
    fullProfileRequiresAsyncCompletion:
      realInferenceRequired &&
      realInferenceProfile === 'full',
    deployedRuntime: isDeployedRuntime(env),
  };
}
