'use client';

import React from 'react';

import BitcodePayloadCollectionCard from '@/components/bitcode/pipeline/BitcodePayloadCollectionCard';

import type { TerminalClosureHistoryEntry } from './terminal-closure-state';

interface TerminalTransactionHistoryCardProps {
  recentHistory: TerminalClosureHistoryEntry[];
  onOpenHistory: () => void;
  payload: unknown;
}

export default function TerminalTransactionHistoryCard({
  recentHistory,
  onOpenHistory,
  payload,
}: TerminalTransactionHistoryCardProps) {
  const historyItems = recentHistory.map((entry) => ({
    id: `${entry.label}-${entry.summary}`,
    title: entry.label,
    summary: entry.summary,
  }));

  return (
    <BitcodePayloadCollectionCard
      kicker="History"
      title="Recent activity history stays inline"
      summary="Ledger-linked run history remains part of the same activity result so consequence reading does not fragment into a separate route."
      payload={payload}
      rawLabel="History payload"
      items={historyItems}
      actions={[{ label: 'Open history', onClick: onOpenHistory }]}
      emptyMessage="No recent history is surfaced on the selected Bitcode activity yet. The ledger and bounded proof chain remain part of the same Bitcode result path."
    />
  );
}
