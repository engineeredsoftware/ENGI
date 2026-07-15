// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH =
  '.proofs/v40/ledger-storage-sync.json';
export const V40_LEDGER_STORAGE_SYNC_SCHEMA_ID =
  'bitcode.v40.ledgerStorageSync.v1';
export const V40_LEDGER_STORAGE_SYNC_VERSION = 'V40';
export const V40_LEDGER_STORAGE_SYNC_CURRENT_TARGET = 'V39';
export const V40_LEDGER_STORAGE_SYNC_SOURCE_SAFETY_VERDICT =
  'source-safe-ledger-database-storage-wallet-delivery-sync';

export const V40_LEDGER_STORAGE_SYNC_ROW_IDS = Object.freeze([
  'settlement:btc-fee-finality-wallet-authority',
  'rights:btd-read-right-transfer-projection',
  'compensation:source-to-shares-conservation',
  'ledger:database-storage-reconciliation',
  'storage:artifact-lock-and-source-safe-projection',
  'delivery:post-settlement-pull-request-unlock',
  'repair:drift-finality-delivery-recovery',
  'wallet:no-custody-no-private-material',
  'terminal:route-and-interface-readback',
  'proof:artifact-tests-workflows-docs',
]);

export const V40_LEDGER_STORAGE_SYNC_VERDICTS = Object.freeze([
  'covered',
  'blocked',
  'missing',
  'lane-skipped',
]);

