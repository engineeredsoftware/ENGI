// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH =
  '.proofs/v44/reading-budget-quote-policy.json';
export const V44_READING_BUDGET_QUOTE_POLICY_SCHEMA_ID =
  'bitcode.v44.readingBudgetQuotePolicy.v1';
export const V44_READING_BUDGET_QUOTE_POLICY_VERSION = 'V44';
export const V44_READING_BUDGET_QUOTE_POLICY_CURRENT_TARGET = 'V43';
export const V44_READING_BUDGET_QUOTE_POLICY_SOURCE_SAFETY_VERDICT =
  'source-safe-reading-budget-quote-policy-metadata';

export const V44_READING_BUDGET_QUOTE_OBJECT_IDS = Object.freeze([
  'ReadingBudgetPolicy',
  'AssetPackQuotePolicy',
  'ProcurementApprovalReceipt',
  'BuyerAuthorizationReceipt',
  'PrePurchaseReviewBoundary',
  'BtcBtdSettlementReadiness',
]);

export const V44_READING_BUDGET_STATE_IDS = Object.freeze([
  'awaiting-quote',
  'within-budget',
  'approval-required',
  'exceeded',
]);

export const V44_READING_QUOTE_STATE_IDS = Object.freeze([
  'awaiting-preview',
  'quoted',
  'expired',
  'approved',
  'blocked',
]);

export const V44_READING_SETTLEMENT_READINESS_IDS = Object.freeze([
  'awaiting-preview',
  'awaiting-approval',
  'awaiting-buyer-authority',
  'awaiting-wallet-authority',
  'ready-for-testnet-settlement',
  'blocked-budget',
  'blocked-expired-quote',
]);

export const V44_READING_BUDGET_QUOTE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'unpaid-assetpack-source',
  'source-snippets',
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
  readModel: 'apps/uapi/components/reads/models/read-route-model.ts',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  readModelTest: 'apps/uapi/tests/readRouteModel.test.ts',
  sourceToShares: 'packages/btd/src/source-to-shares.ts',
  btcFeeOperation: 'packages/btd/src/btc-fee-operation.ts',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v44-reading-budget-quote-policy.js',
  packageTest: 'scripts/specifying/test/v44-reading-budget-quote-policy.test.js',
  generator: 'scripts/generate-v44-reading-budget-quote-policy.mjs',
  checker: 'scripts/check-v44-gate4-reading-budget-quote-policy.mjs',
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

