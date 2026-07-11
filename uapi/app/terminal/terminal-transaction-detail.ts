import type {
  TerminalClosureHistoryEntry,
  TerminalClosurePanel,
  TerminalClosureProofFamily,
  TerminalClosureState,
} from './terminal-closure-state';
import type { ShippablesDoc } from '@/components/bitcode/pipeline/ShippablesDocPanel';
import type { TerminalRunDetailSnapshot } from './terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from './terminal-run-data';

export type TerminalTransactionDetailRow = {
  label: string;
  value: string;
};

export type TerminalTransactionClosureFollowThrough = {
  settlementMetrics: Array<{ label: string; value: string }>;
  branchArtifacts: string[];
  proofFamilies: TerminalClosureProofFamily[];
  recentHistory: TerminalClosureHistoryEntry[];
};

export type TerminalTransactionClosurePayload = {
  transaction: {
    id: string;
    createdAt: string;
    proofStatus: string | null;
    closureFocus: string | null;
  };
  closure: {
    canonLabel: string | null;
    processingStats: TerminalRunDetailSnapshot['processingStats'] | null;
    rows: TerminalTransactionDetailRow[];
    settlementMetrics: TerminalTransactionClosureFollowThrough['settlementMetrics'];
    branchArtifacts: TerminalTransactionClosureFollowThrough['branchArtifacts'];
    proofFamilies: TerminalTransactionClosureFollowThrough['proofFamilies'];
    recentHistory: TerminalTransactionClosureFollowThrough['recentHistory'];
    readReview: TerminalClosurePanel | null;
    verification: TerminalClosurePanel | null;
    branch: TerminalClosurePanel | null;
    settlement: TerminalClosurePanel | null;
    ledger: TerminalClosurePanel | null;
  };
};

export type TerminalTransactionPersistedActivitySnapshot = {
  metrics: Array<{ label: string; value: string }>;
  rows: TerminalTransactionDetailRow[];
  chips: string[];
  payload: unknown;
};

export function getTerminalTransactionWrittenAssets(
  detail: TerminalRunDetailSnapshot | null,
): ShippablesDoc | null {
  return detail?.writtenAssets || null;
}

export function getTerminalTransactionDeliveryMechanism(
  detail: TerminalRunDetailSnapshot | null,
): ShippablesDoc | null {
  return detail?.shippables || detail?.deliveryMechanism || null;
}

