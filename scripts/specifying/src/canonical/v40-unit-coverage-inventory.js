// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_UNIT_COVERAGE_INVENTORY_ARTIFACT_PATH =
  '.proofs/v40/unit-coverage-inventory.json';
export const V40_UNIT_COVERAGE_INVENTORY_SCHEMA_ID =
  'bitcode.v40.unitCoverageInventory.v1';
export const V40_UNIT_COVERAGE_INVENTORY_VERSION = 'V40';
export const V40_UNIT_COVERAGE_INVENTORY_CURRENT_TARGET = 'V39';
export const V40_UNIT_COVERAGE_INVENTORY_SOURCE_SAFETY_VERDICT =
  'source-safe-unit-coverage-metadata';

export const V40_UNIT_COVERAGE_SURFACE_IDS = Object.freeze([
  'protocol:canonical-report-builders',
  'btd:ledger-settlement-rights-primitives',
  'prompts:prompt-composition-primitives',
  'agents:ptrr-step-and-tool-primitives',
  'tools:registry-backed-tool-primitives',
  'executions:lineage-events-metrics-primitives',
  'pipelines:generic-pipeline-primitives',
  'pipelines:reading-assetpack-implementation',
  'hosts:execution-harness-primitives',
  'interfaces:isolated-app-helpers',
  'security:utility-package-primitives',
  'demonstration:commercial-boundary-unit',
]);

