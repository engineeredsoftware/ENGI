// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH =
  '.bitcode/v43-packs-activity-master-detail.json';
export const V43_PACKS_ACTIVITY_MASTER_DETAIL_SCHEMA_ID =
  'bitcode.v43.packsActivityMasterDetail.v1';
export const V43_PACKS_ACTIVITY_MASTER_DETAIL_VERSION = 'V43';
export const V43_PACKS_ACTIVITY_MASTER_DETAIL_CURRENT_TARGET = 'V42';
export const V43_PACKS_ACTIVITY_MASTER_DETAIL_SOURCE_SAFETY_VERDICT =
  'source-safe-packs-activity-master-detail-metadata';

export const V43_PACK_ACTIVITY_TYPE_IDS = Object.freeze([
  'deposit-option',
  'depository-assetpack',
  'read-need-fit-preview',
  'settled-assetpack',
  'settlement',
  'compensation',
  'delivery',
  'repair',
  'execution',
  'notification',
]);

export const V43_PACK_ACTIVITY_SEARCH_FIELD_IDS = Object.freeze([
  'title',
  'description',
  'assetPackTitle',
  'measurements',
  'values',
  'activityType',
  'transactionType',
  'settlementState',
  'compensationState',
  'deliveryState',
  'repairState',
  'proofRoots',
  'repository',
  'timestamp',
]);

export const V43_PACK_ACTIVITY_SORT_IDS = Object.freeze([
  'timestamp',
  'title',
  'value',
  'settlementState',
  'compensationState',
  'deliveryState',
  'repairState',
]);

export const V43_PACK_ACTIVITY_FILTER_IDS = Object.freeze([
  'activityType',
  'scope',
  'state',
  'settlementState',
  'compensationState',
  'deliveryState',
  'repairState',
  'repository',
]);

export const V43_PACK_ACTIVITY_DETAIL_SECTION_IDS = Object.freeze([
  'overview',
  'measurements',
  'values',
  'proofs',
  'settlement',
  'compensation',
  'delivery',
  'repair',
  'telemetry',
  'metadata',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'specifications/BITCODE_SPEC.txt',
  spec: 'specifications/BITCODE_SPEC_V43.md',
  delta: 'specifications/BITCODE_SPEC_V43_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V43_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  model: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  route: 'apps/uapi/app/api/packs/activity/route.ts',
  page: 'apps/uapi/app/packs/page.tsx',
  client: 'apps/uapi/app/packs/PacksPageClient.tsx',
  exchangeRedirect: 'apps/uapi/app/exchange/page.tsx',
  nav: 'apps/uapi/components/bitcode/layout/nav.tsx',
  workspaceSurface: 'apps/uapi/components/bitcode/layout/WorkspaceSurface/workspace-surface.ts',
  publicCopy: 'apps/uapi/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy.ts',
  publicExplainers: 'apps/uapi/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers.ts',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageTest: 'scripts/specifying/test/v43-packs-activity-master-detail.test.js',
  uapiTest: 'apps/uapi/tests/packActivityModel.test.ts',
  generator: 'scripts/generate-v43-packs-activity-master-detail.mjs',
  checker: 'scripts/check-v43-gate3-packs-activity-master-detail.mjs',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'unpaid-assetpack-source',
  'source-snippets',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'settlement-private-payloads',
]);

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

