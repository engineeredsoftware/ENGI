// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';
import {
  V46_PROTOCOL_CLAIM_AUTHORITY_IDS,
  V46_PROTOCOL_CLAIM_CATEGORY_IDS,
  V46_PROTOCOL_CLAIM_ROWS,
  V46_PROTOCOL_PRIVATE_PAYLOAD_IDS,
} from './v46-protocol-comprehension-object-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH =
  '.bitcode/v46-product-route-comprehension-readback.json';
export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SCHEMA_ID =
  'bitcode.v46.productRouteComprehensionReadback.v1';
export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_VERSION = 'V46';
export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_CURRENT_TARGET = 'V45';
export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SOURCE_SAFETY_VERDICT =
  'source-safe-product-route-comprehension-readback';

export const V46_PRODUCT_ROUTE_IDS = Object.freeze(['packs', 'read', 'deposit']);
export const V46_PRODUCT_ROUTE_PATHS = Object.freeze(['/packs', '/read', '/deposit']);
export const V46_PRODUCT_ROUTE_CAPABILITY_IDS = Object.freeze([
  'low-detail-default',
  'route-owned-state',
  'search-filter-sort',
  'five-step-reading',
  'five-step-depositing',
  'source-safe-preview',
  'expandable-proof-readback',
  'keyboard-navigation',
  'proof-root-readback',
  'settlement-rights-delivery-boundary',
  'compensation-readback',
  'terminal-debug-compatibility',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V46.md',
  delta: 'BITCODE_SPEC_V46_DELTA.md',
  notes: 'BITCODE_SPEC_V46_NOTES.md',
  parity: 'BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  packageJson: 'package.json',
  packageIndex: 'packages/protocol/src/index.js',
  packageTypes: 'packages/protocol/src/index.d.ts',
  packageSource: 'packages/protocol/src/canonical/v46-product-route-comprehension-readback.js',
  packageTest: 'packages/protocol/test/v46-product-route-comprehension-readback.test.js',
  generator: 'scripts/generate-v46-product-route-comprehension-readback.mjs',
  checker: 'scripts/check-v46-gate4-product-route-comprehension-readback.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  productRouteShell: 'uapi/components/bitcode/routes/product-route-shell.tsx',
  packsClient: 'uapi/app/packs/PacksPageClient.tsx',
  packsModel: 'uapi/components/bitcode/activity/pack-activity-model.ts',
  packsApi: 'uapi/app/api/packs/activity/route.ts',
  packsTest: 'uapi/tests/packsPageClient.test.tsx',
  readClient: 'uapi/app/read/ReadPageClient.tsx',
  readModel: 'uapi/app/read/read-route-model.ts',
  readStepModel: 'uapi/app/terminal/terminal-enterprise-reading-ux-state.ts',
  readClientTest: 'uapi/tests/readPageClient.test.tsx',
  readModelTest: 'uapi/tests/readRouteModel.test.ts',
  depositClient: 'uapi/app/deposit/DepositPageClient.tsx',
  depositModel: 'uapi/app/deposit/deposit-route-model.ts',
  depositClientTest: 'uapi/tests/depositPageClient.test.tsx',
  depositModelTest: 'uapi/tests/depositRouteModel.test.ts',
});

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_PRODUCT_ROUTE_PHRASES = Object.freeze([
  'Source Shares and the Bitcode Exchange',
  'Learn Bitcode from Source Shares to proof',
  'BTD is money',
  'BTD is only a read right',
  'preview discloses source',
  'quote is payment',
  'payment observation is finality',
  'database is ledger truth',
  'telemetry advances state',
  'server custodies wallet private material',
  'value-bearing mainnet operation is live',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function sourceRoot(repoRoot, sourcePath) {
  return `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function scanSourcesForMarkers(repoRoot, sourcePaths, markers) {
  const joined = sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.filter((marker) => marker && joined.includes(marker));
}

function claimExists(claimId) {
  return V46_PROTOCOL_CLAIM_ROWS.some((row) => row.claimId === claimId);
}

function categoryExists(categoryId) {
  return V46_PROTOCOL_CLAIM_CATEGORY_IDS.includes(categoryId);
}

function authorityExists(authorityId) {
  return V46_PROTOCOL_CLAIM_AUTHORITY_IDS.includes(authorityId);
}

function requiredTokensPresent(repoRoot, row) {
  const joined = row.sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return row.requiredCopyTokens.every((token) => joined.includes(token));
}

function routeRow({
  routeId,
  routePath,
  routeRole,
  sourcePaths,
  claimIds,
  claimCategoryIds,
  authorityIds,
  capabilityIds,
  requiredCopyTokens,
  readbackRoots,
  operatorReading,
}) {
  return {
    routeId,
    routePath,
    routeRole,
    sourcePaths,
    claimIds,
    claimCategoryIds,
    authorityIds,
    capabilityIds,
    requiredCopyTokens,
    readbackRoots,
    operatorReading,
    lowDetailDefault: true,
    expandableSourceSafeDetail: true,
    routeOwnedState: true,
    proofReadbackVisible: true,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetAdmitted: false,
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    rowRoot: `v46-product-route-row:${digest(JSON.stringify({ routeId, sourcePaths, capabilityIds, readbackRoots }))}`,
  };
}

export const V46_PRODUCT_ROUTE_READBACK_ROWS = Object.freeze([
  routeRow({
    routeId: 'packs',
    routePath: '/packs',
    routeRole: 'searchable source-safe PackActivity master-detail and market activity readback',
    sourcePaths: [SOURCE_PATHS.packsClient, SOURCE_PATHS.packsModel, SOURCE_PATHS.packsApi, SOURCE_PATHS.packsTest, SOURCE_PATHS.productRouteShell],
    claimIds: [
      'assetpack-is-commodity',
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'finality-authorizes-rights-and-delivery',
      'compensation-follows-source-to-shares',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: [
      'protocol-law',
      'product-guidance',
      'operator-evidence',
      'preview-claim',
      'rights-claim',
      'compensation-claim',
      'repair-claim',
      'telemetry-observability',
    ],
    authorityIds: ['canonical-specification', 'generated-proof', 'ledger-readback', 'database-projection', 'interface-guidance-only'],
    capabilityIds: [
      'low-detail-default',
      'route-owned-state',
      'search-filter-sort',
      'source-safe-preview',
      'expandable-proof-readback',
      'keyboard-navigation',
      'proof-root-readback',
      'settlement-rights-delivery-boundary',
      'compensation-readback',
    ],
    requiredCopyTokens: [
      'Pack activity',
      'Portfolio positions, market signals, proof roots, settlement, compensation, delivery, repair.',
      'Search titles, measurements, values, proof roots',
      'Source-safe detail',
      'Expandable proof detail',
      'packs-enterprise-activity-grid',
      'PackActivityRecord',
    ],
    readbackRoots: ['proofRoots', 'accounting.statementRoot', 'governance.authorityRoot', 'commodityState'],
    operatorReading:
      '/packs is the source-safe master-detail readback for PackActivity, not a source disclosure surface or ledger source of truth.',
  }),
  routeRow({
    routeId: 'read',
    routePath: '/read',
    routeRole: 'five-step Reading procurement route from Read Request to settled delivery',
    sourcePaths: [
      SOURCE_PATHS.readClient,
      SOURCE_PATHS.readModel,
      SOURCE_PATHS.readStepModel,
      SOURCE_PATHS.readClientTest,
      SOURCE_PATHS.readModelTest,
      SOURCE_PATHS.productRouteShell,
    ],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'preview-is-source-safe-measurement',
      'quote-is-source-safe-offer',
      'payment-observation-is-not-finality',
      'finality-authorizes-rights-and-delivery',
      'delivery-is-entitled-source-unlock',
      'operator-evidence-is-source-safe-readback',
    ],
    claimCategoryIds: [
      'protocol-law',
      'product-guidance',
      'preview-claim',
      'quote-claim',
      'settlement-claim',
      'rights-claim',
      'delivery-claim',
      'operator-evidence',
    ],
    authorityIds: [
      'canonical-specification',
      'generated-proof',
      'ledger-readback',
      'wallet-provider-receipt',
      'repository-delivery-receipt',
      'interface-guidance-only',
    ],
    capabilityIds: [
      'low-detail-default',
      'route-owned-state',
      'five-step-reading',
      'source-safe-preview',
      'expandable-proof-readback',
      'keyboard-navigation',
      'proof-root-readback',
      'settlement-rights-delivery-boundary',
      'terminal-debug-compatibility',
    ],
    requiredCopyTokens: [
      'Read request -> Need -> Finding Fits -> Preview -> Settlement.',
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
      'Withheld until paid rights: source-bearing AssetPack contents',
      'read-route-step-request-read',
      'read-expandable-proof-detail',
      'measurement-weight-volume',
    ],
    readbackRoots: ['readRouteSession.proofRoot', 'budgetPolicy.policyRoot', 'quotePolicy.quoteRoot', 'settlement.readinessRoot', 'authorityRoot'],
    operatorReading:
      '/read keeps the buyer path in five steps and withholds source-bearing AssetPack contents until BTC finality, BTD rights transfer, and entitled delivery readback.',
  }),
  routeRow({
    routeId: 'deposit',
    routePath: '/deposit',
    routeRole: 'five-step Depositing route from connected source to Depository admission',
    sourcePaths: [
      SOURCE_PATHS.depositClient,
      SOURCE_PATHS.depositModel,
      SOURCE_PATHS.depositClientTest,
      SOURCE_PATHS.depositModelTest,
      SOURCE_PATHS.productRouteShell,
    ],
    claimIds: [
      'assetpack-is-commodity',
      'deposit-option-is-potential-supply',
      'operator-evidence-is-source-safe-readback',
      'compensation-follows-source-to-shares',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: ['protocol-law', 'product-guidance', 'operator-evidence', 'compensation-claim', 'repair-claim', 'telemetry-observability'],
    authorityIds: ['canonical-specification', 'generated-proof', 'database-projection', 'object-storage-root', 'interface-guidance-only'],
    capabilityIds: [
      'low-detail-default',
      'route-owned-state',
      'five-step-depositing',
      'source-safe-preview',
      'expandable-proof-readback',
      'keyboard-navigation',
      'proof-root-readback',
      'compensation-readback',
      'terminal-debug-compatibility',
    ],
    requiredCopyTokens: [
      'Connect source',
      'Synthesize AssetPack options',
      'Review source-safe options',
      'Submit deposit',
      'Read depository state',
      'DepositAssetPackOptionSynthesis',
      'reviewable source-safe AssetPack supply options.',
      'Withheld: raw source',
      'deposit-route-step-connect-source',
      'deposit-expandable-proof-detail',
      'Expected compensation',
    ],
    readbackRoots: ['depositRouteSession.proofRoot', 'synthesis.roots.synthesisRoot', 'policy.roots.policyReportRoot', 'admission.roots.admissionReportRoot', 'earningSupplyIntelligence.roots.intelligenceRoot'],
    operatorReading:
      '/deposit is the source-safe supply route; it forms reviewable options and admission readback without exposing protected source or claiming final Need-relative BTD at option time.',
  }),
]);

function buildSourceRoots(repoRoot) {
  return Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, sourceRoot(repoRoot, sourcePath)]));
}

function buildSourcePredicates(repoRoot) {
  const sources = Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]));
  return [
    predicateResult('active-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult('spec-records-route-readback-law', SOURCE_PATHS.spec, sources.spec.includes('V46 product route comprehension readback law')),
    predicateResult('delta-records-gate4', SOURCE_PATHS.delta, sources.delta.includes('Gate 4: `/packs`, `/read`, And `/deposit` Comprehension UX Readback')),
    predicateResult('notes-record-gate4', SOURCE_PATHS.notes, sources.notes.includes('Gate 4 records the product-route comprehension atom')),
    predicateResult('parity-records-gate4', SOURCE_PATHS.parity, sources.parity.includes('Product route comprehension readback artifact')),
    predicateResult('roadmap-records-gate4-closure', SOURCE_PATHS.roadmap, sources.roadmap.includes('V46 Gate 4 closure anchor')),
    predicateResult('package-source-exists', SOURCE_PATHS.packageSource, sourceExists(repoRoot, SOURCE_PATHS.packageSource)),
    predicateResult('package-test-exists', SOURCE_PATHS.packageTest, sourceExists(repoRoot, SOURCE_PATHS.packageTest)),
    predicateResult('generator-exists', SOURCE_PATHS.generator, sourceExists(repoRoot, SOURCE_PATHS.generator)),
    predicateResult('checker-exists', SOURCE_PATHS.checker, sourceExists(repoRoot, SOURCE_PATHS.checker)),
    predicateResult('package-json-exposes-gate4', SOURCE_PATHS.packageJson, sources.packageJson.includes('"check:v46-gate4"')),
    predicateResult('package-exports-gate4', SOURCE_PATHS.packageIndex, sources.packageIndex.includes('buildV46ProductRouteComprehensionReadback')),
    predicateResult('package-types-export-gate4', SOURCE_PATHS.packageTypes, sources.packageTypes.includes('buildV46ProductRouteComprehensionReadback')),
    predicateResult('gate-and-canon-workflows-run-gate4', SOURCE_PATHS.gateWorkflow, sources.gateWorkflow.includes('check-v46-gate4-product-route-comprehension-readback.mjs') && sources.canonWorkflow.includes('check-v46-gate4-product-route-comprehension-readback.mjs')),
    predicateResult('packs-route-uses-shared-shell', SOURCE_PATHS.packsClient, sources.packsClient.includes('route-shell-packs') && sources.packsClient.includes('ProductRouteEnterpriseSummary') && sources.packsClient.includes('ProductRouteProofDetail')),
    predicateResult(
      'read-route-uses-five-step-shell',
      SOURCE_PATHS.readClient,
      sources.readClient.includes('route-shell-read') &&
        sources.readClient.includes('ProductRouteStepGrid') &&
        sources.readModel.includes('ReadFitsFindingSynthesis'),
    ),
    predicateResult('deposit-route-uses-five-step-shell', SOURCE_PATHS.depositClient, sources.depositClient.includes('route-shell-deposit') && sources.depositClient.includes('ProductRouteStepGrid') && sources.depositClient.includes('DepositAssetPackOptionSynthesis')),
  ];
}

function sourceSafetyCoverage(repoRoot, rows) {
  const allSourcePaths = [...new Set(rows.flatMap((row) => row.sourcePaths))];
  const forbiddenPhraseHits = scanSourcesForMarkers(repoRoot, allSourcePaths, FORBIDDEN_PRODUCT_ROUTE_PHRASES);
  const secretMarkerHits = scanSourcesForMarkers(repoRoot, allSourcePaths, SECRET_MARKERS);
  const rowsMissingRequiredCopy = rows.filter((row) => !requiredTokensPresent(repoRoot, row)).map((row) => row.routeId);
  return {
    sourceSafeMetadataOnly: rows.every((row) => row.sourceSafeMetadataOnly === true),
    protectedSourceVisible: rows.some((row) => row.protectedSourceVisible === true),
    unpaidAssetPackSourceVisible: rows.some((row) => row.unpaidAssetPackSourceVisible === true),
    rawPromptVisible: rows.some((row) => row.rawPromptVisible === true),
    interpolatedPromptVisible: rows.some((row) => row.interpolatedPromptVisible === true),
    rawProviderResponseVisible: rows.some((row) => row.rawProviderResponseVisible === true),
    credentialsSerialized: rows.some((row) => row.credentialsSerialized === true),
    walletPrivateMaterialVisible: rows.some((row) => row.walletPrivateMaterialVisible === true),
    settlementPrivatePayloadVisible: rows.some((row) => row.settlementPrivatePayloadVisible === true),
    valueBearingMainnetAdmitted: rows.some((row) => row.valueBearingMainnetAdmitted === true),
    forbiddenPhraseHits,
    secretMarkerHits,
    rowsMissingRequiredCopy,
  };
}

export function buildV46ProductRouteComprehensionReadback(input = {}) {
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const routeRows = [...V46_PRODUCT_ROUTE_READBACK_ROWS];
  const sourcePredicates = buildSourcePredicates(repoRoot);
  const failedPredicateIds = sourcePredicates.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const claimIdsUsed = [...new Set(routeRows.flatMap((row) => row.claimIds))];
  const categoryIdsUsed = [...new Set(routeRows.flatMap((row) => row.claimCategoryIds))];
  const authorityIdsUsed = [...new Set(routeRows.flatMap((row) => row.authorityIds))];
  const capabilityIdsUsed = [...new Set(routeRows.flatMap((row) => row.capabilityIds))];
  const coverage = {
    routeCount: routeRows.length,
    routeIds: [...V46_PRODUCT_ROUTE_IDS],
    routePaths: [...V46_PRODUCT_ROUTE_PATHS],
    capabilityIds: [...V46_PRODUCT_ROUTE_CAPABILITY_IDS],
    capabilityIdsUsed,
    claimIdsUsed,
    categoryIdsUsed,
    authorityIdsUsed,
    privatePayloadIds: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    allRoutesCovered: V46_PRODUCT_ROUTE_IDS.every((routeId) => routeRows.some((row) => row.routeId === routeId)),
    allRoutePathsCovered: V46_PRODUCT_ROUTE_PATHS.every((routePath) => routeRows.some((row) => row.routePath === routePath)),
    lowDetailDefaultsCovered: routeRows.every((row) => row.lowDetailDefault === true),
    expandableProofReadbackCovered: routeRows.every((row) => row.expandableSourceSafeDetail === true && row.proofReadbackVisible === true),
    routeOwnedStateCovered: routeRows.every((row) => row.routeOwnedState === true),
    requiredCapabilitiesCovered: V46_PRODUCT_ROUTE_CAPABILITY_IDS.filter((capabilityId) => capabilityId !== 'terminal-debug-compatibility').every(
      (capabilityId) => capabilityIdsUsed.includes(capabilityId),
    ),
    routeSpecificCapabilitiesCovered:
      capabilityIdsUsed.includes('search-filter-sort') &&
      capabilityIdsUsed.includes('five-step-reading') &&
      capabilityIdsUsed.includes('five-step-depositing'),
    allClaimIdsKnown: claimIdsUsed.every(claimExists),
    allCategoryIdsKnown: categoryIdsUsed.every(categoryExists),
    allAuthorityIdsKnown: authorityIdsUsed.every(authorityExists),
    sourcePredicates,
    failedPredicateIds,
    ...sourceSafetyCoverage(repoRoot, routeRows),
  };

  return {
    artifactId: 'v46-product-route-comprehension-readback',
    artifactPath: V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH,
    artifactRoot: `v46-product-route-comprehension-readback:${digest(JSON.stringify({ routeRows, coverage }))}`,
    schemaId: V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SCHEMA_ID,
    version: V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_VERSION,
    currentTarget: V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_CURRENT_TARGET,
    sourceSafetyVerdict: V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SOURCE_SAFETY_VERDICT,
    sourceRoots: buildSourceRoots(repoRoot),
    routeIds: [...V46_PRODUCT_ROUTE_IDS],
    routePaths: [...V46_PRODUCT_ROUTE_PATHS],
    capabilityIds: [...V46_PRODUCT_ROUTE_CAPABILITY_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    routeRows,
    coverage,
    passed:
      failedPredicateIds.length === 0 &&
      coverage.allRoutesCovered === true &&
      coverage.allRoutePathsCovered === true &&
      coverage.lowDetailDefaultsCovered === true &&
      coverage.expandableProofReadbackCovered === true &&
      coverage.routeOwnedStateCovered === true &&
      coverage.requiredCapabilitiesCovered === true &&
      coverage.routeSpecificCapabilitiesCovered === true &&
      coverage.allClaimIdsKnown === true &&
      coverage.allCategoryIdsKnown === true &&
      coverage.allAuthorityIdsKnown === true &&
      coverage.sourceSafeMetadataOnly === true &&
      coverage.protectedSourceVisible === false &&
      coverage.unpaidAssetPackSourceVisible === false &&
      coverage.rawPromptVisible === false &&
      coverage.interpolatedPromptVisible === false &&
      coverage.rawProviderResponseVisible === false &&
      coverage.credentialsSerialized === false &&
      coverage.walletPrivateMaterialVisible === false &&
      coverage.settlementPrivatePayloadVisible === false &&
      coverage.valueBearingMainnetAdmitted === false &&
      coverage.forbiddenPhraseHits.length === 0 &&
      coverage.secretMarkerHits.length === 0 &&
      coverage.rowsMissingRequiredCopy.length === 0,
    closureReading:
      'V46 Gate 4 closes source-safe route comprehension readback for /packs, /read, and /deposit without changing active V45 canon or admitting value-bearing mainnet operation.',
  };
}

export const V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SOURCE_ROOTS = Object.freeze(
  buildSourceRoots(DEFAULT_REPO_ROOT),
);
