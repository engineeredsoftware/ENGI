// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH =
  '.bitcode/v44-depositor-earnings-supply-opportunities.json';
export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_SCHEMA_ID =
  'bitcode.v44.depositorEarningsSupplyOpportunities.v1';
export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_VERSION = 'V44';
export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_CURRENT_TARGET = 'V43';
export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_SOURCE_SAFETY_VERDICT =
  'source-safe-depositor-earnings-supply-opportunity-metadata';

export const V44_DEPOSITOR_EARNINGS_SUPPLY_OBJECT_IDS = Object.freeze([
  'DepositorEarningSupplyIntelligence',
  'DepositorEarningStatement',
  'DepositSupplyOpportunity',
  'UnfitNeedOpportunity',
  'SourceCriticalityPosture',
  'ExpectedCompensationRange',
  'SourceSafeSupplyRecommendation',
]);

export const V44_DEPOSITOR_EARNING_STATE_IDS = Object.freeze([
  'compensation-range-estimated',
  'repair-required-before-earning',
  'blocked-critical-source',
]);

export const V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS = Object.freeze([
  'approve-for-depository-review',
  'repair-policy-before-admission',
  'resynthesize-for-demand',
  'withhold-critical-source',
]);

export const V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS = Object.freeze([
  'strong-demand-opportunity',
  'moderate-demand-opportunity',
  'weak-demand-opportunity',
]);

export const V44_DEPOSITOR_EARNINGS_SUPPLY_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V44.md',
  delta: 'BITCODE_SPEC_V44_DELTA.md',
  notes: 'BITCODE_SPEC_V44_NOTES.md',
  parity: 'BITCODE_SPEC_V44_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/protocol/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  economicModel: 'packages/protocol/src/canonical/v44-economic-domain-model.js',
  portfolioMarketIntelligence: 'packages/protocol/src/canonical/v44-packs-portfolio-market-intelligence.js',
  optionPolicy: 'packages/pipelines/asset-pack/src/deposit-asset-pack-option-policy.ts',
  earningSupplyIntelligence: 'packages/pipelines/asset-pack/src/depositor-earning-supply-intelligence.ts',
  earningSupplyIntelligenceTest: 'packages/pipelines/asset-pack/src/__tests__/depositor-earning-supply-intelligence.test.ts',
  depositModel: 'uapi/app/deposit/deposit-route-model.ts',
  depositClient: 'uapi/app/deposit/DepositPageClient.tsx',
  depositRouteTest: 'uapi/tests/depositRouteModel.test.ts',
  depositPageTest: 'uapi/tests/depositPageClient.test.tsx',
  assetPackPackageIndex: 'packages/pipelines/asset-pack/src/index.ts',
  assetPackPackageManifest: 'packages/pipelines/asset-pack/package.json',
  sourceToShares: 'packages/btd/src/source-to-shares.ts',
  packageIndex: 'packages/protocol/src/index.js',
  packageTypes: 'packages/protocol/src/index.d.ts',
  packageSource: 'packages/protocol/src/canonical/v44-depositor-earnings-supply-opportunities.js',
  packageTest: 'packages/protocol/test/v44-depositor-earnings-supply-opportunities.test.js',
  generator: 'scripts/generate-v44-depositor-earnings-supply-opportunities.mjs',
  checker: 'scripts/check-v44-gate5-depositor-earnings-supply-opportunities.mjs',
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

