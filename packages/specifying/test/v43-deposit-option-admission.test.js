import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_DEPOSIT_OPTION_ADMISSION_ARTIFACT_PATH,
  V43_DEPOSIT_OPTION_ADMISSION_FIELD_IDS,
  V43_DEPOSIT_OPTION_ADMISSION_FORBIDDEN_PAYLOAD_IDS,
  V43_DEPOSIT_OPTION_ADMISSION_OBJECT_IDS,
  V43_DEPOSIT_OPTION_ADMISSION_SCHEMA_ID,
  V43_DEPOSIT_OPTION_ADMISSION_SOURCE_SAFETY_VERDICT,
  buildV43DepositOptionAdmission,
} from '../src/canonical/v43-deposit-option-admission.js';

test('V43 deposit option admission artifact binds source-safe admission contracts', () => {
  const report = buildV43DepositOptionAdmission();

  assert.equal(V43_DEPOSIT_OPTION_ADMISSION_ARTIFACT_PATH, '.bitcode/v43-deposit-option-admission.json');
  assert.equal(report.artifactId, 'v43-deposit-option-admission');
  assert.equal(report.schemaId, V43_DEPOSIT_OPTION_ADMISSION_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_DEPOSIT_OPTION_ADMISSION_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-deposit-option-admission:'));
  assert.deepEqual(report.objectIds, [...V43_DEPOSIT_OPTION_ADMISSION_OBJECT_IDS]);
  assert.deepEqual(report.fieldIds, [...V43_DEPOSIT_OPTION_ADMISSION_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V43_DEPOSIT_OPTION_ADMISSION_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 5);
  assert.equal(report.coverage.reviewDecisionsImplemented, true);
  assert.equal(report.coverage.approvalDecisionImplemented, true);
  assert.equal(report.coverage.rejectionDecisionImplemented, true);
  assert.equal(report.coverage.resynthesisDecisionImplemented, true);
  assert.equal(report.coverage.admissionReceiptsImplemented, true);
  assert.equal(report.coverage.approvedPolicyEligibleOptionsAdmittedOnly, true);
  assert.equal(report.coverage.depositoryIndexProjectionImplemented, true);
  assert.equal(report.coverage.storageProjectionImplemented, true);
  assert.equal(report.coverage.compensationPreviewContinued, true);
  assert.equal(report.coverage.compensationPriceAsset, 'BTC');
  assert.equal(report.coverage.compensationAllocationMethod, 'source-to-shares-largest-remainder');
  assert.equal(report.coverage.packsActivitySynchronizationImplemented, true);
  assert.equal(report.coverage.packsRoute, '/packs');
  assert.equal(report.coverage.packsActivityType, 'depository-assetpack');
  assert.equal(report.coverage.telemetryImplemented, true);
  assert.equal(report.coverage.routeAdmissionReadbackImplemented, true);
  assert.equal(report.coverage.btdMintRequiresFutureNeedFitSettlement, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
});
