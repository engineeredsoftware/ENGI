"use client";

import { useOnboarding } from '@/hooks/use-auth-query';

/**
 * Hook to derive onboarding lock state from backend onboarding status.
 * Returns true if the user is mid-onboarding (onboarding not complete).
 * 
 * This is the SINGLE SOURCE OF TRUTH for onboarding completion status.
 */
export default function useOnboardingLock(): boolean {
  const { data: onboardingData, isLoading } = useOnboarding();
  
  // If still loading, assume locked to be safe
  if (isLoading) return true;
  
  // If no data or onboarding not complete, it's locked
  return !onboardingData?.isOnboardingComplete;
}