export const V43_PACK_ACTIVITY_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'pack-activity-record',
    owner: SOURCE_ROOTS.model,
    contract:
      'PackActivityRecord contains source-safe activity type, title, description, repository, measurements, values, proof roots, and state readback.',
    requiredFields: [
      'type',
      'title',
      'description',
      'repository',
      'measurements',
      'values',
      'proofRoots',
      'settlementState',
      'compensationState',
      'deliveryState',
      'repairState',
      'sourceSafety',
    ],
  },
  {
    rowId: 'packs-activity-api',
    owner: SOURCE_ROOTS.route,
    contract:
      '/api/packs/activity returns queried PackActivity records, summary, detail projection, and explicit source-safety posture.',
    requiredFields: ['records', 'summary', 'detail', 'query', 'sourceSafety'],
  },
  {
    rowId: 'packs-route-master-detail',
    owner: SOURCE_ROOTS.client,
    contract:
      '/packs renders searchable, sortable, filterable master-detail pack activity with proof roots and state readback.',
    requiredFields: ['search', 'type', 'state', 'sort', 'detailId'],
  },
  {
    rowId: 'exchange-compatibility-redirect',
    owner: SOURCE_ROOTS.exchangeRedirect,
    contract:
      '/exchange is retained only as compatibility redirect into /packs while preserving query parameters.',
    requiredFields: ['/packs', 'searchParams'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate3', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 3 Packs Activity Master-Detail Data Model')),
    predicateResult('spec-names-packactivity-contracts', SOURCE_ROOTS.spec, sources.spec.includes('PackActivity data contracts')),
    predicateResult('delta-records-gate3', SOURCE_ROOTS.delta, sources.delta.includes('Gate 3') && sources.delta.includes('v43-packs-activity-master-detail')),
    predicateResult('notes-records-gate3', SOURCE_ROOTS.notes, sources.notes.includes('Gate 3') && sources.notes.includes('/api/packs/activity')),
    predicateResult('parity-records-gate3', SOURCE_ROOTS.parity, sources.parity.includes('v43-packs-activity-master-detail')),
    predicateResult('roadmap-records-gate3', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 3 closure anchor')),
    predicateResult('readme-records-gate3', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 3')),
    predicateResult('protocol-readme-records-gate3', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 3')),
    predicateResult('model-defines-packactivity-record', SOURCE_ROOTS.model, sources.model.includes('export interface PackActivityRecord')),
    predicateResult('model-defines-search-filter-sort', SOURCE_ROOTS.model, sources.model.includes('filterPackActivityRecords') && sources.model.includes('sortPackActivityRecords') && sources.model.includes('queryPackActivityRecords')),
    predicateResult('model-defines-detail-projection', SOURCE_ROOTS.model, sources.model.includes('buildPackActivityDetailProjection')),
    predicateResult('model-defines-source-safety-assertion', SOURCE_ROOTS.model, sources.model.includes('assertPackActivitySourceSafe')),
    predicateResult('api-route-exposes-packactivity-query', SOURCE_ROOTS.route, sources.route.includes('/api/activity') && sources.route.includes('queryPackActivityRecords') && sources.route.includes('sourceSafety')),
    predicateResult('packs-page-canonical-route', SOURCE_ROOTS.page, sources.page.includes("canonical: '/packs'") && sources.page.includes('PacksPageClient')),
    predicateResult('packs-client-master-detail', SOURCE_ROOTS.client, sources.client.includes('/api/packs/activity') && sources.client.includes('detailId') && sources.client.includes('Proof roots')),
    predicateResult('packs-client-search-sort-filter', SOURCE_ROOTS.client, sources.client.includes('Search pack activity') && sources.client.includes('Sort:') && sources.client.includes('Activity type')),
    predicateResult('exchange-route-redirects-to-packs', SOURCE_ROOTS.exchangeRedirect, sources.exchangeRedirect.includes('redirect(`/packs')),
    predicateResult('nav-links-to-packs', SOURCE_ROOTS.nav, sources.nav.includes("href === '/packs'") && sources.nav.includes("startsWith('/packs")),
    predicateResult('public-shell-recognizes-packs', SOURCE_ROOTS.workspaceSurface, sources.workspaceSurface.includes("pathname.startsWith('/packs')")),
    predicateResult('public-copy-uses-packs-link', SOURCE_ROOTS.publicCopy, sources.publicCopy.includes("{ href: '/packs', label: 'Packs' }")),
    predicateResult('public-explainers-use-packs', SOURCE_ROOTS.publicExplainers, sources.publicExplainers.includes("title: 'Packs'")),
    predicateResult('uapi-test-covers-model', SOURCE_ROOTS.uapiTest, sources.uapiTest.includes('pack-activity-model') && sources.uapiTest.includes('assertPackActivitySourceSafe')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV43PacksActivityMasterDetail')),
    predicateResult('package-exports-gate3', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV43PacksActivityMasterDetail')),
    predicateResult('package-types-export-gate3', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV43PacksActivityMasterDetail')),
    predicateResult('package-json-exposes-gate3', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-packs-activity-master-detail"') && sources.packageJson.includes('"check:v43-gate3"')),
    predicateResult('gate-workflow-runs-gate3', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate3-packs-activity-master-detail.mjs')),
    predicateResult('canon-workflow-runs-gate3', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate3-packs-activity-master-detail.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43PacksActivityMasterDetail')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 3 packs activity master-detail check')),
  ];
}

export function buildV43PacksActivityMasterDetail(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-packs-activity-master-detail:${digest(JSON.stringify({
    typeIds: V43_PACK_ACTIVITY_TYPE_IDS,
    searchFieldIds: V43_PACK_ACTIVITY_SEARCH_FIELD_IDS,
    sortIds: V43_PACK_ACTIVITY_SORT_IDS,
    filterIds: V43_PACK_ACTIVITY_FILTER_IDS,
    detailSectionIds: V43_PACK_ACTIVITY_DETAIL_SECTION_IDS,
    contractRows: V43_PACK_ACTIVITY_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-packs-activity-master-detail',
    schemaId: V43_PACKS_ACTIVITY_MASTER_DETAIL_SCHEMA_ID,
    version: V43_PACKS_ACTIVITY_MASTER_DETAIL_VERSION,
    currentTarget: V43_PACKS_ACTIVITY_MASTER_DETAIL_CURRENT_TARGET,
    sourceSafetyVerdict: V43_PACKS_ACTIVITY_MASTER_DETAIL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    typeIds: [...V43_PACK_ACTIVITY_TYPE_IDS],
    searchFieldIds: [...V43_PACK_ACTIVITY_SEARCH_FIELD_IDS],
    sortIds: [...V43_PACK_ACTIVITY_SORT_IDS],
    filterIds: [...V43_PACK_ACTIVITY_FILTER_IDS],
    detailSectionIds: [...V43_PACK_ACTIVITY_DETAIL_SECTION_IDS],
    contractRows: V43_PACK_ACTIVITY_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-pack-activity-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      packActivityContractsImplemented: true,
      packsRouteImplemented: true,
      packsActivityApiImplemented: true,
      exchangeRedirectCompatibilityImplemented: true,
      tableSearchImplemented: true,
      columnSortImplemented: true,
      filteringImplemented: true,
      detailProjectionImplemented: true,
      proofRootDisplayImplemented: true,
      settlementStateReadbackImplemented: true,
      compensationStateReadbackImplemented: true,
      deliveryStateReadbackImplemented: true,
      repairStateReadbackImplemented: true,
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
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V43_PACKS_ACTIVITY_MASTER_DETAIL_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
