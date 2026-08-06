import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V42_READING_SHORTEST_PATH_ROWS,
  V42_READING_SHORTEST_PATH_ROW_IDS,
  V42_READING_SHORTEST_PATH_SCHEMA_ID,
  V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH,
  V42_READING_SHORTEST_PATH_STATE_MACHINE_SOURCE_SAFETY_VERDICT,
  V42_READING_SHORTEST_PATH_STEP_IDS,
  buildV42ReadingShortestPathStateMachine,
} from '../src/canonical/v42-reading-shortest-path-state-machine.js';

test('V42 Reading shortest path state machine binds five route-recoverable steps', () => {
  const report = buildV42ReadingShortestPathStateMachine();

  assert.equal(
    V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH,
    '.proofs/v42/reading-shortest-path-state-machine.json',
  );
  assert.equal(report.artifactId, 'v42-reading-shortest-path-state-machine');
  assert.equal(report.schemaId, V42_READING_SHORTEST_PATH_SCHEMA_ID);
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.sourceSafetyVerdict, V42_READING_SHORTEST_PATH_STATE_MACHINE_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V42_READING_SHORTEST_PATH_ROW_IDS]);
  assert.deepEqual(report.stepIds, [...V42_READING_SHORTEST_PATH_STEP_IDS]);
  assert.equal(report.rows.length, V42_READING_SHORTEST_PATH_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.stepCount, 5);
  assert.deepEqual(report.coverage.acceptedUserPath, [
    'request-read',
    'review-synthesized-need',
    'request-finding-fits',
    'review-source-safe-assetpack-preview',
    'buy-settle-and-deliver-assetpack',
  ]);
  assert.equal(report.coverage.routePersistenceCovered, true);
  assert.equal(report.coverage.transactionIdRecoveryCovered, true);
  assert.equal(report.coverage.restartRetryFailureCovered, true);
  assert.equal(report.coverage.acceptedNeedGateCovered, true);
  assert.equal(report.coverage.streamLogIntegrationCovered, true);
  assert.equal(report.coverage.componentRouteTestsCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.lowDetailDefault, true);
  assert.equal(report.coverage.expandableSourceSafeDetail, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.ledgerAuthorityClaimed, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v42-reading-shortest-path-state-machine:'));
});

test('V42 Reading shortest path rows remain expandable source-safe metadata', () => {
  for (const row of V42_READING_SHORTEST_PATH_ROWS) {
    assert.ok(row.rowRoot.startsWith('v42-reading-shortest-path-state-machine-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_reading_shortest_path_state_machine_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.lowDetailDefault, true);
    assert.equal(row.expandableSourceSafeDetail, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.ledgerAuthorityClaimed, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
