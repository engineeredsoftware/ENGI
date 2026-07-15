import { postConversationThreadStreamRoute } from '@bitcode/api/src/routes/conversations';

import { createMockConversationStreamResponse, isConversationMockMode } from '../../_shared';

export const runtime = 'nodejs';

type ConversationStreamRequest = {
  content?: string;
  message?: string;
  tokens?: Array<{ type?: string; value?: string; metadata?: Record<string, unknown> }>;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ conversationId: string }> | { conversationId: string } },
) {
  const body = await request.json().catch(() => ({} as ConversationStreamRequest));
  const params = await context.params;

  if (isConversationMockMode()) {
    return createMockConversationStreamResponse({
      conversationId: params?.conversationId,
      content: body.content || body.message,
      tokens: body.tokens,
    });
  }

  return postConversationThreadStreamRoute(
    new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(body),
    }),
    context,
  );
}
