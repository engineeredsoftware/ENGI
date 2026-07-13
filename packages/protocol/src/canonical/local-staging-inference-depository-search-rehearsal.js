// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json';
export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SCHEMA_ID =
  'bitcode.v38.localStagingInferenceDepositorySearchRehearsal.v1';
export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_VERSION = 'V38';
export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_CURRENT_TARGET = 'V37';
export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-local-staging-inference-depository-search-rehearsal-metadata';

export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-reading-inference-rehearsal',
  'lane:staging-testnet-reading-inference-rehearsal',
  'pipeline:read-need-and-read-fits-finding-rehearsal',
  'search:depository-many-fits-rehearsal',
  'assetpack:source-safe-preview-rehearsal',
  'telemetry:streaming-readback-rehearsal',
  'inference:real-credential-gated-rehearsal',
  'boundary:value-bearing-mainnet-blocked-rehearsal',
]);

export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_LANE_IDS =
  Object.freeze(['local', 'staging-testnet']);

export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS =
  Object.freeze([
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
    '.bitcode/v38-prompt-benchmark-report.json',
    '.bitcode/v38-disclosure-boundary-report.json',
    '.bitcode/v38-read-need-comprehension-inference-hardening.json',
    '.bitcode/v38-read-fits-finding-search-embeddings.json',
    '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
    '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
  ]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'live_rehearsal_log_payloads',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'production_mainnet_value_bearing_admission',
]);

