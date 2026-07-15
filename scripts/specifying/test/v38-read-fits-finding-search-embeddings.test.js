import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_READ_FITS_FINDING_REQUIRED_PHASE_IDS,
  V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS,
  V38_READ_FITS_FINDING_REQUIRED_RETURN_TYPES,
  V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS,
  V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH,
  V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS,
  V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SCHEMA_ID,
  V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SOURCE_SAFETY_VERDICT,
  buildV38ReadFitsFindingSearchEmbeddings,
} from '../src/canonical/read-fits-finding-search-embeddings.js';

test('V38 ReadFitsFindingSynthesis search report binds many-fit search, embeddings, and source-safe receipts', () => {
  const report = buildV38ReadFitsFindingSearchEmbeddings();

  assert.equal(V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH, '.bitcode/v38-read-fits-finding-search-embeddings.json');
  assert.equal(report.artifactId, 'v38-read-fits-finding-search-embeddings');
  assert.equal(report.schemaId, V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SCHEMA_ID);
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.sourceSafetyVerdict, V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.equal(report.rows.length, V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS.length);
  assert.deepEqual(report.requiredPhaseIds, [...V38_READ_FITS_FINDING_REQUIRED_PHASE_IDS]);
  assert.deepEqual(report.requiredReturnTypes, [...V38_READ_FITS_FINDING_REQUIRED_RETURN_TYPES]);
  assert.deepEqual(report.searchChannelIds, [...V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS]);
  assert.deepEqual(report.requiredReceiptFields, [...V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS]);
  assert.equal(report.coverage.phaseCount, 7);
  assert.equal(report.coverage.ptrrAgentCount, 8);
  assert.equal(report.coverage.ptrrStepCount, 32);
  assert.equal(report.coverage.failsafeSequenceCount, 96);
  assert.equal(report.coverage.thricifiedGenerationCount, 96);
  assert.equal(report.coverage.providerCallSlotCount, 288);
  assert.equal(report.coverage.toolCount, 4);
  assert.equal(report.coverage.searchChannelCount, 7);
  assert.equal(report.coverage.defaultMaxSelectedCandidates, 12);
  assert.equal(report.coverage.embeddingProvider, 'openai');
  assert.equal(report.coverage.embeddingModel, 'text-embedding-3-small');
  assert.equal(report.coverage.embeddingDimensions, 1536);
  assert.equal(report.coverage.vectorDistanceMetric, 'cosine');
  assert.equal(report.coverage.vectorMatchRpc, 'match_deliverable_vectors');
  assert.equal(report.coverage.manyFitsDiscoveryCovered, true);
  assert.equal(report.coverage.acceptedNeedRequiredForFindingFits, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v38-read-fits-finding-search:'));
});

test('V38 ReadFitsFindingSynthesis search rows cover depository discovery and embedding policy', () => {
  const rowIds = V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS.map((row) => row.rowId);

  assert.deepEqual(rowIds, [
    'phase:accepted-need-admission',
    'phase:source-safe-query-plan',
    'phase:many-fit-discovery',
    'channel:embedding-policy',
    'ranking:threshold-verification',
    'provenance:selected-fit-deposits',
    'receipt:source-safe-search-receipt',
  ]);

  for (const row of V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS) {
    assert.ok(row.rowRoot.startsWith('v38-read-fits-finding-search-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_read_fits_finding_search_embeddings_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected_source_payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('raw_model_responses_with_protected_source'));
  }

  const receiptRow = V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS.find((row) => row.rowId === 'receipt:source-safe-search-receipt');
  assert.ok(receiptRow);
  assert.deepEqual(receiptRow.receiptFields, [...V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS]);
});
