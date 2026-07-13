import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V42_AI_READING_DEMONSTRATION_ARTIFACT_PATH,
  V42_AI_READING_DEMONSTRATION_ROW_IDS,
  V42_AI_READING_DEMONSTRATION_SCHEMA_ID,
  buildV42AiReadingDemonstration,
} from '../src/canonical/v42-ai-reading-demonstration.js';

test('V42 AI-reading demonstration artifact is source-safe and complete', () => {
  const artifact = buildV42AiReadingDemonstration();

  assert.equal(V42_AI_READING_DEMONSTRATION_ARTIFACT_PATH, '.bitcode/v42-ai-reading-demonstration.json');
  assert.equal(artifact.artifactId, 'v42-ai-reading-demonstration');
  assert.equal(artifact.schemaId, V42_AI_READING_DEMONSTRATION_SCHEMA_ID);
  assert.equal(artifact.version, 'V42');
  assert.equal(artifact.currentTarget, 'V41');
  assert.deepEqual(artifact.rowIds, [...V42_AI_READING_DEMONSTRATION_ROW_IDS]);
  assert.equal(artifact.coverage.rowCount, 8);
  assert.equal(artifact.coverage.baselineMode, 'public-data-only');
  assert.equal(artifact.coverage.enhancedMode, 'assetpack-enhanced-after-rights');
  assert.equal(artifact.coverage.expectedBaselineBp, 0);
  assert.equal(artifact.coverage.expectedTreatmentBp, 10000);
  assert.equal(artifact.coverage.minimumUpliftBp, 2400);
  assert.equal(artifact.coverage.expectedSelectedDepositId, 'deposit-auth-migration-runbook');
  assert.equal(artifact.coverage.expectedFitResultState, 'worthy_fit');
  assert.equal(artifact.coverage.protectedSourceBeforeSettlement, 'withheld_until_settlement');
  assert.equal(artifact.coverage.sourceBearingDeliveryRequiresSettlement, true);
  assert.equal(artifact.coverage.deterministicLocalOnly, true);
  assert.equal(artifact.coverage.selfContainedDemonstration, true);
  assert.equal(artifact.coverage.outsideRuntimeImportRequired, false);
  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourcePayloadSerialized, false);
  assert.equal(artifact.coverage.rawProtectedPromptVisible, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v42-ai-reading-demonstration:/u);
});

