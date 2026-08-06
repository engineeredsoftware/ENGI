import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONVERSATION_WRITING_WORKSPACE_ACTION_IDS,
  CONVERSATION_WRITING_WORKSPACE_MODE_IDS,
  buildConversationWritingWorkspace,
} from '../src/index.js';

test('ConversationWritingWorkspace covers every writing mode and action source-safely', () => {
  const artifact = buildConversationWritingWorkspace({
    generatedAt: '2026-05-24T00:00:00.000Z',
  });

  assert.equal(artifact.passed, true, artifact.failures.join('\n'));
  assert.equal(artifact.artifactId, 'v37-conversation-writing-workspace');
  assert.equal(artifact.version, 'V37');
  assert.equal(artifact.currentTarget, 'V36');
  assert.equal(artifact.sourceSafetyVerdict, 'source-safe-conversation-writing-workspace-metadata');
  assert.deepEqual(artifact.requiredModeIds, [...CONVERSATION_WRITING_WORKSPACE_MODE_IDS]);
  assert.deepEqual(artifact.requiredActionIds, [...CONVERSATION_WRITING_WORKSPACE_ACTION_IDS]);
  assert.equal(artifact.coverage.workspaceModeCount, 4);
  assert.equal(artifact.coverage.allModesCovered, true);
  assert.equal(artifact.coverage.allActionsCovered, true);
  assert.equal(artifact.coverage.readRequestCovered, true);
  assert.equal(artifact.coverage.needFeedbackCovered, true);
  assert.equal(artifact.coverage.assetpackReviewNoteCovered, true);
  assert.equal(artifact.coverage.terminalHandoffSummaryCovered, true);
  assert.equal(artifact.coverage.saveRestoreSummarizeHandoffCovered, true);
  assert.equal(artifact.coverage.accessibilityCovered, true);
  assert.equal(artifact.coverage.recoveryStatesCovered, true);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.globalLedgerAuthorityClaimed, false);
  assert.match(artifact.artifactRoot, /^conversation-writing-workspace:[a-f0-9]{24}$/u);
  assert.ok(
    artifact.rows.every((row) => /^conversation-writing-row:[a-f0-9]{24}$/u.test(String(row.rowRoot))),
  );
});
