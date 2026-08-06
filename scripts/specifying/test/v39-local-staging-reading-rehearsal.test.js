import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V39_LOCAL_STAGING_READING_REHEARSAL_ARTIFACT_PATH,
  V39_LOCAL_STAGING_READING_REHEARSAL_LANE_IDS,
  V39_LOCAL_STAGING_READING_REHEARSAL_ROW_IDS,
  V39_LOCAL_STAGING_READING_REHEARSAL_ROWS,
  V39_LOCAL_STAGING_READING_REHEARSAL_SCHEMA_ID,
  V39_LOCAL_STAGING_READING_REHEARSAL_SOURCE_SAFETY_VERDICT,
  V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS,
  buildV39LocalStagingReadingRehearsal,
} from '../src/canonical/v39-local-staging-reading-rehearsal.js';

test('V39 local/staging Reading rehearsal binds lanes, stages, and source-safe proof posture', () => {
  const report = buildV39LocalStagingReadingRehearsal();

  assert.equal(V39_LOCAL_STAGING_READING_REHEARSAL_ARTIFACT_PATH, '.proofs/v39/local-staging-reading-rehearsal.json');
  assert.equal(report.artifactId, 'v39-local-staging-reading-rehearsal');
  assert.equal(report.schemaId, V39_LOCAL_STAGING_READING_REHEARSAL_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_LOCAL_STAGING_READING_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.laneIds, [...V39_LOCAL_STAGING_READING_REHEARSAL_LANE_IDS]);
  assert.deepEqual(report.stageIds, [...V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS]);
  assert.deepEqual(report.rowIds, [...V39_LOCAL_STAGING_READING_REHEARSAL_ROW_IDS]);
  assert.equal(report.rows.length, V39_LOCAL_STAGING_READING_REHEARSAL_ROWS.length);
  assert.equal(report.coverage.rowCount, 12);
  assert.equal(report.coverage.laneCount, 2);
  assert.equal(report.coverage.stageCount, 5);
  assert.equal(report.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(report.coverage.stagingRestHost, 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/');
  assert.equal(report.coverage.packageRuntimeType, 'ReadingLocalStagingRehearsal');
  assert.equal(report.coverage.localLaneCovered, true);
  assert.equal(report.coverage.stagingTestnetLaneCovered, true);
  assert.equal(report.coverage.fiveStageReadingCovered, true);
  assert.equal(report.coverage.readNeedComprehensionCovered, true);
  assert.equal(report.coverage.readFitsFindingCovered, true);
  assert.equal(report.coverage.depositoryManyFitsCovered, true);
  assert.equal(report.coverage.sourceSafePreviewCovered, true);
  assert.equal(report.coverage.settlementRightsDeliveryCovered, true);
  assert.equal(report.coverage.telemetryStreamingReadbackCovered, true);
  assert.equal(report.coverage.interfaceNoBypassCovered, true);
  assert.equal(report.coverage.valueBearingMainnetAdmitted, false);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-local-staging-reading-rehearsal:'));
});

test('V39 local/staging Reading rehearsal rows are source-safe metadata only', () => {
  for (const row of V39_LOCAL_STAGING_READING_REHEARSAL_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-local-staging-reading-rehearsal-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_reading_local_staging_rehearsal_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawInterpolatedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.liveLogPayloadSerialized, false);
    assert.equal(row.sourceBearingDeliveryUnlockedAfterSettlementOnly, true);
    assert.equal(row.valueBearingMainnetAdmitted, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
