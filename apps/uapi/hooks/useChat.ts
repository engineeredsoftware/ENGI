"use client";

import { useEffect } from 'react';
import { wsMultiplex } from 'packages/client-utils/src/wsMultiplex';
import { Message, useConversationStore } from 'packages/client-utils/src/state/conversationStore';

export function useChat(chatId: string | null) {
  const { chats, receiveMessage } = useConversationStore();

  useEffect(() => {
    if (!chatId) return;

    const unsubPromise = wsMultiplex.subscribe(`/chat/${chatId}`, (payload) => {
      // Expect payload { id, type, content, timestamp, tokens }
      const msg: Message = {
        ...payload,
        timestamp: new Date(payload.timestamp),
      };
      receiveMessage(chatId, msg);
    });

    return () => {
      unsubPromise.then((unsub) => unsub());
    };
  }, [chatId, receiveMessage]);

  const messages = chatId ? chats[chatId]?.messages || [] : [];

  // TODO: sendMessage implementation will POST or WS send
  const sendMessage = (content: string, tokens: any[]) => {
    if (!chatId) return;
    // optimistic add
    const msg: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date(),
      tokens,
      status: 'sending',
    };
    receiveMessage(chatId, msg);
    // backend send here (WS or fetch)
  };

  return { messages, sendMessage };
}
