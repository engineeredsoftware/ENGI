import assert from 'node:assert/strict';
import test from './era-pinned-superseded-routes.js';

import {
  V44_READING_BUDGET_QUOTE_FORBIDDEN_PAYLOAD_IDS,
  V44_READING_BUDGET_QUOTE_OBJECT_IDS,
  V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH,
  V44_READING_BUDGET_QUOTE_POLICY_ROWS,
  V44_READING_BUDGET_STATE_IDS,
  V44_READING_QUOTE_STATE_IDS,
  V44_READING_SETTLEMENT_READINESS_IDS,
  buildV44ReadingBudgetQuotePolicy,
} from '../src/canonical/v44-reading-budget-quote-policy.js';

test('V44 Reading budget quote policy binds source-safe procurement governance', () => {
  const artifact = buildV44ReadingBudgetQuotePolicy();

  assert.equal(artifact.artifactId, 'v44-reading-budget-quote-policy');
  assert.equal(artifact.schemaId, 'bitcode.v44.readingBudgetQuotePolicy.v1');
  assert.equal(artifact.version, 'V44');
  assert.equal(artifact.currentTarget, 'V43');
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v44-reading-budget-quote-policy:[a-f0-9]{24}$/u);
  assert.equal(artifact.objectIds.length, V44_READING_BUDGET_QUOTE_OBJECT_IDS.length);
  assert.equal(artifact.budgetStateIds.length, V44_READING_BUDGET_STATE_IDS.length);
  assert.equal(artifact.quoteStateIds.length, V44_READING_QUOTE_STATE_IDS.length);
  assert.equal(artifact.settlementReadinessIds.length, V44_READING_SETTLEMENT_READINESS_IDS.length);
  assert.equal(artifact.rows.length, V44_READING_BUDGET_QUOTE_POLICY_ROWS.length);
  assert.equal(artifact.sourceRoots.readModel.startsWith('uapi/components/reads/models/read-route-model.ts:'), true);
  assert.equal(artifact.sourceRoots.sourceToShares.startsWith('packages/btd/src/source-to-shares.ts:'), true);
  assert.equal(artifact.sourceRoots.btcFeeOperation.startsWith('packages/btd/src/btc-fee-operation.ts:'), true);
  assert.equal(artifact.coverage.budgetEnvelopeImplemented, true);
  assert.equal(artifact.coverage.approvalThresholdImplemented, true);
  assert.equal(artifact.coverage.quoteExpiryImplemented, true);
  assert.equal(artifact.coverage.deterministicShareToFeeImplemented, true);
  assert.equal(artifact.coverage.btcBtdSettlementReadinessImplemented, true);
  assert.equal(artifact.coverage.readRouteUiImplemented, true);
  assert.equal(artifact.coverage.failedPredicateIds.length, 0);
});

test('V44 Reading budget quote policy rows remain source-safe', () => {
  const artifact = buildV44ReadingBudgetQuotePolicy();

  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.rawPromptVisible, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(artifact.coverage.valueBearingMainnetAdmitted, false);
  assert.equal(artifact.forbiddenPayloadIds.length, V44_READING_BUDGET_QUOTE_FORBIDDEN_PAYLOAD_IDS.length);
  assert.equal(artifact.rows.every((row) => row.sourceSafeMetadataOnly), true);
  assert.equal(artifact.rows.every((row) => row.protectedSourceVisible === false), true);
  assert.equal(artifact.rows.every((row) => row.unpaidAssetPackSourceVisible === false), true);
  assert.equal(artifact.sourceSafetyVerdict, 'source-safe-reading-budget-quote-policy-metadata');
  assert.equal(V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH, '.bitcode/v44-reading-budget-quote-policy.json');
});
