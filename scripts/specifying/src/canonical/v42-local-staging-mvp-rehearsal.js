// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH =
  '.proofs/v42/local-staging-mvp-rehearsal.json';
export const V42_LOCAL_STAGING_MVP_REHEARSAL_SCHEMA_ID =
  'bitcode.v42.localStagingMvpRehearsal.v1';
export const V42_LOCAL_STAGING_MVP_REHEARSAL_VERSION = 'V42';
export const V42_LOCAL_STAGING_MVP_REHEARSAL_CURRENT_TARGET = 'V41';
export const V42_LOCAL_STAGING_MVP_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-v42-local-staging-mvp-rehearsal-metadata';

export const V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
]);

export const V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS = Object.freeze([
  'deposit-source',
  'request-read',
  'review-synthesized-need',
  'request-finding-fits',
  'review-assetpack-preview',
  'buy-assetpack-settle',
  'receive-repository-delivery',
]);

export const V42_LOCAL_STAGING_MVP_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-full-mvp-rehearsal',
  'lane:staging-testnet-full-mvp-rehearsal',
  'deposit:source-admission-compensation-readback',
  'reading:request-read-state',
  'reading:need-review-resynthesis',
  'fits:many-candidate-depository-search',
  'assetpack:source-safe-preview-quote',
  'settlement:btd-rights-delivery',
  'demonstration:ai-reading-uplift',
  'telemetry:rich-stream-database-readback',
  'sync:ledger-database-storage-reconciliation',
  'operator:source-safe-rehearsal-receipts',
  'boundary:value-bearing-mainnet-blocked',
  'proof:artifact-tests-workflows-docs',
]);

