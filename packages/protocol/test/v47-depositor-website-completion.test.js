import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
  V47_DEPOSITOR_WEBSITE_COMPLETION_ROWS,
  V47_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID,
  V47_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
  V47_DEPOSITOR_WEBSITE_EVENT_IDS,
  V47_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS,
  V47_DEPOSITOR_WEBSITE_PIPELINE_IDS,
  V47_DEPOSITOR_WEBSITE_STEP_IDS,
  V47_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS,
  buildV47DepositorWebsiteCompletion,
} from '../src/canonical/v47-depositor-website-completion.js';

test('V47 depositor website completion binds the seller launch path', () => {
  const report = buildV47DepositorWebsiteCompletion();

  assert.equal(V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH, '.bitcode/v47-depositor-website-completion.json');
  assert.equal(report.artifactId, 'v47-depositor-website-completion');
  assert.equal(report.schemaId, V47_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-depositor-website-completion:'));
  assert.deepEqual(report.stepIds, [...V47_DEPOSITOR_WEBSITE_STEP_IDS]);
  assert.deepEqual(report.pipelineIds, [...V47_DEPOSITOR_WEBSITE_PIPELINE_IDS]);
  assert.deepEqual(report.eventIds, [...V47_DEPOSITOR_WEBSITE_EVENT_IDS]);
  assert.deepEqual(report.visibleDecisionIds, [...V47_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V47_DEPOSITOR_WEBSITE_COMPLETION_ROWS.length);
  assert.ok(report.completionRows.some((row) => row.rowId === 'source-connection' && row.route === '/deposit'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'option-synthesis-journal' && row.route === '/deposit'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'packs-history-readback' && row.route === '/packs'));
});

test('V47 depositor website completion preserves source-safe launch boundaries', () => {
  const report = buildV47DepositorWebsiteCompletion();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.sourceConnectionComplete, true);
  assert.equal(report.coverage.optionSynthesisJournaled, true);
  assert.equal(report.coverage.sourceSafeMeasurementReviewComplete, true);
  assert.equal(report.coverage.admissionActionsComplete, true);
  assert.equal(report.coverage.compensationVisibilityComplete, true);
  assert.equal(report.coverage.authorityReadbackComplete, true);
  assert.equal(report.coverage.packsHistoryReadbackComplete, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
