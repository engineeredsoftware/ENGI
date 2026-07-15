"use client";

import React from "react";

interface PaneTitleProps {
  /** Main title text */
  title: string;
  /** Alternative title when onboarding is complete (optional) */
  completedTitle?: string;
  /** Description text below the title */
  description: string;
  /** Step number for onboarding badge */
  stepNumber?: number;
  /** Whether onboarding is complete */
  isOnboardingComplete?: boolean;
  /** Test ID for the badge element */
  badgeTestId?: string;
}

/**
 * Reusable pane title component with underline animation
 * Used across all 4 auxillary panes for consistent styling
 */
export function PaneTitle({
  title,
  completedTitle,
  description,
  stepNumber,
  isOnboardingComplete = false,
  badgeTestId,
}: PaneTitleProps) {
  const displayTitle = isOnboardingComplete && completedTitle ? completedTitle : title;
  
  return (
    <>
      <h2 className="step-title">
        {displayTitle}
        {!isOnboardingComplete && stepNumber && (
          <span 
            data-testid={badgeTestId}
            className="onboarding-badge"
          >
            Auxillary step {stepNumber}
          </span>
        )}
      </h2>
      <p className="step-description">
        {description}
      </p>
    </>
  );
}
