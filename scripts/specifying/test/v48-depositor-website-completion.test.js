import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
  V48_DEPOSITOR_WEBSITE_COMPLETION_ROWS,
  V48_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID,
  V48_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
  V48_DEPOSITOR_WEBSITE_EVENT_IDS,
  V48_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS,
  V48_DEPOSITOR_WEBSITE_PIPELINE_IDS,
  V48_DEPOSITOR_WEBSITE_STEP_IDS,
  V48_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS,
  buildV48DepositorWebsiteCompletion,
} from '../src/canonical/v48-depositor-website-completion.js';

test('V48 depositor website completion binds the seller launch path', () => {
  const report = buildV48DepositorWebsiteCompletion();

  assert.equal(
    V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
    '.proofs/v48/depositor-website-completion.json',
  );
  assert.equal(report.artifactId, 'v48-depositor-website-completion');
  assert.equal(report.schemaId, V48_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID);
  assert.equal(report.version, 'V48');
  assert.equal(report.currentTarget, 'V47');
  assert.equal(report.sourceSafetyVerdict, V48_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v48-depositor-website-completion:'));
  assert.deepEqual(report.stepIds, [...V48_DEPOSITOR_WEBSITE_STEP_IDS]);
  assert.deepEqual(report.pipelineIds, [...V48_DEPOSITOR_WEBSITE_PIPELINE_IDS]);
  assert.deepEqual(report.eventIds, [...V48_DEPOSITOR_WEBSITE_EVENT_IDS]);
  assert.deepEqual(report.visibleDecisionIds, [...V48_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V48_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V48_DEPOSITOR_WEBSITE_COMPLETION_ROWS.length);
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'source-connection' && row.route === '/deposits',
    ),
  );
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'option-synthesis-journal' && row.route === '/deposits',
    ),
  );
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'exchange-history-readback' && row.route === '/exchange',
    ),
  );
  assert.ok(
    report.completionRows.some((row) => row.rowId === 'tradable-datapack-synthesis-law'),
  );
});

test('V48 depositor website completion preserves source-safe launch boundaries', () => {
  const report = buildV48DepositorWebsiteCompletion();

  if (!report.passed) {
    assert.fail(
      `predicates failed: ${report.coverage.failedPredicateIds.join(', ')}`,
    );
  }
  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.sourceConnectionComplete, true);
  assert.equal(report.coverage.optionSynthesisJournaled, true);
  assert.equal(report.coverage.commercialMeasurementReviewComplete, true);
  assert.equal(report.coverage.admissionActionsComplete, true);
  assert.equal(report.coverage.compensationVisibilityComplete, true);
  assert.equal(report.coverage.authorityReadbackComplete, true);
  assert.equal(report.coverage.exchangeHistoryReadbackComplete, true);
  assert.equal(report.coverage.tradableDataPackLawComplete, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidDataPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
