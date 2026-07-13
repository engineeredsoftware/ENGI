import assert from 'node:assert/strict';
import test from './era-pinned-superseded-browser-proofs.js';

import {
  V40_TEST_INVENTORY_COVERAGE_MATRIX_ARTIFACT_PATH,
  V40_TEST_INVENTORY_COVERAGE_MATRIX_SCHEMA_ID,
  V40_TEST_INVENTORY_COVERAGE_MATRIX_SOURCE_SAFETY_VERDICT,
  V40_TEST_INVENTORY_COVERAGE_ROWS,
  V40_TEST_INVENTORY_COVERAGE_TIERS,
  V40_TEST_INVENTORY_SURFACE_IDS,
  buildV40TestInventoryCoverageMatrix,
} from '../src/canonical/v40-test-inventory-coverage-matrix.js';

test('V40 test inventory coverage matrix binds every planned testing surface source-safely', () => {
  const report = buildV40TestInventoryCoverageMatrix();

  assert.equal(V40_TEST_INVENTORY_COVERAGE_MATRIX_ARTIFACT_PATH, '.bitcode/v40-test-inventory-coverage-matrix.json');
  assert.equal(report.artifactId, 'v40-test-inventory-coverage-matrix');
  assert.equal(report.schemaId, V40_TEST_INVENTORY_COVERAGE_MATRIX_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_TEST_INVENTORY_COVERAGE_MATRIX_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.surfaceIds, [...V40_TEST_INVENTORY_SURFACE_IDS]);
  assert.deepEqual(report.coverageTierIds, [...V40_TEST_INVENTORY_COVERAGE_TIERS]);
  assert.equal(report.rows.length, V40_TEST_INVENTORY_COVERAGE_ROWS.length);
  assert.equal(report.coverage.rowCount, 10);
  assert.equal(report.coverage.surfaceCount, 10);
  assert.equal(report.coverage.unitInventoryCovered, true);
  assert.equal(report.coverage.apiIntegrationInventoryCovered, true);
  assert.equal(report.coverage.readingPipelineInventoryCovered, true);
  assert.equal(report.coverage.conversationTerminalInventoryCovered, true);
  assert.equal(report.coverage.browserVisualInventoryCovered, true);
  assert.equal(report.coverage.synchronizationInventoryCovered, true);
  assert.equal(report.coverage.localStagingInventoryCovered, true);
  assert.equal(report.coverage.promptBenchmarkInventoryCovered, true);
  assert.equal(report.coverage.demonstrationInventoryCovered, true);
  assert.equal(report.coverage.workflowInventoryCovered, true);
  assert.equal(report.coverage.v41PromptProgramBoundaryPreserved, true);
  assert.equal(report.coverage.valueBearingMainnetRequired, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-test-inventory-coverage-matrix:'));
});

test('V40 test inventory rows remain source-safe metadata only', () => {
  for (const row of V40_TEST_INVENTORY_COVERAGE_ROWS) {
    assert.ok(row.rowRoot.startsWith('v40-test-inventory-coverage-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_test_inventory_coverage_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
