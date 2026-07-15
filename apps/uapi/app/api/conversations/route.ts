import {
  postConversationsRoute,
  getConversationsRoute,
} from '@bitcode/api/src/routes/conversations';
import { NextResponse } from 'next/server';

import {
  createMockConversation,
  isConversationMockMode,
  listMockConversations,
} from './_shared';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (isConversationMockMode()) {
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get('limit') || '25', 10);
    const cursor = url.searchParams.get('cursor');
    const search = url.searchParams.get('search');

    return NextResponse.json(listMockConversations({ limit, cursor, search }));
  }

  return getConversationsRoute(request);
}

export async function POST(request: Request) {
  if (isConversationMockMode()) {
    const body = await request.json().catch(() => ({} as { title?: string }));
    const title = typeof body.title === 'string' ? body.title : undefined;
    return NextResponse.json(createMockConversation(title));
  }

  return postConversationsRoute(request);
}
