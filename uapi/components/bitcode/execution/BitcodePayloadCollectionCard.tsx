'use client';

import React from 'react';

import type { BitcodeActionPill } from './BitcodeActionPillRow';
import BitcodeDetailCollection, { type BitcodeDetailCollectionItem } from './BitcodeDetailCollection';
import BitcodePayloadDetailCard from './BitcodePayloadDetailCard';

interface BitcodePayloadCollectionCardProps {
  kicker: string;
  title: string;
  summary: string;
  payload: unknown;
  rawLabel: string;
  items: BitcodeDetailCollectionItem[];
  actions?: BitcodeActionPill[];
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  titleClassName?: string;
  summaryClassName?: string;
  supportingTextClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodePayloadCollectionCard({
  kicker,
  title,
  summary,
  payload,
  rawLabel,
  items,
  actions = [],
  className,
  listClassName,
  itemClassName,
  titleClassName,
  summaryClassName,
  supportingTextClassName,
  emptyMessage,
  emptyClassName,
}: BitcodePayloadCollectionCardProps) {
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
      <BitcodeDetailCollection
        items={items}
        listClassName={listClassName}
        itemClassName={itemClassName}
        titleClassName={titleClassName}
        summaryClassName={summaryClassName}
        supportingTextClassName={supportingTextClassName}
        emptyMessage={emptyMessage}
        emptyClassName={emptyClassName}
      />
    </BitcodePayloadDetailCard>
  );
}
