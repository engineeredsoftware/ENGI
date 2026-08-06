// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH =
  '.proofs/v44/btd-btc-compensation-statements.json';
export const V44_BTD_BTC_COMPENSATION_STATEMENTS_SCHEMA_ID =
  'bitcode.v44.btdBtcCompensationStatements.v1';
export const V44_BTD_BTC_COMPENSATION_STATEMENTS_VERSION = 'V44';
export const V44_BTD_BTC_COMPENSATION_STATEMENTS_CURRENT_TARGET = 'V43';
export const V44_BTD_BTC_COMPENSATION_STATEMENTS_SOURCE_SAFETY_VERDICT =
  'source-safe-btd-btc-compensation-statement-metadata';

export const V44_BTD_BTC_COMPENSATION_OBJECT_IDS = Object.freeze([
  'BtdBtcCompensationStatements',
  'BtdRangeAccountingStatement',
  'BtcSettlementAccountingStatement',
  'ContributorCompensationStatement',
  'DepositorEarningSummary',
  'TreasuryRouteStatement',
  'BtdBtcReconciliationStatement',
  'BtdBtcRepairStatement',
  'PackEconomicStatement',
]);

export const V44_BTD_BTC_ACCOUNTING_STATE_IDS = Object.freeze([
  'settlement-accounted',
  'pending-btc-finality',
  'repair-required',
  'withheld-before-settlement',
]);

export const V44_BTD_RANGE_ACCOUNTING_STATE_IDS = Object.freeze([
  'transferred-to-reader',
  'allocated-pending-rights',
  'withheld-before-settlement',
]);

export const V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS = Object.freeze([
  'final-settlement-observed',
  'observed-payment-pending-finality',
  'repair-required',
]);

export const V44_CONTRIBUTOR_COMPENSATION_STATE_IDS = Object.freeze([
  'allocated',
  'pending-settlement-finality',
  'repair-required',
]);

export const V44_BTD_BTC_COMPENSATION_VALUE_LABEL_IDS = Object.freeze([
  'observed-payment',
  'final-settlement',
  'contributor-allocation',
  'delivery',
  'repair-state',
]);

export const V44_BTD_BTC_COMPENSATION_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'raw-source-text',
  'unpaid-assetpack-source',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'private-settlement-payloads',
  'value-bearing-mainnet-admission',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: '.specifications/BITCODE_SPEC.txt',
  spec: '.specifications/BITCODE_SPEC_V44.md',
  delta: '.specifications/BITCODE_SPEC_V44_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V44_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V44_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  economicModel: 'scripts/specifying/src/canonical/v44-economic-domain-model.js',
  settlementBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  accountingStatements: 'packages/asset-packs-pipelines/domain/src/btd-btc-compensation-statements.ts',
  accountingStatementsTest: 'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/btd-btc-compensation-statements.test.ts',
  sourceToShares: 'packages/btd/src/source-to-shares.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdReconciliation: 'packages/btd/src/reconciliation.ts',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  packActivityModelTest: 'apps/uapi/tests/packActivityModel.test.ts',
  packsClientTest: 'apps/uapi/tests/packsPageClient.test.tsx',
  assetPackPackageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  assetPackPackageManifest: 'packages/asset-packs-pipelines/domain/package.json',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v44-btd-btc-compensation-statements.js',
  packageTest: 'scripts/specifying/test/v44-btd-btc-compensation-statements.test.js',
  generator: 'scripts/generate-v44-btd-btc-compensation-statements.mjs',
  checker: 'scripts/check-v44-gate6-btd-btc-compensation-statements.mjs',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function sourceRoot(sourcePath) {
  return `${sourcePath}:${digest(readSource(DEFAULT_REPO_ROOT, sourcePath))}`;
}

