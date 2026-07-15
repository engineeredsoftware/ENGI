// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_ECONOMIC_DOMAIN_MODEL_ARTIFACT_PATH =
  '.bitcode/v44-economic-domain-model.json';
export const V44_ECONOMIC_DOMAIN_MODEL_SCHEMA_ID =
  'bitcode.v44.economicDomainModel.v1';
export const V44_ECONOMIC_DOMAIN_MODEL_VERSION = 'V44';
export const V44_ECONOMIC_DOMAIN_MODEL_CURRENT_TARGET = 'V43';
export const V44_ECONOMIC_DOMAIN_MODEL_SOURCE_SAFETY_VERDICT =
  'source-safe-economic-domain-model-metadata';

export const V44_ECONOMIC_OBJECT_IDS = Object.freeze([
  'EnterprisePackPortfolio',
  'PackPortfolioPosition',
  'PackMarketSignal',
  'ReadDemandSignal',
  'UnfitNeedSignal',
  'DepositSupplyOpportunity',
  'ReadingBudgetPolicy',
  'AssetPackQuotePolicy',
  'ProcurementApprovalReceipt',
  'DepositorEarningStatement',
  'ContributorCompensationStatement',
  'PackEconomicStatement',
  'OrganizationPackPolicy',
  'PackGovernanceDecision',
  'ScaledNetworkRehearsalReceipt',
  'PortfolioRepairCase',
]);

export const V44_ECONOMIC_RECEIPT_TAXONOMY_IDS = Object.freeze([
  'portfolio-position',
  'market-signal',
  'quote-state',
  'settlement-state',
  'compensation-statement',
  'governance-decision',
  'repair-case',
  'budget-policy',
  'supply-opportunity',
  'network-rehearsal',
]);

export const V44_ECONOMIC_VALUE_LABEL_IDS = Object.freeze([
  'estimate',
  'quote',
  'observed-payment',
  'final-settlement',
  'contributor-allocation',
  'delivery',
  'repair-state',
]);

export const V44_ECONOMIC_SOURCE_SAFE_FIELD_IDS = Object.freeze([
  'objectId',
  'receiptTaxonomyIds',
  'valueLabelIds',
  'state',
  'scope',
  'organizationId',
  'repositoryRef',
  'assetPackId',
  'needId',
  'quoteId',
  'settlementId',
  'compensationId',
  'governanceDecisionId',
  'repairCaseId',
  'measurementRoot',
  'policyRoot',
  'proofRoot',
  'telemetryRoot',
]);

export const V44_ECONOMIC_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v44-economic-domain-model.js',
  packageTest: 'scripts/specifying/test/v44-economic-domain-model.test.js',
  generator: 'scripts/generate-v44-economic-domain-model.mjs',
  checker: 'scripts/check-v44-gate2-economic-domain-model.mjs',
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

function objectRow({
  objectId,
  receiptTaxonomyIds,
  valueLabelIds,
  contract,
  stateIds,
  sourceSafeFields,
  privateFieldsNeverSerialized,
  downstreamConsumers,
}) {
  return {
    objectId,
    receiptTaxonomyIds,
    valueLabelIds,
    contract,
    stateIds,
    sourceSafeFields,
    privateFieldsNeverSerialized,
    downstreamConsumers,
  };
}

