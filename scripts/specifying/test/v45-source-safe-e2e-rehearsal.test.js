import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH,
  V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_FORBIDDEN_PAYLOAD_CLASSES,
  V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_ROW_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID,
  V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_ROOTS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT,
  V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS,
  buildV45SourceSafeEndToEndRehearsal,
} from '../src/canonical/v45-source-safe-e2e-rehearsal.js';

test('V45 source-safe end-to-end rehearsal binds all lanes, stages, evidence, and readback', () => {
  const artifact = buildV45SourceSafeEndToEndRehearsal();

  assert.equal(V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH, '.bitcode/v45-source-safe-e2e-rehearsal.json');
  assert.equal(artifact.artifactId, 'v45-source-safe-e2e-rehearsal');
  assert.equal(artifact.schemaId, V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID);
  assert.equal(artifact.version, 'V45');
  assert.equal(artifact.currentTarget, 'V45');
  assert.equal(artifact.sourceSafetyVerdict, V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.equal(artifact.rehearsalStatus, 'completed_source_safe');
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v45-source-safe-e2e-rehearsal:/u);
  assert.deepEqual(artifact.laneIds, [...V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS]);
  assert.deepEqual(artifact.stageIds, [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS]);
  assert.deepEqual(artifact.evidenceClassIds, [...V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS]);
  assert.deepEqual(artifact.rowIds, [...V45_SOURCE_SAFE_E2E_REHEARSAL_ROW_IDS]);
  assert.equal(artifact.rows.length, 13);
  assert.equal(artifact.coverage.laneCount, 3);
  assert.equal(artifact.coverage.stageCount, 11);
  assert.equal(artifact.coverage.evidenceClassCount, 16);
  assert.equal(artifact.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(artifact.coverage.stagingRestHost, 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/');
  assert.equal(artifact.coverage.localDeterministicLaneCovered, true);
  assert.equal(artifact.coverage.stagingTestnetCredentialedLaneCovered, true);
  assert.equal(artifact.coverage.valueBearingMainnetBlocked, true);
  assert.equal(artifact.coverage.depositOptionCovered, true);
  assert.equal(artifact.coverage.depositoryAdmissionCovered, true);
  assert.equal(artifact.coverage.readRequestCovered, true);
  assert.equal(artifact.coverage.readNeedReviewCovered, true);
  assert.equal(artifact.coverage.findingFitsCovered, true);
  assert.equal(artifact.coverage.sourceSafePreviewCovered, true);
  assert.equal(artifact.coverage.btdQuoteCovered, true);
  assert.equal(artifact.coverage.btcSettlementReadinessCovered, true);
  assert.equal(artifact.coverage.rightsDeliveryPostureCovered, true);
  assert.equal(artifact.coverage.compensationPostureCovered, true);
  assert.equal(artifact.coverage.ledgerDatabaseStorageReadbackCovered, true);
  assert.equal(artifact.coverage.interfaceBrowserReceiptCovered, true);
  assert.equal(artifact.coverage.repairPostureCovered, true);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.deepEqual(artifact.coverage.missingEvidenceClassIds, []);
  assert.deepEqual(artifact.coverage.contradictoryEvidenceClassIds, []);
  assert.equal(artifact.coverage.repairCaseCount, 0);
});

test('V45 source-safe end-to-end rehearsal keeps payload classes withheld', () => {
  const artifact = buildV45SourceSafeEndToEndRehearsal();

  assert.deepEqual(artifact.sourceSafety.forbiddenPayloadClasses, [
    ...V45_SOURCE_SAFE_E2E_REHEARSAL_FORBIDDEN_PAYLOAD_CLASSES,
  ]);
  for (const key of [
    'sourceSafeMetadataOnly',
    'protectedSourcePayloadSerialized',
    'rawSourceTextVisible',
    'unpaidAssetPackSourceVisible',
    'rawPromptVisible',
    'interpolatedPromptVisible',
    'rawProviderResponseVisible',
    'credentialsSerialized',
    'walletPrivateMaterialVisible',
    'privateSettlementPayloadVisible',
    'liveRehearsalLogPayloadSerialized',
    'valueBearingMainnetAdmitted',
  ]) {
    const expected = key === 'sourceSafeMetadataOnly';
    assert.equal(artifact.sourceSafety[key], expected, `${key} source-safety flag`);
    assert.equal(artifact.coverage[key], expected, `${key} coverage source-safety flag`);
  }
  assert.equal(
    V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_ROOTS.operatorScript,
    'scripts/rehearse-v45-source-safe-e2e.mjs',
  );
});

test('V45 source-safe end-to-end missing evidence returns repair state', () => {
  const artifact = buildV45SourceSafeEndToEndRehearsal({
    evidenceOverrides: {
      'ledger-database-storage-readback-root': { present: false },
    },
  });

  assert.equal(artifact.passed, false);
  assert.equal(artifact.rehearsalStatus, 'repair_required');
  assert.deepEqual(artifact.coverage.missingEvidenceClassIds, ['ledger-database-storage-readback-root']);
  assert.equal(artifact.coverage.repairCaseCount, 1);
  assert.equal(artifact.repairCases[0].repairCaseId, 'missing:ledger-database-storage-readback-root');
  assert.equal(artifact.repairCases[0].repairState, 'repair-required');
  assert.ok(artifact.repairCases[0].nextActions.includes('rerun_check_v45_gate17'));
});

test('V45 source-safe end-to-end contradictory evidence returns repair state', () => {
  const artifact = buildV45SourceSafeEndToEndRehearsal({
    evidenceOverrides: {
      'btc-settlement-readiness-receipt': { contradictory: true },
    },
  });

  assert.equal(artifact.passed, false);
  assert.equal(artifact.rehearsalStatus, 'repair_required');
  assert.deepEqual(artifact.coverage.contradictoryEvidenceClassIds, ['btc-settlement-readiness-receipt']);
  assert.equal(artifact.coverage.repairCaseCount, 1);
  assert.equal(artifact.repairCases[0].repairCaseId, 'contradictory:btc-settlement-readiness-receipt');
  assert.ok(artifact.repairCases[0].nextActions.includes('invalidate_success_claim'));
});
