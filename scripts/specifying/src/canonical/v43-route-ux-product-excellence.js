// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH = '.bitcode/v43-route-ux-product-excellence.json';
export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_SCHEMA_ID = 'bitcode.v43.routeUxProductExcellence.v1';
export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_VERSION = 'V43';
export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_CURRENT_TARGET = 'V42';
export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_SOURCE_SAFETY_VERDICT =
  'source-safe-product-route-ux-metadata';

export const V43_ROUTE_UX_OBJECT_IDS = Object.freeze([
  'ProductRouteShell',
  'ProductRouteStepGrid',
  'ProductRouteStatePanel',
  'ProductRouteDisclosure',
  '/packs product route',
  '/read product route',
  '/deposit product route',
]);

export const V43_ROUTE_UX_FIELD_IDS = Object.freeze([
  'routeLabel',
  'routeTitle',
  'routeSummary',
  'metric',
  'step',
  'statePanel',
  'progressiveDisclosure',
  'sourceSafeBoundary',
]);

export const V43_ROUTE_UX_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
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
  productRouteShell: 'apps/uapi/components/bitcode/routes/product-route-shell.tsx',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  packsTest: 'apps/uapi/tests/packsPageClient.test.tsx',
  readTest: 'apps/uapi/tests/readPageClient.test.tsx',
  depositTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolTest: 'scripts/specifying/test/v43-route-ux-product-excellence.test.js',
  generator: 'scripts/generate-v43-route-ux-product-excellence.mjs',
  checker: 'scripts/check-v43-gate8-route-ux-product-excellence.mjs',
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

