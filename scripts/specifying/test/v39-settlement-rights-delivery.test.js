import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V39_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH,
  V39_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS,
  V39_SETTLEMENT_RIGHTS_DELIVERY_ROWS,
  V39_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID,
  V39_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
  buildV39SettlementRightsDelivery,
} from '../src/canonical/v39-settlement-rights-delivery.js';

test('V39 settlement rights delivery report binds payment, rights, compensation, sync, and delivery', () => {
  const report = buildV39SettlementRightsDelivery();

  assert.equal(V39_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH, '.bitcode/v39-settlement-rights-delivery.json');
  assert.equal(report.artifactId, 'v39-settlement-rights-delivery');
  assert.equal(report.schemaId, V39_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS]);
  assert.equal(report.rows.length, V39_SETTLEMENT_RIGHTS_DELIVERY_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.runtimeType, 'AssetPackSettlementRightsDeliveryBoundary');
  assert.equal(report.coverage.paymentType, 'AssetPackSettlementPaymentObservation');
  assert.equal(report.coverage.rightsTransferType, 'BtdRightsTransferReceipt');
  assert.equal(report.coverage.sourceToSharesType, 'SourceToSharesProof');
  assert.equal(report.coverage.reconciliationType, 'LedgerDatabaseReconciliationReport');
  assert.equal(report.coverage.deliveryType, 'AssetPackDeliveryUnlockReceipt');
  assert.ok(report.coverage.storageRecordKinds.includes('btd_rights_transfer'));
  assert.ok(report.coverage.requiredReadbacksBeforeUnlock.includes('source_to_shares_compensation'));
  assert.equal(report.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(report.coverage.confirmedPaymentCovered, true);
  assert.equal(report.coverage.underpaymentBlockedCovered, true);
  assert.equal(report.coverage.finalityBlockedCovered, true);
  assert.equal(report.coverage.reconciliationRepairCovered, true);
  assert.equal(report.coverage.btdRightsTransferCovered, true);
  assert.equal(report.coverage.sourceToSharesCovered, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-settlement-rights-delivery:'));
});

test('V39 settlement rights delivery rows remain source-safe metadata only', () => {
  for (const row of V39_SETTLEMENT_RIGHTS_DELIVERY_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-settlement-rights-delivery-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_settlement_rights_delivery_boundary');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('settlement-private-payloads'));
  }
});
