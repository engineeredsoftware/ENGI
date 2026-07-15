// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH =
  '.bitcode/v44-packs-portfolio-market-intelligence.json';
export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SCHEMA_ID =
  'bitcode.v44.packsPortfolioMarketIntelligence.v1';
export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_VERSION = 'V44';
export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_CURRENT_TARGET = 'V43';
export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SOURCE_SAFETY_VERDICT =
  'source-safe-packs-portfolio-market-intelligence-metadata';

export const V44_PACKS_PORTFOLIO_VIEW_IDS = Object.freeze([
  'enterprise-pack-portfolio',
  'pack-portfolio-position',
  'saved-filter-preset',
  'organization-view',
  'proof-root-drilldown',
]);

export const V44_PACKS_MARKET_SIGNAL_IDS = Object.freeze([
  'demand',
  'supply',
  'unfit-need',
  'settlement',
  'compensation',
  'delivery',
  'repair',
]);

export const V44_PACKS_MARKET_FACET_IDS = Object.freeze([
  'settlementState',
  'compensationState',
  'deliveryState',
  'repairState',
  'repository',
  'type',
  'state',
]);

export const V44_PACKS_PORTFOLIO_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'unpaid-assetpack-source',
  'source-snippets',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'private-settlement-payloads',
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
  model: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  route: 'apps/uapi/app/api/packs/activity/route.ts',
  client: 'apps/uapi/app/packs/PacksPageClient.tsx',
  uapiTest: 'apps/uapi/tests/packActivityModel.test.ts',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageTest: 'scripts/specifying/test/v44-packs-portfolio-market-intelligence.test.js',
  generator: 'scripts/generate-v44-packs-portfolio-market-intelligence.mjs',
  checker: 'scripts/check-v44-gate3-packs-portfolio-market-intelligence.mjs',
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

