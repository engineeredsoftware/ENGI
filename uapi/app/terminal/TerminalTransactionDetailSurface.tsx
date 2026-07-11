'use client';

import { useEffect, useMemo, useState } from 'react';

import { formatAgenticExecutionLabel } from '@bitcode/api/src/executions/agentic-execution';
import { ExecutionDetailsView } from '@/app/executions/components/ExecutionsDetailsView';
import {
  getTransactionDataModeLabel,
  isMockTransactionDataMode,
} from '@/components/bitcode/pipeline/bitcode-transaction-data-mode';
import ShippablesCardsPanel from '@/components/bitcode/pipeline/ShippablesCardsPanel';
import ShippablesDocPanel from '@/components/bitcode/pipeline/ShippablesDocPanel';
import type { TransactionDataMode } from '@/components/bitcode/pipeline/bitcode-transaction-types';

import TerminalTransactionDetailActionBar from './TerminalTransactionDetailActionBar';
import TerminalTransactionActivitySurface from './TerminalTransactionActivitySurface';
import type { TerminalTransactionDetailSection } from './terminal-transaction-query';
import type { TerminalRunDetailSnapshot } from './terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from './terminal-run-data';
import TerminalTransactionClosureCard from './TerminalTransactionClosureCard';
import TerminalTransactionDetailHero from './TerminalTransactionDetailHero';
import TerminalTransactionHistoryCard from './TerminalTransactionHistoryCard';
import TerminalTransactionIdentityCard from './TerminalTransactionIdentityCard';
import TerminalTransactionJournalReconciliationCard from './TerminalTransactionJournalReconciliationCard';
import TerminalTransactionOrganizationAuthorityCard from './TerminalTransactionOrganizationAuthorityCard';
import TerminalTransactionProofsCard from './TerminalTransactionProofsCard';
import TerminalTransactionWalletBtcCard from './TerminalTransactionWalletBtcCard';
import {
  buildTerminalClosureAssetPackCompletion,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
} from './terminal-activity-history';
import { normalizeTerminalClosureState } from './terminal-closure-state';
import { buildTerminalJournalReconciliation } from './terminal-journal-reconciliation';
import { buildTerminalOrganizationAuthorityProjection } from './terminal-organization-authority';
import {
  buildTerminalTransactionClosurePayload,
  buildTerminalTransactionClosureFollowThrough,
  buildTerminalTransactionClosureRows,
  buildTerminalTransactionIdentityRows,
} from './terminal-transaction-detail';
import { buildTerminalTransactionReadModel } from './terminal-transaction-read-model';
import { buildTerminalWalletBtcOperationProjection } from './terminal-wallet-btc-operation';
import { jumpToShellSection } from './terminal-shell-reading';
import { useTerminalShellBridge } from './terminal-shell-bridge';

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

interface TerminalTransactionDetailSurfaceProps {
  selectedRun: WorkspaceRun;
  detail: TerminalRunDetailSnapshot | null;
  isLoadingDetail: boolean;
  detailError: string | null;
  transactionDataMode: TransactionDataMode;
  detailSection: TerminalTransactionDetailSection;
  onDetailSectionChange: (detailSection: TerminalTransactionDetailSection) => void;
  routeSearchParams: URLSearchParams;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  surface?: 'terminal' | 'exchange';
}

