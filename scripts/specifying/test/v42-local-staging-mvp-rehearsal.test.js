import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH,
  V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS,
  V42_LOCAL_STAGING_MVP_REHEARSAL_ROW_IDS,
  V42_LOCAL_STAGING_MVP_REHEARSAL_SCHEMA_ID,
  V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS,
  buildV42LocalStagingMvpRehearsal,
} from '../src/canonical/v42-local-staging-mvp-rehearsal.js';

test('V42 local/staging MVP rehearsal artifact is source-safe and complete', () => {
  const artifact = buildV42LocalStagingMvpRehearsal();

  assert.equal(V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH, '.bitcode/v42-local-staging-mvp-rehearsal.json');
  assert.equal(artifact.artifactId, 'v42-local-staging-mvp-rehearsal');
  assert.equal(artifact.schemaId, V42_LOCAL_STAGING_MVP_REHEARSAL_SCHEMA_ID);
  assert.equal(artifact.version, 'V42');
  assert.equal(artifact.currentTarget, 'V41');
  assert.deepEqual(artifact.laneIds, [...V42_LOCAL_STAGING_MVP_REHEARSAL_LANE_IDS]);
  assert.deepEqual(artifact.stageIds, [...V42_LOCAL_STAGING_MVP_REHEARSAL_STAGE_IDS]);
  assert.deepEqual(artifact.rowIds, [...V42_LOCAL_STAGING_MVP_REHEARSAL_ROW_IDS]);
  assert.equal(artifact.coverage.rowCount, 14);
  assert.equal(artifact.coverage.laneCount, 2);
  assert.equal(artifact.coverage.stageCount, 7);
  assert.equal(artifact.coverage.gateArtifactCount, 6);
  assert.equal(artifact.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(artifact.coverage.stagingRestHost, 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/');
  assert.equal(artifact.coverage.depositingCovered, true);
  assert.equal(artifact.coverage.readRequestCovered, true);
  assert.equal(artifact.coverage.readNeedReviewCovered, true);
  assert.equal(artifact.coverage.readFitsFindingCovered, true);
  assert.equal(artifact.coverage.manyCandidateDepositorySearchCovered, true);
  assert.equal(artifact.coverage.sourceSafePreviewQuoteCovered, true);
  assert.equal(artifact.coverage.settlementRightsDeliveryCovered, true);
  assert.equal(artifact.coverage.aiReadingDemonstrationCovered, true);
  assert.equal(artifact.coverage.richTelemetryReadbackCovered, true);
  assert.equal(artifact.coverage.databaseStreamReadbackCovered, true);
  assert.equal(artifact.coverage.ledgerDatabaseStorageSynchronized, true);
  assert.equal(artifact.coverage.postSettlementPullRequestDeliveryCovered, true);
  assert.equal(artifact.coverage.operatorReceiptScriptCovered, true);
  assert.equal(artifact.coverage.mainnetValueBearingBlocked, true);
  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourcePayloadSerialized, false);
  assert.equal(artifact.coverage.rawProtectedPromptVisible, false);
  assert.equal(artifact.coverage.rawInterpolatedPromptVisible, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.privateSettlementPayloadVisible, false);
  assert.equal(artifact.coverage.liveRehearsalLogPayloadSerialized, false);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v42-local-staging-mvp-rehearsal:/u);
});
