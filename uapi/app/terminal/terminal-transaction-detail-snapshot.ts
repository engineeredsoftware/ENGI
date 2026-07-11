import type { ShippablesDoc } from '@/components/bitcode/pipeline/ShippablesDocPanel';
import type { PipelineExecution } from '@/types/api';

import type {
  TerminalClosureCandidate,
  TerminalClosureHistoryEntry,
  TerminalClosurePanel,
  TerminalClosureProofFamily,
  TerminalClosureState,
} from './terminal-closure-state';
import type { TerminalDepositReadWorkbench } from './terminal-deposit-read-workbench';
import type { TerminalRepositoryContextState } from './terminal-repository-context';
import type { WorkspaceRun } from './terminal-run-data';

export type TerminalRunDetailClosureFollowThrough = {
  canonLabel: string | null;
  settlementMetrics: Array<{ label: string; value: string }>;
  branchArtifacts: string[];
  proofFamilies: Array<{
    label: string;
    artifactPath: string;
    theoremStatus: string;
    replayArtifacts: string;
  }>;
  recentHistory: Array<{ label: string; summary: string }>;
};

type RepoSnapshot = {
  org: string;
  repo: string;
  branch: string;
  commit: string;
};

type ProcessingStats = {
  time: string | null;
  tokenTotal: number | null;
  measuredBtd: number | null;
  btcFeeUsdEquivalent: number | null;
  averageLatencyMs: number | null;
};

export type TerminalJsonRecord = Record<string, unknown>;

export type TerminalLedgerSettlementSnapshot = {
  status: string | null;
  settlementAdmissible: boolean | null;
  reason: string | null;
  assetPackId: string | null;
  btdRange: TerminalJsonRecord | null;
  ledgerAnchorId: string | null;
  btcFeeReceiptId: string | null;
  depositorWalletId: string | null;
  readerWalletId: string | null;
  btcFee: TerminalJsonRecord | null;
  ownershipBoundary: TerminalJsonRecord | null;
  assetPackMintReceipt?: TerminalJsonRecord | null;
  readReceipt?: TerminalJsonRecord | null;
  rightsTransferReceipt?: TerminalJsonRecord | null;
  ledgerDatabaseReconciliation?: TerminalJsonRecord | null;
  readback: Record<string, boolean>;
  journalEntryIds: string[];
  ownershipEventId: string | null;
  readLicenseId: string | null;
};

export type TerminalJournalEntrySnapshot = {
  journalEntryId: string;
  transactionKind: string;
  actorId: string;
  preStateRoot: string;
  postStateRoot: string;
  receiptRoots: string[];
  ledgerAnchorIds: string[];
  exchangeSequence: number | null;
  issuedAt: string | null;
  raw: TerminalJsonRecord;
};

export type TerminalReconciliationRepairSnapshot = {
  repairId: string;
  reconciliationId: string;
  factId: string;
  repairKind: string;
  driftKind: string | null;
  repairActionKind: string | null;
  beforeValue: string;
  afterValue: string;
  blocking: boolean;
  requiresOperatorApproval: boolean;
  proofRoot: string | null;
  issuedAt: string | null;
  raw: TerminalJsonRecord;
};

export type TerminalJournalReadbackSnapshot = {
  expectedJournalEntryIds: string[];
  entries: TerminalJournalEntrySnapshot[];
  repairs: TerminalReconciliationRepairSnapshot[];
  ledgerRows: {
    assetPackRanges: TerminalJsonRecord[];
    btcFeeTransactions: TerminalJsonRecord[];
    ledgerAnchors: TerminalJsonRecord[];
    ownershipEvents: TerminalJsonRecord[];
    readLicenses: TerminalJsonRecord[];
  };
  readErrors: string[];
};

