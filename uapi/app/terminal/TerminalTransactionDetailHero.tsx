'use client';

import React from 'react';

import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';

interface TerminalTransactionDetailHeroProps {
  title: string;
  summary: string;
  proofPosture: string;
  modeLabel: string;
  metrics: Array<{ label: string; value: string }>;
  routeHref?: string;
  exchangeHref?: string;
  activeSectionLabel?: string;
  activeSectionAvailability?: string;
  postureChips?: string[];
  surface?: 'terminal' | 'exchange';
  titleId?: string;
}

export default function TerminalTransactionDetailHero({
  title,
  summary,
  proofPosture,
  modeLabel,
  metrics,
  routeHref,
  exchangeHref,
  activeSectionLabel,
  activeSectionAvailability,
  postureChips = [],
  surface = 'terminal',
  titleId,
}: TerminalTransactionDetailHeroProps) {
  const kicker =
    surface === 'exchange' ? 'Exchange selected activity detail' : 'Bitcode Terminal activity result';

  return (
    <article
      data-testid="terminal-selected-activity-hero"
      className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-300/75">{kicker}</p>
          <h3 id={titleId} className="mt-2 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">{summary}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
          {modeLabel}
        </span>
      </div>

      <BitcodeMetricGrid
        metrics={metrics}
        className="mt-5"
        columnsClassName="sm:grid-cols-2 xl:grid-cols-4"
        itemClassName="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4"
        labelClassName="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500"
        valueClassName="text-sm font-semibold text-white"
      />

      <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4 text-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-neutral-500">Activity posture</p>
            <p className="mt-2 text-neutral-100">{proofPosture}</p>
          </div>
          {activeSectionLabel ? (
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-neutral-300">
              {activeSectionLabel}
              {activeSectionAvailability ? ` / ${activeSectionAvailability}` : ''}
            </div>
          ) : null}
        </div>
        {postureChips.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {postureChips.slice(0, 5).map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-neutral-300"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        {routeHref ? (
          <p className="mt-3 break-all rounded-[0.9rem] border border-white/8 bg-black/25 px-3 py-2 font-mono text-[0.72rem] text-neutral-300">
            {routeHref}
          </p>
        ) : null}
        {surface === 'terminal' && exchangeHref ? (
          <a
            href={exchangeHref}
            className="mt-3 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15"
          >
            Open in Exchange
          </a>
        ) : null}
        {surface === 'exchange' && routeHref ? (
          <a
            href={routeHref}
            className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
          >
            Return to Terminal
          </a>
        ) : null}
      </div>
    </article>
  );
}
