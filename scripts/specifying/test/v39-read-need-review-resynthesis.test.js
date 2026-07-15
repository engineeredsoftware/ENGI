import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V39_READ_NEED_REVIEW_RESYNTHESIS_ARTIFACT_PATH,
  V39_READ_NEED_REVIEW_RESYNTHESIS_ROW_IDS,
  V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS,
  V39_READ_NEED_REVIEW_RESYNTHESIS_SCHEMA_ID,
  V39_READ_NEED_REVIEW_RESYNTHESIS_SOURCE_SAFETY_VERDICT,
  buildV39ReadNeedReviewResynthesis,
} from '../src/canonical/v39-read-need-review-resynthesis.js';

test('V39 ReadNeed review resynthesis report binds review loop, storage, telemetry, and admission', () => {
  const report = buildV39ReadNeedReviewResynthesis();

  assert.equal(V39_READ_NEED_REVIEW_RESYNTHESIS_ARTIFACT_PATH, '.bitcode/v39-read-need-review-resynthesis.json');
  assert.equal(report.artifactId, 'v39-read-need-review-resynthesis');
  assert.equal(report.schemaId, V39_READ_NEED_REVIEW_RESYNTHESIS_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_READ_NEED_REVIEW_RESYNTHESIS_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_READ_NEED_REVIEW_RESYNTHESIS_ROW_IDS]);
  assert.equal(report.rows.length, V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.pipelineName, 'ReadNeedComprehensionSynthesis');
  assert.equal(report.coverage.nextPipelineName, 'ReadFitsFindingSynthesis');
  assert.equal(report.coverage.phaseCount, 4);
  assert.equal(report.coverage.ptrrStepCount, 16);
  assert.equal(report.coverage.thricifiedGenerationCount, 48);
  assert.equal(report.coverage.acceptedNeedRequiredForFindingFits, true);
  assert.equal(report.coverage.rejectedNeedBlocksFindingFits, true);
  assert.deepEqual(report.coverage.actions, [
    'synthesize_read_need',
    'resynthesize_read_need',
    'accept_read_need',
    'reject_read_need',
  ]);
  assert.ok(report.coverage.persistedRecordKinds.includes('read_request'));
  assert.ok(report.coverage.persistedRecordKinds.includes('resynthesis_attempt'));
  assert.ok(report.coverage.persistedRecordKinds.includes('accepted_need_admission'));
  assert.ok(report.coverage.persistedRecordKinds.includes('rejected_need_posture'));
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-read-need-review-resynthesis:'));
});

test('V39 ReadNeed review resynthesis rows remain source-safe metadata only', () => {
  for (const row of V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-read-need-review-resynthesis-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_read_need_review_resynthesis_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
