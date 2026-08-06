import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ARTIFACT_PATH,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_LANE_IDS,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROW_IDS,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SCHEMA_ID,
  V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SOURCE_SAFETY_VERDICT,
  buildV38LocalStagingInferenceDepositorySearchRehearsal,
} from '../src/canonical/local-staging-inference-depository-search-rehearsal.js';

test('V38 local/staging inference rehearsal binds Reading, search, preview, telemetry, and blocked mainnet posture', () => {
  const report = buildV38LocalStagingInferenceDepositorySearchRehearsal();

  assert.equal(
    V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ARTIFACT_PATH,
    '.proofs/v38/local-staging-inference-depository-search-rehearsal.json',
  );
  assert.equal(report.artifactId, 'v38-local-staging-inference-depository-search-rehearsal');
  assert.equal(report.schemaId, V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SCHEMA_ID);
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.sourceSafetyVerdict, V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROW_IDS]);
  assert.deepEqual(report.laneIds, [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_LANE_IDS]);
  assert.deepEqual(report.requiredProofArtifacts, [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_REQUIRED_PROOF_ARTIFACTS]);
  assert.equal(report.rows.length, V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS.length);
  assert.equal(report.coverage.rowCount, 8);
  assert.equal(report.coverage.laneCount, 2);
  assert.equal(report.coverage.localRehearsalCovered, true);
  assert.equal(report.coverage.stagingTestnetRehearsalCovered, true);
  assert.equal(report.coverage.readNeedComprehensionCovered, true);
  assert.equal(report.coverage.readFitsFindingCovered, true);
  assert.equal(report.coverage.depositoryManyFitsCovered, true);
  assert.equal(report.coverage.embeddingPolicyCovered, true);
  assert.equal(report.coverage.sourceSafePreviewCovered, true);
  assert.equal(report.coverage.telemetryStreamingCovered, true);
  assert.equal(report.coverage.realInferenceCredentialGatedCovered, true);
  assert.equal(report.coverage.databaseLedgerReadbackCovered, true);
  assert.equal(report.coverage.valueBearingMainnetVisibleAndBlocked, true);
  assert.equal(report.coverage.localLiveExecutionRequiresExplicitOptIn, true);
  assert.equal(report.coverage.stagingStrictnessRequiresRealInference, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.missingProofArtifacts, []);
  assert.ok(report.artifactRoot.startsWith('v38-local-staging-inference-depository-search-rehearsal:'));
});

test('V38 local/staging inference rehearsal rows remain source-safe metadata', () => {
  const rowIds = V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS.map((row) => row.rowId);

  assert.deepEqual(rowIds, [...V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROW_IDS]);
  for (const row of V38_LOCAL_STAGING_INFERENCE_DEPOSITORY_SEARCH_REHEARSAL_ROWS) {
    assert.ok(row.rowRoot.startsWith('v38-local-staging-inference-depository-search-rehearsal-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_local_staging_inference_depository_search_rehearsal_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.liveLogPayloadSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.privateSettlementPayloadVisible, false);
    assert.equal(row.valueBearingMainnetAdmitted, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret_values'));
    assert.ok(row.forbiddenPayloadClasses.includes('live_rehearsal_log_payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
    assert.ok(row.forbiddenPayloadClasses.includes('production_mainnet_value_bearing_admission'));
  }
});
