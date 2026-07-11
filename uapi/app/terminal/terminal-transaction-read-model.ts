import type {
  TransactionDataMode,
} from '@/components/bitcode/execution/bitcode-transaction-types';
import { buildExchangeHref, buildTerminalHref } from './terminal-routes';
import {
  readTerminalTransactionId,
  type TerminalTransactionDetailSection,
  writeTerminalTransactionDetailSection,
  writeTerminalTransactionId,
} from './terminal-transaction-query';
import type { TerminalRunDetailSnapshot } from './terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from './terminal-run-data';
import { normalizeTerminalTransactions, type TerminalTransactionRecord } from './terminal-transactions';

export type TerminalTransactionSectionAvailability = 'available' | 'empty' | 'blocked';
export type TerminalTransactionFactFamily =
  | 'delivery'
  | 'identity'
  | 'wallet'
  | 'authority'
  | 'settlement'
  | 'proof'
  | 'ledger'
  | 'execution';

export type TerminalTransactionSectionReadModel = {
  id: TerminalTransactionDetailSection;
  label: string;
  summary: string;
  targetId: string;
  routeHref: string;
  availability: TerminalTransactionSectionAvailability;
  blocker: string | null;
  factFamily: TerminalTransactionFactFamily;
  metricCount: number;
  rowCount: number;
  payloadAvailable: boolean;
};

export type TerminalTransactionLowDetailReadModel = {
  title: string;
  summary: string;
  proofPosture: string;
  metrics: Array<{ label: string; value: string }>;
  postureChips: string[];
};

export type TerminalTransactionRouteReadModel = {
  transactionId: string;
  routeTransactionId: string | null;
  activeSection: TerminalTransactionDetailSection;
  href: string;
  exchangeHref: string;
  selectionRecoverable: boolean;
};

export type TerminalTransactionReadModel = {
  transaction: TerminalTransactionRecord;
  dataMode: TransactionDataMode;
  route: TerminalTransactionRouteReadModel;
  lowDetail: TerminalTransactionLowDetailReadModel;
  sections: TerminalTransactionSectionReadModel[];
  activeSection: TerminalTransactionSectionReadModel;
  expandableDetail: {
    rawPayloadAvailable: boolean;
    detailPayloadAvailable: boolean;
    auditSectionsAvailable: number;
  };
};

const SECTION_DEFINITIONS: Array<{
  id: TerminalTransactionDetailSection;
  label: string;
  targetId: string;
  summary: string;
  factFamily: TerminalTransactionFactFamily;
}> = [
  {
    id: 'shippables',
    label: 'Shippables',
    targetId: 'terminalTransactionShippables',
    summary: 'Finish-delivered pull-request output and source-safe AssetPack evidence.',
    factFamily: 'delivery',
  },
  {
    id: 'transaction',
    label: 'Identity',
    targetId: 'terminalTransactionTransaction',
    summary: 'Transaction identity, route selection, repository, participant, and timing facts.',
    factFamily: 'identity',
  },
  {
    id: 'wallet-btc',
    label: 'Wallet/BTC',
    targetId: 'terminalTransactionWalletBtc',
    summary: 'Wallet signer session, BTC fee quote, PSBT handoff, broadcast, finality, and blocked readiness.',
    factFamily: 'wallet',
  },
  {
    id: 'authority',
    label: 'Authority',
    targetId: 'terminalTransactionAuthority',
    summary: 'Organization role, read-license, settlement, confirmation, and interface authority decisions.',
    factFamily: 'authority',
  },
  {
    id: 'closure',
    label: 'Closure',
    targetId: 'terminalTransactionClosure',
    summary: 'Closure posture, settlement metrics, branch artifacts, and follow-through controls.',
    factFamily: 'settlement',
  },
  {
    id: 'proofs',
    label: 'Proofs',
    targetId: 'terminalTransactionProofs',
    summary: 'Proof posture, proof-family artifacts, and bounded verification facts.',
    factFamily: 'proof',
  },
  {
    id: 'history',
    label: 'History',
    targetId: 'terminalTransactionHistory',
    summary: 'Recent execution history and ledger-linked continuity for this activity.',
    factFamily: 'execution',
  },
  {
    id: 'journal',
    label: 'Journal',
    targetId: 'terminalTransactionJournal',
    summary: 'Journal rows, ledger observations, database projections, and repair receipts.',
    factFamily: 'ledger',
  },
  {
    id: 'activity',
    label: 'Execution stream',
    targetId: 'terminalTransactionActivity',
    summary: 'Retained execution stream, work updates, and activity telemetry posture.',
    factFamily: 'execution',
  },
  {
    id: 'console',
    label: 'Console',
    targetId: 'terminalTransactionConsole',
    summary: 'Detailed execution console for live execution-history rows.',
    factFamily: 'execution',
  },
];

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

function countShippableSurfaces(detail: TerminalRunDetailSnapshot | null) {
  let count = 0;
  if (detail?.shippables?.pullRequest || detail?.deliveryMechanism?.pullRequest) count += 1;
  if (detail?.writtenAssets?.fileChanges || detail?.writtenAssets?.summary) count += 1;
  return count;
}