export function countTerminalTransactionShippableSurfaces(detail: TerminalRunDetailSnapshot | null) {
  const shippables = getTerminalTransactionDeliveryMechanism(detail);
  if (!shippables) return 0;

  let count = 0;
  if (shippables.pullRequest) count += 1;
  return count;
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

export function buildTerminalTransactionOverviewMetrics(
  selectedRun: WorkspaceRun,
  detail: TerminalRunDetailSnapshot | null,
) {
  const shippableSurfaceCount = countTerminalTransactionShippableSurfaces(detail);

  return [
    { label: 'Shippables', value: formatNumber(shippableSurfaceCount) },
    { label: 'History items', value: formatNumber(detail?.historyItemCount) },
    { label: 'Event count', value: formatNumber(detail?.eventCount) },
    { label: 'Proof posture', value: detail?.proofStatus || 'closure state in flight' },
  ];
}

function dedupeChips(chips: Array<string | null | undefined>) {
  return Array.from(new Set(chips.map((chip) => chip?.trim()).filter((chip): chip is string => Boolean(chip))));
}

export function buildTerminalTransactionPersistedActivitySnapshot(
  detail: TerminalRunDetailSnapshot | null,
): TerminalTransactionPersistedActivitySnapshot | null {
  const activityState = detail?.bitcodeActivityState;
  if (!activityState) return null;

  const workbench = activityState.depositWorkbench || activityState.fitWorkbench || null;
  const readMeasurement = activityState.readMeasurement || null;
  const supplySelection = activityState.supplySelection || null;
  const repositoryAnchor = activityState.repositoryAnchor || null;

  const metrics = [
    workbench ? { label: 'Projection', value: workbench.projectionPrincipal } : null,
    supplySelection ? { label: 'Selected refs', value: formatNumber(supplySelection.selectedCount) } : null,
    readMeasurement ? { label: 'Target kinds', value: formatNumber(readMeasurement.targetKindCount) } : null,
    readMeasurement ? { label: 'Closure criteria', value: formatNumber(readMeasurement.closureCriteriaCount) } : null,
    supplySelection ? { label: 'Filtered refs', value: formatNumber(supplySelection.filteredCount) } : null,
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric));

  const rows = [
    repositoryAnchor?.repository
      ? { label: 'Repository anchor', value: repositoryAnchor.repository.fullName }
      : null,
    repositoryAnchor?.connection ? { label: 'Connection mode', value: repositoryAnchor.connection.mode } : null,
    workbench?.deposit?.summary ? { label: 'Deposit posture', value: workbench.deposit.summary } : null,
    workbench?.read?.summary ? { label: 'Read posture', value: workbench.read.summary } : null,
    workbench?.fit?.summary ? { label: 'Fit posture', value: workbench.fit.summary } : null,
    readMeasurement ? { label: 'Read scenario', value: readMeasurement.scenario.label } : null,
    readMeasurement ? { label: 'Read parser', value: readMeasurement.parserKind } : null,
    supplySelection ? { label: 'Auth session', value: supplySelection.authSessionLabel } : null,
    supplySelection?.searchTerm ? { label: 'Search filter', value: supplySelection.searchTerm } : null,
  ].filter((row): row is TerminalTransactionDetailRow => Boolean(row));

  const chips = dedupeChips([
    ...(workbench?.deposit?.artifactKinds || []),
    ...(workbench?.read?.targetKinds || []),
    ...(workbench?.read?.closureCriteria || []),
    ...(supplySelection?.selectedEntries.map((entry) => entry.title) || []),
  ]);

  if (!metrics.length && !rows.length && !chips.length) return null;

  return {
    metrics,
    rows,
    chips,
    payload: {
      summary: detail?.summary || null,
      processingStats: detail?.processingStats || null,
      bitcodeActivityState: activityState,
    },
  };
}

export function buildTerminalTransactionIdentityRows(
  selectedRun: WorkspaceRun,
  detail: TerminalRunDetailSnapshot | null,
): TerminalTransactionDetailRow[] {
  const rows: TerminalTransactionDetailRow[] = [
    { label: 'Activity id', value: selectedRun.id },
    { label: 'Activity type', value: selectedRun.agentic_execution?.label || selectedRun.type || 'n/a' },
    { label: 'Status', value: selectedRun.status || 'running' },
    { label: 'Action lens', value: selectedRun.transactionLens || 'closure' },
    { label: 'Participant', value: selectedRun.participant || 'n/a' },
    { label: 'Ownership', value: selectedRun.isOwnTransaction ? 'mine' : 'network' },
    { label: 'Activity summary', value: detail?.summary || selectedRun.summary || 'n/a' },
    { label: 'Proof posture', value: detail?.proofStatus || selectedRun.proofStatus || 'closure state in flight' },
    { label: 'Closure focus', value: detail?.closureFocus || selectedRun.closureFocus || 'Terminal consequence reading' },
    { label: 'Token total', value: formatNumber(detail?.processingStats.tokenTotal) },
    {
      label: 'Measured BTD',
      value: formatNumber(detail?.processingStats.measuredBtd, { maximumFractionDigits: 1 }),
    },
    { label: 'BTC fee basis', value: formatUsd(detail?.processingStats.btcFeeUsdEquivalent) },
    {
      label: 'Latency',
      value: detail?.processingStats.averageLatencyMs ? `${formatNumber(detail.processingStats.averageLatencyMs)} ms` : 'n/a',
    },
    { label: 'History items', value: formatNumber(detail?.historyItemCount) },
    { label: 'Event count', value: formatNumber(detail?.eventCount) },
  ];
  const activityState = detail?.bitcodeActivityState;

  if (detail?.repoSnapshot) {
    rows.push(
      { label: 'Repository', value: `${detail.repoSnapshot.org}/${detail.repoSnapshot.repo}` },
      { label: 'Branch', value: detail.repoSnapshot.branch || 'n/a' },
      { label: 'Commit', value: detail.repoSnapshot.commit || 'n/a' },
    );
  } else if (activityState?.repositoryAnchor?.repository) {
    rows.push(
      { label: 'Repository', value: activityState.repositoryAnchor.repository.fullName },
      {
        label: 'Branch',
        value:
          activityState.repositoryAnchor.repository.selectedBranch ||
          activityState.repositoryAnchor.repository.defaultBranch ||
          'main',
      },
      { label: 'Commit', value: activityState.repositoryAnchor.repository.selectedCommit || 'n/a' },
    );
  }

  if (activityState?.repositoryAnchor?.providerAccount) {
    rows.push({ label: 'Provider account', value: activityState.repositoryAnchor.providerAccount });
  }
  if (activityState?.repositoryAnchor?.connection?.inventorySource) {
    rows.push({
      label: 'Inventory source',
      value: activityState.repositoryAnchor.connection.inventorySource,
    });
  }

  const workbench = activityState?.depositWorkbench || activityState?.fitWorkbench;
  if (workbench) {
    rows.push(
      { label: 'Projection', value: workbench.projectionPrincipal },
      { label: 'Scenario', value: workbench.scenarioLabel },
      { label: 'Profile', value: workbench.profileLabel },
    );
  }

  if (activityState?.readMeasurement) {
    rows.push(
      { label: 'Read parser', value: activityState.readMeasurement.parserKind },
      { label: 'Read scenario', value: activityState.readMeasurement.scenario.label },
    );
  }

  if (activityState?.supplySelection) {
    rows.push(
      { label: 'Auth session', value: activityState.supplySelection.authSessionLabel },
      {
        label: 'Selected refs',
        value: String(activityState.supplySelection.selectedCount),
      },
    );
  }

  return rows;
}

