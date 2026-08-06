import {
  buildV27CryptoDeploymentLane,
  buildV27CryptoDeploymentReadinessReceipt,
  V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS,
  type V27CryptoDeploymentLaneKind,
  type V27CryptoDeploymentReadinessReceipt,
} from './deployment-lanes';
import {
  buildV27CryptoTelemetryRecord,
  type V27CryptoTelemetryRecord,
  type V27CryptoTelemetrySeverity,
} from './telemetry';
import {
  buildPlannedBtdProtocolUpgradeReceipt,
  type BtdProtocolUpgradeReceipt,
} from './upgrade';
import {
  applyBtdMeasureMint,
  createBtdMeasureMintState,
  type BtdMeasureMintReceipt,
} from './measuremint';
import { allocateAssetPackRange, type AssetPackRange } from './range';
import { buildBtdMintReceipt, type BtdMintReceipt } from './receipts';
import {
  buildPreparedAssetPackLedgerAnchor,
  type AssetPackLedgerAnchor,
} from './ledger-anchor';
import {
  buildJournalEntry,
  diffJournalProjection,
  type JournalDiff,
  type JournalEntry,
} from './journal';
import {
  reconcileLedgerDatabaseProjection,
  type DatabaseProjectedFact,
  type LedgerDatabaseReconciliationReport,
  type LedgerObservedFact,
} from './reconciliation';
import { createBtdSupplyState } from './supply';
import type { BitcoinNetwork, LedgerNetwork } from './constants';

export type OperationalReadinessState =
  | 'ready'
  | 'review'
  | 'blocked'
  | 'disabled'
  | 'future';

export type OperationalHealthSeverity = V27CryptoTelemetrySeverity | 'none';

export interface OperationalLaneRead {
  lane: V27CryptoDeploymentLaneKind;
  label: string;
  bitcoinNetwork: BitcoinNetwork;
  ledgerNetwork: LedgerNetwork;
  valueBearing: boolean;
  state: OperationalReadinessState;
  approvalPosture: string;
  signetProofRequired: boolean;
  telemetryRequired: boolean;
  rollbackPlanRoot: string;
  operationalApprovalRoot: string | null;
  missingEnvironmentKeys: string[];
  readinessReceipt: V27CryptoDeploymentReadinessReceipt | null;
}

export interface OperationalSubsystemRead {
  id: 'btc-broadcaster' | 'ledger-observer';
  label: string;
  state: Extract<OperationalReadinessState, 'ready' | 'review' | 'blocked'>;
  severity: OperationalHealthSeverity;
  summary: string;
  telemetryEventKinds: string[];
}

export interface OperationalUpgradeRead {
  state: BtdProtocolUpgradeReceipt['upgradeState'];
  migrationRoot: string;
  rollbackPlanRoot: string;
  approvalReceiptRoot: string;
  generatedTypeRefresh: {
    state: 'current' | 'pending' | 'blocked';
    source: string;
  };
  receipt: BtdProtocolUpgradeReceipt;
}

export interface OperationalProviderRead {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'generic-git';
  state: OperationalReadinessState;
  summary: string;
}

export interface OperationalSettlementNetworkRead {
  id: 'bitcoin-taproot-psbt' | 'bsc' | 'opbnb' | 'binance-web3-wallet';
  state: OperationalReadinessState;
  summary: string;
}

export interface OperationalMintingRead {
  assetPackId: string;
  measurementReceipt: BtdMeasureMintReceipt;
  assetPackRange: AssetPackRange;
  mintReceipt: BtdMintReceipt;
  journalRows: JournalEntry[];
  journalDiff: JournalDiff;
  ledgerAnchor: AssetPackLedgerAnchor;
  ledgerObservedFacts: LedgerObservedFact[];
  databaseProjectedFacts: DatabaseProjectedFact[];
  ledgerDatabaseReconciliation: LedgerDatabaseReconciliationReport;
}

export interface OperationalHealthRead {
  kind: 'bitcode.operational_health_read';
  lanes: OperationalLaneRead[];
  telemetry: {
    severity: OperationalHealthSeverity;
    records: V27CryptoTelemetryRecord[];
  };
  broadcaster: OperationalSubsystemRead;
  observer: OperationalSubsystemRead;
  upgrade: OperationalUpgradeRead;
  providers: OperationalProviderRead[];
  settlementNetworks: OperationalSettlementNetworkRead[];
  testnetMinting: OperationalMintingRead;
  sourceBasis: string[];
}

