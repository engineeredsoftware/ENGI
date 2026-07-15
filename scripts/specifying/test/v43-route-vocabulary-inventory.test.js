import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V43_ROUTE_VOCABULARY_CATEGORY_IDS,
  V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH,
  V43_ROUTE_VOCABULARY_INVENTORY_SCHEMA_ID,
  V43_ROUTE_VOCABULARY_INVENTORY_SOURCE_SAFETY_VERDICT,
  V43_ROUTE_VOCABULARY_MIGRATION_ROW_IDS,
  V43_ROUTE_VOCABULARY_MIGRATION_ROWS,
  V43_ROUTE_VOCABULARY_TOKEN_IDS,
  buildV43RouteVocabularyInventory,
} from '../src/canonical/v43-route-vocabulary-inventory.js';

test('V43 route vocabulary inventory binds source-safe route migration metadata', () => {
  const report = buildV43RouteVocabularyInventory();

  assert.equal(V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH, '.bitcode/v43-route-vocabulary-inventory.json');
  assert.equal(report.artifactId, 'v43-route-vocabulary-inventory');
  assert.equal(report.schemaId, V43_ROUTE_VOCABULARY_INVENTORY_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_ROUTE_VOCABULARY_INVENTORY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.ok(report.artifactRoot.startsWith('v43-route-vocabulary-inventory:'));
  assert.deepEqual(report.tokenIds, [...V43_ROUTE_VOCABULARY_TOKEN_IDS]);
  assert.deepEqual(report.categoryIds, [...V43_ROUTE_VOCABULARY_CATEGORY_IDS]);
  assert.deepEqual(report.migrationRowIds, [...V43_ROUTE_VOCABULARY_MIGRATION_ROW_IDS]);
  assert.equal(report.migrationRows.length, V43_ROUTE_VOCABULARY_MIGRATION_ROWS.length);
  assert.equal(report.coverage.routeVocabularyInventoryComplete, true);
  assert.equal(report.coverage.migrationMatrixComplete, true);
  assert.equal(report.coverage.packsMigrationPlanned, true);
  assert.equal(report.coverage.readMigrationPlanned, true);
  assert.equal(report.coverage.depositMigrationPlanned, true);
  assert.equal(report.coverage.retainedDebugCockpitBoundaryPlanned, true);
  assert.equal(report.coverage.redirectCompatibilityPlanned, true);
  assert.equal(report.coverage.selfReferentialCopyRemovalPlanned, true);
  assert.equal(report.coverage.tokenTotals['route:/exchange'] > 0 || report.coverage.tokenTotals['symbol:Exchange'] > 0, true);
  assert.equal(report.coverage.tokenTotals['route:/terminal'] > 0 || report.coverage.tokenTotals['symbol:Terminal'] > 0, true);
  assert.equal(report.coverage.tokenTotals['route:/packs'] > 0, true);
  assert.equal(report.coverage.tokenTotals['route:/read'] > 0, true);
  assert.equal(report.coverage.tokenTotals['route:/deposit'] > 0, true);
  assert.equal(report.coverage.categoryTotals.route > 0, true);
  assert.equal(report.coverage.categoryTotals.component > 0, true);
  assert.equal(report.coverage.categoryTotals.test > 0, true);
  assert.equal(report.coverage.categoryTotals.doc > 0, true);
  assert.equal(report.coverage.categoryTotals.api > 0, true);
  assert.equal(report.coverage.categoryTotals.telemetry > 0, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
});

test('V43 route vocabulary migration rows and inventory files remain source-safe metadata only', () => {
  const report = buildV43RouteVocabularyInventory();

  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.sourceSnippetVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.ok(report.coverage.forbiddenPayloadClasses.includes('source-snippets'));
  assert.ok(report.coverage.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));

  for (const row of report.migrationRows) {
    assert.ok(row.rowRoot.startsWith('v43-route-vocabulary-migration-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_route_vocabulary_migration_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.rawSourceTextVisible, false);
    assert.equal(row.sourceSnippetVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
  }

  for (const sourceFile of report.sourceFiles) {
    assert.ok(sourceFile.pathRoot.startsWith('v43-route-vocabulary-file:'));
    assert.equal(sourceFile.sourceSafeMetadataOnly, true);
    assert.equal(sourceFile.rawSourceTextSerialized, false);
    assert.equal(sourceFile.sourceSnippetSerialized, false);
    assert.equal(typeof sourceFile.path, 'string');
    assert.equal(typeof sourceFile.totalMatches, 'number');
    assert.ok(!Object.values(sourceFile.tokenCounts).some((value) => typeof value !== 'number'));
  }
});
