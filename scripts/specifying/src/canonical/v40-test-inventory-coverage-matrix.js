// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_TEST_INVENTORY_COVERAGE_MATRIX_ARTIFACT_PATH =
  '.bitcode/v40-test-inventory-coverage-matrix.json';
export const V40_TEST_INVENTORY_COVERAGE_MATRIX_SCHEMA_ID =
  'bitcode.v40.testInventoryCoverageMatrix.v1';
export const V40_TEST_INVENTORY_COVERAGE_MATRIX_VERSION = 'V40';
export const V40_TEST_INVENTORY_COVERAGE_MATRIX_CURRENT_TARGET = 'V39';
export const V40_TEST_INVENTORY_COVERAGE_MATRIX_SOURCE_SAFETY_VERDICT =
  'source-safe-test-inventory-coverage-metadata';

export const V40_TEST_INVENTORY_SURFACE_IDS = Object.freeze([
  'unit:packages-primitives-implementations',
  'integration:api-route-interface-contracts',
  'integration:reading-pipeline-implementations',
  'integration:conversation-terminal-surfaces',
  'browser:visual-accessibility-responsive',
  'sync:ledger-database-storage-wallet-delivery',
  'rehearsal:local-staging-testnet',
  'benchmark:prompt-promptpart-smoke',
  'demonstration:minimal-protocol-parity',
  'ci:gate-canon-promotion-quality',
]);

