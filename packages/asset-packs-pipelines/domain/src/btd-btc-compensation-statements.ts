import { createHash } from 'node:crypto';
import type {
  AssetPackSettlementRightsDeliveryBoundary,
  AssetPackSettlementRightsDeliveryState,
} from './asset-pack-settlement-rights-delivery';

export type BtdBtcAccountingState =
  | 'settlement-accounted'
  | 'pending-btc-finality'
  | 'repair-required'
  | 'withheld-before-settlement';

export type BtdRangeAccountingState =
  | 'transferred-to-reader'
  | 'allocated-pending-rights'
  | 'withheld-before-settlement';

export type BtcSettlementAccountingState =
  | 'final-settlement-observed'
  | 'observed-payment-pending-finality'
  | 'repair-required';

export type ContributorCompensationStatementState =
  | 'allocated'
  | 'pending-settlement-finality'
  | 'repair-required';

export interface BtdRangeAccountingStatement {
  schema: 'bitcode.asset-pack.btd-range-accounting-statement';
  assetPackId: string;
  rangeState: BtdRangeAccountingState;
  tokenCount: number;
  rangeStart: number | null;
  rangeEndExclusive: number | null;
  rangeSliceCount: number;
  rightsTransferRoot: string | null;
  readReceiptRoot: string | null;
  statementRoot: string;
}

export interface BtcSettlementAccountingStatement {
  schema: 'bitcode.asset-pack.btc-settlement-accounting-statement';
  state: BtcSettlementAccountingState;
  valueLabel: 'observed-payment' | 'final-settlement' | 'repair-state';
  priceAsset: 'BTC';
  btcNetwork: 'testnet' | 'mainnet' | 'signet' | 'regtest';
  expectedSats: number;
  observedDebitSats: number;
  observedCreditSats: number;
  txid: string;
  confirmations: number;
  finalityState: string;
  finalityRoot: string;
  paymentReceiptRoot: string;
  serverCustody: false;
  statementRoot: string;
}

export interface ContributorCompensationStatement {
  schema: 'bitcode.asset-pack.contributor-compensation-statement';
  statementId: string;
  contributorRef: string;
  depositId: string;
  assetPackId: string;
  state: ContributorCompensationStatementState;
  valueLabel: 'contributor-allocation';
  shareBps: number;
  allocatedSats: number;
  rangeTokenCount: number;
  allocationRoot: string;
  rangeSliceRoot: string | null;
  sourceToSharesRoot: string | null;
  settlementId: string;
  proofRoot: string;
}

export interface DepositorEarningSummary {
  schema: 'bitcode.deposit.depositor-earning-summary';
  depositorWalletId: string;
  state: ContributorCompensationStatementState;
  valueLabel: 'contributor-allocation';
  contributorStatementCount: number;
  allocatedSats: number;
  shareBps: number;
  settlementId: string;
  summaryRoot: string;
}

export interface TreasuryRouteStatement {
  schema: 'bitcode.asset-pack.treasury-route-statement';
  routeId: string;
  routeState: 'routed' | 'pending-finality' | 'repair-required';
  fromWalletId: string;
  toWalletId: string;
  routeKind: 'reader-to-contributor-source-to-shares';
  priceAsset: 'BTC';
  amountSats: number;
  serverCustody: false;
  walletPrivateMaterialVisible: false;
  routeRoot: string;
}

export interface BtdBtcReconciliationStatement {
  schema: 'bitcode.asset-pack.btd-btc-reconciliation-statement';
  state: string;
  blocking: boolean;
  ledgerDatabaseObjectStorageAligned: boolean;
  repairActionCount: number;
  reconciliationRoot: string;
  statementRoot: string;
}

export interface BtdBtcRepairStatement {
  schema: 'bitcode.asset-pack.btd-btc-repair-statement';
  state: AssetPackSettlementRightsDeliveryState;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  repairRoot: string;
  statementRoot: string;
}

