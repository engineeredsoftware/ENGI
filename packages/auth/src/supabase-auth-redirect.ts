const AUTH_NEXT_PATH_STORAGE_KEY = 'bitcode.auth.next-path';

function isSafeRelativePath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'));
}

/**
 * Builds the Supabase `redirectTo` for sign-in / linking flows.
 *
 * GoTrue validates `redirect_to` against the Auth URL allow-list with exact
 * string matching; any query string defeats the match and the auth code falls
 * back to the Site URL origin, stranding the PKCE code verifier in the
 * initiating origin's storage (no session is ever minted). The redirect must
 * therefore stay query-free; the post-auth destination travels through
 * origin-local storage instead and is consumed by the callback page.
 */
export function buildSupabaseAuthCallbackRedirect(nextPath?: string | null): string {
  rememberAuthNextPath(nextPath);
  return `${window.location.origin}/tps/supabase/callback`;
}

export function rememberAuthNextPath(nextPath?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (isSafeRelativePath(nextPath)) {
      window.localStorage.setItem(AUTH_NEXT_PATH_STORAGE_KEY, nextPath);
    } else {
      window.localStorage.removeItem(AUTH_NEXT_PATH_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode/policy): the callback falls back to "/".
  }
}

export function consumeAuthNextPath(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(AUTH_NEXT_PATH_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_NEXT_PATH_STORAGE_KEY);
    return isSafeRelativePath(stored) ? stored : null;
  } catch {
    return null;
  }
}
