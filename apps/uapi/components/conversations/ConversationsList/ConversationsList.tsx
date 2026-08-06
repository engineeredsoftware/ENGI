'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Chat {
  id: string;
  title: string;
  messages: any[];
  runs?: any[];
  latest_run?: {
    status: 'running' | 'completed' | 'error';
  };
}

interface ConversationsListProps {
  chats: Chat[];
  currentChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat?: (chatId: string) => void;
  showDeleteButton?: boolean;
  className?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  chats,
  currentChat,
  onSelectChat,
  onDeleteChat,
  showDeleteButton = false,
  className = ''
}) => {
  // Check if a conversation has been viewed
  const isConversationViewed = (chatId: string): boolean => {
    if (typeof window === 'undefined') return true;
    const viewedTime = localStorage.getItem(`conv.${chatId}.viewed`);
    if (!viewedTime) return false;
    
    // Get last message time
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length === 0) return true;
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const lastMessageTime = lastMessage.timestamp?.getTime() || 0;
    return parseInt(viewedTime) >= lastMessageTime;
  };

  const renderRunIndicator = (chat: Chat) => {
    const runCount =
      chat.runs?.filter((r) => {
        const normalized = String(r.pipelineType || r.kind || '').trim().toLowerCase();
        return Boolean(normalized);
      }).length || 0;

    if (chat.latest_run?.status === 'running') {
      return (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      );
    }

    if (runCount > 0) {
      return (
        <span
          className="text-[10px] font-semibold leading-[14px] bg-gray-700 rounded px-1.5 text-gray-200"
          title={`${runCount} execution run${runCount === 1 ? '' : 's'}`}
        >
          {runCount}
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`conversation-list ${className}`}>
      {chats.map((chat) => {
        const isViewed = isConversationViewed(chat.id);
        const isActive = currentChat?.id === chat.id;

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`
              relative chat-item 
              ${isActive ? 'chat-item-active' : ''} 
              ${!isViewed ? 'chat-item-unread' : ''}
            `}
          >
            <div className="flex items-center space-x-1 chat-item-title">
              {renderRunIndicator(chat)}
              <span className={`chat-item-title-text ${!isViewed ? 'font-semibold' : ''}`}>
                {chat.title || 'Untitled'}
              </span>
              {!isViewed && (
                <span className="absolute top-1/2 right-2 w-2 h-2 -translate-y-1/2 rounded-full bg-emerald-400" />
              )}
            </div>
            <div className="chat-item-preview">
              {chat.messages.length > 0 ? (
                <span>{chat.messages[chat.messages.length - 1].content?.substring(0, 50)}...</span>
              ) : (
                <span className="italic text-gray-500">No messages</span>
              )}
            </div>
            {showDeleteButton && onDeleteChat && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="chat-item-delete"
                title="Delete conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
