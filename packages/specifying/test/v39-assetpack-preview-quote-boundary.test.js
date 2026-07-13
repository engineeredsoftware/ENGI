import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ARTIFACT_PATH,
  V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROW_IDS,
  V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROWS,
  V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SCHEMA_ID,
  V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SOURCE_SAFETY_VERDICT,
  buildV39AssetPackPreviewQuoteBoundary,
} from '../src/canonical/v39-assetpack-preview-quote-boundary.js';

test('V39 AssetPack preview quote boundary report binds source-safe preview, quote, settlement, and delivery lock', () => {
  const report = buildV39AssetPackPreviewQuoteBoundary();

  assert.equal(V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ARTIFACT_PATH, '.bitcode/v39-assetpack-preview-quote-boundary.json');
  assert.equal(report.artifactId, 'v39-assetpack-preview-quote-boundary');
  assert.equal(report.schemaId, V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROW_IDS]);
  assert.equal(report.rows.length, V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.runtimeType, 'AssetPackPreviewBoundary');
  assert.equal(report.coverage.quoteType, 'AssetPackPreviewQuoteReceipt');
  assert.equal(report.coverage.disclosureType, 'AssetPackDisclosureReview');
  assert.equal(report.coverage.shareToFeeFormula, 'sum(measurement.weight * measurement.volume * admitted_fit_quality)');
  assert.equal(report.coverage.satsPerWeightedVolume, 1000);
  assert.equal(report.coverage.minimumSats, 546);
  assert.equal(report.coverage.dustFloorSats, 546);
  assert.equal(report.coverage.btcFeeOperation, 'reader_wallet_authorized_before_broadcast');
  assert.ok(report.coverage.storageRecordKinds.includes('deterministic_btc_quote'));
  assert.ok(report.coverage.requiredReadbacksBeforeUnlock.includes('btd_rights_transfer_receipt'));
  assert.ok(report.coverage.withheldBeforeSettlement.includes('source-bearing manifest entries'));
  assert.equal(report.coverage.quoteDeterminismCovered, true);
  assert.equal(report.coverage.disclosureLeakScanCovered, true);
  assert.equal(report.coverage.settlementInstructionsCovered, true);
  assert.equal(report.coverage.deliveryPostureCovered, true);
  assert.equal(report.coverage.replayReceiptCovered, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-assetpack-preview-quote-boundary:'));
});

test('V39 AssetPack preview quote boundary rows remain source-safe metadata only', () => {
  for (const row of V39_ASSETPACK_PREVIEW_QUOTE_BOUNDARY_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-assetpack-preview-quote-boundary-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_assetpack_preview_quote_boundary');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