export interface BuildOperationalHealthReadInput {
  issuedAt?: string;
  rollbackPlanRoot?: string;
  operationalApprovalRoots?: Partial<Record<V27CryptoDeploymentLaneKind, string>>;
  presentEnvironmentKeysByLane?: Partial<Record<V27CryptoDeploymentLaneKind, string[]>>;
  telemetryRecords?: V27CryptoTelemetryRecord[];
  upgradeReceipt?: BtdProtocolUpgradeReceipt;
  generatedTypeRefreshState?: OperationalUpgradeRead['generatedTypeRefresh']['state'];
}

const DEFAULT_ISSUED_AT = 'operational-health-read';
const DEFAULT_ROLLBACK_PLAN_ROOT = 'operational-rollback-plan-root';

const LANE_CONFIG: Record<
  V27CryptoDeploymentLaneKind,
  {
    label: string;
    bitcoinNetwork: BitcoinNetwork;
    ledgerNetwork: LedgerNetwork;
    requiredEnvironmentKeys: string[];
  }
> = {
  local: {
    label: 'Local',
    bitcoinNetwork: 'regtest',
    ledgerNetwork: 'local',
    requiredEnvironmentKeys: ['BITCODE_CRYPTO_LANE', 'BITCODE_ROLLBACK_PLAN_ROOT'],
  },
  regtest: {
    label: 'Regtest',
    bitcoinNetwork: 'regtest',
    ledgerNetwork: 'regtest',
    requiredEnvironmentKeys: [...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS],
  },
  signet: {
    label: 'Signet',
    bitcoinNetwork: 'signet',
    ledgerNetwork: 'signet',
    requiredEnvironmentKeys: [...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS],
  },
  testnet: {
    label: 'Public testnet',
    bitcoinNetwork: 'testnet',
    ledgerNetwork: 'testnet',
    requiredEnvironmentKeys: [...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS],
  },
  'mainnet-ready': {
    label: 'Mainnet ready',
    bitcoinNetwork: 'mainnet',
    ledgerNetwork: 'mainnet',
    requiredEnvironmentKeys: [...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS],
  },
  'mainnet-value-bearing': {
    label: 'Mainnet value bearing',
    bitcoinNetwork: 'mainnet',
    ledgerNetwork: 'mainnet',
    requiredEnvironmentKeys: [
      ...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS,
      'BITCODE_OPERATIONAL_APPROVAL_ROOT',
    ],
  },
};

const LANE_ORDER = Object.keys(LANE_CONFIG) as V27CryptoDeploymentLaneKind[];

const SEVERITY_RANK: Record<OperationalHealthSeverity, number> = {
  none: 0,
  info: 1,
  warning: 2,
  critical: 3,
};

export function buildOperationalHealthRead(
  input: BuildOperationalHealthReadInput = {},
): OperationalHealthRead {
  const issuedAt = input.issuedAt ?? DEFAULT_ISSUED_AT;
  const rollbackPlanRoot = input.rollbackPlanRoot ?? DEFAULT_ROLLBACK_PLAN_ROOT;
  const telemetryRecords =
    input.telemetryRecords ??
    [
      buildV27CryptoTelemetryRecord({
        event: 'database_projection.repaired',
        subjectId: 'operational-health',
        receiptRoot: 'operational-health-receipt-root',
        issuedAt,
      }),
    ];

  const lanes = LANE_ORDER.map((lane) =>
    buildOperationalLaneRead({
      lane,
      issuedAt,
      rollbackPlanRoot,
      operationalApprovalRoot: input.operationalApprovalRoots?.[lane],
      presentEnvironmentKeys: input.presentEnvironmentKeysByLane?.[lane],
    }),
  );

  return {
    kind: 'bitcode.operational_health_read',
    lanes,
    telemetry: {
      severity: aggregateOperationalTelemetrySeverity(telemetryRecords),
      records: telemetryRecords,
    },
    broadcaster: buildOperationalSubsystemRead({
      id: 'btc-broadcaster',
      records: telemetryRecords,
    }),
    observer: buildOperationalSubsystemRead({
      id: 'ledger-observer',
      records: telemetryRecords,
    }),
    upgrade: buildOperationalUpgradeRead({
      issuedAt,
      rollbackPlanRoot,
      upgradeReceipt: input.upgradeReceipt,
      generatedTypeRefreshState: input.generatedTypeRefreshState,
    }),
    providers: buildOperationalProviderReads(),
    settlementNetworks: buildOperationalSettlementNetworkReads(),
    testnetMinting: buildOperationalMintingRead({ issuedAt }),
    sourceBasis: [
      'packages/btd/src/deployment-lanes.ts',
      'packages/btd/src/telemetry.ts',
      'packages/btd/src/upgrade.ts',
      'packages/btd/src/measuremint.ts',
      'packages/btd/src/range.ts',
      'packages/btd/src/receipts.ts',
      'packages/btd/src/journal.ts',
      'packages/btd/src/ledger-anchor.ts',
      'packages/btd/src/reconciliation.ts',
    ],
  };
}