export interface TerminalRunDetailSnapshot {
  summary: string | null;
  shippables: ShippablesDoc | null;
  assetPackSynthesisArtifacts?: ShippablesDoc | null;
  writtenAssets?: ShippablesDoc | null;
  deliveryMechanism?: ShippablesDoc | null;
  repoSnapshot: RepoSnapshot | null;
  processingStats: ProcessingStats;
  proofStatus: string | null;
  closureFocus: string | null;
  closureFollowThrough: TerminalRunDetailClosureFollowThrough | null;
  closureState: TerminalClosureState | null;
  ledgerSettlement: TerminalLedgerSettlementSnapshot | null;
  terminalJournal: TerminalJournalReadbackSnapshot | null;
  organizationAuthority: TerminalJsonRecord[] | null;
  bitcodeActivityState: {
    depositWorkbench?: TerminalDepositReadWorkbench | null;
    fitWorkbench?: TerminalDepositReadWorkbench | null;
    readMeasurement?: {
      scenario: { id: string; label: string; repo: string; profile: string; selected: boolean };
      parserKind: string;
      closureCriteriaCount: number;
      targetKindCount: number;
    } | null;
    supplySelection?: {
      authSessionLabel: string;
      selectedAuthSessionId: string;
      selectedKind: string;
      searchTerm: string;
      selectedCount: number;
      filteredCount: number;
      totalFilteredEntries: number;
      selectedEntries: Array<{ id: string; title: string; kind: string; tags: string[] }>;
    } | null;
    repositoryAnchor?: {
      provider: TerminalRepositoryContextState['provider'];
      providerAccount: string;
      repository: {
        id: string;
        fullName: string;
        defaultBranch: string;
        selectedBranch?: string | null;
        selectedCommit?: string | null;
        private: boolean;
        language: string | null;
        topics: string[];
      } | null;
      connection: {
        connected: boolean;
        valid: boolean;
        mode: string;
        inventorySource?: string | null;
      };
    } | null;
    interfaceIntegrationRegression?: {
      surfaceCount: number;
      objectFamilyCount: number;
      recordCount: number;
      lowDetailSourceSafe: true;
      routeLocalReimplementation: false;
      transactionCockpitRegression: false;
    };
  } | null;
  historyItemCount: number;
  eventCount: number;
}

type TerminalRunHistoryPayload = {
  run?: PipelineExecution | null;
  events?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function coerceString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function coerceNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseRepository(value?: string | null, branch?: string | null): RepoSnapshot | null {
  if (!value) return null;
  const [org, repo] = value.split('/');
  if (!org || !repo) return null;
  return {
    org,
    repo,
    branch: branch || 'n/a',
    commit: '',
  };
}

function coerceRepoSnapshot(value: unknown): RepoSnapshot | null {
  if (!isRecord(value)) return null;
  const org = coerceString(value.org);
  const repo = coerceString(value.repo);
  if (!org || !repo) return null;
  return {
    org,
    repo,
    branch: coerceString(value.branch) || 'n/a',
    commit: coerceString(value.commit) || '',
  };
}

function coerceProcessingStats(value: unknown): ProcessingStats {
  if (!isRecord(value)) {
    return {
      time: null,
      tokenTotal: null,
      measuredBtd: null,
      btcFeeUsdEquivalent: null,
      averageLatencyMs: null,
    };
  }

  const tokens = isRecord(value.tokens) ? value.tokens : null;

  return {
    time: coerceString(value.time),
    tokenTotal: coerceNumber(tokens?.total),
    measuredBtd: coerceNumber(value.measuredBtd),
    btcFeeUsdEquivalent: coerceNumber(value.btcFeeUsdEquivalent),
    averageLatencyMs: coerceNumber(value.averageLatencyMs),
  };
}

function coerceShippableSurface(value: unknown): ShippablesDoc | null {
  if (!isRecord(value)) return null;

  const pullRequest = isRecord(value.pullRequest) ? (value.pullRequest as ShippablesDoc['pullRequest']) : null;
  const fileChanges = isRecord(value.fileChanges)
    ? {
        edited: coerceNumber(value.fileChanges.edited) || 0,
        created: coerceNumber(value.fileChanges.created) || 0,
        deleted: coerceNumber(value.fileChanges.deleted) || 0,
        paths: Array.isArray(value.fileChanges.paths)
          ? value.fileChanges.paths.filter((path): path is string => typeof path === 'string')
          : [],
        fileDiffs: Array.isArray(value.fileChanges.fileDiffs)
          ? (value.fileChanges.fileDiffs as NonNullable<NonNullable<ShippablesDoc['fileChanges']>['fileDiffs']>)
          : undefined,
      }
    : null;
  const summary = coerceString(value.summary);

  if (!pullRequest && !summary && !fileChanges) {
    return null;
  }

  return {
    pullRequest,
    fileChanges,
    summary,
  };
}

function buildWrittenAssetSurface(surface?: ShippablesDoc | null): ShippablesDoc | null {
  if (!surface) return null;

  const summary = surface.summary || null;
  const fileChanges = surface.fileChanges || null;
  if (!summary && !fileChanges) return null;

  return {
    pullRequest: null,
    fileChanges,
    summary,
  };
}

function buildDeliverySurface(surface?: ShippablesDoc | null): ShippablesDoc | null {
  if (!surface) return null;

  const pullRequest = surface.pullRequest || null;
  const summary = surface.summary || null;
  if (!pullRequest && !summary) return null;

  return {
    pullRequest,
    fileChanges: null,
    summary,
  };
}

function buildPullRequestShippableSurface(surface?: ShippablesDoc | null): ShippablesDoc | null {
  const deliverySurface = buildDeliverySurface(surface);
  if (!deliverySurface?.pullRequest) return null;
  return deliverySurface;
}

function coerceRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((entry) => ({
      label: coerceString(entry.label) || '—',
      value: coerceString(entry.value) || '—',
    }));
}

