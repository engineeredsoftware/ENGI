import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH,
  V47_READER_WEBSITE_COMPLETION_ROWS,
  V47_READER_WEBSITE_COMPLETION_SCHEMA_ID,
  V47_READER_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
  V47_READER_WEBSITE_FORBIDDEN_PAYLOAD_IDS,
  V47_READER_WEBSITE_PIPELINE_IDS,
  V47_READER_WEBSITE_READBACK_IDS,
  V47_READER_WEBSITE_STEP_IDS,
  V47_READER_WEBSITE_VISIBLE_DECISION_IDS,
  buildV47ReaderWebsiteCompletion,
} from '../src/canonical/v47-reader-website-completion.js';

test('V47 reader website completion binds the buyer launch path', () => {
  const report = buildV47ReaderWebsiteCompletion();

  assert.equal(V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH, '.bitcode/v47-reader-website-completion.json');
  assert.equal(report.artifactId, 'v47-reader-website-completion');
  assert.equal(report.schemaId, V47_READER_WEBSITE_COMPLETION_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_READER_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-reader-website-completion:'));
  assert.deepEqual(report.stepIds, [...V47_READER_WEBSITE_STEP_IDS]);
  assert.deepEqual(report.pipelineIds, [...V47_READER_WEBSITE_PIPELINE_IDS]);
  assert.deepEqual(report.readbackIds, [...V47_READER_WEBSITE_READBACK_IDS]);
  assert.deepEqual(report.visibleDecisionIds, [...V47_READER_WEBSITE_VISIBLE_DECISION_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_READER_WEBSITE_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V47_READER_WEBSITE_COMPLETION_ROWS.length);
  assert.ok(report.completionRows.some((row) => row.rowId === 'read-request-initiation' && row.route === '/read'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'fit-measurement-review' && row.route === '/read'));
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'settlement-finality-rights-delivery' && row.route === '/read',
    ),
  );
  assert.ok(report.completionRows.some((row) => row.rowId === 'packs-history-readback' && row.route === '/packs'));
});

test('V47 reader website completion preserves source-safe launch boundaries', () => {
  const report = buildV47ReaderWebsiteCompletion();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.readRequestInitiationComplete, true);
  assert.equal(report.coverage.needReviewAcceptanceComplete, true);
  assert.equal(report.coverage.fitMeasurementReviewComplete, true);
  assert.equal(report.coverage.quoteBeforeSettlementComplete, true);
  assert.equal(report.coverage.settlementFinalityRightsDeliveryComplete, true);
  assert.equal(report.coverage.packsHistoryReadbackComplete, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
