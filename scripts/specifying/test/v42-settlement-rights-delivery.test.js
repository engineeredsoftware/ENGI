import { test } from './era-pinned-superseded-routes.js';
import assert from 'node:assert/strict';
import {
  V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH,
  V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS,
  V42_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID,
  V42_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
  buildV42SettlementRightsDelivery,
} from '../src/canonical/v42-settlement-rights-delivery.js';

test('V42 settlement rights delivery proof is source-safe and complete', () => {
  const report = buildV42SettlementRightsDelivery();

  assert.equal(V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH, '.bitcode/v42-settlement-rights-delivery.json');
  assert.equal(report.artifactId, 'v42-settlement-rights-delivery');
  assert.equal(report.schemaId, V42_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID);
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.sourceSafetyVerdict, V42_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(report.rowIds, [...V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS]);
  assert.equal(report.coverage.rowCount, 11);
  assert.equal(report.coverage.runtimeType, 'AssetPackSettlementRightsDeliveryBoundary');
  assert.equal(report.coverage.paymentType, 'AssetPackSettlementPaymentObservation');
  assert.equal(report.coverage.finalityType, 'AssetPackSettlementFinalityReceipt');
  assert.equal(report.coverage.rightsTransferType, 'BtdRightsTransferReceipt');
  assert.equal(report.coverage.sourceToSharesType, 'SourceToSharesProof');
  assert.equal(report.coverage.reconciliationType, 'LedgerDatabaseReconciliationReport');
  assert.equal(report.coverage.deliveryType, 'AssetPackDeliveryUnlockReceipt');
  assert.equal(report.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourcePayloadSerialized, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.hostBoundaryMaterializationCovered, true);
  assert.equal(report.coverage.routeReadbackCovered, true);
  assert.equal(report.coverage.terminalReadbackCovered, true);
  assert.equal(report.coverage.confirmedPaymentCovered, true);
  assert.equal(report.coverage.underpaymentBlockedCovered, true);
  assert.equal(report.coverage.finalityBlockedCovered, true);
  assert.equal(report.coverage.reconciliationRepairCovered, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.equal(report.passed, true);
  assert.match(report.artifactRoot, /^v42-settlement-rights-delivery:/);
});

test('V42 settlement rights delivery rows cover purchase through post-settlement delivery', () => {
  const report = buildV42SettlementRightsDelivery();
  const rowIds = report.rows.map((row) => row.rowId);

  assert.deepEqual(rowIds, [...V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS]);
  assert.ok(rowIds.includes('purchase:quote-to-payment-observation'));
  assert.ok(rowIds.includes('rights:btd-read-right-transfer'));
  assert.ok(rowIds.includes('compensation:source-to-shares-conservation'));
  assert.ok(rowIds.includes('delivery:source-bearing-pull-request-unlock'));
  assert.ok(rowIds.includes('sync:ledger-database-object-storage-reconciliation'));
  assert.ok(rowIds.includes('route:harness-settlement-summary'));
  assert.ok(rowIds.includes('ui:terminal-settlement-readback'));
  for (const row of report.rows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(Array.isArray(row.requiredEvidence));
    assert.ok(row.requiredEvidence.length >= 2);
  }
});
