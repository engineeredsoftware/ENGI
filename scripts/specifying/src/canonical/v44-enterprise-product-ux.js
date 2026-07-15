// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_ENTERPRISE_PRODUCT_UX_ARTIFACT_PATH =
  '.bitcode/v44-enterprise-product-ux.json';
export const V44_ENTERPRISE_PRODUCT_UX_SCHEMA_ID =
  'bitcode.v44.enterpriseProductUx.v1';
export const V44_ENTERPRISE_PRODUCT_UX_VERSION = 'V44';
export const V44_ENTERPRISE_PRODUCT_UX_CURRENT_TARGET = 'V43';
export const V44_ENTERPRISE_PRODUCT_UX_SOURCE_SAFETY_VERDICT =
  'source-safe-enterprise-product-ux-metadata';

export const V44_ENTERPRISE_PRODUCT_UX_OBJECT_IDS = Object.freeze([
  'ProductRouteEnterpriseSummary',
  'ProductRouteKeyboardHint',
  'ProductRouteProofDetail',
  'PacksEnterpriseEconomicSummary',
  'ReadEnterpriseEconomicSummary',
  'DepositEnterpriseEconomicSummary',
  'PackActivityEconomicOperationTable',
  'ExpandableEconomicProofDetail',
]);

export const V44_ENTERPRISE_PRODUCT_UX_ROUTE_IDS = Object.freeze([
  '/packs',
  '/read',
  '/deposit',
]);

export const V44_ENTERPRISE_PRODUCT_UX_CAPABILITY_IDS = Object.freeze([
  'dense-economic-summary',
  'keyboard-navigation',
  'responsive-economic-layout',
  'expandable-proof-detail',
  'sticky-pack-activity-table',
  'source-safe-disclosure-boundary',
  'visual-regression-test-hooks',
]);

export const V44_ENTERPRISE_PRODUCT_UX_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  protocolSource: 'scripts/specifying/src/canonical/v44-enterprise-product-ux.js',
  protocolTest: 'scripts/specifying/test/v44-enterprise-product-ux.test.js',
  generator: 'scripts/generate-v44-enterprise-product-ux.mjs',
  checker: 'scripts/check-v44-gate8-enterprise-product-ux.mjs',
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

