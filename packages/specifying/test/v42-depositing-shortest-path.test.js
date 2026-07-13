import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH,
  V42_DEPOSITING_SHORTEST_PATH_ROW_IDS,
  V42_DEPOSITING_SHORTEST_PATH_ROWS,
  V42_DEPOSITING_SHORTEST_PATH_SCHEMA_ID,
  V42_DEPOSITING_SHORTEST_PATH_SOURCE_SAFETY_VERDICT,
  buildV42DepositingShortestPath,
} from '../src/canonical/v42-depositing-shortest-path.js';

test('V42 Depositing shortest path report binds admission proof and compensation visibility', () => {
  const report = buildV42DepositingShortestPath();

  assert.equal(V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH, '.bitcode/v42-depositing-shortest-path.json');
  assert.equal(report.artifactId, 'v42-depositing-shortest-path');
  assert.equal(report.schemaId, V42_DEPOSITING_SHORTEST_PATH_SCHEMA_ID);
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.sourceSafetyVerdict, V42_DEPOSITING_SHORTEST_PATH_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V42_DEPOSITING_SHORTEST_PATH_ROW_IDS]);
  assert.equal(report.rows.length, V42_DEPOSITING_SHORTEST_PATH_ROWS.length);
  assert.equal(report.coverage.rowCount, 8);
  assert.deepEqual(report.coverage.acceptedUserPath, [
    'provide-source-material',
    'select-repository-source-anchor',
    'admit-deposit-to-depository',
    'receive-source-safe-admission-proof',
    'view-later-btc-compensation-attribution',
  ]);
  assert.equal(report.coverage.routeApiContractsCovered, true);
  assert.equal(report.coverage.sourceValidationCovered, true);
  assert.equal(report.coverage.storageProjectionCovered, true);
  assert.equal(report.coverage.depositorySearchDocumentCovered, true);
  assert.equal(report.coverage.sourceToSharesCompensationReadbackCovered, true);
  assert.equal(report.coverage.terminalCompensationVisibilityCovered, true);
  assert.equal(report.coverage.localStagingRehearsalCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.btdMintedAtDepositAdmission, false);
  assert.equal(report.coverage.btdRightsTransferredBeforeSettlement, false);
  assert.equal(report.coverage.compensationAllocationMethod, 'source-to-shares-largest-remainder');
  assert.equal(report.coverage.compensationPriceAsset, 'BTC');
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v42-depositing-shortest-path:'));
});

test('V42 Depositing shortest path rows remain source-safe metadata only', () => {
  for (const row of V42_DEPOSITING_SHORTEST_PATH_ROWS) {
    assert.ok(row.rowRoot.startsWith('v42-depositing-shortest-path-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_depositing_compensation_visibility_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawSourceTextVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