function countJournalRows(detail: TerminalRunDetailSnapshot | null) {
  return (
    (detail?.terminalJournal?.entries.length || 0) +
    (detail?.terminalJournal?.repairs.length || 0) +
    (detail?.terminalJournal?.readErrors.length || 0)
  );
}

function countBtdSettlementReceipts(detail: TerminalRunDetailSnapshot | null) {
  return [
    detail?.ledgerSettlement?.assetPackMintReceipt,
    detail?.ledgerSettlement?.readReceipt,
    detail?.ledgerSettlement?.rightsTransferReceipt,
  ].filter(Boolean).length;
}

function createSectionHref(
  searchParams: URLSearchParams,
  transactionId: string,
  detailSection: TerminalTransactionDetailSection,
) {
  return buildTerminalHref(
    writeTerminalTransactionDetailSection(
      writeTerminalTransactionId(searchParams, transactionId),
      detailSection,
    ),
  );
}

function createExchangeSectionHref(
  searchParams: URLSearchParams,
  transactionId: string,
  detailSection: TerminalTransactionDetailSection,
) {
  return buildExchangeHref(
    writeTerminalTransactionDetailSection(
      writeTerminalTransactionId(searchParams, transactionId),
      detailSection,
    ),
  );
}

function resolveSectionAvailability({
  sectionId,
  selectedRun,
  detail,
  dataMode,
}: {
  sectionId: TerminalTransactionDetailSection;
  selectedRun: WorkspaceRun;
  detail: TerminalRunDetailSnapshot | null;
  dataMode: TransactionDataMode;
}): Pick<TerminalTransactionSectionReadModel, 'availability' | 'blocker' | 'metricCount' | 'rowCount' | 'payloadAvailable'> {
  if (sectionId === 'console') {
    const consoleAvailable = dataMode === 'live' && selectedRun.sourceModel === 'execution-history';
    return {
      availability: consoleAvailable ? 'available' : 'blocked',
      blocker: consoleAvailable
        ? null
        : 'Console detail is available only for live execution-history rows.',
      metricCount: 0,
      rowCount: 0,
      payloadAvailable: consoleAvailable,
    };
  }

  if (sectionId === 'shippables') {
    const shippableCount = countShippableSurfaces(detail);
    return {
      availability: shippableCount > 0 ? 'available' : 'empty',
      blocker: shippableCount > 0 ? null : 'No source-safe Shippables or paid delivery evidence is attached yet.',
      metricCount: 1,
      rowCount: detail?.shippables?.pullRequest || detail?.deliveryMechanism?.pullRequest ? 1 : 0,
      payloadAvailable: shippableCount > 0,
    };
  }

  if (sectionId === 'transaction') {
    return {
      availability: 'available',
      blocker: null,
      metricCount: 4,
      rowCount: detail ? 8 : 5,
      payloadAvailable: Boolean(detail),
    };
  }

  if (sectionId === 'wallet-btc') {
    const hasWalletBtc =
      Boolean(detail?.ledgerSettlement?.btcFee) ||
      Boolean(detail?.ledgerSettlement?.btcFeeReceiptId) ||
      Boolean(detail?.ledgerSettlement?.ownershipBoundary);
    return {
      availability: hasWalletBtc ? 'available' : 'empty',
      blocker: hasWalletBtc
        ? null
        : 'No wallet signer session, BTC fee quote, PSBT, or finality readback is attached yet.',
      metricCount: 4,
      rowCount: hasWalletBtc ? 8 : 0,
      payloadAvailable: hasWalletBtc,
    };
  }

  if (sectionId === 'authority') {
    const decisionCount = detail?.organizationAuthority?.length || 0;
    return {
      availability: decisionCount > 0 ? 'available' : 'empty',
      blocker: decisionCount > 0
        ? null
        : 'No organization role, read-license, settlement, or interface authority projection is attached yet.',
      metricCount: 4,
      rowCount: decisionCount,
      payloadAvailable: decisionCount > 0,
    };
  }

  if (sectionId === 'closure') {
    const receiptCount = countBtdSettlementReceipts(detail);
    const hasClosure =
      Boolean(detail?.closureState) ||
      Boolean(detail?.closureFollowThrough) ||
      Boolean(detail?.ledgerSettlement) ||
      receiptCount > 0 ||
      Boolean(detail?.processingStats.tokenTotal);
    return {
      availability: hasClosure ? 'available' : 'empty',
      blocker: hasClosure ? null : 'Closure, settlement, and processing detail has not been projected for this row yet.',
      metricCount: detail?.closureFollowThrough?.settlementMetrics.length || receiptCount || 4,
      rowCount: (detail?.closureFollowThrough?.branchArtifacts.length || 0) + receiptCount,
      payloadAvailable: hasClosure,
    };
  }

  if (sectionId === 'proofs') {
    const proofCount = detail?.closureFollowThrough?.proofFamilies.length || 0;
    const hasProof = proofCount > 0 || Boolean(detail?.proofStatus || selectedRun.proofStatus);
    return {
      availability: hasProof ? 'available' : 'empty',
      blocker: hasProof ? null : 'No proof-family detail is attached yet.',
      metricCount: proofCount || 1,
      rowCount: proofCount,
      payloadAvailable: hasProof,
    };
  }

  if (sectionId === 'history') {
    const historyCount = detail?.historyItemCount ?? selectedRun.itemCount ?? 0;
    const recentHistoryCount = detail?.closureFollowThrough?.recentHistory.length || 0;
    return {
      availability: historyCount > 0 || recentHistoryCount > 0 ? 'available' : 'empty',
      blocker: historyCount > 0 || recentHistoryCount > 0 ? null : 'No retained history rows are attached yet.',
      metricCount: 2,
      rowCount: historyCount + recentHistoryCount,
      payloadAvailable: historyCount > 0 || recentHistoryCount > 0,
    };
  }

  if (sectionId === 'journal') {
    const journalRows = countJournalRows(detail);
    const receiptCount = countBtdSettlementReceipts(detail);
    const hasLedger = journalRows > 0 || receiptCount > 0 || Boolean(detail?.ledgerSettlement);
    return {
      availability: hasLedger ? 'available' : 'empty',
      blocker: hasLedger ? null : 'No journal readback, ledger observation, or repair receipt is attached yet.',
      metricCount: 3,
      rowCount: journalRows + receiptCount,
      payloadAvailable: hasLedger,
    };
  }

  const eventCount = detail?.eventCount || 0;
  return {
    availability: eventCount > 0 || selectedRun.sourceModel === 'execution-history' ? 'available' : 'empty',
    blocker:
      eventCount > 0 || selectedRun.sourceModel === 'execution-history'
        ? null
        : 'Execution-stream events are not attached to this projected row yet.',
    metricCount: 2,
    rowCount: eventCount,
    payloadAvailable: eventCount > 0,
  };
}

