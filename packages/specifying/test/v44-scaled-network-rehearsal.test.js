import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH,
  V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS,
  V44_SCALED_NETWORK_REHEARSAL_LANE_IDS,
  V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS,
  V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS,
  V44_SCALED_NETWORK_REHEARSAL_ROW_IDS,
  V44_SCALED_NETWORK_REHEARSAL_SCHEMA_ID,
  V44_SCALED_NETWORK_REHEARSAL_SOURCE_ROOTS,
  V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT,
  V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS,
  buildV44ScaledNetworkRehearsal,
} from '../src/canonical/v44-scaled-network-rehearsal.js';

test('V44 scaled network rehearsal binds many-pack local and staging-testnet coverage', () => {
  const report = buildV44ScaledNetworkRehearsal();

  assert.equal(V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH, '.bitcode/v44-scaled-network-rehearsal.json');
  assert.equal(report.artifactId, 'v44-scaled-network-rehearsal');
  assert.equal(report.schemaId, V44_SCALED_NETWORK_REHEARSAL_SCHEMA_ID);
  assert.equal(report.version, 'V44');
  assert.equal(report.currentTarget, 'V43');
  assert.equal(report.sourceSafetyVerdict, V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v44-scaled-network-rehearsal:'));
  assert.deepEqual(report.laneIds, [...V44_SCALED_NETWORK_REHEARSAL_LANE_IDS]);
  assert.deepEqual(report.routeIds, [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS]);
  assert.deepEqual(report.stageIds, [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS]);
  assert.deepEqual(report.rowIds, [...V44_SCALED_NETWORK_REHEARSAL_ROW_IDS]);
  assert.deepEqual(report.minimumCounts, { ...V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS });
  assert.equal(report.minimumCounts.depositCount, 24);
  assert.equal(report.minimumCounts.readCount, 18);
  assert.equal(report.minimumCounts.fitCandidateCount, 72);
  assert.equal(report.minimumCounts.quoteCount, 18);
  assert.equal(report.minimumCounts.settlementObservationCount, 12);
  assert.equal(report.minimumCounts.contributorCount, 36);
  assert.equal(report.minimumCounts.repairCaseCount, 8);
  assert.equal(report.minimumCounts.packActivityRows, 54);
  assert.deepEqual(report.forbiddenPayloadIds, [...V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.rows.length, 12);
  assert.equal(report.coverage.laneCount, 2);
  assert.equal(report.coverage.routeCount, 3);
  assert.equal(report.coverage.stageCount, 9);
  assert.equal(report.coverage.gateArtifactCount, 7);
  assert.equal(report.coverage.stagingProjectRef, 'tkpyosihuouusyaxtbau');
  assert.equal(report.coverage.stagingRestHost, 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/');
  assert.equal(report.coverage.localLaneCovered, true);
  assert.equal(report.coverage.stagingTestnetLaneCovered, true);
  assert.equal(report.coverage.manyDepositsCovered, true);
  assert.equal(report.coverage.manyReadsCovered, true);
  assert.equal(report.coverage.manyFitsCovered, true);
  assert.equal(report.coverage.manyQuotesCovered, true);
  assert.equal(report.coverage.manySettlementsCovered, true);
  assert.equal(report.coverage.manyContributorsCovered, true);
  assert.equal(report.coverage.repairMatrixCovered, true);
  assert.equal(report.coverage.portfolioReadbackCovered, true);
  assert.equal(report.coverage.telemetryDatabaseReadbackCovered, true);
  assert.equal(report.coverage.ledgerDatabaseStorageSynchronized, true);
  assert.equal(report.coverage.mainnetValueBearingBlocked, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourcePayloadSerialized, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.privateSettlementPayloadVisible, false);
  assert.equal(report.coverage.liveRehearsalLogPayloadSerialized, false);
  assert.equal(report.sourceSafety.valueBearingMainnetAdmitted, false);
  assert.equal(V44_SCALED_NETWORK_REHEARSAL_SOURCE_ROOTS.operatorScript, 'scripts/rehearse-v44-scaled-network-flow.mjs');
});