export function aggregateOperationalTelemetrySeverity(
  records: V27CryptoTelemetryRecord[],
): OperationalHealthSeverity {
  return records.reduce<OperationalHealthSeverity>(
    (current, record) =>
      SEVERITY_RANK[record.severity] > SEVERITY_RANK[current] ? record.severity : current,
    'none',
  );
}

function buildOperationalLaneRead(input: {
  lane: V27CryptoDeploymentLaneKind;
  issuedAt: string;
  rollbackPlanRoot: string;
  operationalApprovalRoot?: string;
  presentEnvironmentKeys?: string[];
}): OperationalLaneRead {
  const config = LANE_CONFIG[input.lane];
  const presentEnvironmentKeys = input.presentEnvironmentKeys ?? config.requiredEnvironmentKeys;
  const operationalApprovalRoot = input.operationalApprovalRoot ?? null;

  if (input.lane === 'mainnet-value-bearing' && !operationalApprovalRoot) {
    return {
      lane: input.lane,
      label: config.label,
      bitcoinNetwork: config.bitcoinNetwork,
      ledgerNetwork: config.ledgerNetwork,
      valueBearing: true,
      state: 'blocked',
      approvalPosture: 'Blocked until an operational approval root is present.',
      signetProofRequired: true,
      telemetryRequired: true,
      rollbackPlanRoot: input.rollbackPlanRoot,
      operationalApprovalRoot,
      missingEnvironmentKeys: ['BITCODE_OPERATIONAL_APPROVAL_ROOT'],
      readinessReceipt: null,
    };
  }

  const deploymentLane = buildV27CryptoDeploymentLane({
    lane: input.lane,
    bitcoinNetwork: config.bitcoinNetwork,
    ledgerNetwork: config.ledgerNetwork,
    rollbackPlanRoot: input.rollbackPlanRoot,
    operationalApprovalRoot: operationalApprovalRoot ?? undefined,
  });
  const readinessReceipt = buildV27CryptoDeploymentReadinessReceipt({
    readinessId: `operational:${input.lane}:readiness`,
    lane: deploymentLane,
    presentEnvironmentKeys,
    requiredEnvironmentKeys: config.requiredEnvironmentKeys,
    issuedAt: input.issuedAt,
  });

  return {
    lane: input.lane,
    label: config.label,
    bitcoinNetwork: config.bitcoinNetwork,
    ledgerNetwork: config.ledgerNetwork,
    valueBearing: deploymentLane.valueBearing,
    state: readinessReceipt.blocking ? 'blocked' : 'ready',
    approvalPosture: describeLaneApprovalPosture(input.lane, operationalApprovalRoot),
    signetProofRequired: deploymentLane.signetProofRequired,
    telemetryRequired: deploymentLane.telemetryRequired,
    rollbackPlanRoot: deploymentLane.rollbackPlanRoot,
    operationalApprovalRoot,
    missingEnvironmentKeys: readinessReceipt.missingEnvironmentKeys,
    readinessReceipt,
  };
}

function describeLaneApprovalPosture(
  lane: V27CryptoDeploymentLaneKind,
  operationalApprovalRoot: string | null,
): string {
  if (lane === 'mainnet-value-bearing') {
    return operationalApprovalRoot
      ? 'Operational approval root present for value-bearing mainnet.'
      : 'Blocked until an operational approval root is present.';
  }

  if (lane === 'mainnet-ready') {
    return 'Non-value mainnet readiness lane; signet proof and rollback roots remain required.';
  }

  if (lane === 'signet') {
    return 'Signet proof lane; no value-bearing mainnet settlement.';
  }

  return 'Non-value lane; no operational approval root required.';
}

function buildOperationalSubsystemRead(input: {
  id: OperationalSubsystemRead['id'];
  records: V27CryptoTelemetryRecord[];
}): OperationalSubsystemRead {
  const eventKinds =
    input.id === 'btc-broadcaster'
      ? [
          'btc_fee.transaction_construction_failed',
          'btc_fee.broadcast_rejected',
          'btc_fee.confirmation_lag',
          'btc_fee.replaced',
        ]
      : ['ledger_anchor.reorged', 'ledger_anchor.failed', 'ledger_provider.disagreement'];
  const matchingRecords = input.records.filter((record) => eventKinds.includes(record.event));
  const severity = aggregateOperationalTelemetrySeverity(matchingRecords);
  const state =
    severity === 'critical' ? 'blocked' : severity === 'warning' ? 'review' : 'ready';

  return {
    id: input.id,
    label: input.id === 'btc-broadcaster' ? 'BTC broadcaster' : 'Ledger observer',
    state,
    severity,
    summary:
      input.id === 'btc-broadcaster'
        ? describeBroadcasterSummary(state)
        : describeObserverSummary(state),
    telemetryEventKinds: eventKinds,
  };
}

