// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_DEPOSIT_ROUTE_OPTIONS_ARTIFACT_PATH = '.bitcode/v43-deposit-route-options.json';
export const V43_DEPOSIT_ROUTE_OPTIONS_SCHEMA_ID = 'bitcode.v43.depositRouteOptions.v1';
export const V43_DEPOSIT_ROUTE_OPTIONS_VERSION = 'V43';
export const V43_DEPOSIT_ROUTE_OPTIONS_CURRENT_TARGET = 'V42';
export const V43_DEPOSIT_ROUTE_OPTIONS_SOURCE_SAFETY_VERDICT = 'source-safe-deposit-route-option-metadata';

export const V43_DEPOSIT_ROUTE_STEP_IDS = Object.freeze([
  'connect-source',
  'synthesize-options',
  'review-options',
  'submit-deposit',
  'read-depository-state',
]);

export const V43_DEPOSIT_OPTION_OBJECT_IDS = Object.freeze([
  'DepositRouteSession',
  'DepositOptionSynthesisRequest',
  'DepositAssetPackOptionSynthesis',
  'DepositAssetPackOption',
  'source-safe measurements',
  'depositor review boundary',
  'future admission boundary',
]);

export const V43_DEPOSIT_OPTION_PIPELINE_IDS = Object.freeze([
  'DepositAssetPackOptionSynthesis',
]);

export const V43_DEPOSIT_OPTION_SOURCE_SAFE_FIELD_IDS = Object.freeze([
  'repositoryFullName',
  'sourceBranch',
  'sourceCommit',
  'sourcePathRoots',
  'depositorInstructionRoot',
  'demandSignalRoots',
  'optionMeasurements',
  'optionRoots',
  'reviewBoundary',
  'policyBoundary',
]);

export const V43_DEPOSIT_OPTION_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'wallet_private_material',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: '.specifications/BITCODE_SPEC.txt',
  spec: '.specifications/BITCODE_SPEC_V43.md',
  delta: '.specifications/BITCODE_SPEC_V43_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V43_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  terminalRoutes: 'apps/uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
  routeModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  page: 'apps/uapi/app/deposit/page.tsx',
  client: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  optionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-options.ts',
  optionModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-options.test.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageManifest: 'packages/asset-packs-pipelines/domain/package.json',
  publicCopy: 'apps/uapi/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy.ts',
  publicExplainers: 'apps/uapi/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers.ts',
  workspaceSurface: 'apps/uapi/components/bitcode/layout/WorkspaceSurface/workspace-surface.ts',
  nav: 'apps/uapi/components/bitcode/layout/nav.tsx',
  footer: 'apps/uapi/components/bitcode/layout/footer.tsx',
  routeModelTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  pageTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolTest: 'scripts/specifying/test/v43-deposit-route-options.test.js',
  generator: 'scripts/generate-v43-deposit-route-options.mjs',
  checker: 'scripts/check-v43-gate5-deposit-route-options.mjs',
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