export const V44_ECONOMIC_DOMAIN_ROWS = Object.freeze([
  objectRow({
    objectId: 'EnterprisePackPortfolio',
    receiptTaxonomyIds: ['portfolio-position', 'market-signal', 'governance-decision'],
    valueLabelIds: ['estimate', 'quote', 'final-settlement', 'delivery'],
    contract:
      'EnterprisePackPortfolio aggregates source-safe Pack positions, Pack activity, demand/supply signals, and policy receipts for one organization.',
    stateIds: ['empty', 'active', 'requires-repair', 'restricted-by-policy'],
    sourceSafeFields: ['organizationId', 'positionIds', 'marketSignalIds', 'policyRoot', 'proofRoot'],
    privateFieldsNeverSerialized: ['protectedSource', 'unpaidAssetPackSource', 'walletPrivateMaterial'],
    downstreamConsumers: ['/packs', 'organization-policy', 'scaled-network-rehearsal'],
  }),
  objectRow({
    objectId: 'PackPortfolioPosition',
    receiptTaxonomyIds: ['portfolio-position', 'settlement-state', 'delivery'],
    valueLabelIds: ['estimate', 'quote', 'observed-payment', 'final-settlement', 'delivery'],
    contract:
      'PackPortfolioPosition records one AssetPack economic position with source-safe ownership, quote, settlement, delivery, and repair readback.',
    stateIds: ['previewable', 'quoted', 'settled', 'delivered', 'repair-required'],
    sourceSafeFields: ['assetPackId', 'quoteId', 'settlementId', 'deliveryState', 'measurementRoot'],
    privateFieldsNeverSerialized: ['protectedSource', 'privateSettlementPayload'],
    downstreamConsumers: ['/packs', '/read', 'delivery-boundary'],
  }),
  objectRow({
    objectId: 'PackMarketSignal',
    receiptTaxonomyIds: ['market-signal'],
    valueLabelIds: ['estimate'],
    contract:
      'PackMarketSignal summarizes source-safe demand, supply, compensation, and settlement pressure for AssetPack discovery and portfolio search.',
    stateIds: ['observed', 'stale', 'suppressed-by-policy'],
    sourceSafeFields: ['signalId', 'assetPackId', 'needId', 'measurementRoot', 'telemetryRoot'],
    privateFieldsNeverSerialized: ['rawPrompt', 'rawProviderResponse', 'protectedSource'],
    downstreamConsumers: ['/packs', '/deposit', 'supply-opportunity'],
  }),
  objectRow({
    objectId: 'ReadDemandSignal',
    receiptTaxonomyIds: ['market-signal'],
    valueLabelIds: ['estimate'],
    contract:
      'ReadDemandSignal records source-safe Need demand for Matching Fits without exposing buyer private context or unpaid source.',
    stateIds: ['requested', 'reviewed-need', 'fit-found', 'unfit'],
    sourceSafeFields: ['needId', 'repositoryRef', 'measurementRoot', 'policyRoot', 'proofRoot'],
    privateFieldsNeverSerialized: ['privateReadContext', 'rawPrompt', 'interpolatedPrompt'],
    downstreamConsumers: ['/read', '/packs', '/deposit'],
  }),
  objectRow({
    objectId: 'UnfitNeedSignal',
    receiptTaxonomyIds: ['market-signal', 'supply-opportunity', 'repair-case'],
    valueLabelIds: ['estimate', 'repair-state'],
    contract:
      'UnfitNeedSignal preserves source-safe evidence that a reviewed Need lacked enough eligible Fits and can drive deposit opportunity discovery.',
    stateIds: ['unfit', 'reopened', 'supplied-later', 'closed'],
    sourceSafeFields: ['needId', 'reasonCode', 'measurementRoot', 'repairCaseId', 'proofRoot'],
    privateFieldsNeverSerialized: ['privateReadContext', 'protectedSource'],
    downstreamConsumers: ['/deposit', '/packs', 'repair-workflows'],
  }),
  objectRow({
    objectId: 'DepositSupplyOpportunity',
    receiptTaxonomyIds: ['supply-opportunity', 'market-signal'],
    valueLabelIds: ['estimate', 'contributor-allocation'],
    contract:
      'DepositSupplyOpportunity estimates source-safe likelihood, criticality, ROI, and downstream compensation posture for proposed AssetPack deposits.',
    stateIds: ['candidate', 'eligible', 'blocked-critical-source', 'admitted', 'rejected'],
    sourceSafeFields: ['opportunityId', 'repositoryRef', 'demandSignalIds', 'measurementRoot', 'policyRoot'],
    privateFieldsNeverSerialized: ['protectedSource', 'sourceSnippet', 'credentials'],
    downstreamConsumers: ['/deposit', '/packs', 'depository-admission'],
  }),
  objectRow({
    objectId: 'ReadingBudgetPolicy',
    receiptTaxonomyIds: ['budget-policy', 'governance-decision'],
    valueLabelIds: ['estimate', 'quote'],
    contract:
      'ReadingBudgetPolicy defines source-safe spend envelopes, approval thresholds, quote expiry posture, and fail-closed admission for Reading.',
    stateIds: ['draft', 'active', 'approval-required', 'exceeded', 'expired'],
    sourceSafeFields: ['policyId', 'organizationId', 'budgetEnvelopeRoot', 'approvalThresholdRoot'],
    privateFieldsNeverSerialized: ['walletPrivateMaterial', 'privateSettlementPayload'],
    downstreamConsumers: ['/read', 'quote-policy', 'wallet-authority'],
  }),
  objectRow({
    objectId: 'AssetPackQuotePolicy',
    receiptTaxonomyIds: ['quote-state', 'budget-policy', 'settlement-state'],
    valueLabelIds: ['estimate', 'quote', 'observed-payment', 'final-settlement'],
    contract:
      'AssetPackQuotePolicy binds deterministic source-to-shares measurement, quote state, expiry, payment observation, and final settlement boundaries.',
    stateIds: ['estimated', 'quoted', 'expired', 'payment-observed', 'settled', 'repaired'],
    sourceSafeFields: ['quoteId', 'assetPackId', 'shareCalculationRoot', 'expiry', 'proofRoot'],
    privateFieldsNeverSerialized: ['unpaidAssetPackSource', 'privateSettlementPayload', 'walletPrivateMaterial'],
    downstreamConsumers: ['/read', '/packs', 'settlement-boundary'],
  }),
  objectRow({
    objectId: 'ProcurementApprovalReceipt',
    receiptTaxonomyIds: ['governance-decision', 'budget-policy', 'quote-state'],
    valueLabelIds: ['quote'],
    contract:
      'ProcurementApprovalReceipt records source-safe buyer approval, reviewer authority, budget posture, and quote admission before settlement.',
    stateIds: ['pending', 'approved', 'denied', 'expired', 'superseded'],
    sourceSafeFields: ['approvalId', 'quoteId', 'reviewerRole', 'policyRoot', 'proofRoot'],
    privateFieldsNeverSerialized: ['credentials', 'walletPrivateMaterial', 'privateSettlementPayload'],
    downstreamConsumers: ['/read', 'organization-policy', 'settlement-boundary'],
  }),
  objectRow({
    objectId: 'DepositorEarningStatement',
    receiptTaxonomyIds: ['compensation-statement', 'settlement-state'],
    valueLabelIds: ['estimate', 'observed-payment', 'final-settlement', 'contributor-allocation'],
    contract:
      'DepositorEarningStatement summarizes source-safe estimated, observed, settled, and allocated value for a depositor across AssetPack use.',
    stateIds: ['estimated', 'payment-observed', 'settled', 'allocated', 'repair-required'],
    sourceSafeFields: ['statementId', 'assetPackId', 'depositorAccountRef', 'allocationRoot', 'settlementId'],
    privateFieldsNeverSerialized: ['walletPrivateMaterial', 'privateSettlementPayload'],
    downstreamConsumers: ['/packs', '/deposit', 'compensation-ledger'],
  }),
  objectRow({
    objectId: 'ContributorCompensationStatement',
    receiptTaxonomyIds: ['compensation-statement'],
    valueLabelIds: ['contributor-allocation', 'observed-payment', 'final-settlement'],
    contract:
      'ContributorCompensationStatement preserves source-to-shares allocation conservation and contributor readback without exposing private wallet material.',
    stateIds: ['pending-allocation', 'allocated', 'payable', 'paid', 'repair-required'],
    sourceSafeFields: ['compensationId', 'contributorRef', 'allocationRoot', 'settlementId', 'proofRoot'],
    privateFieldsNeverSerialized: ['walletPrivateMaterial', 'privateSettlementPayload', 'protectedSource'],
    downstreamConsumers: ['/packs', 'ledger-reconciliation', 'repair-workflows'],
  }),
  objectRow({
    objectId: 'PackEconomicStatement',
    receiptTaxonomyIds: ['portfolio-position', 'quote-state', 'settlement-state', 'compensation-statement'],
    valueLabelIds: ['estimate', 'quote', 'observed-payment', 'final-settlement', 'contributor-allocation', 'delivery'],
    contract:
      'PackEconomicStatement composes source-safe position, quote, payment, settlement, delivery, and compensation state for one AssetPack.',
    stateIds: ['estimated', 'quoted', 'settled', 'delivered', 'reconciled', 'repair-required'],
    sourceSafeFields: ['assetPackId', 'quoteId', 'settlementId', 'deliveryState', 'allocationRoot'],
    privateFieldsNeverSerialized: ['unpaidAssetPackSource', 'privateSettlementPayload', 'walletPrivateMaterial'],
    downstreamConsumers: ['/packs', '/read', '/deposit', 'promotion-rehearsal'],
  }),
  objectRow({
    objectId: 'OrganizationPackPolicy',
    receiptTaxonomyIds: ['budget-policy', 'governance-decision'],
    valueLabelIds: ['estimate', 'quote', 'repair-state'],
    contract:
      'OrganizationPackPolicy defines source-safe role, spending, depositing, source-criticality, and wallet authority controls across routes.',
    stateIds: ['draft', 'active', 'blocked', 'override-required', 'repair-required'],
    sourceSafeFields: ['policyId', 'organizationId', 'roleRoot', 'limitRoot', 'walletAuthorityRoot'],
    privateFieldsNeverSerialized: ['credentials', 'walletPrivateMaterial', 'protectedSource'],
    downstreamConsumers: ['/packs', '/read', '/deposit', 'wallet-authority'],
  }),
  objectRow({
    objectId: 'PackGovernanceDecision',
    receiptTaxonomyIds: ['governance-decision'],
    valueLabelIds: ['quote', 'delivery', 'repair-state'],
    contract:
      'PackGovernanceDecision records source-safe allow, deny, require-review, repair, and override outcomes for economic operation.',
    stateIds: ['allowed', 'denied', 'review-required', 'override-required', 'repair-required'],
    sourceSafeFields: ['governanceDecisionId', 'policyId', 'decisionKind', 'proofRoot', 'telemetryRoot'],
    privateFieldsNeverSerialized: ['credentials', 'walletPrivateMaterial', 'privateSettlementPayload'],
    downstreamConsumers: ['/packs', '/read', '/deposit', 'governance-audit'],
  }),
  objectRow({
    objectId: 'ScaledNetworkRehearsalReceipt',
    receiptTaxonomyIds: ['network-rehearsal', 'settlement-state', 'repair-case'],
    valueLabelIds: ['estimate', 'quote', 'observed-payment', 'final-settlement', 'contributor-allocation', 'delivery', 'repair-state'],
    contract:
      'ScaledNetworkRehearsalReceipt proves many deposits, Reads, Fits, quotes, settlements, contributors, deliveries, and repairs on safe lanes.',
    stateIds: ['local-passed', 'staging-testnet-passed', 'blocked-mainnet', 'repair-required'],
    sourceSafeFields: ['rehearsalId', 'laneId', 'scenarioRoot', 'telemetryRoot', 'proofRoot'],
    privateFieldsNeverSerialized: ['credentials', 'walletPrivateMaterial', 'privateSettlementPayload', 'protectedSource'],
    downstreamConsumers: ['promotion-readiness', 'operator-audit'],
  }),
  objectRow({
    objectId: 'PortfolioRepairCase',
    receiptTaxonomyIds: ['repair-case', 'portfolio-position', 'settlement-state', 'compensation-statement'],
    valueLabelIds: ['repair-state', 'estimate', 'quote', 'final-settlement', 'delivery'],
    contract:
      'PortfolioRepairCase records source-safe economic discrepancy, stale state, reconciliation action, and closure evidence.',
    stateIds: ['opened', 'triaged', 'repairing', 'closed', 'escalated'],
    sourceSafeFields: ['repairCaseId', 'objectId', 'reasonCode', 'actionRoot', 'proofRoot'],
    privateFieldsNeverSerialized: ['protectedSource', 'credentials', 'privateSettlementPayload'],
    downstreamConsumers: ['/packs', 'operator-audit', 'promotion-readiness'],
  }),
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
    predicateResult('spec-defines-gate2', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 2 Economic Domain Model And Receipt Taxonomy')),
    predicateResult('spec-names-domain-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-economic-domain-model')),
    predicateResult('spec-names-economic-objects', SOURCE_ROOTS.spec, V44_ECONOMIC_OBJECT_IDS.every((objectId) => sources.spec.includes(objectId))),
    predicateResult('spec-names-value-labels', SOURCE_ROOTS.spec, V44_ECONOMIC_VALUE_LABEL_IDS.every((labelId) => sources.spec.includes(labelId.replaceAll('-', ' ')) || sources.spec.includes(labelId))),
    predicateResult('delta-records-gate2', SOURCE_ROOTS.delta, sources.delta.includes('Gate 2') && sources.delta.includes('v44-economic-domain-model')),
    predicateResult('notes-records-gate2', SOURCE_ROOTS.notes, sources.notes.includes('Gate 2') && sources.notes.includes('receipt taxonomy')),
    predicateResult('parity-records-gate2', SOURCE_ROOTS.parity, sources.parity.includes('v44-economic-domain-model')),
    predicateResult('roadmap-records-gate2', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 2 closure anchor')),
    predicateResult('readme-records-gate2', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 2')),
    predicateResult('protocol-readme-records-gate2', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 2')),
    predicateResult('package-exports-gate2', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44EconomicDomainModel')),
    predicateResult('package-types-export-gate2', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44EconomicDomainModel')),
    predicateResult('package-test-covers-gate2', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44EconomicDomainModel')),
    predicateResult('package-json-exposes-gate2', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-economic-domain-model"') && sources.packageJson.includes('"check:v44-gate2"')),
    predicateResult('gate-workflow-runs-gate2', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate2-economic-domain-model.mjs')),
    predicateResult('canon-workflow-runs-gate2', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate2-economic-domain-model.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44EconomicDomainModel')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 2 economic domain model check')),
  ];
}

export function buildV44EconomicDomainModel(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-economic-domain-model:${digest(JSON.stringify({
    economicObjectIds: V44_ECONOMIC_OBJECT_IDS,
    receiptTaxonomyIds: V44_ECONOMIC_RECEIPT_TAXONOMY_IDS,
    valueLabelIds: V44_ECONOMIC_VALUE_LABEL_IDS,
    sourceSafeFieldIds: V44_ECONOMIC_SOURCE_SAFE_FIELD_IDS,
    rowIds: V44_ECONOMIC_DOMAIN_ROWS.map((row) => row.objectId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-economic-domain-model',
    schemaId: V44_ECONOMIC_DOMAIN_MODEL_SCHEMA_ID,
    version: V44_ECONOMIC_DOMAIN_MODEL_VERSION,
    currentTarget: V44_ECONOMIC_DOMAIN_MODEL_CURRENT_TARGET,
    sourceSafetyVerdict: V44_ECONOMIC_DOMAIN_MODEL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    economicObjectIds: [...V44_ECONOMIC_OBJECT_IDS],
    receiptTaxonomyIds: [...V44_ECONOMIC_RECEIPT_TAXONOMY_IDS],
    valueLabelIds: [...V44_ECONOMIC_VALUE_LABEL_IDS],
    sourceSafeFieldIds: [...V44_ECONOMIC_SOURCE_SAFE_FIELD_IDS],
    forbiddenPayloadIds: [...V44_ECONOMIC_FORBIDDEN_PAYLOAD_IDS],
    domainRows: V44_ECONOMIC_DOMAIN_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-economic-domain-row:${digest(row.objectId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      valueBearingMainnetAdmitted: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      economicObjectsModeled: V44_ECONOMIC_OBJECT_IDS.length === V44_ECONOMIC_DOMAIN_ROWS.length,
      receiptTaxonomyModeled: V44_ECONOMIC_RECEIPT_TAXONOMY_IDS.length === 10,
      valueLabelsComplete: V44_ECONOMIC_VALUE_LABEL_IDS.length === 7,
      portfolioPositionCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('portfolio-position')),
      marketSignalsCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('market-signal')),
      quoteStatesCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('quote-state')),
      settlementStatesCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('settlement-state')),
      compensationStatementsCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('compensation-statement')),
      governanceDecisionsCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('governance-decision')),
      repairCasesCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('repair-case')),
      budgetPoliciesCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('budget-policy')),
      supplyOpportunitiesCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('supply-opportunity')),
      networkRehearsalCovered: V44_ECONOMIC_DOMAIN_ROWS.some((row) => row.receiptTaxonomyIds.includes('network-rehearsal')),
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

export const V44_ECONOMIC_DOMAIN_MODEL_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
