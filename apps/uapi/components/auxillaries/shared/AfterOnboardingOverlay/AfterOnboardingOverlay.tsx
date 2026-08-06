"use client";

import React from "react";

interface AfterOnboardingOverlayProps {
  /** If true, shows the overlay. If false, renders children normally */
  disabled?: boolean;
  /** Optional custom className for the overlay container */
  className?: string;
  /** Children to be wrapped */
  children: React.ReactNode;
  /** Style variant: 'full' for full overlay, 'badge' for just the badge */
  variant?: 'full' | 'badge';
}

/**
 * Unified component for showing content that unlocks after initial setup
 * Provides consistent styling and behavior across all auxillary panes
 */
export function AfterOnboardingOverlay({
  disabled = false,
  className = "",
  children,
  variant = 'full'
}: AfterOnboardingOverlayProps) {
  if (!disabled) {
    return <>{children}</>;
  }

  if (variant === 'badge') {
    // Just show the badge inline
    return (
      <>
        {children}
        <span className="after-onboarding-badge-inline">
          Available after setup
        </span>
      </>
    );
  }

  // Full overlay variant
  return (
    <div className={`after-onboarding-container ${className}`}>
      {children}
      <div className="after-onboarding-overlay" />
    </div>
  );
}
