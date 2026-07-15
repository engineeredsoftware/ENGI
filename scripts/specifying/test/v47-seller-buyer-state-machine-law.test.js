import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_IP_BUYER_STATE_IDS,
  V47_IP_SELLER_STATE_IDS,
  V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH,
  V47_SELLER_BUYER_STATE_MACHINE_LAW_SCHEMA_ID,
  V47_SELLER_BUYER_STATE_MACHINE_LAW_SOURCE_SAFETY_VERDICT,
  V47_SELLER_BUYER_STATE_MACHINE_ROWS,
  V47_STATE_MACHINE_FORBIDDEN_PAYLOAD_IDS,
  V47_STATE_MACHINE_GUARD_IDS,
  V47_STATE_MACHINE_MEASUREMENT_IDS,
  V47_STATE_MACHINE_SOURCE_SAFE_FIELD_IDS,
  buildV47SellerBuyerStateMachineLaw,
} from '../src/canonical/v47-seller-buyer-state-machine-law.js';

test('V47 seller/buyer state-machine law binds both commercial profiles', () => {
  const report = buildV47SellerBuyerStateMachineLaw();

  assert.equal(V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH, '.bitcode/v47-seller-buyer-state-machine-law.json');
  assert.equal(report.artifactId, 'v47-seller-buyer-state-machine-law');
  assert.equal(report.schemaId, V47_SELLER_BUYER_STATE_MACHINE_LAW_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_SELLER_BUYER_STATE_MACHINE_LAW_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-seller-buyer-state-machine-law:'));
  assert.deepEqual(report.sellerStateIds, [...V47_IP_SELLER_STATE_IDS]);
  assert.deepEqual(report.buyerStateIds, [...V47_IP_BUYER_STATE_IDS]);
  assert.deepEqual(report.guardIds, [...V47_STATE_MACHINE_GUARD_IDS]);
  assert.deepEqual(report.measurementIds, [...V47_STATE_MACHINE_MEASUREMENT_IDS]);
  assert.deepEqual(report.sourceSafeFieldIds, [...V47_STATE_MACHINE_SOURCE_SAFE_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_STATE_MACHINE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.stateRows.length, V47_SELLER_BUYER_STATE_MACHINE_ROWS.length);
  assert.ok(report.stateRows.some((row) => row.rowId === 'seller-state-machine' && row.route === '/deposit'));
  assert.ok(report.stateRows.some((row) => row.rowId === 'buyer-state-machine' && row.route === '/read'));
  assert.ok(report.stateRows.some((row) => row.rowId === 'packs-history-and-repair' && row.route === '/packs'));
});

test('V47 seller/buyer state-machine law preserves source-safe guards', () => {
  const report = buildV47SellerBuyerStateMachineLaw();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.sellerStateMachineBound, true);
  assert.equal(report.coverage.buyerStateMachineBound, true);
  assert.equal(report.coverage.measurementBeforePrice, true);
  assert.equal(report.coverage.proofBeforeStateTransition, true);
  assert.equal(report.coverage.sourceSafePreviewBeforeSettlement, true);
  assert.equal(report.coverage.acceptedNeedBeforeFindingFits, true);
  assert.equal(report.coverage.finalityBeforeBtdRights, true);
  assert.equal(report.coverage.btdRightsBeforeSourceDelivery, true);
  assert.equal(report.coverage.packsHistoryProjectionAfterEachTransition, true);
  assert.equal(report.coverage.repairFailClosed, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
