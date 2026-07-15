/**
 * Thin helper around `@supabase/ssr` that can be imported from *any* Next.js
 * client component / browser code without having to know the implementation
 * details.  Mirrors the former `apps/uapi/utils/supabase/client.ts` file.
 */
/**
 * Creates a browser-side Supabase client using the public credentials that are
 * exposed to the Next.js runtime via environment variables.
 */
export declare function createClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