function coerceMetrics(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((entry) => ({
      label: coerceString(entry.label) || '—',
      value: coerceString(entry.value) || '—',
    }));
}

function coerceChips(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function coerceBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry === 'boolean')
      .map(([key, entry]) => [key, entry]),
  ) as Record<string, boolean>;
}

function coerceRecordArray(value: unknown): TerminalJsonRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is TerminalJsonRecord => isRecord(entry));
}

function coerceJsonRecord(value: unknown): TerminalJsonRecord | null {
  return isRecord(value) ? value : null;
}

function coerceLedgerSettlement(value: unknown): TerminalLedgerSettlementSnapshot | null {
  if (!isRecord(value)) return null;
  const readback = coerceBooleanRecord(value.readback);
  const journalEntryIds = coerceChips(value.journalEntryIds);
  const assetPackMintReceipt = coerceJsonRecord(
    value.assetPackMintReceipt || value.asset_pack_mint_receipt,
  );
  const readReceipt = coerceJsonRecord(value.readReceipt || value.read_receipt);
  const rightsTransferReceipt = coerceJsonRecord(
    value.rightsTransferReceipt ||
      value.btdRightsTransferReceipt ||
      value.rights_transfer_receipt ||
      value.btd_rights_transfer_receipt,
  );
  const ledgerDatabaseReconciliation = coerceJsonRecord(
    value.ledgerDatabaseReconciliation || value.ledger_database_reconciliation,
  );
  const hasSettlementShape =
    coerceString(value.status) ||
    coerceString(value.assetPackId) ||
    coerceString(value.ledgerAnchorId) ||
    coerceString(value.btcFeeReceiptId) ||
    assetPackMintReceipt ||
    readReceipt ||
    rightsTransferReceipt ||
    ledgerDatabaseReconciliation ||
    Object.keys(readback).length > 0 ||
    journalEntryIds.length > 0;

  if (!hasSettlementShape) return null;

  return {
    status: coerceString(value.status),
    settlementAdmissible: typeof value.settlementAdmissible === 'boolean' ? value.settlementAdmissible : null,
    reason: coerceString(value.reason),
    assetPackId: coerceString(value.assetPackId),
    btdRange: isRecord(value.btdRange) ? value.btdRange : null,
    ledgerAnchorId: coerceString(value.ledgerAnchorId),
    btcFeeReceiptId: coerceString(value.btcFeeReceiptId),
    depositorWalletId: coerceString(value.depositorWalletId),
    readerWalletId: coerceString(value.readerWalletId),
    btcFee: isRecord(value.btcFee) ? value.btcFee : null,
    ownershipBoundary: isRecord(value.ownershipBoundary) ? value.ownershipBoundary : null,
    assetPackMintReceipt,
    readReceipt,
    rightsTransferReceipt,
    ledgerDatabaseReconciliation,
    readback,
    journalEntryIds,
    ownershipEventId: coerceString(value.ownershipEventId),
    readLicenseId: coerceString(value.readLicenseId),
  };
}

function coerceJournalEntry(value: unknown): TerminalJournalEntrySnapshot | null {
  if (!isRecord(value)) return null;
  const journalEntryId = coerceString(value.journal_entry_id) || coerceString(value.journalEntryId);
  if (!journalEntryId) return null;

  return {
    journalEntryId,
    transactionKind: coerceString(value.transaction_kind) || coerceString(value.transactionKind) || 'unknown',
    actorId: coerceString(value.actor_id) || coerceString(value.actorId) || 'unknown',
    preStateRoot: coerceString(value.pre_state_root) || coerceString(value.preStateRoot) || 'n/a',
    postStateRoot: coerceString(value.post_state_root) || coerceString(value.postStateRoot) || 'n/a',
    receiptRoots: coerceChips(value.receipt_roots || value.receiptRoots),
    ledgerAnchorIds: coerceChips(value.ledger_anchor_ids || value.ledgerAnchorIds),
    exchangeSequence: coerceNumber(value.exchange_sequence) ?? coerceNumber(value.exchangeSequence),
    issuedAt: coerceString(value.issued_at) || coerceString(value.issuedAt),
    raw: value,
  };
}