export interface BtdBtcCompensationStatements {
  schema: 'bitcode.asset-pack.btd-btc-compensation-statements';
  statements: 'BtdBtcCompensationStatements';
  createdAt: string;
  assetPackId: string;
  readId: string;
  orderId: string;
  state: BtdBtcAccountingState;
  settlementBoundaryState: AssetPackSettlementRightsDeliveryState;
  valueLabels: [
    'observed-payment',
    'final-settlement',
    'contributor-allocation',
    'delivery',
    'repair-state',
  ];
  btdRange: BtdRangeAccountingStatement;
  btcSettlement: BtcSettlementAccountingStatement;
  contributorCompensationStatements: ContributorCompensationStatement[];
  depositorEarningSummaries: DepositorEarningSummary[];
  treasuryRoutes: TreasuryRouteStatement[];
  reconciliation: BtdBtcReconciliationStatement;
  repair: BtdBtcRepairStatement;
  aggregate: {
    finalSettlementSats: number;
    allocatedContributorSats: number;
    unallocatedSats: number;
    contributorCount: number;
    depositorCount: number;
    settlementConservationState: string;
    sourceToSharesAdmissible: boolean;
    ledgerDatabaseObjectStorageReconciled: boolean;
    sourceBearingDeliveryUnlockedToReader: boolean;
    aggregateRoot: string;
  };
  disclosure: {
    sourceSafeMetadataOnly: true;
    protectedSourcePayloadSerialized: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    valueBearingMainnetAdmitted: false;
  };
  roots: {
    accountingRoot: string;
    settlementBoundaryRoot: string;
    btdRangeStatementRoot: string;
    btcSettlementStatementRoot: string;
    contributorStatementRoots: string[];
    depositorSummaryRoots: string[];
    treasuryRouteRoots: string[];
    reconciliationStatementRoot: string;
    repairStatementRoot: string;
    aggregateRoot: string;
  };
}

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'protected_source_payload',
  'private_settlement_payload',
  'value_bearing_mainnet',
];

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function root(prefix: string, value: unknown) {
  return `${prefix}:${createHash('sha256').update(stableStringify(value)).digest('hex').slice(0, 24)}`;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function arrayValue(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map(recordValue).filter((entry) => Object.keys(entry).length > 0)
    : [];
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function proofRecord(boundary: AssetPackSettlementRightsDeliveryBoundary) {
  return recordValue(boundary.sourceToSharesProof);
}

function settlementConservation(boundary: AssetPackSettlementRightsDeliveryBoundary) {
  return recordValue(proofRecord(boundary).settlementConservation);
}

function sourceToSharesAdmissible(boundary: AssetPackSettlementRightsDeliveryBoundary) {
  const conservation = settlementConservation(boundary);
  return conservation.state === 'balanced' && conservation.settlementAdmissible === true;
}

function accountingState(boundary: AssetPackSettlementRightsDeliveryBoundary): BtdBtcAccountingState {
  if (boundary.state === 'settlement_delivered') return 'settlement-accounted';
  if (boundary.finalityReceipt.finalityState !== 'confirmed') return 'pending-btc-finality';
  if (boundary.state.includes('repair') || boundary.repairPosture.blockers.length > 0) return 'repair-required';
  return 'withheld-before-settlement';
}

function btcState(boundary: AssetPackSettlementRightsDeliveryBoundary): BtcSettlementAccountingState {
  const paymentMatches =
    boundary.paymentObservation.expectedSats === boundary.paymentObservation.observedDebitSats &&
    boundary.paymentObservation.expectedSats === boundary.paymentObservation.observedCreditSats;
  if (!paymentMatches) return 'repair-required';
  if (boundary.finalityReceipt.finalityState !== 'confirmed') return 'observed-payment-pending-finality';
  return 'final-settlement-observed';
}

function contributorState(boundary: AssetPackSettlementRightsDeliveryBoundary): ContributorCompensationStatementState {
  if (!sourceToSharesAdmissible(boundary)) return 'repair-required';
  if (boundary.finalityReceipt.finalityState !== 'confirmed') return 'pending-settlement-finality';
  return 'allocated';
}

function treasuryRouteState(
  boundary: AssetPackSettlementRightsDeliveryBoundary,
): TreasuryRouteStatement['routeState'] {
  if (!sourceToSharesAdmissible(boundary)) return 'repair-required';
  if (boundary.finalityReceipt.finalityState !== 'confirmed') return 'pending-finality';
  return 'routed';
}

function btdRangeStatement(boundary: AssetPackSettlementRightsDeliveryBoundary): BtdRangeAccountingStatement {
  const proof = proofRecord(boundary);
  const rangeSlices = arrayValue(proof.rangeSlices);
  const tokenCount = rangeSlices.reduce((total, slice) => total + numberValue(slice.tokenCount, 0), 0);
  const starts = rangeSlices
    .map((slice) => numberValue(slice.rangeStart, Number.NaN))
    .filter(Number.isFinite);
  const ends = rangeSlices
    .map((slice) => numberValue(slice.rangeEndExclusive, Number.NaN))
    .filter(Number.isFinite);
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btd-range-accounting-statement' as const,
    assetPackId: boundary.assetPackId,
    rangeState: boundary.rightsTransferReceipt
      ? 'transferred-to-reader' as const
      : boundary.sourceToSharesProof
        ? 'allocated-pending-rights' as const
        : 'withheld-before-settlement' as const,
    tokenCount,
    rangeStart: starts.length ? Math.min(...starts) : null,
    rangeEndExclusive: ends.length ? Math.max(...ends) : null,
    rangeSliceCount: rangeSlices.length,
    rightsTransferRoot: boundary.proofRoots.rightsTransferRoot,
    readReceiptRoot: boundary.proofRoots.btdReadReceiptRoot,
  };
  return {
    ...withoutRoot,
    statementRoot: root('btd-range-accounting-statement', withoutRoot),
  };
}

function btcSettlementStatement(boundary: AssetPackSettlementRightsDeliveryBoundary): BtcSettlementAccountingStatement {
  const state = btcState(boundary);
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btc-settlement-accounting-statement' as const,
    state,
    valueLabel:
      state === 'final-settlement-observed'
        ? 'final-settlement' as const
        : state === 'observed-payment-pending-finality'
          ? 'observed-payment' as const
          : 'repair-state' as const,
    priceAsset: 'BTC' as const,
    btcNetwork: boundary.paymentObservation.btcNetwork,
    expectedSats: boundary.paymentObservation.expectedSats,
    observedDebitSats: boundary.paymentObservation.observedDebitSats,
    observedCreditSats: boundary.paymentObservation.observedCreditSats,
    txid: boundary.paymentObservation.txid,
    confirmations: boundary.finalityReceipt.confirmations,
    finalityState: boundary.finalityReceipt.finalityState,
    finalityRoot: boundary.finalityReceipt.finalityRoot,
    paymentReceiptRoot: boundary.paymentObservation.paymentReceiptRoot,
    serverCustody: false as const,
  };
  return {
    ...withoutRoot,
    statementRoot: root('btc-settlement-accounting-statement', withoutRoot),
  };
}

