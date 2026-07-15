import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS,
  CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS,
  CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES,
  CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS,
  buildConversationProductHandoff,
} from '../src/index.js';

test('ConversationProductHandoff covers every Terminal workflow source-safely', () => {
  const artifact = buildConversationProductHandoff({
    generatedAt: '2026-05-24T00:00:00.000Z',
  });

  assert.equal(artifact.passed, true, artifact.failures.join('\n'));
  assert.equal(artifact.artifactId, 'v37-conversation-product-handoff');
  assert.equal(artifact.version, 'V37');
  assert.equal(artifact.currentTarget, 'V36');
  assert.equal(artifact.sourceSafetyVerdict, 'source-safe-conversation-product-handoff-metadata');
  assert.deepEqual(artifact.requiredWorkflowIds, [...CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS]);
  assert.deepEqual(artifact.requiredFieldIds, [...CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS]);
  assert.deepEqual(artifact.requiredAuthorityIds, [...CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS]);
  assert.deepEqual(artifact.requiredPolicyStates, [...CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES]);
  assert.equal(artifact.coverage.workflowCount, 6);
  assert.equal(artifact.coverage.allWorkflowsCovered, true);
  assert.equal(artifact.coverage.allFieldsCovered, true);
  assert.equal(artifact.coverage.allAuthorityBoundariesCovered, true);
  assert.equal(artifact.coverage.allPolicyStatesCovered, true);
  assert.equal(artifact.coverage.depositingCovered, true);
  assert.equal(artifact.coverage.readingCovered, true);
  assert.equal(artifact.coverage.findingFitsCovered, true);
  assert.equal(artifact.coverage.exchangeCovered, true);
  assert.equal(artifact.coverage.settlementCovered, true);
  assert.equal(artifact.coverage.deliveryCovered, true);
  assert.equal(artifact.coverage.retryStatesCovered, true);
  assert.equal(artifact.coverage.proofRootsCovered, true);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.ledgerAuthorityClaimed, false);
  assert.equal(artifact.coverage.walletSigningAuthorityClaimed, false);
  assert.equal(artifact.coverage.terminalCockpitBypassed, false);
  assert.match(artifact.artifactRoot, /^conversation-product-handoff:[a-f0-9]{24}$/u);
  assert.ok(
    artifact.rows.every((row) => /^conversation-product-handoff-row:[a-f0-9]{24}$/u.test(String(row.rowRoot))),
  );
});
