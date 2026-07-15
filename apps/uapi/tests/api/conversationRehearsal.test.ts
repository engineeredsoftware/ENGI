import {
  assertConversationRehearsalPreviewSourceSafe,
  buildConversationRehearsalPreview,
} from '@/components/conversations/models/conversation-rehearsal';

describe('conversation rehearsal preview', () => {
  it('redacts source-bearing and secret-shaped text', () => {
    const preview = buildConversationRehearsalPreview({
      laneId: 'staging-testnet',
      flowId: 'redaction',
      conversationId: 'conv-1',
      sourceText: 'raw prompt with protected source and token=abc12345678901234567890',
    });

    expect(preview.sourceSafetyVerdict).toBe('source-safe-conversation-rehearsal-metadata');
    expect(preview.sourceSafePreview).not.toContain('abc12345678901234567890');
    expect(preview.sourceSafePreview).toContain('[redacted:conversation-rehearsal]');
    expect(preview.proofRoot).toMatch(/^conversation-rehearsal:[a-f0-9]{8}$/);
    expect(preview.routeUiCheckRoot).toMatch(/^conversation-rehearsal-route-ui:[a-f0-9]{8}$/);
    expect(preview.telemetryRoot).toMatch(/^conversation-rehearsal-telemetry:[a-f0-9]{8}$/);
    expect(preview.screenshotOrLogRoot).toMatch(/^conversation-rehearsal-source-safety:[a-f0-9]{8}$/);
    expect(assertConversationRehearsalPreviewSourceSafe(preview)).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_rehearsal_preview',
    });
  });

  it('keeps value-bearing mainnet blocked in rehearsal previews', () => {
    const preview = buildConversationRehearsalPreview({
      laneId: 'value-bearing-mainnet',
      flowId: 'product_handoff',
      conversationId: 'conv-2',
    });

    expect(preview.status).toBe('blocked');
    expect(preview.metadata.valueBearingMainnetAdmission).toBe(false);
    expect(preview.metadata.ledgerWriteAuthorityVisible).toBe(false);
    expect(preview.metadata.walletSigningAuthorityVisible).toBe(false);
  });
});
