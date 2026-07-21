/**
 * Trusted process.env → sandbox commandEnvironment selection for pipeline hosts.
 *
 * Shared by the asset-pack host route and deposit in-box host so LLM credentials
 * (XAI_API_KEY, …), Supabase streaming, and real-inference flags always reach
 * the Pipeliner box — not only the clone-env keys deposit used historically.
 */

import {
  assertDatabaseStreamingEnvironment,
  assertRealInferenceEnvironment,
  isPipelineHostRealInferenceRequired,
  normalizeModelEnvironment,
  selectSupabaseAdminCredential,
} from '@/app/api/pipeline-host/asset-pack/preflight';

export const TRUSTED_PIPELINE_HOST_COMMAND_ENV_KEYS = [
  // LLM provider credentials — must reach the sandbox; product defaults to xAI.
  'XAI_API_KEY',
  'GROK_API_KEY',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'ANTHROPIC_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_ADMIN_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'BITCODE_LLM_PROVIDER',
  'BITCODE_LLM_MODEL',
  'BITCODE_ASSET_PACK_REAL_INFERENCE',
  'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE',
  'BITCODE_ASSET_PACK_SETUP_PLAN_USE_PTRR',
  'BITCODE_ASSET_PACK_COMPREHEND_READ_USE_PTRR',
  'BITCODE_ASSET_PACK_DANGER_WALL_USE_PTRR',
  'BITCODE_ASSET_PACK_DISCOVERY_USE_PTRR',
  'BITCODE_ASSET_PACK_SYNTHESIS_USE_PTRR',
  'BITCODE_ASSET_PACK_VALIDATION_USE_PTRR',
  'BITCODE_ASSET_PACK_READY_TO_INSTRUCT_USE_PTRR',
  'BITCODE_ASSET_PACK_VALIDATION_READY_TO_FINISH_USE_PTRR',
  'BITCODE_ASSET_PACK_FINISH_DELIVER_USE_PTRR',
  'BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS',
  'BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE',
  'BITCODE_PIPELINE_BTC_NETWORK',
  'BITCODE_PIPELINE_BTC_FEE_SATS',
  'BITCODE_PIPELINE_DEPOSITOR_WALLET_ID',
  'BITCODE_PIPELINE_READER_WALLET_ID',
  'BITCODE_PIPELINE_WALLET_SESSION_ID',
  'BITCODE_PIPELINE_BTD_VOLUME',
  // Opt-in operator debug (default unset = false). Read inside the in-box
  // pipeline process. Host-only process.env is a no-op without these keys.
  // - SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT: Reason-only dual envelope
  // - SKIP_FAILSAFES: bare task Thinkings (no prepare / chunk / stitch)
  'BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT',
  'BITCODE_DEBUG_SKIP_FAILSAFES',
] as const;

/**
 * Select trusted host secrets/config from process.env for sandbox create/run.
 * Applies product defaults (real inference on, xAI preferred) and production
 * preflight asserts for database streaming + real-inference credentials.
 */
