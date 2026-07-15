// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ARTIFACT_PATH =
  '.bitcode/v39-assetpack-preview-quote-boundary.json';
export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SCHEMA_ID =
  'bitcode.v39.assetPackPreviewQuoteBoundary.v1';
export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_VERSION = 'V39';
export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_CURRENT_TARGET = 'V38';
export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SOURCE_SAFETY_VERDICT =
  'source-safe-assetpack-preview-quote-boundary';

export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROW_IDS = Object.freeze([
  'preview:source-safe-measurement',
  'quote:deterministic-share-to-fee',
  'disclosure:leak-scan-fail-closed',
  'settlement:reader-payment-unlock-instructions',
  'delivery:source-withheld-pr-posture',
  'provenance:selected-fit-measurement-roots',
  'storage:preview-boundary-projection',
  'replay:quote-preview-disclosure-receipt',
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
  boundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  boundaryTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
  disclosure: 'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
  disclosureTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  postprocessTest: 'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
  readFitsRuntime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'scripts/specifying/README.md',
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
  return `v39-assetpack-preview-quote-boundary-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_assetpack_preview_quote_boundary',
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

export const V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROWS = Object.freeze([
  row({
    rowId: 'preview:source-safe-measurement',
    purpose:
      'Expose only source-safe Need measurement, fit measurement, score band, result reasons, proof roots, and selected fit-deposit ids before settlement.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackSourceSafePreview', 'AssetPackPreviewBoundary'],
    requiredEvidence: ['protectedSourceDisclosure', 'weightedAdmittedVolume', 'scoreBand', 'fitDepositAssetIds'],
  }),
  row({
    rowId: 'quote:deterministic-share-to-fee',
    purpose:
      'Calculate deterministic BTC fee quotes from Need measurement vector, admitted fit quality, weighted volume, dust floor, and fee schedule.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['ShareToFeeQuote', 'AssetPackPreviewQuoteReceipt'],
    requiredEvidence: ['sum(measurement.weight * measurement.volume * admitted_fit_quality)', 'minimumSats', 'dustFloorSats', 'quoteRoot'],
  }),
  row({
    rowId: 'disclosure:leak-scan-fail-closed',
    purpose:
      'Fail closed when preview payloads contain source-bearing field names, patch markers, source code markers, secrets, or unpaid AssetPack source.',
    sourceRoots: [SOURCE_ROOTS.disclosure, SOURCE_ROOTS.boundary, SOURCE_ROOTS.disclosureTest, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackDisclosureReview', 'AssetPackProtectedSourceLeakageReview'],
    requiredEvidence: ['assertAssetPackDisclosureSourceSafe', 'protectedSourceDetected', 'forbidden_source_field'],
  }),
  row({
    rowId: 'settlement:reader-payment-unlock-instructions',
    purpose:
      'Tell the Reader exactly which BTC payment and readback receipts must exist before any source-bearing AssetPack content unlocks.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackPreviewSettlementInstructions'],
    requiredEvidence: ['reader_wallet_authorized_before_broadcast', 'btd_rights_transfer_receipt', 'ledger_database_storage_reconciliation'],
  }),
  row({
    rowId: 'delivery:source-withheld-pr-posture',
    purpose:
      'Project pull-request delivery posture as visible-after-settlement while keeping source-bearing delivery invisible during unpaid preview.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.postprocess, SOURCE_ROOTS.postprocessTest],
    emittedTypes: ['AssetPackPreviewDeliveryPosture'],
    requiredEvidence: ['withheld_until_settlement', 'sourceBearingDeliveryVisible: false', 'pull_request_after_settlement'],
  }),
  row({
    rowId: 'provenance:selected-fit-measurement-roots',
    purpose:
      'Carry selected fit-deposit asset ids, proof roots, measurement roots, readback roots, query root, and ranking root into the preview boundary.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.readFitsRuntime, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackPreviewSelectedFitProvenance'],
    requiredEvidence: ['selectedFitProvenance', 'measurementRoot', 'reconciliationReadbackRoot'],
  }),
  row({
    rowId: 'storage:preview-boundary-projection',
    purpose:
      'Persist source-safe preview, fit measurement, selected-fit provenance, quote, disclosure, settlement, delivery, replay, and repair records.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.packageIndex, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackPreviewStorageRecord', 'persistAssetPackPreviewBoundary'],
    requiredEvidence: ['storageProjection', "execution?.store?.('asset-pack/preview'", 'quoteReceipt'],
  }),
  row({
    rowId: 'replay:quote-preview-disclosure-receipt',
    purpose:
      'Replay the preview boundary from preview root, quote root, disclosure root, settlement root, delivery root, and source-safety verification flags.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackPreviewReplayReceipt'],
    requiredEvidence: ['source-safe-preview-quote-disclosure-boundary-replay', 'quoteRootMatchesPreview', 'deliveryWithheldUntilSettlement'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind Gate 6 closure to package tests, protocol artifact tests, generated artifact, docs, package exports, and workflow wiring.',
    sourceRoots: [SOURCE_ROOTS.boundaryTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V39AssetPackPreviewQuoteBoundary'],
    requiredEvidence: ['check-v39-gate6-assetpack-preview-quote-boundary.mjs', 'v39-assetpack-preview-quote-boundary'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const boundary = readSource(repoRoot, SOURCE_ROOTS.boundary);
  const boundaryTest = readSource(repoRoot, SOURCE_ROOTS.boundaryTest);
  const disclosure = readSource(repoRoot, SOURCE_ROOTS.disclosure);
  const disclosureTest = readSource(repoRoot, SOURCE_ROOTS.disclosureTest);
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const postprocessTest = readSource(repoRoot, SOURCE_ROOTS.postprocessTest);
  const readFitsRuntime = readSource(repoRoot, SOURCE_ROOTS.readFitsRuntime);
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
    predicateResult('boundary-defines-core-types', SOURCE_ROOTS.boundary, boundary.includes('AssetPackPreviewBoundary') && boundary.includes('AssetPackPreviewQuoteReceipt') && boundary.includes('AssetPackPreviewSettlementInstructions')),
    predicateResult('boundary-source-safety-class', SOURCE_ROOTS.boundary, boundary.includes('source_safe_assetpack_preview_quote_boundary') && boundary.includes('unpaidAssetPackSourceVisible: false') && boundary.includes('walletPrivateMaterialVisible: false')),
    predicateResult('boundary-builds-deterministic-quote', SOURCE_ROOTS.boundary, boundary.includes('quoteReceiptFor') && boundary.includes('weightedRequestedVolume') && boundary.includes('quoteRoot')),
    predicateResult('read-need-share-to-fee-formula', SOURCE_ROOTS.readNeed, readNeed.includes('sum(measurement.weight * measurement.volume * admitted_fit_quality)') && readNeed.includes('satsPerWeightedVolume') && readNeed.includes('dustFloorSats')),
    predicateResult('boundary-builds-settlement-instructions', SOURCE_ROOTS.boundary, boundary.includes('reader_wallet_authorized_before_broadcast') && boundary.includes('btd_rights_transfer_receipt') && boundary.includes('ledger_database_storage_reconciliation')),
    predicateResult('boundary-builds-delivery-posture', SOURCE_ROOTS.boundary, boundary.includes('withheld_until_settlement') && boundary.includes('sourceBearingDeliveryVisible: false') && boundary.includes('pull_request_after_settlement')),
    predicateResult('boundary-builds-replay-receipt', SOURCE_ROOTS.boundary, boundary.includes('source-safe-preview-quote-disclosure-boundary-replay') && boundary.includes('quoteRootMatchesPreview') && boundary.includes('deliveryWithheldUntilSettlement')),
    predicateResult('boundary-persists-storage-projection', SOURCE_ROOTS.boundary, boundary.includes('persistAssetPackPreviewBoundary') && boundary.includes("execution?.store?.('asset-pack/preview'") && boundary.includes('storageProjection')),
    predicateResult('disclosure-fail-closed-scan', SOURCE_ROOTS.disclosure, disclosure.includes('FORBIDDEN_SOURCE_FIELD_NAMES') && disclosure.includes('SOURCE_PATCH_MARKERS') && disclosure.includes('assertAssetPackDisclosureSourceSafe')),
    predicateResult('postprocess-emits-boundary', SOURCE_ROOTS.postprocess, postprocess.includes('ensureAssetPackPreviewBoundary') && postprocess.includes('assetPackPreviewBoundary') && postprocess.includes('assetPackSettlementInstructions')),
    predicateResult('pipeline-preprocess-persists-boundary', SOURCE_ROOTS.packageIndex, packageIndex.includes('buildAssetPackPreviewBoundary') && packageIndex.includes('persistAssetPackPreviewBoundary') && packageIndex.includes('assetPackQuoteReceipt')),
    predicateResult('package-exports-boundary', SOURCE_ROOTS.packageJson, packageJson.includes('./asset-pack-preview-boundary') && packageIndex.includes("export * from './asset-pack-preview-boundary'")),
    predicateResult('tests-cover-deterministic-quote', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('deterministic BTC quote') && boundaryTest.includes('quoteRoot).toBe(repeated.quoteReceipt.quoteRoot')),
    predicateResult('tests-cover-blocked-repair', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('blocked preview repair posture') && boundaryTest.includes('adjust_need_constraints_or_thresholds')),
    predicateResult('tests-cover-leak-fail-closed', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('protectedSourceContent') && boundaryTest.includes('toThrow(/protected source/)') && disclosureTest.includes('source_patch_marker')),
    predicateResult('tests-cover-postprocess-boundary', SOURCE_ROOTS.postprocessTest, postprocessTest.includes('assetPackPreviewBoundary') && postprocessTest.includes('assetPackSettlementInstructions')),
    predicateResult('read-fits-runtime-provenance-available', SOURCE_ROOTS.readFitsRuntime, readFitsRuntime.includes('selectedFitProvenanceRoot') && readFitsRuntime.includes('fitResultEvidence')),
    predicateResult('spec-gate6-expanded', SOURCE_ROOTS.v39Spec, spec.includes('AssetPackPreviewBoundary') && spec.includes('v39-assetpack-preview-quote-boundary')),
    predicateResult('delta-gate6-expanded', SOURCE_ROOTS.v39Delta, delta.includes('Gate 6') && delta.includes('AssetPackPreviewQuoteReceipt')),
    predicateResult('notes-gate6-expanded', SOURCE_ROOTS.v39Notes, notes.includes('Gate 6 implementation notes') && notes.includes('source-safe AssetPack preview boundary')),
    predicateResult('parity-gate6-expanded', SOURCE_ROOTS.v39Parity, parity.includes('Gate 6 Parity') && parity.includes('AssetPackPreviewBoundary')),
    predicateResult(
      'roadmap-advanced-through-gate6',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V39 Gate 6 closure anchor') &&
        (/Current working gate: V39 Gate (?:7|8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V39 Commercial Reading Readiness') ||
          roadmap.includes('Recent V39 closure anchor')),
    ),
    predicateResult('readmes-document-gate6', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 6') && assetPackReadme.includes('AssetPack Preview Boundary') && protocolReadme.includes('V39AssetPackPreviewQuoteBoundary')),
    predicateResult('workflows-run-gate6-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate6-assetpack-preview-quote-boundary.mjs') && canonWorkflow.includes('check-v39-gate6-assetpack-preview-quote-boundary.mjs')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    sourceSafetyVerdict: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SOURCE_SAFETY_VERDICT,
    runtimeType: 'AssetPackPreviewBoundary',
    quoteType: 'AssetPackPreviewQuoteReceipt',
    disclosureType: 'AssetPackDisclosureReview',
    settlementType: 'AssetPackPreviewSettlementInstructions',
    deliveryType: 'AssetPackPreviewDeliveryPosture',
    replayType: 'AssetPackPreviewReplayReceipt',
    storageRecordKinds: [
      'source_safe_preview',
      'fit_measurement_preview',
      'selected_fit_provenance',
      'deterministic_btc_quote',
      'disclosure_review',
      'settlement_instructions',
      'delivery_posture',
      'replay_receipt',
      'repair_posture',
    ],
    shareToFeeFormula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
    satsPerWeightedVolume: 1000,
    minimumSats: 546,
    dustFloorSats: 546,
    btcFeeOperation: 'reader_wallet_authorized_before_broadcast',
    requiredReadbacksBeforeUnlock: [
      'btc_fee_payment_receipt',
      'settlement_finality_receipt',
      'btd_rights_transfer_receipt',
      'ledger_database_storage_reconciliation',
    ],
    visibleBeforeSettlement: [
      'need measurement',
      'fit measurement',
      'fit deposit ids',
      'roots',
      'score band',
      'BTC quote',
    ],
    withheldBeforeSettlement: [
      'protected source content',
      'full AssetPack patch',
      'source-bearing manifest entries',
      'licensed read payload',
    ],
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    quoteDeterminismCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-deterministic-quote' && predicate.passed),
    disclosureLeakScanCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-leak-fail-closed' && predicate.passed),
    settlementInstructionsCovered: predicateResults.some((predicate) => predicate.id === 'boundary-builds-settlement-instructions' && predicate.passed),
    deliveryPostureCovered: predicateResults.some((predicate) => predicate.id === 'boundary-builds-delivery-posture' && predicate.passed),
    replayReceiptCovered: predicateResults.some((predicate) => predicate.id === 'boundary-builds-replay-receipt' && predicate.passed),
    failedPredicateIds,
  };
}

export function buildV39AssetPackPreviewQuoteBoundary(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v39-assetpack-preview-quote-boundary:${digest(JSON.stringify({
    rowIds: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROW_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v39-assetpack-preview-quote-boundary',
    schemaId: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SCHEMA_ID,
    version: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_VERSION,
    currentTarget: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_CURRENT_TARGET,
    sourceSafetyVerdict: V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SOURCE_SAFETY_VERDICT,
    rowIds: [...V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