export function buildTerminalTransactionClosureRows(detail: TerminalRunDetailSnapshot | null) {
  return [
    { label: 'Proof posture', value: detail?.proofStatus || 'closure state in flight' },
    { label: 'Closure focus', value: detail?.closureFocus || 'Terminal consequence reading' },
    { label: 'Processing time', value: detail?.processingStats.time || 'n/a' },
    { label: 'Token total', value: formatNumber(detail?.processingStats.tokenTotal) },
    {
      label: 'Measured $BTD',
      value: formatNumber(detail?.processingStats.measuredBtd, { maximumFractionDigits: 1 }),
    },
    { label: 'BTC fee basis', value: formatUsd(detail?.processingStats.btcFeeUsdEquivalent) },
    {
      label: 'Latency',
      value: detail?.processingStats.averageLatencyMs ? `${formatNumber(detail.processingStats.averageLatencyMs)} ms` : 'n/a',
    },
  ];
}

export function buildTerminalTransactionClosureFollowThrough(
  closureState: TerminalClosureState | null,
): TerminalTransactionClosureFollowThrough {
  return {
    settlementMetrics: closureState?.settlement.metrics.slice(0, 4) || [],
    branchArtifacts: closureState?.branch.chips.slice(0, 6) || [],
    proofFamilies: closureState?.settlement.proofFamilies?.slice(0, 4) || [],
    recentHistory: closureState?.ledger.recentRuns?.slice(0, 4) || [],
  };
}

export function buildTerminalTransactionClosurePayload(
  selectedRun: WorkspaceRun,
  detail: TerminalRunDetailSnapshot | null,
  closureState: TerminalClosureState | null,
  closureFollowThrough: TerminalTransactionClosureFollowThrough,
): TerminalTransactionClosurePayload {
  return {
    transaction: {
      id: selectedRun.id,
      createdAt: selectedRun.created_at,
      proofStatus: detail?.proofStatus || selectedRun.proofStatus || null,
      closureFocus: detail?.closureFocus || selectedRun.closureFocus || null,
    },
    closure: {
      canonLabel: closureState?.canonLabel || detail?.closureFollowThrough?.canonLabel || null,
      processingStats: detail?.processingStats || null,
      rows: buildTerminalTransactionClosureRows(detail),
      settlementMetrics: closureFollowThrough.settlementMetrics,
      branchArtifacts: closureFollowThrough.branchArtifacts,
      proofFamilies: closureFollowThrough.proofFamilies,
      recentHistory: closureFollowThrough.recentHistory,
      readReview: closureState?.readReview || null,
      verification: closureState?.verification || null,
      branch: closureState?.branch || null,
      settlement: closureState?.settlement || null,
      ledger: closureState?.ledger || null,
    },
  };
}
