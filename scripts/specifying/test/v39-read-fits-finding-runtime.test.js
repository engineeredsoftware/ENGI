import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH,
  V39_READ_FITS_FINDING_RUNTIME_ROW_IDS,
  V39_READ_FITS_FINDING_RUNTIME_ROWS,
  V39_READ_FITS_FINDING_RUNTIME_SCHEMA_ID,
  V39_READ_FITS_FINDING_RUNTIME_SOURCE_SAFETY_VERDICT,
  buildV39ReadFitsFindingRuntime,
} from '../src/canonical/v39-read-fits-finding-runtime.js';

test('V39 ReadFitsFinding runtime report binds many-fit search, replay, storage, and repair', () => {
  const report = buildV39ReadFitsFindingRuntime();

  assert.equal(V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH, '.proofs/v39/read-fits-finding-runtime.json');
  assert.equal(report.artifactId, 'v39-read-fits-finding-runtime');
  assert.equal(report.schemaId, V39_READ_FITS_FINDING_RUNTIME_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_READ_FITS_FINDING_RUNTIME_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_READ_FITS_FINDING_RUNTIME_ROW_IDS]);
  assert.equal(report.rows.length, V39_READ_FITS_FINDING_RUNTIME_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.pipelineName, 'ReadFitsFindingSynthesis');
  assert.equal(report.coverage.phaseCount, 7);
  assert.equal(report.coverage.ptrrAgentCount, 8);
  assert.equal(report.coverage.ptrrStepCount, 32);
  assert.equal(report.coverage.failsafeSequenceCount, 96);
  assert.equal(report.coverage.thricifiedGenerationCount, 96);
  assert.equal(report.coverage.searchChannelCount, 7);
  assert.equal(report.coverage.defaultMaxSelectedCandidates, 12);
  assert.equal(report.coverage.embeddingModel, 'text-embedding-3-small');
  assert.equal(report.coverage.embeddingDimensions, 1536);
  assert.equal(report.coverage.vectorDistanceMetric, 'cosine');
  assert.equal(report.coverage.vectorMatchRpc, 'match_deliverable_vectors');
  assert.equal(report.coverage.acceptedNeedRequired, true);
  assert.equal(report.coverage.manyFitsDiscoveryCovered, true);
  assert.equal(report.coverage.replayReceiptCovered, true);
  assert.equal(report.coverage.repairPostureCovered, true);
  assert.ok(report.coverage.runtimeRecordKinds.includes('candidate_ranking'));
  assert.ok(report.coverage.runtimeRecordKinds.includes('replay_receipt'));
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-read-fits-finding-runtime:'));
});

test('V39 ReadFitsFinding runtime rows remain source-safe metadata only', () => {
  for (const row of V39_READ_FITS_FINDING_RUNTIME_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-read-fits-finding-runtime-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_read_fits_finding_runtime_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
