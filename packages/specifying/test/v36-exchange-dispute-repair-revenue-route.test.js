import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_DISPUTE_INCIDENT_CLASSES,
  EXCHANGE_DISPUTE_REPAIR_CASE_REQUIRED_FIELD_IDS,
  EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_ARTIFACT_PATH,
  EXCHANGE_REVENUE_ROUTE_REQUIRED_FIELD_IDS,
  EXCHANGE_REVENUE_ROUTE_STATES,
  buildExchangeDisputeRepairRevenueRoute,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangeDisputeRepairCase rows', () => {
  const report = buildExchangeDisputeRepairRevenueRoute({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v36-exchange-dispute-repair-revenue-route');
  assert.equal(report.schemaId, 'bitcode.v36.exchangeDisputeRepairRevenueRoute.v1');
  assert.equal(report.version, 'V36');
  assert.equal(report.currentTarget, 'V35');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-exchange-dispute-repair-revenue-route-metadata');
  assert.equal(report.coverage.disputeCaseCount, EXCHANGE_DISPUTE_INCIDENT_CLASSES.length);
  assert.deepEqual(report.coverage.missingIncidentClasses, []);
  assert.equal(report.coverage.allRequiredIncidentClassesCovered, true);
  assert.equal(report.coverage.staleOwnerCovered, true);
  assert.equal(report.coverage.cancelledOrderReplayCovered, true);
  assert.equal(report.coverage.underpaymentCovered, true);
  assert.equal(report.coverage.overpaymentCovered, true);
  assert.equal(report.coverage.projectionDriftCovered, true);
  assert.equal(report.coverage.sourceLeakageCovered, true);
  assert.equal(report.coverage.deliveryMismatchCovered, true);
  assert.equal(report.coverage.repairCommandsSourceSafe, true);
  assert.equal(report.coverage.verificationCommandsSourceSafe, true);
  assert.equal(report.coverage.runbooksProofRootedSourceSafe, true);
  assert.equal(report.coverage.escalationPathsCovered, true);
  assert.equal(report.coverage.disputeProofRootsCovered, true);
  assert.equal(report.coverage.disputeEventIdsCovered, true);
  assert.deepEqual(report.requiredIncidentClasses, EXCHANGE_DISPUTE_INCIDENT_CLASSES);
  assert.deepEqual(report.disputeCaseRequiredFieldIds, EXCHANGE_DISPUTE_REPAIR_CASE_REQUIRED_FIELD_IDS);

  for (const incidentClass of EXCHANGE_DISPUTE_INCIDENT_CLASSES) {
    assert.equal(report.disputeCases.some((row) => row.incidentClass === incidentClass), true, `missing ${incidentClass}`);
  }

  for (const row of report.disputeCases) {
    assert.equal(row.canonicalObject, 'ExchangeDisputeRepairCase');
    assert.match(row.disputeCaseRoot, /^exchange-dispute-repair-case:[a-f0-9]{24}$/u);
    assert.equal(row.affectedOrder.orderId.length > 0, true);
    assert.equal(row.affectedSettlement.settlementReceiptId.length > 0, true);
    assert.equal(row.affectedProjection.projectionTrust, 'ledger_journal_outranks_database_and_object_storage_projection');
    assert.equal(row.repairCommand.sourceSafe, true);
    assert.equal(row.repairCommand.proofRooted, true);
    assert.equal(row.verificationCommand.sourceSafe, true);
    assert.equal(row.verificationCommand.proofRooted, true);
    assert.equal(row.runbook.sourceSafe, true);
    assert.equal(row.runbook.proofRooted, true);
    assert.equal(row.escalationPath.customerDisclosure, 'source_safe_status_no_protected_source_no_wallet_private_material');
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^(exchange-proof|exchange-dispute-affected-state):[a-f0-9]{24}$/u);
    }
  }
});

test('builds source-safe V36 ExchangeRevenueRoute rows with conservation proofs', () => {
  const report = buildExchangeDisputeRepairRevenueRoute({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.coverage.revenueRouteCount, EXCHANGE_REVENUE_ROUTE_STATES.length);
  assert.deepEqual(report.coverage.missingRevenueRouteStates, []);
  assert.equal(report.coverage.allRequiredRevenueRouteStatesCovered, true);
  assert.equal(report.coverage.depositorReaderTreasuryFeeRoutesCovered, true);
  assert.equal(report.coverage.btcRouteCovered, true);
  assert.equal(report.coverage.btdRightRouteCovered, true);
  assert.equal(report.coverage.sourceToSharesRouteCovered, true);
  assert.equal(report.coverage.conservationProofCovered, true);
  assert.equal(report.coverage.revenueProofRootsCovered, true);
  assert.equal(report.coverage.revenueEventIdsCovered, true);
  assert.deepEqual(report.requiredRevenueRouteStates, EXCHANGE_REVENUE_ROUTE_STATES);
  assert.deepEqual(report.revenueRouteRequiredFieldIds, EXCHANGE_REVENUE_ROUTE_REQUIRED_FIELD_IDS);

  for (const routeState of EXCHANGE_REVENUE_ROUTE_STATES) {
    assert.equal(report.revenueRoutes.some((row) => row.routeState === routeState), true, `missing ${routeState}`);
  }

  for (const row of report.revenueRoutes) {
    assert.equal(row.canonicalObject, 'ExchangeRevenueRoute');
    assert.match(row.revenueRouteRoot, /^exchange-revenue-route:[a-f0-9]{24}$/u);
    assert.equal(row.treasuryAccount.accountId, 'account:bitcode-treasury');
    assert.equal(row.depositorAccount.principal.startsWith('principal:'), true);
    assert.equal(row.readerAccount.principal.startsWith('principal:'), true);
    assert.equal(row.feeAccount.accountId, 'account:exchange-fee');
    assert.equal(row.btcRoute.routeCurrency, 'BTC');
    assert.equal(row.btdRightRoute.btdRangeId, row.btdRangeId);
    assert.equal(row.sourceToSharesRoute.sourceShareConservationBps, 10_000);
    assert.equal(row.conservationProof.btcDebitsEqualCredits, true);
    assert.equal(row.conservationProof.btdRightsConserved, true);
    assert.equal(row.conservationProof.sourceShareConservationBps, 10_000);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('private_payment_credentials'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^(exchange-proof|exchange-revenue-conservation-proof):[a-f0-9]{24}$/u);
    }
  }

  assert.equal(report.operationalBoundary.exchangeDisputeRepairCaseCovers, 'stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch');
  assert.equal(report.operationalBoundary.exchangeRevenueRouteCovers, 'depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof');
  assert.equal(report.operationalBoundary.repairRunbookBinding, 'runbooks and repair commands are source-safe and proof-rooted');
  assert.equal(EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_ARTIFACT_PATH, '.bitcode/v36-exchange-dispute-repair-revenue-route.json');
  assert.match(report.artifactRoot, /^exchange-dispute-repair-revenue-route:[a-f0-9]{24}$/u);
});
