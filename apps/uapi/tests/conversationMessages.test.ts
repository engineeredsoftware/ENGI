/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}));

import { supabaseAdmin } from '@bitcode/supabase';
import { createMessage } from '@bitcode/api/src/conversations/messages';

describe('createMessage attachment references', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists attachment_id from AttachmentReference instead of requiring a former id field', async () => {
    const messageBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-1', conversation_id: 'conv-1', role: 'user', content: 'hello' },
        error: null,
      }),
    };
    const attachmentBuilder = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    const conversationBuilder = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      switch (table) {
        case 'messages':
          return messageBuilder;
        case 'message_attachments':
          return attachmentBuilder;
        case 'conversations':
          return conversationBuilder;
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    await createMessage({
      conversation_id: 'conv-1',
      role: 'user',
      content: 'hello',
      attachments: [{ attachment_id: 'file-1', category: 'file', type: 'pdf' }],
    });

    expect(attachmentBuilder.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          attachment_id: 'file-1',
          attachment_category: 'file',
          attachment_type: 'pdf',
        }),
      ]),
    );
  });

  it('attaches pipeline_run references for assistant messages', async () => {
    const messageBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-2', conversation_id: 'conv-1', role: 'assistant', content: 'done' },
        error: null,
      }),
    };
    const attachmentBuilder = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    const conversationBuilder = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      switch (table) {
        case 'messages':
          return messageBuilder;
        case 'message_attachments':
          return attachmentBuilder;
        case 'conversations':
          return conversationBuilder;
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    await createMessage({
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'done',
      pipeline_run_id: 'run-1',
    });

    expect(attachmentBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        attachment_id: 'run-1',
        attachment_category: 'pipeline_run',
        attachment_type: 'pipeline_run',
      }),
    );
  });
});
