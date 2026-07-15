"use client";

import React from 'react';
import ConversationsChatShell from '@/components/conversations/chat/ConversationsChatShell/ConversationsChatShell';

interface ConversationsChatProps {
  messages: any[];
  onSend: (text: string, tokens?: any[]) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  currentConversationId?: string;
  containerRef?: React.Ref<HTMLDivElement>;
  renderTokenInMessage?: (content: string, tokens?: any[]) => string;
  processLogOutputDetails?: Record<string, any>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  className?: string;
}

export default function ConversationsChat(props: ConversationsChatProps) {
  return <ConversationsChatShell {...props} />;
}
