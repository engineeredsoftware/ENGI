// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH =
  '.proofs/v38/assetpack-synthesis-economic-traceability.json';
export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SCHEMA_ID =
  'bitcode.v38.assetPackSynthesisEconomicTraceability.v1';
export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_VERSION = 'V38';
export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_CURRENT_TARGET = 'V37';
export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SOURCE_SAFETY_VERDICT =
  'source-safe-assetpack-synthesis-economic-traceability-metadata';

export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROW_IDS = Object.freeze([
  'handoff:selected-fits-to-assetpack-synthesis',
  'preview:source-safe-before-settlement',
  'disclosure:protected-source-leak-scan',
  'pricing:share-to-fee-preview',
  'receipts:btd-assetpack-mint-read-rights',
  'compensation:source-to-shares-contributor-allocation',
  'settlement:unlock-and-post-settlement-delivery',
  'reconciliation:ledger-database-object-storage-repair',
  'harness:evidence-and-telemetry-projection',
]);

export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_REQUIRED_RECEIPT_FIELDS = Object.freeze([
  'acceptedNeedRoot',
  'findingFitsResultRoot',
  'selectedFitProvenanceRoot',
  'assetPackId',
  'sourceSafePreviewRoot',
  'feeQuoteRoot',
  'sourceManifestRoot',
  'accessPolicyHash',
  'btdRange',
  'btcFeeReceiptId',
  'assetPackMintReceiptRoot',
  'readReceiptRoot',
  'rightsTransferReceiptRoot',
  'settlementConservationRoot',
  'ledgerProjectionRoot',
  'deliveryAdmissionRoot',
  'repairPlanRoot',
  'telemetryRoot',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'global_ledger_authority_claim',
]);

