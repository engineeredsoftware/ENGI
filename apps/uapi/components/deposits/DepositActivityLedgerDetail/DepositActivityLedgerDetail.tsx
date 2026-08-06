'use client';

/**
 * Activity-ledger detail panel for non-pipeline deposit bookmarks
 * (Obfuscations anchors, repository anchors).
 */

import React from "react";

export type DepositActivityLedgerDetailProps = {
  runId: string;
  title: string;
  summary?: string | null;
  description?: string;
};

export function DepositActivityLedgerDetail({
  runId,
  title,
  summary = null,
  description = "This row is a saved configuration bookmark, not a pipeline run. Pipeline telemetry (phases, agents, generations) only appears for Asset Pack Synthesis executions. Use Load anchor on a New deposit to apply this configuration, or Back to return to the pipelines table.",
}: DepositActivityLedgerDetailProps) {
  return (
    <section
      className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Activity ledger record"
      data-testid="deposit-activity-ledger-detail"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
        Activity ledger
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
        {description}
      </p>
      {summary ? (
        <p
          className="mt-4 border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-200"
          data-testid="deposit-activity-ledger-summary"
        >
          {summary}
        </p>
      ) : null}
      <p className="mt-3 font-mono text-[0.62rem] text-neutral-500">{runId}</p>
    </section>
  );
}
