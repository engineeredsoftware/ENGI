import { postConversationBranchRoute } from '@bitcode/api/src/routes/conversations';
import { NextResponse } from 'next/server';

import { branchMockConversation, isConversationMockMode } from '../_shared';

export const runtime = 'nodejs';

type BranchConversationRequest = {
  sourceConversationId?: string;
  title?: string;
  branchMessageId?: string;
  copyMessages?: boolean;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as BranchConversationRequest));
  const sourceConversationId = typeof body.sourceConversationId === 'string' ? body.sourceConversationId : '';

  if (!sourceConversationId) {
    return NextResponse.json({ error: 'sourceConversationId is required' }, { status: 400 });
  }

  if (isConversationMockMode()) {
    return NextResponse.json(branchMockConversation(sourceConversationId, body.title));
  }

  return postConversationBranchRoute(request);
}
