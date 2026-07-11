'use client';

import React from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  getTransactionDataModeLabel,
  isMockTransactionDataMode,
} from '@/components/bitcode/pipeline/bitcode-transaction-data-mode';
import BitcodeDetailPanel from '@/components/bitcode/pipeline/BitcodeDetailPanel';
import type {
  TransactionDataMode,
  TransactionFilters,
  TransactionPagination,
} from '@/components/bitcode/pipeline/bitcode-transaction-types';
import type { ShippablesDoc } from '@/components/bitcode/pipeline/ShippablesDocPanel';
import type { BitcodeDetailRow } from '@/components/bitcode/pipeline/BitcodeDetailRowList';
import type { BitcodeMetric } from '@/components/bitcode/pipeline/BitcodeMetricGrid';

import TerminalTransactionDetailSurface from './TerminalTransactionDetailSurface';
import type { TerminalActivityRecordDraft } from './terminal-activity-history';
import TerminalTransactionsTable from './TerminalTransactionsTable';
import type { TerminalTransactionDetailSection } from './terminal-transaction-query';
import {
  buildTerminalRunDetailFromSelectedRun,
  normalizeTerminalRunDetailPayload,
  type TerminalRunDetailSnapshot,
} from './terminal-transaction-detail-snapshot';
import { ACTIVITY_DETAIL_SECTIONS } from './terminal-experience-architecture';
import { TERMINAL_SURFACE_COPY } from './terminal-workspace-copy';
import { MOCK_RUN_ASSET_PACK_SURFACES, type WorkspaceRun } from './terminal-run-data';
import { jumpToShellSection } from './terminal-shell-reading';

function formatRunTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getRunStatusTone(status?: string | null) {
  if (status === 'completed') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'error' || status === 'failed') return 'border-red-500/30 bg-red-500/10 text-red-200';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
}

function formatNumber(value?: number | null, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return new Intl.NumberFormat('en-US', options).format(value);
}

