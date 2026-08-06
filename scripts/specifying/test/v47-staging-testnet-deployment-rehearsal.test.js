import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS,
  V47_STAGING_TESTNET_FORBIDDEN_PAYLOAD_IDS,
  V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT,
  V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH,
  V47_STAGING_TESTNET_REHEARSAL_LANE_IDS,
  V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS,
  V47_STAGING_TESTNET_REHEARSAL_SCHEMA_ID,
  V47_STAGING_TESTNET_REHEARSAL_SOURCE_SAFETY_VERDICT,
  V47_STAGING_TESTNET_VALIDATION_COMMANDS,
  buildV47StagingTestnetDeploymentRehearsal,
  buildV47StagingTestnetRehearsalLanes,
} from '../src/canonical/v47-staging-testnet-deployment-rehearsal.js';

test('V47 staging-testnet deployment rehearsal binds lanes, surfaces, and the realistic-data contract', () => {
  const report = buildV47StagingTestnetDeploymentRehearsal();

  assert.equal(
    V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH,
    '.proofs/v47/staging-testnet-deployment-rehearsal.json',
  );
  assert.equal(report.artifactId, 'v47-staging-testnet-deployment-rehearsal');
  assert.equal(report.schemaId, V47_STAGING_TESTNET_REHEARSAL_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_STAGING_TESTNET_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-staging-testnet-deployment-rehearsal:'));
  assert.deepEqual(report.laneIds, [...V47_STAGING_TESTNET_REHEARSAL_LANE_IDS]);
  assert.deepEqual(report.routeIds, [...V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS]);
  assert.deepEqual(report.deploymentSurfaceIds, [...V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS]);
  assert.deepEqual(report.realisticDataContract, { ...V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT });
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_STAGING_TESTNET_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.validationCommands.length, V47_STAGING_TESTNET_VALIDATION_COMMANDS.length);
  assert.ok(report.migrationInventory.includes('001_v26_production.sql'));
  assert.ok(report.migrationInventory.includes('002_v27_btd_crypto_registry.sql'));
  assert.equal(report.lanes.length, V47_STAGING_TESTNET_REHEARSAL_LANE_IDS.length);
});

test('V47 staging-testnet rehearsal lanes preserve ordering law, dry-run posture, and blocked mainnet', () => {
  const lanes = buildV47StagingTestnetRehearsalLanes();

  for (const lane of lanes) {
    assert.equal(lane.schema, 'bitcode.v47.stagingTestnetDeploymentRehearsal.laneReceipt');
    assert.equal(lane.dryRun, true);
    assert.equal(lane.liveExecutionOptInRequired, true);
    assert.equal(lane.network, 'btc-testnet');
    assert.equal(lane.sourceSafety.sourceSafeMetadataOnly, true);
    assert.equal(lane.sourceSafety.protectedSourceVisible, false);
    assert.equal(lane.sourceSafety.liveServiceCredentialsSerialized, false);
    assert.equal(lane.sourceSafety.valueBearingMainnetEnabled, false);
  }

  const settlementLane = lanes.find((lane) => lane.laneId === 'btc-testnet-settlement-observation');
  assert.deepEqual(settlementLane.orderingLaw, [
    'btc-testnet-payment-observed',
    'btc-testnet-finality-confirmed',
    'btd-rights-transferred',
    'repository-pr-delivery-materialized',
  ]);

  const populationLane = lanes.find((lane) => lane.laneId === 'realistic-data-population');
  assert.equal(populationLane.population.contractSatisfied, true);
  assert.ok(
    populationLane.population.rows.every((row) => row.rehearsedCount >= row.minimumCount),
  );

  const mainnetLane = lanes.find((lane) => lane.laneId === 'value-bearing-mainnet-blocked');
  assert.equal(mainnetLane.rehearsalStatus, 'blocked_as_required');
});

test('V47 staging-testnet rehearsal passes all predicates with source-safe coverage', () => {
  const report = buildV47StagingTestnetDeploymentRehearsal();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.fullStackLaneComplete, true);
  assert.equal(report.coverage.realisticDataContractSatisfied, true);
  assert.equal(report.coverage.settlementObservationOrdered, true);
  assert.equal(report.coverage.mainnetBlockedRehearsed, true);
  assert.equal(report.coverage.liveExecutionOptInRequired, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.liveServiceCredentialsSerialized, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
