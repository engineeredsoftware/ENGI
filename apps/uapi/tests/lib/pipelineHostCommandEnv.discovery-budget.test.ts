/**
 * @jest-environment node
 *
 * STAB-C2: host seeds deposit Discovery budget (bounded default).
 */

import { selectedPipelineHostCommandEnvironment } from '@/lib/pipeline-host-command-env';

function fakeServiceRoleJwt(): string {
  return [
    Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ role: 'service_role', ref: 'stab-c2-test' })).toString(
      'base64url',
    ),
    'stab-c2-signature',
  ].join('.');
}

describe('selectedPipelineHostCommandEnvironment deposit Discovery budget (STAB-C2)', () => {
  const saved: Record<string, string | undefined> = {};
  const keys = [
    'BITCODE_DEPOSIT_DISCOVERY_PROFILE',
    'BITCODE_DEBUG_FAST_DISCOVERY',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ADMIN_KEY',
    'SUPABASE_DB_URL',
    'DATABASE_URL',
  ];

  beforeEach(() => {
    for (const k of keys) saved[k] = process.env[k];
    // Satisfy host streaming preflight without real Supabase.
    process.env.SUPABASE_URL = 'https://stab-c2-test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeServiceRoleJwt();
    delete process.env.SUPABASE_DB_URL;
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('seeds BITCODE_DEPOSIT_DISCOVERY_PROFILE=bounded when unset', () => {
    delete process.env.BITCODE_DEPOSIT_DISCOVERY_PROFILE;
    const env = selectedPipelineHostCommandEnvironment('user-stab-c2');
    expect(env.BITCODE_DEPOSIT_DISCOVERY_PROFILE).toBe('bounded');
  });

  it('forwards explicit full profile from process.env', () => {
    process.env.BITCODE_DEPOSIT_DISCOVERY_PROFILE = 'full';
    const env = selectedPipelineHostCommandEnvironment('user-stab-c2-full');
    expect(env.BITCODE_DEPOSIT_DISCOVERY_PROFILE).toBe('full');
  });
});