function describeBroadcasterSummary(state: OperationalSubsystemRead['state']): string {
  if (state === 'blocked') {
    return 'Broadcast telemetry is critical; signing and fee transaction broadcast cannot be treated as ready.';
  }
  if (state === 'review') {
    return 'Broadcast telemetry requires operator review before value-bearing settlement.';
  }
  return 'Broadcast path is ready for PSBT construction, signing handoff, and transaction submission.';
}

function describeObserverSummary(state: OperationalSubsystemRead['state']): string {
  if (state === 'blocked') {
    return 'Ledger observation is critical; anchors or provider agreement must be repaired before promotion.';
  }
  if (state === 'review') {
    return 'Ledger observation requires review before promotion.';
  }
  return 'Ledger observation is ready for anchor finality and projection comparison.';
}

function buildOperationalUpgradeRead(input: {
  issuedAt: string;
  rollbackPlanRoot: string;
  upgradeReceipt?: BtdProtocolUpgradeReceipt;
  generatedTypeRefreshState?: OperationalUpgradeRead['generatedTypeRefresh']['state'];
}): OperationalUpgradeRead {
  const receipt =
    input.upgradeReceipt ??
    buildPlannedBtdProtocolUpgradeReceipt({
      upgradeId: 'operational-upgrade-readiness',
      fromVersion: 'active-canon',
      toVersion: 'draft-target',
      network: 'signet',
      migrationRoot: 'operational-migration-root',
      preStateRoot: 'operational-pre-state-root',
      approvalReceiptRoot: 'operational-approval-root',
      rollbackPlanRoot: input.rollbackPlanRoot,
      issuedAt: input.issuedAt,
    });

  return {
    state: receipt.upgradeState,
    migrationRoot: receipt.migrationRoot,
    rollbackPlanRoot: receipt.rollbackPlanRoot,
    approvalReceiptRoot: receipt.approvalReceiptRoot,
    generatedTypeRefresh: {
      state: input.generatedTypeRefreshState ?? 'pending',
      source: 'packages/orm/src/types/database.generated.ts',
    },
    receipt,
  };
}

function buildOperationalProviderReads(): OperationalProviderRead[] {
  return [
    {
      provider: 'github',
      state: 'ready',
      summary: 'GitHub repository selection, branch, commit, and PR delivery are the active VCS path.',
    },
    {
      provider: 'gitlab',
      state: 'future',
      summary: 'GitLab is not a launch VCS path for operational reading.',
    },
    {
      provider: 'bitbucket',
      state: 'future',
      summary: 'Bitbucket is not a launch VCS path for operational reading.',
    },
    {
      provider: 'generic-git',
      state: 'future',
      summary: 'Generic Git providers remain outside the current operational admission path.',
    },
  ];
}

function buildOperationalSettlementNetworkReads(): OperationalSettlementNetworkRead[] {
  return [
    {
      id: 'bitcoin-taproot-psbt',
      state: 'ready',
      summary: 'Bitcoin Taproot commitments and PSBT signing are the first-class settlement path.',
    },
    {
      id: 'bsc',
      state: 'disabled',
      summary: 'BSC settlement pilots are disabled until a later Protocol gate explicitly admits them.',
    },
    {
      id: 'opbnb',
      state: 'disabled',
      summary: 'opBNB settlement pilots are disabled until a later Protocol gate explicitly admits them.',
    },
    {
      id: 'binance-web3-wallet',
      state: 'disabled',
      summary: 'Binance Web3 wallet pilots are disabled until a later Protocol gate explicitly admits them.',
    },
  ];
}

