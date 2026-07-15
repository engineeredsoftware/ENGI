import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V42_READFITSFINDING_PREVIEW_QUOTE_ARTIFACT_PATH,
  V42_READFITSFINDING_PREVIEW_QUOTE_ROWS,
  V42_READFITSFINDING_PREVIEW_QUOTE_ROW_IDS,
  V42_READFITSFINDING_PREVIEW_QUOTE_SCHEMA_ID,
  V42_READFITSFINDING_PREVIEW_QUOTE_SOURCE_SAFETY_VERDICT,
  buildV42ReadFitsFindingPreviewQuote,
} from '../src/canonical/v42-readfitsfinding-preview-quote.js';

test('V42 ReadFitsFinding preview and quote closure binds search, provenance, preview, and quote', () => {
  const report = buildV42ReadFitsFindingPreviewQuote();

  assert.equal(
    V42_READFITSFINDING_PREVIEW_QUOTE_ARTIFACT_PATH,
    '.bitcode/v42-readfitsfinding-preview-quote.json',
  );
  assert.equal(report.artifactId, 'v42-readfitsfinding-preview-quote');
  assert.equal(report.schemaId, V42_READFITSFINDING_PREVIEW_QUOTE_SCHEMA_ID);
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.sourceSafetyVerdict, V42_READFITSFINDING_PREVIEW_QUOTE_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V42_READFITSFINDING_PREVIEW_QUOTE_ROW_IDS]);
  assert.equal(report.rows.length, V42_READFITSFINDING_PREVIEW_QUOTE_ROWS.length);
  assert.equal(report.coverage.rowCount, 12);
  assert.equal(report.coverage.pipelineName, 'ReadFitsFindingSynthesis');
  assert.equal(report.coverage.requiredPriorPipelineName, 'ReadNeedComprehensionSynthesis');
  assert.equal(report.coverage.phaseCount, 7);
  assert.equal(report.coverage.agentCount, 8);
  assert.equal(report.coverage.ptrrStepCount, 32);
  assert.equal(report.coverage.failsafeSequenceCount, 96);
  assert.equal(report.coverage.thricifiedGenerationCount, 96);
  assert.deepEqual(report.coverage.searchChannelIds, [
    'lexical',
    'symbolic',
    'path',
    'metadata',
    'measurement',
    'embedding-vector',
    'provider-specific',
  ]);
  assert.equal(report.coverage.selectedFitProvenanceRequired, true);
  assert.equal(report.coverage.sourceSafePreviewRequired, true);
  assert.equal(report.coverage.deterministicQuoteRequired, true);
  assert.equal(report.coverage.noProtectedSourceBeforeSettlement, true);
  assert.equal(report.coverage.settlementInstructionsRequired, true);
  assert.equal(report.coverage.productPreviewQuoteReadbackCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v42-readfitsfinding-preview-quote:'));
});

test('V42 ReadFitsFinding preview and quote rows remain source-safe metadata', () => {
  for (const row of V42_READFITSFINDING_PREVIEW_QUOTE_ROWS) {
    assert.ok(row.rowRoot.startsWith('v42-readfitsfinding-preview-quote-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_readfitsfinding_preview_quote_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('raw-provider-responses'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
