import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS,
  CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS,
  CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES,
  CONVERSATION_TELEMETRY_PROOF_HOOKS_SOURCE_SAFETY_VERDICT,
  CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS,
  CONVERSATION_TELEMETRY_RUNBOOK_IDS,
  buildConversationTelemetryProofHooks,
} from '../src/index.js';

test('ConversationTelemetryProofHooks covers source-safe event families, dashboards, and runbooks', () => {
  const artifact = buildConversationTelemetryProofHooks({
    generatedAt: '2026-05-24T00:00:00.000Z',
  });

  assert.equal(artifact.passed, true, artifact.failures.join('\n'));
  assert.equal(artifact.artifactId, 'v37-conversation-telemetry-proof-hooks');
  assert.equal(artifact.version, 'V37');
  assert.equal(artifact.currentTarget, 'V36');
  assert.equal(artifact.sourceSafetyVerdict, CONVERSATION_TELEMETRY_PROOF_HOOKS_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(artifact.requiredEventFamilies, [...CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS]);
  assert.deepEqual(artifact.requiredFieldIds, [...CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS]);
  assert.deepEqual(artifact.requiredDashboardPanels, [...CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS]);
  assert.deepEqual(artifact.requiredRunbookIds, [...CONVERSATION_TELEMETRY_RUNBOOK_IDS]);
  assert.deepEqual(artifact.forbiddenPayloadClasses, [...CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES]);
  assert.equal(artifact.coverage.eventFamilyCount, 9);
  assert.equal(artifact.coverage.allRequiredFamiliesCovered, true);
  assert.equal(artifact.coverage.allDashboardPanelsCovered, true);
  assert.equal(artifact.coverage.allRunbooksCovered, true);
  assert.equal(artifact.coverage.sessionTelemetryCovered, true);
  assert.equal(artifact.coverage.messageTelemetryCovered, true);
  assert.equal(artifact.coverage.streamTelemetryCovered, true);
  assert.equal(artifact.coverage.toolTelemetryCovered, true);
  assert.equal(artifact.coverage.sourceSelectorTelemetryCovered, true);
  assert.equal(artifact.coverage.terminalHandoffTelemetryCovered, true);
  assert.equal(artifact.coverage.retryTelemetryCovered, true);
  assert.equal(artifact.coverage.errorTelemetryCovered, true);
  assert.equal(artifact.coverage.completionTelemetryCovered, true);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(artifact.coverage.protectedPromptVisible, false);
  assert.equal(artifact.coverage.protectedModelResponseVisible, false);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.match(artifact.artifactRoot, /^conversation-telemetry-proof-hooks:[a-f0-9]{24}$/u);
  assert.ok(
    artifact.rows.every((row) =>
      /^conversation-telemetry-row:[a-f0-9]{24}$/u.test(String(row.rowRoot)),
    ),
  );
});