function coerceRepairReceipt(value: unknown): TerminalReconciliationRepairSnapshot | null {
  if (!isRecord(value)) return null;
  const repairId = coerceString(value.repair_id) || coerceString(value.repairId);
  if (!repairId) return null;

  return {
    repairId,
    reconciliationId: coerceString(value.reconciliation_id) || coerceString(value.reconciliationId) || 'n/a',
    factId: coerceString(value.fact_id) || coerceString(value.factId) || 'n/a',
    repairKind: coerceString(value.repair_kind) || coerceString(value.repairKind) || 'n/a',
    driftKind: coerceString(value.drift_kind) || coerceString(value.driftKind),
    repairActionKind: coerceString(value.repair_action_kind) || coerceString(value.repairActionKind),
    beforeValue: coerceString(value.before_value) || coerceString(value.beforeValue) || 'n/a',
    afterValue: coerceString(value.after_value) || coerceString(value.afterValue) || 'n/a',
    blocking: Boolean(value.blocking),
    requiresOperatorApproval: Boolean(value.requires_operator_approval || value.requiresOperatorApproval),
    proofRoot: coerceString(value.proof_root) || coerceString(value.proofRoot),
    issuedAt: coerceString(value.issued_at) || coerceString(value.issuedAt),
    raw: value,
  };
}

function coerceTerminalJournalReadback(value: unknown): TerminalJournalReadbackSnapshot | null {
  if (!isRecord(value)) return null;
  const entries = Array.isArray(value.entries)
    ? value.entries.map(coerceJournalEntry).filter((entry): entry is TerminalJournalEntrySnapshot => Boolean(entry))
    : [];
  const repairs = Array.isArray(value.repairs)
    ? value.repairs.map(coerceRepairReceipt).filter((entry): entry is TerminalReconciliationRepairSnapshot => Boolean(entry))
    : [];
  const ledgerRows = isRecord(value.ledgerRows) ? value.ledgerRows : {};
  const readErrors = coerceChips(value.readErrors);
  const expectedJournalEntryIds = coerceChips(value.expectedJournalEntryIds);
  const hasReadback =
    entries.length ||
    repairs.length ||
    readErrors.length ||
    expectedJournalEntryIds.length ||
    Object.values(ledgerRows).some((entry) => Array.isArray(entry) && entry.length > 0);

  if (!hasReadback) return null;

  return {
    expectedJournalEntryIds,
    entries,
    repairs,
    ledgerRows: {
      assetPackRanges: coerceRecordArray(ledgerRows.assetPackRanges),
      btcFeeTransactions: coerceRecordArray(ledgerRows.btcFeeTransactions),
      ledgerAnchors: coerceRecordArray(ledgerRows.ledgerAnchors),
      ownershipEvents: coerceRecordArray(ledgerRows.ownershipEvents),
      readLicenses: coerceRecordArray(ledgerRows.readLicenses),
    },
    readErrors,
  };
}

function coerceOrganizationAuthority(value: unknown): TerminalJsonRecord[] | null {
  if (Array.isArray(value)) {
    const records = coerceRecordArray(value);
    return records.length ? records : null;
  }
  if (isRecord(value)) {
    const decisions = coerceRecordArray(value.decisions);
    if (decisions.length) return decisions;
    return [value];
  }
  return null;
}

function coerceCandidates(value: unknown): TerminalClosureCandidate[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((entry) => ({
      title: coerceString(entry.title) || 'Evaluated candidate',
      artifactKind: coerceString(entry.artifactKind) || 'n/a',
      score: coerceString(entry.score) || 'n/a',
      rights: coerceString(entry.rights) || 'n/a',
      strongestSignals: Array.isArray(entry.strongestSignals)
        ? entry.strongestSignals.filter((signal): signal is string => typeof signal === 'string' && signal.trim().length > 0)
        : [],
    }));
}

function coerceProofFamilies(value: unknown): TerminalClosureProofFamily[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((entry) => ({
      label: coerceString(entry.label) || 'Proof family',
      artifactPath: coerceString(entry.artifactPath) || 'n/a',
      theoremStatus: coerceString(entry.theoremStatus) || 'n/a',
      replayArtifacts: coerceString(entry.replayArtifacts) || 'n/a',
    }));
}

function coerceRecentHistory(value: unknown): TerminalClosureHistoryEntry[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((entry) => ({
      label: coerceString(entry.label) || 'Activity',
      summary: coerceString(entry.summary) || 'n/a',
    }));
}

