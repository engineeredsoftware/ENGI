/**
 * Supabase client singletons (public + admin).
 *
 * Kept in a leaf module so in-package callers (e.g. streams.ts) can import
 * relative paths. Importing `@bitcode/supabase` from inside this package fails
 * under pnpm + file:// tsx (no self-link in packages/supabase/node_modules).
 */

import { createClient } from '@supabase/supabase-js';

function sanitizeKey(key: string): string {
  return key.replace(/[\u0080-\uFFFF]/g, '');
}

function supabaseJwtRole(key: string | undefined): string | null {
  if (!key) return null;
  const [, payload] = key.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded =
      typeof Buffer !== 'undefined'
        ? Buffer.from(normalized, 'base64').toString('utf8')
        : (globalThis as any).atob?.(normalized);
    if (!decoded) return null;
    const parsed = JSON.parse(decoded);
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

function isUsableAdminKey(key: string | undefined): key is string {
  if (!key || key.includes('<') || key.length <= 16) return false;
  return supabaseJwtRole(key) !== 'anon';
}

function selectSupabaseAdminKey(): string {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_ADMIN_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  ];

  return candidates.find(isUsableAdminKey) ?? 'local-service-role-key';
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  // Dummy value – prevents build-time crashes when env vars are missing
  'http://localhost:54321';

const _rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  // Dummy anon key – only used in non-production environments
  'local-anon-key';
const supabaseAnonKey = sanitizeKey(_rawAnonKey);

/** Supabase client for browser / authenticated client-side operations */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const _rawServiceRoleKey = selectSupabaseAdminKey();
const supabaseServiceRoleKey = sanitizeKey(_rawServiceRoleKey);

/** Supabase admin client for server-side operations */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
