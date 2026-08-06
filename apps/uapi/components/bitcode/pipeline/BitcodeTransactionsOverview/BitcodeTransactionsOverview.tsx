'use client';

/**
 * Table overview: data chips (Activity / Own visible / Visible tokens) on their
 * own row, state pills on a second row.
 *
 * Law: chip-row y-geometry is fixed from first paint. Shells + labels always
 * mount; only values crossfade (opacity) when statsReady. Never remount the
 * row, never y-translate, never wrap — so filters/table below never shift.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import {
  getTransactionDataModeDescription,
  getTransactionDataModeLabel,
} from '@/components/bitcode/pipeline/BitcodeTransactionDataMode/bitcode-transaction-data-mode';
import { TelemetryExplainerTrigger } from '@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger';
import type { TransactionDataMode } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import { productEntranceEase } from '@/components/bitcode/routes/ProductRouteEntrance/ProductRouteEntrance';
import {
  PRODUCT_METRIC_CHIP_ROW_CLASS,
  PRODUCT_METRIC_CHIP_SHELL_CLASS,
} from '@/components/bitcode/routes/ProductChipSkeletonRow/ProductChipSkeletonRow';

interface BitcodeTransactionsOverviewProps {
  recordCount: number;
  ownTransactionCount: number;
  visibleTokenTotal: number;
  selectedTransactionId: string | null;
  dataMode: TransactionDataMode;
  /**
   * When false, value slots pulse inside fixed chip shells.
   * When true, numeric values crossfade in place (opacity only).
   */
  statsReady?: boolean;
}

function shouldReduceMotion(prefersReduced: boolean | null): boolean {
  if (prefersReduced) return true;
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) return true;
  return false;
}

/** Content-sized value next to label (tight shell gap); tabular for stable digits. */
const OVERVIEW_VALUE_CLASS =
  'inline-block max-w-[4rem] truncate text-left leading-none tabular-nums text-neutral-100';

/** Value slot: compact pulse or opacity-only number — sits close to the label. */
function OverviewStatValue({
  ready,
  reduceMotion,
  children,
}: {
  ready: boolean;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  if (!ready) {
    return (
      <span
        className="inline-block h-2.5 w-5 shrink-0 bg-white/[0.12] motion-safe:animate-pulse"
        aria-hidden="true"
      />
    );
  }
  if (reduceMotion) {
    return <span className={OVERVIEW_VALUE_CLASS}>{children}</span>;
  }
  return (
    <motion.span
      className={OVERVIEW_VALUE_CLASS}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42, ease: productEntranceEase }}
      style={{ willChange: 'opacity', backfaceVisibility: 'hidden' }}
    >
      {children}
    </motion.span>
  );
}

