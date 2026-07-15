/**
 * Next.js middleware helper that keeps the Supabase session cookie in sync so
 * that protected routes work both client and server-side.
 *
 * Direct copy of `apps/uapi/utils/supabase/middleware.ts`.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publicKey) {
    throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_PUBLISHABLE_KEY) are missing');
  }

  const supabase = createServerClient(
    supabaseUrl,
    publicKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Refresh session if needed – we ignore the result because the cookie writes
  // above have already synced any updates into the response.
  await supabase.auth.getSession();
  return response;
}
