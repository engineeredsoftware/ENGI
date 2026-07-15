"use client";

import React from 'react';
import ConversationsChatMessages from '@/components/conversations/chat/ConversationsChatMessages/ConversationsChatMessages';
import ConversationsChatInput from '@/components/conversations/chat/ConversationsChatInput/ConversationsChatInput';

interface ConversationsChatShellProps {
  messages: any[];
  onSend: (text: string, tokens?: any[]) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  currentConversationId?: string;
  className?: string;
  containerRef?: React.Ref<HTMLDivElement>;
  renderTokenInMessage?: (content: string, tokens?: any[]) => string;
  processLogOutputDetails?: Record<string, any>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function ConversationsChatShell({
  messages,
  onSend,
  disabled,
  placeholder,
  currentConversationId,
  className = '',
  containerRef,
  renderTokenInMessage,
  processLogOutputDetails,
  onScroll,
}: ConversationsChatShellProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <ConversationsChatMessages
        messages={messages}
        containerRef={containerRef}
        renderTokenInMessage={renderTokenInMessage}
        processLogOutputDetails={processLogOutputDetails}
        onScroll={onScroll}
      />
      <ConversationsChatInput
        onSend={onSend}
        disabled={disabled}
        placeholder={placeholder}
        currentConversationId={currentConversationId}
      />
    </div>
  );
}