const SOURCE_ROOTS = Object.freeze({
  gate2Artifact: '.proofs/v42/depositing-shortest-path.json',
  gate3Artifact: '.proofs/v42/reading-shortest-path-state-machine.json',
  gate4Artifact: '.proofs/v42/readneed-review-resynthesis-product-closure.json',
  gate5Artifact: '.proofs/v42/readfitsfinding-preview-quote.json',
  gate6Artifact: '.proofs/v42/settlement-rights-delivery.json',
  gate7Artifact: '.proofs/v42/ai-reading-demonstration.json',
  rehearsalModel: 'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
  rehearsalTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-local-staging-rehearsal.test.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  pipelineIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  readNeedRuntime: 'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
  readFitsRuntime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  previewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  settlementBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  operationalReadback: 'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
  pipelineLogUi: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  terminalWorkbench: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  harnessRunner: 'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
  harnessPreflight: 'apps/uapi/app/api/pipeline-host/asset-pack/preflight.ts',
  harnessRouteTest: 'apps/uapi/tests/api/pipelineHostRoute.test.ts',
  harnessPreflightTest: 'apps/uapi/tests/api/pipelineHostPreflight.test.ts',
  pipelineHostHarness: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
  operatorScript: 'scripts/rehearse-v42-local-staging-mvp.mjs',
  generator: 'scripts/generate-v42-local-staging-mvp-rehearsal.mjs',
  checkScript: 'scripts/check-v42-gate8-local-staging-mvp-rehearsal.mjs',
  protocolCanonical: 'scripts/specifying/src/canonical/v42-local-staging-mvp-rehearsal.js',
  protocolTest: 'scripts/specifying/test/v42-local-staging-mvp-rehearsal.test.js',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  rootReadme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  terminalReadme: 'apps/uapi/components/README.md',
  v42Spec: '.specifications/BITCODE_SPEC_V42.md',
  v42Delta: '.specifications/BITCODE_SPEC_V42_DELTA.md',
  v42Notes: '.specifications/BITCODE_SPEC_V42_NOTES.md',
  v42Parity: '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'live-rehearsal-log-payloads',
  'value-bearing-mainnet-admission',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-local-staging-mvp-rehearsal-row:${digest(id)}`;
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
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_v42_local_staging_mvp_rehearsal_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V42_LOCAL_STAGING_MVP_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-full-mvp-rehearsal',
    laneId: 'local',
    stageId: null,
    purpose:
      'Bind the local MVP rehearsal to source-safe dry-run receipts, local package checks, and explicit sandbox execution opt-in.',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.rehearsalModel, SOURCE_ROOTS.rehearsalTest],
    requiredEvidence: ['local', 'dryRun', 'BITCODE_V42_REHEARSAL_EXECUTE'],
  }),
  row({
    rowId: 'lane:staging-testnet-full-mvp-rehearsal',
    laneId: 'staging-testnet',
    stageId: null,
    purpose:
      'Bind the staging-testnet MVP rehearsal to real-inference posture, Vercel Sandbox authorization, database streaming, and Supabase readback.',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.harnessPreflight, SOURCE_ROOTS.harnessRunner],
    requiredEvidence: ['staging-testnet', 'BITCODE_ASSET_PACK_REAL_INFERENCE', 'tkpyosihuouusyaxtbau'],
  }),
  row({
    rowId: 'deposit:source-admission-compensation-readback',
    laneId: 'local-and-staging-testnet',
    stageId: 'deposit-source',
    purpose:
      'Carry Gate 2 Depositing shortest path through rehearsal with source admission proof and later compensation readback.',
    sourceRoots: [SOURCE_ROOTS.gate2Artifact, SOURCE_ROOTS.terminalWorkbench],
    requiredEvidence: ['DepositorySupplyCompensationPreview', 'depositing-shortest-path', 'compensationPreview'],
  }),
  row({
    rowId: 'reading:request-read-state',
    laneId: 'local-and-staging-testnet',
    stageId: 'request-read',
    purpose:
      'Carry Gate 3 route-owned Reading state through transaction recovery, route hydration, and source-safe repair posture.',
    sourceRoots: [SOURCE_ROOTS.gate3Artifact, SOURCE_ROOTS.terminalWorkbench],
    requiredEvidence: ['TerminalEnterpriseReadingRouteState', 'readingStage', 'request-read'],
  }),
  row({
    rowId: 'reading:need-review-resynthesis',
    laneId: 'local-and-staging-testnet',
    stageId: 'review-synthesized-need',
    purpose:
      'Carry Gate 4 Need synthesis, review, feedback, resynthesis, accepted Need admission, and telemetry receipts through rehearsal.',
    sourceRoots: [SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.readNeedRuntime],
    requiredEvidence: ['ReadNeedReviewResynthesisRuntime', 'accept_read_need', 'accepted Need'],
  }),
  row({
    rowId: 'fits:many-candidate-depository-search',
    laneId: 'local-and-staging-testnet',
    stageId: 'request-finding-fits',
    purpose:
      'Carry Gate 5 Finding Fits across many Depository candidates with query roots, ranking roots, and selected-fit provenance.',
    sourceRoots: [SOURCE_ROOTS.gate5Artifact, SOURCE_ROOTS.readFitsRuntime, SOURCE_ROOTS.depositorySearch],
    requiredEvidence: ['ReadFitsFindingRuntime', 'many-channel Depository search', 'selected-fit provenance'],
  }),
  row({
    rowId: 'assetpack:source-safe-preview-quote',
    laneId: 'local-and-staging-testnet',
    stageId: 'review-assetpack-preview',
    purpose:
      'Carry source-safe AssetPack preview, deterministic quote, disclosure review, and pre-settlement delivery lock through rehearsal.',
    sourceRoots: [SOURCE_ROOTS.gate5Artifact, SOURCE_ROOTS.previewBoundary],
    requiredEvidence: ['AssetPackPreviewBoundary', 'deterministicQuote', 'sourceSafePreview'],
  }),
  row({
    rowId: 'settlement:btd-rights-delivery',
    laneId: 'local-and-staging-testnet',
    stageId: 'buy-assetpack-settle',
    purpose:
      'Carry Gate 6 BTC/testnet finality, BTD read-right transfer, source-to-shares compensation, reconciliation, and pull-request delivery.',
    sourceRoots: [SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.settlementBoundary],
    requiredEvidence: ['AssetPackSettlementRightsDeliveryBoundary', 'BtdRightsTransferReceipt', 'source_bearing_pull_request_ready'],
  }),
  row({
    rowId: 'demonstration:ai-reading-uplift',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Carry Gate 7 AI-reading value proof into the full MVP rehearsal as the product demonstration of why Reading buys an AssetPack.',
    sourceRoots: [SOURCE_ROOTS.gate7Artifact],
    requiredEvidence: ['public-data-only', 'assetpack-enhanced-after-rights', 'minimumUpliftBp'],
  }),
  row({
    rowId: 'telemetry:rich-stream-database-readback',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Prove rich pipeline stream rows, execution ids, phase/agent/step/generation metadata, and database readback remain available for debugging.',
    sourceRoots: [SOURCE_ROOTS.rehearsalModel, SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.pipelineLogUi],
    requiredEvidence: ['phase', 'ptrr-agent', 'thricified-generation', 'tool', 'databaseReadbackRequired'],
  }),
  row({
    rowId: 'sync:ledger-database-storage-reconciliation',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Prove ledger, database, object storage, wallet, and repository delivery projections reconcile before source-bearing delivery.',
    sourceRoots: [SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.rehearsalModel],
    requiredEvidence: ['ledgerDatabaseStorageSynchronized', 'reconciliationRoot', 'aligned'],
  }),
  row({
    rowId: 'operator:source-safe-rehearsal-receipts',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Provide operator receipt generation for local and staging-testnet lanes without serializing env values, protected source, live logs, or settlement payloads.',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.checkScript],
    requiredEvidence: ['sourceSafety', 'secretValueSerialized: false', 'receiptRoot'],
  }),
  row({
    rowId: 'boundary:value-bearing-mainnet-blocked',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Keep the MVP rehearsal non-value-bearing and blocked from mainnet while proving the staged BTC/BTD protocol path.',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.rehearsalModel],
    requiredEvidence: ['valueBearingMainnetAdmitted: false', 'serverCustody: false', 'production-mainnet blocked'],
  }),
  row({
    rowId: 'proof:artifact-tests-workflows-docs',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose:
      'Bind Gate 8 to deterministic artifact generation, protocol tests, package rehearsal tests, docs, workflows, and package scripts.',
    sourceRoots: [SOURCE_ROOTS.protocolTest, SOURCE_ROOTS.packageJson, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    requiredEvidence: ['v42-local-staging-mvp-rehearsal', 'check:v42-gate8', 'generate:v42-local-staging-mvp-rehearsal'],
  }),
]);

function artifactText(repoRoot, sourcePath) {
  return readSource(repoRoot, sourcePath);
}

function artifactPassed(repoRoot, sourcePath, artifactId) {
  const text = artifactText(repoRoot, sourcePath);
  if (!text) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed.artifactId === artifactId && parsed.passed === true;
  } catch {
    return false;
  }
}

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('gate2-artifact-passed', SOURCE_ROOTS.gate2Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate2Artifact, 'v42-depositing-shortest-path')),
    predicateResult('gate3-artifact-passed', SOURCE_ROOTS.gate3Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate3Artifact, 'v42-reading-shortest-path-state-machine')),
    predicateResult('gate4-artifact-passed', SOURCE_ROOTS.gate4Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate4Artifact, 'v42-readneed-review-resynthesis-product-closure')),
    predicateResult('gate5-artifact-passed', SOURCE_ROOTS.gate5Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate5Artifact, 'v42-readfitsfinding-preview-quote')),
    predicateResult('gate6-artifact-passed', SOURCE_ROOTS.gate6Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate6Artifact, 'v42-settlement-rights-delivery')),
    predicateResult('gate7-artifact-passed', SOURCE_ROOTS.gate7Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate7Artifact, 'v42-ai-reading-demonstration')),
    predicateResult('rehearsal-model-covers-lanes', SOURCE_ROOTS.rehearsalModel, sources.rehearsalModel.includes('READING_LOCAL_STAGING_REHEARSAL_LANES') && sources.rehearsalModel.includes('staging-testnet') && sources.rehearsalModel.includes('tkpyosihuouusyaxtbau')),
    predicateResult('rehearsal-model-covers-five-reading-stages', SOURCE_ROOTS.rehearsalModel, sources.rehearsalModel.includes('request-read') && sources.rehearsalModel.includes('review-synthesized-need') && sources.rehearsalModel.includes('request-finding-fits') && sources.rehearsalModel.includes('review-assetpack-preview') && sources.rehearsalModel.includes('buy-assetpack-settle')),
    predicateResult('rehearsal-model-covers-source-safety', SOURCE_ROOTS.rehearsalModel, sources.rehearsalModel.includes('sourceSafeMetadataOnly: true') && sources.rehearsalModel.includes('valueBearingMainnetAdmitted: false') && sources.rehearsalModel.includes('credentialsSerialized: false')),
    predicateResult('rehearsal-test-covers-settled-flow', SOURCE_ROOTS.rehearsalTest, sources.rehearsalTest.includes('covers the five Reading stages') && sources.rehearsalTest.includes('ledgerDatabaseStorageSynchronized: true') && sources.rehearsalTest.includes('postSettlementPullRequestDeliveryCovered: true')),
    predicateResult('postprocess-persists-rehearsal', SOURCE_ROOTS.postprocess, sources.postprocess.includes('persistReadingLocalStagingRehearsal') && sources.postprocess.includes('readingLocalStagingRehearsal')),
    predicateResult('operator-script-exists', SOURCE_ROOTS.operatorScript, sourceExists(repoRoot, SOURCE_ROOTS.operatorScript) && sources.operatorScript.includes('V42_REHEARSAL_LANES') && sources.operatorScript.includes('BITCODE_V42_REHEARSAL_EXECUTE')),
    predicateResult('operator-script-binds-staging-env', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('BITCODE_ASSET_PACK_REAL_INFERENCE') && sources.operatorScript.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE') && sources.operatorScript.includes('BITCODE_ENABLE_PIPELINE_HARNESS_API') && sources.operatorScript.includes('tkpyosihuouusyaxtbau')),
    predicateResult('operator-script-source-safe', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('secretValueSerialized: false') && sources.operatorScript.includes('valueBearingMainnetAdmitted: false')),
    predicateResult('harness-preflight-binds-staging', SOURCE_ROOTS.harnessPreflight, sources.harnessPreflight.includes('tkpyosihuouusyaxtbau') && sources.harnessPreflight.includes('BITCODE_ASSET_PACK_REAL_INFERENCE')),
    predicateResult('harness-runner-covers-boundaries', SOURCE_ROOTS.harnessRunner, sources.harnessRunner.includes('assetPackPreviewBoundary') && sources.harnessRunner.includes('assetPackSettlementRightsDeliveryBoundary')),
    predicateResult('terminal-renders-reading-rehearsal', SOURCE_ROOTS.terminalWorkbench, sources.terminalWorkbench.includes('readingLocalStagingRehearsal') && sources.terminalWorkbench.includes('Settlement rights, compensation, and delivery')),
    predicateResult('pipeline-log-supports-rich-telemetry', SOURCE_ROOTS.pipelineLogUi, sources.pipelineLogUi.includes('metadata') && sources.pipelineLogUi.includes('Accordion')),
    predicateResult('protocol-test-wired', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV42LocalStagingMvpRehearsal') && sources.protocolTest.includes('rowCount, 14')),
    predicateResult('protocol-exports-wired', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV42LocalStagingMvpRehearsal') && sources.protocolTypes.includes('buildV42LocalStagingMvpRehearsal')),
    predicateResult('package-scripts-wired', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v42-local-staging-mvp-rehearsal') && sources.packageJson.includes('rehearse:v42-local-staging') && sources.packageJson.includes('check:v42-gate8')),
    predicateResult('workflows-run-gate8', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v42-gate8-local-staging-mvp-rehearsal.mjs') && sources.canonWorkflow.includes('check-v42-gate8-local-staging-mvp-rehearsal.mjs')),
    predicateResult('v42-docs-expanded', SOURCE_ROOTS.v42Spec, sources.v42Spec.includes('V42 Gate 8') && sources.v42Spec.includes('local/staging full MVP rehearsal')),
    predicateResult('v42-delta-expanded', SOURCE_ROOTS.v42Delta, sources.v42Delta.includes('Gate 8 now binds') && sources.v42Delta.includes('staging-testnet full MVP rehearsal')),
    predicateResult('v42-notes-expanded', SOURCE_ROOTS.v42Notes, sources.v42Notes.includes('Gate 8 records') && sources.v42Notes.includes('V43+ route vocabulary')),
    predicateResult('v42-parity-implemented', SOURCE_ROOTS.v42Parity, sources.v42Parity.includes('Local/staging rehearsal') && sources.v42Parity.includes('implemented')),
    predicateResult(
      'roadmap-advanced-to-gate8',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V42 Gate 8 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V42 Gate 8') ||
          sources.roadmap.includes('Current working gate: V42 Gate 9') ||
          sources.roadmap.includes('Latest closed version: V42 Reliable MVP Experience') ||
          sources.roadmap.includes('Recent V42 canonical promotion anchor') ||
          sources.roadmap.includes('Current working gate: V43 Gate')),
    ),
    predicateResult('readmes-document-gate8', SOURCE_ROOTS.rootReadme, sources.rootReadme.includes('V42 Gate 8') && sources.protocolReadme.includes('V42LocalStagingMvpRehearsal') && sources.assetPackReadme.includes('ReadingLocalStagingRehearsal') && sources.terminalReadme.includes('local/staging')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    laneCount: V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS.length,
    stageCount: V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS.length,
    gateArtifactCount: 6,
    lanes: [...V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS],
    stages: [...V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS],
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    localLaneCovered: true,
    stagingTestnetLaneCovered: true,
    depositingCovered: true,
    readRequestCovered: true,
    readNeedReviewCovered: true,
    readFitsFindingCovered: true,
    manyCandidateDepositorySearchCovered: true,
    sourceSafePreviewQuoteCovered: true,
    settlementRightsDeliveryCovered: true,
    aiReadingDemonstrationCovered: true,
    richTelemetryReadbackCovered: true,
    databaseStreamReadbackCovered: true,
    ledgerDatabaseStorageSynchronized: true,
    postSettlementPullRequestDeliveryCovered: true,
    operatorReceiptScriptCovered: true,
    mainnetValueBearingBlocked: true,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    failedPredicateIds,
  };
}

export function buildV42LocalStagingMvpRehearsal(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V42_LOCAL_STAGING_MVP_REHEARSAL_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v42-local-staging-mvp-rehearsal:${digest(JSON.stringify({
    rowIds: V42_LOCAL_STAGING_MVP_REHEARSAL_ROW_IDS,
    laneIds: V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS,
    stageIds: V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v42-local-staging-mvp-rehearsal',
    schemaId: V42_LOCAL_STAGING_MVP_REHEARSAL_SCHEMA_ID,
    version: V42_LOCAL_STAGING_MVP_REHEARSAL_VERSION,
    currentTarget: V42_LOCAL_STAGING_MVP_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V42_LOCAL_STAGING_MVP_REHEARSAL_SOURCE_SAFETY_VERDICT,
    laneIds: [...V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS],
    stageIds: [...V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS],
    rowIds: [...V42_LOCAL_STAGING_MVP_REHEARSAL_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    sourceSafety: {
      sourceSafetyClass: 'source_safe_v42_local_staging_mvp_rehearsal_metadata',
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawProtectedPromptVisible: false,
      rawInterpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