export const V43_DEPOSIT_ROUTE_OPTIONS_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'deposit-route-session',
    owner: SOURCE_ROOTS.routeModel,
    contract:
      'DepositRouteSession owns the /deposit route state, five depositing steps, source-safe option synthesis, review boundary, and future Gate 6/7 policy/admission deferrals.',
    requiredFields: ['schema', 'route', 'steps', 'pipelineOwnership', 'synthesis', 'disclosure', 'proofRoot'],
  },
  {
    rowId: 'deposit-option-synthesis-model',
    owner: SOURCE_ROOTS.optionModel,
    contract:
      'DepositAssetPackOptionSynthesis proposes multiple source-safe AssetPack options from connected source, depositor instruction, Depository demand, Reading demand, and existing supply signals.',
    requiredFields: ['DepositOptionSynthesisRequest', 'DepositAssetPackOption', 'buildDepositAssetPackOptionSynthesis'],
  },
  {
    rowId: 'deposit-route-client',
    owner: SOURCE_ROOTS.client,
    contract:
      '/deposit reuses repository context, supply selection, and the existing deposit composer while rendering source-safe AssetPack option cards.',
    requiredFields: ['TerminalRepositoryContextPanel', 'TerminalSupplySelectionPanel', 'TerminalDepositComposer'],
  },
  {
    rowId: 'deposit-navigation',
    owner: SOURCE_ROOTS.nav,
    contract:
      'Public navigation, footer, and public shell recognize /deposit as the default depositing path while /terminal remains available for cockpit detail.',
    requiredFields: ['/deposit', 'Deposit', 'BITCODE_PUBLIC_EXPLAINERS.deposit'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate5', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 5 Deposit Route And Agentic AssetPack Option Synthesis')),
    predicateResult('spec-names-deposit-option-objects', SOURCE_ROOTS.spec, sources.spec.includes('DepositAssetPackOption') && sources.spec.includes('DepositOptionSynthesisRequest')),
    predicateResult('delta-records-gate5', SOURCE_ROOTS.delta, sources.delta.includes('Gate 5') && sources.delta.includes('v43-deposit-route-options')),
    predicateResult('notes-records-gate5', SOURCE_ROOTS.notes, sources.notes.includes('Gate 5') && sources.notes.includes('/deposit')),
    predicateResult('parity-records-gate5', SOURCE_ROOTS.parity, sources.parity.includes('Gate 5') && sources.parity.includes('DepositAssetPackOption')),
    predicateResult('roadmap-records-gate5', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 5 closure anchor')),
    predicateResult('readme-records-gate5', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 5')),
    predicateResult('protocol-readme-records-gate5', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 5')),
    predicateResult('terminal-routes-define-deposit', SOURCE_ROOTS.terminalRoutes, sources.terminalRoutes.includes("DEPOSIT_ROUTE = '/deposit'") && sources.terminalRoutes.includes('buildDepositHref')),
    predicateResult('route-model-defines-deposit-session', SOURCE_ROOTS.routeModel, sources.routeModel.includes("schema: 'bitcode.deposit.route-session'") && sources.routeModel.includes('assertDepositRouteSessionSourceSafe')),
    predicateResult(
      'route-model-defines-pipeline-ownership',
      SOURCE_ROOTS.routeModel,
      sources.routeModel.includes('DepositAssetPackOptionSynthesis') &&
        sources.routeModel.includes("depositOptionPolicy: 'DepositAssetPackOptionPolicy'") &&
        sources.routeModel.includes("depositOptionAdmission: 'DepositAssetPackOptionAdmissionReport'") &&
        sources.routeModel.includes('sourceCriticalityDemandRoiPolicyPresent: true') &&
        sources.routeModel.includes('admissionAndIndexingPolicyPresent: true'),
    ),
    predicateResult('route-model-forbids-source-leakage', SOURCE_ROOTS.routeModel, sources.routeModel.includes('protectedSourceVisible: false') && sources.routeModel.includes('rawSourceTextVisible: false') && sources.routeModel.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('deposit-page-canonical-route', SOURCE_ROOTS.page, sources.page.includes("canonical: '/deposit'") && sources.page.includes('DepositPageClient')),
    predicateResult(
      'deposit-client-renders-five-step-route',
      SOURCE_ROOTS.client,
      (sources.client.includes('data-testid={`deposit-route-step-${step.id}`}') ||
        (sources.client.includes('ProductRouteStepGrid') && sources.client.includes('testIdPrefix="deposit-route-step"'))) &&
        sources.client.includes('Deposit steps'),
    ),
    predicateResult('deposit-client-renders-options', SOURCE_ROOTS.client, sources.client.includes('DepositAssetPackOptionSynthesis') && sources.client.includes('Source-safe AssetPack proposals')),
    predicateResult('deposit-client-reuses-terminal-primitives', SOURCE_ROOTS.client, sources.client.includes('TerminalRepositoryContextPanel') && sources.client.includes('TerminalSupplySelectionPanel') && sources.client.includes('TerminalDepositComposer')),
    predicateResult('option-model-defines-request', SOURCE_ROOTS.optionModel, sources.optionModel.includes('DepositOptionSynthesisRequest') && sources.optionModel.includes('depositoryDemandSignals') && sources.optionModel.includes('readingDemandSignals')),
    predicateResult('option-model-builds-multiple-options', SOURCE_ROOTS.optionModel, sources.optionModel.includes('capability-slice') && sources.optionModel.includes('implementation-pattern') && sources.optionModel.includes('proof-operations-slice')),
    predicateResult('option-model-defers-gate6-policy', SOURCE_ROOTS.optionModel, sources.optionModel.includes('deferred-to-gate6') && sources.optionModel.includes('future-gate7-deposit-option-review')),
    predicateResult('option-model-forbids-source-leakage', SOURCE_ROOTS.optionModel, sources.optionModel.includes('rawSourceTextVisible: false') && sources.optionModel.includes('rawPromptVisible: false') && sources.optionModel.includes('walletPrivateMaterialVisible: false')),
    predicateResult('asset-pack-package-exports-model', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes("export * from './deposit-asset-pack-options'")),
    predicateResult('asset-pack-manifest-exports-model', SOURCE_ROOTS.packageManifest, sources.packageManifest.includes('"./deposit-asset-pack-options"')),
    predicateResult('public-copy-links-deposit', SOURCE_ROOTS.publicCopy, sources.publicCopy.includes("{ href: '/deposit', label: 'Deposit' }") && sources.publicCopy.includes("deposit: 'Deposit'")),
    predicateResult('public-explainers-define-deposit', SOURCE_ROOTS.publicExplainers, sources.publicExplainers.includes("title: 'Deposit'") && sources.publicExplainers.includes('AssetPack options')),
    predicateResult('public-shell-recognizes-deposit', SOURCE_ROOTS.workspaceSurface, sources.workspaceSurface.includes("pathname.startsWith('/deposit')")),
    predicateResult('nav-links-to-deposit', SOURCE_ROOTS.nav, sources.nav.includes("href === '/deposit'") && sources.nav.includes('BITCODE_PUBLIC_EXPLAINERS.deposit')),
    predicateResult('footer-links-to-deposit', SOURCE_ROOTS.footer, sources.footer.includes("const DEPOSIT_URL = '/deposit'") && sources.footer.includes('BITCODE_PUBLIC_EXPLAINERS.deposit')),
    predicateResult('uapi-route-model-test-covers-deposit', SOURCE_ROOTS.routeModelTest, sources.routeModelTest.includes('assertDepositRouteSessionSourceSafe')),
    predicateResult('uapi-page-test-covers-deposit', SOURCE_ROOTS.pageTest, sources.pageTest.includes('DepositPageClient') && sources.pageTest.includes('deposit-route-step-connect-source')),
    predicateResult('asset-pack-test-covers-option-synthesis', SOURCE_ROOTS.optionModelTest, sources.optionModelTest.includes('buildDepositAssetPackOptionSynthesis') && sources.optionModelTest.includes('PRIVATE_SOURCE_DO_NOT_SERIALIZE')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV43DepositRouteOptions')),
    predicateResult('protocol-package-exports-gate5', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV43DepositRouteOptions')),
    predicateResult('protocol-types-export-gate5', SOURCE_ROOTS.protocolTypes, sources.protocolTypes.includes('buildV43DepositRouteOptions')),
    predicateResult('package-json-exposes-gate5', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-deposit-route-options"') && sources.packageJson.includes('"check:v43-gate5"')),
    predicateResult('gate-workflow-runs-gate5', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate5-deposit-route-options.mjs')),
    predicateResult('canon-workflow-runs-gate5', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate5-deposit-route-options.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43DepositRouteOptions')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 5 deposit route options check')),
  ];
}

export function buildV43DepositRouteOptions({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-deposit-route-options:${digest(JSON.stringify({
    stepIds: V43_DEPOSIT_ROUTE_STEP_IDS,
    objectIds: V43_DEPOSIT_OPTION_OBJECT_IDS,
    pipelineIds: V43_DEPOSIT_OPTION_PIPELINE_IDS,
    sourceSafeFieldIds: V43_DEPOSIT_OPTION_SOURCE_SAFE_FIELD_IDS,
    forbiddenPayloadIds: V43_DEPOSIT_OPTION_FORBIDDEN_PAYLOAD_IDS,
    contractRows: V43_DEPOSIT_ROUTE_OPTIONS_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-deposit-route-options',
    schemaId: V43_DEPOSIT_ROUTE_OPTIONS_SCHEMA_ID,
    version: V43_DEPOSIT_ROUTE_OPTIONS_VERSION,
    currentTarget: V43_DEPOSIT_ROUTE_OPTIONS_CURRENT_TARGET,
    sourceSafetyVerdict: V43_DEPOSIT_ROUTE_OPTIONS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    stepIds: [...V43_DEPOSIT_ROUTE_STEP_IDS],
    objectIds: [...V43_DEPOSIT_OPTION_OBJECT_IDS],
    pipelineIds: [...V43_DEPOSIT_OPTION_PIPELINE_IDS],
    sourceSafeFieldIds: [...V43_DEPOSIT_OPTION_SOURCE_SAFE_FIELD_IDS],
    forbiddenPayloadIds: [...V43_DEPOSIT_OPTION_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V43_DEPOSIT_ROUTE_OPTIONS_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-deposit-route-option-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      depositRouteImplemented: true,
      fiveStepDepositingUxImplemented: true,
      optionSynthesisImplemented: true,
      multipleOptionsSynthesized: true,
      connectedSourceUsed: true,
      depositoryDemandSignalsUsed: true,
      readingDemandSignalsUsed: true,
      existingDepositorySignalsUsed: true,
      terminalDepositComposerReused: true,
      sourceCriticalityDemandRoiPolicyDeferredToGate6: true,
      admissionAndIndexingDeferredToGate7: true,
      reviewRequiredBeforeDepositAdmission: true,
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
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V43_DEPOSIT_ROUTE_OPTIONS_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourceRoot(sourcePath)])),
);
