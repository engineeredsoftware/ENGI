"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authQueryKeys = void 0;
exports.useUser = useUser;
exports.prefetchUser = prefetchUser;
exports.useProfile = useProfile;
exports.useOnboarding = useOnboarding;
exports.prefetchAuthData = prefetchAuthData;
exports.clearAuthQueries = clearAuthQueries;
exports.updateCachedUser = updateCachedUser;
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@bitcode/supabase/ssr/client");
const mock_review_mode_1 = require("@/lib/mock-review-mode");
// Query key for auth queries
exports.authQueryKeys = {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
    onboarding: ['auth', 'onboarding'],
};
// Singleton Supabase client
let supabaseClient = null;
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = (0, client_1.createClient)();
    }
    return supabaseClient;
}
/**
 * Fetches the current user from Supabase auth
 */
async function fetchUser() {
    if ((0, mock_review_mode_1.isAuxillariesMockMode)()) {
        return (0, mock_review_mode_1.buildMockReviewUser)();
    }
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
}
/**
 * Hook to get the current user with React Query caching
 * This will be instantly available if prefetched
 */
function useUser() {
    return (0, react_query_1.useQuery)({
        queryKey: exports.authQueryKeys.user,
        queryFn: fetchUser,
        staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });
}
/**
 * Prefetch user data - call this on page load
 * This ensures the user query is cached before Orbital opens
 */
async function prefetchUser(queryClient) {
    await queryClient.prefetchQuery({
        queryKey: exports.authQueryKeys.user,
        queryFn: fetchUser,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Fetches user profile data
 */
async function fetchProfile() {
    if ((0, mock_review_mode_1.isAuxillariesMockMode)()) {
        return (0, mock_review_mode_1.buildMockAuxillariesData)().profile;
    }
    const response = await fetch('/api/auxillaries/data', {
        credentials: 'same-origin',
    });
    if (!response.ok)
        return null;
    const data = await response.json();
    return data.profile;
}
/**
 * Hook to get user profile with caching
 */
function useProfile() {
    const { data: user } = useUser();
    return (0, react_query_1.useQuery)({
        queryKey: exports.authQueryKeys.profile,
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
    if ((0, mock_review_mode_1.isAuxillariesMockMode)()) {
        return (0, mock_review_mode_1.buildMockOnboardingData)();
    }
    const response = await fetch('/api/auxillaries/onboarding', {
        credentials: 'same-origin',
    });
    if (!response.ok)
        return null;
    return response.json();
}
/**
 * Hook to get onboarding status with caching
 */
function useOnboarding() {
    const { data: user } = useUser();
    return (0, react_query_1.useQuery)({
        queryKey: exports.authQueryKeys.onboarding,
        queryFn: fetchOnboarding,
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
/**
 * Prefetch all auth-related data
 */
async function prefetchAuthData(queryClient) {
    try {
        // First prefetch user - this will be null if not logged in
        const user = await queryClient.fetchQuery({
            queryKey: exports.authQueryKeys.user,
            queryFn: fetchUser,
            staleTime: 5 * 60 * 1000,
        });
        // If user exists, prefetch profile and onboarding in parallel
        if (user) {
            await Promise.all([
                queryClient.prefetchQuery({
                    queryKey: exports.authQueryKeys.profile,
                    queryFn: fetchProfile,
                    staleTime: 5 * 60 * 1000,
                }),
                queryClient.prefetchQuery({
                    queryKey: exports.authQueryKeys.onboarding,
                    queryFn: fetchOnboarding,
                    staleTime: 5 * 60 * 1000,
                }),
            ]);
        }
    }
    catch (error) {
        // Silently fail prefetch - queries will fetch on demand
    }
}
/**
 * Clear all auth queries (for sign out)
 */
function clearAuthQueries(queryClient) {
    queryClient.removeQueries({ queryKey: ['auth'] });
}
/**
 * Update cached user (for sign in)
 */
function updateCachedUser(queryClient, user) {
    queryClient.setQueryData(exports.authQueryKeys.user, user);
}
