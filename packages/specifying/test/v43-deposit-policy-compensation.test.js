import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH,
  V43_DEPOSIT_POLICY_COMPENSATION_SCHEMA_ID,
  V43_DEPOSIT_POLICY_COMPENSATION_SOURCE_SAFETY_VERDICT,
  V43_DEPOSIT_POLICY_FIELD_IDS,
  V43_DEPOSIT_POLICY_FORBIDDEN_PAYLOAD_IDS,
  V43_DEPOSIT_POLICY_OBJECT_IDS,
  buildV43DepositPolicyCompensation,
} from '../src/canonical/v43-deposit-policy-compensation.js';

test('V43 deposit policy compensation artifact binds source-safe policy contracts', () => {
  const report = buildV43DepositPolicyCompensation();

  assert.equal(V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH, '.bitcode/v43-deposit-policy-compensation.json');
  assert.equal(report.artifactId, 'v43-deposit-policy-compensation');
  assert.equal(report.schemaId, V43_DEPOSIT_POLICY_COMPENSATION_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_DEPOSIT_POLICY_COMPENSATION_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-deposit-policy-compensation:'));
  assert.deepEqual(report.objectIds, [...V43_DEPOSIT_POLICY_OBJECT_IDS]);
  assert.deepEqual(report.fieldIds, [...V43_DEPOSIT_POLICY_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V43_DEPOSIT_POLICY_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 4);
  assert.equal(report.coverage.depositPolicyImplemented, true);
  assert.equal(report.coverage.criticalityPolicyImplemented, true);
  assert.equal(report.coverage.criticalSourceBlockedBeforeAdmission, true);
  assert.equal(report.coverage.demandPolicyImplemented, true);
  assert.equal(report.coverage.roiPolicyImplemented, true);
  assert.equal(report.coverage.btdPotentialEstimateOnly, true);
  assert.equal(report.coverage.compensationPolicyImplemented, true);
  assert.equal(report.coverage.compensationPriceAsset, 'BTC');
  assert.equal(report.coverage.compensationAllocationMethod, 'source-to-shares-largest-remainder');
  assert.equal(report.coverage.btdMintRequiresFutureNeedFitSettlement, true);
  assert.equal(report.coverage.admissionAndIndexingDeferredToGate7, true);
  assert.equal(report.coverage.routePolicyReadbackImplemented, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
});
