"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@bitcode/supabase/ssr/client";

import type { Session, User } from "@supabase/supabase-js";

import { buildMockReviewUser, isAuxillariesMockMode } from "@/lib/mock-review-mode";

interface AuthContextValue {
  user: User | null;
  /** True while the initial getUser() request is pending */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mockMode = isAuxillariesMockMode();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(mockMode ? buildMockReviewUser() : null);
  const [loading, setLoading] = useState(!mockMode);

  // Initial fetch
  useEffect(() => {
    if (mockMode) {
      setUser(buildMockReviewUser());
      setLoading(false);
      return;
    }

    let cancelled = false;
    supabase.auth
      .getUser()
      .then(({ data: { user } }: { data: { user: User | null } }) => {
        if (!cancelled) setUser(user ?? null);
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
      setUser(session?.user ?? null);
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
