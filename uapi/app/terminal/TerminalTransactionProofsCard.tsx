'use client';

import React from 'react';

import BitcodePayloadCollectionCard from '@/components/bitcode/pipeline/BitcodePayloadCollectionCard';

import type { TerminalClosureProofFamily } from './terminal-closure-state';

interface TerminalTransactionProofsCardProps {
  proofFamilies: TerminalClosureProofFamily[];
  onOpenVerification: () => void;
  onOpenSettlement: () => void;
  payload: unknown;
}

export default function TerminalTransactionProofsCard({
  proofFamilies,
  onOpenVerification,
  onOpenSettlement,
  payload,
}: TerminalTransactionProofsCardProps) {
  const proofItems = proofFamilies.map((family) => ({
    id: `${family.label}-${family.artifactPath}`,
    title: family.label,
    summary: `${family.theoremStatus} · replay ${family.replayArtifacts}`,
    supportingText: family.artifactPath,
  }));

  return (
    <BitcodePayloadCollectionCard
      kicker="Proof families"
      title="Bounded proof stays with the selected activity"
      summary="Verification and settlement proof families remain readable inside the selected Bitcode activity instead of forcing a separate route."
      payload={payload}
      rawLabel="Proof payload"
      items={proofItems}
      actions={[
        { label: 'Open verification', onClick: onOpenVerification },
        { label: 'Open settlement', onClick: onOpenSettlement, tone: 'accent' },
      ]}
      emptyMessage="No proof families are surfaced on the selected Bitcode activity yet. Verification and settlement still remain part of the same Bitcode closure path."
    />
  );
}