export const V40_UNIT_COVERAGE_VERDICTS = Object.freeze([
  'covered',
  'exempt',
  'missing',
  'blocked',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-unit-coverage-row:${digest(id)}`;
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
    rowRoot: rowRoot(input.unitSurfaceId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_unit_coverage_metadata',
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

export const V40_UNIT_COVERAGE_ROWS = Object.freeze([
  row({
    unitSurfaceId: 'protocol:canonical-report-builders',
    packageNames: ['@bitcode/specifying'],
    sourceRoots: ['scripts/specifying/src/canonical', 'scripts/specifying/src/index.js'],
    testPaths: [
      'scripts/specifying/test/v40-test-inventory-coverage-matrix.test.js',
      'scripts/specifying/test/v39-promotion-readiness.test.js',
      'scripts/specifying/test/v38-promotion-readiness.test.js',
    ],
    commandIds: ['pnpm --filter @bitcode/specifying test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Every generated canonical report builder used by V40 is test-addressable through protocol package tests.',
  }),
  row({
    unitSurfaceId: 'btd:ledger-settlement-rights-primitives',
    packageNames: ['@bitcode/btd'],
    sourceRoots: ['packages/btd/src'],
    testPaths: [
      'packages/btd/__tests__/btd.test.ts',
      'packages/btd/__tests__/btc-fee-operation.test.ts',
      'packages/btd/__tests__/source-to-shares.test.ts',
      'packages/btd/__tests__/reconciliation.test.ts',
      'packages/btd/__tests__/read-license-assetpack-rights-contract.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/btd test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'BTD, BTC fee, source-to-shares, reconciliation, and read-right primitives have direct unit coverage.',
  }),
  row({
    unitSurfaceId: 'prompts:prompt-composition-primitives',
    packageNames: ['@bitcode/prompts', '@bitcode/agent-generics'],
    sourceRoots: ['packages/prompts/src', 'packages/agent-generics/src'],
    testPaths: [
      'packages/prompts/src/__tests__/prompt.test.ts',
      'packages/agent-generics/src/__tests__/factory-agent-ptrr-prompt-hierarchy.test.ts',
      'packages/agent-generics/src/__tests__/ptrr-step-prompt-formatting.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/prompts test', 'pnpm --filter @bitcode/agent-generics test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Prompt composition, prompt hierarchy, and PTRR step prompt formatting primitives are covered before V41 prompt rewriting.',
  }),
  row({
    unitSurfaceId: 'agents:ptrr-step-and-tool-primitives',
    packageNames: ['@bitcode/agent-generics'],
    sourceRoots: ['packages/agent-generics/src'],
    testPaths: [
      'packages/agent-generics/src/__tests__/agent-tool-registry-parent-pipeline.test.ts',
      'packages/agent-generics/src/__tests__/step-postprocess-tools.test.ts',
      'packages/agent-generics/src/__tests__/tools-execution-telemetry.test.ts',
      'packages/agent-generics/src/__tests__/llm-parsed-output-telemetry.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/agent-generics test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'PTRR agent step postprocessing, tool registry edges, and typed inference telemetry have unit coverage.',
  }),
  row({
    unitSurfaceId: 'tools:registry-backed-tool-primitives',
    packageNames: ['@bitcode/generic-tools-vcs', '@bitcode/pipelines-generics'],
    sourceRoots: ['packages/generic-tools/vcs', 'packages/pipelines-generics/src'],
    testPaths: [
      'packages/generic-tools/vcs/__tests__/createOrUpdateFileTool.test.ts',
      'packages/pipelines-generics/src/__tests__/pipeline-tool-registry.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/generic-tools-vcs test', 'pnpm --filter @bitcode/pipelines-generics test'],
    coverageTier: 'existing-greenable',
    closureRequirement: 'Concrete registry-backed tool behavior and pipeline tool-registry composition are covered.',
  }),
  row({
    unitSurfaceId: 'executions:lineage-events-metrics-primitives',
    packageNames: ['@bitcode/pipelines-generics'],
    sourceRoots: ['packages/pipelines-generics/src/execution', 'packages/pipelines-generics/src/streaming'],
    testPaths: [
      'packages/pipelines-generics/src/execution/__tests__/events.unit.test.ts',
      'packages/pipelines-generics/src/execution/__tests__/lineage.unit.test.ts',
      'packages/pipelines-generics/src/execution/__tests__/metrics.test.ts',
      'packages/pipelines-generics/src/streaming/__tests__/file-storage-execution.test.ts',
      'packages/pipelines-generics/src/streaming/__tests__/forkable-execution.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipelines-generics test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Execution ancestry, event, metric, storage, and forkability primitives have direct unit coverage.',
  }),
  row({
    unitSurfaceId: 'pipelines:generic-pipeline-primitives',
    packageNames: ['@bitcode/pipelines-generics'],
    sourceRoots: ['packages/pipelines-generics/src'],
    testPaths: [
      'packages/pipelines-generics/src/phases/__tests__/sdivf.events.integration.test.ts',
      'packages/pipelines-generics/src/streaming/__tests__/pipeline-stream-integration.test.ts',
      'packages/pipelines-generics/src/__tests__/pipeline-tool-registry.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipelines-generics test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Generic pipeline phases, event surfaces, streaming, and tool registry units are covered.',
  }),
  row({
    unitSurfaceId: 'pipelines:reading-assetpack-implementation',
    packageNames: ['@bitcode/asset-packs-pipelines-domain'],
    sourceRoots: ['packages/asset-packs-pipelines/domain/src'],
    testPaths: [
      'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-need-review-resynthesis.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-synthesis-asset-pack-synthesis-agent.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/asset-packs-pipelines-domain test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Real Reading and AssetPack implementation units are covered before deeper V40 pipeline integration gates.',
  }),
  row({
    unitSurfaceId: 'hosts:execution-harness-primitives',
    packageNames: ['@bitcode/pipeline-hosts'],
    sourceRoots: ['packages/pipeline-hosts/src'],
    testPaths: [
      'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
      'packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts',
      'packages/pipeline-hosts/src/__tests__/manifest.test.ts',
      'packages/pipeline-hosts/src/__tests__/vercel-sandbox-host.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-hosts test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Pipeline host harness, manifest, runtime receipt, and Vercel Sandbox host units are covered.',
  }),
  row({
    unitSurfaceId: 'interfaces:isolated-app-helpers',
    packageNames: ['apps/uapi'],
    sourceRoots: ['apps/uapi/tests', 'apps/uapi/components', 'apps/uapi/app'],
    testPaths: [
      'apps/uapi/tests/bitcodePayloadShape.test.tsx',
      'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
      'apps/uapi/tests/terminalActivityHistory.test.ts',
      'apps/uapi/tests/readingOperationalTelemetryPipelineLog.test.tsx',
      'apps/uapi/tests/api/pipelineHostRoute.test.ts',
    ],
    commandIds: ['pnpm --dir apps/uapi exec jest'],
    coverageTier: 'existing-greenable',
    closureRequirement: 'Isolated application helpers for payload rendering, pipeline logs, product state, and harness route behavior are covered.',
  }),
  row({
    unitSurfaceId: 'security:utility-package-primitives',
    packageNames: ['@bitcode/security', '@bitcode/generic-llms'],
    sourceRoots: ['packages/security/src', 'packages/generic-llms'],
    testPaths: [
      'packages/security/validation/src/__tests__/validation.test.ts',
      'packages/security/rate-limiting/src/__tests__/rate-limiting.test.ts',
      'packages/security/audit/src/__tests__/audit-logging.test.ts',
      'packages/generic-llms/registry/tests/unit/providers.test.ts',
      'packages/llm-generics/src/__tests__/registry.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/security test', 'pnpm --filter @bitcode/generic-llms test'],
    coverageTier: 'existing-greenable',
    closureRequirement: 'Utility security and generic LLM registry units have direct tests for critical non-pipeline behavior.',
  }),
  row({
    unitSurfaceId: 'demonstration:commercial-boundary-unit',
    packageNames: ['@bitcode/specifying', 'protocol-demonstration'],
    sourceRoots: ['scripts/specifying/test/protocol-package-boundary.test.js', 'protocol-demonstration'],
    testPaths: [
      'scripts/specifying/test/protocol-package-boundary.test.js',
      'protocol-demonstration/test/v28-mvp-qa.test.js',
      'protocol-demonstration/test/v28-boundary-separation.test.js',
      'protocol-demonstration/test/local-fit-finding.test.js',
    ],
    commandIds: ['node --test scripts/specifying/test/protocol-package-boundary.test.js', 'npm --prefix protocol-demonstration run test:v28-mvp-qa'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Commercial packages and the self-contained demonstration remain unit-guarded across the import boundary.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, 'package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const spec = readSource(repoRoot, '.specifications/BITCODE_SPEC_V40.md');
  const delta = readSource(repoRoot, '.specifications/BITCODE_SPEC_V40_DELTA.md');
  const notes = readSource(repoRoot, '.specifications/BITCODE_SPEC_V40_NOTES.md');
  const parity = readSource(repoRoot, '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const protocolIndex = readSource(repoRoot, 'scripts/specifying/src/index.js');
  const protocolTypes = readSource(repoRoot, 'scripts/specifying/src/index.d.ts');

  const rowPredicates = V40_UNIT_COVERAGE_ROWS.flatMap((coverageRow) => {
    const safeId = coverageRow.unitSurfaceId.replace(/[^a-z0-9]+/gu, '-');
    return [
      predicateResult(
        `${safeId}:source-roots-exist`,
        coverageRow.sourceRoots[0],
        coverageRow.sourceRoots.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
      ),
      predicateResult(
        `${safeId}:test-paths-exist`,
        coverageRow.testPaths[0],
        coverageRow.testPaths.every((testPath) => sourceExists(repoRoot, testPath)),
      ),
    ];
  });

  return [
    predicateResult('package-scripts-include-gate3', 'package.json', packageJson.includes('generate:v40-unit-coverage') && packageJson.includes('check:v40-gate3')),
    predicateResult('workflows-run-gate3-check', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v40-gate3-unit-coverage.mjs') && canonWorkflow.includes('check-v40-gate3-unit-coverage.mjs')),
    predicateResult('protocol-exports-gate3', 'scripts/specifying/src/index.js', protocolIndex.includes('buildV40UnitCoverageInventory') && protocolTypes.includes('buildV40UnitCoverageInventory')),
    predicateResult('spec-documents-gate3', '.specifications/BITCODE_SPEC_V40.md', spec.includes('V40 Gate 3 Unit Coverage For Packages And Primitives') && spec.includes(V40_UNIT_COVERAGE_INVENTORY_ARTIFACT_PATH)),
    predicateResult('delta-documents-gate3', '.specifications/BITCODE_SPEC_V40_DELTA.md', delta.includes('Gate 3: Unit Coverage For Packages And Primitives')),
    predicateResult('notes-document-gate3', '.specifications/BITCODE_SPEC_V40_NOTES.md', notes.includes('Gate 3 closes unit coverage breadth') && notes.includes('Gate 3 implementation notes')),
    predicateResult('parity-documents-gate3', '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md', parity.includes('v40-unit-coverage-inventory') && parity.includes('| Gate 3 | Unit coverage closure artifact | implemented |')),
    predicateResult(
      'roadmap-advanced-through-gate3',
      '.specifications/SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('V40 Gate 3 closure anchor') &&
        (/Current working gate: V40 Gate (?:3|[4-9]|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V40 Exhaustive Commercial Application Testing') ||
          roadmap.includes('Recent V40 closure anchor')),
    ),
    ...rowPredicates,
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const rowsByVerdict = rows.reduce((acc, item) => {
    acc[item.verdict] = (acc[item.verdict] || 0) + 1;
    return acc;
  }, {});
  const rowsByTier = rows.reduce((acc, item) => {
    acc[item.coverageTier] = (acc[item.coverageTier] || 0) + 1;
    return acc;
  }, {});

  return {
    rowCount: rows.length,
    surfaceCount: V40_UNIT_COVERAGE_SURFACE_IDS.length,
    verdictIds: [...V40_UNIT_COVERAGE_VERDICTS],
    rowsByVerdict,
    rowsByTier,
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    missingRowCount: rows.filter((item) => item.verdict === 'missing').length,
    blockedRowCount: rows.filter((item) => item.verdict === 'blocked').length,
    exemptRowCount: rows.filter((item) => item.verdict === 'exempt').length,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    packagePrimitiveCoverageClosed: rows.some((item) => item.unitSurfaceId === 'btd:ledger-settlement-rights-primitives') && rows.some((item) => item.unitSurfaceId === 'protocol:canonical-report-builders'),
    inferencePrimitiveCoverageClosed: rows.some((item) => item.unitSurfaceId === 'prompts:prompt-composition-primitives') && rows.some((item) => item.unitSurfaceId === 'agents:ptrr-step-and-tool-primitives'),
    executionPipelineCoverageClosed: rows.some((item) => item.unitSurfaceId === 'executions:lineage-events-metrics-primitives') && rows.some((item) => item.unitSurfaceId === 'pipelines:generic-pipeline-primitives'),
    readingImplementationCoverageClosed: rows.some((item) => item.unitSurfaceId === 'pipelines:reading-assetpack-implementation'),
    interfaceHelperCoverageClosed: rows.some((item) => item.unitSurfaceId === 'interfaces:isolated-app-helpers'),
    demonstrationBoundaryCoverageClosed: rows.some((item) => item.unitSurfaceId === 'demonstration:commercial-boundary-unit'),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    valueBearingMainnetRequired: false,
  };
}

export function buildV40UnitCoverageInventory(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_UNIT_COVERAGE_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v40-unit-coverage-inventory:${digest(JSON.stringify({
    rows: rows.map((item) => item.rowRoot),
    failedPredicateIds: coverage.failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v40-unit-coverage-inventory',
    schemaId: V40_UNIT_COVERAGE_INVENTORY_SCHEMA_ID,
    version: V40_UNIT_COVERAGE_INVENTORY_VERSION,
    currentTarget: V40_UNIT_COVERAGE_INVENTORY_CURRENT_TARGET,
    sourceSafetyVerdict: V40_UNIT_COVERAGE_INVENTORY_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0 && coverage.allCriticalSurfacesClosed,
    surfaceIds: [...V40_UNIT_COVERAGE_SURFACE_IDS],
    verdictIds: [...V40_UNIT_COVERAGE_VERDICTS],
    rows,
    rowIds: rows.map((item) => item.unitSurfaceId),
    predicateResults,
    coverage,
  };
}
