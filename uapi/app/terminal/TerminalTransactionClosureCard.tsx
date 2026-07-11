'use client';

import React from 'react';

import BitcodeChipCloud from '@/components/bitcode/pipeline/BitcodeChipCloud';
import BitcodeDetailRowList from '@/components/bitcode/pipeline/BitcodeDetailRowList';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';
import BitcodePayloadDetailCard from '@/components/bitcode/pipeline/BitcodePayloadDetailCard';

import type { TerminalTransactionClosureFollowThrough } from './terminal-transaction-detail';

interface TerminalTransactionClosureCardProps {
  rows: Array<{ label: string; value: string }>;
  settlementMetrics: TerminalTransactionClosureFollowThrough['settlementMetrics'];
  branchArtifacts: TerminalTransactionClosureFollowThrough['branchArtifacts'];
  payload: unknown;
  onOpenVerification: () => void;
  onOpenBranch: () => void;
  onOpenSettlement: () => void;
}

export default function TerminalTransactionClosureCard({
  rows,
  settlementMetrics,
  branchArtifacts,
  payload,
  onOpenVerification,
  onOpenBranch,
  onOpenSettlement,
}: TerminalTransactionClosureCardProps) {
  return (
    <BitcodePayloadDetailCard
      kicker="Closure posture"
      title="Closure summary, settlement, and branch follow-through"
      summary="Closure now stays inspectable inside the selected Bitcode activity with the same visual-versus-raw posture used for identity, proofs, and history."
      payload={payload}
      rawLabel="Closure payload"
      actions={[
        { label: 'Open verification', onClick: onOpenVerification },
        { label: 'Open branch', onClick: onOpenBranch },
        { label: 'Open settlement', onClick: onOpenSettlement, tone: 'accent' },
      ]}
    >
      <>
        <BitcodeDetailRowList rows={rows} />

        {settlementMetrics.length ? (
          <BitcodeMetricGrid metrics={settlementMetrics} className="mt-4" columnsClassName="sm:grid-cols-2" />
        ) : null}

        {branchArtifacts.length ? (
          <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-white/5 px-4 py-4">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Branch artifacts</p>
            <BitcodeChipCloud chips={branchArtifacts} className="mt-3" />
          </div>
        ) : null}
      </>
    </BitcodePayloadDetailCard>
  );
}
