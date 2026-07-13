/**
 * Supabase utilities and thin MCP helpers.
 *
 * Consolidates the previous `uapi/lib/supabaseClient.ts` (client helpers) and
 * `uapi/lib/mcps/supabase.ts` (MCP tool implementations) into a single raw
 * package so that external code can simply depend on `@bitcode/supabase` for any
 * Supabase-related functionality.
 *
 * No behavioural changes – the code is moved verbatim except for import path
 * updates.
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Centralised Supabase client helpers (formerly uapi/lib/supabaseClient.ts)
// ---------------------------------------------------------------------------

// Helper to strip out any stray unicode characters (e.g. smart quotes)
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

// ---------------------------------------------------------------------------
// Public client (browser-side / client-side rendering)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Admin client (server-side with elevated privileges)
// ---------------------------------------------------------------------------
const _rawServiceRoleKey = selectSupabaseAdminKey();
const supabaseServiceRoleKey = sanitizeKey(_rawServiceRoleKey);

/** Supabase admin client for server-side operations */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// MCP helper utilities (formerly uapi/lib/mcps/supabase.ts)
// ---------------------------------------------------------------------------

export async function supabaseMcpTool(params: { userId: string; query?: string; count?: number }): Promise<any[]> {
  const { userId, query = '', count = 5 } = params;
  const { data, error } = await supabaseAdmin.rpc('match_mcp_templates', {
    user_id: userId,
    query_text: query,
    match_count: count,
  });
  if (error) throw error;
  return data || [];
}

export async function supabaseQueryTool(params: { query: string }): Promise<any> {
  return { rows: [], query: params.query };
}

export async function supabaseInsertTool(params: { table: string; values: any }): Promise<any> {
  return { inserted: 1 };
}

export async function supabaseUpdateTool(params: { table: string; updates: any; match: any }): Promise<any> {
  return { updated: 1 };
}

export async function supabaseDeleteTool(params: { table: string; match: any }): Promise<any> {
  return { deleted: 1 };
}

// ---------------------------------------------------------------------------
// SSR helpers re-exported for convenience
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SSR helpers – exported via dedicated sub-paths
// ---------------------------------------------------------------------------
//
// Export the browser-side helper directly as it is safe to use in both client
// and server environments.  Server-specific utilities, however, rely on
// `next/headers` which *must* only be imported within Server Components or
// route handlers.  Re-exporting them from the top-level module causes Next.js
// to include them in client bundles, leading to build-time errors like:
//   "You're importing a component that needs next/headers …"
//
// To avoid this, consumers should import the server helpers explicitly from
// the corresponding sub-path:
//   import { createClient } from '@bitcode/supabase/ssr/server';
//   import { updateSession } from '@bitcode/supabase/ssr/middleware';
//
// This keeps the public API clear while preventing accidental client-side
// inclusion of server-only code.

export { createClient as createBrowserClient } from './ssr/client';
// Stable browser-client alias used by package callers.
export { createClient as createClient } from './ssr/client';

// ---------------------------------------------------------------------------
// Re-export typed entities so downstream packages can use storage-edge
// AssetPack evidence contracts without importing schema internals.
// ---------------------------------------------------------------------------

export * from './asset-pack-evidence';

// Streams helpers
export { SupabaseStream, flushAndExit } from './streams';

// Client type re-export so workspace packages can type Supabase clients without
// a direct @supabase/supabase-js dependency (pnpm isolation + monorepo tsc).
export type { SupabaseClient } from '@supabase/supabase-js';

// NOTE:  Deliberately *not* re-exporting `createServerClient` or
// `supabaseMiddleware` here – import them from their dedicated files instead.
