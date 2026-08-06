import {
  assertConversationPersistenceSourceSafe,
  buildConversationPersistenceEnvelope,
  buildPersistedConversationMessageRecord,
  redactConversationPersistenceValue,
} from '../privacy';

describe('conversation persistence privacy redaction', () => {
  it('redacts secrets and protected source-shaped content before storage', () => {
    const persisted = buildPersistedConversationMessageRecord({
      conversationId: 'conv-1',
      messageId: 'msg-1',
      role: 'user',
      content:
        'Use raw prompt with protected source and token=abc12345678901234567890 for this conversation.',
    });

    expect(persisted.content).toContain('[redacted:conversation-persistence');
    expect(persisted.content).not.toContain('abc12345678901234567890');
    expect(persisted.envelope.sourceSafetyClass).toBe(
      'source_safe_conversation_persistence_privacy_redaction',
    );
    expect(persisted.envelope.redactionApplied).toBe(true);
    expect(persisted.envelope.disclosureBoundary.mustNotExpose).toContain('protected_source_payloads');
    expect(persisted.envelope.disclosureBoundary.mustNotExpose).toContain('unpaid_assetpack_source');
  });

  it('recursively redacts sensitive metadata fields', () => {
    const redacted = redactConversationPersistenceValue({
      sourceRef: 'octocat/Spoon-Knife',
      providerToken: 'Bearer abcdefghijklmnopqrstuvwxyz12345',
      token_type: 'source',
      nested: {
        walletPrivateMaterial: 'must not persist',
        summary: 'source-safe',
      },
    });

    expect(redacted.redactionApplied).toBe(true);
    expect(redacted.redactedPaths).toEqual(['$.providerToken', '$.nested.walletPrivateMaterial']);
    expect(JSON.stringify(redacted.value)).not.toContain('abcdefghijklmnopqrstuvwxyz12345');
    expect(JSON.stringify(redacted.value)).not.toContain('must not persist');
    expect(JSON.stringify(redacted.value)).toContain('octocat/Spoon-Knife');
    expect((redacted.value as Record<string, unknown>).token_type).toBe('source');
  });

  it('redacts closed and unclosed private key PEM blocks without exposing key material', () => {
    const closedKey = [
      'before',
      '-----BEGIN PRIVATE KEY-----',
      'abc123',
      '-----END PRIVATE KEY-----',
      'after',
    ].join('\n');
    const unclosedKey = `${'-----BEGIN PRIVATE KEY-----'.repeat(200)}untrusted-tail`;

    const closed = redactConversationPersistenceValue({ note: closedKey });
    const unclosed = redactConversationPersistenceValue({ note: unclosedKey });

    expect(JSON.stringify(closed.value)).toContain('[redacted:conversation-persistence-secret]');
    expect(JSON.stringify(closed.value)).not.toContain('abc123');
    expect(JSON.stringify(unclosed.value)).toContain('[redacted:conversation-persistence-secret]');
    expect(JSON.stringify(unclosed.value)).not.toContain('untrusted-tail');
    expect(closed.redactionApplied).toBe(true);
    expect(unclosed.redactionApplied).toBe(true);
  });

  it('admits only envelopes with the full forbidden disclosure boundary', () => {
    const envelope = buildConversationPersistenceEnvelope({
      operationId: 'export_history',
      visibilityTier: 'user_visible',
      redactionApplied: false,
      seed: { conversationId: 'conv-1' },
    });

    expect(
      assertConversationPersistenceSourceSafe({
        envelope,
        serializedPayload: JSON.stringify({ content: 'source-safe summary' }),
      }),
    ).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_persistence_payload',
      missingBoundary: [],
    });

    expect(
      assertConversationPersistenceSourceSafe({
        envelope: {
          ...envelope,
          disclosureBoundary: {
            ...envelope.disclosureBoundary,
            mustNotExpose: ['protected_source_payloads'],
          },
        },
      }),
    ).toEqual({
      admitted: false,
      reason: 'missing_conversation_persistence_disclosure_boundary',
      missingBoundary: expect.arrayContaining(['secret_values', 'unpaid_assetpack_source']),
    });
  });
});
