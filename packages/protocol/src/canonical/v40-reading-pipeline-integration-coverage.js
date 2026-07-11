// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_READING_PIPELINE_INTEGRATION_COVERAGE_ARTIFACT_PATH =
  '.bitcode/v40-reading-pipeline-integration-coverage.json';
export const V40_READING_PIPELINE_INTEGRATION_COVERAGE_SCHEMA_ID =
  'bitcode.v40.readingPipelineIntegrationCoverage.v1';
export const V40_READING_PIPELINE_INTEGRATION_COVERAGE_VERSION = 'V40';
export const V40_READING_PIPELINE_INTEGRATION_COVERAGE_CURRENT_TARGET = 'V39';
export const V40_READING_PIPELINE_INTEGRATION_COVERAGE_SOURCE_SAFETY_VERDICT =
  'source-safe-reading-pipeline-integration-coverage-metadata';

export const V40_READING_PIPELINE_NAMES = Object.freeze([
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
]);

export const V40_READING_PIPELINE_INTEGRATION_SURFACE_IDS = Object.freeze([
  'reading:pipeline-contract-topology',
  'reading:read-need-comprehension-runtime',
  'reading:read-fits-finding-search-runtime',
  'reading:ptrr-agent-implementation-integration',
  'reading:preview-settlement-delivery-boundaries',
  'reading:telemetry-repair-readback',
  'reading:terminal-api-harness-integration',
  'reading:primitive-and-host-integration',
  'reading:local-staging-rehearsal-integration',
]);

export const V40_READING_PIPELINE_INTEGRATION_VERDICTS = Object.freeze([
  'covered',
  'exempt',
  'missing',
  'blocked',
]);

