// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_READFITSFINDING_PREVIEW_QUOTE_ARTIFACT_PATH =
  '.bitcode/v42-readfitsfinding-preview-quote.json';
export const V42_READFITSFINDING_PREVIEW_QUOTE_SCHEMA_ID =
  'bitcode.v42.readFitsFindingPreviewQuote.v1';
export const V42_READFITSFINDING_PREVIEW_QUOTE_VERSION = 'V42';
export const V42_READFITSFINDING_PREVIEW_QUOTE_CURRENT_TARGET = 'V41';
export const V42_READFITSFINDING_PREVIEW_QUOTE_SOURCE_SAFETY_VERDICT =
  'source-safe-readfitsfinding-preview-quote-metadata';

export const V42_READFITSFINDING_PREVIEW_QUOTE_ROW_IDS = Object.freeze([
  'admission:accepted-need-required',
  'search:many-candidate-depository-discovery',
  'search:multi-channel-vector-provider-tooling',
  'ranking:candidate-ranking-and-thresholds',
  'provenance:selected-fit-provenance',
  'preview:source-safe-assetpack-preview',
  'quote:deterministic-share-to-fee-btc-quote',
  'disclosure:no-pre-settlement-source',
  'settlement:instructions-before-rights-transfer',
  'route:harness-preview-quote-summary',
  'ui:terminal-preview-quote-provenance-readback',
  'proof:tests-artifact-workflow',
]);

const SOURCE_ROOTS = Object.freeze({
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  readFitsFindingRuntime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  assetPackPreviewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  depositorySearchTest: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
  runtimeTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
  previewBoundaryTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
  postprocessTest: 'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
  harnessRunner: 'uapi/app/api/pipeline-host/asset-pack/runner.ts',
  harnessRouteTest: 'uapi/tests/api/pipelineHostRoute.test.ts',
  terminalWorkbench: 'uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
  terminalHarnessClient: 'uapi/app/terminal/terminal-pipeline-host-client.ts',
  terminalHarnessClientTest: 'uapi/tests/terminalPipelineHarnessClient.test.ts',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  v42Spec: 'BITCODE_SPEC_V42.md',
  v42Delta: 'BITCODE_SPEC_V42_DELTA.md',
  v42Notes: 'BITCODE_SPEC_V42_NOTES.md',
  v42Parity: 'BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  terminalReadme: 'uapi/app/terminal/README.md',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'packages/protocol/README.md',
});