function coerceClosurePanel(value: unknown): TerminalClosurePanel | null {
  if (!isRecord(value)) return null;
  const id = coerceString(value.id);
  if (id !== 'read-review' && id !== 'verification' && id !== 'branch' && id !== 'settlement' && id !== 'ledger') return null;

  return {
    id,
    label: coerceString(value.label) || 'Panel',
    summary: coerceString(value.summary) || 'n/a',
    metrics: coerceMetrics(value.metrics),
    rows: coerceRows(value.rows),
    chips: coerceChips(value.chips),
    candidates: coerceCandidates(value.candidates),
    proofFamilies: coerceProofFamilies(value.proofFamilies),
    fitQualities: coerceFitQualities(value.fitQualities),
    recentRuns: coerceRecentHistory(value.recentRuns),
  };
}

function coerceFitQualities(value: unknown): TerminalClosurePanel['fitQualities'] {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((entry) => ({
      label: coerceString(entry.label) || 'Source-to-shares fit quality',
      value: coerceString(entry.value) || '0',
      detail: coerceString(entry.detail) || 'n/a',
    }));
}

function coerceClosureFollowThrough(value: unknown): TerminalRunDetailClosureFollowThrough | null {
  if (!isRecord(value)) return null;

  const settlementMetrics = coerceRows(value.settlementMetrics);
  const branchArtifacts = Array.isArray(value.branchArtifacts)
    ? value.branchArtifacts.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];
  const proofFamilies = Array.isArray(value.proofFamilies)
    ? value.proofFamilies
        .filter(isRecord)
        .map((entry) => ({
          label: coerceString(entry.label) || 'Proof family',
          artifactPath: coerceString(entry.artifactPath) || 'n/a',
          theoremStatus: coerceString(entry.theoremStatus) || 'n/a',
          replayArtifacts: coerceString(entry.replayArtifacts) || 'n/a',
        }))
    : [];
  const recentHistory = Array.isArray(value.recentHistory)
    ? value.recentHistory
        .filter(isRecord)
        .map((entry) => ({
          label: coerceString(entry.label) || 'Activity',
          summary: coerceString(entry.summary) || 'n/a',
        }))
    : [];

  if (!settlementMetrics.length && !branchArtifacts.length && !proofFamilies.length && !recentHistory.length) {
    return null;
  }

  return {
    canonLabel: coerceString(value.canonLabel),
    settlementMetrics,
    branchArtifacts,
    proofFamilies,
    recentHistory,
  };
}

function coerceClosureState(value: unknown): TerminalClosureState | null {
  if (!isRecord(value)) return null;
  const verification = coerceClosurePanel(value.verification);
  const readReview = coerceClosurePanel(value.readReview) || {
    id: 'read-review' as const,
    label: 'Read review before Finding Fits',
    summary: 'Read review was not persisted on this older closure snapshot.',
    metrics: [],
    rows: [],
    chips: [],
  };
  const branch = coerceClosurePanel(value.branch);
  const settlement = coerceClosurePanel(value.settlement);
  const ledger = coerceClosurePanel(value.ledger);

  if (!verification || !branch || !settlement || !ledger) return null;

  return {
    canonLabel: coerceString(value.canonLabel) || 'Bitcode active posture',
    readReview,
    verification,
    branch,
    settlement,
    ledger,
  };
}

function coerceDepositReadWorkbenchState(value: unknown): TerminalDepositReadWorkbench | null {
  if (!isRecord(value)) return null;
  const legacyDepositKey = ['gi', 've'].join('');
  const legacyReadKey = ['ne', 'ed'].join('');
  const deposit = isRecord(value.deposit) ? value.deposit : isRecord(value[legacyDepositKey]) ? value[legacyDepositKey] : null;
  const read = isRecord(value.read) ? value.read : isRecord(value[legacyReadKey]) ? value[legacyReadKey] : null;
  const fit = isRecord(value.fit) ? value.fit : null;
  const sourceRevision = isRecord(value.sourceRevision) ? value.sourceRevision : null;
  if (!deposit || !read || !fit) return null;

  const coerceSelectionEntries = (entries: unknown) =>
    Array.isArray(entries)
      ? entries
          .filter(isRecord)
          .map((entry) => ({
            id: coerceString(entry.id) || '',
            label: coerceString(entry.label) || '',
          }))
          .filter((entry) => entry.id && entry.label)
      : [];

  return {
    canonLabel: coerceString(value.canonLabel) || 'Bitcode active posture',
    projectionPrincipal: coerceString(value.projectionPrincipal) || 'buyer',
    branchMode: coerceString(value.branchMode) || 'patch',
    scenarioLabel: coerceString(value.scenarioLabel) || 'No active scenario',
    profileLabel: coerceString(value.profileLabel) || 'Pending profile',
    sourceRevision:
      sourceRevision && coerceString(sourceRevision.repositoryFullName)
        ? {
            repositoryFullName: coerceString(sourceRevision.repositoryFullName) || '',
            branch: coerceString(sourceRevision.branch) || 'main',
            commit: coerceString(sourceRevision.commit) || '',
            activityId: coerceString(sourceRevision.activityId) || null,
            createdAt: coerceString(sourceRevision.createdAt) || null,
          }
        : null,
    deposit: {
      summary: coerceString(deposit.summary) || 'n/a',
      metrics: coerceMetrics(deposit.metrics),
      rows: coerceRows(deposit.rows),
      selectedEntries: coerceSelectionEntries(deposit.selectedEntries),
      artifactKinds: coerceChips(deposit.artifactKinds),
    },
    read: {
      summary: coerceString(read.summary) || 'n/a',
      metrics: coerceMetrics(read.metrics),
      rows: coerceRows(read.rows),
      closureCriteria: coerceChips(read.closureCriteria),
      targetKinds: coerceChips(read.targetKinds),
    },
    fit: {
      summary: coerceString(fit.summary) || 'n/a',
      metrics: coerceMetrics(fit.metrics),
      rows: coerceRows(fit.rows),
    },
  };
}