export const V44_DEPOSITOR_EARNINGS_SUPPLY_ROWS = Object.freeze([
  {
    rowId: 'likely-demand-intelligence',
    owner: SOURCE_ROOTS.earningSupplyIntelligence,
    contract:
      'DepositorEarningSupplyIntelligence aggregates likely Reading demand from source-safe option policy evaluations.',
    requiredFields: ['likelyDemand', 'averageConfidence', 'strongDemandOptionCount', 'demandRoot'],
  },
  {
    rowId: 'unfit-need-opportunities',
    owner: SOURCE_ROOTS.earningSupplyIntelligence,
    contract:
      'Unfit Need opportunities are represented as source-safe weighted demand signals that guide supply creation without exposing Read or source payloads.',
    requiredFields: ['unfitNeedOpportunities', 'opportunityCount', 'opportunityRoot'],
  },
  {
    rowId: 'earning-statements',
    owner: SOURCE_ROOTS.earningSupplyIntelligence,
    contract:
      'Depositor earning statements label all values as estimates and expose BTC compensation ranges, ROI, criticality, blockers, warnings, and statement roots.',
    requiredFields: ['DepositorEarningStatement', 'valueLabel', 'expectedCompensationRangeSats', 'blocked-critical-source'],
  },
  {
    rowId: 'source-safe-supply-recommendations',
    owner: SOURCE_ROOTS.earningSupplyIntelligence,
    contract:
      'Supply recommendations choose approve, repair, resynthesize, or withhold actions from source-safe demand, criticality, ROI, and compensation posture.',
    requiredFields: ['approve-for-depository-review', 'repair-policy-before-admission', 'resynthesize-for-demand', 'withhold-critical-source'],
  },
  {
    rowId: 'deposit-route-earning-readback',
    owner: SOURCE_ROOTS.depositClient,
    contract:
      '/deposit renders earning estimates, unfit Need opportunities, source-safe recommendations, and opportunity roots beside the five-step Depositing path.',
    requiredFields: ['Supply opportunity', 'Earning estimate', 'Unfit Need opportunities', 'DepositorEarningSupplyIntelligence'],
  },
  {
    rowId: 'source-to-shares-compensation-basis',
    owner: SOURCE_ROOTS.sourceToShares,
    contract:
      'Depositor earning ranges remain estimate-only until future Need-Fit settlement produces source-to-shares allocation receipts.',
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
    predicateResult('spec-defines-gate5', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 5 Depositor Earnings, ROI, And Supply Opportunity Intelligence')),
    predicateResult('spec-names-gate5-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-depositor-earnings-supply-opportunities')),
    predicateResult('delta-records-gate5', SOURCE_ROOTS.delta, sources.delta.includes('Gate 5') && sources.delta.includes('v44-depositor-earnings-supply-opportunities')),
    predicateResult('notes-records-gate5', SOURCE_ROOTS.notes, sources.notes.includes('Gate 5') && sources.notes.includes('earning')),
    predicateResult('parity-records-gate5', SOURCE_ROOTS.parity, sources.parity.includes('v44-depositor-earnings-supply-opportunities')),
    predicateResult('roadmap-records-gate5', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 5 closure anchor')),
    predicateResult('readme-records-gate5', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 5')),
    predicateResult('protocol-readme-records-gate5', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 5')),
    predicateResult('economic-model-prerequisite-present', SOURCE_ROOTS.economicModel, sources.economicModel.includes('DepositorEarningStatement') && sources.economicModel.includes('DepositSupplyOpportunity')),
    predicateResult('portfolio-market-prerequisite-present', SOURCE_ROOTS.portfolioMarketIntelligence, sources.portfolioMarketIntelligence.includes('supply') && sources.portfolioMarketIntelligence.includes('compensation')),
    predicateResult('option-policy-prerequisite-present', SOURCE_ROOTS.optionPolicy, sources.optionPolicy.includes('DepositAssetPackOptionPolicyReport') && sources.optionPolicy.includes('future-reader-btc-source-to-shares-route-preview')),
    predicateResult('earning-intelligence-defines-builder', SOURCE_ROOTS.earningSupplyIntelligence, sources.earningSupplyIntelligence.includes('buildDepositorEarningSupplyIntelligence') && sources.earningSupplyIntelligence.includes('DepositorEarningSupplyIntelligence')),
    predicateResult('earning-intelligence-defines-demand', SOURCE_ROOTS.earningSupplyIntelligence, V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS.every((id) => sources.earningSupplyIntelligence.includes(id))),
    predicateResult('earning-intelligence-defines-statements', SOURCE_ROOTS.earningSupplyIntelligence, V44_DEPOSITOR_EARNING_STATE_IDS.every((id) => sources.earningSupplyIntelligence.includes(id))),
    predicateResult('earning-intelligence-defines-recommendations', SOURCE_ROOTS.earningSupplyIntelligence, V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS.every((id) => sources.earningSupplyIntelligence.includes(id))),
    predicateResult('earning-intelligence-forbids-source-leakage', SOURCE_ROOTS.earningSupplyIntelligence, sources.earningSupplyIntelligence.includes('protectedSourceVisible: false') && sources.earningSupplyIntelligence.includes('valueBearingMainnetAdmitted: false')),
    predicateResult('asset-pack-package-exports-intelligence', SOURCE_ROOTS.assetPackPackageIndex, sources.assetPackPackageIndex.includes("export * from './depositor-earning-supply-intelligence'")),
    predicateResult('asset-pack-manifest-exports-intelligence', SOURCE_ROOTS.assetPackPackageManifest, sources.assetPackPackageManifest.includes('"./depositor-earning-supply-intelligence"')),
    predicateResult('deposit-model-uses-intelligence', SOURCE_ROOTS.depositModel, sources.depositModel.includes('earningSupplyIntelligence') && sources.depositModel.includes('buildDepositorEarningSupplyIntelligence')),
    predicateResult('deposit-client-renders-earnings', SOURCE_ROOTS.depositClient, sources.depositClient.includes('Opportunity roots') && sources.depositClient.includes('Earning estimate')),
    predicateResult('earning-test-covers-intelligence', SOURCE_ROOTS.earningSupplyIntelligenceTest, sources.earningSupplyIntelligenceTest.includes('buildDepositorEarningSupplyIntelligence') && sources.earningSupplyIntelligenceTest.includes('blocked-critical-source')),
    predicateResult('route-test-covers-intelligence', SOURCE_ROOTS.depositRouteTest, sources.depositRouteTest.includes('earningSupplyIntelligence') && sources.depositRouteTest.includes('unfit Need')),
    predicateResult('page-test-covers-intelligence', SOURCE_ROOTS.depositPageTest, sources.depositPageTest.includes('Earning estimate') && sources.depositPageTest.includes('DepositorEarningSupplyIntelligence')),
    predicateResult('source-to-shares-prerequisite-present', SOURCE_ROOTS.sourceToShares, sources.sourceToShares.includes('settlementConservation') && sources.sourceToShares.includes('largest_remainder')),
    predicateResult('package-test-covers-gate5', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44DepositorEarningsSupplyOpportunities')),
    predicateResult('package-exports-gate5', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44DepositorEarningsSupplyOpportunities')),
    predicateResult('package-types-export-gate5', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44DepositorEarningsSupplyOpportunities')),
    predicateResult('package-json-exposes-gate5', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-depositor-earnings-supply-opportunities"') && sources.packageJson.includes('"check:v44-gate5"')),
    predicateResult('gate-workflow-runs-gate5', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate5-depositor-earnings-supply-opportunities.mjs')),
    predicateResult('canon-workflow-runs-gate5', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate5-depositor-earnings-supply-opportunities.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44DepositorEarningsSupplyOpportunities')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 5 Depositor earnings supply opportunities check')),
  ];
}

export function buildV44DepositorEarningsSupplyOpportunities(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-depositor-earnings-supply-opportunities:${digest(JSON.stringify({
    objectIds: V44_DEPOSITOR_EARNINGS_SUPPLY_OBJECT_IDS,
    earningStateIds: V44_DEPOSITOR_EARNING_STATE_IDS,
    recommendationIds: V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS,
    demandOpportunityStateIds: V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS,
    rowIds: V44_DEPOSITOR_EARNINGS_SUPPLY_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-depositor-earnings-supply-opportunities',
    schemaId: V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_SCHEMA_ID,
    version: V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_VERSION,
    currentTarget: V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_CURRENT_TARGET,
    sourceSafetyVerdict: V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V44_DEPOSITOR_EARNINGS_SUPPLY_OBJECT_IDS],
    earningStateIds: [...V44_DEPOSITOR_EARNING_STATE_IDS],
    recommendationIds: [...V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS],
    demandOpportunityStateIds: [...V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS],
    forbiddenPayloadIds: [...V44_DEPOSITOR_EARNINGS_SUPPLY_FORBIDDEN_PAYLOAD_IDS],
    rows: V44_DEPOSITOR_EARNINGS_SUPPLY_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-depositor-earning-supply-row:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      depositorEarningSupplyIntelligenceImplemented: true,
      likelyDemandImplemented: true,
      unfitNeedOpportunitiesImplemented: true,
      roiPostureImplemented: true,
      sourceCriticalityPostureImplemented: true,
      expectedCompensationRangesImplemented: true,
      earningStatementsImplemented: true,
      sourceSafeSupplyRecommendationsImplemented: true,
      depositRouteUiImplemented: true,
      sourceToSharesEstimateBoundaryImplemented: true,
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

export const V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
