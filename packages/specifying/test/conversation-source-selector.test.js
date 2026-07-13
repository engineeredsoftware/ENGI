import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS,
  CONVERSATION_SOURCE_SELECTOR_KIND_IDS,
  CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES,
  buildConversationSourceSelector,
} from '../src/index.js';

test('ConversationSourceSelector covers every selector kind and policy posture source-safely', () => {
  const artifact = buildConversationSourceSelector({
    generatedAt: '2026-05-24T00:00:00.000Z',
  });

  assert.equal(artifact.passed, true, artifact.failures.join('\n'));
  assert.equal(artifact.artifactId, 'v37-conversation-source-selector');
  assert.equal(artifact.version, 'V37');
  assert.equal(artifact.currentTarget, 'V36');
  assert.equal(artifact.sourceSafetyVerdict, 'source-safe-conversation-source-selector-metadata');
  assert.deepEqual(artifact.requiredKindIds, [...CONVERSATION_SOURCE_SELECTOR_KIND_IDS]);
  assert.deepEqual(artifact.requiredGovernanceIds, [...CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS]);
  assert.deepEqual(artifact.requiredPreviewStates, [...CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES]);
  assert.equal(artifact.coverage.selectorKindCount, 8);
  assert.equal(artifact.coverage.allKindsCovered, true);
  assert.equal(artifact.coverage.allGovernanceCovered, true);
  assert.equal(artifact.coverage.allPreviewStatesCovered, true);
  assert.equal(artifact.coverage.repositoryCovered, true);
  assert.equal(artifact.coverage.branchCovered, true);
  assert.equal(artifact.coverage.commitCovered, true);
  assert.equal(artifact.coverage.depositCovered, true);
  assert.equal(artifact.coverage.btdRangeCovered, true);
  assert.equal(artifact.coverage.assetpackPreviewCovered, true);
  assert.equal(artifact.coverage.documentCovered, true);
  assert.equal(artifact.coverage.priorConversationCovered, true);
  assert.equal(artifact.coverage.denialStatesCovered, true);
  assert.equal(artifact.coverage.retryStatesCovered, true);
  assert.equal(artifact.coverage.proofRootsCovered, true);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.globalLedgerAuthorityClaimed, false);
  assert.match(artifact.artifactRoot, /^conversation-source-selector:[a-f0-9]{24}$/u);
  assert.ok(
    artifact.rows.every((row) => /^conversation-source-selector-row:[a-f0-9]{24}$/u.test(String(row.rowRoot))),
  );
});
