/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useConversationStream } from '@/hooks/useConversationStream';

describe('useConversationStream first-write routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('routes draft conversations through the root stream endpoint and forwards the persisted conversation id', async () => {
    const onMessageComplete = jest.fn();
    const encoder = new TextEncoder();
    const streamPayload = encoder.encode(
      `data: ${JSON.stringify({
        type: 'message_complete',
        data: {
          messageId: 'msg-1',
          content: 'Bitcode Terminal write path accepted the instruction.',
          conversationId: 'conv-persisted-1',
        },
      })}\n\n`,
    );
    const read = jest
      .fn()
      .mockResolvedValueOnce({
        done: false,
        value: streamPayload,
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read,
        }),
      },
    });

    const { result } = renderHook(() =>
      useConversationStream({
        conversationId: 'draft-conv-1',
        onMessageComplete,
      }),
    );

    await act(async () => {
      await result.current.sendMessage('Measure read fit against the attached source.', []);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/conversations/stream',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    await waitFor(() => {
      expect(onMessageComplete).toHaveBeenCalledWith(
        'msg-1',
        'Bitcode Terminal write path accepted the instruction.',
        'conv-persisted-1',
      );
    });
    expect(read).toHaveBeenCalledTimes(2);
  });
});
