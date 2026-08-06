import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V40_READING_PIPELINE_EXPECTED_TOTALS,
  V40_READING_PIPELINE_INTEGRATION_COVERAGE_ARTIFACT_PATH,
  V40_READING_PIPELINE_INTEGRATION_COVERAGE_SCHEMA_ID,
  V40_READING_PIPELINE_INTEGRATION_COVERAGE_SOURCE_SAFETY_VERDICT,
  V40_READING_PIPELINE_INTEGRATION_ROWS,
  V40_READING_PIPELINE_INTEGRATION_SURFACE_IDS,
  V40_READING_PIPELINE_INTEGRATION_VERDICTS,
  V40_READING_PIPELINE_NAMES,
  buildV40ReadingPipelineIntegrationCoverage,
} from '../src/canonical/v40-reading-pipeline-integration-coverage.js';

test('V40 Reading pipeline integration coverage closes both commercial Reading pipelines', () => {
  const report = buildV40ReadingPipelineIntegrationCoverage();

  assert.equal(
    V40_READING_PIPELINE_INTEGRATION_COVERAGE_ARTIFACT_PATH,
    '.proofs/v40/reading-pipeline-integration-coverage.json',
  );
  assert.equal(report.artifactId, 'v40-reading-pipeline-integration-coverage');
  assert.equal(report.schemaId, V40_READING_PIPELINE_INTEGRATION_COVERAGE_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_READING_PIPELINE_INTEGRATION_COVERAGE_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.pipelineNames, [...V40_READING_PIPELINE_NAMES]);
  assert.deepEqual(report.surfaceIds, [...V40_READING_PIPELINE_INTEGRATION_SURFACE_IDS]);
  assert.deepEqual(report.verdictIds, [...V40_READING_PIPELINE_INTEGRATION_VERDICTS]);
  assert.equal(report.rows.length, V40_READING_PIPELINE_INTEGRATION_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.surfaceCount, 9);
  assert.equal(report.coverage.coveredRowCount, 9);
  assert.equal(report.coverage.missingRowCount, 0);
  assert.equal(report.coverage.blockedRowCount, 0);
  assert.equal(report.coverage.exemptRowCount, 0);
  assert.equal(report.coverage.allCriticalSurfacesClosed, true);
  assert.deepEqual(report.coverage.expectedTotals, { ...V40_READING_PIPELINE_EXPECTED_TOTALS });
  assert.equal(report.coverage.readNeedComprehensionIntegrationClosed, true);
  assert.equal(report.coverage.readFitsFindingIntegrationClosed, true);
  assert.equal(report.coverage.depositorySearchCoverageClosed, true);
  assert.equal(report.coverage.ptrrAgentIntegrationClosed, true);
  assert.equal(report.coverage.previewSettlementDeliveryClosed, true);
  assert.equal(report.coverage.observabilityReadbackCoverageClosed, true);
  assert.equal(report.coverage.terminalHarnessCoverageClosed, true);
  assert.equal(report.coverage.primitiveHostIntegrationClosed, true);
  assert.equal(report.coverage.localStagingRehearsalLinked, true);
  assert.equal(report.coverage.promptContentRewriteDeferredToV41, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-reading-pipeline-integration-coverage:'));
});

test('V40 Reading pipeline integration rows remain source-safe metadata only', () => {
  for (const row of V40_READING_PIPELINE_INTEGRATION_ROWS) {
    assert.equal(row.verdict, 'covered');
    assert.ok(row.rowRoot.startsWith('v40-reading-pipeline-integration-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_reading_pipeline_integration_coverage_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.valueBearingMainnetRequired, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
    assert.ok(row.pipelineNames.length > 0);
    assert.ok(row.sourceRoots.length > 0);
    assert.ok(row.testPaths.length > 0);
    assert.ok(row.commandIds.length > 0);
    assert.ok(row.requiredSourceMarkers.length > 0);
    assert.ok(row.requiredTestMarkers.length > 0);
  }
});