function formatUsd(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function countShippableSurfaces(shippables?: ShippablesDoc | null) {
  if (!shippables) return 0;

  let count = 0;
  if (shippables.pullRequest) count += 1;

  return count;
}

type TerminalActivitySubstructure = (typeof ACTIVITY_DETAIL_SECTIONS)[number] & {
  summary: string;
  metrics: BitcodeMetric[];
  rows: BitcodeDetailRow[];
};

const ACTIVITY_ACTION_LABELS: Partial<Record<TerminalActivitySubstructure['id'], string>> = {
  shippables: 'Show outputs',
  proofs: 'Show proofs',
  history: 'Show history',
  journal: 'Show journal',
};

const ACTIVITY_DETAIL_SECTION_BY_SUBSTRUCTURE: Partial<
  Record<TerminalActivitySubstructure['id'], TerminalTransactionDetailSection>
> = {
  shippables: 'shippables',
  proofs: 'proofs',
  history: 'history',
  journal: 'journal',
};

function buildActivitySubstructures(
  selectedRun: WorkspaceRun,
  detail: TerminalRunDetailSnapshot | null,
): TerminalActivitySubstructure[] {
  const writtenAssets = detail?.writtenAssets || null;
  const deliveryMechanism = detail?.shippables || detail?.deliveryMechanism || null;
  const mergedAssetPackSurface = {
    pullRequest: deliveryMechanism?.pullRequest ?? null,
    fileChanges: writtenAssets?.fileChanges ?? null,
    summary: writtenAssets?.summary ?? deliveryMechanism?.summary ?? null,
  };
  const attachedAssetPackSurfaceCount =
    countShippableSurfaces(deliveryMechanism) + (writtenAssets ? 1 : 0);

  return ACTIVITY_DETAIL_SECTIONS.map((substructure) => {
    if (substructure.id === 'transactions') {
      return {
        ...substructure,
        summary:
          detail?.summary ||
          selectedRun.summary ||
          'This selected Bitcode activity is the active Terminal result, scoped to the Deposit, Read, proof, and closure work performed here.',
        metrics: [
          { label: 'Status', value: selectedRun.status || 'running' },
          { label: 'Started', value: formatRunTimestamp(selectedRun.created_at) },
        ],
        rows: [
          { label: 'Activity id', value: selectedRun.id },
          ...(selectedRun.repository ? [{ label: 'Repository', value: selectedRun.repository }] : []),
          ...(selectedRun.branch ? [{ label: 'Branch', value: selectedRun.branch }] : []),
        ],
      };
    }

    if (substructure.id === 'shippables') {
      return {
        ...substructure,
        summary:
          mergedAssetPackSurface.summary ||
          'Finish-delivered outputs and AssetPack evidence stay inside the selected Bitcode activity context so you can inspect Terminal results without leaving this workflow.',
        metrics: [
          { label: 'Attached surfaces', value: formatNumber(attachedAssetPackSurfaceCount) },
          { label: 'Closure focus', value: detail?.closureFocus || selectedRun.closureFocus || 'materialized output' },
        ],
        rows: [
          ...(mergedAssetPackSurface.pullRequest
            ? [{ label: 'Pull request', value: `#${mergedAssetPackSurface.pullRequest.number}` }]
            : []),
        ],
      };
    }

    if (substructure.id === 'proofs') {
      return {
        ...substructure,
        summary:
          detail?.proofStatus ||
          selectedRun.proofStatus ||
          'Verification, settlement, and bounded proof remain explicit closure stages of the selected Bitcode activity.',
        metrics: [
          { label: 'Proof posture', value: detail?.proofStatus || selectedRun.proofStatus || 'in flight' },
          { label: 'Tokens', value: formatNumber(detail?.processingStats.tokenTotal ?? selectedRun.tokenTotal) },
        ],
        rows: [
          { label: 'Closure focus', value: detail?.closureFocus || selectedRun.closureFocus || 'proof-bearing closure' },
          {
            label: 'Latency',
            value:
              detail?.processingStats.averageLatencyMs ?? selectedRun.averageLatencyMs
                ? `${formatNumber(detail?.processingStats.averageLatencyMs ?? selectedRun.averageLatencyMs)} ms`
                : 'n/a',
          },
          { label: 'BTC fee basis', value: formatUsd(detail?.processingStats.btcFeeUsdEquivalent ?? selectedRun.btcFeeUsdEquivalent) },
        ],
      };
    }

    if (substructure.id === 'journal') {
      return {
        ...substructure,
        summary:
          'Terminal journal reconciliation separates observed ledger facts, projected database facts, canonical roots, repair receipts, and blocking drift reasons for the selected activity.',
        metrics: [
          { label: 'State', value: detail?.ledgerSettlement?.status || 'pending' },
          { label: 'Journal rows', value: formatNumber(detail?.terminalJournal?.entries.length || 0) },
        ],
        rows: [
          { label: 'AssetPack id', value: detail?.ledgerSettlement?.assetPackId || 'n/a' },
          { label: 'Ledger anchor', value: detail?.ledgerSettlement?.ledgerAnchorId || 'n/a' },
          { label: 'BTC fee receipt', value: detail?.ledgerSettlement?.btcFeeReceiptId || 'n/a' },
        ],
      };
    }

    return {
      ...substructure,
      summary:
        'Activity history, ledger reading, and processing posture remain part of the same Terminal activity result.',
      metrics: [
        { label: 'History items', value: formatNumber(detail?.historyItemCount ?? selectedRun.itemCount) },
        {
          label: 'Measured $BTD',
          value: formatNumber(detail?.processingStats.measuredBtd ?? selectedRun.measuredBtd, { maximumFractionDigits: 1 }),
        },
      ],
      rows: [
        ...(detail?.repoSnapshot
          ? [{ label: 'Repository', value: `${detail.repoSnapshot.org}/${detail.repoSnapshot.repo}` }]
          : selectedRun.repository
            ? [{ label: 'Repository', value: selectedRun.repository }]
            : []),
        ...(detail?.repoSnapshot?.branch
          ? [{ label: 'Branch', value: detail.repoSnapshot.branch }]
          : selectedRun.branch
            ? [{ label: 'Branch', value: selectedRun.branch }]
            : []),
        { label: 'Started', value: formatRunTimestamp(selectedRun.created_at) },
      ],
    };
  });
}

interface TerminalTransactionWorkspaceProps {
  runs: WorkspaceRun[];
  selectedRun: WorkspaceRun | null;
  routeSearchParams: URLSearchParams;
  filters: TransactionFilters;
  onFiltersChange: (nextFilters: TransactionFilters) => void;
  onResetFilters: () => void;
  pagination: TransactionPagination;
  onPaginationChange: (nextPagination: TransactionPagination) => void;
  detailSection: TerminalTransactionDetailSection;
  onDetailSectionChange: (detailSection: TerminalTransactionDetailSection) => void;
  isLoadingRuns: boolean;
  runsError: string | null;
  transactionDataMode: TransactionDataMode;
  onSelectTransaction: (transactionId: string) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  surface?: 'terminal' | 'exchange';
}

export default function TerminalTransactionWorkspace({
  runs,
  selectedRun,
  routeSearchParams,
  filters,
  onFiltersChange,
  onResetFilters,
  pagination,
  onPaginationChange,
  detailSection,
  onDetailSectionChange,
  isLoadingRuns,
  runsError,
  transactionDataMode,
  onSelectTransaction,
  onRecordActivity,
  surface = 'terminal',
}: TerminalTransactionWorkspaceProps) {
  const isExchangeSurface = surface === 'exchange';
  const surfaceKicker = isExchangeSurface ? 'Bitcode Exchange' : 'Bitcode Terminal';
  const surfaceTitle = isExchangeSurface
    ? 'Activity search, master table, and selected detail'
    : 'Recent Terminal activity and selected result';
  const surfaceSummary = isExchangeSurface
    ? 'Search Exchange activity across the market or your own rows, select from the master table, and inspect AssetPack evidence, proof posture, history, and execution detail from the Exchange state layer.'
    : 'Terminal keeps recent Deposit, Read, proof, and closure activity near the top of the workflow. Select a row to read the result here, then use the Deposit and Read workspace below for the next write.';
  const loadingLabel = isExchangeSurface ? 'Loading Bitcode Exchange…' : 'Loading Bitcode Terminal…';
  const selectedActivityReadLabel = isExchangeSurface
    ? 'selected Bitcode activity detail'
    : 'selected Terminal activity result';
  const mockAssetPackSurface = selectedRun ? MOCK_RUN_ASSET_PACK_SURFACES[selectedRun.id] : null;
  const usesMockTransactions = isMockTransactionDataMode(transactionDataMode);
  const [runDetail, setRunDetail] = useState<TerminalRunDetailSnapshot | null>(null);
  const [isLoadingRunDetail, setIsLoadingRunDetail] = useState(false);
  const [runDetailError, setRunDetailError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    if (!selectedRun) {
      setRunDetail(null);
      setIsLoadingRunDetail(false);
      setRunDetailError(null);
      return () => {
        disposed = true;
      };
    }

    const fallbackDetail = buildTerminalRunDetailFromSelectedRun(selectedRun, mockAssetPackSurface);
    setRunDetail(fallbackDetail);
    setRunDetailError(null);

    if (usesMockTransactions || selectedRun.sourceModel === 'protocol-projection') {
      setIsLoadingRunDetail(false);
      setRunDetailError(null);
      return () => {
        disposed = true;
      };
    }

    setIsLoadingRunDetail(true);

    fetch(`/api/executions/history/${selectedRun.id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${selectedActivityReadLabel} (${response.status})`);
        }
        return response.json();
      })
      .then((payload) => {
        if (disposed) return;
        setRunDetail(normalizeTerminalRunDetailPayload(payload, selectedRun, mockAssetPackSurface));
      })
      .catch((error) => {
        if (disposed) return;
        setRunDetail(fallbackDetail);
        setRunDetailError(
          error instanceof Error
            ? `${error.message}. Falling back to the activity summary while live detail stays unavailable.`
            : `Unable to load live ${selectedActivityReadLabel}. Falling back to the activity summary.`,
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingRunDetail(false);
      });

    return () => {
      disposed = true;
    };
  }, [mockAssetPackSurface, selectedActivityReadLabel, selectedRun, usesMockTransactions]);

  const activitySubstructures = useMemo(
    () => (selectedRun ? buildActivitySubstructures(selectedRun, runDetail) : []),
    [runDetail, selectedRun],
  );
  const handleActivitySubstructureAction = (substructure: TerminalActivitySubstructure) => {
    const nextDetailSection = ACTIVITY_DETAIL_SECTION_BY_SUBSTRUCTURE[substructure.id];
    if (nextDetailSection) {
      onDetailSectionChange(nextDetailSection);
    }
    window.setTimeout(() => jumpToShellSection(substructure.targetId), 40);
  };
  const activityTable = selectedRun ? (
    <TerminalTransactionsTable
      runs={runs}
      selectedTransactionId={selectedRun.id}
      onSelectTransaction={onSelectTransaction}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onResetFilters={onResetFilters}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      isLoadingRuns={isLoadingRuns}
      runsError={runsError}
      transactionDataMode={transactionDataMode}
      surface={surface}
    />
  ) : null;
  const selectedDetailSurface = selectedRun ? (
    <TerminalTransactionDetailSurface
      selectedRun={selectedRun}
      detail={runDetail}
      isLoadingDetail={isLoadingRunDetail}
      detailError={runDetailError}
      transactionDataMode={transactionDataMode}
      detailSection={detailSection}
      onDetailSectionChange={onDetailSectionChange}
      routeSearchParams={routeSearchParams}
      onRecordActivity={onRecordActivity}
      surface={surface}
    />
  ) : null;

  return (
    <section
      id="terminalTransactionWorkspace"
      data-testid="terminal-transaction-workspace"
      aria-labelledby="terminalTransactionWorkspaceTitle"
      aria-describedby="terminalTransactionWorkspaceSummary"
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,10,20,0.96),rgba(4,8,16,0.94))] shadow-[0_32px_110px_rgba(0,0,0,0.48)]"
    >
      <div className="border-b border-white/8 px-6 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-neutral-400">{surfaceKicker}</p>
            <h2 id="terminalTransactionWorkspaceTitle" className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {surfaceTitle}
            </h2>
            <p id="terminalTransactionWorkspaceSummary" className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
              {surfaceSummary}
            </p>
          </div>
          {selectedRun ? (
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.22em] ${getRunStatusTone(selectedRun.status)}`}
              >
                {selectedRun.status || 'running'}
              </span>
              <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.22em] text-neutral-200">
                {getTransactionDataModeLabel(transactionDataMode)}
              </span>
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-200">
                Result active
              </span>
            </div>
          ) : null}
        </div>
        <p
          data-testid="terminal-transaction-status-strip"
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          {isLoadingRuns
            ? loadingLabel
            : runsError
              ? `Terminal activity failed: ${runsError}`
              : selectedRun
                ? `Selected activity ${selectedRun.id} is active in ${getTransactionDataModeLabel(transactionDataMode)}.`
                : 'No Terminal activity is selected.'}
        </p>
      </div>

      <div className="px-6 py-6">
        {isLoadingRuns ? (
          <div
            data-testid="terminal-workspace-loading-state"
            role="status"
            aria-live="polite"
            className="rounded-[1.5rem] border border-white/6 bg-black/20 px-5 py-10 text-sm text-neutral-400"
          >
            {loadingLabel}
          </div>
        ) : runsError ? (
          <div
            data-testid="terminal-workspace-error-state"
            role="alert"
            className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-5 text-sm text-red-200"
          >
            {runsError}
          </div>
        ) : !selectedRun ? (
          <div
            data-testid="terminal-workspace-empty-state"
            role="status"
            className="rounded-[1.5rem] border border-white/6 bg-black/20 px-5 py-10 text-sm text-neutral-400"
          >
            {TERMINAL_SURFACE_COPY.detail.emptySelection}
          </div>
        ) : (
          <div className="space-y-6">
            {isExchangeSurface ? (
              <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(30rem,0.82fr)]">
                <div className="min-w-0">{activityTable}</div>
                <aside className="min-w-0 2xl:sticky 2xl:top-28" aria-label="Selected Exchange activity detail">
                  {selectedDetailSurface}
                </aside>
              </div>
            ) : (
              <>
                {activityTable}

                <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-5 py-5">
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Selected result digest</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">Read the current Terminal activity before continuing work</h3>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-neutral-300">
                      These cards summarize the selected row and open exact result sections. Static values stay quiet;
                      explicit buttons change focus.
                    </p>
                  </div>
                  <div className="mt-5 grid gap-4 2xl:grid-cols-4">
                    {activitySubstructures.map((substructure) => {
                      const actionLabel = ACTIVITY_ACTION_LABELS[substructure.id];

                      return (
                        <BitcodeDetailPanel
                          key={substructure.id}
                          badge={substructure.id === 'transactions' ? 'recent activity' : substructure.badge}
                          title={substructure.label}
                          summary={substructure.summary}
                          metrics={substructure.metrics}
                          rows={substructure.rows}
                          tagLabel="Terminal result"
                          actionLabel={actionLabel}
                          onAction={actionLabel ? () => handleActivitySubstructureAction(substructure) : undefined}
                        />
                      );
                    })}
                  </div>
                </section>

                {selectedDetailSurface}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
