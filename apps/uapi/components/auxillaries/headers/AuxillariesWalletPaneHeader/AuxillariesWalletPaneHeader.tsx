"use client";

import React from 'react';

import { AuxillariesPaneHeader } from '@/components/auxillaries/headers/AuxillariesPaneHeader/AuxillariesPaneHeader';

export default function AuxillariesWalletPaneHeader({
  isOnboardingComplete = false,
}: { isOnboardingComplete?: boolean }) {
  return (
    <AuxillariesPaneHeader
      title="Wallet Auxillary"
      completedTitle="Wallet Auxillary"
      description={!isOnboardingComplete
        ? 'Connect a Bitcoin wallet first, then review BTC fee readiness and BTD source-share posture.'
        : 'Review wallet provider status, BTC readiness, BTD balances, share posture, throughput history, and advanced wallet defaults.'}
      stepNumber={1}
      isOnboardingComplete={isOnboardingComplete}
      badgeTestId="wallet-step-badge"
      showInfoBox
      infoTitle="Connect wallet identity"
      infoDescription="Keep Bitcoin wallet providers, balances, signer proof, and BTD posture visible in one auxillary."
      infoNote="Wallet authentication comes before Externals and optional Profile details."
    />
  );
}
