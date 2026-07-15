"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useOnboardingLock;
const use_auth_query_1 = require("@/hooks/use-auth-query");
/**
 * Hook to derive onboarding lock state from backend onboarding status.
 * Returns true if the user is mid-onboarding (onboarding not complete).
 *
 * This is the SINGLE SOURCE OF TRUTH for onboarding completion status.
 */
function useOnboardingLock() {
    const { data: onboardingData, isLoading } = (0, use_auth_query_1.useOnboarding)();
    // If still loading, assume locked to be safe
    if (isLoading)
        return true;
    // If no data or onboarding not complete, it's locked
    return !onboardingData?.isOnboardingComplete;
}
