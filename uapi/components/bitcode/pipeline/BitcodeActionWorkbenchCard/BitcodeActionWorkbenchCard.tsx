'use client';

/**
 * Shared action workbench card chrome.
 * Relocated from TerminalActionWorkbenchCard.
 */


import React from 'react';

import BitcodeChipCloud from '@/components/bitcode/pipeline/BitcodeChipCloud/BitcodeChipCloud';
import BitcodeDetailRowList from '@/components/bitcode/pipeline/BitcodeDetailRowList/BitcodeDetailRowList';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';
import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper';

import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';

interface BitcodeActionWorkbenchCardProps {
  id?: string;
  badge: string;
  title: string;
  summary: string;
  metrics: { label: string; value: string }[];
  rows: { label: string; value: string }[];
  chips?: string[];
  actionLabel: string;
  actionTarget: string;
  secondaryActionLabel?: string;
  secondaryActionDisabled?: boolean;
  onSecondaryAction?: () => void;
}

export default function BitcodeActionWorkbenchCard({
  id,
  badge,
  title,
  summary,
  metrics,
  rows,
  chips,
  actionLabel,
  actionTarget,
  secondaryActionLabel,
  secondaryActionDisabled = false,
  onSecondaryAction,
}: BitcodeActionWorkbenchCardProps) {
  const secondaryAction = secondaryActionLabel && onSecondaryAction ? (
    <button
      type="button"
      disabled={secondaryActionDisabled}
      onClick={onSecondaryAction}
      className="rounded-none border border-white/10 bg-white/5 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {secondaryActionLabel}
    </button>
  ) : null;

  return (
    <article id={id} className="rounded-none border border-white/8 bg-black/20 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">{badge}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {secondaryAction && secondaryActionDisabled ? (
            <DisabledTooltipWrapper
              tooltip="Disabled while another Terminal write is in progress. When enabled, this records the current posture into the Bitcode activity ledger."
              placement="top"
            >
              {secondaryAction}
            </DisabledTooltipWrapper>
          ) : secondaryAction}
          <button
            type="button"
            onClick={() => jumpToShellSection(actionTarget)}
            className="rounded-none border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-300">{summary}</p>

      <BitcodeMetricGrid
        metrics={metrics}
        className="mt-5"
        columnsClassName="sm:grid-cols-2"
        itemClassName="rounded-none border border-white/8 bg-white/5 px-4 py-4"
        labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500"
        valueClassName="text-base font-semibold text-white"
      />

      <div className="mt-4 rounded-none border border-white/8 bg-white/5 px-4 py-4 text-sm">
        <BitcodeDetailRowList rows={rows} />
      </div>

      {chips?.length ? (
        <BitcodeChipCloud
          chips={chips}
          className="mt-4"
          chipClassName="rounded-none border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-200"
        />
      ) : null}
    </article>
  );
}

/** @deprecated Prefer BitcodeActionWorkbenchCard */
export { BitcodeActionWorkbenchCard as TerminalActionWorkbenchCard };