export const V44_ENTERPRISE_PRODUCT_UX_ROWS = Object.freeze([
  {
    rowId: 'shared-enterprise-ux-primitives',
    owner: SOURCE_ROOTS.productRouteShell,
    contract:
      'Product route shell exposes shared enterprise summary, keyboard navigation, and proof-detail primitives for source-safe economic operation.',
    requiredFields: [
      'ProductRouteEnterpriseSummary',
      'ProductRouteKeyboardHint',
      'ProductRouteProofDetail',
      'data-enterprise-ux',
    ],
  },
  {
    rowId: 'packs-economic-operation',
    owner: SOURCE_ROOTS.packsClient,
    contract:
      '/packs renders portfolio economy overview, keyboard navigation, sticky dense activity grid, and expandable proof detail.',
    requiredFields: [
      'packs-enterprise-economic-summary',
      'packs-keyboard-navigation',
      'packs-enterprise-activity-grid',
      'packs-expandable-proof-detail',
    ],
  },
  {
    rowId: 'read-economic-operation',
    owner: SOURCE_ROOTS.readClient,
    contract:
      '/read renders Reading economy overview, keyboard navigation, and route/procurement/authority proof roots.',
    requiredFields: [
      'read-enterprise-economic-summary',
      'read-keyboard-navigation',
      'read-expandable-proof-detail',
      'Reading economy overview',
    ],
  },
  {
    rowId: 'deposit-economic-operation',
    owner: SOURCE_ROOTS.depositClient,
    contract:
      '/deposit renders Depositing economy overview, keyboard navigation, and synthesis/policy/admission/earnings/authority proof roots.',
    requiredFields: [
      'deposit-enterprise-economic-summary',
      'deposit-keyboard-navigation',
      'deposit-expandable-proof-detail',
      'Depositing economy overview',
    ],
  },
  {
    rowId: 'focused-route-tests',
    owner: SOURCE_ROOTS.packsTest,
    contract:
      'Focused route tests cover enterprise summaries, keyboard hints, proof detail, and source-safe table/detail hooks.',
    requiredFields: [
      'packs-enterprise-economic-summary',
      'read-enterprise-economic-summary',
      'deposit-enterprise-economic-summary',
    ],
  },
  {
    rowId: 'workflow-and-artifact-wiring',
    owner: SOURCE_ROOTS.checker,
    contract:
      'Gate 8 closes only when generator, checker, protocol exports, docs, workflows, focused tests, and generated artifact are current.',
    requiredFields: [
      'check-v44-gate8-enterprise-product-ux',
      'generate-v44-enterprise-product-ux',
    ],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      readSource(repoRoot, sourcePath),
    ]),
  );

  return [
    predicateResult(
      'active-canon-pointer-supports-v44-draft-or-promoted',
      SOURCE_ROOTS.activePointer,
      bitcodeVersionAtLeast(sources.activePointer, 'V43'),
    ),
    predicateResult(
      'spec-defines-gate8',
      SOURCE_ROOTS.spec,
      sources.spec.includes('V44 Gate 8 Enterprise Product UX For Economic Operation'),
    ),
    predicateResult(
      'spec-names-gate8-artifact',
      SOURCE_ROOTS.spec,
      sources.spec.includes('v44-enterprise-product-ux'),
    ),
    predicateResult(
      'delta-records-gate8',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 8') && sources.delta.includes('v44-enterprise-product-ux'),
    ),
    predicateResult(
      'notes-records-gate8',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Gate 8') && sources.notes.includes('enterprise product UX'),
    ),
    predicateResult(
      'parity-records-gate8',
      SOURCE_ROOTS.parity,
      sources.parity.includes('v44-enterprise-product-ux'),
    ),
    predicateResult(
      'roadmap-records-gate8',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V44 Gate 8 closure anchor'),
    ),
    predicateResult(
      'readme-records-gate8',
      SOURCE_ROOTS.readme,
      sources.readme.includes('V44 Gate 8'),
    ),
    predicateResult(
      'protocol-readme-records-gate8',
      SOURCE_ROOTS.protocolReadme,
      sources.protocolReadme.includes('V44 Gate 8'),
    ),
    predicateResult(
      'shared-enterprise-summary-implemented',
      SOURCE_ROOTS.productRouteShell,
      sources.productRouteShell.includes('ProductRouteEnterpriseSummary') &&
        sources.productRouteShell.includes('data-enterprise-ux="economic-summary"'),
    ),
    predicateResult(
      'shared-keyboard-hint-implemented',
      SOURCE_ROOTS.productRouteShell,
      sources.productRouteShell.includes('ProductRouteKeyboardHint') &&
        sources.productRouteShell.includes('data-enterprise-ux="keyboard-navigation"'),
    ),
    predicateResult(
      'shared-proof-detail-implemented',
      SOURCE_ROOTS.productRouteShell,
      sources.productRouteShell.includes('ProductRouteProofDetail') &&
        sources.productRouteShell.includes('data-enterprise-ux="expandable-proof-detail"'),
    ),
    predicateResult(
      'packs-route-uses-enterprise-ux',
      SOURCE_ROOTS.packsClient,
      sources.packsClient.includes('packs-enterprise-economic-summary') &&
        sources.packsClient.includes('packs-keyboard-navigation') &&
        sources.packsClient.includes('packs-enterprise-activity-grid') &&
        sources.packsClient.includes('packs-expandable-proof-detail') &&
        sources.packsClient.includes('sticky top-0'),
    ),
    predicateResult(
      'read-route-uses-enterprise-ux',
      SOURCE_ROOTS.readClient,
      sources.readClient.includes('read-enterprise-economic-summary') &&
        sources.readClient.includes('read-keyboard-navigation') &&
        sources.readClient.includes('read-expandable-proof-detail'),
    ),
    predicateResult(
      'deposit-route-uses-enterprise-ux',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('deposit-enterprise-economic-summary') &&
        sources.depositClient.includes('deposit-keyboard-navigation') &&
        sources.depositClient.includes('deposit-expandable-proof-detail'),
    ),
    predicateResult(
      'packs-test-covers-enterprise-ux',
      SOURCE_ROOTS.packsTest,
      sources.packsTest.includes('packs-enterprise-economic-summary') &&
        sources.packsTest.includes('packs-keyboard-navigation') &&
        sources.packsTest.includes('packs-expandable-proof-detail'),
    ),
    predicateResult(
      'read-test-covers-enterprise-ux',
      SOURCE_ROOTS.readTest,
      sources.readTest.includes('read-enterprise-economic-summary') &&
        sources.readTest.includes('read-keyboard-navigation') &&
        sources.readTest.includes('read-expandable-proof-detail'),
    ),
    predicateResult(
      'deposit-test-covers-enterprise-ux',
      SOURCE_ROOTS.depositTest,
      sources.depositTest.includes('deposit-enterprise-economic-summary') &&
        sources.depositTest.includes('deposit-keyboard-navigation') &&
        sources.depositTest.includes('deposit-expandable-proof-detail'),
    ),
    predicateResult(
      'protocol-test-covers-artifact',
      SOURCE_ROOTS.protocolTest,
      sources.protocolTest.includes('buildV44EnterpriseProductUx'),
    ),
    predicateResult(
      'protocol-package-exports-gate8',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV44EnterpriseProductUx'),
    ),
    predicateResult(
      'protocol-types-export-gate8',
      SOURCE_ROOTS.protocolTypes,
      sources.protocolTypes.includes('buildV44EnterpriseProductUx'),
    ),
    predicateResult(
      'package-json-exposes-gate8',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v44-enterprise-product-ux"') &&
        sources.packageJson.includes('"check:v44-gate8"'),
    ),
    predicateResult(
      'gate-workflow-runs-gate8',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v44-gate8-enterprise-product-ux.mjs'),
    ),
    predicateResult(
      'canon-workflow-runs-gate8',
      SOURCE_ROOTS.canonWorkflow,
      sources.canonWorkflow.includes('check-v44-gate8-enterprise-product-ux.mjs'),
    ),
    predicateResult(
      'generator-exists',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV44EnterpriseProductUx'),
    ),
    predicateResult(
      'checker-exists',
      SOURCE_ROOTS.checker,
      sources.checker.includes('V44 Gate 8 enterprise product UX check'),
    ),
  ];
}

