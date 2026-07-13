import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_SETTLEMENT_RECEIPT_STATES,
  EXCHANGE_SETTLEMENT_RECONCILIATION_ARTIFACT_PATH,
  EXCHANGE_SETTLEMENT_REQUIRED_FIELD_IDS,
  buildExchangeSettlementReconciliation,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangeSettlementReceipt rows', () => {
  const report = buildExchangeSettlementReconciliation({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v36-exchange-settlement-reconciliation');
  assert.equal(report.schemaId, 'bitcode.v36.exchangeSettlementReconciliation.v1');
  assert.equal(report.version, 'V36');
  assert.equal(report.currentTarget, 'V35');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-exchange-settlement-reconciliation-metadata');
  assert.equal(report.coverage.receiptCount, EXCHANGE_SETTLEMENT_RECEIPT_STATES.length);
  assert.deepEqual(report.coverage.missingRequiredReceiptStates, []);
  assert.equal(report.coverage.allRequiredReceiptStatesCovered, true);
  assert.equal(report.coverage.paymentObservationCovered, true);
  assert.equal(report.coverage.finalityStateCovered, true);
  assert.equal(report.coverage.rightsTransferReceiptCovered, true);
  assert.equal(report.coverage.ledgerDatabaseObjectStorageRootsCovered, true);
  assert.equal(report.coverage.deliveryStateCovered, true);
  assert.equal(report.coverage.repairIdCovered, true);
  assert.equal(report.coverage.observersRepairJobsCovered, true);
  assert.equal(report.coverage.databaseProjectionsReconcileToLedgerTruth, true);
  assert.equal(report.coverage.settlementFinalityAuditable, true);
  assert.equal(report.coverage.deliveryAuditable, true);
  assert.equal(report.coverage.proofRootsCovered, true);
  assert.equal(report.coverage.eventIdsCovered, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.privateWalletMaterialSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.match(report.artifactRoot, /^exchange-settlement-reconciliation:[a-f0-9]{24}$/u);
  assert.deepEqual(report.requiredReceiptStates, EXCHANGE_SETTLEMENT_RECEIPT_STATES);
  assert.deepEqual(report.requiredFieldIds, EXCHANGE_SETTLEMENT_REQUIRED_FIELD_IDS);

  for (const receiptState of EXCHANGE_SETTLEMENT_RECEIPT_STATES) {
    assert.equal(report.rows.some((row) => row.receiptState === receiptState), true, `missing ${receiptState}`);
  }

  for (const row of report.rows) {
    assert.equal(row.canonicalObject, 'ExchangeSettlementReceipt');
    assert.match(row.settlementReceiptRoot, /^exchange-settlement-receipt:[a-f0-9]{24}$/u);
    assert.equal(row.paymentObservation.observationId.length > 0, true);
    assert.equal(row.finalityState.auditable, true);
    assert.equal(row.rightsTransferReceipt.receiptId.length > 0, true);
    assert.match(row.ledgerRoot, /^exchange-ledger-root:[a-f0-9]{24}$/u);
    assert.match(row.databaseProjectionRoot, /^exchange-database-projection-root:[a-f0-9]{24}$/u);
    assert.match(row.objectStorageRoot, /^exchange-object-storage-root:[a-f0-9]{24}$/u);
    assert.equal(row.deliveryState.auditable, true);
    assert.equal(row.repairJob.repairId.length > 0, true);
    assert.equal(row.observerJobs.some((job) => job.reconciliationRule === 'database_projection_reconciles_to_ledger_truth'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^(exchange-proof|exchange-ledger-root):[a-f0-9]{24}$/u);
    }
  }

  assert.equal(EXCHANGE_SETTLEMENT_RECONCILIATION_ARTIFACT_PATH, '.bitcode/v36-exchange-settlement-reconciliation.json');
});

test('reconciles projections to ledger truth and audits delivery finality', () => {
  const report = buildExchangeSettlementReconciliation({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const finalized = report.rows.find((row) => row.receiptState === 'finalized_rights_transferred');
  const projectionRepair = report.rows.find((row) => row.receiptState === 'database_projection_repaired');
  const storageRepair = report.rows.find((row) => row.receiptState === 'object_storage_repaired');
  const blocked = report.rows.find((row) => row.receiptState === 'delivery_blocked_pending_repair');

  assert.ok(finalized);
  assert.equal(finalized.deliveryState.state, 'delivered_after_settlement');
  assert.equal(finalized.rightsTransferReceipt.rightsTransferState, 'rights_transfer_receipt_issued');

  assert.ok(projectionRepair);
  assert.equal(projectionRepair.reconciliationDecision, 'database_projection_reconciled_to_ledger_truth');
  assert.equal(projectionRepair.repairJob.repairRequired, true);

  assert.ok(storageRepair);
  assert.equal(storageRepair.reconciliationDecision, 'object_storage_projection_reconciled_to_settled_delivery_truth');

  assert.ok(blocked);
  assert.equal(blocked.deliveryState.state, 'blocked_missing_rights_transfer_receipt');
  assert.equal(blocked.deliveryState.protectedSourceVisibility, 'protected_source_hidden');
  assert.equal(blocked.failClosedConditions.includes('rights_transfer_receipt_missing'), true);

  assert.equal(
    report.reconciliationBoundary.settlementBinding,
    'payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id',
  );
  assert.equal(report.reconciliationBoundary.repairBinding, 'observers and repair jobs reconcile database projections to ledger truth');
  assert.equal(report.reconciliationBoundary.auditBinding, 'settlement finality and delivery are auditable');
});