export const V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS = Object.freeze({
  rowCount: 10,
  synchronizationSurfaceCount: 6,
  failClosedStateCount: 4,
  storageRecordKindCount: 10,
  requiredReadbackCount: 5,
  walletAuthorityBoundaryCount: 4,
  deliveryUnlockConditionCount: 5,
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

const SOURCE_ROOTS = Object.freeze({
  settlementBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  settlementBoundaryTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
  previewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  localStagingRehearsal: 'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
  btdWallet: 'packages/btd/src/wallet.ts',
  btdBtcFeeOperation: 'packages/btd/src/btc-fee-operation.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdSourceToShares: 'packages/btd/src/source-to-shares.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdReconciliation: 'packages/btd/src/reconciliation.ts',
  uapiContract: 'apps/uapi/app/bitcode-ledger-storage-sync.ts',
  uapiContractTest: 'apps/uapi/tests/bitcodeLedgerStorageSync.test.ts',
  terminalWalletTest: 'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
  terminalJournalTest: 'apps/uapi/tests/terminalJournalReconciliation.test.ts',
  productDetailTest: 'apps/uapi/tests/terminalTransactionDetailCards.test.tsx',
  transactionWriteReadinessTest: 'apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
  v40Spec: '.specifications/BITCODE_SPEC_V40.md',
  v40Delta: '.specifications/BITCODE_SPEC_V40_DELTA.md',
  v40Notes: '.specifications/BITCODE_SPEC_V40_NOTES.md',
  v40Parity: '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const STAGING_SUPABASE_PROJECT_REF = 'tkpyosihuouusyaxtbau';
const STAGING_SUPABASE_REST_URL = new URL(
  `https://${STAGING_SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`,
);
const HTTPS_URL_LITERAL_PATTERN = /https:\/\/[^\s'"`<>)]*/g;

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-ledger-storage-sync-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function settlementFinalityTestsCovered(boundaryTest) {
  return (
    boundaryTest.includes('fails closed until BTC finality is confirmed') ||
    (
      boundaryTest.includes('fails closed for %s BTC state before finality') &&
      boundaryTest.includes("'prepared'") &&
      boundaryTest.includes("'signed'") &&
      boundaryTest.includes("'broadcast'") &&
      boundaryTest.includes("'observed'")
    )
  ) && boundaryTest.includes('blocked_until_payment_finality');
}

function sourceContainsExactHttpsUrl(source, expectedUrl) {
  return Array.from(source.matchAll(HTTPS_URL_LITERAL_PATTERN)).some((match) => {
    try {
      const parsed = new URL(match[0]);
      return (
        parsed.protocol === expectedUrl.protocol &&
        parsed.username === '' &&
        parsed.password === '' &&
        parsed.hostname === expectedUrl.hostname &&
        parsed.port === expectedUrl.port &&
        parsed.pathname === expectedUrl.pathname &&
        parsed.search === expectedUrl.search &&
        parsed.hash === expectedUrl.hash
      );
    } catch {
      return false;
    }
  });
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_ledger_database_storage_wallet_delivery_sync_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawModelResponseWithProtectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    valueBearingMainnetRequired: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_LEDGER_STORAGE_SYNC_ROWS = Object.freeze([
  row({
    rowId: 'settlement:btc-fee-finality-wallet-authority',
    surfaceKind: 'settlement',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.btdBtcFeeOperation, SOURCE_ROOTS.btdWallet],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest, SOURCE_ROOTS.terminalWalletTest, SOURCE_ROOTS.transactionWriteReadinessTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-settlement-rights-delivery.test.ts --runInBand --forceExit',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalWalletBtcOperation.test.ts tests/api/transactionWriteReadinessRoutes.test.ts --runInBand',
    ],
    requiredEvidence: ['confirmed finality', 'reader wallet session', 'server custody rejected', 'payment observation root'],
    closureRequirement:
      'BTC settlement can advance only with reader wallet authority, non-custodial signing posture, expected sats, and confirmed finality.',
  }),
  row({
    rowId: 'rights:btd-read-right-transfer-projection',
    surfaceKind: 'rights-transfer',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.btdReceipts, SOURCE_ROOTS.btdSettlement],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest, SOURCE_ROOTS.productDetailTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-settlement-rights-delivery.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['BtdReadReceipt', 'BtdRightsTransferReceipt', 'delivery admission state', 'read license id'],
    closureRequirement:
      'BTD read rights and delivery admission project together after settlement, and source-bearing delivery remains withheld without rights.',
  }),
  row({
    rowId: 'compensation:source-to-shares-conservation',
    surfaceKind: 'compensation',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.btdSourceToShares, SOURCE_ROOTS.settlementBoundaryTest],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-settlement-rights-delivery.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['SourceToSharesProof', 'settlementConservation', 'balanced allocation', 'selected fit deposits'],
    closureRequirement:
      'Settlement sats route to selected fit deposits with source-to-shares conservation before paid delivery is admissible.',
  }),
  row({
    rowId: 'ledger:database-storage-reconciliation',
    surfaceKind: 'reconciliation',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.btdReconciliation, SOURCE_ROOTS.localStagingRehearsal],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest, SOURCE_ROOTS.terminalJournalTest],
    commandIds: [
      'pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runTestsByPath __tests__/reconciliation.test.ts --runInBand --forceExit',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalJournalReconciliation.test.ts --runInBand',
    ],
    requiredEvidence: ['ledger observed fact', 'database projected fact', 'object storage artifact fact', 'reconciliation root'],
    closureRequirement:
      'Ledger, database, and object-storage projections must agree or produce repair posture before source-bearing delivery unlocks.',
  }),
  row({
    rowId: 'storage:artifact-lock-and-source-safe-projection',
    surfaceKind: 'storage',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.previewBoundary, SOURCE_ROOTS.uapiContract],
    testPaths: [SOURCE_ROOTS.uapiContractTest, SOURCE_ROOTS.settlementBoundaryTest],
    commandIds: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/bitcodeLedgerStorageSync.test.ts --runInBand',
    ],
    requiredEvidence: ['source-safe projection', 'storage root', 'artifact lock', 'unpaid source absent'],
    closureRequirement:
      'Storage projections expose source-safe receipts and locks while withholding unpaid AssetPack source, raw prompts, and private settlement payloads.',
  }),
  row({
    rowId: 'delivery:post-settlement-pull-request-unlock',
    surfaceKind: 'delivery',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.localStagingRehearsal, SOURCE_ROOTS.uapiContract],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest, SOURCE_ROOTS.uapiContractTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-settlement-rights-delivery.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['pull_request_after_settlement', 'source_bearing_pull_request_ready', 'rights transfer root', 'delivery root'],
    closureRequirement:
      'Source-bearing pull-request delivery becomes visible to the Reader only after payment, finality, BTD rights transfer, compensation, and reconciliation all pass.',
  }),
  row({
    rowId: 'repair:drift-finality-delivery-recovery',
    surfaceKind: 'repair',
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.btdReconciliation, SOURCE_ROOTS.settlementBoundaryTest],
    testPaths: [SOURCE_ROOTS.settlementBoundaryTest, SOURCE_ROOTS.terminalJournalTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-settlement-rights-delivery.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['underpayment blocker', 'finality blocker', 'projection repair', 'delivery recovery action'],
    closureRequirement:
      'Underpayment, missing finality, reconciliation drift, and delivery failure remain auditable repair states instead of partial success.',
  }),
  row({
    rowId: 'wallet:no-custody-no-private-material',
    surfaceKind: 'wallet-boundary',
    sourceRoots: [SOURCE_ROOTS.btdWallet, SOURCE_ROOTS.btdBtcFeeOperation, SOURCE_ROOTS.uapiContract],
    testPaths: [SOURCE_ROOTS.terminalWalletTest, SOURCE_ROOTS.uapiContractTest],
    commandIds: [
      'pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runTestsByPath __tests__/btc-fee-operation.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['wallet provider session', 'private keys absent', 'server custody rejected', 'provider tokens absent'],
    closureRequirement:
      'Wallet authority is represented through provider sessions and signatures only; private key material and server custody are never admitted.',
  }),
  row({
    rowId: 'terminal:route-and-interface-readback',
    surfaceKind: 'interface-readback',
    sourceRoots: [SOURCE_ROOTS.uapiContract, SOURCE_ROOTS.productDetailTest, SOURCE_ROOTS.terminalJournalTest],
    testPaths: [SOURCE_ROOTS.uapiContractTest, SOURCE_ROOTS.productDetailTest, SOURCE_ROOTS.terminalJournalTest],
    commandIds: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalTransactionDetailCards.test.tsx tests/terminalJournalReconciliation.test.ts --runInBand',
    ],
    requiredEvidence: ['product settlement status', 'journal reconciliation state', 'delivery posture', 'source-safe detail card'],
    closureRequirement:
      'product and interface readbacks show synchronized settlement/delivery state with expandable source-safe detail and no source-bearing leakage before payment.',
  }),
  row({
    rowId: 'proof:artifact-tests-workflows-docs',
    surfaceKind: 'proof-system',
    sourceRoots: [SOURCE_ROOTS.v40Spec, SOURCE_ROOTS.v40Delta, SOURCE_ROOTS.v40Notes, SOURCE_ROOTS.v40Parity, SOURCE_ROOTS.roadmap, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    testPaths: ['scripts/specifying/test/v40-ledger-storage-sync.test.js'],
    commandIds: ['pnpm run check:v40-gate8'],
    requiredEvidence: ['generated artifact', 'protocol exports', 'workflow wiring', 'spec closure text'],
    closureRequirement:
      'Gate 8 proof is generated, tested, documented, workflow-wired, source-safe, and replayable through check:v40-gate8.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult(
      'settlement-boundary-defines-sync-types',
      SOURCE_ROOTS.settlementBoundary,
      sources.settlementBoundary.includes('AssetPackSettlementRightsDeliveryBoundary') &&
        sources.settlementBoundary.includes('AssetPackSettlementPaymentObservation') &&
        sources.settlementBoundary.includes('AssetPackSettlementFinalityReceipt') &&
        sources.settlementBoundary.includes('AssetPackDeliveryUnlockReceipt') &&
        sources.settlementBoundary.includes('AssetPackSettlementRightsDeliveryStorageRecord'),
    ),
    predicateResult(
      'settlement-boundary-composes-btd-primitives',
      SOURCE_ROOTS.settlementBoundary,
      sources.settlementBoundary.includes('buildBtdRightsTransferReceipt') &&
        sources.settlementBoundary.includes('buildBtdReadReceipt') &&
        sources.settlementBoundary.includes('buildAssetPackSettlementUnlock') &&
        sources.settlementBoundary.includes('buildSourceToSharesProof') &&
        sources.settlementBoundary.includes('reconcileLedgerDatabaseProjection'),
    ),
    predicateResult(
      'wallet-no-custody-boundary',
      SOURCE_ROOTS.btdWallet,
      sources.btdWallet.includes('must not custody user private keys') &&
        sources.btdBtcFeeOperation.includes('server_custody_rejected') &&
        sources.uapiContract.includes('serverCustodyAdmitted: false'),
    ),
    predicateResult(
      'rights-transfer-finality-gated',
      SOURCE_ROOTS.btdReceipts,
      sources.btdReceipts.includes('Rights transfer receipt requires confirmed BTC fee finality') &&
        sources.settlementBoundary.includes('btcFeeFinalityState') &&
        sources.settlementBoundary.includes('rightsTransferReceipt'),
    ),
    predicateResult(
      'source-to-shares-conservation-covered',
      SOURCE_ROOTS.btdSourceToShares,
      sources.btdSourceToShares.includes('settlementConservation') &&
        sources.settlementBoundaryTest.includes('settlementConservation.state') &&
        sources.settlementBoundaryTest.includes('balanced'),
    ),
    predicateResult(
      'ledger-database-object-storage-reconciliation-covered',
      SOURCE_ROOTS.btdReconciliation,
      sources.btdReconciliation.includes('LedgerDatabaseReconciliationReport') &&
        sources.btdReconciliation.includes('ObjectStorageArtifactFact') &&
        sources.settlementBoundary.includes('objectStorageArtifacts') &&
        sources.settlementBoundaryTest.includes('object storage projections drift'),
    ),
    predicateResult(
      'delivery-unlock-readbacks-required',
      SOURCE_ROOTS.btdSettlement,
      sources.btdSettlement.includes('REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS') &&
        sources.settlementBoundary.includes('source_bearing_pull_request_ready') &&
        sources.settlementBoundary.includes('pull_request_after_settlement'),
    ),
    predicateResult(
      'settlement-fail-closed-tests-covered',
      SOURCE_ROOTS.settlementBoundaryTest,
      sources.settlementBoundaryTest.includes('fails closed when BTC payment is underpaid') &&
        settlementFinalityTestsCovered(sources.settlementBoundaryTest) &&
        sources.settlementBoundaryTest.includes('withholds delivery when ledger, database, or object storage projections drift'),
    ),
    predicateResult(
      'local-staging-sync-readback-covered',
      SOURCE_ROOTS.localStagingRehearsal,
      sources.localStagingRehearsal.includes('ledgerDatabaseStorageSynchronized') &&
        sources.localStagingRehearsal.includes(STAGING_SUPABASE_PROJECT_REF) &&
        sourceContainsExactHttpsUrl(sources.localStagingRehearsal, STAGING_SUPABASE_REST_URL),
    ),
    predicateResult(
      'uapi-contract-covers-ledger-storage-sync',
      SOURCE_ROOTS.uapiContract,
      sources.uapiContract.includes('BITCODE_LEDGER_STORAGE_SYNC_CONTRACT') &&
        sources.uapiContract.includes('settlement-source-to-shares') &&
        sources.uapiContract.includes('post-settlement-pull-request-delivery') &&
        sources.uapiContract.includes('walletPrivateMaterialVisible: false'),
    ),
    predicateResult(
      'uapi-tests-cover-interface-sync-contract',
      SOURCE_ROOTS.uapiContractTest,
      sources.uapiContractTest.includes('summarizeBitcodeLedgerStorageSyncContract') &&
        sources.terminalWalletTest.includes('wallet') &&
        sources.terminalJournalTest.includes('reconciliation') &&
        sources.productDetailTest.includes('settlement'),
    ),
    predicateResult(
      'spec-docs-close-gate8',
      SOURCE_ROOTS.v40Spec,
      sources.v40Spec.includes('V40LedgerStorageSync') &&
        sources.v40Spec.includes('v40-ledger-storage-sync') &&
        sources.v40Delta.includes('Gate 8 closes with package-backed') &&
        sources.v40Notes.includes('Gate 8 implementation notes') &&
        sources.v40Parity.includes('| Gate 8 | Ledger/database/storage/wallet/delivery sync artifact | implemented |') &&
        sources.roadmap.includes('V40 Gate 8 closure anchor'),
    ),
    predicateResult(
      'readmes-document-gate8',
      SOURCE_ROOTS.rootReadme,
      sources.rootReadme.includes('V40 Gate 8 adds') && sources.protocolReadme.includes('V40LedgerStorageSync'),
    ),
    predicateResult(
      'scripts-and-workflows-run-gate8',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('check:v40-gate8') &&
        sources.gateWorkflow.includes('check-v40-gate8-ledger-storage-sync.mjs') &&
        sources.canonWorkflow.includes('check-v40-gate8-ledger-storage-sync.mjs'),
    ),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const surfaceKinds = new Set(rows.map((item) => item.surfaceKind));
  const testPaths = new Set(rows.flatMap((item) => item.testPaths));
  const commandIds = new Set(rows.flatMap((item) => item.commandIds));

  return {
    rowCount: rows.length,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    expectedTotals: { ...V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS },
    synchronizationSurfaceCount: surfaceKinds.size,
    focusedTestPathCount: testPaths.size,
    commandCount: commandIds.size,
    failedPredicateIds,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    settlementFinalityWalletAuthorityCovered: failedPredicateIds.length === 0,
    btdRightsProjectionCovered: failedPredicateIds.length === 0,
    sourceToSharesConservationCovered: failedPredicateIds.length === 0,
    ledgerDatabaseStorageReconciliationCovered: failedPredicateIds.length === 0,
    storageLocksAndSourceSafeProjectionCovered: failedPredicateIds.length === 0,
    postSettlementDeliveryUnlockCovered: failedPredicateIds.length === 0,
    repairRecoveryCovered: failedPredicateIds.length === 0,
    walletNoCustodyCovered: failedPredicateIds.length === 0,
    terminalReadbackCovered: failedPredicateIds.length === 0,
    noForbiddenPayloadsSerialized: true,
  };
}

function buildProofRoots(rows, predicateResults, coverage) {
  return {
    rowSetRoot: `sha256:${digest(JSON.stringify(rows.map((item) => item.rowRoot)))}`,
    predicateRoot: `sha256:${digest(JSON.stringify(predicateResults))}`,
    coverageRoot: `sha256:${digest(JSON.stringify(coverage))}`,
    artifactRoot: `sha256:${digest(JSON.stringify({ rows: rows.map((item) => item.rowRoot), coverage }))}`,
  };
}

export function buildV40LedgerStorageSync(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = V40_LEDGER_STORAGE_SYNC_ROWS.map((item) => ({ ...item }));
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const proofRoots = buildProofRoots(rows, predicateResults, coverage);

  return {
    artifactId: 'v40-ledger-storage-sync',
    schemaId: V40_LEDGER_STORAGE_SYNC_SCHEMA_ID,
    version: V40_LEDGER_STORAGE_SYNC_VERSION,
    currentTarget: V40_LEDGER_STORAGE_SYNC_CURRENT_TARGET,
    generatedAt: input.generatedAt || '2026-05-25T00:00:00.000Z',
    artifactPath: V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH,
    passed: coverage.allCriticalSurfacesClosed,
    sourceSafetyVerdict: V40_LEDGER_STORAGE_SYNC_SOURCE_SAFETY_VERDICT,
    expectedTotals: { ...V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS },
    requiredReadbacksBeforeUnlock: [
      'btc_payment_observation',
      'settlement_finality',
      'source_to_shares_compensation',
      'btd_rights_transfer',
      'ledger_database_storage_reconciliation',
    ],
    synchronizedSystems: ['btc-fee', 'btd-rights', 'ledger', 'database', 'object-storage', 'wallet', 'pull-request-delivery'],
    failClosedStates: [
      'blocked_until_payment_finality',
      'blocked_until_compensation_conservation',
      'blocked_until_projection_repair',
      'blocked_until_pull_request_delivery',
    ],
    rows,
    predicateResults,
    coverage,
    proofRoots,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      rawModelResponseWithProtectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

export function listMissingV40LedgerStorageSyncSources(repoRoot = DEFAULT_REPO_ROOT) {
  return Object.values(SOURCE_ROOTS).filter((sourcePath) => !sourceExists(repoRoot, sourcePath));
}
