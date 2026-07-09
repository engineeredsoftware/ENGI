'use client';

import React from 'react';

export interface BitcodeActionPill {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'accent';
  disabled?: boolean;
  title?: string;
}

interface BitcodeActionPillRowProps {
  actions: BitcodeActionPill[];
  className?: string;
}

function getActionToneClassName(tone: BitcodeActionPill['tone']) {
  if (tone === 'accent') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300/45 hover:bg-emerald-400/15';
  }

  return 'border-white/10 bg-white/5 text-neutral-200 hover:border-emerald-300/35 hover:bg-emerald-400/10';
}

export default function BitcodeActionPillRow({
  actions,
  className,
}: BitcodeActionPillRowProps) {
  if (!actions.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`.trim()}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.title}
          className={` border px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition ${getActionToneClassName(action.tone)} disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-neutral-500`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
