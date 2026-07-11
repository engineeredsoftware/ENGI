'use client';

import React from 'react';

import BitcodePayloadRowsCard from '@/components/bitcode/pipeline/BitcodePayloadRowsCard';

interface TerminalTransactionIdentityCardProps {
  startedAt: string;
  rows: Array<{ label: string; value: string }>;
  payload: unknown;
}

export default function TerminalTransactionIdentityCard({
  startedAt,
  rows,
  payload,
}: TerminalTransactionIdentityCardProps) {
  const identityRows = [...rows, { label: 'Started', value: startedAt }];

  return (
    <BitcodePayloadRowsCard
      kicker="Selected activity"
      title="Activity identity and payload"
      summary="Read the Bitcode activity identity in one compact card, then switch straight into the raw payload when you read the underlying shape."
      payload={payload}
      rawLabel="Activity payload"
      rows={identityRows}
    />
  );
}
