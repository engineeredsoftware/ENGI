import { mapConversationDetailToChat } from '@/components/conversations/ConversationChatMapping/ConversationChatMapping';

describe('ConversationsOverlay attachment hydration', () => {
  it('rehydrates source, destination, and execution attachments into chat tokens', () => {
    const chat = mapConversationDetailToChat({
      id: 'conv-1',
      user_id: 'user-1',
      title: 'Bitcode Terminal',
      created_at: '2026-04-21T12:00:00.000Z',
      updated_at: '2026-04-21T12:05:00.000Z',
      messages: [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          role: 'user',
          content: 'Use bitcode/terminal and route it to Settlement lane.',
          created_at: '2026-04-21T12:01:00.000Z',
          message_attachments: [
            {
              attachment_id: 'repo-1',
              attachment_category: 'integration',
              attachment_type: 'github_repo',
              metadata: {
                token_type: 'source',
                title: 'bitcode/terminal',
                provider: 'github',
                path: 'bitcode/terminal',
              },
            },
            {
              attachment_id: 'dest-1',
              attachment_category: 'integration',
              attachment_type: 'settlement_target',
              metadata: {
                token_type: 'destination',
                title: 'Settlement lane',
                pipelineId: 'run-1',
              },
            },
          ],
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          role: 'assistant',
          content: 'AssetPack execution started.',
          created_at: '2026-04-21T12:02:00.000Z',
          message_attachments: [
            {
              attachment_id: 'run-1',
              attachment_category: 'pipeline_run',
              attachment_type: 'pipeline_run',
              metadata: {
                pipeline_run_id: 'run-1',
              },
            },
          ],
        },
      ],
    });

    expect(chat.messages[0].tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'source',
          text: 'bitcode/terminal',
        }),
        expect.objectContaining({
          type: 'destination',
          text: 'Settlement lane',
          metadata: expect.objectContaining({
            attachment_id: 'dest-1',
            type: 'settlement_target',
          }),
        }),
      ]),
    );

    expect(chat.messages[1].tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'pipeline_run',
          text: 'run-1',
        }),
      ]),
    );
  });
});
