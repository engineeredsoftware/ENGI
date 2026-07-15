import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH,
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_REQUIRED_RECEIPT_FIELDS,
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROW_IDS,
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS,
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SCHEMA_ID,
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SOURCE_SAFETY_VERDICT,
  buildV38AssetPackSynthesisEconomicTraceability,
} from '../src/canonical/assetpack-synthesis-economic-traceability.js';

test('V38 AssetPack synthesis economic traceability report binds handoff, preview, receipts, and reconciliation', () => {
  const report = buildV38AssetPackSynthesisEconomicTraceability();

  assert.equal(
    V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH,
    '.proofs/v38/assetpack-synthesis-economic-traceability.json',
  );
  assert.equal(report.artifactId, 'v38-assetpack-synthesis-economic-traceability');
  assert.equal(report.schemaId, V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SCHEMA_ID);
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.sourceSafetyVerdict, V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROW_IDS]);
  assert.deepEqual(
    report.requiredReceiptFields,
    [...V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_REQUIRED_RECEIPT_FIELDS],
  );
  assert.equal(report.rows.length, V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.selectedFitsToAssetPackSynthesisCovered, true);
  assert.equal(report.coverage.sourceSafePreviewBeforeSettlementCovered, true);
  assert.equal(report.coverage.protectedSourceLeakScanCovered, true);
  assert.equal(report.coverage.deterministicShareToFeeQuoteCovered, true);
  assert.equal(report.coverage.btdMintReadRightsReceiptsCovered, true);
  assert.equal(report.coverage.contributorCompensationCovered, true);
  assert.equal(report.coverage.settlementUnlockAndDeliveryBoundaryCovered, true);
  assert.equal(report.coverage.ledgerDatabaseSynchronizationCovered, true);
  assert.equal(report.coverage.proofReceiptsCovered, true);
  assert.equal(report.coverage.repairPathsCovered, true);
  assert.equal(report.coverage.sourceToSharesConservationCovered, true);
  assert.equal(report.coverage.harnessEvidenceProjectionCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.privateSettlementPayloadVisible, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v38-assetpack-synthesis-economic-traceability:'));
});

test('V38 AssetPack synthesis economic traceability rows remain source-safe metadata', () => {
  const rowIds = V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS.map((row) => row.rowId);

  assert.deepEqual(rowIds, [...V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROW_IDS]);
  for (const row of V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ROWS) {
    assert.ok(row.rowRoot.startsWith('v38-assetpack-economic-traceability-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_assetpack_synthesis_economic_traceability_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.privateSettlementPayloadVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected_source_payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
    assert.ok(row.forbiddenPayloadClasses.includes('settlement_private_payloads'));
  }
});
