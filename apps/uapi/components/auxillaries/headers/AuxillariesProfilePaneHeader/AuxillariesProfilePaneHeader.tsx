"use client";

import React from 'react';

import { AuxillariesPaneHeader } from '@/components/auxillaries/headers/AuxillariesPaneHeader/AuxillariesPaneHeader';

export default function AuxillariesProfilePaneHeader({
  isOnboardingComplete = false,
  isVerified = false,
}: { isOnboardingComplete?: boolean; isVerified?: boolean }) {
  const description = !isVerified
    ? 'Optionally add email notifications after Wallet and Externals are ready.'
    : 'Manage optional notification email, display identity, organization roles, and admin membership from one auxillary.';

  return (
    <AuxillariesPaneHeader
      title="Profile Auxillary"
      completedTitle="Profile Auxillary"
      description={description}
      stepNumber={3}
      isOnboardingComplete={isOnboardingComplete}
      badgeTestId="profile-step-badge"
      showInfoBox
      infoTitle="Optional account profile"
      infoDescription="Profile holds email, display, role, and organization details. Wallets live in Wallet; GitHub and third-party links live in Externals."
    />
  );
}