export const V44_BTD_BTC_COMPENSATION_ROWS = Object.freeze([
  {
    rowId: 'btd-range-accounting',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'BTD range accounting distinguishes transferred-to-reader, allocated-pending-rights, and withheld-before-settlement state.',
    requiredFields: ['BtdRangeAccountingStatement', 'rangeState', 'rightsTransferRoot', 'readReceiptRoot'],
  },
  {
    rowId: 'btc-settlement-observation',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'BTC settlement accounting separates observed payment, final settlement, finality, txid, custody, and repair state.',
    requiredFields: ['BtcSettlementAccountingStatement', 'expectedSats', 'observedDebitSats', 'serverCustody: false'],
  },
  {
    rowId: 'source-to-shares-contributor-statements',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'Contributor compensation statements derive allocated sats, share bps, range slices, and proof roots from source-to-shares allocations.',
    requiredFields: ['ContributorCompensationStatement', 'contributor-allocation', 'allocatedSats', 'sourceToSharesRoot'],
  },
  {
    rowId: 'depositor-earning-summaries',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'Depositor earning summaries group contributor statements by depositor wallet without serializing wallet private material.',
    requiredFields: ['DepositorEarningSummary', 'depositorWalletId', 'allocatedSats', 'summaryRoot'],
  },
  {
    rowId: 'treasury-routes',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'Treasury routes describe reader-to-contributor BTC flows, server custody false, and route state without private settlement payloads.',
    requiredFields: ['TreasuryRouteStatement', 'reader-to-contributor-source-to-shares', 'serverCustody: false'],
  },
  {
    rowId: 'reconciliation-and-repair',
    owner: SOURCE_ROOTS.accountingStatements,
    contract:
      'Accounting statements preserve ledger/database/object-storage reconciliation and repair blockers as source-safe readback.',
    requiredFields: ['BtdBtcReconciliationStatement', 'BtdBtcRepairStatement', 'ledgerDatabaseObjectStorageAligned'],
  },
  {
    rowId: 'packs-accounting-readback',
    owner: SOURCE_ROOTS.packsClient,
    contract:
      '/packs renders BTD/BTC accounting state, BTD range, BTC settlement, treasury route, contributor counts, allocation, and accounting root.',
    requiredFields: ['Accounting', 'BTD/BTC state', 'Accounting root', 'allocatedContributorSats'],
  },
  {
    rowId: 'btd-source-to-shares-primitives',
    owner: SOURCE_ROOTS.sourceToShares,
    contract:
      'Source-to-shares remains the deterministic largest-remainder basis for contributor allocation and settlement conservation.',
    requiredFields: ['source-to-shares-largest-remainder', 'settlementAllocations', 'settlementConservation'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult(
      'active-canon-pointer-supports-v44-draft-or-promoted',
      SOURCE_ROOTS.activePointer,
      bitcodeVersionAtLeast(sources.activePointer, 'V43'),
    ),
    predicateResult('spec-defines-gate6', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 6 BTD/BTC Accounting And Contributor Compensation Statements')),
    predicateResult('spec-names-gate6-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-btd-btc-compensation-statements')),
    predicateResult('delta-records-gate6', SOURCE_ROOTS.delta, sources.delta.includes('Gate 6') && sources.delta.includes('v44-btd-btc-compensation-statements')),
    predicateResult('notes-records-gate6', SOURCE_ROOTS.notes, sources.notes.includes('Gate 6') && sources.notes.includes('source-to-shares')),
    predicateResult('parity-records-gate6', SOURCE_ROOTS.parity, sources.parity.includes('v44-btd-btc-compensation-statements')),
    predicateResult('roadmap-records-gate6', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 6 closure anchor')),
    predicateResult('readme-records-gate6', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 6')),
    predicateResult('protocol-readme-records-gate6', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 6')),
    predicateResult('economic-model-prerequisite-present', SOURCE_ROOTS.economicModel, sources.economicModel.includes('ContributorCompensationStatement') && sources.economicModel.includes('PackEconomicStatement')),
    predicateResult('settlement-boundary-prerequisite-present', SOURCE_ROOTS.settlementBoundary, sources.settlementBoundary.includes('AssetPackSettlementRightsDeliveryBoundary') && sources.settlementBoundary.includes('source_to_shares_compensation')),
    predicateResult('accounting-builder-defined', SOURCE_ROOTS.accountingStatements, sources.accountingStatements.includes('buildBtdBtcCompensationStatements') && sources.accountingStatements.includes('BtdBtcCompensationStatements')),
    predicateResult('accounting-state-ids-defined', SOURCE_ROOTS.accountingStatements, V44_BTD_BTC_ACCOUNTING_STATE_IDS.every((id) => sources.accountingStatements.includes(id))),
    predicateResult('btd-range-state-ids-defined', SOURCE_ROOTS.accountingStatements, V44_BTD_RANGE_ACCOUNTING_STATE_IDS.every((id) => sources.accountingStatements.includes(id))),
    predicateResult('btc-state-ids-defined', SOURCE_ROOTS.accountingStatements, V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS.every((id) => sources.accountingStatements.includes(id))),
    predicateResult('contributor-state-ids-defined', SOURCE_ROOTS.accountingStatements, V44_CONTRIBUTOR_COMPENSATION_STATE_IDS.every((id) => sources.accountingStatements.includes(id))),
    predicateResult('accounting-forbids-source-leakage', SOURCE_ROOTS.accountingStatements, sources.accountingStatements.includes('protectedSourcePayloadSerialized: false') && sources.accountingStatements.includes('valueBearingMainnetAdmitted: false')),
    predicateResult('asset-pack-package-exports-accounting', SOURCE_ROOTS.assetPackPackageIndex, sources.assetPackPackageIndex.includes("export * from './btd-btc-compensation-statements'")),
    predicateResult('asset-pack-manifest-exports-accounting', SOURCE_ROOTS.assetPackPackageManifest, sources.assetPackPackageManifest.includes('"./btd-btc-compensation-statements"')),
    predicateResult('accounting-test-covers-builder', SOURCE_ROOTS.accountingStatementsTest, sources.accountingStatementsTest.includes('buildBtdBtcCompensationStatements') && sources.accountingStatementsTest.includes('pending-btc-finality') && sources.accountingStatementsTest.includes('repair-required')),
    predicateResult('pack-activity-model-projects-accounting', SOURCE_ROOTS.packActivityModel, sources.packActivityModel.includes('PackActivityAccountingReadback') && sources.packActivityModel.includes('BtdBtcCompensationStatements')),
    predicateResult('packs-client-renders-accounting', SOURCE_ROOTS.packsClient, sources.packsClient.includes('Accounting') && sources.packsClient.includes('BTD/BTC state') && sources.packsClient.includes('Accounting root')),
    predicateResult('pack-activity-test-covers-accounting', SOURCE_ROOTS.packActivityModelTest, sources.packActivityModelTest.includes('btd-btc-accounting-root-abc') && sources.packActivityModelTest.includes('settlement-accounted')),
    predicateResult('packs-client-test-covers-accounting', SOURCE_ROOTS.packsClientTest, sources.packsClientTest.includes('btd-btc-accounting-root-abc') && sources.packsClientTest.includes('Accounting')),
    predicateResult('source-to-shares-prerequisite-present', SOURCE_ROOTS.sourceToShares, sources.sourceToShares.includes('settlementConservation') && sources.sourceToShares.includes('largest_remainder')),
    predicateResult('btd-settlement-prerequisite-present', SOURCE_ROOTS.btdSettlement, sources.btdSettlement.includes('AssetPackSettlementUnlock') && sources.btdSettlement.includes('settlementAdmissible')),
    predicateResult('btd-receipts-prerequisite-present', SOURCE_ROOTS.btdReceipts, sources.btdReceipts.includes('buildBtdRightsTransferReceipt') && sources.btdReceipts.includes('buildBtdReadReceipt')),
    predicateResult('btd-reconciliation-prerequisite-present', SOURCE_ROOTS.btdReconciliation, sources.btdReconciliation.includes('reconcileLedgerDatabaseProjection') && sources.btdReconciliation.includes('objectStorageArtifacts')),
    predicateResult('package-test-covers-gate6', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44BtdBtcCompensationStatements')),
    predicateResult('package-exports-gate6', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44BtdBtcCompensationStatements')),
    predicateResult('package-types-export-gate6', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44BtdBtcCompensationStatements')),
    predicateResult('package-json-exposes-gate6', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-btd-btc-compensation-statements"') && sources.packageJson.includes('"check:v44-gate6"')),
    predicateResult('gate-workflow-runs-gate6', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate6-btd-btc-compensation-statements.mjs')),
    predicateResult('canon-workflow-runs-gate6', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate6-btd-btc-compensation-statements.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44BtdBtcCompensationStatements')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 6 BTD/BTC compensation statements check')),
  ];
}

export function buildV44BtdBtcCompensationStatements(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-btd-btc-compensation-statements:${digest(JSON.stringify({
    objectIds: V44_BTD_BTC_COMPENSATION_OBJECT_IDS,
    accountingStateIds: V44_BTD_BTC_ACCOUNTING_STATE_IDS,
    btdRangeStateIds: V44_BTD_RANGE_ACCOUNTING_STATE_IDS,
    btcSettlementStateIds: V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS,
    contributorCompensationStateIds: V44_CONTRIBUTOR_COMPENSATION_STATE_IDS,
    valueLabelIds: V44_BTD_BTC_COMPENSATION_VALUE_LABEL_IDS,
    rowIds: V44_BTD_BTC_COMPENSATION_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-btd-btc-compensation-statements',
    schemaId: V44_BTD_BTC_COMPENSATION_STATEMENTS_SCHEMA_ID,
    version: V44_BTD_BTC_COMPENSATION_STATEMENTS_VERSION,
    currentTarget: V44_BTD_BTC_COMPENSATION_STATEMENTS_CURRENT_TARGET,
    sourceSafetyVerdict: V44_BTD_BTC_COMPENSATION_STATEMENTS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V44_BTD_BTC_COMPENSATION_OBJECT_IDS],
    accountingStateIds: [...V44_BTD_BTC_ACCOUNTING_STATE_IDS],
    btdRangeStateIds: [...V44_BTD_RANGE_ACCOUNTING_STATE_IDS],
    btcSettlementStateIds: [...V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS],
    contributorCompensationStateIds: [...V44_CONTRIBUTOR_COMPENSATION_STATE_IDS],
    valueLabelIds: [...V44_BTD_BTC_COMPENSATION_VALUE_LABEL_IDS],
    forbiddenPayloadIds: [...V44_BTD_BTC_COMPENSATION_FORBIDDEN_PAYLOAD_IDS],
    rows: V44_BTD_BTC_COMPENSATION_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-btd-btc-compensation-row:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      btdBtcCompensationStatementsImplemented: true,
      btdRangeStateImplemented: true,
      btcSettlementObservationImplemented: true,
      sourceToSharesContributorStatementsImplemented: true,
      depositorEarningSummariesImplemented: true,
      treasuryRoutesImplemented: true,
      reconciliationStatementImplemented: true,
      repairStatementImplemented: true,
      packsAccountingReadbackImplemented: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      sourceSnippetVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetAdmitted: false,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V44_BTD_BTC_COMPENSATION_STATEMENTS_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
