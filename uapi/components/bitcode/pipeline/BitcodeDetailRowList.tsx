'use client';

import React from 'react';

export type BitcodeDetailRow = {
  label: string;
  value: string;
};

interface BitcodeDetailRowListProps {
  rows: BitcodeDetailRow[];
  className?: string;
  rowClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodeDetailRowList({
  rows,
  className,
  rowClassName,
  labelClassName,
  valueClassName,
  emptyMessage,
  emptyClassName,
}: BitcodeDetailRowListProps) {
  if (!rows.length) {
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
    <dl className={`space-y-3 text-sm ${className || ''}`.trim()}>
      {rows.map((row) => (
        <div key={`${row.label}-${row.value}`} className={rowClassName}>
          <dt className={labelClassName || 'text-neutral-500'}>{row.label}</dt>
          <dd className={`mt-1 break-words ${valueClassName || 'text-neutral-100'}`.trim()}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
