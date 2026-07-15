"use client";

import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { createClient } from '@bitcode/supabase/ssr/client';
import type { User } from '@supabase/supabase-js';

import {
  buildMockOnboardingData,
  buildMockAuxillariesData,
  buildMockReviewUser,
  isAuxillariesMockMode,
} from '@/lib/mock-review-mode';

// Query key for auth queries
export const authQueryKeys = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
  onboarding: ['auth', 'onboarding'] as const,
};

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

/**
 * Fetches the current user from Supabase auth
 */
async function fetchUser(): Promise<User | null> {
  if (isAuxillariesMockMode()) {
    return buildMockReviewUser();
  }

  const client = getSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Hook to get the current user with React Query caching
 * This will be instantly available if prefetched
 */
export function useUser() {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

/**
 * Prefetch user data - call this on page load
 * This ensures the user query is cached before Orbital opens
 */
export async function prefetchUser(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: authQueryKeys.user,
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches user profile data
 */
async function fetchProfile() {
  if (isAuxillariesMockMode()) {
    return buildMockAuxillariesData().profile;
  }

  const response = await fetch('/api/auxillaries/data', {
    credentials: 'same-origin',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.profile;
}

/**
 * Hook to get user profile with caching
 */
export function useProfile() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: fetchProfile,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetches onboarding status
 */
async function fetchOnboarding() {
  if (isAuxillariesMockMode()) {
    return buildMockOnboardingData();
  }

  const response = await fetch('/api/auxillaries/onboarding', {
    credentials: 'same-origin',
  });
  if (!response.ok) return null;
  return response.json();
}

/**
 * Hook to get onboarding status with caching
 */
export function useOnboarding() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: authQueryKeys.onboarding,
    queryFn: fetchOnboarding,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Prefetch all auth-related data
 */
export async function prefetchAuthData(queryClient: QueryClient) {
  try {
    // First prefetch user - this will be null if not logged in
    const user = await queryClient.fetchQuery({
      queryKey: authQueryKeys.user,
      queryFn: fetchUser,
      staleTime: 5 * 60 * 1000,
    });
    
    // If user exists, prefetch profile and onboarding in parallel
    if (user) {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: authQueryKeys.profile,
          queryFn: fetchProfile,
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: authQueryKeys.onboarding,
          queryFn: fetchOnboarding,
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    }
  } catch (error) {
    // Silently fail prefetch - queries will fetch on demand
  }
}

/**
 * Clear all auth queries (for sign out / Disconnect).
 * Explicitly null the user first so Connect chrome flips even if a refetch races.
 */
export function clearAuthQueries(queryClient: QueryClient) {
  queryClient.setQueryData(authQueryKeys.user, null);
  queryClient.setQueryData(authQueryKeys.profile, null);
  queryClient.setQueryData(authQueryKeys.onboarding, null);
  queryClient.removeQueries({ queryKey: ['auth'] });
}

/**
 * Update cached user (for sign in)
 */
export function updateCachedUser(queryClient: QueryClient, user: User | null) {
  queryClient.setQueryData(authQueryKeys.user, user);
}
