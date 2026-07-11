'use client';

import React from 'react';

import type { BitcodeActionPill } from './BitcodeActionPillRow';
import BitcodeDetailRowList, { type BitcodeDetailRow } from './BitcodeDetailRowList';
import BitcodePayloadDetailCard from './BitcodePayloadDetailCard';

interface BitcodePayloadRowsCardProps {
  kicker: string;
  title: string;
  summary: string;
  payload: unknown;
  rawLabel: string;
  rows: BitcodeDetailRow[];
  actions?: BitcodeActionPill[];
  className?: string;
  rowsClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodePayloadRowsCard({
  kicker,
  title,
  summary,
  payload,
  rawLabel,
  rows,
  actions = [],
  className,
  rowsClassName,
  emptyMessage,
  emptyClassName,
}: BitcodePayloadRowsCardProps) {
  return (
    <BitcodePayloadDetailCard
      kicker={kicker}
      title={title}
      summary={summary}
      payload={payload}
      rawLabel={rawLabel}
      actions={actions}
      className={className}
    >
      <BitcodeDetailRowList
        rows={rows}
        className={rowsClassName}
        emptyMessage={emptyMessage}
        emptyClassName={emptyClassName}
      />
    </BitcodePayloadDetailCard>
  );
}