function contributorStatements(
  boundary: AssetPackSettlementRightsDeliveryBoundary,
): ContributorCompensationStatement[] {
  const proof = proofRecord(boundary);
  const rangeSlicesByDepositId = new Map(
    arrayValue(proof.rangeSlices).map((slice) => [stringValue(slice.depositId), slice]),
  );
  const state = contributorState(boundary);
  return arrayValue(proof.settlementAllocations).map((allocation, index) => {
    const depositId = stringValue(allocation.depositId, `deposit-${index + 1}`);
    const rangeSlice = rangeSlicesByDepositId.get(depositId) || {};
    const withoutRoot = {
      schema: 'bitcode.asset-pack.contributor-compensation-statement' as const,
      statementId: `contributor-compensation-${boundary.orderId}-${index + 1}`,
      contributorRef: stringValue(allocation.depositorWalletId, 'depositor-wallet-unbound'),
      depositId,
      assetPackId: stringValue(allocation.assetPackId, boundary.assetPackId),
      state,
      valueLabel: 'contributor-allocation' as const,
      shareBps: numberValue(allocation.shareBps, 0),
      allocatedSats: numberValue(allocation.allocatedSats, 0),
      rangeTokenCount: numberValue(rangeSlice.tokenCount, 0),
      allocationRoot: stringValue(allocation.allocationRoot, root('allocation', allocation)),
      rangeSliceRoot: stringValue(rangeSlice.sliceRoot, '') || null,
      sourceToSharesRoot: boundary.proofRoots.sourceToSharesRoot,
      settlementId: boundary.orderId,
    };
    return {
      ...withoutRoot,
      proofRoot: root('contributor-compensation-statement', withoutRoot),
    };
  });
}

