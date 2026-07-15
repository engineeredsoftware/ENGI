/**
 * Conversation send path: draft creation, streaming, retry, token append/finalize.
 */
'use client';

import { useCallback, startTransition, type Dispatch, type SetStateAction, type MutableRefObject } from 'react';
import type { StreamToken } from '@/hooks/useConversationStream';
import type { Chat, ChatMessage } from '@/components/conversations/hooks/UseChatState/UseChatState';

export interface UseConversationSendArgs {
  chats: Chat[];
  currentChat: Chat | null;
  createNewChat: () => Chat;
  setChats: Dispatch<SetStateAction<Chat[]>>;
  setCurrentChat: Dispatch<SetStateAction<Chat | null>>;
  updateMessage: (id: string, patch: Partial<ChatMessage>, chatId?: string) => void;
  setProcessError: Dispatch<SetStateAction<Error | null>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setLastInputForRetry: Dispatch<
    SetStateAction<{ message: string; tokens: StreamToken[] } | null>
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSplitBoxes: Dispatch<SetStateAction<any[]>>;
  activeStreamChatIdRef: MutableRefObject<string | null>;
  conversationStream: {
    sendMessage: (
      message: string,
      tokens: StreamToken[],
      stream: boolean,
      chatId: string,
    ) => Promise<string | undefined>;
  };
  mutateConversationPages: () => void | Promise<unknown>;
  lastInputForRetry: { message: string; tokens: StreamToken[] } | null;
}

export function useConversationSend({
  chats,
  currentChat,
  createNewChat,
  setChats,
  setCurrentChat,
  updateMessage,
  setProcessError,
  setIsProcessing,
  setLastInputForRetry,
  setSplitBoxes,
  activeStreamChatIdRef,
  conversationStream,
  mutateConversationPages,
  lastInputForRetry,
}: UseConversationSendArgs) {
  const appendAssistantToken = useCallback(
    (chatId: string, token: string) => {
      const updateChat = (chat: Chat) => {
        const messages = [...chat.messages];
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || lastMessage.type !== 'agent' || lastMessage.status === 'sent') {
          return chat;
        }

        messages[messages.length - 1] = {
          ...lastMessage,
          content: `${lastMessage.content || ''}${token}`,
        };

        return { ...chat, messages };
      };

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? updateChat(chat) : chat)));
      setCurrentChat((prev) => (prev?.id === chatId ? updateChat(prev) : prev));
    },
    [setChats, setCurrentChat],
  );

  const finalizeStreamingAssistantMessage = useCallback(
    (
      chatId: string,
      messageId: string,
      content: string,
      persistedConversationId?: string,
    ) => {
      const updateChat = (chat: Chat): Chat => {
        const nextConversationId = persistedConversationId || chat.id;
        const messages = [...chat.messages];
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.type === 'agent') {
          messages[messages.length - 1] = {
            ...lastMessage,
            id: messageId,
            content,
            status: 'sent',
          };
        } else {
          messages.push({
            id: messageId,
            type: 'agent',
            content,
            status: 'sent',
            timestamp: new Date(),
          });
        }

        return {
          ...chat,
          id: nextConversationId,
          messages,
          persisted: true,
          loaded: true,
          updatedAt: new Date().toISOString(),
          lastMessage: content,
        };
      };

      startTransition(() => {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? updateChat(chat) : chat)));
        setCurrentChat((prev) => (prev?.id === chatId ? updateChat(prev) : prev));
        if (persistedConversationId && persistedConversationId !== chatId) {
          setSplitBoxes((prev) =>
            prev.map((box) =>
              box.chatId === chatId ? { ...box, chatId: persistedConversationId } : box,
            ),
          );
        }
      });
    },
    [setChats, setCurrentChat, setSplitBoxes],
  );

  const handleSendMessageCallback = useCallback(
    async (message: string, tokens: StreamToken[], targetChatId?: string) => {
      if (!message.trim()) return;

      const targetChat = targetChatId
        ? chats.find((chat) => chat.id === targetChatId) ||
          (currentChat?.id === targetChatId ? currentChat : null)
        : currentChat;
      const createdDraftChat = !targetChat;
      const activeChat = targetChat || createNewChat();
      activeStreamChatIdRef.current = activeChat.id;
      setCurrentChat(activeChat);

      setProcessError(null);
      setIsProcessing(true);
      setLastInputForRetry({ message, tokens });

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        status: 'sending',
        timestamp: new Date(),
        tokens,
      };

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: '',
        status: 'sending',
        timestamp: new Date(),
      };

      const initialMessages = [newMsg, assistantMsg];
      setChats((prev) => {
        let found = false;
        const next = prev.map((chat) => {
          if (chat.id !== activeChat.id) {
            return chat;
          }

          found = true;
          return {
            ...chat,
            messages: [...chat.messages, ...initialMessages],
          };
        });

        if (found) {
          return next;
        }

        return [
          {
            ...activeChat,
            messages: [...activeChat.messages, ...initialMessages],
            loaded: true,
          },
          ...prev,
        ];
      });
      setCurrentChat((prev) => {
        if (prev && prev.id !== activeChat.id) {
          return prev;
        }

        const baseChat = prev ?? activeChat;
        return {
          ...baseChat,
          messages: [...baseChat.messages, ...initialMessages],
          loaded: true,
        };
      });

      try {
        if (createdDraftChat) {
          await new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => resolve());
          });
        }

        const assistantContent = await conversationStream.sendMessage(
          message,
          tokens || [],
          true,
          activeChat.id,
        );

        updateMessage(newMsg.id, { status: 'sent' }, activeChat.id);
        if (assistantContent) {
          updateMessage(
            assistantMsg.id,
            {
              content: assistantContent,
              status: 'sent',
            },
            activeChat.id,
          );
        }
        void mutateConversationPages();
      } catch (error) {
        setProcessError(error as Error);
        updateMessage(
          assistantMsg.id,
          {
            status: 'error',
            content: 'Failed to send message. Please try again.',
          },
          activeChat.id,
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      chats,
      currentChat,
      createNewChat,
      setChats,
      setCurrentChat,
      updateMessage,
      conversationStream,
      mutateConversationPages,
      setProcessError,
      setIsProcessing,
      setLastInputForRetry,
      activeStreamChatIdRef,
    ],
  );

  const handleRetry = useCallback(() => {
    if (!lastInputForRetry) return;
    const { message, tokens } = lastInputForRetry;
    setProcessError(null);
    void handleSendMessageCallback(message, tokens);
  }, [lastInputForRetry, handleSendMessageCallback, setProcessError]);

  return {
    appendAssistantToken,
    finalizeStreamingAssistantMessage,
    handleSendMessageCallback,
    handleRetry,
  };
}
