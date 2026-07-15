"use server";

/**
 * Server-side Supabase client helper for Next.js (Edge / Node).
 *
 * Ported from `apps/uapi/utils/supabase/server.ts` to make it available outside the
 * uapi application.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a server-side Supabase client wired up to the Next.js cookies system
 * for seamless auth session management.
 */
export async function createClient() {
  const cookieStore = cookies();

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

  return createServerClient(
    supabaseUrl,
    publicKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    },
  );
}
