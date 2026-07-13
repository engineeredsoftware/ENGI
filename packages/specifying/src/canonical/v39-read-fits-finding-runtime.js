// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH =
  '.bitcode/v39-read-fits-finding-runtime.json';
export const V39_READ_FITS_FINDING_RUNTIME_SCHEMA_ID =
  'bitcode.v39.readFitsFindingRuntime.v1';
export const V39_READ_FITS_FINDING_RUNTIME_VERSION = 'V39';
export const V39_READ_FITS_FINDING_RUNTIME_CURRENT_TARGET = 'V38';
export const V39_READ_FITS_FINDING_RUNTIME_SOURCE_SAFETY_VERDICT =
  'source-safe-read-fits-finding-runtime-metadata';

export const V39_READ_FITS_FINDING_RUNTIME_ROW_IDS = Object.freeze([
  'admission:accepted-need-only',
  'query:source-safe-many-channel-plan',
  'ranking:many-candidate-thresholds',
  'embedding:active-vector-policy',
  'provenance:selected-fit-replay-root',
  'runtime:storage-projection',
  'replay:source-safe-receipt',
  'repair:blocked-and-no-worthy-posture',
  'proof:tests-artifact-workflow',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

const SOURCE_ROOTS = Object.freeze({
  runtime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  runtimeTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  depositorySearchTest: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
  depositorySupplyIndex: 'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
  embeddingConfig: 'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'packages/specifying/README.md',
  v39Spec: 'BITCODE_SPEC_V39.md',
  v39Delta: 'BITCODE_SPEC_V39_DELTA.md',
  v39Notes: 'BITCODE_SPEC_V39_NOTES.md',
  v39Parity: 'BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-read-fits-finding-runtime-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_read_fits_finding_runtime_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_READ_FITS_FINDING_RUNTIME_ROWS = Object.freeze([
  row({
    rowId: 'admission:accepted-need-only',
    purpose:
      'Persist accepted-Need admission as the only entrance to ReadFitsFindingSynthesis runtime search and replay.',
    sourceRoots: [SOURCE_ROOTS.runtime, SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['ReadFitsFindingAdmission', 'accepted_need_admission'],
    requiredEvidence: ['acceptedNeed', 'accepted_read_need_missing', 'admitted: true'],
  }),
  row({
    rowId: 'query:source-safe-many-channel-plan',
    purpose:
      'Bind the inference-derived query plan across lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific search channels.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.runtime, SOURCE_ROOTS.depositorySearchTest],
    emittedTypes: ['DepositorySearchQueryPlan', 'search_channel'],
    requiredEvidence: ['queryPlanRoot', 'sourceSafeQueryPlan', 'embedding-vector'],
  }),
  row({
    rowId: 'ranking:many-candidate-thresholds',
    purpose:
      'Carry every above-threshold candidate into source-safe ranking evidence, preserving review, worthy, semantic, proof, measurement, blocker, and use-tier decisions.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.runtime, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['DepositoryCandidateRanking', 'candidate_ranking'],
    requiredEvidence: ['maxSelectedCandidates: 12', 'rankingRoot', 'fitDepositAssetIds'],
  }),
  row({
    rowId: 'embedding:active-vector-policy',
    purpose:
      'Preserve the active OpenAI text-embedding-3-small, 1536-dimension, cosine match_deliverable_vectors contract for Finding Fits.',
    sourceRoots: [SOURCE_ROOTS.embeddingConfig, SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['ReadFitsFindingSynthesisSearchReceipt.embeddingPolicy'],
    requiredEvidence: ['text-embedding-3-small', '1536', 'cosine', 'match_deliverable_vectors'],
  }),
  row({
    rowId: 'provenance:selected-fit-replay-root',
    purpose:
      'Bind selected fit-deposit ids, selected unit ids, proof roots, measurement roots, readback roots, query root, ranking root, and selected-fit provenance root.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.runtime],
    emittedTypes: ['DepositoryFitResultEvidence', 'selected_fit_provenance'],
    requiredEvidence: ['selectedFitProvenanceRoot', 'fitResultRoot', 'reconciliationReadbackRoot'],
  }),
  row({
    rowId: 'runtime:storage-projection',
    purpose:
      'Persist source-safe runtime storage records for admission, query plan, channels, ranking, provenance, fit result, replay, repair, and telemetry.',
    sourceRoots: [SOURCE_ROOTS.runtime, SOURCE_ROOTS.packageIndex, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['ReadFitsFindingRuntime', 'ReadFitsFindingStorageRecord'],
    requiredEvidence: ['storageProjection', 'persistReadFitsFindingRuntime', 'read/finding-fits'],
  }),
  row({
    rowId: 'replay:source-safe-receipt',
    purpose:
      'Emit replay receipts that verify query, ranking, embedding, candidate count, and selected-fit provenance roots without exposing protected source.',
    sourceRoots: [SOURCE_ROOTS.runtime, SOURCE_ROOTS.depositorySearchTest],
    emittedTypes: ['ReadFitsFindingReplayReceipt'],
    requiredEvidence: ['source-safe-query-ranking-selected-fit-replay', 'candidateCountsMatchSearchReceipt'],
  }),
  row({
    rowId: 'repair:blocked-and-no-worthy-posture',
    purpose:
      'Record deterministic repair posture for blocked readiness, no-worthy-fit, missing assets, missing proof, missing measurement, missing readback, or accepted-Need gaps.',
    sourceRoots: [SOURCE_ROOTS.runtime, SOURCE_ROOTS.runtimeTest, SOURCE_ROOTS.depositorySearchTest],
    emittedTypes: ['ReadFitsFindingRepairPosture'],
    requiredEvidence: ['accept_read_need', 'repair_candidate_proof', 'adjust_need_constraints_or_thresholds'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind Gate 5 closure to package tests, protocol artifact tests, docs, scripts, workflow wiring, and V39 source-safety checks.',
    sourceRoots: [SOURCE_ROOTS.runtimeTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V39ReadFitsFindingRuntime'],
    requiredEvidence: ['check-v39-gate5-read-fits-finding-runtime.mjs', 'v39-read-fits-finding-runtime'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const runtime = readSource(repoRoot, SOURCE_ROOTS.runtime);
  const runtimeTest = readSource(repoRoot, SOURCE_ROOTS.runtimeTest);
  const search = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const searchTest = readSource(repoRoot, SOURCE_ROOTS.depositorySearchTest);
  const supply = readSource(repoRoot, SOURCE_ROOTS.depositorySupplyIndex);
  const embedding = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    predicateResult('runtime-defines-core-types', SOURCE_ROOTS.runtime, runtime.includes('ReadFitsFindingRuntime') && runtime.includes('ReadFitsFindingReplayReceipt') && runtime.includes('ReadFitsFindingRepairPosture')),
    predicateResult('runtime-source-safety-boundary', SOURCE_ROOTS.runtime, runtime.includes('source_safe_read_fits_finding_runtime_metadata') && runtime.includes('protectedSourceVisible: false') && runtime.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('runtime-builds-replay-receipt', SOURCE_ROOTS.runtime, runtime.includes('source-safe-query-ranking-selected-fit-replay') && runtime.includes('candidateCountsMatchSearchReceipt') && runtime.includes('selectedFitProvenanceRootMatchesSearchReceipt')),
    predicateResult('runtime-persists-storage-projection', SOURCE_ROOTS.runtime, runtime.includes('persistReadFitsFindingRuntime') && runtime.includes("execution?.store?.('read/finding-fits'") && runtime.includes('sourceSafeCandidateRanking')),
    predicateResult('runtime-summarizes-contract', SOURCE_ROOTS.runtime, runtime.includes('summarizeReadFitsFindingRuntime') && runtime.includes('summarizeReadingPipelineContract')),
    predicateResult('package-exports-runtime', SOURCE_ROOTS.packageIndex, packageIndex.includes("export * from './read-fits-finding-runtime'") && packageJson.includes('./read-fits-finding-runtime')),
    predicateResult('asset-pack-preprocess-persists-runtime', SOURCE_ROOTS.packageIndex, packageIndex.includes('buildReadFitsFindingRuntime') && packageIndex.includes('persistReadFitsFindingRuntime') && packageIndex.includes('readFitsFindingReplayReceipt')),
    predicateResult('search-defines-many-fit-receipt', SOURCE_ROOTS.depositorySearch, search.includes('ReadFitsFindingSynthesisSearchReceipt') && search.includes('maxSelectedCandidates: 12') && search.includes('selectedFitProvenanceRootFor')),
    predicateResult('search-stores-tool-telemetry', SOURCE_ROOTS.depositorySearch, search.includes('ReadFitsFindingSynthesis.tool.lexical-depository-search') && search.includes('ReadFitsFindingSynthesis.tool.vector-depository-search') && search.includes("target.store('depository/search', 'searchReceipt'")),
    predicateResult('supply-index-handoff-present', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('depositorySupplyAssetsFromIndex') && supply.includes('sourceSafeMetadataOnly: true')),
    predicateResult('embedding-policy-preserved', SOURCE_ROOTS.embeddingConfig, embedding.includes("text-embedding-3-small") && embedding.includes('1536') && embedding.includes('match_deliverable_vectors') && embedding.includes('cosine')),
    predicateResult('contract-read-fits-counts', SOURCE_ROOTS.readingPipelineContract, contract.includes("READ_FITS_FINDING_SYNTHESIS = 'ReadFitsFindingSynthesis'") && contract.includes('ReadFitsFindingSynthesis.settle') && contract.includes('thinkingsGenerationIds')),
    predicateResult('tests-cover-runtime-many-fit', SOURCE_ROOTS.runtimeTest, runtimeTest.includes('many-fit search results') && runtimeTest.includes('fit-deposit-runtime-2') && runtimeTest.includes('source-safe runtime')),
    predicateResult('tests-cover-runtime-blocked-repair', SOURCE_ROOTS.runtimeTest, runtimeTest.includes('accepted_read_need_missing') && runtimeTest.includes('adjust_need_constraints_or_thresholds')),
    predicateResult('tests-cover-search-receipt-and-tool-telemetry', SOURCE_ROOTS.depositorySearchTest, searchTest.includes('searchReceipt') && searchTest.includes('toolTelemetry') && searchTest.includes("read/finding-fits")),
    predicateResult('spec-gate5-expanded', SOURCE_ROOTS.v39Spec, spec.includes('v39-read-fits-finding-runtime') && spec.includes('ReadFitsFindingReplayReceipt')),
    predicateResult('delta-gate5-expanded', SOURCE_ROOTS.v39Delta, delta.includes('Gate 5') && delta.includes('ReadFitsFindingRuntime')),
    predicateResult('notes-gate5-expanded', SOURCE_ROOTS.v39Notes, notes.includes('Gate 5 implementation notes') && notes.includes('source-safe replay receipt')),
    predicateResult('parity-gate5-expanded', SOURCE_ROOTS.v39Parity, parity.includes('Gate 5 Parity') && parity.includes('implemented')),
    predicateResult('roadmap-advanced-to-gate5', SOURCE_ROOTS.roadmap, roadmap.includes('V39 Gate 5 closure anchor') && roadmap.includes('ReadFitsFindingRuntime')),
    predicateResult('readmes-document-gate5', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 5') && assetPackReadme.includes('ReadFitsFinding Runtime') && protocolReadme.includes('V39ReadFitsFindingRuntime')),
    predicateResult('workflows-run-gate5-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate5-read-fits-finding-runtime.mjs') && canonWorkflow.includes('check-v39-gate5-read-fits-finding-runtime.mjs')),
  ];
}

export function buildV39ReadFitsFindingRuntime(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V39_READ_FITS_FINDING_RUNTIME_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v39-read-fits-finding-runtime:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v39-read-fits-finding-runtime',
    schemaId: V39_READ_FITS_FINDING_RUNTIME_SCHEMA_ID,
    version: V39_READ_FITS_FINDING_RUNTIME_VERSION,
    currentTarget: V39_READ_FITS_FINDING_RUNTIME_CURRENT_TARGET,
    sourceSafetyVerdict: V39_READ_FITS_FINDING_RUNTIME_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V39_READ_FITS_FINDING_RUNTIME_ROWS,
    rowIds: [...V39_READ_FITS_FINDING_RUNTIME_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V39_READ_FITS_FINDING_RUNTIME_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      pipelineName: 'ReadFitsFindingSynthesis',
      phaseCount: 7,
      ptrrAgentCount: 8,
      ptrrStepCount: 32,
      failsafeSequenceCount: 96,
      thricifiedGenerationCount: 96,
      searchChannelCount: 7,
      searchChannelIds: [
        'lexical',
        'symbolic',
        'path',
        'metadata',
        'measurement',
        'embedding-vector',
        'provider-specific',
      ],
      defaultMaxSelectedCandidates: 12,
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      embeddingDimensions: 1536,
      vectorDistanceMetric: 'cosine',
      vectorMatchRpc: 'match_deliverable_vectors',
      runtimeRecordKinds: [
        'accepted_need_admission',
        'query_plan',
        'search_channel',
        'candidate_ranking',
        'selected_fit_provenance',
        'fit_result',
        'replay_receipt',
        'repair_posture',
        'telemetry_receipt',
      ],
      acceptedNeedRequired: true,
      manyFitsDiscoveryCovered: true,
      replayReceiptCovered: true,
      repairPostureCovered: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      credentialsSerialized: false,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
