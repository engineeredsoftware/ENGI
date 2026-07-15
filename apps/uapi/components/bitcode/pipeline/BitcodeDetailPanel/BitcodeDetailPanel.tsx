'use client';

import React, { type ReactNode } from 'react';

import BitcodeDetailRowList, { type BitcodeDetailRow } from '@/components/bitcode/pipeline/BitcodeDetailRowList/BitcodeDetailRowList';
import BitcodeMetricGrid, { type BitcodeMetric } from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';

interface BitcodeDetailPanelProps {
  badge: string;
  title: string;
  summary: string;
  metrics: BitcodeMetric[];
  rows: BitcodeDetailRow[];
  className?: string;
  tagLabel?: string;
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionTone?: 'primary' | 'neutral';
}

export default function BitcodeDetailPanel({
  badge,
  title,
  summary,
  metrics,
  rows,
  className,
  tagLabel = 'detail',
  children,
  actionLabel,
  onAction,
  actionTone = 'primary',
}: BitcodeDetailPanelProps) {
  const actionClassName =
    actionTone === 'primary'
      ? ' border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15'
      : ' border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:border-white/18 hover:bg-white/10';

  return (
    <article className={` border border-white/8 bg-black/20 px-5 py-5 ${className || ''}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">{badge}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="select-none bg-white/[0.04] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-400">
          {tagLabel}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-300">{summary}</p>

      <BitcodeMetricGrid
        metrics={metrics}
        className="mt-4"
        columnsClassName="sm:grid-cols-2"
        itemClassName=" border border-white/8 bg-white/5 px-4 py-4"
        labelClassName="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500"
        valueClassName="text-sm font-semibold text-white"
      />

      {rows.length ? (
        <div className="mt-4 border border-white/8 bg-white/5 px-4 py-4">
          <BitcodeDetailRowList rows={rows} />
        </div>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}

      {actionLabel && onAction ? (
        <div className="mt-4">
          <button type="button" onClick={onAction} className={actionClassName}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </article>
  );
}
