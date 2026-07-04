'use client';

import React from 'react';

import {
  getTransactionDataModeDescription,
  getTransactionDataModeLabel,
} from './bitcode-transaction-data-mode';
import { TelemetryExplainerTrigger } from './TelemetryExplainerTrigger';
import type { TransactionDataMode } from './bitcode-transaction-types';

interface BitcodeTransactionsOverviewProps {
  recordCount: number;
  ownTransactionCount: number;
  visibleTokenTotal: number;
  selectedTransactionId: string | null;
  dataMode: TransactionDataMode;
}

export default function BitcodeTransactionsOverview({
  recordCount,
  ownTransactionCount,
  visibleTokenTotal,
  selectedTransactionId,
  dataMode,
}: BitcodeTransactionsOverviewProps) {
  const modeLabel = getTransactionDataModeLabel(dataMode);
  const modeDescription = getTransactionDataModeDescription(dataMode);

  const statCardClass = 'rounded-xl border border-white/8 bg-white/5 px-3 py-2.5';
  const pillClass =
    'cursor-default rounded-[0.65rem] border border-white/8 bg-white/[0.035] px-2.5 py-1';

  return (
    <>
      <div className="grid gap-2 text-xs uppercase tracking-[0.18em] text-neutral-400 tablet:grid-cols-3">
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Activity',
            specific:
              'How many rows the table currently shows after filters — every execution row this account can read for the active lens.',
          }}
        >
          <p className="text-emerald-300/85">Activity</p>
          <p className="mt-1.5 text-neutral-100">{recordCount}</p>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Own visible',
            specific:
              'How many of the visible rows are your own transactions — runs where this account is the depositor or reader.',
          }}
        >
          <p className="text-emerald-300/85">Own visible</p>
          <p className="mt-1.5 text-neutral-100">{ownTransactionCount}</p>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Visible tokens',
            specific:
              'Total measured tokens across the visible rows — the size of the work the listed runs performed.',
          }}
        >
          <p className="text-emerald-300/85">Visible tokens</p>
          <p className="mt-1.5 text-neutral-100">{visibleTokenTotal.toLocaleString('en-US')}</p>
        </TelemetryExplainerTrigger>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
        <TelemetryExplainerTrigger
          explainer={{
            kicker: 'Table state',
            title: 'Selection',
            specific:
              'Whether a row is currently selected. Selecting a row opens its detail in place of the table; Back returns here.',
          }}
        >
          <span className={pillClass}>
            selected {selectedTransactionId ? 'activity active' : 'none'}
          </span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          explainer={{
            kicker: 'Table state',
            title: `Mode ${modeLabel}`,
            specific: modeDescription,
          }}
        >
          <span className={pillClass}>mode {modeLabel}</span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          explainer={{
            kicker: 'Table state',
            title: 'Data source',
            specific:
              'Where the rows come from in the current mode — live rows read the executions history feed; mock rows are review fixtures.',
          }}
        >
          <span className={pillClass}>{modeDescription}</span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          explainer={{
            kicker: 'Table state',
            title: 'Search coverage',
            specific:
              'The free-text search filter matches run ids, repositories, branches, participants, proof posture, and run summaries.',
          }}
        >
          <span className={pillClass}>
            search spans ids, repos, branches, participants, proof posture, and summaries
          </span>
        </TelemetryExplainerTrigger>
      </div>
    </>
  );
}
