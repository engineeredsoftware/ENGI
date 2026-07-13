import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_DEPOSIT_OPTION_FORBIDDEN_PAYLOAD_IDS,
  V43_DEPOSIT_OPTION_OBJECT_IDS,
  V43_DEPOSIT_OPTION_PIPELINE_IDS,
  V43_DEPOSIT_OPTION_SOURCE_SAFE_FIELD_IDS,
  V43_DEPOSIT_ROUTE_OPTIONS_ARTIFACT_PATH,
  V43_DEPOSIT_ROUTE_OPTIONS_SCHEMA_ID,
  V43_DEPOSIT_ROUTE_OPTIONS_SOURCE_SAFETY_VERDICT,
  V43_DEPOSIT_ROUTE_STEP_IDS,
  buildV43DepositRouteOptions,
} from '../src/canonical/v43-deposit-route-options.js';

test('V43 deposit route options artifact binds source-safe Deposit route contracts', () => {
  const report = buildV43DepositRouteOptions();

  assert.equal(V43_DEPOSIT_ROUTE_OPTIONS_ARTIFACT_PATH, '.bitcode/v43-deposit-route-options.json');
  assert.equal(report.artifactId, 'v43-deposit-route-options');
  assert.equal(report.schemaId, V43_DEPOSIT_ROUTE_OPTIONS_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_DEPOSIT_ROUTE_OPTIONS_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-deposit-route-options:'));
  assert.deepEqual(report.stepIds, [...V43_DEPOSIT_ROUTE_STEP_IDS]);
  assert.deepEqual(report.objectIds, [...V43_DEPOSIT_OPTION_OBJECT_IDS]);
  assert.deepEqual(report.pipelineIds, [...V43_DEPOSIT_OPTION_PIPELINE_IDS]);
  assert.deepEqual(report.sourceSafeFieldIds, [...V43_DEPOSIT_OPTION_SOURCE_SAFE_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V43_DEPOSIT_OPTION_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 4);
  assert.equal(report.coverage.depositRouteImplemented, true);
  assert.equal(report.coverage.fiveStepDepositingUxImplemented, true);
  assert.equal(report.coverage.optionSynthesisImplemented, true);
  assert.equal(report.coverage.multipleOptionsSynthesized, true);
  assert.equal(report.coverage.connectedSourceUsed, true);
  assert.equal(report.coverage.depositoryDemandSignalsUsed, true);
  assert.equal(report.coverage.readingDemandSignalsUsed, true);
  assert.equal(report.coverage.existingDepositorySignalsUsed, true);
  assert.equal(report.coverage.terminalDepositComposerReused, true);
  assert.equal(report.coverage.sourceCriticalityDemandRoiPolicyDeferredToGate6, true);
  assert.equal(report.coverage.admissionAndIndexingDeferredToGate7, true);
  assert.equal(report.coverage.reviewRequiredBeforeDepositAdmission, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
});
