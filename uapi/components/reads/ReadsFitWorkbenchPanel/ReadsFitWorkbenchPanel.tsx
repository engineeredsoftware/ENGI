/**
 * Asset-pack fit posture panel: metrics, rows, and record-fit actions.
 */

'use client';

import React from 'react';

import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';

export type ReadsFitWorkbenchPanelProps = {
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  rows: Array<{ label: string; value: string }>;
  recordingKey: 'deposit' | 'read' | 'read-admission' | 'fit' | null;
  readFitsFindingProgress: string;
  fitResultActionLabel: string;
  onRecordFit: () => void;
};

export default function ReadsFitWorkbenchPanel({
  summary,
  metrics,
  rows,
  recordingKey,
  readFitsFindingProgress,
  fitResultActionLabel,
  onRecordFit,
}: ReadsFitWorkbenchPanelProps) {
  return (
    <article
      id="terminalFitWorkbench"
      className="mt-5 rounded-[1.6rem] border border-amber-400/18 bg-amber-400/5 px-5 py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-amber-200/80">fit</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Asset-pack fit and settlement intent</h3>
        </div>
        <button
          type="button"
          onClick={() => jumpToShellSection('terminalFitWorkbench')}
          className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15"
        >
          Focus asset-pack fit
        </button>
        <button
          type="button"
          disabled={recordingKey !== null || readFitsFindingProgress === 'fit-recorded'}
          onClick={onRecordFit}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fitResultActionLabel}
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-300">{summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={`fit-${metric.label}`} className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-base font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid gap-3 lg:grid-cols-2">
        {rows.map((row) => (
          <div
            key={`fit-${row.label}`}
            className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-4 text-sm"
          >
            <dt className="text-neutral-500">{row.label}</dt>
            <dd className="mt-1 break-words text-neutral-100">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