export default function BitcodeTransactionsOverview({
  recordCount,
  ownTransactionCount,
  visibleTokenTotal,
  selectedTransactionId,
  dataMode,
  statsReady = true,
}: BitcodeTransactionsOverviewProps) {
  const modeLabel = getTransactionDataModeLabel(dataMode);
  const modeDescription = getTransactionDataModeDescription(dataMode);
  const reduceMotion = shouldReduceMotion(useReducedMotion());

  const tableStatGeneric =
    'Table stats summarize the rows currently visible under the active filters and lens.';
  const tableStateGeneric =
    'Table state pills describe how this table is fed, filtered, and selected right now.';
  const tableTooltipReferences = {
    source: [
      'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsOverview/BitcodeTransactionsOverview.tsx',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
    ],
    canon: ['BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws'],
  };
  const tableStatSections = {
    points: [
      'Sanity-check the filters against the row counts they produce',
      'Gauge the measured size of the work the listed runs performed by token total',
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

  // gap-0.5 from PRODUCT_METRIC_CHIP_SHELL_CLASS keeps label↔value tight.
  const statCardClass = `${PRODUCT_METRIC_CHIP_SHELL_CLASS} border-white/8 bg-white/5 px-2`;
  // min-w-0 + truncate on children — long mode/source labels must not widen the page.
  const pillClass =
    'inline-flex min-w-0 max-w-full cursor-default items-center border border-white/8 bg-white/[0.035] px-2 py-1';
  const statsRowClass = `${PRODUCT_METRIC_CHIP_ROW_CLASS} text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500`;

  const stats = [
    {
      title: 'Activity',
      specific:
        'How many rows the table currently shows after filters — every execution row this account can read for the active lens.',
      value: recordCount,
      display: String(recordCount),
    },
    {
      title: 'Own visible',
      specific:
        'How many of the visible rows are your own transactions — runs where this account is the depositor or reader.',
      value: ownTransactionCount,
      display: String(ownTransactionCount),
    },
    {
      title: 'Visible tokens',
      specific:
        'Total measured tokens across the visible rows — the size of the work the listed runs performed.',
      value: visibleTokenTotal,
      display: visibleTokenTotal.toLocaleString('en-US'),
    },
  ] as const;

  const modeSourceMobile =
    dataMode === 'mock-review'
      ? 'mock'
      : dataMode === 'review-fallback'
        ? 'fallback'
        : 'live history';

  return (
    <div
      className="flex w-full min-w-0 max-w-full flex-col gap-2 overflow-x-hidden"
      data-testid="bitcode-transactions-overview"
    >
      {/*
        Row A — permanent three-chip shells. Labels always present.
        Values pulse until statsReady, then opacity-crossfade. No remount, no y.
      */}
      <div
        className={statsRowClass}
        data-testid={
          statsReady
            ? 'transactions-overview-stats'
            : 'transactions-overview-stats-pending'
        }
        aria-busy={!statsReady}
      >
        {stats.map((stat) => (
          <TelemetryExplainerTrigger
            key={stat.title}
            as="div"
            className={statCardClass}
            explainer={{
              kicker: 'Table stat',
              title: stat.title,
              specific: stat.specific,
              generic: tableStatGeneric,
              ...tableStatSections,
            }}
          >
            <p className="m-0 leading-none text-emerald-300/85">{stat.title}</p>
            <OverviewStatValue ready={statsReady} reduceMotion={reduceMotion}>
              {stat.display}
            </OverviewStatValue>
          </TelemetryExplainerTrigger>
        ))}
      </div>

      {/*
        Row B — 2-col grid on phone (never overflows viewport); free wrap from tablet.
        Mobile labels stay short single-line chips.
      */}
      <div className="grid w-full min-w-0 max-w-full grid-cols-2 gap-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-neutral-500 phone:text-[0.62rem] phone:tracking-[0.14em] tablet:flex tablet:flex-wrap tablet:tracking-[0.16em]">
        <TelemetryExplainerTrigger
          className="min-w-0 max-w-full"
          explainer={{
            kicker: 'Table state',
            title: 'Selection',
            specific:
              'Whether a row is currently selected. Selecting a row opens its detail in place of the table; Back returns here.',
            generic: tableStateGeneric,
            ...tableStateSections,
          }}
        >
          <span className={`${pillClass} w-full`}>
            <span className="truncate">
              <span className="tablet:hidden">
                {selectedTransactionId ? 'selected' : 'none'}
              </span>
              <span className="hidden tablet:inline">
                selected {selectedTransactionId ? 'activity active' : 'none'}
              </span>
            </span>
          </span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          className="min-w-0 max-w-full"
          explainer={{
            kicker: 'Table state',
            title: `Mode ${modeLabel}`,
            specific: modeDescription,
            generic: tableStateGeneric,
            ...tableStateSections,
          }}
        >
          <span className={`${pillClass} w-full`} title={`mode ${modeLabel}`}>
            <span className="truncate">mode {modeLabel}</span>
          </span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          className="min-w-0 max-w-full"
          explainer={{
            kicker: 'Table state',
            title: 'Data source',
            specific:
              'Where the rows come from in the current mode — live rows read the executions history feed; mock rows are review fixtures.',
            generic: tableStateGeneric,
            ...tableStateSections,
          }}
        >
          <span className={`${pillClass} w-full`} title={modeDescription}>
            <span className="truncate tablet:hidden">{modeSourceMobile}</span>
            <span className="hidden truncate tablet:inline">{modeDescription}</span>
          </span>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          className="min-w-0 max-w-full"
          explainer={{
            kicker: 'Table state',
            title: 'Search coverage',
            specific:
              'The free-text search filter matches run ids, repositories, branches, participants, proof posture, and run summaries.',
            generic: tableStateGeneric,
            ...tableStateSections,
          }}
        >
          <span
            className={`${pillClass} w-full`}
            title="search spans ids, repos, branches, participants, proof posture, and summaries"
          >
            <span className="truncate tablet:hidden">search ids…</span>
            <span className="hidden truncate tablet:inline">
              search spans ids, repos, branches, participants, proof posture, and
              summaries
            </span>
          </span>
        </TelemetryExplainerTrigger>
      </div>
    </div>
  );
}
