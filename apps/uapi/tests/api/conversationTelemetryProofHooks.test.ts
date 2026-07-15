import {
  assertConversationTelemetryProofPreviewSourceSafe,
  buildConversationTelemetryProofPreview,
} from '@/components/conversations/models/conversation-telemetry-proof-hooks';

describe('conversation telemetry proof hook preview', () => {
  it('binds source-safe telemetry families to dashboard and runbook posture', () => {
    const preview = buildConversationTelemetryProofPreview({
      eventFamily: 'product_handoff',
      visibilityTier: 'user_visible',
      conversationId: 'conv-1',
      sourceText: 'protected source with token=abc12345678901234567890 must never be visible',
    });

    expect(preview.eventFamily).toBe('product_handoff');
    expect(preview.dashboardPanel).toBe('conversation.dashboard.terminal-handoff');
    expect(preview.runbookId).toBe('runbook.conversation.terminal-handoff-repair');
    expect(preview.proofRoot).toMatch(/^conversation-telemetry-proof:[a-f0-9]{8}$/);
    expect(preview.sourceSafePreview).toContain('[redacted:conversation-telemetry]');
    expect(preview.sourceSafePreview).not.toContain('abc12345678901234567890');
    expect(preview.metadata.dashboardBound).toBe(true);
    expect(preview.metadata.runbookBound).toBe(true);
    expect(assertConversationTelemetryProofPreviewSourceSafe(preview)).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_telemetry_proof_preview',
    });
  });
});
