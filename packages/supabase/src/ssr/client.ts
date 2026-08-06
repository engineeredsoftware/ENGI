/**
 * Thin helper around `@supabase/ssr` that can be imported from *any* Next.js
 * client component / browser code without having to know the implementation
 * details.  Mirrors the former `apps/uapi/utils/supabase/client.ts` file.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a browser-side Supabase client using the public credentials that are
 * exposed to the Next.js runtime via environment variables.
 */
export function createClient() {
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

  return createBrowserClient(
    supabaseUrl,
    publicKey,
  );
}