export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ROWS = Object.freeze([
  {
    rowId: 'portfolio-position-projection',
    owner: SOURCE_ROOTS.model,
    contract:
      'PackPortfolioPositionProjection groups source-safe PackActivity rows into enterprise portfolio positions with BTD estimates, sats values, signal counts, proof counts, and state readback.',
    requiredFields: ['assetPackTitle', 'repository', 'activityCount', 'valueTotalSats', 'btdEstimate', 'proofRootCount'],
  },
  {
    rowId: 'market-signal-projection',
    owner: SOURCE_ROOTS.model,
    contract:
      'PackMarketSignalProjection exposes demand, supply, unfit-Need, settlement, compensation, delivery, and repair signals without source-bearing payloads.',
    requiredFields: ['kind', 'strength', 'state', 'relatedRecordIds', 'proofRoots'],
  },
  {
    rowId: 'saved-filter-presets',
    owner: SOURCE_ROOTS.client,
    contract:
      '/packs renders saved source-safe filters for repair cases, demand signals, supply signals, settlement facets, and compensation facets.',
    requiredFields: ['savedFilters', 'writeParams', 'Settlement facets', 'Compensation facets'],
  },
  {
    rowId: 'portfolio-market-api',
    owner: SOURCE_ROOTS.route,
    contract:
      '/api/packs/activity returns marketIntelligence beside records, detail, summary, query, and sourceSafety.',
    requiredFields: ['marketIntelligence', 'buildPackPortfolioMarketIntelligence', 'sourceSafety'],
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
    predicateResult('spec-defines-gate3', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 3 Packs Portfolio Search And Market Intelligence')),
    predicateResult('spec-names-gate3-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-packs-portfolio-market-intelligence')),
    predicateResult('delta-records-gate3', SOURCE_ROOTS.delta, sources.delta.includes('Gate 3') && sources.delta.includes('v44-packs-portfolio-market-intelligence')),
    predicateResult('notes-records-gate3', SOURCE_ROOTS.notes, sources.notes.includes('Gate 3') && sources.notes.includes('saved filters')),
    predicateResult('parity-records-gate3', SOURCE_ROOTS.parity, sources.parity.includes('v44-packs-portfolio-market-intelligence')),
    predicateResult('roadmap-records-gate3', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 3 closure anchor')),
    predicateResult('readme-records-gate3', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 3')),
    predicateResult('protocol-readme-records-gate3', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 3')),
    predicateResult('economic-model-prerequisite-present', SOURCE_ROOTS.economicModel, sources.economicModel.includes('V44_ECONOMIC_DOMAIN_ROWS')),
    predicateResult('model-defines-market-intelligence', SOURCE_ROOTS.model, sources.model.includes('buildPackPortfolioMarketIntelligence')),
    predicateResult('model-defines-saved-filters', SOURCE_ROOTS.model, sources.model.includes('PackSavedFilterPreset') && sources.model.includes('savedFilters')),
    predicateResult('model-defines-market-signals', SOURCE_ROOTS.model, sources.model.includes('PackMarketSignalProjection') && sources.model.includes('unfit-need')),
    predicateResult('model-defines-facets', SOURCE_ROOTS.model, sources.model.includes('PackPortfolioFacetSummary') && sources.model.includes('settlementState')),
    predicateResult('api-returns-market-intelligence', SOURCE_ROOTS.route, sources.route.includes('marketIntelligence') && sources.route.includes('buildPackPortfolioMarketIntelligence')),
    predicateResult('client-renders-portfolio-positions', SOURCE_ROOTS.client, sources.client.includes('Portfolio positions') && sources.client.includes('marketIntelligence?.positions')),
    predicateResult('client-renders-market-signals', SOURCE_ROOTS.client, sources.client.includes('Market intelligence') && sources.client.includes('marketIntelligence?.signals')),
    predicateResult('client-renders-saved-filters', SOURCE_ROOTS.client, sources.client.includes('marketIntelligence?.savedFilters')),
    predicateResult('client-renders-facet-filters', SOURCE_ROOTS.client, sources.client.includes('Settlement facet') && sources.client.includes('Compensation facet')),
    predicateResult('uapi-test-covers-gate3-model', SOURCE_ROOTS.uapiTest, sources.uapiTest.includes('builds source-safe portfolio positions')),
    predicateResult('package-test-covers-gate3', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44PacksPortfolioMarketIntelligence')),
    predicateResult('package-exports-gate3', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44PacksPortfolioMarketIntelligence')),
    predicateResult('package-types-export-gate3', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44PacksPortfolioMarketIntelligence')),
    predicateResult('package-json-exposes-gate3', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-packs-portfolio-market-intelligence"') && sources.packageJson.includes('"check:v44-gate3"')),
    predicateResult('gate-workflow-runs-gate3', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate3-packs-portfolio-market-intelligence.mjs')),
    predicateResult('canon-workflow-runs-gate3', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate3-packs-portfolio-market-intelligence.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44PacksPortfolioMarketIntelligence')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 3 packs portfolio market intelligence check')),
  ];
}

export function buildV44PacksPortfolioMarketIntelligence(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-packs-portfolio-market-intelligence:${digest(JSON.stringify({
    portfolioViewIds: V44_PACKS_PORTFOLIO_VIEW_IDS,
    marketSignalIds: V44_PACKS_MARKET_SIGNAL_IDS,
    marketFacetIds: V44_PACKS_MARKET_FACET_IDS,
    rowIds: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-packs-portfolio-market-intelligence',
    schemaId: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SCHEMA_ID,
    version: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_VERSION,
    currentTarget: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_CURRENT_TARGET,
    sourceSafetyVerdict: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    portfolioViewIds: [...V44_PACKS_PORTFOLIO_VIEW_IDS],
    marketSignalIds: [...V44_PACKS_MARKET_SIGNAL_IDS],
    marketFacetIds: [...V44_PACKS_MARKET_FACET_IDS],
    forbiddenPayloadIds: [...V44_PACKS_PORTFOLIO_FORBIDDEN_PAYLOAD_IDS],
    rows: V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-packs-portfolio-market-row:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      portfolioPositionsImplemented: true,
      savedFiltersImplemented: true,
      organizationViewsImplemented: true,
      marketSignalsImplemented: true,
      unfitNeedSignalsImplemented: true,
      settlementFacetsImplemented: true,
      compensationFacetsImplemented: true,
      proofRootDrilldownImplemented: true,
      apiProjectionImplemented: true,
      uiProjectionImplemented: true,
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
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
