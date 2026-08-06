import { getConversationRoute } from '@bitcode/api/src/routes/conversations';
import { NextResponse } from 'next/server';

import { getMockConversation, isConversationMockMode } from '../_shared';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ conversationId: string }> | { conversationId: string } },
) {
  const params = await context.params;
  const conversationId = params?.conversationId;

  if (isConversationMockMode()) {
    const conversation = getMockConversation(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json(conversation);
  }

  return getConversationRoute(request, context);
}
