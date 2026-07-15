import assert from 'node:assert/strict';
import test from './era-pinned-superseded-routes.js';

import {
  V43_CROSS_ROUTE_REHEARSAL_ARTIFACT_PATH,
  V43_CROSS_ROUTE_REHEARSAL_LANE_IDS,
  V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS,
  V43_CROSS_ROUTE_REHEARSAL_ROW_IDS,
  V43_CROSS_ROUTE_REHEARSAL_SCHEMA_ID,
  V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS,
  buildV43CrossRouteRehearsalTelemetryRepair,
} from '../src/canonical/v43-cross-route-rehearsal-telemetry-repair.js';

test('V43 cross-route rehearsal telemetry repair artifact is source-safe and complete', () => {
  const artifact = buildV43CrossRouteRehearsalTelemetryRepair();

  assert.equal(
    V43_CROSS_ROUTE_REHEARSAL_ARTIFACT_PATH,
    '.proofs/v43/cross-route-rehearsal-telemetry-repair.json',
  );
  assert.equal(artifact.artifactId, 'v43-cross-route-rehearsal-telemetry-repair');
  assert.equal(artifact.schemaId, V43_CROSS_ROUTE_REHEARSAL_SCHEMA_ID);
  assert.equal(artifact.version, 'V43');
  assert.equal(artifact.currentTarget, 'V42');
  assert.deepEqual(artifact.laneIds, [...V43_CROSS_ROUTE_REHEARSAL_LANE_IDS]);
  assert.deepEqual(artifact.routeIds, [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS]);
  assert.deepEqual(artifact.stageIds, [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS]);
  assert.deepEqual(artifact.rowIds, [...V43_CROSS_ROUTE_REHEARSAL_ROW_IDS]);
  assert.equal(artifact.coverage.rowCount, 12);
  assert.equal(artifact.coverage.laneCount, 2);
  assert.equal(artifact.coverage.routeCount, 3);
  assert.equal(artifact.coverage.stageCount, 9);
  assert.equal(artifact.coverage.gateArtifactCount, 6);
  assert.equal(artifact.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(artifact.coverage.stagingRestHost, 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/');
  assert.equal(artifact.coverage.depositRouteCovered, true);
  assert.equal(artifact.coverage.readRouteCovered, true);
  assert.equal(artifact.coverage.packsRouteCovered, true);
  assert.equal(artifact.coverage.depositOptionAdmissionCovered, true);
  assert.equal(artifact.coverage.readNeedAndFindingFitsCovered, true);
  assert.equal(artifact.coverage.sourceSafePreviewCovered, true);
  assert.equal(artifact.coverage.settlementRightsTransferCovered, true);
  assert.equal(artifact.coverage.compensationCovered, true);
  assert.equal(artifact.coverage.deliveryPullRequestCovered, true);
  assert.equal(artifact.coverage.packActivityRepairCovered, true);
  assert.equal(artifact.coverage.telemetryDatabaseReadbackCovered, true);
  assert.equal(artifact.coverage.ledgerDatabaseStorageSynchronized, true);
  assert.equal(artifact.coverage.repairMatrixCovered, true);
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
  assert.match(artifact.artifactRoot, /^v43-cross-route-rehearsal:/u);
});
