import { postConversationStreamRoute } from '@bitcode/api/src/routes/conversations';

import { createMockConversationStreamResponse, isConversationMockMode } from '../_shared';

export const runtime = 'nodejs';

type ConversationStreamRequest = {
  message?: string;
  content?: string;
  tokens?: Array<{ type?: string; value?: string; metadata?: Record<string, unknown> }>;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as ConversationStreamRequest));

  if (isConversationMockMode()) {
    return createMockConversationStreamResponse({
      content: body.content || body.message,
      tokens: body.tokens,
    });
  }

  return postConversationStreamRoute(
    new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(body),
    }),
  );
}