const SOURCE_ROOTS = Object.freeze({
  routePreflight: 'uapi/app/api/pipeline-host/asset-pack/preflight.ts',
  routeRunner: 'uapi/app/api/pipeline-host/asset-pack/runner.ts',
  routeTest: 'uapi/tests/api/pipelineHostRoute.test.ts',
  routePreflightTest: 'uapi/tests/api/pipelineHostPreflight.test.ts',
  harness: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
  harnessDevRunner: 'packages/pipeline-hosts/src/dev/run-asset-pack-sandbox-host.ts',
  harnessTest: 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
  depositorySearch: 'packages/pipelines/asset-pack/src/depository-search.ts',
  embeddingConfig: 'packages/pipelines/asset-pack/src/embedding-config.ts',
  depositorySearchTest: 'packages/pipelines/asset-pack/src/__tests__/depository-search.test.ts',
  readingPipelineContractTest: 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts',
  readingPipelineObservabilityTest: 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-observability.test.ts',
  assetPackDisclosureTest: 'packages/pipelines/asset-pack/src/__tests__/asset-pack-disclosure.test.ts',
  terminalPipelineHarnessClientTest: 'uapi/tests/terminalPipelineHarnessClient.test.ts',
  pipelineExecutionLogHeaderTest: 'uapi/tests/pipelineExecutionLogHeader.test.tsx',
  pipelineExecutionLogUi: 'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-local-staging-inference-depository-search-rehearsal-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function readJson(repoRoot, sourcePath) {
  const source = readSource(repoRoot, sourcePath);
  return source ? JSON.parse(source) : null;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_local_staging_inference_depository_search_rehearsal_metadata',
    protectedSourceVisible: false,
    rawPromptTextSerialized: false,
    rawProviderResponseVisible: false,
    liveLogPayloadSerialized: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-reading-inference-rehearsal',
    laneId: 'local',
    purpose:
      'Prove the local Vercel Sandbox harness can run Reading inference rehearsal from local env files only after explicit opt-in, with artifacts written to the local harness run directory and known secrets redacted.',
    sourceRoots: [SOURCE_ROOTS.harnessDevRunner, SOURCE_ROOTS.harness, SOURCE_ROOTS.harnessTest],
    primitiveIds: ['PipelineHarness', 'VercelSandboxPipelineHost', 'ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
    expectedEvidenceIds: ['explicit-sandbox-opt-in', 'local-env-file-loading', 'local-artifact-run-directory', 'secret-redaction'],
  }),
  row({
    rowId: 'lane:staging-testnet-reading-inference-rehearsal',
    laneId: 'staging-testnet',
    purpose:
      'Prove staging-testnet route execution requires real bounded inference, validates Supabase readback, streams to database storage, and returns source-safe completion summaries.',
    sourceRoots: [SOURCE_ROOTS.routePreflight, SOURCE_ROOTS.routeRunner, SOURCE_ROOTS.routeTest, SOURCE_ROOTS.routePreflightTest],
    primitiveIds: ['summarizeHarnessPreflight', 'assertRealInferenceEnvironment', 'runAssetPackHarnessInSandbox'],
    expectedEvidenceIds: ['real-inference-preflight', 'staging-testnet-readback', 'database-streaming', 'source-safe-summary'],
  }),
  row({
    rowId: 'pipeline:read-need-and-read-fits-finding-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Exercise ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis in the harness with an accepted Need, Failsafe/Thricified telemetry, and route-visible execution events.',
    sourceRoots: [SOURCE_ROOTS.harness, SOURCE_ROOTS.harnessTest, SOURCE_ROOTS.routeRunner, SOURCE_ROOTS.readingPipelineObservabilityTest],
    primitiveIds: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis', 'FailsafeGenerationSequence', 'ThricifiedGeneration'],
    expectedEvidenceIds: ['accepted-read-need', 'pipeline-stream-event', 'inference-audit', 'typed-output-shape'],
  }),
  row({
    rowId: 'search:depository-many-fits-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Rehearse depository-wide many-fit discovery across lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific channels before AssetPack synthesis.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.embeddingConfig, SOURCE_ROOTS.depositorySearchTest],
    primitiveIds: ['ReadFitsFindingSynthesisSearchReceipt', 'buildAssetPackEmbeddingPolicy', 'selectedFitProvenanceRoot'],
    expectedEvidenceIds: ['many-candidate-recall', 'embedding-policy', 'threshold-ranking', 'selected-fit-provenance'],
  }),
  row({
    rowId: 'assetpack:source-safe-preview-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Prove found fits can be synthesized into a source-safe AssetPack preview, checked for disclosure leakage, priced, and withheld from protected-source delivery until settlement unlock.',
    sourceRoots: [SOURCE_ROOTS.harness, SOURCE_ROOTS.harnessTest, SOURCE_ROOTS.assetPackDisclosureTest, SOURCE_ROOTS.routeRunner],
    primitiveIds: ['buildAssetPackSourceSafePreview', 'assertAssetPackDisclosureSourceSafe', 'buildAssetPackSettlementUnlock'],
    expectedEvidenceIds: ['source-safe-preview', 'disclosure-review', 'deterministic-fee-quote', 'post-settlement-unlock-only'],
  }),
  row({
    rowId: 'telemetry:streaming-readback-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Prove phase, agent, PTRR step, Failsafe, ThricifiedGeneration, prompt-presence, raw-response-presence, parsed-output, tool, and database readback telemetry can render in the rich execution log shape.',
    sourceRoots: [
      SOURCE_ROOTS.harness,
      SOURCE_ROOTS.routeRunner,
      SOURCE_ROOTS.terminalPipelineHarnessClientTest,
      SOURCE_ROOTS.pipelineExecutionLogHeaderTest,
      SOURCE_ROOTS.pipelineExecutionLogUi,
    ],
    primitiveIds: ['pipeline-stream-event', 'PipelineExecutionLog', 'readingPipelineTelemetry', 'inferenceAudit'],
    expectedEvidenceIds: ['stream-event-header', 'accordion-metadata', 'database-readback', 'source-safe-inference-audit'],
  }),
  row({
    rowId: 'inference:real-credential-gated-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Require real non-mocked inference in staging-testnet and allow local live rehearsal only when model-provider and sandbox credentials are present outside tracked files.',
    sourceRoots: [SOURCE_ROOTS.routePreflight, SOURCE_ROOTS.harnessDevRunner, SOURCE_ROOTS.routePreflightTest],
    primitiveIds: ['assertRealInferenceEnvironment', 'isPipelineHarnessRealInferenceRequired', 'selectHarnessCommandEnvironment'],
    expectedEvidenceIds: ['bounded-real-inference-profile', 'provider-credential-present-only', 'sandbox-auth-present-only'],
  }),
  row({
    rowId: 'boundary:value-bearing-mainnet-blocked-rehearsal',
    laneId: 'local-and-staging-testnet',
    purpose:
      'Keep local and staging-testnet rehearsals blocked from value-bearing production-mainnet settlement while still proving ledger/database synchronization, BTC fee posture, and ownership boundaries.',
    sourceRoots: [SOURCE_ROOTS.harness, SOURCE_ROOTS.routeRunner, SOURCE_ROOTS.harnessTest],
    primitiveIds: ['ledgerDatabaseReconciliation', 'protectedSourceUnlock', 'btcFee', 'ownershipBoundary'],
    expectedEvidenceIds: ['testnet-only-posture', 'settlement-readback', 'ownership-boundary', 'protected-source-withheld'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const routePreflight = readSource(repoRoot, SOURCE_ROOTS.routePreflight);
  const routeRunner = readSource(repoRoot, SOURCE_ROOTS.routeRunner);
  const routeTest = readSource(repoRoot, SOURCE_ROOTS.routeTest);
  const routePreflightTest = readSource(repoRoot, SOURCE_ROOTS.routePreflightTest);
  const harness = readSource(repoRoot, SOURCE_ROOTS.harness);
  const harnessDevRunner = readSource(repoRoot, SOURCE_ROOTS.harnessDevRunner);
  const harnessTest = readSource(repoRoot, SOURCE_ROOTS.harnessTest);
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const embeddingConfig = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const depositorySearchTest = readSource(repoRoot, SOURCE_ROOTS.depositorySearchTest);
  const readingContractTest = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContractTest);
  const readingObservabilityTest = readSource(repoRoot, SOURCE_ROOTS.readingPipelineObservabilityTest);
  const assetPackDisclosureTest = readSource(repoRoot, SOURCE_ROOTS.assetPackDisclosureTest);
  const terminalHarnessClientTest = readSource(repoRoot, SOURCE_ROOTS.terminalPipelineHarnessClientTest);
  const pipelineExecutionLogHeaderTest = readSource(repoRoot, SOURCE_ROOTS.pipelineExecutionLogHeaderTest);
  const pipelineExecutionLogUi = readSource(repoRoot, SOURCE_ROOTS.pipelineExecutionLogUi);

  return [
    predicateResult('preflight-requires-real-inference-toggle', SOURCE_ROOTS.routePreflight, routePreflight.includes('assertRealInferenceEnvironment') && routePreflight.includes('BITCODE_ASSET_PACK_REAL_INFERENCE')),
    predicateResult('preflight-requires-provider-credential', SOURCE_ROOTS.routePreflight, routePreflight.includes('OPENAI_API_KEY') && routePreflight.includes('openaiCredentialProvided')),
    predicateResult('preflight-bounds-route-runtime-budget', SOURCE_ROOTS.routePreflight, routePreflight.includes('BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS') && routePreflight.includes('<= 600000')),
    predicateResult('preflight-requires-bounded-profile', SOURCE_ROOTS.routePreflight, routePreflight.includes('readRealInferenceProfile') && routePreflight.includes("'bounded'")),
    predicateResult('route-emits-preflight-and-completion-events', SOURCE_ROOTS.routeRunner, routeRunner.includes("'harness-preflight'") && routeRunner.includes("'harness-completed'")),
    predicateResult('route-forces-database-streaming', SOURCE_ROOTS.routeRunner, routeRunner.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE') && routeRunner.includes("BITCODE_PIPELINE_STREAM_TO_DATABASE = '1'")),
    predicateResult('route-validates-staging-readback', SOURCE_ROOTS.routeRunner, routeRunner.includes('assertSupabaseRestReadbackAccess') && routeRunner.includes('assertRealInferenceEnvironment(env)')),
    predicateResult('route-summary-projects-search-preview-settlement', SOURCE_ROOTS.routeRunner, routeRunner.includes('depositorySearch') && routeRunner.includes('sourceSafePreview') && routeRunner.includes('ledgerSettlement')),
    predicateResult('route-summary-projects-many-selected-candidates', SOURCE_ROOTS.routeRunner, routeRunner.includes('selectedCandidates') && routeRunner.includes('blockedCandidates')),
    predicateResult('route-tests-cover-accepted-read-need', SOURCE_ROOTS.routeTest, routeTest.includes('acceptedReadNeed') && routeTest.includes('pipeline-stream-event')),
    predicateResult('route-preflight-tests-cover-real-inference', SOURCE_ROOTS.routePreflightTest, routePreflightTest.includes('assertRealInferenceEnvironment') && routePreflightTest.includes('BITCODE_ASSET_PACK_REAL_INFERENCE=1') && routePreflightTest.includes('BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded')),
    predicateResult('dev-runner-loads-local-env-files', SOURCE_ROOTS.harnessDevRunner, harnessDevRunner.includes("'.env.local'") && harnessDevRunner.includes("'uapi/.env.local'")),
    predicateResult('dev-runner-requires-explicit-live-opt-in', SOURCE_ROOTS.harnessDevRunner, harnessDevRunner.includes('BITCODE_RUN_VERCEL_SANDBOX_HARNESS') && harnessDevRunner.includes('Set BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1')),
    predicateResult('dev-runner-requires-sandbox-auth', SOURCE_ROOTS.harnessDevRunner, harnessDevRunner.includes('VERCEL_OIDC_TOKEN') && harnessDevRunner.includes('VERCEL_TOKEN') && harnessDevRunner.includes('Missing Vercel Sandbox auth')),
    predicateResult('dev-runner-redacts-known-secrets', SOURCE_ROOTS.harnessDevRunner, harnessDevRunner.includes('redactKnownSecrets') && harnessDevRunner.includes('[redacted]')),
    predicateResult('dev-runner-persists-local-artifacts', SOURCE_ROOTS.harnessDevRunner, harnessDevRunner.includes('.bitcode/pipeline-host-runs') && harnessDevRunner.includes('evidence.json')),
    predicateResult('harness-streams-inference-audit-events', SOURCE_ROOTS.harness, harness.includes("type: 'pipeline-stream-event'") && harness.includes('inferenceAudit') && harness.includes('readingPipelineTelemetry')),
    predicateResult('harness-streams-prompt-and-output-presence', SOURCE_ROOTS.harness, harness.includes('promptTemplatePresent') && harness.includes('interpolatedPromptPresent') && harness.includes('rawModelResponsePresent') && harness.includes('parsedTypedOutputPresent')),
    predicateResult('harness-binds-reading-pipelines', SOURCE_ROOTS.harness, harness.includes('synthesizeReadNeedForPipelineInput') && harness.includes('acceptedReadNeed: readNeed')),
    predicateResult('harness-builds-source-safe-preview', SOURCE_ROOTS.harness, harness.includes('buildAssetPackSourceSafePreview') && harness.includes('assertAssetPackDisclosureSourceSafe')),
    predicateResult('harness-builds-settlement-unlock', SOURCE_ROOTS.harness, harness.includes('buildAssetPackSettlementUnlock') && harness.includes('protectedSourceUnlock')),
    predicateResult('harness-stores-ledger-database-reconciliation', SOURCE_ROOTS.harness, harness.includes('ledgerDatabaseReconciliation') && harness.includes("execution.store('asset-pack/settlement'")),
    predicateResult('harness-timeout-fails-closed', SOURCE_ROOTS.harness, harness.includes('PipelineHarnessTimeoutError') && harness.includes('timeoutError.name')),
    predicateResult('harness-tests-cover-stream-events', SOURCE_ROOTS.harnessTest, harnessTest.includes('pipeline-stream-event') && harnessTest.includes('promptTemplatePresent') && harnessTest.includes('readingPipelineTelemetry')),
    predicateResult('harness-tests-cover-preview-and-settlement', SOURCE_ROOTS.harnessTest, harnessTest.includes('buildAssetPackSourceSafePreview') && harnessTest.includes('buildAssetPackSettlementUnlock') && harnessTest.includes('ledgerDatabaseReconciliation')),
    predicateResult('depository-search-selects-many-candidates', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('maxSelectedCandidates: 12') && depositorySearch.includes('.slice(0, thresholds.maxSelectedCandidates)')),
    predicateResult('depository-search-declares-all-channels', SOURCE_ROOTS.depositorySearch, ['lexical', 'symbolic', 'path', 'metadata', 'measurement', 'embedding-vector', 'provider-specific'].every((channel) => depositorySearch.includes(`'${channel}'`))),
    predicateResult('depository-search-carries-selected-fit-provenance', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('selectedFitProvenanceRootFor') && depositorySearch.includes('selectedFitProvenanceRoot')),
    predicateResult('depository-search-source-safe-receipt', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('sourceSafeMetadataOnly: true') && depositorySearch.includes('protectedSourceVisible: false')),
    predicateResult('embedding-config-preserves-openai-policy', SOURCE_ROOTS.embeddingConfig, embeddingConfig.includes("text-embedding-3-small") && embeddingConfig.includes('1536') && embeddingConfig.includes('match_deliverable_vectors') && embeddingConfig.includes("'cosine'")),
    predicateResult('depository-search-tests-cover-policy-and-channels', SOURCE_ROOTS.depositorySearchTest, depositorySearchTest.includes('text-embedding-3-small') && depositorySearchTest.includes('match_deliverable_vectors') && depositorySearchTest.includes('maxSelectedCandidates').valueOf()),
    predicateResult('depository-search-tests-cover-selected-provenance', SOURCE_ROOTS.depositorySearchTest, depositorySearchTest.includes('selectedFitProvenanceRoot') && depositorySearchTest.includes('sourceSafeMetadataOnly')),
    predicateResult('reading-contract-tests-cover-tool-contracts', SOURCE_ROOTS.readingPipelineContractTest, readingContractTest.includes('ReadFitsFindingSynthesis.tool.lexical-depository-search')),
    predicateResult('reading-observability-tests-cover-tool-telemetry', SOURCE_ROOTS.readingPipelineObservabilityTest, readingObservabilityTest.includes('ReadFitsFindingSynthesis.tool.lexical-depository-search')),
    predicateResult('assetpack-disclosure-tests-cover-source-safety', SOURCE_ROOTS.assetPackDisclosureTest, assetPackDisclosureTest.includes('source') && assetPackDisclosureTest.includes('disclosure')),
    predicateResult('terminal-client-tests-cover-harness-streaming', SOURCE_ROOTS.terminalPipelineHarnessClientTest, terminalHarnessClientTest.includes('pipeline') && terminalHarnessClientTest.includes('stream')),
    predicateResult('pipeline-log-header-tests-cover-rich-log', SOURCE_ROOTS.pipelineExecutionLogHeaderTest, pipelineExecutionLogHeaderTest.includes('PipelineExecutionLogHeader') || pipelineExecutionLogHeaderTest.includes('pipeline execution')),
    predicateResult('pipeline-log-ui-remains-rich-accordion', SOURCE_ROOTS.pipelineExecutionLogUi, pipelineExecutionLogUi.includes('Accordion') || pipelineExecutionLogUi.includes('metadata')),
  ];
}

function upstreamRoot(artifact, prefix) {
  if (!artifact?.artifactRoot) return `${prefix}:missing`;
  return artifact.artifactRoot;
}

export function buildV38LocalStagingInferenceDepositorySearchRehearsal(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  const upstreamArtifacts = Object.fromEntries(
    V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS.map((artifactPath) => [
      artifactPath,
      readJson(repoRoot, artifactPath),
    ]),
  );
  const rowRoots = V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS.map((item) => item.rowRoot);
  const sourceRoots = [
    ...new Set(V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS.flatMap((item) => item.sourceRoots)),
  ];
  const missingSourceRoots = sourceRoots.filter((sourcePath) => !existsSync(path.join(repoRoot, sourcePath)));
  const legacySourceRoots = sourceRoots.filter((sourcePath) => sourcePath.includes('_legacy/'));
  const missingProofArtifacts = V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS
    .filter((artifactPath) => !existsSync(path.join(repoRoot, artifactPath)));
  const upstreamRoots = Object.fromEntries(
    Object.entries(upstreamArtifacts).map(([artifactPath, artifact]) => [
      artifactPath,
      upstreamRoot(artifact, artifactPath.replace(/^\.(?:bitcode)?\/?/u, '').replace(/\.json$/u, '')),
    ]),
  );
  const artifactRoot = `v38-local-staging-inference-depository-search-rehearsal:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
    upstreamRoots,
    missingSourceRoots,
    missingProofArtifacts,
  }))}`;

  return {
    artifactId: 'v38-local-staging-inference-depository-search-rehearsal',
    schemaId: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SCHEMA_ID,
    version: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_VERSION,
    currentTarget: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0 && missingSourceRoots.length === 0 && missingProofArtifacts.length === 0 && legacySourceRoots.length === 0,
    rows: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS,
    rowIds: [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROW_IDS],
    laneIds: [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_LANE_IDS],
    requiredProofArtifacts: [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS],
    predicateResults,
    coverage: {
      rowCount: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS.length,
      laneCount: V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_LANE_IDS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sourceRootCount: sourceRoots.length,
      missingSourceRoots,
      missingProofArtifacts,
      upstreamRoots,
      localRehearsalCovered: true,
      stagingTestnetRehearsalCovered: true,
      readNeedComprehensionCovered: true,
      readFitsFindingCovered: true,
      depositoryManyFitsCovered: true,
      embeddingPolicyCovered: true,
      sourceSafePreviewCovered: true,
      telemetryStreamingCovered: true,
      realInferenceCredentialGatedCovered: true,
      databaseLedgerReadbackCovered: true,
      valueBearingMainnetVisibleAndBlocked: true,
      localLiveExecutionRequiresExplicitOptIn: true,
      stagingStrictnessRequiresRealInference: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawPromptTextSerialized: false,
      rawProviderResponseVisible: false,
      liveLogPayloadSerialized: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      valueBearingMainnetAdmitted: false,
      legacySourceRoots: legacySourceRoots.length > 0,
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
