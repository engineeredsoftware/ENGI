"use client";

import React from 'react';
import { PaneTitle } from '@/components/auxillaries/shared/PaneTitle/PaneTitle';
import OnboardingInfoBox from '@/components/auxillaries/shared/OnboardingInfoBox/OnboardingInfoBox';

export interface AuxillariesPaneHeaderProps {
  title: string;
  completedTitle?: string;
  description: string;
  stepNumber: 1 | 2 | 3 | 4;
  isOnboardingComplete?: boolean;
  badgeTestId?: string;
  showInfoBox?: boolean;
  infoTitle?: string;
  infoDescription?: string;
  infoNote?: string;
}

export function AuxillariesPaneHeader({
  title,
  completedTitle,
  description,
  stepNumber,
  isOnboardingComplete = false,
  badgeTestId,
  showInfoBox,
  infoTitle,
  infoDescription,
  infoNote,
}: AuxillariesPaneHeaderProps) {
  return (
    <div className="orbital-header">
      <PaneTitle
        title={title}
        completedTitle={completedTitle}
        description={description}
        stepNumber={stepNumber}
        isOnboardingComplete={isOnboardingComplete}
        badgeTestId={badgeTestId}
      />
      {showInfoBox && !isOnboardingComplete && (
        <OnboardingInfoBox
          step={stepNumber}
          title={infoTitle || title}
          description={infoDescription || ''}
          note={infoNote}
          visible
        />
      )}
    </div>
  );
}