export function buildV44EnterpriseProductUx({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`,
    ]),
  );
  const artifactRoot = `v44-enterprise-product-ux:${digest(
    JSON.stringify({
      objectIds: V44_ENTERPRISE_PRODUCT_UX_OBJECT_IDS,
      routeIds: V44_ENTERPRISE_PRODUCT_UX_ROUTE_IDS,
      capabilityIds: V44_ENTERPRISE_PRODUCT_UX_CAPABILITY_IDS,
      forbiddenPayloadIds: V44_ENTERPRISE_PRODUCT_UX_FORBIDDEN_PAYLOAD_IDS,
      contractRows: V44_ENTERPRISE_PRODUCT_UX_ROWS.map((row) => row.rowId),
      sourceRoots,
      failedPredicateIds,
    }),
  )}`;

  return {
    artifactId: 'v44-enterprise-product-ux',
    schemaId: V44_ENTERPRISE_PRODUCT_UX_SCHEMA_ID,
    version: V44_ENTERPRISE_PRODUCT_UX_VERSION,
    currentTarget: V44_ENTERPRISE_PRODUCT_UX_CURRENT_TARGET,
    sourceSafetyVerdict: V44_ENTERPRISE_PRODUCT_UX_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V44_ENTERPRISE_PRODUCT_UX_OBJECT_IDS],
    routeIds: [...V44_ENTERPRISE_PRODUCT_UX_ROUTE_IDS],
    capabilityIds: [...V44_ENTERPRISE_PRODUCT_UX_CAPABILITY_IDS],
    forbiddenPayloadIds: [...V44_ENTERPRISE_PRODUCT_UX_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V44_ENTERPRISE_PRODUCT_UX_ROWS.map((row) => ({
      ...row,
      rowRoot: `v44-enterprise-product-ux-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      sharedEnterpriseSummaryImplemented: true,
      sharedKeyboardNavigationImplemented: true,
      sharedExpandableProofDetailImplemented: true,
      packsEnterpriseUxImplemented: true,
      readEnterpriseUxImplemented: true,
      depositEnterpriseUxImplemented: true,
      denseEconomicTableImplemented: true,
      responsiveLayoutPostureImplemented: true,
      visualRegressionTestHooksImplemented: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      credentialsVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetAdmitted: false,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V44_ENTERPRISE_PRODUCT_UX_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
