import { buildMockConversationStreamEnvelope } from '@/app/api/conversations/_shared';

describe('conversation stream event contract', () => {
  it('adds source-safe ConversationStreamEvent metadata to every mock SSE row', () => {
    const envelope = buildMockConversationStreamEnvelope({
      content: 'measure this source for a read',
      tokens: [
        { type: 'read_measurement', value: 'Read', metadata: { pipelineType: 'read_measurement' } },
      ],
      conversationId: 'conv-stream-proof',
    });

    expect(envelope.queue.length).toBeGreaterThan(3);

    const eventKinds = new Set(
      envelope.queue
        .map((row: any) => row.conversationStreamEvent?.eventKind)
        .filter(Boolean),
    );

    expect(eventKinds).toEqual(
      new Set([
        'tool_call',
        'retrieval_summary',
        'proof_root',
        'retry_state',
        'completion_decision',
        'model_delta',
      ]),
    );

    for (const row of envelope.queue as any[]) {
      expect(row.conversationStreamEvent).toMatchObject({
        sourceSafetyClass: 'source_safe_conversation_stream_event_metadata',
        promptDisclosurePosture: 'prompt_template_id_only',
        resultDisclosurePosture: 'parsed_result_shape_only',
      });
      expect(row.conversationStreamEvent.eventId).toMatch(/^conversation-stream-event:[a-f0-9]{24}$/);
      expect(row.conversationStreamEvent.proofRoots.eventRoot).toMatch(/^conversation-stream-proof:[a-f0-9]{24}$/);
      expect(row.conversationStreamEvent.redactionPosture).toMatchObject({
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawModelResponseVisible: false,
        globalLedgerAuthorityClaimed: false,
      });
      expect(row.conversationStreamEvent.failClosedStates.length).toBeGreaterThan(0);
    }
  });
});
