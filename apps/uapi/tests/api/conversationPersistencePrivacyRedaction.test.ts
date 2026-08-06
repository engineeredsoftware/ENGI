import {
  CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES,
  CONVERSATION_PERSISTENCE_OPERATION_OPTIONS,
  CONVERSATION_PERSISTENCE_VISIBILITY_TIER_OPTIONS,
  assertConversationPersistencePreviewSourceSafe,
  buildConversationPersistencePreview,
  redactConversationPersistencePreviewText,
} from '@/components/conversations/models/conversation-persistence-privacy-redaction';

describe('Conversation persistence privacy redaction', () => {
  it('covers all visibility tiers and persistence operations', () => {
    expect(CONVERSATION_PERSISTENCE_OPERATION_OPTIONS.map((option) => option.operationId)).toEqual([
      'persist_message',
      'restore_history',
      'export_history',
      'delete_history',
      'retain_history',
      'replay_history',
      'incident_repair',
    ]);
    expect(CONVERSATION_PERSISTENCE_VISIBILITY_TIER_OPTIONS.map((option) => option.visibilityTier)).toEqual([
      'public',
      'user_visible',
      'organization_visible',
      'buyer_visible',
      'reviewer_visible',
      'operator_only',
    ]);
    expect(CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES).toContain('protected_source_payloads');
    expect(CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES).toContain('unpaid_assetpack_source');
    expect(CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES).toContain('wallet_private_material');
  });

  it('redacts source-bearing and secret-shaped preview text', () => {
    const result = redactConversationPersistencePreviewText(
      'raw prompt with protected source and password=abc12345678901234567890',
    );

    expect(result.redactionApplied).toBe(true);
    expect(result.text).toContain('[redacted:conversation-persistence]');
    expect(result.text).not.toContain('abc12345678901234567890');
  });

  it('builds source-safe preview proof and operation posture', () => {
    const preview = buildConversationPersistencePreview({
      operationId: 'export_history',
      visibilityTier: 'reviewer_visible',
      conversationId: 'conv-1',
      sourceText: 'source-safe summary',
    });

    expect(preview.sourceSafetyClass).toBe('source_safe_conversation_persistence_privacy_redaction');
    expect(preview.retentionPosture).toBe('reviewer_limited_visible');
    expect(preview.exportAllowed).toBe(true);
    expect(preview.replayAllowed).toBe(true);
    expect(preview.metadata.protectedPromptVisible).toBe(false);
    expect(preview.metadata.protectedModelResponseVisible).toBe(false);
    expect(preview.metadata.protectedSourceVisible).toBe(false);
    expect(preview.metadata.walletPrivateMaterialVisible).toBe(false);
    expect(preview.metadata.unpaidAssetPackSourceVisible).toBe(false);
    expect(preview.proofRoot).toMatch(/^conversation-persistence-privacy:[a-f0-9]{8}$/);
    expect(assertConversationPersistencePreviewSourceSafe(preview)).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_persistence_preview',
    });
  });
});
