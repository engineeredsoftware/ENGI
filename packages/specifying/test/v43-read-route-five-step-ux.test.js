import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH,
  V43_READ_ROUTE_FIVE_STEP_UX_SCHEMA_ID,
  V43_READ_ROUTE_FIVE_STEP_UX_SOURCE_SAFETY_VERDICT,
  V43_READ_ROUTE_FORBIDDEN_PAYLOAD_IDS,
  V43_READ_ROUTE_OBJECT_IDS,
  V43_READ_ROUTE_PIPELINE_IDS,
  V43_READ_ROUTE_SOURCE_SAFE_FIELD_IDS,
  V43_READ_ROUTE_STEP_IDS,
  buildV43ReadRouteFiveStepUx,
} from '../src/canonical/v43-read-route-five-step-ux.js';

test('V43 read route five-step UX artifact binds source-safe Reading route contracts', () => {
  const report = buildV43ReadRouteFiveStepUx();

  assert.equal(V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH, '.bitcode/v43-read-route-five-step-ux.json');
  assert.equal(report.artifactId, 'v43-read-route-five-step-ux');
  assert.equal(report.schemaId, V43_READ_ROUTE_FIVE_STEP_UX_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_READ_ROUTE_FIVE_STEP_UX_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-read-route-five-step-ux:'));
  assert.deepEqual(report.stepIds, [...V43_READ_ROUTE_STEP_IDS]);
  assert.deepEqual(report.objectIds, [...V43_READ_ROUTE_OBJECT_IDS]);
  assert.deepEqual(report.pipelineIds, [...V43_READ_ROUTE_PIPELINE_IDS]);
  assert.deepEqual(report.sourceSafeFieldIds, [...V43_READ_ROUTE_SOURCE_SAFE_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V43_READ_ROUTE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 4);
  assert.equal(report.coverage.readRouteImplemented, true);
  assert.equal(report.coverage.fiveStepUxImplemented, true);
  assert.equal(report.coverage.acceptedNeedRequiredBeforeFindingFits, true);
  assert.equal(report.coverage.sourceSafePreviewBeforeSettlement, true);
  assert.equal(report.coverage.deliveryRequiresPaidReadRights, true);
  assert.equal(report.coverage.executionStreamRetained, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
});
