import { test } from './era-pinned-superseded-routes.js';
import assert from 'node:assert/strict';

import {
  V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH,
  V40_LEDGER_STORAGE_SYNC_CURRENT_TARGET,
  V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS,
  V40_LEDGER_STORAGE_SYNC_ROW_IDS,
  V40_LEDGER_STORAGE_SYNC_SCHEMA_ID,
  V40_LEDGER_STORAGE_SYNC_SOURCE_SAFETY_VERDICT,
  V40_LEDGER_STORAGE_SYNC_VERSION,
  buildV40LedgerStorageSync,
  listMissingV40LedgerStorageSyncSources,
} from '../src/canonical/v40-ledger-storage-sync.js';

test('V40 ledger/database/storage/wallet/delivery sync proof closes every row source-safely', () => {
  const proof = buildV40LedgerStorageSync();

  assert.equal(proof.artifactId, 'v40-ledger-storage-sync');
  assert.equal(proof.artifactPath, V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH);
  assert.equal(proof.schemaId, V40_LEDGER_STORAGE_SYNC_SCHEMA_ID);
  assert.equal(proof.version, V40_LEDGER_STORAGE_SYNC_VERSION);
  assert.equal(proof.currentTarget, V40_LEDGER_STORAGE_SYNC_CURRENT_TARGET);
  assert.equal(proof.sourceSafetyVerdict, V40_LEDGER_STORAGE_SYNC_SOURCE_SAFETY_VERDICT);
  assert.equal(proof.passed, true);
  assert.equal(proof.rows.length, V40_LEDGER_STORAGE_SYNC_ROW_IDS.length);
  assert.equal(proof.coverage.rowCount, V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS.rowCount);
  assert.equal(proof.coverage.coveredRowCount, V40_LEDGER_STORAGE_SYNC_EXPECTED_TOTALS.rowCount);
  assert.equal(proof.coverage.allCriticalSurfacesClosed, true);
  assert.deepEqual(proof.coverage.failedPredicateIds, []);

  assert.equal(proof.coverage.settlementFinalityWalletAuthorityCovered, true);
  assert.equal(proof.coverage.btdRightsProjectionCovered, true);
  assert.equal(proof.coverage.sourceToSharesConservationCovered, true);
  assert.equal(proof.coverage.ledgerDatabaseStorageReconciliationCovered, true);
  assert.equal(proof.coverage.storageLocksAndSourceSafeProjectionCovered, true);
  assert.equal(proof.coverage.postSettlementDeliveryUnlockCovered, true);
  assert.equal(proof.coverage.repairRecoveryCovered, true);
  assert.equal(proof.coverage.walletNoCustodyCovered, true);
  assert.equal(proof.coverage.terminalReadbackCovered, true);
  assert.equal(proof.coverage.noForbiddenPayloadsSerialized, true);

  assert.deepEqual(proof.requiredReadbacksBeforeUnlock, [
    'btc_payment_observation',
    'settlement_finality',
    'source_to_shares_compensation',
    'btd_rights_transfer',
    'ledger_database_storage_reconciliation',
  ]);

  for (const row of proof.rows) {
    assert.equal(row.verdict, 'covered');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.privateSettlementPayloadVisible, false);
  }
});

test('V40 ledger/storage sync proof lists no missing source roots', () => {
  assert.deepEqual(listMissingV40LedgerStorageSyncSources(), []);
});