export const V40_TEST_INVENTORY_COVERAGE_TIERS = Object.freeze([
  'existing-greenable',
  'needs-new-v40-artifact',
  'opt-in-lane',
  'promotion-required',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

const SOURCE_ROOTS = Object.freeze({
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  mainCiWorkflow: '.github/workflows/ci.yml',
  v40Spec: '.specifications/BITCODE_SPEC_V40.md',
  v40Delta: '.specifications/BITCODE_SPEC_V40_DELTA.md',
  v40Notes: '.specifications/BITCODE_SPEC_V40_NOTES.md',
  v40Parity: '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolBoundaryTest: 'scripts/specifying/test/protocol-package-boundary.test.js',
  btdTests: 'packages/btd/__tests__',
  assetPackTests: 'packages/asset-packs-pipelines/domain/src/__tests__',
  apiTests: 'packages/api/src/routes/__tests__',
  uapiTests: 'apps/uapi/tests',
  conversationTests: 'apps/uapi/tests',
  pipelineTests: 'packages/asset-packs-pipelines/domain/src/__tests__',
  pipelineHostsTests: 'packages/pipeline-hosts/src/__tests__',
  protocolTests: 'scripts/specifying/test',
  demonstrationReadme: 'protocol-demonstration/README.md',
  demonstrationPackage: 'protocol-demonstration/package.json',
  promptBenchmarkReport: 'scripts/specifying/src/canonical/prompt-benchmark-report.js',
  v38PromptBenchmarkTest: 'scripts/specifying/test/v38-prompt-benchmark-report.test.js',
  readNeedHardeningTest: 'scripts/specifying/test/v38-read-need-comprehension-inference-hardening.test.js',
  readFitsSearchTest: 'scripts/specifying/test/v38-read-fits-finding-search-embeddings.test.js',
  v39ReadingUxTest: 'scripts/specifying/test/v39-enterprise-reading-ux-state.test.js',
  v39ReadNeedTest: 'scripts/specifying/test/v39-read-need-review-resynthesis.test.js',
  v39ReadFitsTest: 'scripts/specifying/test/v39-read-fits-finding-runtime.test.js',
  v39PreviewTest: 'scripts/specifying/test/v39-assetpack-preview-quote-boundary.test.js',
  v39SettlementTest: 'scripts/specifying/test/v39-settlement-rights-delivery.test.js',
  v39TelemetryTest: 'scripts/specifying/test/v39-operational-telemetry-repair-readback.test.js',
  v39LocalStagingTest: 'scripts/specifying/test/v39-local-staging-reading-rehearsal.test.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-test-inventory-coverage-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.surfaceId),
    sourceSafetyClass: 'source_safe_test_inventory_coverage_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_TEST_INVENTORY_COVERAGE_ROWS = Object.freeze([
  row({
    surfaceId: 'unit:packages-primitives-implementations',
    gateOwner: 'V40 Gate 3',
    requiredResult:
      'Inventory package, primitive, isolated implementation, and real commercial implementation unit suites before closing V40 unit depth.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.btdTests, SOURCE_ROOTS.assetPackTests, SOURCE_ROOTS.protocolTests],
    commandIds: ['pnpm --filter @bitcode/btd test', 'pnpm --filter @bitcode/asset-packs-pipelines-domain test', 'pnpm --filter @bitcode/specifying test'],
    generatedArtifactPath: '.bitcode/v40-unit-coverage-inventory.json',
    missingCoverageClosesInGate: 3,
  }),
  row({
    surfaceId: 'integration:api-route-interface-contracts',
    gateOwner: 'V40 Gate 4',
    requiredResult:
      'Inventory UAPI, package API, public API, MCP API, ChatGPT App, persistence, authorization, and response schema contract suites.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.apiTests, SOURCE_ROOTS.uapiTests, 'apps/mcp/src/__tests__', 'apps/chatgpt/src/__tests__'],
    commandIds: ['pnpm --dir apps/uapi exec jest', 'pnpm --filter @bitcode/api exec jest', 'pnpm --dir apps/mcp run test:mcp', 'pnpm --dir packages/chatgptapp exec jest'],
    generatedArtifactPath: '.bitcode/v40-api-integration-contracts.json',
    missingCoverageClosesInGate: 4,
  }),
  row({
    surfaceId: 'integration:reading-pipeline-implementations',
    gateOwner: 'V40 Gate 5',
    requiredResult:
      'Inventory primitive pipeline tests and real ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis implementation tests.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.pipelineTests, SOURCE_ROOTS.readNeedHardeningTest, SOURCE_ROOTS.readFitsSearchTest],
    commandIds: ['pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest', 'pnpm --dir scripts/specifying exec node --test'],
    generatedArtifactPath: '.bitcode/v40-pipeline-integration-coverage.json',
    missingCoverageClosesInGate: 5,
  }),
  row({
    surfaceId: 'integration:conversation-terminal-surfaces',
    gateOwner: 'V40 Gate 6',
    requiredResult:
      'Inventory Conversation, product, handoff, stream telemetry, source-safe disclosure, and rich execution log integration suites.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.conversationTests, SOURCE_ROOTS.uapiTests],
    commandIds: ['pnpm --dir apps/uapi exec jest'],
    generatedArtifactPath: '.bitcode/v40-conversation-terminal-integration.json',
    missingCoverageClosesInGate: 6,
  }),
  row({
    surfaceId: 'browser:visual-accessibility-responsive',
    gateOwner: 'V40 Gate 7',
    requiredResult:
      'Inventory Playwright, browser, screenshot comparison, accessibility, responsive, and interaction-state proofs across product surfaces.',
    coverageTier: 'opt-in-lane',
    sourceRoots: [SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.uapiTests],
    commandIds: ['pnpm --dir apps/uapi run test:e2e:terminal-ux', 'pnpm --dir apps/uapi run test:e2e:v32-browser-proof'],
    generatedArtifactPath: '.bitcode/v40-browser-e2e-visual-proof.json',
    missingCoverageClosesInGate: 7,
  }),
  row({
    surfaceId: 'sync:ledger-database-storage-wallet-delivery',
    gateOwner: 'V40 Gate 8',
    requiredResult:
      'Inventory settlement, BTC fee, BTD rights transfer, ledger, database, object storage, wallet, PR delivery, and repair synchronization tests.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.v39PreviewTest, SOURCE_ROOTS.v39SettlementTest, SOURCE_ROOTS.v39TelemetryTest],
    commandIds: ['pnpm --filter @bitcode/btd exec jest', 'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest', 'pnpm --dir scripts/specifying exec node --test'],
    generatedArtifactPath: '.bitcode/v40-ledger-storage-sync.json',
    missingCoverageClosesInGate: 8,
  }),
  row({
    surfaceId: 'rehearsal:local-staging-testnet',
    gateOwner: 'V40 Gate 9',
    requiredResult:
      'Inventory local and staging-testnet rehearsals with lane-bound secrets, source-safe receipts, and blocked value-bearing mainnet posture.',
    coverageTier: 'opt-in-lane',
    sourceRoots: [SOURCE_ROOTS.v39LocalStagingTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    commandIds: ['pnpm run check:v39-gate10', 'future pnpm run check:v40-rehearsal'],
    generatedArtifactPath: '.bitcode/v40-local-staging-rehearsal.json',
    missingCoverageClosesInGate: 9,
  }),
  row({
    surfaceId: 'benchmark:prompt-promptpart-smoke',
    gateOwner: 'V40 Gate 10',
    requiredResult:
      'Inventory prompt and PromptPart benchmark smoke commands and fixture roots so V41 can safely rewrite prompts as programs.',
    coverageTier: 'needs-new-v40-artifact',
    sourceRoots: [SOURCE_ROOTS.promptBenchmarkReport, SOURCE_ROOTS.v38PromptBenchmarkTest],
    commandIds: ['future pnpm run check:v40-prompt-benchmark-smoke', 'pnpm --dir scripts/specifying exec node --test test/v38-prompt-benchmark-report.test.js'],
    generatedArtifactPath: '.bitcode/v40-prompt-benchmark-smoke.json',
    missingCoverageClosesInGate: 10,
  }),
  row({
    surfaceId: 'demonstration:minimal-protocol-parity',
    gateOwner: 'V40 Gate 7',
    requiredResult:
      'Inventory the self-contained demonstration MVP tests without importing demonstration source into commercial packages.',
    coverageTier: 'existing-greenable',
    sourceRoots: [SOURCE_ROOTS.demonstrationReadme, SOURCE_ROOTS.demonstrationPackage, SOURCE_ROOTS.protocolBoundaryTest],
    commandIds: ['npm --prefix protocol-demonstration run test:v28-mvp-qa', 'node --test scripts/specifying/test/protocol-package-boundary.test.js'],
    generatedArtifactPath: '.bitcode/v40-demonstration-test-parity.json',
    missingCoverageClosesInGate: 7,
  }),
  row({
    surfaceId: 'ci:gate-canon-promotion-quality',
    gateOwner: 'V40 Gate 11',
    requiredResult:
      'Inventory gate, canon, lint, build, mock, browser, local/staging, proof generation, and promotion workflows that must be greenable before canon promotion.',
    coverageTier: 'promotion-required',
    sourceRoots: [SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow, SOURCE_ROOTS.mainCiWorkflow],
    commandIds: ['pnpm run check:v40-gate1', 'pnpm run check:v40-gate2', 'future V40 promotion workflow'],
    generatedArtifactPath: '.bitcode/v40-promotion-readiness-report.json',
    missingCoverageClosesInGate: 11,
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v40Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v40Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v40Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v40Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const protocolIndex = readSource(repoRoot, SOURCE_ROOTS.protocolIndex);
  const protocolTypes = readSource(repoRoot, SOURCE_ROOTS.protocolTypes);

  return [
    predicateResult('v40-spec-names-test-inventory', SOURCE_ROOTS.v40Spec, spec.includes('Test Inventory And Coverage Matrix') && spec.includes('.bitcode/v40-test-inventory-coverage-matrix.json')),
    predicateResult('v40-delta-names-gate2', SOURCE_ROOTS.v40Delta, delta.includes('Gate 2: Test Inventory And Coverage Matrix')),
    predicateResult('v40-notes-names-test-inventory', SOURCE_ROOTS.v40Notes, notes.includes('Gate 2 inventories the whole test surface')),
    predicateResult('v40-parity-names-gate2-artifact', SOURCE_ROOTS.v40Parity, parity.includes('Gate 2') && parity.includes('v40-test-inventory-coverage-matrix')),
    predicateResult(
      'roadmap-advanced-through-gate2',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V40 Gate 2 closure anchor') &&
        (/Current working gate: V40 Gate (?:2|3|4|5|6|7|8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V40 Exhaustive Commercial Application Testing') ||
          roadmap.includes('Recent V40 closure anchor')),
    ),
    predicateResult('readmes-document-gate2', SOURCE_ROOTS.rootReadme, rootReadme.includes('V40 Gate 2') && protocolReadme.includes('V40TestInventoryCoverageMatrix')),
    predicateResult('package-scripts-include-gate2', SOURCE_ROOTS.packageJson, packageJson.includes('generate:v40-test-inventory') && packageJson.includes('check:v40-gate2')),
    predicateResult('workflows-run-gate2-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v40-gate2-test-inventory-coverage-matrix.mjs') && canonWorkflow.includes('check-v40-gate2-test-inventory-coverage-matrix.mjs')),
    predicateResult('protocol-exports-gate2', SOURCE_ROOTS.protocolIndex, protocolIndex.includes('buildV40TestInventoryCoverageMatrix') && protocolTypes.includes('buildV40TestInventoryCoverageMatrix')),
    predicateResult('unit-sources-exist', SOURCE_ROOTS.btdTests, sourceExists(repoRoot, SOURCE_ROOTS.btdTests) && sourceExists(repoRoot, SOURCE_ROOTS.assetPackTests) && sourceExists(repoRoot, SOURCE_ROOTS.protocolTests)),
    predicateResult('api-uapi-sources-exist', SOURCE_ROOTS.uapiTests, sourceExists(repoRoot, SOURCE_ROOTS.uapiTests) && sourceExists(repoRoot, SOURCE_ROOTS.apiTests)),
    predicateResult('reading-pipeline-evidence-exists', SOURCE_ROOTS.pipelineTests, sourceExists(repoRoot, SOURCE_ROOTS.readNeedHardeningTest) && sourceExists(repoRoot, SOURCE_ROOTS.readFitsSearchTest) && sourceExists(repoRoot, SOURCE_ROOTS.v39ReadNeedTest) && sourceExists(repoRoot, SOURCE_ROOTS.v39ReadFitsTest)),
    predicateResult('conversation-terminal-evidence-exists', SOURCE_ROOTS.uapiTests, readSource(repoRoot, 'apps/uapi/tests/conversationStreamPipelineLog.test.tsx').includes('PipelineExecutionLog') && readSource(repoRoot, 'apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts').includes('product')),
    predicateResult('browser-proof-workflow-lane-exists', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('BITCODE_ENABLE_GATE_BROWSER_PROOF') && gateWorkflow.includes('test:e2e:terminal-ux')),
    predicateResult('settlement-sync-tests-exist', SOURCE_ROOTS.v39SettlementTest, sourceExists(repoRoot, SOURCE_ROOTS.v39PreviewTest) && sourceExists(repoRoot, SOURCE_ROOTS.v39SettlementTest) && sourceExists(repoRoot, SOURCE_ROOTS.v39TelemetryTest)),
    predicateResult('local-staging-rehearsal-exists', SOURCE_ROOTS.v39LocalStagingTest, sourceExists(repoRoot, SOURCE_ROOTS.v39LocalStagingTest)),
    predicateResult('prompt-benchmark-smoke-basis-exists', SOURCE_ROOTS.promptBenchmarkReport, sourceExists(repoRoot, SOURCE_ROOTS.promptBenchmarkReport) && sourceExists(repoRoot, SOURCE_ROOTS.v38PromptBenchmarkTest)),
    predicateResult('demonstration-boundary-test-exists', SOURCE_ROOTS.protocolBoundaryTest, sourceExists(repoRoot, SOURCE_ROOTS.demonstrationReadme) && sourceExists(repoRoot, SOURCE_ROOTS.demonstrationPackage) && readSource(repoRoot, SOURCE_ROOTS.protocolBoundaryTest).includes('does not import the standalone protocol demonstration')),
    predicateResult('promotion-ci-basis-exists', SOURCE_ROOTS.canonWorkflow, gateWorkflow.includes('Gate Quality') && canonWorkflow.includes('Bitcode Canon Quality')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const rowsByTier = rows.reduce((acc, item) => {
    acc[item.coverageTier] = (acc[item.coverageTier] || 0) + 1;
    return acc;
  }, {});

  return {
    rowCount: rows.length,
    surfaceCount: V40_TEST_INVENTORY_SURFACE_IDS.length,
    coverageTierIds: [...V40_TEST_INVENTORY_COVERAGE_TIERS],
    rowsByTier,
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    unitInventoryCovered: predicateResults.some((predicate) => predicate.id === 'unit-sources-exist' && predicate.passed),
    apiIntegrationInventoryCovered: predicateResults.some((predicate) => predicate.id === 'api-uapi-sources-exist' && predicate.passed),
    readingPipelineInventoryCovered: predicateResults.some((predicate) => predicate.id === 'reading-pipeline-evidence-exists' && predicate.passed),
    conversationTerminalInventoryCovered: predicateResults.some((predicate) => predicate.id === 'conversation-terminal-evidence-exists' && predicate.passed),
    browserVisualInventoryCovered: predicateResults.some((predicate) => predicate.id === 'browser-proof-workflow-lane-exists' && predicate.passed),
    synchronizationInventoryCovered: predicateResults.some((predicate) => predicate.id === 'settlement-sync-tests-exist' && predicate.passed),
    localStagingInventoryCovered: predicateResults.some((predicate) => predicate.id === 'local-staging-rehearsal-exists' && predicate.passed),
    promptBenchmarkInventoryCovered: predicateResults.some((predicate) => predicate.id === 'prompt-benchmark-smoke-basis-exists' && predicate.passed),
    demonstrationInventoryCovered: predicateResults.some((predicate) => predicate.id === 'demonstration-boundary-test-exists' && predicate.passed),
    workflowInventoryCovered: predicateResults.some((predicate) => predicate.id === 'promotion-ci-basis-exists' && predicate.passed),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    valueBearingMainnetRequired: false,
    v41PromptProgramBoundaryPreserved: true,
  };
}

export function buildV40TestInventoryCoverageMatrix(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_TEST_INVENTORY_COVERAGE_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const rowRoots = rows.map((item) => item.rowRoot);
  const artifactRoot = `v40-test-inventory-coverage-matrix:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds: coverage.failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v40-test-inventory-coverage-matrix',
    schemaId: V40_TEST_INVENTORY_COVERAGE_MATRIX_SCHEMA_ID,
    version: V40_TEST_INVENTORY_COVERAGE_MATRIX_VERSION,
    currentTarget: V40_TEST_INVENTORY_COVERAGE_MATRIX_CURRENT_TARGET,
    sourceSafetyVerdict: V40_TEST_INVENTORY_COVERAGE_MATRIX_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0,
    surfaceIds: [...V40_TEST_INVENTORY_SURFACE_IDS],
    coverageTierIds: [...V40_TEST_INVENTORY_COVERAGE_TIERS],
    rows,
    rowIds: rows.map((item) => item.surfaceId),
    predicateResults,
    coverage,
  };
}
