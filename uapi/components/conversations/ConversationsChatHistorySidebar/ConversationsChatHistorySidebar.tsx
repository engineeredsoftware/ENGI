"use client";

import React from 'react';
import { PlusSmallIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ConversationsList, Chat } from '@/components/conversations/ConversationsList/ConversationsList';

interface ChatHistorySidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => void;
  onDeleteChat?: (chatId: string) => void;
  onClose: () => void;
}

export function ChatHistorySidebar({
  chats,
  currentChat,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onClose,
}: ChatHistorySidebarProps) {
  return (
    <aside className="chat-history-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Conversations</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="fullscreen-button"
            title="New conversation"
            onClick={onCreateChat}
          >
            <PlusSmallIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="fullscreen-button"
            title="Close history"
            onClick={onClose}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        <ConversationsList
          chats={chats}
          currentChat={currentChat}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          showDeleteButton={Boolean(onDeleteChat)}
        />
      </div>
    </aside>
  );
}

export default ChatHistorySidebar;
