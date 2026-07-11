import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FEATURE_FLAGS } from '@/config/features';
import ConversationsRouteClient from '@/components/conversations/ConversationsRouteClient/ConversationsRouteClient';

export const metadata: Metadata = {
  title: 'Bitcode Conversations',
  alternates: {
    canonical: '/conversations',
  },
};

/**
 * Thin route shell — conversations UI lives under components/conversations.
 */
export default function ConversationsPage() {
  if (FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE) {
    redirect('/packs');
  }

  return <ConversationsRouteClient />;
}
