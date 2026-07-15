import { test } from './era-pinned-superseded-routes.js';
import assert from 'node:assert/strict';

import {
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_CURRENT_TARGET,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_LANE_IDS,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ROW_IDS,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SCHEMA_ID,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SOURCE_SAFETY_VERDICT,
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_VERSION,
  buildV40LocalStagingRehearsalAutomation,
  listMissingV40LocalStagingRehearsalAutomationSources,
} from '../src/canonical/v40-local-staging-rehearsal-automation.js';

test('V40 local/staging rehearsal automation proof closes every lane source-safely', () => {
  const proof = buildV40LocalStagingRehearsalAutomation();

  assert.equal(proof.artifactId, 'v40-local-staging-rehearsal-automation');
  assert.equal(proof.artifactPath, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH);
  assert.equal(proof.schemaId, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SCHEMA_ID);
  assert.equal(proof.version, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_VERSION);
  assert.equal(proof.currentTarget, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_CURRENT_TARGET);
  assert.equal(proof.sourceSafetyVerdict, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SOURCE_SAFETY_VERDICT);
  assert.equal(proof.passed, true);
  assert.deepEqual(proof.laneIds, [...V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_LANE_IDS]);
  assert.equal(proof.rows.length, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ROW_IDS.length);
  assert.equal(proof.coverage.rowCount, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS.rowCount);
  assert.equal(proof.coverage.laneCount, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS.laneCount);
  assert.equal(proof.coverage.receiptKindCount, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS.receiptKindCount);
  assert.equal(proof.coverage.environmentFamilyCount, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS.environmentFamilyCount);
  assert.equal(proof.coverage.allCriticalSurfacesClosed, true);
  assert.deepEqual(proof.coverage.failedPredicateIds, []);

  assert.equal(proof.coverage.localLaneReceiptCovered, true);
  assert.equal(proof.coverage.stagingTestnetReceiptCovered, true);
  assert.equal(proof.coverage.laneBoundSecretFamiliesCovered, true);
  assert.equal(proof.coverage.sourceSafeOperatorReceiptsCovered, true);
  assert.equal(proof.coverage.sandboxHarnessAutomationCovered, true);
  assert.equal(proof.coverage.databaseStreamReadbackCovered, true);
  assert.equal(proof.coverage.fiveStageReadingRehearsalCovered, true);
  assert.equal(proof.coverage.ledgerStorageWalletDeliveryRehearsalCovered, true);
  assert.equal(proof.coverage.valueBearingMainnetBlocked, true);

  for (const row of proof.rows) {
    assert.equal(row.verdict, 'covered');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.liveRehearsalLogPayloadSerialized, false);
    assert.equal(row.valueBearingMainnetAdmitted, false);
  }
});

test('V40 local/staging rehearsal automation proof lists no missing source roots', () => {
  assert.deepEqual(listMissingV40LocalStagingRehearsalAutomationSources(), []);
});
