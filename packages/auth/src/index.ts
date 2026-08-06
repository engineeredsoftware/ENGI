// Moved from apps/uapi/lib/apiAuth.ts

import { createClient } from '@bitcode/supabase';
import { supabaseAdmin } from '@bitcode/supabase';
import { createAuthErrorResponse } from '@/lib/responses';

/**
 * Authenticate an incoming request via:
 *  - Bearer <api_key> header (lookup in user_api_keys)
 *  - Fallback to Supabase session cookies
 * Returns { userId } on success, or a Response (401) on failure.
 */
export async function authenticateRequest(request: Request): Promise<{ userId: string } | Response> {
  // 1) API-KEY header
  const auth = request.headers.get('Authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (match) {
    const apiKey = match[1];
    const { data: rec, error } = await supabaseAdmin
      .from('user_api_keys')
      .select('user_id, expire_at')
      .eq('key', apiKey)
      .single();
    if (error || !rec) {
      return createAuthErrorResponse('Invalid API key');
    }
    if (rec.expire_at && new Date(rec.expire_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired', details: `Expired at ${rec.expire_at}` }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return { userId: rec.user_id };
  }

  // 2) Supabase session cookie
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return createAuthErrorResponse();
  }
  return { userId: user.id };
}

export * from './bitcode-wallet-local';
export * from './bitcoin-wallet-client';
export * from './bitcoin-wallet-oauth-provider';
export * from './ethereum-wallet-client';
export * from './ethereum-auth-verify';
export * from './supabase-auth-redirect';
export * from './qa-telemetry';
