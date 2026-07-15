/**
 * Hydrate a persisted conversation detail into chat UI state.
 */
import { useCallback, startTransition } from 'react';
import type { Chat } from '@/components/conversations/hooks/UseChatState/UseChatState';
import { mapConversationDetailToChat } from '@/components/conversations/ConversationChatMapping/ConversationChatMapping';
import type { ConversationDetailResponse } from '../conversations-overlay-types';

export function useConversationHydration(args: {
  setChats: (updater: (prev: Chat[]) => Chat[]) => void;
  setCurrentChat: (chat: Chat | ((prev: Chat | null) => Chat | null)) => void;
  setShowHistory: (show: boolean) => void;
}) {
  const { setChats, setCurrentChat, setShowHistory } = args;

  const hydrateConversation = useCallback(async (chat: Chat) => {
    if (!chat.persisted) {
      setCurrentChat(chat);
      setShowHistory(false);
      return chat;
    }

    if (chat.loaded && chat.messageCount !== undefined && chat.messages.length >= chat.messageCount) {
      setCurrentChat(chat);
      setShowHistory(false);
      return chat;
    }

    const response = await fetch(`/api/conversations/${chat.id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to load conversation ${chat.id}`);
    }

    const detail = (await response.json()) as ConversationDetailResponse;
    const hydratedChat = mapConversationDetailToChat(detail, chat);

    startTransition(() => {
      setChats((prev) =>
        prev.map((candidate) => (candidate.id === hydratedChat.id ? hydratedChat : candidate)),
      );
      setCurrentChat(hydratedChat);
      setShowHistory(false);
    });

    return hydratedChat;
  }, [setChats, setCurrentChat, setShowHistory]);

  return { hydrateConversation };
}