function coerceBitcodeActivityState(value: unknown): TerminalRunDetailSnapshot['bitcodeActivityState'] {
  if (!isRecord(value)) return null;

  const readMeasurement = isRecord(value.readMeasurement)
    ? {
        scenario: isRecord(value.readMeasurement.scenario)
          ? {
              id: coerceString(value.readMeasurement.scenario.id) || 'unselected-scenario',
              label: coerceString(value.readMeasurement.scenario.label) || 'Unselected scenario',
              repo: coerceString(value.readMeasurement.scenario.repo) || '—',
              profile: coerceString(value.readMeasurement.scenario.profile) || 'profile pending',
              selected: Boolean(value.readMeasurement.scenario.selected),
            }
          : {
              id: 'unselected-scenario',
              label: 'Unselected scenario',
              repo: '—',
              profile: 'profile pending',
              selected: false,
            },
        parserKind: coerceString(value.readMeasurement.parserKind) || '—',
        closureCriteriaCount: coerceNumber(value.readMeasurement.closureCriteriaCount) || 0,
        targetKindCount: coerceNumber(value.readMeasurement.targetKindCount) || 0,
      }
    : null;

  const supplySelection = isRecord(value.supplySelection)
    ? {
        authSessionLabel: coerceString(value.supplySelection.authSessionLabel) || 'No auth session',
        selectedAuthSessionId: coerceString(value.supplySelection.selectedAuthSessionId) || '',
        selectedKind: coerceString(value.supplySelection.selectedKind) || 'all',
        searchTerm: coerceString(value.supplySelection.searchTerm) || '',
        selectedCount: coerceNumber(value.supplySelection.selectedCount) || 0,
        filteredCount: coerceNumber(value.supplySelection.filteredCount) || 0,
        totalFilteredEntries: coerceNumber(value.supplySelection.totalFilteredEntries) || 0,
        selectedEntries: Array.isArray(value.supplySelection.selectedEntries)
          ? value.supplySelection.selectedEntries
              .filter(isRecord)
              .map((entry) => ({
                id: coerceString(entry.id) || '',
                title: coerceString(entry.title) || '',
                kind: coerceString(entry.kind) || 'artifact',
                tags: coerceChips(entry.tags),
              }))
              .filter((entry) => entry.id && entry.title)
          : [],
      }
    : null;

  const repositoryAnchor = isRecord(value.repositoryAnchor)
    ? {
        provider:
          coerceString(value.repositoryAnchor.provider) === 'gitlab' ||
          coerceString(value.repositoryAnchor.provider) === 'bitbucket'
            ? (coerceString(value.repositoryAnchor.provider) as TerminalRepositoryContextState['provider'])
            : 'github',
        providerAccount: coerceString(value.repositoryAnchor.providerAccount) || 'connected account',
        repository: isRecord(value.repositoryAnchor.repository)
          ? {
              id: coerceString(value.repositoryAnchor.repository.id) || '',
              fullName: coerceString(value.repositoryAnchor.repository.fullName) || '',
              defaultBranch: coerceString(value.repositoryAnchor.repository.defaultBranch) || 'main',
              selectedBranch: coerceString(value.repositoryAnchor.repository.selectedBranch),
              selectedCommit: coerceString(value.repositoryAnchor.repository.selectedCommit),
              private: Boolean(value.repositoryAnchor.repository.private),
              language: coerceString(value.repositoryAnchor.repository.language),
              topics: coerceChips(value.repositoryAnchor.repository.topics),
            }
          : null,
        connection: isRecord(value.repositoryAnchor.connection)
          ? {
              connected: Boolean(value.repositoryAnchor.connection.connected),
              valid: Boolean(value.repositoryAnchor.connection.valid),
              mode: coerceString(value.repositoryAnchor.connection.mode) || 'live connection',
              inventorySource: coerceString(value.repositoryAnchor.connection.inventorySource),
            }
          : { connected: false, valid: false, mode: 'live connection', inventorySource: null },
      }
    : null;

  const legacyDepositWorkbenchKey = `${['gi', 've'].join('')}Workbench`;
  const depositWorkbench =
    coerceDepositReadWorkbenchState(value.depositWorkbench) ||
    coerceDepositReadWorkbenchState(value[legacyDepositWorkbenchKey]);
  const fitWorkbench = coerceDepositReadWorkbenchState(value.fitWorkbench);

  if (!depositWorkbench && !fitWorkbench && !readMeasurement && !supplySelection && !repositoryAnchor) {
    return null;
  }

  return {
    ...(depositWorkbench ? { depositWorkbench } : {}),
    ...(fitWorkbench ? { fitWorkbench } : {}),
    ...(readMeasurement ? { readMeasurement } : {}),
    ...(supplySelection ? { supplySelection } : {}),
    ...(repositoryAnchor ? { repositoryAnchor } : {}),
  };
}

