import {
  buildSupabaseAuthCallbackRedirect,
  consumeAuthNextPath,
  rememberAuthNextPath,
} from '@bitcode/auth/supabase-auth-redirect';

describe('supabase-auth-redirect', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('builds a query-free redirect_to so GoTrue allow-list exact matching succeeds', () => {
    const redirectTo = buildSupabaseAuthCallbackRedirect('/auxillaries/wallet');

    expect(redirectTo).toBe(`${window.location.origin}/tps/supabase/callback`);
    expect(redirectTo).not.toContain('?');
  });

  it('carries the post-auth destination through storage, consumed exactly once', () => {
    buildSupabaseAuthCallbackRedirect('/auxillaries/wallet');

    expect(consumeAuthNextPath()).toBe('/auxillaries/wallet');
    expect(consumeAuthNextPath()).toBeNull();
  });

  it('clears any stale destination when none is provided', () => {
    rememberAuthNextPath('/exchange');
    buildSupabaseAuthCallbackRedirect();

    expect(consumeAuthNextPath()).toBeNull();
  });

  it('refuses absolute and protocol-relative destinations', () => {
    rememberAuthNextPath('https://evil.example/phish');
    expect(consumeAuthNextPath()).toBeNull();

    rememberAuthNextPath('//evil.example/phish');
    expect(consumeAuthNextPath()).toBeNull();
  });
});
