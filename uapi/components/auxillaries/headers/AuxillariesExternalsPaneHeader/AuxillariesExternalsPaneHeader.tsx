"use client";

import React from 'react';
import { AuxillariesPaneHeader } from '@/components/auxillaries/headers/AuxillariesPaneHeader/AuxillariesPaneHeader';

export default function AuxillariesExternalsPaneHeader({
  isOnboardingComplete = false,
}: { isOnboardingComplete?: boolean }) {
  return (
    <AuxillariesPaneHeader
      title="Externals Auxillary"
      completedTitle="Externals Auxillary"
      description={!isOnboardingComplete
        ? 'Connect GitHub after wallet identity so Bitcode can measure read, synthesize asset packs, and settle against live repositories.'
        : 'Manage GitHub and future non-wallet third-party connections from one auxillary.'}
      stepNumber={2}
      isOnboardingComplete={isOnboardingComplete}
      showInfoBox
      infoTitle="Connect external systems"
      infoDescription="Attach GitHub and future VCS providers so Bitcode can read source context, measure read, synthesize asset packs, and stay aligned with your live workflow."
    />
  );
}
