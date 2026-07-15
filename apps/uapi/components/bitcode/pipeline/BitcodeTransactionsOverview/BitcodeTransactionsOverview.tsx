'use client';

import React from 'react';

import {
  getTransactionDataModeDescription,
  getTransactionDataModeLabel,
} from '@/components/bitcode/pipeline/BitcodeTransactionDataMode/bitcode-transaction-data-mode';
import { TelemetryExplainerTrigger } from '@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger';
import type { TransactionDataMode } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

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

  // Section (b) generic copy for the overview's rich tooltips.
  const tableStatGeneric =
    'Table stats summarize the rows currently visible under the active filters and lens.';
  const tableStateGeneric =
    'Table state pills describe how this table is fed, filtered, and selected right now.';
  const tableTooltipReferences = {
    source: [
      'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsOverview.tsx',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
    ],
    canon: ['BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws'],
  };
  const tableStatSections = {
    points: [
      'Sanity-check the filters against the row counts they produce',
      'Gauge the measured size of the visible work by token total',
    ],
    references: tableTooltipReferences,
  };
  const tableStateSections = {
    points: [
      'Confirm which feed and mode the rows come from',
      'Know what the free-text search actually matches',
    ],
    references: tableTooltipReferences,
  };

  const statCardClass =
    'flex items-baseline gap-2 border border-white/8 bg-white/5 px-2.5 py-1';
  const pillClass =
    'cursor-default border border-white/8 bg-white/[0.035] px-2.5 py-1';

  return (
    // ONE wrapping row: stat chips + state pills, rendered above the table.
    <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Activity',
            specific:
              'How many rows the table currently shows after filters — every execution row this account can read for the active lens.',
            generic: tableStatGeneric,
            ...tableStatSections,
          }}
        >
          <p className="text-emerald-300/85">Activity</p>
          <p className="text-neutral-100">{recordCount}</p>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Own visible',
            specific:
              'How many of the visible rows are your own transactions — runs where this account is the depositor or reader.',
            generic: tableStatGeneric,
            ...tableStatSections,
          }}
        >
          <p className="text-emerald-300/85">Own visible</p>
          <p className="text-neutral-100">{ownTransactionCount}</p>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className={statCardClass}
          explainer={{
            kicker: 'Table stat',
            title: 'Visible tokens',
            specific:
              'Total measured tokens across the visible rows — the size of the work the listed runs performed.',
            generic: tableStatGeneric,
            ...tableStatSections,
          }}
        >
          <p className="text-emerald-300/85">Visible tokens</p>
          <p className="text-neutral-100">{visibleTokenTotal.toLocaleString('en-US')}</p>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          explainer={{
            kicker: 'Table state',
            title: 'Selection',
            specific:
              'Whether a row is currently selected. Selecting a row opens its detail in place of the table; Back returns here.',
            generic: tableStateGeneric,
            ...tableStateSections,
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
            generic: tableStateGeneric,
            ...tableStateSections,
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
            generic: tableStateGeneric,
            ...tableStateSections,
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
            generic: tableStateGeneric,
            ...tableStateSections,
          }}
        >
          <span className={pillClass}>
            search spans ids, repos, branches, participants, proof posture, and summaries
          </span>
        </TelemetryExplainerTrigger>
    </div>
  );
}
