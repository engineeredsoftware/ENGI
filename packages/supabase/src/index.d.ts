/**
 * Supabase utilities and thin MCP helpers.
 *
 * Consolidates the previous `apps/uapi/lib/supabaseClient.ts` (client helpers) and
 * `apps/uapi/lib/mcps/supabase.ts` (MCP tool implementations) into a single raw
 * package so that external code can simply depend on `@bitcode/supabase` for any
 * Supabase-related functionality.
 *
 * No behavioural changes – the code is moved verbatim except for import path
 * updates.
 */
/** Supabase client for browser / authenticated client-side operations */
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
/** Supabase admin client for server-side operations */
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare function supabaseMcpTool(params: {
    userId: string;
    query?: string;
    count?: number;
}): Promise<any[]>;
export declare function supabaseQueryTool(params: {
    query: string;
}): Promise<any>;
export declare function supabaseInsertTool(params: {
    table: string;
    values: any;
}): Promise<any>;
export declare function supabaseUpdateTool(params: {
    table: string;
    updates: any;
    match: any;
}): Promise<any>;
export declare function supabaseDeleteTool(params: {
    table: string;
    match: any;
}): Promise<any>;
export { createClient as createBrowserClient } from './ssr/client';
export { createClient as createClient } from './ssr/client';
export * from './asset-pack-evidence';
export { SupabaseStream, flushAndExit } from './streams';
