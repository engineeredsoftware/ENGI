import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONVERSATION_PERSISTENCE_FIELD_IDS,
  CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES,
  CONVERSATION_PERSISTENCE_OPERATION_IDS,
  CONVERSATION_PERSISTENCE_RETENTION_POSTURES,
  CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS,
  buildConversationPersistencePrivacyRedaction,
} from '../src/index.js';

test('ConversationPersistencePrivacyRedaction covers storage operations and disclosure tiers', () => {
  const artifact = buildConversationPersistencePrivacyRedaction({
    generatedAt: '2026-05-24T00:00:00.000Z',
  });

  assert.equal(artifact.passed, true, artifact.failures.join('\n'));
  assert.equal(artifact.artifactId, 'v37-conversation-persistence-privacy-redaction');
  assert.equal(artifact.version, 'V37');
  assert.equal(artifact.currentTarget, 'V36');
  assert.equal(
    artifact.sourceSafetyVerdict,
    'source-safe-conversation-persistence-privacy-redaction-metadata',
  );
  assert.deepEqual(artifact.requiredOperationIds, [...CONVERSATION_PERSISTENCE_OPERATION_IDS]);
  assert.deepEqual(artifact.requiredVisibilityTierIds, [...CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS]);
  assert.deepEqual(artifact.requiredRetentionPostures, [...CONVERSATION_PERSISTENCE_RETENTION_POSTURES]);
  assert.deepEqual(artifact.requiredFieldIds, [...CONVERSATION_PERSISTENCE_FIELD_IDS]);
  assert.deepEqual(artifact.forbiddenPayloadClasses, [...CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES]);
  assert.equal(artifact.coverage.operationCount, 7);
  assert.equal(artifact.coverage.allOperationsCovered, true);
  assert.equal(artifact.coverage.allVisibilityTiersCovered, true);
  assert.equal(artifact.coverage.allRetentionPosturesCovered, true);
  assert.equal(artifact.coverage.allFieldsCovered, true);
  assert.equal(artifact.coverage.persistMessageCovered, true);
  assert.equal(artifact.coverage.restoreHistoryCovered, true);
  assert.equal(artifact.coverage.exportHistoryCovered, true);
  assert.equal(artifact.coverage.deleteHistoryCovered, true);
  assert.equal(artifact.coverage.retainHistoryCovered, true);
  assert.equal(artifact.coverage.replayHistoryCovered, true);
  assert.equal(artifact.coverage.incidentRepairCovered, true);
  assert.equal(artifact.coverage.visibilitySeparationCovered, true);
  assert.equal(artifact.coverage.proofRootsCovered, true);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.protectedPromptVisible, false);
  assert.equal(artifact.coverage.protectedModelResponseVisible, false);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.protectedBodiesPersisted, false);
  assert.match(artifact.artifactRoot, /^conversation-persistence-privacy:[a-f0-9]{24}$/u);
  assert.ok(
    artifact.rows.every((row) =>
      /^conversation-persistence-privacy-row:[a-f0-9]{24}$/u.test(String(row.rowRoot)),
    ),
  );
});
