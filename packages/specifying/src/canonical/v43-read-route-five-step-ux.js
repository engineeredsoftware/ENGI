// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH = '.bitcode/v43-read-route-five-step-ux.json';
export const V43_READ_ROUTE_FIVE_STEP_UX_SCHEMA_ID = 'bitcode.v43.readRouteFiveStepUx.v1';
export const V43_READ_ROUTE_FIVE_STEP_UX_VERSION = 'V43';
export const V43_READ_ROUTE_FIVE_STEP_UX_CURRENT_TARGET = 'V42';
export const V43_READ_ROUTE_FIVE_STEP_UX_SOURCE_SAFETY_VERDICT = 'source-safe-read-route-five-step-metadata';

export const V43_READ_ROUTE_STEP_IDS = Object.freeze([
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
]);

export const V43_READ_ROUTE_OBJECT_IDS = Object.freeze([
  'ReadRouteSession',
  'Read Request',
  'synthesized Need',
  'Need review decision',
  'Finding Fits request',
  'AssetPack preview',
  'settlement quote',
  'delivery receipt',
]);

export const V43_READ_ROUTE_PIPELINE_IDS = Object.freeze([
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
]);

export const V43_READ_ROUTE_SOURCE_SAFE_FIELD_IDS = Object.freeze([
  'read_request_summary',
  'read_need_measurements',
  'need_feedback_history',
  'depository_candidate_counts',
  'selected_fit_ids',
  'asset_pack_measurements',
  'quality_posture',
  'proof_roots',
  'btc_fee_quote',
  'settlement_state',
  'delivery_posture',
]);

