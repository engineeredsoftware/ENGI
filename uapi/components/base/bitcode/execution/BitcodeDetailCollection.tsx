'use client';

import React from 'react';

export type BitcodeDetailCollectionItem = {
  id: string;
  title: string;
  summary?: string;
  supportingText?: string;
};

interface BitcodeDetailCollectionProps {
  items: BitcodeDetailCollectionItem[];
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  titleClassName?: string;
  summaryClassName?: string;
  supportingTextClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodeDetailCollection({
  items,
  className,
  listClassName,
  itemClassName,
  titleClassName,
  summaryClassName,
  supportingTextClassName,
  emptyMessage,
  emptyClassName,
}: BitcodeDetailCollectionProps) {
  if (!items.length) {
    return emptyMessage ? (
      <div
        className={
          emptyClassName ||
          ' border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-300'
        }
      >
        {emptyMessage}
      </div>
    ) : null;
  }

  return (
    <div className={`space-y-3 text-sm ${listClassName || ''} ${className || ''}`.trim()}>
      {items.map((item) => (
        <div
          key={item.id}
          className={itemClassName || ' border border-white/8 bg-white/5 px-4 py-4'}
        >
          <p className={titleClassName || 'font-medium text-white'}>{item.title}</p>
          {item.summary ? <p className={`mt-1 ${summaryClassName || 'text-neutral-300'}`.trim()}>{item.summary}</p> : null}
          {item.supportingText ? (
            <p className={`mt-1 break-all ${supportingTextClassName || 'text-neutral-500'}`.trim()}>{item.supportingText}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