const SOURCE_ROOTS = Object.freeze({
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  disclosure: 'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  readingContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  harness: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
  harnessTest: 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  sourceToShares: 'packages/btd/src/source-to-shares.ts',
  reconciliation: 'packages/btd/src/reconciliation.ts',
  btdEconomicTraceabilityTest: 'packages/btd/__tests__/asset-pack-economic-traceability.test.ts',
  btdSourceToSharesTest: 'packages/btd/__tests__/source-to-shares.test.ts',
  btdReconciliationTest: 'packages/btd/__tests__/reconciliation.test.ts',
  btdSettlementTest: 'packages/btd/__tests__/btd.test.ts',
  assetPackPostprocessTest: 'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
  assetPackDisclosureTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
  gate5Disclosure: 'scripts/specifying/src/canonical/inference-telemetry-disclosure-report.js',
  gate6ReadNeed: 'scripts/specifying/src/canonical/read-need-comprehension-inference-hardening.js',
  gate7Search: 'scripts/specifying/src/canonical/read-fits-finding-search-embeddings.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-assetpack-economic-traceability-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_assetpack_synthesis_economic_traceability_metadata',
    protectedSourceVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS = Object.freeze([
  row({
    rowId: 'handoff:selected-fits-to-assetpack-synthesis',
    phaseId: 'ReadFitsFindingSynthesis.implementation',
    purpose:
      'Carry selected fit deposit ids, selected candidate ids, query roots, ranking roots, proof roots, and selected-fit provenance roots into AssetPack synthesis.',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.readingContract, SOURCE_ROOTS.postprocess],
    receiptFields: [
      'acceptedNeedRoot',
      'findingFitsResultRoot',
      'selectedFitProvenanceRoot',
      'assetPackId',
      'telemetryRoot',
    ],
    evidenceKinds: ['DepositoryFitResultEvidence', 'ReadFitsFindingSynthesisSearchReceipt'],
  }),
  row({
    rowId: 'preview:source-safe-before-settlement',
    phaseId: 'ReadFitsFindingSynthesis.preview',
    purpose:
      'Build a reader-visible preview with measurements, roots, fit ids, score posture, BTC quote, and withheld protected source before settlement.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.postprocess],
    receiptFields: [
      'assetPackId',
      'sourceSafePreviewRoot',
      'feeQuoteRoot',
      'sourceManifestRoot',
      'accessPolicyHash',
    ],
    evidenceKinds: ['AssetPackSourceSafePreview', 'ShareToFeeQuote'],
  }),
  row({
    rowId: 'disclosure:protected-source-leak-scan',
    phaseId: 'ReadFitsFindingSynthesis.preview',
    purpose:
      'Fail closed if preview or disclosure metadata carries protected source fields, patch markers, credentials, or unpaid AssetPack source.',
    sourceRoots: [SOURCE_ROOTS.disclosure, SOURCE_ROOTS.assetPackDisclosureTest],
    receiptFields: ['sourceSafePreviewRoot', 'accessPolicyHash'],
    evidenceKinds: ['AssetPackDisclosureReview'],
  }),
  row({
    rowId: 'pricing:share-to-fee-preview',
    phaseId: 'ReadFitsFindingSynthesis.preview',
    purpose:
      'Derive a deterministic BTC fee quote from Need measurement weights, requested volume, admitted fit quality, minimum sats, and dust floor.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.assetPackPostprocessTest],
    receiptFields: ['acceptedNeedRoot', 'feeQuoteRoot'],
    evidenceKinds: ['ShareToFeeQuote'],
  }),
  row({
    rowId: 'receipts:btd-assetpack-mint-read-rights',
    phaseId: 'ReadFitsFindingSynthesis.settle',
    purpose:
      'Bind source-safe preview, finding-fits result, BTD mint range, read receipt, and rights transfer receipts with protected source locked until paid unlock.',
    sourceRoots: [SOURCE_ROOTS.btdReceipts, SOURCE_ROOTS.btdEconomicTraceabilityTest],
    receiptFields: [
      'assetPackMintReceiptRoot',
      'readReceiptRoot',
      'rightsTransferReceiptRoot',
      'sourceSafePreviewRoot',
      'deliveryAdmissionRoot',
    ],
    evidenceKinds: ['BtdAssetPackMintReceipt', 'BtdReadReceipt', 'BtdRightsTransferReceipt'],
  }),
  row({
    rowId: 'compensation:source-to-shares-contributor-allocation',
    phaseId: 'ReadFitsFindingSynthesis.settle',
    purpose:
      'Allocate fit-deposit contributor shares and BTC sats using largest-remainder basis-point normalization and conservation checks.',
    sourceRoots: [SOURCE_ROOTS.sourceToShares, SOURCE_ROOTS.btdSourceToSharesTest],
    receiptFields: [
      'findingFitsResultRoot',
      'settlementConservationRoot',
      'btcFeeReceiptId',
      'feeQuoteRoot',
    ],
    evidenceKinds: ['SourceToSharesProof', 'SourceToSharesSettlementConservation'],
  }),
  row({
    rowId: 'settlement:unlock-and-post-settlement-delivery',
    phaseId: 'ReadFitsFindingSynthesis.settle',
    purpose:
      'Unlock protected source and pull-request delivery only when BTC fee, BTD range, ownership/license rows, BTD journal, ledger anchor, and database readback agree.',
    sourceRoots: [SOURCE_ROOTS.btdSettlement, SOURCE_ROOTS.btdSettlementTest, SOURCE_ROOTS.harness],
    receiptFields: [
      'btcFeeReceiptId',
      'ledgerProjectionRoot',
      'deliveryAdmissionRoot',
      'readReceiptRoot',
      'rightsTransferReceiptRoot',
    ],
    evidenceKinds: ['AssetPackSettlementUnlock'],
  }),
  row({
    rowId: 'reconciliation:ledger-database-object-storage-repair',
    phaseId: 'ReadFitsFindingSynthesis.settle',
    purpose:
      'Reconcile ledger facts, database projections, object-storage artifacts, private facts, staging-testnet readback, settlement conservation, and repair actions.',
    sourceRoots: [SOURCE_ROOTS.reconciliation, SOURCE_ROOTS.btdReconciliationTest],
    receiptFields: ['ledgerProjectionRoot', 'repairPlanRoot', 'settlementConservationRoot'],
    evidenceKinds: ['LedgerDatabaseReconciliationReport', 'ProjectionRepairReceipt'],
  }),
  row({
    rowId: 'harness:evidence-and-telemetry-projection',
    phaseId: 'ReadFitsFindingSynthesis.settle',
    purpose:
      'Project source-safe preview, disclosure review, ledger settlement, reconciliation, execution summary, and telemetry into harness evidence without serializing protected payloads.',
    sourceRoots: [SOURCE_ROOTS.harness, SOURCE_ROOTS.harnessTest],
    receiptFields: [
      'sourceSafePreviewRoot',
      'assetPackMintReceiptRoot',
      'readReceiptRoot',
      'rightsTransferReceiptRoot',
      'telemetryRoot',
    ],
    evidenceKinds: ['PipelineHarnessEvidence'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const disclosure = readSource(repoRoot, SOURCE_ROOTS.disclosure);
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const readingContract = readSource(repoRoot, SOURCE_ROOTS.readingContract);
  const harness = readSource(repoRoot, SOURCE_ROOTS.harness);
  const harnessTest = readSource(repoRoot, SOURCE_ROOTS.harnessTest);
  const btdReceipts = readSource(repoRoot, SOURCE_ROOTS.btdReceipts);
  const btdSettlement = readSource(repoRoot, SOURCE_ROOTS.btdSettlement);
  const sourceToShares = readSource(repoRoot, SOURCE_ROOTS.sourceToShares);
  const reconciliation = readSource(repoRoot, SOURCE_ROOTS.reconciliation);
  const btdEconomicTraceabilityTest = readSource(repoRoot, SOURCE_ROOTS.btdEconomicTraceabilityTest);
  const btdSourceToSharesTest = readSource(repoRoot, SOURCE_ROOTS.btdSourceToSharesTest);
  const btdReconciliationTest = readSource(repoRoot, SOURCE_ROOTS.btdReconciliationTest);
  const btdSettlementTest = readSource(repoRoot, SOURCE_ROOTS.btdSettlementTest);
  const assetPackPostprocessTest = readSource(repoRoot, SOURCE_ROOTS.assetPackPostprocessTest);
  const assetPackDisclosureTest = readSource(repoRoot, SOURCE_ROOTS.assetPackDisclosureTest);

  return [
    predicateResult('search-carries-selected-fit-provenance-root', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('selectedFitProvenanceRoot') && depositorySearch.includes('fitDepositAssetIds')),
    predicateResult('contract-carries-fits-into-assetpack-synthesis', SOURCE_ROOTS.readingContract, readingContract.includes('depositorySearchResult') && readingContract.includes('fitDepositAssetIds') && readingContract.includes('fitDeposits')),
    predicateResult('postprocess-builds-source-safe-preview-from-fit-result', SOURCE_ROOTS.postprocess, postprocess.includes('ensureAssetPackSourceSafePreview') && postprocess.includes("execution.store('asset-pack/preview', 'sourceSafe'")),
    predicateResult('postprocess-stores-fee-quote-and-disclosure-review', SOURCE_ROOTS.postprocess, postprocess.includes("execution.store('asset-pack/preview', 'feeQuote'") && postprocess.includes("execution.store('asset-pack/preview', 'disclosureReview'")),
    predicateResult('read-need-builds-share-to-fee-preview', SOURCE_ROOTS.readNeed, readNeed.includes('buildShareToFeePreview') && readNeed.includes('weightedAdmittedVolume') && readNeed.includes('satsPerWeightedVolume') && readNeed.includes('dustFloorSats')),
    predicateResult('read-need-preview-withholds-protected-source', SOURCE_ROOTS.readNeed, readNeed.includes("protectedSourceDisclosure: 'forbidden_before_settlement'") && readNeed.includes('withheldBeforeSettlement') && readNeed.includes('protected source content')),
    predicateResult('read-need-preview-binds-roots', SOURCE_ROOTS.readNeed, readNeed.includes('previewRoot') && readNeed.includes('sourceManifestRoot') && readNeed.includes('proofRoot') && readNeed.includes('accessPolicyHash')),
    predicateResult('disclosure-review-scans-source-leakage', SOURCE_ROOTS.disclosure, disclosure.includes('reviewAssetPackProtectedSourceLeakage') && disclosure.includes('assertAssetPackDisclosureSourceSafe')),
    predicateResult('btd-receipts-define-mint-read-rights-transfer', SOURCE_ROOTS.btdReceipts, btdReceipts.includes('buildBtdAssetPackMintReceipt') && btdReceipts.includes('buildBtdReadReceipt') && btdReceipts.includes('buildBtdRightsTransferReceipt')),
    predicateResult('btd-receipts-lock-preview-before-settlement', SOURCE_ROOTS.btdReceipts, btdReceipts.includes("disclosureState: 'source_safe_preview'") && btdReceipts.includes('Protected source cannot be visible before paid unlock')),
    predicateResult('btd-rights-transfer-requires-confirmed-btc', SOURCE_ROOTS.btdReceipts, btdReceipts.includes("btcFeeFinalityState !== 'confirmed'") && btdReceipts.includes('Rights transfer receipt requires confirmed BTC fee finality')),
    predicateResult('source-to-shares-builds-proof', SOURCE_ROOTS.sourceToShares, sourceToShares.includes('buildSourceToSharesProof') && sourceToShares.includes('SourceToSharesFitDepositInput')),
    predicateResult('source-to-shares-normalizes-basis-points', SOURCE_ROOTS.sourceToShares, sourceToShares.includes("method: 'largest_remainder'") && sourceToShares.includes('normalizedTotalBps')),
    predicateResult('source-to-shares-conserves-settlement-sats', SOURCE_ROOTS.sourceToShares, sourceToShares.includes('allocatedSats !== proof.feeQuote.grossSats') && sourceToShares.includes('settlementConservation')),
    predicateResult('settlement-unlock-requires-readback-keys', SOURCE_ROOTS.btdSettlement, btdSettlement.includes('REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS') && btdSettlement.includes('missingReadbackKeys')),
    predicateResult('settlement-unlock-applies-to-preview', SOURCE_ROOTS.btdSettlement, btdSettlement.includes('applyAssetPackSettlementUnlockToPreview') && btdSettlement.includes('sourceAvailable')),
    predicateResult('reconciliation-handles-ledger-database-storage', SOURCE_ROOTS.reconciliation, reconciliation.includes('reconcileLedgerDatabaseProjection') && reconciliation.includes('objectStorageArtifacts') && reconciliation.includes('databaseFacts')),
    predicateResult('reconciliation-has-repair-actions', SOURCE_ROOTS.reconciliation, reconciliation.includes('ProjectionRepairReceipt') && reconciliation.includes('repairActions') && reconciliation.includes('pause_settlement_unlock')),
    predicateResult('reconciliation-blocks-secret-readback-values', SOURCE_ROOTS.reconciliation, reconciliation.includes('assertSecretFreeIdentifier') && reconciliation.includes('secretValuesStored: false')),
    predicateResult('harness-builds-btd-economic-receipts', SOURCE_ROOTS.harness, harness.includes('buildBtdAssetPackMintReceiptFn') && harness.includes('buildBtdReadReceiptFn') && harness.includes('rightsTransferReceipt')),
    predicateResult('harness-builds-ledger-database-reconciliation', SOURCE_ROOTS.harness, harness.includes('reconcileLedgerDatabaseProjection') && harness.includes("execution.store('asset-pack/settlement', 'ledgerDatabaseReconciliation'")),
    predicateResult('harness-projects-settlement-unlock-and-disclosure', SOURCE_ROOTS.harness, harness.includes('buildAssetPackSettlementUnlock') && harness.includes('applyAssetPackSettlementUnlockToPreview') && harness.includes('assetPackDisclosureReview')),
    predicateResult('harness-evidence-carries-economic-traceability', SOURCE_ROOTS.harness, harness.includes('ledgerSettlement') && harness.includes('ledgerDatabaseReconciliation') && harness.includes('sourceSafePreview') && harness.includes('assetPackDisclosureReview')),
    predicateResult('harness-test-covers-economic-harness-source', SOURCE_ROOTS.harnessTest, harnessTest.includes('ledgerSettlement,') && harnessTest.includes('ledgerDatabaseReconciliation,') && harnessTest.includes('repairActionCount')),
    predicateResult('asset-pack-postprocess-test-covers-preview', SOURCE_ROOTS.assetPackPostprocessTest, assetPackPostprocessTest.includes('derives and stores source-safe preview evidence') && assetPackPostprocessTest.includes('fitDepositAssetIds') && assetPackPostprocessTest.includes('feeQuote')),
    predicateResult('asset-pack-disclosure-test-covers-leak-scan', SOURCE_ROOTS.assetPackDisclosureTest, assetPackDisclosureTest.includes('fails closed when preview metadata carries protected source markers')),
    predicateResult('btd-economic-traceability-test-covers-full-chain', SOURCE_ROOTS.btdEconomicTraceabilityTest, btdEconomicTraceabilityTest.includes('binds selected fits through preview, receipts, settlement, and reconciliation') && btdEconomicTraceabilityTest.includes('buildSourceToSharesProof')),
    predicateResult('btd-source-to-shares-test-covers-compensation', SOURCE_ROOTS.btdSourceToSharesTest, btdSourceToSharesTest.includes('exact BTC allocation') && btdSourceToSharesTest.includes('settlementAdmissible')),
    predicateResult('btd-reconciliation-test-covers-repair', SOURCE_ROOTS.btdReconciliationTest, btdReconciliationTest.includes('repair actions that block unlock') && btdReconciliationTest.includes('secretValuesStored')),
    predicateResult('btd-settlement-test-covers-unlock-boundary', SOURCE_ROOTS.btdSettlementTest, btdSettlementTest.includes('unlocks protected source only after settlement') && btdSettlementTest.includes('keeps protected source withheld')),
  ];
}

function upstreamRoot(artifact, prefix) {
  if (!artifact?.artifactRoot) return `${prefix}:missing`;
  return artifact.artifactRoot;
}

export function buildV38AssetPackSynthesisEconomicTraceability(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  const gate5 = readJson(repoRoot, '.proofs/v38/disclosure-boundary-report.json');
  const gate6 = readJson(repoRoot, '.proofs/v38/read-need-comprehension-inference-hardening.json');
  const gate7 = readJson(repoRoot, '.proofs/v38/read-fits-finding-search-embeddings.json');
  const rowRoots = V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v38-assetpack-synthesis-economic-traceability:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
    gate5: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
    gate6: upstreamRoot(gate6, 'v38-read-need-comprehension-hardening'),
    gate7: upstreamRoot(gate7, 'v38-read-fits-finding-search'),
  }))}`;

  return {
    artifactId: 'v38-assetpack-synthesis-economic-traceability',
    schemaId: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SCHEMA_ID,
    version: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_VERSION,
    currentTarget: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_CURRENT_TARGET,
    sourceSafetyVerdict: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS,
    rowIds: [...V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROW_IDS],
    requiredReceiptFields: [...V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_REQUIRED_RECEIPT_FIELDS],
    predicateResults,
    coverage: {
      rowCount: V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      gate5DisclosureRoot: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
      gate6ReadNeedRoot: upstreamRoot(gate6, 'v38-read-need-comprehension-hardening'),
      gate7ReadFitsFindingSearchRoot: upstreamRoot(gate7, 'v38-read-fits-finding-search'),
      selectedFitsToAssetPackSynthesisCovered: true,
      sourceSafePreviewBeforeSettlementCovered: true,
      protectedSourceLeakScanCovered: true,
      deterministicShareToFeeQuoteCovered: true,
      btdMintReadRightsReceiptsCovered: true,
      contributorCompensationCovered: true,
      settlementUnlockAndDeliveryBoundaryCovered: true,
      ledgerDatabaseSynchronizationCovered: true,
      proofReceiptsCovered: true,
      repairPathsCovered: true,
      sourceToSharesConservationCovered: true,
      harnessEvidenceProjectionCovered: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