const SEARCH_CHANNEL_IDS = Object.freeze([
  'lexical',
  'symbolic',
  'path',
  'metadata',
  'measurement',
  'embedding-vector',
  'provider-specific',
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

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-readfitsfinding-preview-quote-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_readfitsfinding_preview_quote_metadata',
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

export const V42_READFITSFINDING_PREVIEW_QUOTE_ROWS = Object.freeze([
  row({
    rowId: 'admission:accepted-need-required',
    purpose:
      'Require an accepted ReadNeedComprehensionSynthesis Need before ReadFitsFindingSynthesis can search or preview an AssetPack.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readFitsFindingRuntime, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['ReadFitsFindingAdmission', 'accepted_need_admission'],
    requiredEvidence: ['accepted_read_need_missing', 'findingFitsAdmission', 'acceptedNeed'],
  }),
  row({
    rowId: 'search:many-candidate-depository-discovery',
    purpose:
      'Search Depository AssetPack supply for many candidates above threshold before selecting the fit set.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.depositorySearchTest],
    emittedTypes: ['DepositorySearchResult', 'DepositoryCandidate'],
    requiredEvidence: ['searchedAssetCount', 'candidateRanking', 'maxSelectedCandidates'],
  }),
  row({
    rowId: 'search:multi-channel-vector-provider-tooling',
    purpose:
      'Bind lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific search channels to source-safe tool receipts.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.readFitsFindingRuntime],
    emittedTypes: ['ReadFitsFindingSynthesisSearchReceipt', 'DepositorySearchQueryPlan'],
    requiredEvidence: [...SEARCH_CHANNEL_IDS, 'ReadFitsFindingSynthesis.tool.vector-depository-search'],
  }),
  row({
    rowId: 'ranking:candidate-ranking-and-thresholds',
    purpose:
      'Rank candidates with deterministic scores, thresholds, blockers, rejected counts, and proof/measurement requirements.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.depositorySearchTest],
    emittedTypes: ['DepositoryCandidateRanking', 'DepositoryCandidateFitEvidence'],
    requiredEvidence: ['finalScore', 'semanticScore', 'proofScore', 'measurementScore', 'rejectedCandidateCount'],
  }),
  row({
    rowId: 'provenance:selected-fit-provenance',
    purpose:
      'Persist selected fit provenance with selected candidate ids, fit deposit ids, proof roots, measurement roots, and reconciliation roots.',
    sourceRoots: [SOURCE_ROOTS.readFitsFindingRuntime, SOURCE_ROOTS.assetPackPreviewBoundary, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['selected_fit_provenance', 'AssetPackPreviewSelectedFitProvenance'],
    requiredEvidence: ['selectedFitProvenanceRoot', 'fitDepositAssetIds', 'reconciliationReadbackRoot'],
  }),
  row({
    rowId: 'preview:source-safe-assetpack-preview',
    purpose:
      'Create the source-safe AssetPack preview that exposes measurements, fit posture, roots, and delivery posture while source stays locked.',
    sourceRoots: [SOURCE_ROOTS.assetPackPreviewBoundary, SOURCE_ROOTS.readNeed, SOURCE_ROOTS.previewBoundaryTest],
    emittedTypes: ['AssetPackSourceSafePreview', 'AssetPackPreviewBoundary'],
    requiredEvidence: ['sourceSafePreview', 'AssetPackPreviewBoundary', 'sourceBearingDeliveryVisible'],
  }),
  row({
    rowId: 'quote:deterministic-share-to-fee-btc-quote',
    purpose:
      'Read back deterministic BTD/BTC quote calculation from measurement weight, measurement volume, admitted fit quality, dust floor, and minimum sats.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.assetPackPreviewBoundary, SOURCE_ROOTS.previewBoundaryTest],
    emittedTypes: ['ShareToFeeQuote', 'AssetPackPreviewQuoteReceipt'],
    requiredEvidence: ['sum(measurement.weight * measurement.volume * admitted_fit_quality)', 'deterministic', 'quoteRoot'],
  }),
  row({
    rowId: 'disclosure:no-pre-settlement-source',
    purpose:
      'Fail closed when preview, telemetry, route summary, or UI readback would expose protected source or unpaid AssetPack source before settlement.',
    sourceRoots: [SOURCE_ROOTS.assetPackPreviewBoundary, SOURCE_ROOTS.harnessRunner, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['AssetPackDisclosureReview', 'AssetPackPreviewBoundarySourceSafety'],
    requiredEvidence: ['protectedSourceVisible: false', 'unpaidAssetPackSourceVisible: false', 'credentialsSerialized: false'],
  }),
  row({
    rowId: 'settlement:instructions-before-rights-transfer',
    purpose:
      'Expose source-safe settlement instructions and delivery lock before Gate 6 rights-transfer and repository delivery unlock.',
    sourceRoots: [SOURCE_ROOTS.assetPackPreviewBoundary, SOURCE_ROOTS.previewBoundaryTest],
    emittedTypes: ['AssetPackPreviewSettlementInstructions', 'AssetPackPreviewDeliveryPosture'],
    requiredEvidence: ['quote_ready_settlement_required', 'reader_wallet_authorized_before_broadcast', 'withheld_until_settlement'],
  }),
  row({
    rowId: 'route:harness-preview-quote-summary',
    purpose:
      'Summarize preview boundary, quote receipt, selected-fit provenance, settlement instructions, delivery posture, and disclosure review through the pipeline harness route without source payloads.',
    sourceRoots: [SOURCE_ROOTS.harnessRunner, SOURCE_ROOTS.harnessRouteTest],
    emittedTypes: ['assetPackPreviewBoundary', 'assetPackQuoteReceipt', 'assetPackSettlementInstructions', 'assetPackDeliveryPosture'],
    requiredEvidence: ['summarizeAssetPackPreviewBoundary', 'assetPackPreviewBoundary', 'storageRecordCount'],
  }),
  row({
    rowId: 'ui:terminal-preview-quote-provenance-readback',
    purpose:
      'Render Terminal Finding Fits preview, quote, provenance, settlement, delivery, and replay roots as expandable source-safe metadata.',
    sourceRoots: [SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalHarnessClient, SOURCE_ROOTS.terminalHarnessClientTest],
    emittedTypes: ['assetPackPreviewBoundaryRows', 'TerminalReadFitsFindingSynthesisHarnessStreamSnapshot'],
    requiredEvidence: ['Finding Fits preview, quote, and provenance', 'quote_ready_settlement_required', 'withheld_until_settlement'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind V42 Gate 5 closure to package tests, UAPI tests, protocol artifact tests, docs, scripts, workflows, and generated source-safe proof.',
    sourceRoots: [
      SOURCE_ROOTS.depositorySearchTest,
      SOURCE_ROOTS.runtimeTest,
      SOURCE_ROOTS.previewBoundaryTest,
      SOURCE_ROOTS.harnessRouteTest,
      SOURCE_ROOTS.gateWorkflow,
      SOURCE_ROOTS.canonWorkflow,
      SOURCE_ROOTS.v42Spec,
      SOURCE_ROOTS.v42Parity,
      SOURCE_ROOTS.roadmap,
    ],
    emittedTypes: ['V42ReadFitsFindingPreviewQuote'],
    requiredEvidence: ['check-v42-gate5-readfitsfinding-preview-quote.mjs', 'v42-readfitsfinding-preview-quote'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const runtime = readSource(repoRoot, SOURCE_ROOTS.readFitsFindingRuntime);
  const previewBoundary = readSource(repoRoot, SOURCE_ROOTS.assetPackPreviewBoundary);
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const depositorySearchTest = readSource(repoRoot, SOURCE_ROOTS.depositorySearchTest);
  const runtimeTest = readSource(repoRoot, SOURCE_ROOTS.runtimeTest);
  const previewBoundaryTest = readSource(repoRoot, SOURCE_ROOTS.previewBoundaryTest);
  const postprocessTest = readSource(repoRoot, SOURCE_ROOTS.postprocessTest);
  const harnessRunner = readSource(repoRoot, SOURCE_ROOTS.harnessRunner);
  const harnessRouteTest = readSource(repoRoot, SOURCE_ROOTS.harnessRouteTest);
  const terminalWorkbench = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);
  const terminalHarnessClient = readSource(repoRoot, SOURCE_ROOTS.terminalHarnessClient);
  const terminalHarnessClientTest = readSource(repoRoot, SOURCE_ROOTS.terminalHarnessClientTest);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v42Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v42Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v42Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v42Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const terminalReadme = readSource(repoRoot, SOURCE_ROOTS.terminalReadme);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);

  return [
    predicateResult('accepted-need-gates-finding-fits', SOURCE_ROOTS.readFitsFindingRuntime, runtime.includes('admitReadFitsFinding') && runtime.includes('accepted_need_admission') && runtime.includes('accept_read_need')),
    predicateResult('search-defines-many-channel-ids', SOURCE_ROOTS.depositorySearch, SEARCH_CHANNEL_IDS.every((id) => depositorySearch.includes(`'${id}'`))),
    predicateResult('search-defines-tool-ids', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('ReadFitsFindingSynthesis.tool.lexical-depository-search') && depositorySearch.includes('ReadFitsFindingSynthesis.tool.vector-depository-search')),
    predicateResult('search-covers-provider-embedding-policy', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('embeddingPolicy') && depositorySearch.includes('providerIds') && depositorySearch.includes('selectedFitProvenanceRoot')),
    predicateResult('search-tests-many-candidates', SOURCE_ROOTS.depositorySearchTest, depositorySearchTest.includes('discovers every qualifying fit deposit') && depositorySearchTest.includes('selectedFitProvenanceRoot')),
    predicateResult('runtime-persists-selected-fit-provenance', SOURCE_ROOTS.readFitsFindingRuntime, runtime.includes('selected_fit_provenance') && runtime.includes('ReadFitsFindingReplayReceipt') && runtime.includes('persistReadFitsFindingRuntime')),
    predicateResult('runtime-telemetry-counts', SOURCE_ROOTS.readFitsFindingRuntime, runtime.includes('phaseIds') && runtime.includes('failsafeSequenceIds') && runtime.includes('thinkingsGenerationIds')),
    predicateResult('runtime-tests-source-safe-counts', SOURCE_ROOTS.runtimeTest, runtimeTest.includes('source_safe_read_fits_finding_runtime_metadata') && runtimeTest.includes('thinkingsGenerationIds') && runtimeTest.includes('fitDepositAssetIds')),
    predicateResult('preview-boundary-defines-quote-provenance-settlement-delivery', SOURCE_ROOTS.assetPackPreviewBoundary, previewBoundary.includes('AssetPackPreviewQuoteReceipt') && previewBoundary.includes('AssetPackPreviewSelectedFitProvenance') && previewBoundary.includes('AssetPackPreviewSettlementInstructions') && previewBoundary.includes('AssetPackPreviewDeliveryPosture')),
    predicateResult('preview-boundary-source-safety', SOURCE_ROOTS.assetPackPreviewBoundary, previewBoundary.includes('source_safe_assetpack_preview_quote_boundary') && previewBoundary.includes('unpaidAssetPackSourceVisible: false') && previewBoundary.includes('walletPrivateMaterialVisible: false')),
    predicateResult('quote-formula-implemented', SOURCE_ROOTS.readNeed, readNeed.includes('sum(measurement.weight * measurement.volume * admitted_fit_quality)') && readNeed.includes('weightedAdmittedVolume') && readNeed.includes('minimumSats')),
    predicateResult('preview-tests-cover-determinism-and-storage-safety', SOURCE_ROOTS.previewBoundaryTest, previewBoundaryTest.includes('deterministic') && previewBoundaryTest.includes('quoteRoot') && previewBoundaryTest.includes('unpaidAssetPackSourceVisible')),
    predicateResult('package-postprocess-surfaces-boundary', SOURCE_ROOTS.postprocess, packageIndex.includes('assetPackPreviewBoundary') && postprocess.includes('assetPackQuoteReceipt') && postprocessTest.includes('assetPackPreviewBoundary')),
    predicateResult('contract-keeps-readfitsfinding-topology', SOURCE_ROOTS.readingPipelineContract, contract.includes('ReadFitsFindingSynthesis.discovery') && contract.includes('ptrrStepCount') && contract.includes('thinkingsGenerationCount')),
    predicateResult('harness-route-summarizes-preview-boundary', SOURCE_ROOTS.harnessRunner, harnessRunner.includes('summarizeAssetPackPreviewBoundary') && harnessRunner.includes('assetPackQuoteReceipt') && harnessRunner.includes('assetPackSettlementInstructions') && harnessRunner.includes('assetPackDeliveryPosture')),
    predicateResult('harness-route-tests-preview-boundary-summary', SOURCE_ROOTS.harnessRouteTest, harnessRouteTest.includes('asset-pack-preview-boundary-route-test') && harnessRouteTest.includes('quote_ready_settlement_required') && harnessRouteTest.includes('storageRecordCount')),
    predicateResult('terminal-ui-renders-preview-boundary-rows', SOURCE_ROOTS.terminalWorkbench, terminalWorkbench.includes('assetPackPreviewBoundaryRows') && terminalWorkbench.includes('Finding Fits preview, quote, and provenance') && terminalWorkbench.includes('assetPackSettlementInstructions')),
    predicateResult('terminal-client-summarizes-boundary', SOURCE_ROOTS.terminalHarnessClient, terminalHarnessClient.includes('boundaryQuoteReceipt') && terminalHarnessClient.includes('boundarySelectedFitProvenance') && terminalHarnessClient.includes('boundaryDeliveryPosture')),
    predicateResult('terminal-client-tests-boundary-summary', SOURCE_ROOTS.terminalHarnessClientTest, terminalHarnessClientTest.includes('assetPackPreviewBoundary') && terminalHarnessClientTest.includes('delivery withheld_until_settlement')),
    predicateResult('spec-gate5-expanded', SOURCE_ROOTS.v42Spec, spec.includes('V42 Gate 5') && spec.includes('v42-readfitsfinding-preview-quote')),
    predicateResult('delta-gate5-expanded', SOURCE_ROOTS.v42Delta, delta.includes('Gate 5') && delta.includes('source-safe AssetPack preview')),
    predicateResult('notes-gate5-expanded', SOURCE_ROOTS.v42Notes, notes.includes('Gate 5 implementation notes') && notes.includes('selected-fit provenance')),
    predicateResult('parity-gate5-implemented', SOURCE_ROOTS.v42Parity, parity.includes('Finding Fits preview and quote') && parity.includes('implemented')),
    predicateResult('roadmap-advanced-to-gate5', SOURCE_ROOTS.roadmap, roadmap.includes('V42 Gate 5 closure anchor') && roadmap.includes('AssetPackPreviewBoundary')),
    predicateResult('readmes-document-gate5', SOURCE_ROOTS.rootReadme, rootReadme.includes('V42 Gate 5') && terminalReadme.includes('Finding Fits preview') && assetPackReadme.includes('V42 Gate 5') && protocolReadme.includes('V42ReadFitsFindingPreviewQuote')),
    predicateResult('workflows-run-gate5-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v42-gate5-readfitsfinding-preview-quote.mjs') && canonWorkflow.includes('check-v42-gate5-readfitsfinding-preview-quote.mjs')),
  ];
}

export function buildV42ReadFitsFindingPreviewQuote(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V42_READFITSFINDING_PREVIEW_QUOTE_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v42-readfitsfinding-preview-quote:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v42-readfitsfinding-preview-quote',
    schemaId: V42_READFITSFINDING_PREVIEW_QUOTE_SCHEMA_ID,
    version: V42_READFITSFINDING_PREVIEW_QUOTE_VERSION,
    currentTarget: V42_READFITSFINDING_PREVIEW_QUOTE_CURRENT_TARGET,
    sourceSafetyVerdict: V42_READFITSFINDING_PREVIEW_QUOTE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V42_READFITSFINDING_PREVIEW_QUOTE_ROWS,
    rowIds: [...V42_READFITSFINDING_PREVIEW_QUOTE_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V42_READFITSFINDING_PREVIEW_QUOTE_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      pipelineName: 'ReadFitsFindingSynthesis',
      requiredPriorPipelineName: 'ReadNeedComprehensionSynthesis',
      phaseCount: 7,
      agentCount: 8,
      ptrrStepCount: 32,
      failsafeSequenceCount: 96,
      thricifiedGenerationCount: 96,
      searchChannelIds: [...SEARCH_CHANNEL_IDS],
      selectedFitProvenanceRequired: true,
      sourceSafePreviewRequired: true,
      deterministicQuoteRequired: true,
      noProtectedSourceBeforeSettlement: true,
      settlementInstructionsRequired: true,
      terminalPreviewQuoteReadbackCovered: true,
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