function readAssetPackCompletion(run: Record<string, unknown>) {
  if (isRecord(run.output) && isRecord(run.output.asset_pack_completion)) return run.output.asset_pack_completion;
  if (isRecord(run.output_data) && isRecord(run.output_data.asset_pack_completion)) return run.output_data.asset_pack_completion;
  if (isRecord(run.asset_pack_completion)) return run.asset_pack_completion;
  return null;
}

export function buildTerminalRunDetailFromSelectedRun(
  selectedRun: WorkspaceRun,
  fallbackShippables?: ShippablesDoc | null,
): TerminalRunDetailSnapshot {
  if (selectedRun.sourceModel === 'protocol-projection' && selectedRun.protocolProjectionDetail) {
    return selectedRun.protocolProjectionDetail;
  }

  const fallbackWrittenAssets = buildWrittenAssetSurface(fallbackShippables);
  const fallbackDeliveryMechanism = buildDeliverySurface(fallbackShippables);
  const fallbackPrShippables = buildPullRequestShippableSurface(fallbackShippables);

  return {
    summary: selectedRun.summary || fallbackShippables?.summary || null,
    assetPackSynthesisArtifacts: null,
    writtenAssets: fallbackWrittenAssets,
    shippables: fallbackPrShippables,
    deliveryMechanism: fallbackDeliveryMechanism,
    repoSnapshot: parseRepository(selectedRun.repository, selectedRun.branch),
    processingStats: {
      time: null,
      tokenTotal: selectedRun.tokenTotal ?? null,
      measuredBtd: selectedRun.measuredBtd ?? null,
      btcFeeUsdEquivalent: selectedRun.btcFeeUsdEquivalent ?? null,
      averageLatencyMs: selectedRun.averageLatencyMs ?? null,
    },
    proofStatus: selectedRun.proofStatus || null,
    closureFocus: selectedRun.closureFocus || null,
    closureFollowThrough: null,
    closureState: null,
    ledgerSettlement: null,
    terminalJournal: null,
    organizationAuthority: null,
    bitcodeActivityState: null,
    historyItemCount: selectedRun.itemCount || 0,
    eventCount: 0,
  };
}

