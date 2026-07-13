import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V40_UNIT_COVERAGE_INVENTORY_ARTIFACT_PATH,
  V40_UNIT_COVERAGE_INVENTORY_SCHEMA_ID,
  V40_UNIT_COVERAGE_INVENTORY_SOURCE_SAFETY_VERDICT,
  V40_UNIT_COVERAGE_ROWS,
  V40_UNIT_COVERAGE_SURFACE_IDS,
  V40_UNIT_COVERAGE_VERDICTS,
  buildV40UnitCoverageInventory,
} from '../src/canonical/v40-unit-coverage-inventory.js';

test('V40 unit coverage inventory closes package and primitive unit surfaces', () => {
  const report = buildV40UnitCoverageInventory();

  assert.equal(V40_UNIT_COVERAGE_INVENTORY_ARTIFACT_PATH, '.bitcode/v40-unit-coverage-inventory.json');
  assert.equal(report.artifactId, 'v40-unit-coverage-inventory');
  assert.equal(report.schemaId, V40_UNIT_COVERAGE_INVENTORY_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_UNIT_COVERAGE_INVENTORY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.surfaceIds, [...V40_UNIT_COVERAGE_SURFACE_IDS]);
  assert.deepEqual(report.verdictIds, [...V40_UNIT_COVERAGE_VERDICTS]);
  assert.equal(report.rows.length, V40_UNIT_COVERAGE_ROWS.length);
  assert.equal(report.coverage.rowCount, 12);
  assert.equal(report.coverage.surfaceCount, 12);
  assert.equal(report.coverage.coveredRowCount, 12);
  assert.equal(report.coverage.missingRowCount, 0);
  assert.equal(report.coverage.blockedRowCount, 0);
  assert.equal(report.coverage.exemptRowCount, 0);
  assert.equal(report.coverage.allCriticalSurfacesClosed, true);
  assert.equal(report.coverage.packagePrimitiveCoverageClosed, true);
  assert.equal(report.coverage.inferencePrimitiveCoverageClosed, true);
  assert.equal(report.coverage.executionPipelineCoverageClosed, true);
  assert.equal(report.coverage.readingImplementationCoverageClosed, true);
  assert.equal(report.coverage.interfaceHelperCoverageClosed, true);
  assert.equal(report.coverage.demonstrationBoundaryCoverageClosed, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-unit-coverage-inventory:'));
});

test('V40 unit coverage rows remain source-safe metadata only', () => {
  for (const row of V40_UNIT_COVERAGE_ROWS) {
    assert.equal(row.verdict, 'covered');
    assert.ok(row.rowRoot.startsWith('v40-unit-coverage-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_unit_coverage_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
    assert.ok(row.testPaths.length > 0);
    assert.ok(row.commandIds.length > 0);
  }
});
