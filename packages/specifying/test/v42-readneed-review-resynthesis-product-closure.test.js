import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ARTIFACT_PATH,
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS,
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROW_IDS,
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SCHEMA_ID,
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SOURCE_SAFETY_VERDICT,
  V42_READNEED_REVIEW_RESYNTHESIS_SCHEMA_ID,
  buildV42ReadNeedReviewResynthesisProductClosure,
} from '../src/canonical/v42-readneed-review-resynthesis-product-closure.js';

test('V42 ReadNeed review and resynthesis product closure binds the accepted Need gate', () => {
  const report = buildV42ReadNeedReviewResynthesisProductClosure();

  assert.equal(
    V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ARTIFACT_PATH,
    '.bitcode/v42-readneed-review-resynthesis-product-closure.json',
  );
  assert.equal(report.artifactId, 'v42-readneed-review-resynthesis-product-closure');
  assert.equal(report.schemaId, V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SCHEMA_ID);
  assert.equal(report.schemaId, V42_READNEED_REVIEW_RESYNTHESIS_SCHEMA_ID);
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.sourceSafetyVerdict, V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROW_IDS]);
  assert.equal(report.rows.length, V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS.length);
  assert.equal(report.coverage.rowCount, 11);
  assert.equal(report.coverage.phaseCount, 4);
  assert.equal(report.coverage.ptrrStepCount, 16);
  assert.equal(report.coverage.failsafeSequenceCount, 48);
  assert.equal(report.coverage.thricifiedGenerationCount, 48);
  assert.deepEqual(report.coverage.actions, [
    'synthesize_read_need',
    'resynthesize_read_need',
    'accept_read_need',
    'reject_read_need',
  ]);
  assert.equal(report.coverage.acceptedNeedRequiredForFindingFits, true);
  assert.equal(report.coverage.rejectedNeedBlocksFindingFits, true);
  assert.equal(report.coverage.terminalRuntimeReadbackCovered, true);
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
  assert.ok(report.artifactRoot.startsWith('v42-readneed-review-resynthesis-product-closure:'));
});

test('V42 ReadNeed review rows remain source-safe metadata', () => {
  for (const row of V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS) {
    assert.ok(row.rowRoot.startsWith('v42-readneed-review-resynthesis-product-closure-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_readneed_review_resynthesis_product_closure_metadata');
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
