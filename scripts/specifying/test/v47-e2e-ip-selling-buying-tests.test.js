import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_E2E_IP_EXCHANGE_SCENARIO_IDS,
  V47_E2E_IP_EXCHANGE_ROUTE_IDS,
  V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH,
  V47_E2E_IP_EXCHANGE_TESTS_ROWS,
  V47_E2E_IP_EXCHANGE_TESTS_SCHEMA_ID,
  V47_E2E_IP_EXCHANGE_TESTS_SOURCE_SAFETY_VERDICT,
  V47_E2E_IP_EXCHANGE_FORBIDDEN_PAYLOAD_IDS,
  V47_E2E_IP_EXCHANGE_VERIFICATION_IDS,
  buildV47E2eIpSellingBuyingTests,
} from '../src/canonical/v47-e2e-ip-selling-buying-tests.js';

test('V47 E2E IP selling/buying tests bind both sides of the exchange', () => {
  const report = buildV47E2eIpSellingBuyingTests();

  assert.equal(V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH, '.proofs/v47/e2e-ip-selling-buying-tests.json');
  assert.equal(report.artifactId, 'v47-e2e-ip-selling-buying-tests');
  assert.equal(report.schemaId, V47_E2E_IP_EXCHANGE_TESTS_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_E2E_IP_EXCHANGE_TESTS_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-e2e-ip-selling-buying-tests:'));
  assert.deepEqual(report.scenarioIds, [...V47_E2E_IP_EXCHANGE_SCENARIO_IDS]);
  assert.deepEqual(report.routeIds, [...V47_E2E_IP_EXCHANGE_ROUTE_IDS]);
  assert.deepEqual(report.verificationIds, [...V47_E2E_IP_EXCHANGE_VERIFICATION_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_E2E_IP_EXCHANGE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V47_E2E_IP_EXCHANGE_TESTS_ROWS.length);
  assert.ok(report.completionRows.some((row) => row.rowId === 'seller-flow-browser-proof' && row.route === '/deposit'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'buyer-flow-browser-proof' && row.route === '/read'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'packs-dashboard-browser-proof' && row.route === '/packs'));
});

test('V47 E2E IP selling/buying tests preserve source-safe launch boundaries', () => {
  const report = buildV47E2eIpSellingBuyingTests();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.sellerFlowProofComplete, true);
  assert.equal(report.coverage.buyerFlowProofComplete, true);
  assert.equal(report.coverage.packsDashboardProofComplete, true);
  assert.equal(report.coverage.deterministicMockHarnessComplete, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