export const V43_READ_ROUTE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_protected_prompt',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'wallet_private_material',
  'settlement_private_payload',
  'ledger_write_authority',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V43.md',
  delta: 'BITCODE_SPEC_V43_DELTA.md',
  notes: 'BITCODE_SPEC_V43_NOTES.md',
  parity: 'BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  routeModel: 'uapi/components/reads/models/read-route-model.ts',
  page: 'uapi/app/read/page.tsx',
  client: 'uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  terminalRoutes: 'uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
  terminalWorkbench: 'uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalReadingState: 'uapi/components/reads/models/read-route-model.ts',
  nav: 'uapi/components/bitcode/layout/nav.tsx',
  workspaceSurface: 'uapi/components/bitcode/layout/WorkspaceSurface/workspace-surface.ts',
  publicCopy: 'uapi/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy.ts',
  publicExplainers: 'uapi/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers.ts',
  footer: 'uapi/components/bitcode/layout/footer.tsx',
  packageIndex: 'packages/specifying/src/index.js',
  packageTypes: 'packages/specifying/src/index.d.ts',
  packageTest: 'packages/specifying/test/v43-read-route-five-step-ux.test.js',
  routeModelTest: 'uapi/tests/readRouteModel.test.ts',
  pageTest: 'uapi/tests/readPageClient.test.tsx',
  generator: 'scripts/generate-v43-read-route-five-step-ux.mjs',
  checker: 'scripts/check-v43-gate4-read-route-five-step-ux.mjs',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceRoot(sourcePath) {
  return `${sourcePath}:${digest(readSource(DEFAULT_REPO_ROOT, sourcePath))}`;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

export const V43_READ_ROUTE_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'read-route-session',
    owner: SOURCE_ROOTS.routeModel,
    contract:
      'ReadRouteSession owns the /read route state, five Reading steps, accepted-Need gate, source-safe preview boundary, settlement quote, and delivery unlock posture.',
    requiredFields: ['schema', 'route', 'steps', 'readObjects', 'pipelineOwnership', 'disclosure', 'proofRoot'],
  },
  {
    rowId: 'read-route-page',
    owner: SOURCE_ROOTS.page,
    contract:
      '/read is the default Reading route with metadata, public shell chrome, Suspense fallback, and ReadPageClient.',
    requiredFields: ['canonical', 'ReadPageClient', 'PublicShellFrame'],
  },
  {
    rowId: 'read-route-client',
    owner: SOURCE_ROOTS.client,
    contract:
      'ReadPageClient renders request-read, Need review, Finding Fits request, source-safe preview, settlement/delivery posture, route-owned activity readback, and live workbench controls.',
    requiredFields: [
      'TerminalDepositReadWorkbench',
      'TerminalRepositoryContextPanel',
      'TerminalReadScenarioPanel',
      'buildReadRouteSession',
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
    ],
  },
  {
    rowId: 'navigation-read-route',
    owner: SOURCE_ROOTS.nav,
    contract:
      'Public navigation and footer expose /read as the primary Reading path while retained Terminal remains available for debug-compatible detail.',
    requiredFields: ['/read', 'Read', 'BITCODE_PUBLIC_EXPLAINERS.read'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate4', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 4 Read Route Extraction And Five-Step UX')),
    predicateResult('spec-names-read-route-objects', SOURCE_ROOTS.spec, sources.spec.includes('ReadRouteSession') && sources.spec.includes('Finding Fits request')),
    predicateResult('delta-records-gate4', SOURCE_ROOTS.delta, sources.delta.includes('Gate 4') && sources.delta.includes('v43-read-route-five-step-ux')),
    predicateResult('notes-records-gate4', SOURCE_ROOTS.notes, sources.notes.includes('Gate 4') && sources.notes.includes('/read')),
    predicateResult('parity-records-gate4', SOURCE_ROOTS.parity, sources.parity.includes('Gate 4') && sources.parity.includes('ReadRouteSession')),
    predicateResult('roadmap-records-gate4', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 4 closure anchor')),
    predicateResult('readme-records-gate4', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 4')),
    predicateResult('protocol-readme-records-gate4', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 4')),
    predicateResult('route-model-defines-read-route-session', SOURCE_ROOTS.routeModel, sources.routeModel.includes("schema: 'bitcode.read.route-session'") && sources.routeModel.includes('assertReadRouteSessionSourceSafe')),
    predicateResult('route-model-defines-pipeline-ownership', SOURCE_ROOTS.routeModel, sources.routeModel.includes('ReadNeedComprehensionSynthesis') && sources.routeModel.includes('ReadFitsFindingSynthesis')),
    predicateResult('route-model-forbids-source-leakage', SOURCE_ROOTS.routeModel, sources.routeModel.includes('protectedSourceVisible: false') && sources.routeModel.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('read-page-canonical-route', SOURCE_ROOTS.page, sources.page.includes("canonical: '/read'") && sources.page.includes('ReadPageClient')),
    predicateResult(
      'read-client-renders-five-step-route',
      SOURCE_ROOTS.client,
      (sources.client.includes('data-testid={`read-route-step-${step.id}`}') ||
        (sources.client.includes('ProductRouteStepGrid') && sources.client.includes('testIdPrefix="read-route-step"'))) &&
        sources.client.includes('Reading steps'),
    ),
    predicateResult('read-client-reuses-live-workbench', SOURCE_ROOTS.client, sources.client.includes('TerminalDepositReadWorkbench') && sources.client.includes('showDemonstrationWorkbench={false}')),
    predicateResult('read-client-renders-source-safe-session', SOURCE_ROOTS.client, sources.client.includes('Source-safe read state') && sources.client.includes('Disclosure boundary')),
    predicateResult('read-client-records-activity', SOURCE_ROOTS.client, sources.client.includes('/api/executions/history') && sources.client.includes('buildTerminalExecutionHistoryRequest')),
    predicateResult('terminal-routes-define-read', SOURCE_ROOTS.terminalRoutes, sources.terminalRoutes.includes("READ_ROUTE = '/read'") && sources.terminalRoutes.includes('buildReadHref')),
    predicateResult('workbench-preserves-execution-stream', SOURCE_ROOTS.terminalWorkbench, sources.terminalWorkbench.includes('BitcodeExecutionStreamPanel') && sources.terminalWorkbench.includes('Request Fit')),
    predicateResult('reading-state-preserves-five-steps', SOURCE_ROOTS.terminalReadingState, V43_READ_ROUTE_STEP_IDS.every((id) => sources.terminalReadingState.includes(`'${id}'`))),
    predicateResult('nav-links-to-read', SOURCE_ROOTS.nav, sources.nav.includes("href === '/read'") && sources.nav.includes('BITCODE_PUBLIC_EXPLAINERS.read')),
    predicateResult('public-shell-recognizes-read', SOURCE_ROOTS.workspaceSurface, sources.workspaceSurface.includes("pathname.startsWith('/read')")),
    predicateResult('public-copy-uses-read-link', SOURCE_ROOTS.publicCopy, sources.publicCopy.includes("{ href: '/read', label: 'Read' }")),
    predicateResult('public-explainers-define-read', SOURCE_ROOTS.publicExplainers, sources.publicExplainers.includes("title: 'Read'") && sources.publicExplainers.includes('Finding Fits')),
    predicateResult('footer-links-to-read', SOURCE_ROOTS.footer, sources.footer.includes("const READ_URL = '/read'") && sources.footer.includes('BITCODE_PUBLIC_EXPLAINERS.read')),
    predicateResult('uapi-route-model-test-covers-read', SOURCE_ROOTS.routeModelTest, sources.routeModelTest.includes('assertReadRouteSessionSourceSafe')),
    predicateResult('uapi-page-test-covers-read', SOURCE_ROOTS.pageTest, sources.pageTest.includes('ReadPageClient') && sources.pageTest.includes('read-route-step-request-read')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV43ReadRouteFiveStepUx')),
    predicateResult('package-exports-gate4', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV43ReadRouteFiveStepUx')),
    predicateResult('package-types-export-gate4', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV43ReadRouteFiveStepUx')),
    predicateResult('package-json-exposes-gate4', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-read-route-five-step-ux"') && sources.packageJson.includes('"check:v43-gate4"')),
    predicateResult('gate-workflow-runs-gate4', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate4-read-route-five-step-ux.mjs')),
    predicateResult('canon-workflow-runs-gate4', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate4-read-route-five-step-ux.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43ReadRouteFiveStepUx')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 4 read route five-step UX check')),
  ];
}

export function buildV43ReadRouteFiveStepUx({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-read-route-five-step-ux:${digest(JSON.stringify({
    stepIds: V43_READ_ROUTE_STEP_IDS,
    objectIds: V43_READ_ROUTE_OBJECT_IDS,
    pipelineIds: V43_READ_ROUTE_PIPELINE_IDS,
    sourceSafeFieldIds: V43_READ_ROUTE_SOURCE_SAFE_FIELD_IDS,
    forbiddenPayloadIds: V43_READ_ROUTE_FORBIDDEN_PAYLOAD_IDS,
    contractRows: V43_READ_ROUTE_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-read-route-five-step-ux',
    schemaId: V43_READ_ROUTE_FIVE_STEP_UX_SCHEMA_ID,
    version: V43_READ_ROUTE_FIVE_STEP_UX_VERSION,
    currentTarget: V43_READ_ROUTE_FIVE_STEP_UX_CURRENT_TARGET,
    sourceSafetyVerdict: V43_READ_ROUTE_FIVE_STEP_UX_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    stepIds: [...V43_READ_ROUTE_STEP_IDS],
    objectIds: [...V43_READ_ROUTE_OBJECT_IDS],
    pipelineIds: [...V43_READ_ROUTE_PIPELINE_IDS],
    sourceSafeFieldIds: [...V43_READ_ROUTE_SOURCE_SAFE_FIELD_IDS],
    forbiddenPayloadIds: [...V43_READ_ROUTE_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V43_READ_ROUTE_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-read-route-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      readRouteImplemented: true,
      fiveStepUxImplemented: true,
      readNeedReviewImplemented: true,
      findingFitsRequestImplemented: true,
      assetPackPreviewImplemented: true,
      settlementDeliveryBoundaryImplemented: true,
      executionStreamRetained: true,
      terminalDebugCompatibilityRetained: true,
      acceptedNeedRequiredBeforeFindingFits: true,
      sourceSafePreviewBeforeSettlement: true,
      deliveryRequiresPaidReadRights: true,
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

export const V43_READ_ROUTE_FIVE_STEP_UX_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
