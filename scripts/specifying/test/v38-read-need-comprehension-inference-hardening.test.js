import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH,
  V38_READ_NEED_COMPREHENSION_HARDENING_ROWS,
  V38_READ_NEED_COMPREHENSION_HARDENING_SCHEMA_ID,
  V38_READ_NEED_COMPREHENSION_HARDENING_SOURCE_SAFETY_VERDICT,
  V38_READ_NEED_COMPREHENSION_REQUIRED_PHASE_IDS,
  V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS,
  V38_READ_NEED_COMPREHENSION_REQUIRED_RETURN_TYPES,
  buildV38ReadNeedComprehensionInferenceHardening,
} from '../src/canonical/read-need-comprehension-inference-hardening.js';

test('V38 ReadNeedComprehensionSynthesis hardening report binds phases, receipts, and source-safe disclosure', () => {
  const report = buildV38ReadNeedComprehensionInferenceHardening();

  assert.equal(V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH, '.proofs/v38/read-need-comprehension-inference-hardening.json');
  assert.equal(report.artifactId, 'v38-read-need-comprehension-inference-hardening');
  assert.equal(report.schemaId, V38_READ_NEED_COMPREHENSION_HARDENING_SCHEMA_ID);
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.sourceSafetyVerdict, V38_READ_NEED_COMPREHENSION_HARDENING_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.equal(report.rows.length, V38_READ_NEED_COMPREHENSION_HARDENING_ROWS.length);
  assert.deepEqual(report.requiredPhaseIds, [...V38_READ_NEED_COMPREHENSION_REQUIRED_PHASE_IDS]);
  assert.deepEqual(report.requiredReturnTypes, [...V38_READ_NEED_COMPREHENSION_REQUIRED_RETURN_TYPES]);
  assert.deepEqual(report.requiredReceiptFields, [...V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS]);
  assert.equal(report.coverage.phaseCount, 4);
  assert.equal(report.coverage.ptrrAgentCount, 4);
  assert.equal(report.coverage.ptrrStepCount, 16);
  assert.equal(report.coverage.failsafeSequenceCount, 48);
  assert.equal(report.coverage.thricifiedGenerationCount, 48);
  assert.equal(report.coverage.providerCallSlotCount, 144);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.acceptedNeedRequiredForFindingFits, true);
  assert.equal(report.coverage.resynthesisWithFeedbackCovered, true);
  assert.equal(report.coverage.routeUsesInferenceSynthesis, true);
  assert.equal(report.coverage.terminalSupportsResynthesis, true);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v38-read-need-comprehension-hardening:'));
});

test('V38 ReadNeedComprehensionSynthesis hardening rows cover the reviewable Need lifecycle', () => {
  const rowIds = V38_READ_NEED_COMPREHENSION_HARDENING_ROWS.map((row) => row.rowId);

  assert.deepEqual(rowIds, [
    'phase:request-normalize',
    'phase:comprehend-need',
    'phase:measure-need',
    'phase:review-need',
    'receipt:source-safe-inference-receipt',
  ]);

  for (const row of V38_READ_NEED_COMPREHENSION_HARDENING_ROWS) {
    assert.ok(row.rowRoot.startsWith('v38-read-need-hardening-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_read_need_comprehension_inference_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected_source_payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('raw_model_responses_with_protected_source'));
  }

  const receiptRow = V38_READ_NEED_COMPREHENSION_HARDENING_ROWS.find((row) => row.rowId === 'receipt:source-safe-inference-receipt');
  assert.ok(receiptRow);
  assert.deepEqual(receiptRow.receiptFields, [...V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS]);
});