function depositorSummaries(
  boundary: AssetPackSettlementRightsDeliveryBoundary,
  statements: ContributorCompensationStatement[],
): DepositorEarningSummary[] {
  const byWallet = new Map<string, ContributorCompensationStatement[]>();
  for (const statement of statements) {
    const entries = byWallet.get(statement.contributorRef) || [];
    entries.push(statement);
    byWallet.set(statement.contributorRef, entries);
  }
  return [...byWallet.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([depositorWalletId, entries]) => {
      const allocatedSats = entries.reduce((total, entry) => total + entry.allocatedSats, 0);
      const shareBps = entries.reduce((total, entry) => total + entry.shareBps, 0);
      const withoutRoot = {
        schema: 'bitcode.deposit.depositor-earning-summary' as const,
        depositorWalletId,
        state: contributorState(boundary),
        valueLabel: 'contributor-allocation' as const,
        contributorStatementCount: entries.length,
        allocatedSats,
        shareBps,
        settlementId: boundary.orderId,
      };
      return {
        ...withoutRoot,
        summaryRoot: root('depositor-earning-summary', withoutRoot),
      };
    });
}

function treasuryRoutes(
  boundary: AssetPackSettlementRightsDeliveryBoundary,
  statements: ContributorCompensationStatement[],
): TreasuryRouteStatement[] {
  return statements.map((statement, index) => {
    const withoutRoot = {
      schema: 'bitcode.asset-pack.treasury-route-statement' as const,
      routeId: `treasury-route-${boundary.orderId}-${index + 1}`,
      routeState: treasuryRouteState(boundary),
      fromWalletId: boundary.paymentObservation.payerWalletId,
      toWalletId: statement.contributorRef,
      routeKind: 'reader-to-contributor-source-to-shares' as const,
      priceAsset: 'BTC' as const,
      amountSats: statement.allocatedSats,
      serverCustody: false as const,
      walletPrivateMaterialVisible: false as const,
    };
    return {
      ...withoutRoot,
      routeRoot: root('treasury-route-statement', withoutRoot),
    };
  });
}

function reconciliationStatement(boundary: AssetPackSettlementRightsDeliveryBoundary): BtdBtcReconciliationStatement {
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btd-btc-reconciliation-statement' as const,
    state: boundary.reconciliationReport.state,
    blocking: boundary.reconciliationReport.blocking,
    ledgerDatabaseObjectStorageAligned:
      boundary.reconciliationReport.state === 'aligned' && boundary.reconciliationReport.blocking === false,
    repairActionCount: boundary.reconciliationReport.repairActions.length,
    reconciliationRoot: boundary.proofRoots.reconciliationRoot,
  };
  return {
    ...withoutRoot,
    statementRoot: root('btd-btc-reconciliation-statement', withoutRoot),
  };
}

function repairStatement(boundary: AssetPackSettlementRightsDeliveryBoundary): BtdBtcRepairStatement {
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btd-btc-repair-statement' as const,
    state: boundary.repairPosture.state,
    blockers: [...boundary.repairPosture.blockers],
    warnings: [...boundary.repairPosture.warnings],
    nextActions: [...boundary.repairPosture.nextActions],
    repairRoot: boundary.repairPosture.repairRoot,
  };
  return {
    ...withoutRoot,
    statementRoot: root('btd-btc-repair-statement', withoutRoot),
  };
}

