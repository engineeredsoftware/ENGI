"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from "@bitcode/supabase/ssr/client";

import type { Session, User } from "@supabase/supabase-js";

import { buildMockReviewUser, isAuxillariesMockMode } from "@/lib/mock-review-mode";


interface AuthContextValue {
  user: User | null;
  /** True while the initial getUser() request is pending */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Product routes remount PublicShellFrame (and AuthProvider) on every navigation.
 * Keep the last resolved session at module scope so connected chrome never flashes
 * guest/Profile/"Reading wallet" while getUser() re-runs.
 */
let sharedAuthUser: User | null = null;
let sharedAuthHydrated = false;

function rememberAuthUser(next: User | null) {
  sharedAuthUser = next;
  sharedAuthHydrated = true;
}

/** Used by Disconnect paths and tests so remounted providers do not resurrect a session. */
export function clearSharedAuthUser() {
  sharedAuthUser = null;
  sharedAuthHydrated = true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mockMode = isAuxillariesMockMode();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(
    mockMode ? buildMockReviewUser() : sharedAuthUser,
  );
  const [loading, setLoading] = useState(mockMode ? false : !sharedAuthHydrated);

  // Initial fetch
  useEffect(() => {
    if (mockMode) {
      const mockUser = buildMockReviewUser();
      rememberAuthUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    let cancelled = false;
    supabase.auth
      .getUser()
      .then(({ data: { user } }: { data: { user: User | null } }) => {
        if (cancelled) return;
        const next = user ?? null;
        rememberAuthUser(next);
        setUser(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mockMode, supabase]);

  // Subscribe once for session changes
  useEffect(() => {
    if (mockMode) {
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const next = session?.user ?? null;
      rememberAuthUser(next);
      setUser(next);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, [mockMode, supabase]);

  const ctx: AuthContextValue = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
