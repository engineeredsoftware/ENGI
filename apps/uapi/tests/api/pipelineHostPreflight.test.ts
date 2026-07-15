/**
 * @jest-environment node
 */

import {
  assertDatabaseStreamingEnvironment,
  assertRealInferenceEnvironment,
  isPipelineHostRealInferenceRequired,
  normalizeModelEnvironment,
  listSupabaseAdminCredentials,
  selectSupabaseAdminCredential,
  summarizeHostPreflight,
} from '@/app/api/pipeline-host/asset-pack/preflight';

function fakeSupabaseJwt(role: string, ref = 'test-project'): string {
  return [
    Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ role, ref })).toString('base64url'),
    'test-signature',
  ].join('.');
}

describe('pipeline host preflight', () => {
  const adminCredential = fakeSupabaseJwt('service_role', 'staging-testnet');
  const staleAdminCredential = fakeSupabaseJwt('service_role', 'production-mainnet');
  const anonCredential = fakeSupabaseJwt('anon', 'wrong-project');
  const modelCredential = 'model-credential-placeholder';

  const body = {
    repositoryFullName: 'engineeredsoftware/ENGI',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    readId: 'read-1',
    depositId: 'deposit-1',
  };

  it('does not require route real-inference strictness for ordinary local development', () => {
    const env = {
      NODE_ENV: 'development',
      SUPABASE_URL: 'https://staging.example.test',
      SUPABASE_SERVICE_ROLE_KEY: adminCredential,
    } as NodeJS.ProcessEnv;

    expect(isPipelineHostRealInferenceRequired(env)).toBe(false);
    expect(() => assertRealInferenceEnvironment(env as Record<string, string>)).not.toThrow();
    expect(summarizeHostPreflight(body, env)).toMatchObject({
      realInferenceRequired: false,
      realInferenceEnabled: false,
      fullProfileRequiresAsyncCompletion: false,
    });
  });

  it('lets local application deployments opt into the same real bounded inference gate', () => {
    const env = {
      NODE_ENV: 'development',
      BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE: 'bounded',
      BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS: '600000',
      OPENAI_API_KEY: modelCredential,
      SUPABASE_URL: 'https://staging.example.test',
      SUPABASE_SERVICE_ROLE_KEY: adminCredential,
    } as NodeJS.ProcessEnv;

    expect(isPipelineHostRealInferenceRequired(env)).toBe(true);
    expect(() => assertRealInferenceEnvironment(env as Record<string, string>)).not.toThrow();
    expect(summarizeHostPreflight(body, env)).toMatchObject({
      deployedRuntime: false,
      realInferenceRequired: true,
      realInferenceEnabled: true,
      realInferenceProfile: 'bounded',
      runtimeBudgetMs: 600000,
    });
  });

  it('fails local strict runs that would otherwise fall back to deterministic branches', () => {
    const env = {
      NODE_ENV: 'development',
      BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE: '1',
      OPENAI_API_KEY: modelCredential,
    } as NodeJS.ProcessEnv;

    expect(() => assertRealInferenceEnvironment(env as Record<string, string>)).toThrow(
      'BITCODE_ASSET_PACK_REAL_INFERENCE=1'
    );
  });

  it('keeps full profile behind the async completion gate for local strict runs', () => {
    const env = {
      NODE_ENV: 'development',
      BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE: 'full',
      BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS: '600000',
      OPENAI_API_KEY: modelCredential,
      SUPABASE_URL: 'https://staging.example.test',
      SUPABASE_SERVICE_ROLE_KEY: adminCredential,
    } as NodeJS.ProcessEnv;

    expect(summarizeHostPreflight(body, env)).toMatchObject({
      realInferenceRequired: true,
      fullProfileRequiresAsyncCompletion: true,
      realInferenceProfile: 'full',
    });
    expect(() => assertRealInferenceEnvironment(env as Record<string, string>)).toThrow(
      'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded'
    );
  });

  it('normalizes stale model provider pins before strict route execution', () => {
    const env = {
      BITCODE_LLM_PROVIDER: 'anthropic',
      BITCODE_LLM_MODEL: 'claude-stale',
      OPENAI_API_KEY: modelCredential,
    } as Record<string, string>;

    normalizeModelEnvironment(env);

    expect(env.BITCODE_LLM_PROVIDER).toBe('openai');
    expect(env.BITCODE_LLM_MODEL).toBeUndefined();
  });

  it('selects an admin-capable Supabase key instead of an anon key', () => {
    const env = {
      SUPABASE_SERVICE_ROLE_KEY: anonCredential,
      SUPABASE_SECRET_KEY: adminCredential,
    };

    expect(selectSupabaseAdminCredential(env)).toBe(adminCredential);
  });

  it('prefers the secret-key slot before a stale service-role slot when both are admin-shaped', () => {
    const env = {
      SUPABASE_SERVICE_ROLE_KEY: staleAdminCredential,
      SUPABASE_SECRET_KEY: adminCredential,
    };

    expect(listSupabaseAdminCredentials(env).map((credential) => credential.key)).toEqual([
      'SUPABASE_SECRET_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]);
    expect(selectSupabaseAdminCredential(env)).toBe(adminCredential);
  });

  it('blocks database streaming when REST and DB readback hosts differ', () => {
    const env = {
      SUPABASE_URL: 'https://rest-project.example.test',
      SUPABASE_SECRET_KEY: adminCredential,
    };
    const hostEnv = {
      SUPABASE_DB_URL:
        'postgresql://postgres:password@db.db-project.example.test:5432/postgres?sslmode=require',
    };

    expect(summarizeHostPreflight(body, { ...env, ...hostEnv })).toMatchObject({
      supabaseHost: 'rest-project.example.test',
      supabaseDbHost: 'db.db-project.example.test',
      supabaseRestDbHostAligned: false,
      supabaseServiceRoleProvided: true,
    });
    expect(() => assertDatabaseStreamingEnvironment(env, hostEnv)).toThrow(
      'Supabase REST host must match DB readback host',
    );
  });
});
