'use client';

import React from 'react';

interface BitcodeChipCloudProps {
  chips: string[];
  className?: string;
  chipClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodeChipCloud({
  chips,
  className,
  chipClassName,
  emptyMessage,
  emptyClassName,
}: BitcodeChipCloudProps) {
  if (!chips.length) {
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
    <div className={`flex flex-wrap gap-2 ${className || ''}`.trim()}>
      {chips.map((chip) => (
        <span
          key={chip}
          className={
            chipClassName ||
            ' border border-white/10 bg-black/20 px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200'
          }
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