export const V44_READING_BUDGET_QUOTE_POLICY_ROWS = Object.freeze([
  {
    rowId: 'reading-budget-policy',
    owner: SOURCE_ROOTS.readModel,
    contract:
      'ReadProcurementGovernance projects source-safe budget envelopes, approval thresholds, quote sats, and fail-closed budget states for Reading.',
    requiredFields: ['budgetEnvelopeSats', 'approvalThresholdSats', 'quoteSats', 'approvalRequired', 'policyRoot'],
  },
  {
    rowId: 'assetpack-quote-policy',
    owner: SOURCE_ROOTS.readModel,
    contract:
      'AssetPack quote policy uses measurement-weight-volume pricing, quote expiry state, BTC fee asset labeling, and quote roots before settlement.',
    requiredFields: ['measurement-weight-volume', 'quoteRoot', 'expiresAt', 'feeAsset', 'reading-share-to-fee'],
  },
  {
    rowId: 'procurement-approval-receipt',
    owner: SOURCE_ROOTS.readModel,
    contract:
      'Procurement approval records buyer authorization, wallet authority, reviewer approval posture, blockers, and approval roots before settlement.',
    requiredFields: ['buyerAuthorized', 'walletAuthorityPresent', 'procurementApproved', 'approvalRoot'],
  },
  {
    rowId: 'pre-purchase-review-boundary',
    owner: SOURCE_ROOTS.readModel,
    contract:
      'Pre-purchase review stays source-safe: preview metadata may be visible, but protected source, unpaid AssetPack source, wallet private material, and private settlement payloads remain hidden.',
    requiredFields: ['protectedSourceVisible', 'unpaidAssetPackSourceVisible', 'walletPrivateMaterialVisible', 'settlementPrivatePayloadVisible'],
  },
  {
    rowId: 'read-route-procurement-ui',
    owner: SOURCE_ROOTS.readClient,
    contract:
      '/read renders budget, quote, approval, settlement readiness, wallet authority, and procurement blockers beside the five-step Reading path.',
    requiredFields: ['Budget and quote', 'procurementRows', 'formatSats', 'wallet authority'],
  },
  {
    rowId: 'deterministic-share-to-fee-policy',
    owner: SOURCE_ROOTS.sourceToShares,
    contract:
      'Reading quote governance binds to source-to-shares and BTC fee primitives so share-to-fee estimates can later reconcile to payment, rights, and allocation receipts.',
    requiredFields: ['feeQuote', 'grossSats', 'settlementAllocations', 'settlementConservation'],
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
    predicateResult('spec-defines-gate4', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 4 Reading Budget, Quote Policy, And Procurement Governance')),
    predicateResult('spec-names-gate4-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-reading-budget-quote-policy')),
    predicateResult('delta-records-gate4', SOURCE_ROOTS.delta, sources.delta.includes('Gate 4') && sources.delta.includes('v44-reading-budget-quote-policy')),
    predicateResult('notes-records-gate4', SOURCE_ROOTS.notes, sources.notes.includes('Gate 4') && sources.notes.includes('budget')),
    predicateResult('parity-records-gate4', SOURCE_ROOTS.parity, sources.parity.includes('v44-reading-budget-quote-policy')),
    predicateResult('roadmap-records-gate4', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 4 closure anchor')),
    predicateResult('readme-records-gate4', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 4')),
    predicateResult('protocol-readme-records-gate4', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 4')),
    predicateResult('economic-model-prerequisite-present', SOURCE_ROOTS.economicModel, sources.economicModel.includes('ReadingBudgetPolicy') && sources.economicModel.includes('AssetPackQuotePolicy')),
    predicateResult('read-model-defines-procurement-governance', SOURCE_ROOTS.readModel, sources.readModel.includes('buildReadProcurementGovernance') && sources.readModel.includes('ReadProcurementGovernance')),
    predicateResult('read-model-defines-budget-states', SOURCE_ROOTS.readModel, V44_READING_BUDGET_STATE_IDS.every((id) => sources.readModel.includes(id))),
    predicateResult('read-model-defines-quote-states', SOURCE_ROOTS.readModel, V44_READING_QUOTE_STATE_IDS.every((id) => sources.readModel.includes(id))),
    predicateResult('read-model-defines-settlement-readiness', SOURCE_ROOTS.readModel, V44_READING_SETTLEMENT_READINESS_IDS.every((id) => sources.readModel.includes(id))),
    predicateResult('read-model-defines-source-safe-review-boundary', SOURCE_ROOTS.readModel, sources.readModel.includes('prePurchaseReview') && sources.readModel.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('read-client-renders-budget-quote', SOURCE_ROOTS.readClient, sources.readClient.includes('Budget and quote') && sources.readClient.includes('procurementRows')),
    predicateResult('read-client-renders-wallet-authority', SOURCE_ROOTS.readClient, sources.readClient.includes('wallet authority')),
    predicateResult('read-model-test-covers-governance', SOURCE_ROOTS.readModelTest, sources.readModelTest.includes('projects approved Reading quote readiness') && sources.readModelTest.includes('blocks settlement readiness')),
    predicateResult('source-to-shares-prerequisite-present', SOURCE_ROOTS.sourceToShares, sources.sourceToShares.includes('settlementConservation') && sources.sourceToShares.includes('feeQuote')),
    predicateResult('btc-fee-operation-prerequisite-present', SOURCE_ROOTS.btcFeeOperation, sources.btcFeeOperation.includes('measurement-weight-volume') && sources.btcFeeOperation.includes('BtcFeeQuoteState')),
    predicateResult('package-test-covers-gate4', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44ReadingBudgetQuotePolicy')),
    predicateResult('package-exports-gate4', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44ReadingBudgetQuotePolicy')),
    predicateResult('package-types-export-gate4', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44ReadingBudgetQuotePolicy')),
    predicateResult('package-json-exposes-gate4', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-reading-budget-quote-policy"') && sources.packageJson.includes('"check:v44-gate4"')),
    predicateResult('gate-workflow-runs-gate4', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate4-reading-budget-quote-policy.mjs')),
    predicateResult('canon-workflow-runs-gate4', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate4-reading-budget-quote-policy.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44ReadingBudgetQuotePolicy')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 4 Reading budget quote policy check')),
  ];
}

export function buildV44ReadingBudgetQuotePolicy(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-reading-budget-quote-policy:${digest(JSON.stringify({
    objectIds: V44_READING_BUDGET_QUOTE_OBJECT_IDS,
    budgetStateIds: V44_READING_BUDGET_STATE_IDS,
    quoteStateIds: V44_READING_QUOTE_STATE_IDS,
    settlementReadinessIds: V44_READING_SETTLEMENT_READINESS_IDS,
    rowIds: V44_READING_BUDGET_QUOTE_POLICY_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-reading-budget-quote-policy',
    schemaId: V44_READING_BUDGET_QUOTE_POLICY_SCHEMA_ID,
    version: V44_READING_BUDGET_QUOTE_POLICY_VERSION,
    currentTarget: V44_READING_BUDGET_QUOTE_POLICY_CURRENT_TARGET,
    sourceSafetyVerdict: V44_READING_BUDGET_QUOTE_POLICY_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V44_READING_BUDGET_QUOTE_OBJECT_IDS],
    budgetStateIds: [...V44_READING_BUDGET_STATE_IDS],
    quoteStateIds: [...V44_READING_QUOTE_STATE_IDS],
    settlementReadinessIds: [...V44_READING_SETTLEMENT_READINESS_IDS],
    forbiddenPayloadIds: [...V44_READING_BUDGET_QUOTE_FORBIDDEN_PAYLOAD_IDS],
    rows: V44_READING_BUDGET_QUOTE_POLICY_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-reading-budget-quote-row:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      budgetEnvelopeImplemented: true,
      approvalThresholdImplemented: true,
      quoteExpiryImplemented: true,
      deterministicShareToFeeImplemented: true,
      buyerAuthorizationImplemented: true,
      walletAuthorityImplemented: true,
      btcBtdSettlementReadinessImplemented: true,
      sourceSafePrePurchaseReviewImplemented: true,
      readRouteUiImplemented: true,
      noSourceLeakTestsImplemented: true,
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

export const V44_READING_BUDGET_QUOTE_POLICY_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
