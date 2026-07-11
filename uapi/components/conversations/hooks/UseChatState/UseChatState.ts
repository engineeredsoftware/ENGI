/**
 * Chat state management hook for Conversation component
 * 
 * Manages:
 * - Chat list and current chat
 * - Message handling
 * - Local storage persistence
 * - Chat CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';

function createChatId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'divider';
  content: string;
  tokens?: any[];
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
  source?: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  runs?: any[];
  persisted?: boolean;
  loaded?: boolean;
  updatedAt?: string;
  messageCount?: number;
  attachmentCount?: number;
  lastMessage?: string | null;
  latest_run?: {
    status: 'running' | 'completed' | 'error';
  };
}

interface UseChatStateOptions {
  persistToLocalStorage?: boolean;
  maxChats?: number;
}

export function useChatState(options: UseChatStateOptions = {}) {
  const { 
    persistToLocalStorage = true,
    maxChats = 100
  } = options;

  // Initialize chats from localStorage or empty
  const [chats, setChats] = useState<Chat[]>(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      const saved = localStorage.getItem('conversation.chats');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Persist chats to localStorage when they change
  useEffect(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('conversation.chats', JSON.stringify(chats));
    }
  }, [chats, persistToLocalStorage]);

  // Persist current chat ID
  useEffect(() => {
    if (persistToLocalStorage && typeof window !== 'undefined' && currentChat) {
      localStorage.setItem('conversation.currentChatId', currentChat.id);
    }
  }, [currentChat, persistToLocalStorage]);

  // Initialize current chat
  useEffect(() => {
    if (!currentChat && chats.length > 0) {
      if (persistToLocalStorage && typeof window !== 'undefined') {
        const savedId = localStorage.getItem('conversation.currentChatId');
        const savedChat = savedId ? chats.find(c => c.id === savedId) : null;
        setCurrentChat(savedChat || chats[0]);
      } else {
        setCurrentChat(chats[0]);
      }
    }
  }, [chats, currentChat, persistToLocalStorage]);

  // Create new chat
  const createNewChat = useCallback((title?: string) => {
    const newChat: Chat = {
      id: `draft-${createChatId()}`,
      title: title || 'New Bitcode Terminal conversation',
      messages: [],
      runs: [],
      persisted: false,
      loaded: true,
    };

    setChats(prev => {
      // Limit chat history
      const updated = [newChat, ...prev];
      if (updated.length > maxChats) {
        return updated.slice(0, maxChats);
      }
      return updated;
    });
    
    setCurrentChat(newChat);
    setShowHistory(false);
    
    return newChat;
  }, [maxChats]);

  // Delete chat
  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId);
      
      // If we deleted the current chat, select another
      if (currentChat?.id === chatId) {
        setCurrentChat(filtered.length > 0 ? filtered[0] : null);
      }
      
      return filtered;
    });

    // Clean up localStorage
    if (persistToLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(`conv.${chatId}.viewed`);
    }
  }, [currentChat, persistToLocalStorage]);

  // Add message to current chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'> | ChatMessage, chatId?: string) => {
    const targetChatId = chatId || currentChat?.id;
    if (!targetChatId) return;

    const newMessage: ChatMessage = {
      ...message,
      id: 'id' in message && message.id ? message.id : createChatId(),
      timestamp: message.timestamp || new Date()
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === targetChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    // Update current chat reference
    setCurrentChat(prev => {
      if (!prev || prev.id !== targetChatId) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });

    return newMessage;
  }, [currentChat]);

  // Update message in current chat
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>, chatId?: string) => {
    const targetChatId = chatId || currentChat?.id;
    if (!targetChatId) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === targetChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        };
      }
      return chat;
    }));

    // Update current chat reference
    setCurrentChat(prev => {
      if (!prev || prev.id !== targetChatId) return prev;
      return {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      };
    });
  }, [currentChat]);

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setChats([]);
    setCurrentChat(null);
    
    if (persistToLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem('conversation.chats');
      localStorage.removeItem('conversation.currentChatId');
      
      // Clear all conversation viewed markers
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('conv.') && key.endsWith('.viewed')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [persistToLocalStorage]);

  // Mark conversation as viewed
  const markAsViewed = useCallback((chatId: string) => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem(`conv.${chatId}.viewed`, Date.now().toString());
    }
  }, [persistToLocalStorage]);

  return {
    chats,
    currentChat,
    showHistory,
    setChats,
    setCurrentChat,
    setShowHistory,
    createNewChat,
    deleteChat,
    addMessage,
    updateMessage,
    clearAllChats,
    markAsViewed
  };
}