export function buildTerminalTransactionReadModel({
  selectedRun,
  detail,
  detailSection,
  dataMode,
  searchParams = new URLSearchParams(),
}: {
  selectedRun: WorkspaceRun;
  detail: TerminalRunDetailSnapshot | null;
  detailSection: TerminalTransactionDetailSection;
  dataMode: TransactionDataMode;
  searchParams?: URLSearchParams;
}): TerminalTransactionReadModel {
  const transaction = normalizeTerminalTransactions([selectedRun])[0];
  const routeTransactionId = readTerminalTransactionId(searchParams);
  const route: TerminalTransactionRouteReadModel = {
    transactionId: selectedRun.id,
    routeTransactionId,
    activeSection: detailSection,
    href: createSectionHref(searchParams, selectedRun.id, detailSection),
    exchangeHref: createExchangeSectionHref(searchParams, selectedRun.id, detailSection),
    selectionRecoverable: routeTransactionId === selectedRun.id,
  };
  const sections = SECTION_DEFINITIONS.map((definition) => ({
    ...definition,
    routeHref: createSectionHref(searchParams, selectedRun.id, definition.id),
    ...resolveSectionAvailability({
      sectionId: definition.id,
      selectedRun,
      detail,
      dataMode,
    }),
  }));
  const activeSection =
    sections.find((section) => section.id === detailSection) ||
    sections.find((section) => section.id === 'shippables') ||
    sections[0];
  const postureChips = [
    transaction.transactionLens,
    transaction.status,
    transaction.repository,
    activeSection.availability === 'blocked' ? 'blocked detail' : activeSection.factFamily,
  ].filter(Boolean);
  const rawPayloadAvailable = Boolean(detail);
  const auditSectionsAvailable = sections.filter((section) => section.payloadAvailable).length;

  return {
    transaction,
    dataMode,
    route,
    lowDetail: {
      title: transaction.typeLabel || transaction.type,
      summary:
        detail?.summary ||
        transaction.summary ||
        'Selected Terminal transaction is loaded for typed operator review.',
      proofPosture: detail?.proofStatus || transaction.proofStatus || 'closure state in flight',
      metrics: [
        { label: 'Shippables', value: formatNumber(countShippableSurfaces(detail)) },
        { label: 'History items', value: formatNumber(detail?.historyItemCount ?? transaction.itemCount) },
        { label: 'Measured $BTD', value: formatNumber(detail?.processingStats.measuredBtd ?? transaction.measuredBtd, { maximumFractionDigits: 1 }) },
        { label: 'BTC fee basis', value: formatUsd(detail?.processingStats.btcFeeUsdEquivalent ?? transaction.btcFeeUsdEquivalent) },
      ],
      postureChips,
    },
    sections,
    activeSection,
    expandableDetail: {
      rawPayloadAvailable,
      detailPayloadAvailable: sections.some((section) => section.payloadAvailable),
      auditSectionsAvailable,
    },
  };
}