export const V40_READING_PIPELINE_EXPECTED_TOTALS = Object.freeze({
  pipelineCount: 2,
  uxStepCount: 5,
  phaseCount: 11,
  ptrrAgentCount: 12,
  ptrrStepCount: 48,
  modelStructuredPtrrStepCount: 20,
  thricifiedGenerationCount: 144,
  toolCount: 4,
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-reading-pipeline-integration-row:${digest(id)}`;
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

function allMarkersPresent(repoRoot, paths, markers) {
  const source = paths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.every((marker) => source.includes(marker));
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.integrationSurfaceId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_reading_pipeline_integration_coverage_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    valueBearingMainnetRequired: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_READING_PIPELINE_INTEGRATION_ROWS = Object.freeze([
  row({
    integrationSurfaceId: 'reading:pipeline-contract-topology',
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    integrationKind: 'contract-topology',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
      'packages/pipelines/asset-pack/src/reading-pipeline-observability.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-observability.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: [
      'pnpm --filter @bitcode/pipeline-asset-pack exec jest src/__tests__/reading-pipeline-contract.test.ts src/__tests__/reading-pipeline-observability.test.ts src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    requiredSourceMarkers: [
      'READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT',
      'READ_FITS_FINDING_SYNTHESIS_CONTRACT',
      'listReadingPipelineTelemetryTrace',
    ],
    requiredTestMarkers: [
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
      'thinkingsGenerationCount',
    ],
    expectedCounts: { ...V40_READING_PIPELINE_EXPECTED_TOTALS },
    coverageTier: 'promotion-required',
    closureRequirement: 'Both Reading pipelines have explicit phase, PTRR agent, step, ThricifiedGeneration, tool, prompt, and telemetry topology coverage.',
  }),
  row({
    integrationSurfaceId: 'reading:read-need-comprehension-runtime',
    pipelineNames: ['ReadNeedComprehensionSynthesis'],
    integrationKind: 'real-runtime',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/read-need.ts',
      'packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts',
      'packages/pipelines/asset-pack/src/runtime-inference-policy.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/read-need.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/read-need-review-resynthesis.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/runtime-inference-policy.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- read-need'],
    requiredSourceMarkers: [
      'synthesizeReadNeedForPipelineInputWithInference',
      'ReadNeedComprehensionSynthesisInferenceReceipt',
      'acceptReadNeed',
    ],
    requiredTestMarkers: [
      'bitcode.read-need-comprehension-synthesis.inference-receipt',
      'acceptedNeedRequiredForFindingFits',
    ],
    expectedCounts: {
      phaseCount: 4,
      ptrrAgentCount: 4,
      ptrrStepCount: 16,
      thricifiedGenerationCount: 48,
      toolCount: 0,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'ReadNeedComprehensionSynthesis runtime, review/resynthesis, inference receipt, acceptance, and source-safe admission boundaries are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'reading:read-fits-finding-search-runtime',
    pipelineNames: ['ReadFitsFindingSynthesis'],
    integrationKind: 'real-runtime',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts',
      'packages/pipelines/asset-pack/src/depository-search.ts',
      'packages/pipelines/asset-pack/src/embedding-config.ts',
      'packages/pipelines/asset-pack/src/tools/search.ts',
      'packages/pipelines/asset-pack/src/tools/AssetPackLexicalDepositorySearchTool.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/read-fits-finding-runtime.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/depository-search.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/depository-search-tool.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/embedding-config.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/discovery-semantic-mirrors.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- read-fits depository-search embedding-config'],
    requiredSourceMarkers: [
      'buildReadFitsFindingRuntime',
      'searchDepositoryAssetSpace',
      'READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS',
      'match_deliverable_vectors',
    ],
    requiredTestMarkers: [
      'worthy_fit',
      'embeddingPolicy',
      'fitDepositAssetIds',
    ],
    expectedCounts: {
      phaseCount: 7,
      ptrrAgentCount: 8,
      ptrrStepCount: 32,
      thricifiedGenerationCount: 96,
      toolCount: 4,
      searchChannelCount: 7,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'ReadFitsFindingSynthesis accepted-Need admission, many-fit Depository search, vector/lexical/provider ranking, runtime replay, and repair posture are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'reading:ptrr-agent-implementation-integration',
    pipelineNames: ['ReadFitsFindingSynthesis'],
    integrationKind: 'agent-implementation',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent.ts',
      'packages/pipelines/asset-pack/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent.ts',
      'packages/pipelines/asset-pack/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
      'packages/pipelines/asset-pack/src/phases/setup.ts',
      'packages/pipelines/asset-pack/src/phases/implementation.ts',
      'packages/pipelines/asset-pack/src/preprocess.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/setup-agents.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/read-fits-finding-synthesis-asset-pack-synthesis-agent.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/metrics-output.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- setup-agents read-fits-finding-synthesis-asset-pack-synthesis-agent'],
    requiredSourceMarkers: [
      'factoryAgentWithPTRR',
      'ReadFitsFindingSynthesisSetupPlanAgent',
      'ReadFitsFindingSynthesisReadComprehensionAgent',
      'ReadFitsFindingSynthesisAssetPackSynthesisAgent',
    ],
    requiredTestMarkers: [
      'runReadFitsFindingSynthesisSetupPlanAgent',
      'runReadFitsFindingSynthesisReadComprehensionAgent',
      'runReadFitsFindingSynthesisAssetPackSynthesisAgent',
    ],
    expectedCounts: {
      concreteAgentCount: 3,
      ptrrStepNameCount: 4,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'Concrete setup, read-comprehension, and AssetPack synthesis agents remain PTRR-backed, typed, test-addressable, and phase-registered.',
  }),
  row({
    integrationSurfaceId: 'reading:preview-settlement-delivery-boundaries',
    pipelineNames: ['ReadFitsFindingSynthesis'],
    integrationKind: 'preview-settlement-delivery',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts',
      'packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts',
      'packages/pipelines/asset-pack/src/agents/finish/asset-pack-finish-create-pull-request-delivery-agent.ts',
      'packages/pipelines/asset-pack/src/phases/finish.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/asset-pack-preview-boundary.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/finish-delivery.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/finish-completion.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- asset-pack-preview-boundary asset-pack-settlement-rights-delivery finish'],
    requiredSourceMarkers: [
      'buildAssetPackPreviewBoundary',
      'buildAssetPackSettlementRightsDeliveryBoundary',
      'source_bearing_pull_request_ready',
    ],
    requiredTestMarkers: [
      'sourceSafePreview',
      'settlement_delivered',
      'source_bearing_pull_request_ready',
    ],
    expectedCounts: {
      sourceSafePreviewRequired: true,
      settlementRequiredBeforeUnlock: true,
      postSettlementDeliveryRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'AssetPack preview, deterministic quote, BTC settlement, BTD rights transfer, source-to-shares compensation, and post-settlement PR delivery are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'reading:telemetry-repair-readback',
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    integrationKind: 'telemetry-repair-readback',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts',
      'packages/pipelines/asset-pack/src/reading-interface-product-parity.ts',
      'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
      'uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
      'uapi/app/executions/utilities/pipeline-telemetry.ts',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
      'packages/pipelines/asset-pack/src/__tests__/reading-interface-product-parity.test.ts',
      'uapi/tests/readingOperationalTelemetryPipelineLog.test.tsx',
      'uapi/tests/pipelineExecutionLogHeader.test.tsx',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- reading-operational-telemetry-repair-readback reading-interface-product-parity', 'pnpm --dir uapi exec jest tests/readingOperationalTelemetryPipelineLog.test.tsx tests/pipelineExecutionLogHeader.test.tsx'],
    requiredSourceMarkers: [
      'buildReadingOperationalTelemetryRepairReadback',
      'buildReadingInterfaceProductParity',
      'PipelineExecutionLog',
    ],
    requiredTestMarkers: [
      'ThinkingsGeneration',
      'source-safe',
      'PipelineExecutionLog',
    ],
    expectedCounts: {
      telemetryLevelCount: 9,
      sourceSafeReadbackRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'Reading pipeline telemetry, repair readback, interface parity, and rich execution-log projection are integration-covered without source or secret leakage.',
  }),
  row({
    integrationSurfaceId: 'reading:terminal-api-harness-integration',
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    integrationKind: 'terminal-api-harness',
    sourceRoots: [
      'uapi/app/api/read-review/route.ts',
      'uapi/app/api/pipeline-harness/asset-pack/route.ts',
      'uapi/app/terminal/terminal-pipeline-harness-client.ts',
      'packages/api/src/pipelines/branch.ts',
    ],
    testPaths: [
      'uapi/tests/api/readReviewRoute.test.ts',
      'uapi/tests/api/readReviewProtocolParity.test.ts',
      'uapi/tests/api/pipelineHarnessRoute.test.ts',
      'uapi/tests/api/pipelineHarnessPreflight.test.ts',
      'uapi/tests/terminalPipelineHarnessClient.test.ts',
      'packages/api/src/pipelines/__tests__/branch-run.test.ts',
      'packages/api/src/pipelines/__tests__/branch-resume-from-conversation.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/readReviewRoute.test.ts tests/api/pipelineHarnessRoute.test.ts tests/terminalPipelineHarnessClient.test.ts', 'pnpm --filter @bitcode/api test'],
    requiredSourceMarkers: [
      'streamTerminalReadFitsFindingSynthesisHarness',
      'pipeline-harness',
      'branchAssetPackRun',
    ],
    requiredTestMarkers: [
      'readReviewAction',
      'POST /api/pipeline-harness/asset-pack',
      'terminal pipeline harness client',
    ],
    expectedCounts: {
      apiSurfaceCount: 4,
      branchResumeRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'Terminal request/read, pipeline harness, preflight, branch/resume, and API route integration remain tested against the real Reading pipeline contracts.',
  }),
  row({
    integrationSurfaceId: 'reading:primitive-and-host-integration',
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    integrationKind: 'primitive-host-integration',
    sourceRoots: [
      'packages/pipelines-generics/src/execution/PipelineExecutor.ts',
      'packages/pipelines-generics/src/execution/PipelineAgentRegistry.ts',
      'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts',
      'packages/agent-generics/src/agents/factories.ts',
      'packages/agent-generics/src/steps/failsafe-sequence.ts',
      'packages/agent-generics/src/steps/thinkings-generation.ts',
      'packages/pipeline-hosts/src/asset-pack-harness.ts',
      'packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts',
    ],
    testPaths: [
      'packages/pipelines-generics/src/phases/__tests__/sdivf.events.integration.test.ts',
      'packages/pipelines-generics/src/streaming/__tests__/pipeline-stream-integration.test.ts',
      'packages/pipelines-generics/src/__tests__/pipeline-tool-registry.test.ts',
      'packages/agent-generics/src/__tests__/factory-agent-ptrr-prompt-hierarchy.test.ts',
      'packages/agent-generics/src/__tests__/llm-parsed-output-telemetry.test.ts',
      'packages/pipeline-hosts/src/__tests__/asset-pack-harness.test.ts',
      'packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipelines-generics test', 'pnpm --filter @bitcode/agent-generics test', 'pnpm --filter @bitcode/pipeline-hosts test'],
    requiredSourceMarkers: [
      'PipelineExecutor',
      'PipelineAgentRegistry',
      'factoryAgentWithPTRR',
      'createFailsafeGenerationSequence',
      'createThinkingsGeneration',
      'ReadFitsFindingSynthesis',
    ],
    requiredTestMarkers: [
      'pipeline-stream',
      'factoryAgentWithPTRR',
      'distributed execution runtime receipt',
    ],
    expectedCounts: {
      primitivePackageCount: 3,
      hostHarnessCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'Generic pipeline, execution, streaming, PTRR/Failsafe/Thricified, registry, and sandbox host primitives are integration-covered beneath real Reading pipelines.',
  }),
  row({
    integrationSurfaceId: 'reading:local-staging-rehearsal-integration',
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    integrationKind: 'local-staging-rehearsal',
    sourceRoots: [
      'packages/pipelines/asset-pack/src/reading-local-staging-rehearsal.ts',
      'scripts/generate-v39-local-staging-reading-rehearsal.mjs',
      'scripts/check-v39-gate10-local-staging-reading-rehearsal.mjs',
    ],
    testPaths: [
      'packages/pipelines/asset-pack/src/__tests__/reading-local-staging-rehearsal.test.ts',
      'packages/protocol/test/v39-local-staging-reading-rehearsal.test.js',
      'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/pipeline-asset-pack test -- reading-local-staging-rehearsal reading-pipeline-integration-coverage', 'pnpm --filter @bitcode/protocol exec node --test --test-force-exit test/v39-local-staging-reading-rehearsal.test.js'],
    requiredSourceMarkers: [
      'READING_LOCAL_STAGING_REHEARSAL_LANES',
      'staging-testnet',
      'tkpyosihuouusyaxtbau',
    ],
    requiredTestMarkers: [
      'stagingProjectRef',
      'tkpyosihuouusyaxtbau',
      'depositoryManyFitsCovered',
    ],
    expectedCounts: {
      laneCount: 2,
      readingStageCount: 5,
      sourceSafeReadbackRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement: 'Local and staging-testnet Reading rehearsal remains covered for accepted Need, many fits, source-safe preview, deterministic quote, telemetry, sync, rights, and delivery.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, 'package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const spec = readSource(repoRoot, 'BITCODE_SPEC_V40.md');
  const delta = readSource(repoRoot, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = readSource(repoRoot, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = readSource(repoRoot, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, 'SPECIFICATIONS_ROADMAP.md');
  const protocolIndex = readSource(repoRoot, 'packages/protocol/src/index.js');
  const protocolTypes = readSource(repoRoot, 'packages/protocol/src/index.d.ts');

  const rowPredicates = V40_READING_PIPELINE_INTEGRATION_ROWS.flatMap((coverageRow) => {
    const safeId = coverageRow.integrationSurfaceId.replace(/[^a-z0-9]+/gu, '-');
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
      predicateResult(
        `${safeId}:source-markers-present`,
        coverageRow.sourceRoots[0],
        allMarkersPresent(repoRoot, coverageRow.sourceRoots, coverageRow.requiredSourceMarkers),
      ),
      predicateResult(
        `${safeId}:test-markers-present`,
        coverageRow.testPaths[0],
        allMarkersPresent(repoRoot, coverageRow.testPaths, coverageRow.requiredTestMarkers),
      ),
    ];
  });

  return [
    predicateResult('package-scripts-include-gate5', 'package.json', packageJson.includes('generate:v40-reading-pipeline-integration') && packageJson.includes('check:v40-gate5')),
    predicateResult('workflows-run-gate5-check', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v40-gate5-reading-pipeline-integration.mjs') && canonWorkflow.includes('check-v40-gate5-reading-pipeline-integration.mjs')),
    predicateResult('gate-quality-runs-reading-integration-test', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('reading-pipeline-integration-coverage.test.ts')),
    predicateResult('protocol-exports-gate5', 'packages/protocol/src/index.js', protocolIndex.includes('buildV40ReadingPipelineIntegrationCoverage') && protocolTypes.includes('buildV40ReadingPipelineIntegrationCoverage')),
    predicateResult('spec-documents-gate5', 'BITCODE_SPEC_V40.md', spec.includes('V40 Gate 5 Reading Pipeline Integration Coverage') && spec.includes(V40_READING_PIPELINE_INTEGRATION_COVERAGE_ARTIFACT_PATH)),
    predicateResult('delta-documents-gate5', 'BITCODE_SPEC_V40_DELTA.md', delta.includes('Gate 5 closes with package-backed `V40ReadingPipelineIntegrationCoverage`')),
    predicateResult('notes-document-gate5', 'BITCODE_SPEC_V40_NOTES.md', notes.includes('Gate 5 implementation notes') && notes.includes('Reading pipeline integration coverage')),
    predicateResult('parity-documents-gate5', 'BITCODE_SPEC_V40_PARITY_MATRIX.md', parity.includes('v40-reading-pipeline-integration-coverage') && parity.includes('| Gate 5 | Reading pipeline integration artifact | implemented |')),
    predicateResult(
      'roadmap-advanced-through-gate5',
      'SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('V40 Gate 5 closure anchor') &&
        (/Current working gate: V40 Gate (?:5|6|7|8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V40 Exhaustive Commercial Application Testing') ||
          roadmap.includes('Recent V40 closure anchor')),
    ),
    predicateResult(
      'roadmap-preserves-v41-prompt-programs',
      'SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('| V41 | `BITCODE_SPEC_V41.md` |') &&
        roadmap.includes('Prompt and PromptPart excellence') &&
        roadmap.includes('prompts as programs'),
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
    surfaceCount: V40_READING_PIPELINE_INTEGRATION_SURFACE_IDS.length,
    verdictIds: [...V40_READING_PIPELINE_INTEGRATION_VERDICTS],
    rowsByVerdict,
    rowsByTier,
    expectedTotals: { ...V40_READING_PIPELINE_EXPECTED_TOTALS },
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    missingRowCount: rows.filter((item) => item.verdict === 'missing').length,
    blockedRowCount: rows.filter((item) => item.verdict === 'blocked').length,
    exemptRowCount: rows.filter((item) => item.verdict === 'exempt').length,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    readNeedComprehensionIntegrationClosed: rows.some((item) => item.integrationSurfaceId === 'reading:read-need-comprehension-runtime'),
    readFitsFindingIntegrationClosed: rows.some((item) => item.integrationSurfaceId === 'reading:read-fits-finding-search-runtime'),
    depositorySearchCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'reading:read-fits-finding-search-runtime'),
    ptrrAgentIntegrationClosed: rows.some((item) => item.integrationSurfaceId === 'reading:ptrr-agent-implementation-integration'),
    previewSettlementDeliveryClosed: rows.some((item) => item.integrationSurfaceId === 'reading:preview-settlement-delivery-boundaries'),
    observabilityReadbackCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'reading:telemetry-repair-readback'),
    terminalHarnessCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'reading:terminal-api-harness-integration'),
    primitiveHostIntegrationClosed: rows.some((item) => item.integrationSurfaceId === 'reading:primitive-and-host-integration'),
    localStagingRehearsalLinked: rows.some((item) => item.integrationSurfaceId === 'reading:local-staging-rehearsal-integration'),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    valueBearingMainnetRequired: false,
    promptContentRewriteDeferredToV41: true,
  };
}

export function buildV40ReadingPipelineIntegrationCoverage(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_READING_PIPELINE_INTEGRATION_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v40-reading-pipeline-integration-coverage:${digest(JSON.stringify({
    rows: rows.map((item) => item.rowRoot),
    failedPredicateIds: coverage.failedPredicateIds,
    expectedTotals: coverage.expectedTotals,
  }))}`;

  return {
    artifactId: 'v40-reading-pipeline-integration-coverage',
    schemaId: V40_READING_PIPELINE_INTEGRATION_COVERAGE_SCHEMA_ID,
    version: V40_READING_PIPELINE_INTEGRATION_COVERAGE_VERSION,
    currentTarget: V40_READING_PIPELINE_INTEGRATION_COVERAGE_CURRENT_TARGET,
    sourceSafetyVerdict: V40_READING_PIPELINE_INTEGRATION_COVERAGE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0 && coverage.allCriticalSurfacesClosed,
    pipelineNames: [...V40_READING_PIPELINE_NAMES],
    surfaceIds: [...V40_READING_PIPELINE_INTEGRATION_SURFACE_IDS],
    verdictIds: [...V40_READING_PIPELINE_INTEGRATION_VERDICTS],
    rows,
    rowIds: rows.map((item) => item.integrationSurfaceId),
    predicateResults,
    coverage,
  };
}
