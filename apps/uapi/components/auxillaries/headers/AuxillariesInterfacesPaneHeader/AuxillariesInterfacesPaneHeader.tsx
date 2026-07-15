"use client";

import React from 'react';

import { AuxillariesPaneHeader } from '@/components/auxillaries/headers/AuxillariesPaneHeader/AuxillariesPaneHeader';

export default function AuxillariesInterfacesPaneHeader({
  isOnboardingComplete = false,
}: { isOnboardingComplete?: boolean }) {
  return (
    <AuxillariesPaneHeader
      title="Interfaces Auxillary"
      completedTitle="Interfaces Auxillary"
      description={!isOnboardingComplete
        ? 'Choose interface defaults now or keep the standard Bitcode reading behavior.'
        : 'Set Terminal, MCP API, ChatGPT App, prompt, proof, and default reading behavior in this auxillary.'}
      stepNumber={4}
      isOnboardingComplete={isOnboardingComplete}
      badgeTestId="interfaces-step-badge"
      showInfoBox
      infoTitle="Shape interface defaults"
      infoDescription="Set how Terminal transactions, MCP API calls, ChatGPT App work, proofs, and default reading behavior read for your team."
      infoNote="You can revise this auxillary any time."
    />
  );
}
