'use client';

import React, { type ReactNode } from 'react';

import BitcodeActionPillRow, { type BitcodeActionPill } from './BitcodeActionPillRow';
import BitcodePayloadInspector from './BitcodePayloadInspector';

interface BitcodePayloadDetailCardProps {
  kicker: string;
  title: string;
  summary: string;
  payload: unknown;
  rawLabel: string;
  children: ReactNode;
  actions?: BitcodeActionPill[];
  className?: string;
}

export default function BitcodePayloadDetailCard({
  kicker,
  title,
  summary,
  payload,
  rawLabel,
  children,
  actions = [],
  className,
}: BitcodePayloadDetailCardProps) {
  return (
    <BitcodePayloadInspector
      kicker={kicker}
      title={title}
      summary={summary}
      payload={payload}
      rawLabel={rawLabel}
      className={className}
    >
      <>
        {children}
        <BitcodeActionPillRow actions={actions} />
      </>
    </BitcodePayloadInspector>
  );
}