export default function TerminalTransactionDetailSurface({
  selectedRun,
  detail,
  isLoadingDetail,
  detailError,
  transactionDataMode,
  detailSection,
  onDetailSectionChange,
  routeSearchParams,
  onRecordActivity,
  surface = 'terminal',
}: TerminalTransactionDetailSurfaceProps) {
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { snapshot, runControl, controls } = useTerminalShellBridge();
  const usesMockTransactions = isMockTransactionDataMode(transactionDataMode);
  const showDemonstrationWitness = usesMockTransactions || selectedRun.sourceModel === 'protocol-projection';
  const witnessClosureState = useMemo(
    () => (showDemonstrationWitness ? normalizeTerminalClosureState(snapshot) : null),
    [showDemonstrationWitness, snapshot],
  );
  const closureState = witnessClosureState || detail?.closureState || null;
  const closureFollowThrough = useMemo(
    () =>
      detail?.closureFollowThrough ||
      buildTerminalTransactionClosureFollowThrough(closureState),
    [closureState, detail?.closureFollowThrough],
  );
  const shellReady = Boolean(controls);
  const showShippables = detailSection === 'shippables';
  const showTransaction = detailSection === 'transaction';
  const showWalletBtc = detailSection === 'wallet-btc';
  const showAuthority = detailSection === 'authority';
  const showClosure = detailSection === 'closure';
  const showProofs = detailSection === 'proofs';
  const showHistory = detailSection === 'history';
  const showJournal = detailSection === 'journal';
  const showActivity = detailSection === 'activity';
  const transactionReadModel = useMemo(
    () =>
      buildTerminalTransactionReadModel({
        selectedRun,
        detail,
        detailSection,
        dataMode: transactionDataMode,
        searchParams: routeSearchParams,
    }),
    [detail, detailSection, routeSearchParams, selectedRun, transactionDataMode],
  );
  const showConsole = detailSection === 'console' && transactionReadModel.activeSection.availability !== 'blocked';
  const selectedActivityNoun =
    surface === 'exchange' ? 'selected Bitcode activity detail' : 'selected Terminal activity result';
  const normalizedSummary =
    detail?.summary || `The ${selectedActivityNoun} is loaded.`;
  const sectionSummary = useMemo(() => {
    const activeSectionBlocker = transactionReadModel.activeSection.blocker
      ? ` ${transactionReadModel.activeSection.blocker}`
      : '';
    const activeSectionSummary = `${transactionReadModel.activeSection.summary}${activeSectionBlocker}`;
    return `${normalizedSummary} ${activeSectionSummary}`;
  }, [normalizedSummary, transactionReadModel.activeSection]);
  const transactionPayload = useMemo(
    () => ({
      transaction: {
        id: selectedRun.id,
        type: selectedRun.type || null,
        typeLabel: selectedRun.agentic_execution?.label || formatAgenticExecutionLabel(selectedRun.type),
        status: selectedRun.status || null,
        createdAt: selectedRun.created_at,
        summary: detail?.summary || selectedRun.summary || null,
        participant: selectedRun.participant || null,
        ownership: selectedRun.isOwnTransaction ? 'mine' : 'network',
        actionLens: selectedRun.transactionLens || null,
      },
      repository: detail?.repoSnapshot
        ? {
            org: detail.repoSnapshot.org,
            repo: detail.repoSnapshot.repo,
            branch: detail.repoSnapshot.branch,
            commit: detail.repoSnapshot.commit,
          }
        : selectedRun.repository || null,
      processingStats: detail?.processingStats || null,
      proofStatus: detail?.proofStatus || selectedRun.proofStatus || null,
      closureFocus: detail?.closureFocus || selectedRun.closureFocus || null,
      bitcodeActivityState: detail?.bitcodeActivityState || null,
      historyItemCount: detail?.historyItemCount ?? selectedRun.itemCount ?? 0,
      eventCount: detail?.eventCount ?? 0,
    }),
    [detail, selectedRun],
  );
  const proofsPayload = useMemo(
    () => ({
      proofStatus: detail?.proofStatus || selectedRun.proofStatus || null,
      closureFocus: detail?.closureFocus || selectedRun.closureFocus || null,
      proofFamilies: closureFollowThrough.proofFamilies,
      processingStats: detail?.processingStats || null,
    }),
    [closureFollowThrough.proofFamilies, detail, selectedRun],
  );
  const historyPayload = useMemo(
    () => ({
      historyItemCount: detail?.historyItemCount ?? selectedRun.itemCount ?? 0,
      eventCount: detail?.eventCount ?? 0,
      repository: detail?.repoSnapshot
        ? {
            org: detail.repoSnapshot.org,
            repo: detail.repoSnapshot.repo,
            branch: detail.repoSnapshot.branch,
            commit: detail.repoSnapshot.commit,
          }
        : selectedRun.repository || null,
      recentHistory: closureFollowThrough.recentHistory,
    }),
    [closureFollowThrough.recentHistory, detail, selectedRun],
  );
  const closurePayload = useMemo(
    () => buildTerminalTransactionClosurePayload(selectedRun, detail, closureState, closureFollowThrough),
    [closureFollowThrough, closureState, detail, selectedRun],
  );
  const journalReconciliation = useMemo(
    () => buildTerminalJournalReconciliation(detail),
    [detail],
  );
  const walletBtcOperation = useMemo(
    () => buildTerminalWalletBtcOperationProjection({ selectedRun, detail }),
    [detail, selectedRun],
  );
  const organizationAuthority = useMemo(
    () => buildTerminalOrganizationAuthorityProjection(detail),
    [detail],
  );
  const writtenAssets = detail?.writtenAssets || null;
  const deliveryMechanism = detail?.shippables || detail?.deliveryMechanism || null;
  const mergedAssetPackSurface =
    writtenAssets || deliveryMechanism
      ? {
          pullRequest: deliveryMechanism?.pullRequest ?? null,
          fileChanges: writtenAssets?.fileChanges ?? null,
          summary: writtenAssets?.summary ?? deliveryMechanism?.summary ?? null,
        }
      : null;

  useEffect(() => {
    setSummaryOpen(true);
  }, [selectedRun.id]);

  if (isLoadingDetail && !detail) {
    return (
      <div
        data-testid="terminal-detail-loading-state"
        role="status"
        aria-live="polite"
        className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-10 text-sm text-neutral-400"
      >
        Loading Bitcode activity…
      </div>
    );
  }

  if (!detail) {
    return (
      <div
        data-testid="terminal-detail-empty-state"
        role="status"
        className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-10 text-sm text-neutral-400"
      >
        Selected Bitcode activity is not available yet for this context.
      </div>
    );
  }

  const identityRows = buildTerminalTransactionIdentityRows(selectedRun, detail);
  const closureRows = buildTerminalTransactionClosureRows(detail);

  const handleClosureAction = async (callback: Parameters<typeof runControl>[0]) => {
    setIsActing(true);
    try {
      await runControl(callback);
    } finally {
      setIsActing(false);
    }
  };
  const handleRunClosure = async () => {
    setIsActing(true);
    setActionError(null);

    try {
      const response = await fetch('/api/make-bitcode-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(
          await readTerminalRouteError(response, 'Unable to run the selected closure activity.'),
        );
      }

      const payload = (await response.json()) as Record<string, unknown>;
      await runControl((nextControls) => nextControls.refresh?.());
      await onRecordActivity?.({
        type: 'agentic-execution:asset-pack',
        detailSection: 'closure',
        summary: `Re-ran closure from selected Bitcode activity ${selectedRun.id}.`,
        context: {
          source: 'terminal-transaction-detail',
          selectedRunId: selectedRun.id,
          selectedRunType: selectedRun.type || null,
          specVersion: payload.specVersion ?? null,
        },
          output: {
            protocol: {
              ok: payload.ok ?? true,
              latestRun: payload.latestRun ?? null,
            },
            assetPackCompletion: buildTerminalClosureAssetPackCompletion(witnessClosureState, detail),
          },
        });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to run the selected closure activity.',
      );
    } finally {
      setIsActing(false);
    }
  };

  return (
    <section
      data-testid="terminal-selected-activity-detail"
      aria-labelledby="terminalTransactionDetailTitle"
      className="space-y-6"
    >
      {detailError ? (
        <div
          data-testid="terminal-detail-readback-warning"
          role="alert"
          className="rounded-[1.4rem] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100"
        >
          {detailError}
        </div>
      ) : null}

      <div className="grid gap-6">
        <div className="space-y-5">
          <TerminalTransactionDetailHero
            title={transactionReadModel.lowDetail.title}
            summary={sectionSummary}
            proofPosture={transactionReadModel.lowDetail.proofPosture}
            modeLabel={getTransactionDataModeLabel(transactionDataMode)}
            metrics={transactionReadModel.lowDetail.metrics}
            routeHref={transactionReadModel.route.href}
            exchangeHref={transactionReadModel.route.exchangeHref}
            activeSectionLabel={transactionReadModel.activeSection.label}
            activeSectionAvailability={transactionReadModel.activeSection.availability}
            postureChips={transactionReadModel.lowDetail.postureChips}
            surface={surface}
            titleId="terminalTransactionDetailTitle"
          />

          <TerminalTransactionDetailActionBar
            activeSection={detailSection}
            detailActions={transactionReadModel.sections.map((section) => ({
              id: section.id,
              label: section.label,
              disabled: section.availability === 'blocked',
              disabledReason: section.blocker || undefined,
            }))}
            onChangeSection={onDetailSectionChange}
            onRunClosure={() => {
              void handleRunClosure();
            }}
            onRefreshDetail={() => {
              void handleClosureAction((nextControls) => nextControls.refresh?.());
            }}
            isActing={isActing}
            shellReady={shellReady}
            mockMode={usesMockTransactions}
            surface={surface}
          />

          <div id="terminalTransactionTransaction">
            <TerminalTransactionIdentityCard
              startedAt={formatRunTimestamp(selectedRun.created_at)}
              rows={identityRows}
              payload={transactionPayload}
            />
          </div>

          {showWalletBtc ? (
            <div id="terminalTransactionWalletBtc">
              <TerminalTransactionWalletBtcCard operation={walletBtcOperation} />
            </div>
          ) : null}

          {showAuthority ? (
            <div id="terminalTransactionAuthority">
              <TerminalTransactionOrganizationAuthorityCard authority={organizationAuthority} />
            </div>
          ) : null}

          {showShippables && mergedAssetPackSurface ? (
            <section
              id="terminalTransactionShippables"
              className="space-y-6 rounded-[1.5rem] border border-white/8 bg-[rgba(5,10,20,0.88)] px-4 py-5"
            >
              <div className="px-2">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-300/75">Finish-delivered Shippables</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Shippables attached to this activity</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-300">
                  AssetPack evidence and file changes remain Exchange-owned, while the GitHub pull request is the
                  V26 Shippable delivered by Finish in both mock and live posture.
                </p>
              </div>
              <ShippablesDocPanel
                shippables={mergedAssetPackSurface}
                summaryOpen={summaryOpen}
                onToggleSummary={() => setSummaryOpen((current) => !current)}
              />
              <ShippablesCardsPanel
                shippables={{
                  pullRequest: mergedAssetPackSurface.pullRequest ?? null,
                }}
                autoScrollOnAnimation={surface !== 'exchange'}
              />
            </section>
          ) : showShippables ? (
            <div
              data-testid="terminal-shippables-empty-state"
              role="status"
              className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5 text-sm leading-6 text-neutral-300"
            >
              No materialized AssetPack evidence or Finish delivery mechanism is attached to this Bitcode activity yet. The same
              activity result still keeps proofs, history, and closure reading available.
            </div>
          ) : null}

          {actionError ? (
            <div
              data-testid="terminal-detail-action-error"
              role="alert"
              className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200"
            >
              {actionError}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          {showClosure ? (
            <div id="terminalTransactionClosure">
              <TerminalTransactionClosureCard
                rows={closureRows}
                settlementMetrics={closureFollowThrough.settlementMetrics}
                branchArtifacts={closureFollowThrough.branchArtifacts}
                payload={closurePayload}
                onOpenVerification={() => jumpToShellSection('panelEvaluations')}
                onOpenBranch={() => jumpToShellSection('panelBranchArtifacts')}
                onOpenSettlement={() => jumpToShellSection('panelSettlement')}
              />
            </div>
          ) : null}

          {showProofs ? (
            <div id="terminalTransactionProofs">
              <TerminalTransactionProofsCard
                proofFamilies={closureFollowThrough.proofFamilies}
                onOpenVerification={() => jumpToShellSection('panelEvaluations')}
                onOpenSettlement={() => jumpToShellSection('panelSettlement')}
                payload={proofsPayload}
              />
            </div>
          ) : null}

          {showHistory ? (
            <div id="terminalTransactionHistory">
              <TerminalTransactionHistoryCard
                recentHistory={closureFollowThrough.recentHistory}
                onOpenHistory={() => jumpToShellSection('panelLedger')}
                payload={historyPayload}
              />
            </div>
          ) : null}

          {showJournal ? (
            <div id="terminalTransactionJournal">
              <TerminalTransactionJournalReconciliationCard reconciliation={journalReconciliation} />
            </div>
          ) : null}
        </div>
      </div>

      {showActivity ? (
        <div id="terminalTransactionActivity">
          <TerminalTransactionActivitySurface
            selectedRun={selectedRun}
            detail={detail}
            transactionDataMode={transactionDataMode}
          />
        </div>
      ) : null}

      {showConsole ? (
        <section
          id="terminalTransactionConsole"
          className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[rgba(5,9,18,0.9)]"
        >
          <div className="border-b border-white/8 px-5 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Execution console</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Detailed execution console</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-300">
              Use this execution view when you read exact execution detail beyond the main activity cards.
            </p>
          </div>
          <div className="p-5">
            <ExecutionDetailsView runId={selectedRun.id} />
          </div>
        </section>
      ) : null}
    </section>
  );
}