export function buildBtdBtcCompensationStatements(input: {
  settlementBoundary: AssetPackSettlementRightsDeliveryBoundary;
  createdAt?: string | null;
}): BtdBtcCompensationStatements {
  const boundary = input.settlementBoundary;
  const btdRange = btdRangeStatement(boundary);
  const btcSettlement = btcSettlementStatement(boundary);
  const contributorCompensationStatements = contributorStatements(boundary);
  const depositorEarningSummaries = depositorSummaries(boundary, contributorCompensationStatements);
  const routes = treasuryRoutes(boundary, contributorCompensationStatements);
  const reconciliation = reconciliationStatement(boundary);
  const repair = repairStatement(boundary);
  const conservation = settlementConservation(boundary);
  const allocatedContributorSats = contributorCompensationStatements.reduce(
    (total, statement) => total + statement.allocatedSats,
    0,
  );
  const aggregateWithoutRoot = {
    finalSettlementSats: boundary.paymentObservation.observedCreditSats,
    allocatedContributorSats,
    unallocatedSats: boundary.paymentObservation.observedCreditSats - allocatedContributorSats,
    contributorCount: contributorCompensationStatements.length,
    depositorCount: depositorEarningSummaries.length,
    settlementConservationState: stringValue(conservation.state, 'not-recorded'),
    sourceToSharesAdmissible: sourceToSharesAdmissible(boundary),
    ledgerDatabaseObjectStorageReconciled: reconciliation.ledgerDatabaseObjectStorageAligned,
    sourceBearingDeliveryUnlockedToReader: boundary.sourceSafety.sourceBearingDeliveryUnlockedToReader,
  };
  const aggregateRoot = root('btd-btc-compensation-aggregate', aggregateWithoutRoot);
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btd-btc-compensation-statements' as const,
    statements: 'BtdBtcCompensationStatements' as const,
    createdAt: input.createdAt || new Date(0).toISOString(),
    assetPackId: boundary.assetPackId,
    readId: boundary.readId,
    orderId: boundary.orderId,
    state: accountingState(boundary),
    settlementBoundaryState: boundary.state,
    valueLabels: [
      'observed-payment',
      'final-settlement',
      'contributor-allocation',
      'delivery',
      'repair-state',
    ] as BtdBtcCompensationStatements['valueLabels'],
    btdRange,
    btcSettlement,
    contributorCompensationStatements,
    depositorEarningSummaries,
    treasuryRoutes: routes,
    reconciliation,
    repair,
    aggregate: {
      ...aggregateWithoutRoot,
      aggregateRoot,
    },
    disclosure: {
      sourceSafeMetadataOnly: true as const,
      protectedSourcePayloadSerialized: false as const,
      rawSourceTextVisible: false as const,
      unpaidAssetPackSourceVisible: false as const,
      rawPromptVisible: false as const,
      interpolatedPromptVisible: false as const,
      rawProviderResponseVisible: false as const,
      walletPrivateMaterialVisible: false as const,
      settlementPrivatePayloadVisible: false as const,
      valueBearingMainnetAdmitted: false as const,
    },
  };
  const accountingRoot = root('btd-btc-compensation-statements', withoutRoot);
  const statements = {
    ...withoutRoot,
    roots: {
      accountingRoot,
      settlementBoundaryRoot: boundary.proofRoots.boundaryRoot,
      btdRangeStatementRoot: btdRange.statementRoot,
      btcSettlementStatementRoot: btcSettlement.statementRoot,
      contributorStatementRoots: contributorCompensationStatements.map((statement) => statement.proofRoot),
      depositorSummaryRoots: depositorEarningSummaries.map((summary) => summary.summaryRoot),
      treasuryRouteRoots: routes.map((route) => route.routeRoot),
      reconciliationStatementRoot: reconciliation.statementRoot,
      repairStatementRoot: repair.statementRoot,
      aggregateRoot,
    },
  };
  assertBtdBtcCompensationStatementsSourceSafe(statements);
  return statements;
}

export function assertBtdBtcCompensationStatementsSourceSafe(
  statements: BtdBtcCompensationStatements,
): asserts statements is BtdBtcCompensationStatements {
  const serialized = JSON.stringify(statements);
  for (const marker of FORBIDDEN_SOURCE_MARKERS) {
    if (serialized.includes(marker)) {
      throw new Error(`BtdBtcCompensationStatements serialized forbidden payload marker: ${marker}`);
    }
  }
  if (!statements.disclosure.sourceSafeMetadataOnly) {
    throw new Error('BtdBtcCompensationStatements must remain source-safe metadata only.');
  }
  if (statements.disclosure.protectedSourcePayloadSerialized) {
    throw new Error('BtdBtcCompensationStatements must not serialize protected source payloads.');
  }
  if (statements.disclosure.walletPrivateMaterialVisible) {
    throw new Error('BtdBtcCompensationStatements must not expose wallet private material.');
  }
  if (statements.disclosure.settlementPrivatePayloadVisible) {
    throw new Error('BtdBtcCompensationStatements must not expose private settlement payloads.');
  }
  if (statements.disclosure.valueBearingMainnetAdmitted) {
    throw new Error('BtdBtcCompensationStatements must not admit value-bearing mainnet operation.');
  }
}