function buildOperationalMintingRead(input: {
  issuedAt: string;
}): OperationalMintingRead {
  const assetPackId = 'operational-testnet-asset-pack';
  const measurement = applyBtdMeasureMint({
    state: createBtdMeasureMintState(),
    assetPackId,
    semanticVolume: { normalizedBitcodeVolume: 2n },
    proofRoot: 'operational-measurement-proof-root',
    settlementJournalRoot: 'operational-settlement-journal-root',
    accessPolicyHash: 'operational-access-policy-hash',
    exchangeSequence: 1n,
    issuedAt: input.issuedAt,
  });
  const allocation = allocateAssetPackRange(
    createBtdSupplyState(),
    {
      assetPackId,
      readId: 'operational-read',
      acceptedNeed: true,
      acceptedFit: true,
      sourceManifestRoot: 'operational-source-manifest-root',
      measurementReceiptRoot: measurement.receipt.proofRoot,
      fitReceiptRoot: 'operational-fit-receipt-root',
      proofRoot: 'operational-mint-proof-root',
      dedupeReceiptRoot: 'operational-dedupe-receipt-root',
      settlementJournalRoot: 'operational-settlement-journal-root',
      exchangeReceiptRoot: 'operational-exchange-receipt-root',
      accessPolicyId: 'operational-access-policy',
      accessPolicyHash: 'operational-access-policy-hash',
      normalizedBitcodeVolume: measurement.receipt.normalizedBitcodeVolume,
      tokenCount: Math.max(1, measurement.receipt.tokenCount),
      mintedAtExchangeSequence: 2n,
    },
  );
  const mintReceipt = buildBtdMintReceipt(allocation, input.issuedAt);
  const ledgerAnchor = buildPreparedAssetPackLedgerAnchor({
    anchorId: 'operational-testnet-anchor',
    assetPackId,
    network: 'signet',
    commitmentMethod: 'taproot',
    commitmentRoot: 'operational-anchor-commitment-root',
    sourceManifestRoot: mintReceipt.sourceManifestRoot,
    proofRoot: mintReceipt.proofRoot,
    accessPolicyHash: mintReceipt.accessPolicyHash,
    btdRangeStart: mintReceipt.rangeStart,
    btdRangeEndExclusive: mintReceipt.rangeEndExclusive,
  });
  const journalRows = [
    buildJournalEntry({
      journalEntryId: 'operational-testnet-journal-mint',
      transactionKind: 'asset_pack_mint',
      actorId: 'operational-operator',
      preStateRoot: 'operational-pre-mint-state-root',
      postStateRoot: 'operational-post-mint-state-root',
      receiptRoots: [mintReceipt.proofRoot, mintReceipt.measurementReceiptRoot],
      ledgerAnchorIds: [ledgerAnchor.anchorId],
      exchangeSequence: 3n,
      issuedAt: input.issuedAt,
    }),
    buildJournalEntry({
      journalEntryId: 'operational-testnet-journal-anchor',
      transactionKind: 'asset_pack_anchor',
      actorId: 'operational-operator',
      preStateRoot: 'operational-post-mint-state-root',
      postStateRoot: 'operational-post-anchor-state-root',
      receiptRoots: [ledgerAnchor.commitmentRoot],
      ledgerAnchorIds: [ledgerAnchor.anchorId],
      exchangeSequence: 4n,
      issuedAt: input.issuedAt,
    }),
  ];
  const journalDiff = diffJournalProjection(journalRows[0], {
    journalEntryId: journalRows[0].journalEntryId,
    postStateRoot: journalRows[0].postStateRoot,
    receiptRoots: journalRows[0].receiptRoots,
    ledgerAnchorIds: journalRows[0].ledgerAnchorIds,
  });
  const ledgerObservedFacts: LedgerObservedFact[] = [
    {
      factId: ledgerAnchor.anchorId,
      ledgerRoot: ledgerAnchor.commitmentRoot,
      finalityState: ledgerAnchor.finalityState,
    },
  ];
  const databaseProjectedFacts: DatabaseProjectedFact[] = [
    {
      factId: ledgerAnchor.anchorId,
      projectedLedgerRoot: ledgerAnchor.commitmentRoot,
      projectedFinalityState: ledgerAnchor.finalityState,
    },
  ];

  return {
    assetPackId,
    measurementReceipt: measurement.receipt,
    assetPackRange: allocation.range,
    mintReceipt,
    journalRows,
    journalDiff,
    ledgerAnchor,
    ledgerObservedFacts,
    databaseProjectedFacts,
    ledgerDatabaseReconciliation: reconcileLedgerDatabaseProjection({
      reconciliationId: 'operational-testnet-reconciliation',
      ledgerFacts: ledgerObservedFacts,
      databaseFacts: databaseProjectedFacts,
      metaphysicalFacts: [
        {
          factId: 'operational-need-fit-context',
          factKind: 'need_fit_context',
          canonicalRoot: 'operational-private-need-fit-root',
          receiptRoot: mintReceipt.fitReceiptRoot,
          private: true,
        },
      ],
      issuedAt: input.issuedAt,
    }),
  };
}