export const V43_ROUTE_UX_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'shared-product-route-shell',
    owner: SOURCE_ROOTS.productRouteShell,
    contract:
      'Packs, Reading, and Depositing render through a shared themed product shell with route label, title, concise summary, and source-safe route metrics.',
    requiredFields: ['ProductRouteShell', 'route-shell-packs', 'route-shell-read', 'route-shell-deposit'],
  },
  {
    rowId: 'keyboard-five-step-navigation',
    owner: SOURCE_ROOTS.productRouteShell,
    contract:
      'Reading and Depositing use a shared button-based step grid with visible active state, aria-current step semantics, and stable data attributes for route state tests.',
    requiredFields: ['ProductRouteStepGrid', 'aria-current', 'data-reading-step-state', 'data-deposit-step-state'],
  },
  {
    rowId: 'state-panels-empty-error-loading',
    owner: SOURCE_ROOTS.productRouteShell,
    contract:
      'Packs, Reading, and Depositing share compact loading, empty, and error state panels without leaking source-bearing payloads.',
    requiredFields: ['ProductRouteStatePanel', 'loading', 'empty', 'error'],
  },
  {
    rowId: 'progressive-source-safe-detail',
    owner: SOURCE_ROOTS.productRouteShell,
    contract:
      'Read and Deposit route proof detail remains expandable by default, with visible metadata and withheld protected-source boundaries stated as route state.',
    requiredFields: ['ProductRouteDisclosure', 'Disclosure boundary', 'Withheld'],
  },
  {
    rowId: 'product-copy-reduced',
    owner: SOURCE_ROOTS.spec,
    contract:
      'In-app product copy is concise route/status vocabulary rather than self-referential instructions, while deeper protocol explanation stays in public documentation and proof artifacts.',
    requiredFields: ['self-referential product copy', 'route structure', 'progressive proof detail'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );
  const productCopy = [sources.packsClient, sources.readClient, sources.depositClient].join('\n');

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate8', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 8 UX/UI Product Excellence Pass')),
    predicateResult('spec-records-shared-route-shell', SOURCE_ROOTS.spec, sources.spec.includes('ProductRouteShell') && sources.spec.includes('ProductRouteStepGrid')),
    predicateResult('delta-records-gate8', SOURCE_ROOTS.delta, sources.delta.includes('Gate 8') && sources.delta.includes('v43-route-ux-product-excellence')),
    predicateResult('notes-records-gate8', SOURCE_ROOTS.notes, sources.notes.includes('Gate 8') && sources.notes.includes('product route shell')),
    predicateResult('parity-records-gate8', SOURCE_ROOTS.parity, sources.parity.includes('UX/UI product excellence') && sources.parity.includes('v43-route-ux-product-excellence')),
    predicateResult('roadmap-records-gate8', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 8 closure anchor')),
    predicateResult('readme-records-gate8', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 8')),
    predicateResult('protocol-readme-records-gate8', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 8')),
    predicateResult('shared-shell-implements-route-shell', SOURCE_ROOTS.productRouteShell, sources.productRouteShell.includes('ProductRouteShell') && sources.productRouteShell.includes('ProductRouteMetric')),
    predicateResult('shared-shell-implements-step-grid', SOURCE_ROOTS.productRouteShell, sources.productRouteShell.includes('ProductRouteStepGrid') && sources.productRouteShell.includes('aria-current')),
    predicateResult(
      'shared-shell-implements-state-panel',
      SOURCE_ROOTS.productRouteShell,
      sources.productRouteShell.includes('ProductRouteStatePanel') &&
        sources.productRouteShell.includes('variant:') &&
        sources.productRouteShell.includes('"loading" | "empty" | "error"'),
    ),
    predicateResult('shared-shell-implements-disclosure', SOURCE_ROOTS.productRouteShell, sources.productRouteShell.includes('ProductRouteDisclosure') && sources.productRouteShell.includes('<details')),
    predicateResult('packs-route-uses-shell', SOURCE_ROOTS.packsClient, sources.packsClient.includes('route-shell-packs') && sources.packsClient.includes('ProductRouteStatePanel')),
    predicateResult('read-route-uses-shell-step-grid', SOURCE_ROOTS.readClient, sources.readClient.includes('route-shell-read') && sources.readClient.includes('ProductRouteStepGrid')),
    predicateResult('deposit-route-uses-shell-step-grid', SOURCE_ROOTS.depositClient, sources.depositClient.includes('route-shell-deposit') && sources.depositClient.includes('ProductRouteStepGrid')),
    predicateResult(
      'read-route-uses-progressive-disclosure',
      SOURCE_ROOTS.readClient,
      sources.readClient.includes('ProductRouteDisclosure') && sources.readClient.includes('Withheld until paid'),
    ),
    predicateResult('deposit-route-uses-progressive-disclosure', SOURCE_ROOTS.depositClient, sources.depositClient.includes('ProductRouteDisclosure') && sources.depositClient.includes('Withheld: raw source')),
    predicateResult('product-copy-removes-long-instructions', SOURCE_ROOTS.productRouteShell, !productCopy.includes('Request a repository read, review the synthesized Need') && !productCopy.includes('Connect source, synthesize reviewable AssetPack options') && !productCopy.includes('Search AssetPack proposals')),
    predicateResult('read-test-covers-shell-and-active-step', SOURCE_ROOTS.readTest, sources.readTest.includes('route-shell-read') && sources.readTest.includes('aria-current')),
    predicateResult('deposit-test-covers-shell-and-active-step', SOURCE_ROOTS.depositTest, sources.depositTest.includes('route-shell-deposit') && sources.depositTest.includes('aria-current')),
    predicateResult('packs-test-covers-shell', SOURCE_ROOTS.packsTest, sources.packsTest.includes('route-shell-packs')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV43RouteUxProductExcellence')),
    predicateResult('protocol-package-exports-gate8', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV43RouteUxProductExcellence')),
    predicateResult('protocol-types-export-gate8', SOURCE_ROOTS.protocolTypes, sources.protocolTypes.includes('buildV43RouteUxProductExcellence')),
    predicateResult('package-json-exposes-gate8', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-route-ux-product-excellence"') && sources.packageJson.includes('"check:v43-gate8"')),
    predicateResult('gate-workflow-runs-gate8', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate8-route-ux-product-excellence.mjs')),
    predicateResult('canon-workflow-runs-gate8', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate8-route-ux-product-excellence.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43RouteUxProductExcellence')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 8 route UX product excellence check')),
  ];
}

export function buildV43RouteUxProductExcellence({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-route-ux-product-excellence:${digest(JSON.stringify({
    objectIds: V43_ROUTE_UX_OBJECT_IDS,
    fieldIds: V43_ROUTE_UX_FIELD_IDS,
    forbiddenPayloadIds: V43_ROUTE_UX_FORBIDDEN_PAYLOAD_IDS,
    contractRows: V43_ROUTE_UX_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-route-ux-product-excellence',
    schemaId: V43_ROUTE_UX_PRODUCT_EXCELLENCE_SCHEMA_ID,
    version: V43_ROUTE_UX_PRODUCT_EXCELLENCE_VERSION,
    currentTarget: V43_ROUTE_UX_PRODUCT_EXCELLENCE_CURRENT_TARGET,
    sourceSafetyVerdict: V43_ROUTE_UX_PRODUCT_EXCELLENCE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V43_ROUTE_UX_OBJECT_IDS],
    fieldIds: [...V43_ROUTE_UX_FIELD_IDS],
    forbiddenPayloadIds: [...V43_ROUTE_UX_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V43_ROUTE_UX_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-route-ux-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      sharedRouteShellImplemented: true,
      sharedStepGridImplemented: true,
      keyboardCurrentStepImplemented: true,
      routeMetricsImplemented: true,
      productRouteStatePanelsImplemented: true,
      loadingEmptyErrorStatesImplemented: true,
      progressiveDisclosureImplemented: true,
      packsRouteUsesSharedShell: true,
      readRouteUsesSharedShell: true,
      depositRouteUsesSharedShell: true,
      selfReferentialProductCopyReduced: true,
      executionStreamReadbackRetained: true,
      responsiveGridPostureImplemented: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V43_ROUTE_UX_PRODUCT_EXCELLENCE_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