export function selectedPipelineHostCommandEnvironment(
  userId: string,
): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of TRUSTED_PIPELINE_HOST_COMMAND_ENV_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      env[key] = value;
    }
  }

  if (!env.SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL) {
    env.SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  }

  const serviceRole = selectSupabaseAdminCredential(process.env);
  if (serviceRole) {
    env.SUPABASE_SERVICE_ROLE_KEY = serviceRole;
  }

  env.BITCODE_PIPELINE_USER_ID = userId;
  env.BITCODE_PIPELINE_STREAM_TO_DATABASE = '1';
  env.BITCODE_PIPELINE_STRUCTURED_DB = '1';
  // Structured DB alone writes deliverable_pipeline_* tables. The deposit
  // telemetry UI tails execution_events and only renders F19 formal rows
  // (llm/output + tool result). Without legacy dual-write, sandbox deposit
  // left execution_events as status-only spam and the UI showed "No logs
  // available" despite healthy Setup/Discovery (run 793f8be1).
  env.BITCODE_PIPELINE_LEGACY_EVENTS_DB = '1';
  // Cap the in-box Node heap so Discovery on large monorepos fails more
  // gracefully (and sooner) than an unbounded V8 growth + host SIGKILL.
  // Child language servers use BITCODE_LSP_MAX_OLD_SPACE_MB separately.
  const pipelineHeapMb = (() => {
    const raw = Number(process.env.BITCODE_PIPELINE_MAX_OLD_SPACE_MB);
    if (Number.isFinite(raw) && raw >= 512 && raw <= 4096) return Math.floor(raw);
    return 1536;
  })();
  const parentNodeOptions = String(process.env.NODE_OPTIONS || '');
  env.NODE_OPTIONS = [
    parentNodeOptions.replace(/--max-old-space-size=\d+/g, '').trim(),
    `--max-old-space-size=${pipelineHeapMb}`,
  ]
    .filter(Boolean)
    .join(' ');
  // Prefer serial Discovery wave-1 inside the box even on older images that
  // still default parallel (set before image rebuild lands).
  if (!env.BITCODE_DEBUG_DISCOVERY_SERIAL && !process.env.BITCODE_DEBUG_DISCOVERY_PARALLEL) {
    env.BITCODE_DEBUG_DISCOVERY_SERIAL = '1';
  }
  // Deposit monorepo law: bound Discovery (codebase PTRR only) so Implementation
  // can Finish within host budget (runs 936b7f16 / e7e5dd6f: full Discovery
  // ~12m of 14m, zero packs). Opt into full three-agent Discovery with
  // BITCODE_DEPOSIT_DISCOVERY_PROFILE=full.
  if (!env.BITCODE_DEPOSIT_DISCOVERY_PROFILE && !process.env.BITCODE_DEPOSIT_DISCOVERY_PROFILE) {
    env.BITCODE_DEPOSIT_DISCOVERY_PROFILE = 'bounded';
  } else if (process.env.BITCODE_DEPOSIT_DISCOVERY_PROFILE && !env.BITCODE_DEPOSIT_DISCOVERY_PROFILE) {
    env.BITCODE_DEPOSIT_DISCOVERY_PROFILE = String(
      process.env.BITCODE_DEPOSIT_DISCOVERY_PROFILE,
    ).trim();
  }
  // Inference is owned by the host/Pipeliner process. Product default is on
  // when unset; honor explicit opt-out (0/false/off) for unit tests.
  const realInferenceRaw = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
  const realInferenceExplicitlyOff = ['0', 'false', 'no', 'off'].includes(
    String(realInferenceRaw ?? '').trim().toLowerCase(),
  );
  if (realInferenceExplicitlyOff) {
    env.BITCODE_ASSET_PACK_REAL_INFERENCE = String(realInferenceRaw).trim();
  } else {
    env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    // Product host routes (deposit + asset-pack API) only admit the bounded
    // profile. Always pin it here — do not forward a Vercel/process value of
    // `full` (or other) into create/command env; full runs belong to the
    // later async sandbox completion gate, and preflight would otherwise
    // throw BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded required.
    env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';
    // Product deposit route maxDuration=900s. Host budget must leave headroom
    // for artifact read + sandbox teardown after the in-box pipeline stops.
    // 720s still timed out large monorepos mid Implementation (run 936b7f16:
    // Discovery ~9.5m on Bitcode, budget kill before Finish). Pin 840s so
    // Implementation/Validation/Finish get ~4+ minutes after heavy Discovery;
    // do not honor a stale 240s Vercel value.
    env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS = '840000';
  }
  const realInferenceRequired = isPipelineHostRealInferenceRequired();
  if (realInferenceRequired) {
    env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
  }
  // When real inference is off (unit tests / bring-up), still provide a
  // finite budget if unset so callers do not inherit an empty env key.
  if (!env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS) {
    env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS = '240000';
  }
  assertDatabaseStreamingEnvironment(env, process.env);
  normalizeModelEnvironment(env);
  assertRealInferenceEnvironment(env);

  return env;
}

/** Source-safe summary of whether LLM credentials were selected (never values). */
export function summarizeSelectedLlmCredentials(
  env: Record<string, string>,
): {
  xaiCredentialProvided: boolean;
  openaiCredentialProvided: boolean;
  anthropicCredentialProvided: boolean;
  anyModelCredentialProvided: boolean;
  llmProvider: string | null;
} {
  const xai = Boolean(env.XAI_API_KEY || env.GROK_API_KEY);
  const openai = Boolean(env.OPENAI_API_KEY);
  const anthropic = Boolean(env.ANTHROPIC_API_KEY);
  return {
    xaiCredentialProvided: xai,
    openaiCredentialProvided: openai,
    anthropicCredentialProvided: anthropic,
    anyModelCredentialProvided: Boolean(
      xai ||
        openai ||
        anthropic ||
        env.GOOGLE_GENERATIVE_AI_API_KEY ||
        env.GEMINI_API_KEY ||
        env.GOOGLE_API_KEY,
    ),
    llmProvider: env.BITCODE_LLM_PROVIDER ?? null,
  };
}