export function normalizeTerminalRunDetailPayload(
  payload: unknown,
  selectedRun: WorkspaceRun,
  fallbackShippables?: ShippablesDoc | null,
): TerminalRunDetailSnapshot {
  if (!isRecord(payload) || (!isRecord(payload.run) && payload.run !== null)) {
    throw new Error('Invalid run history payload');
  }

  const base = buildTerminalRunDetailFromSelectedRun(selectedRun, fallbackShippables);
  const run = isRecord(payload.run) ? payload.run : null;
  if (!run) return base;

  const assetPackCompletion = readAssetPackCompletion(run);
  const assetPackSynthesisArtifacts =
    coerceShippableSurface(assetPackCompletion?.assetPackSynthesisArtifacts) ||
    coerceShippableSurface(run.asset_pack_synthesis_artifacts) ||
    coerceShippableSurface(run.assetPackSynthesisArtifacts);
  const writtenAssets =
    coerceShippableSurface(assetPackCompletion?.writtenAssets) ||
    assetPackSynthesisArtifacts ||
    coerceShippableSurface(run.written_assets) ||
    base.writtenAssets;
  const deliveryMechanism =
    coerceShippableSurface(assetPackCompletion?.deliveryMechanism) ||
    coerceShippableSurface(run.delivery_mechanism) ||
    coerceShippableSurface(assetPackCompletion?.shippables) ||
    coerceShippableSurface(run.shippables) ||
    base.deliveryMechanism;
  const shippables =
    buildPullRequestShippableSurface(coerceShippableSurface(assetPackCompletion?.shippables)) ||
    buildPullRequestShippableSurface(coerceShippableSurface(run.shippables)) ||
    buildPullRequestShippableSurface(deliveryMechanism) ||
    base.shippables ||
    null;
  const repoSnapshot =
    coerceRepoSnapshot(run.repo_snapshot) || coerceRepoSnapshot(assetPackCompletion?.repoSnapshot) || base.repoSnapshot;
  const closureFollowThrough =
    coerceClosureFollowThrough(assetPackCompletion?.closureFollowThrough) || base.closureFollowThrough;
  const closureState = coerceClosureState(assetPackCompletion?.closurePanels) || base.closureState;
  const ledgerSettlement =
    coerceLedgerSettlement(run.ledger_settlement) ||
    coerceLedgerSettlement(assetPackCompletion?.ledgerSettlement) ||
    base.ledgerSettlement;
  const terminalJournal =
    coerceTerminalJournalReadback((payload as TerminalRunHistoryPayload & { terminal_journal?: unknown }).terminal_journal) ||
    coerceTerminalJournalReadback(run.terminal_journal) ||
    coerceTerminalJournalReadback(isRecord(run.output) ? run.output.terminal_journal : null) ||
    base.terminalJournal;
  const organizationAuthority =
    coerceOrganizationAuthority(run.organization_authority) ||
    coerceOrganizationAuthority(run.organizationAuthority) ||
    coerceOrganizationAuthority(isRecord(run.output) ? run.output.organizationAuthority : null) ||
    coerceOrganizationAuthority(assetPackCompletion?.organizationAuthority) ||
    coerceOrganizationAuthority(assetPackCompletion?.interfaceAuthority) ||
    base.organizationAuthority;
  const bitcodeActivityState =
    coerceBitcodeActivityState(assetPackCompletion?.bitcodeActivityState) || base.bitcodeActivityState;
  const runProcessingStats = coerceProcessingStats(run.processing_stats);
  const assetPackCompletionProcessingStats = coerceProcessingStats(assetPackCompletion?.processingStats);
  const hasRunProcessingStats =
    runProcessingStats.time ||
    runProcessingStats.tokenTotal !== null ||
    runProcessingStats.measuredBtd !== null ||
    runProcessingStats.btcFeeUsdEquivalent !== null ||
    runProcessingStats.averageLatencyMs !== null;
  const processingStats = hasRunProcessingStats ? runProcessingStats : assetPackCompletionProcessingStats;

  return {
    summary:
      coerceString(run.summary) ||
      coerceString(assetPackCompletion?.summary) ||
      base.summary ||
      assetPackSynthesisArtifacts?.summary ||
      writtenAssets?.summary ||
      shippables?.summary ||
      null,
    assetPackSynthesisArtifacts,
    writtenAssets,
    shippables,
    deliveryMechanism,
    repoSnapshot,
    processingStats: {
      time: processingStats.time || base.processingStats.time,
      tokenTotal: processingStats.tokenTotal ?? base.processingStats.tokenTotal,
      measuredBtd: processingStats.measuredBtd ?? base.processingStats.measuredBtd,
      btcFeeUsdEquivalent: processingStats.btcFeeUsdEquivalent ?? base.processingStats.btcFeeUsdEquivalent,
      averageLatencyMs: processingStats.averageLatencyMs ?? base.processingStats.averageLatencyMs,
    },
    proofStatus: base.proofStatus,
    closureFocus: base.closureFocus,
    closureFollowThrough,
    closureState,
    ledgerSettlement,
    terminalJournal,
    organizationAuthority,
    bitcodeActivityState,
    historyItemCount: Array.isArray(run.items) ? run.items.length : base.historyItemCount,
    eventCount: Array.isArray((payload as TerminalRunHistoryPayload).events)
      ? (payload as TerminalRunHistoryPayload).events!.length
      : 0,
  };
}
