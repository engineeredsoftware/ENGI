import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH,
  V39_DEPOSITORY_SUPPLY_INDEXING_ROW_IDS,
  V39_DEPOSITORY_SUPPLY_INDEXING_ROWS,
  V39_DEPOSITORY_SUPPLY_INDEXING_SCHEMA_ID,
  V39_DEPOSITORY_SUPPLY_INDEXING_SOURCE_SAFETY_VERDICT,
  buildV39DepositorySupplyIndexing,
} from '../src/canonical/v39-depository-supply-indexing.js';

test('V39 Depository supply indexing report binds source-safe lifecycle, vectors, rights, and search handoff', () => {
  const report = buildV39DepositorySupplyIndexing();

  assert.equal(V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH, '.proofs/v39/depository-supply-indexing.json');
  assert.equal(report.artifactId, 'v39-depository-supply-indexing');
  assert.equal(report.schemaId, V39_DEPOSITORY_SUPPLY_INDEXING_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_DEPOSITORY_SUPPLY_INDEXING_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_DEPOSITORY_SUPPLY_INDEXING_ROW_IDS]);
  assert.equal(report.rows.length, V39_DEPOSITORY_SUPPLY_INDEXING_ROWS.length);
  assert.equal(report.coverage.rowCount, 7);
  assert.deepEqual(report.coverage.lifecycleStates, ['indexed-searchable', 'indexed-repair-required', 'blocked-readiness']);
  assert.deepEqual(report.coverage.searchDocumentKinds, ['lexical', 'metadata', 'measurement', 'vector']);
  assert.equal(report.coverage.embeddingProvider, 'openai');
  assert.equal(report.coverage.embeddingModel, 'text-embedding-3-small');
  assert.equal(report.coverage.embeddingDimensions, 1536);
  assert.equal(report.coverage.vectorDistanceMetric, 'cosine');
  assert.equal(report.coverage.vectorMatchRpc, 'match_deliverable_vectors');
  assert.deepEqual(report.coverage.storageTables, ['deliverables', 'deliverable_vectors']);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.findingFitsHandoffCovered, true);
  assert.equal(report.coverage.rightsBoundaryCovered, true);
  assert.equal(report.coverage.repairActionsCovered, true);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v39-depository-supply-indexing:'));
});

test('V39 Depository supply rows remain source-safe metadata only', () => {
  for (const row of V39_DEPOSITORY_SUPPLY_INDEXING_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-depository-supply-indexing-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_depository_supply_indexing_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawSourceTextVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
